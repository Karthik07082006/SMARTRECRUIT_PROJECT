import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendEnrollmentEmail } from "./mailer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "uploads");
const port = Number(process.env.API_PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "smartrecruit-local-secret";
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/smartrecruit" });
const app = express();

await mkdir(uploadDir, { recursive: true });
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, callback) => callback(null, `${randomUUID()}.pdf`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype === "application/pdf")
});

const sendError = (res, status, message) => res.status(status).json({ error: message });
const parseJson = value => typeof value === "string" ? JSON.parse(value) : value;
const publicUser = row => ({ id: row.id, name: row.name, email: row.email, role: row.role });
const sign = user => jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });

async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return sendError(res, 401, "Authentication required");
    req.auth = jwt.verify(token, jwtSecret);
    next();
  } catch { sendError(res, 401, "Invalid or expired token"); }
}

const role = expected => (req, res, next) => req.auth.role === expected ? next() : sendError(res, 403, `${expected} access required`);

async function setupDatabase() {
  const schema = await readFile(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "smartrecruit-api" }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role: accountRole = "seeker" } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !["seeker", "provider"].includes(accountRole)) return sendError(res, 400, "Name, email, password and a valid role are required");
    if (password.length < 8) return sendError(res, 400, "Password must contain at least 8 characters");
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (existing.rowCount) return sendError(res, 409, "An account with this email already exists");
    const user = { id: randomUUID(), name: name.trim(), email: email.toLowerCase().trim(), role: accountRole };
    const hash = await bcrypt.hash(password, 12);
    await pool.query("INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)", [user.id, user.name, user.email, hash, user.role]);
    if (user.role === "seeker") await pool.query("INSERT INTO profiles (user_id) VALUES ($1)", [user.id]);
    res.status(201).json({ user, token: sign(user) });
  } catch (error) { console.error(error); sendError(res, 500, "Could not create account"); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [req.body.email?.toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password_hash))) return sendError(res, 401, "Invalid email or password");
    res.json({ user: publicUser(user), token: sign(user) });
  } catch (error) { console.error(error); sendError(res, 500, "Could not log in"); }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [req.auth.id]);
  if (!result.rowCount) return sendError(res, 404, "User not found");
  res.json({ user: result.rows[0] });
});

app.get("/api/jobs", auth, async (_req, res) => {
  const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
  res.json({ jobs: result.rows.map(job => ({ ...job, tags: parseJson(job.tags), responsibilities: parseJson(job.responsibilities), requirements: parseJson(job.requirements), benefits: parseJson(job.benefits) })) });
});

app.post("/api/jobs", auth, role("provider"), async (req, res) => {
  try {
    const { title, company, location, type = "Full-time", salary = "", tags = [], description = "", responsibilities = [], requirements = [], benefits = [] } = req.body;
    if (!title?.trim() || !company?.trim() || !location?.trim()) return sendError(res, 400, "Title, company and location are required");
    const result = await pool.query("INSERT INTO jobs (id, provider_id, title, company, location, type, salary, tags, description, responsibilities, requirements, benefits) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *", [randomUUID(), req.auth.id, title.trim(), company.trim(), location.trim(), type, salary, JSON.stringify(tags), description, JSON.stringify(responsibilities), JSON.stringify(requirements), JSON.stringify(benefits)]);
    res.status(201).json({ job: result.rows[0] });
  } catch (error) { console.error(error); sendError(res, 500, "Could not create job"); }
});

app.get("/api/profile", auth, role("seeker"), async (req, res) => {
  const result = await pool.query("SELECT u.id, u.name, u.email, p.phone, p.location, p.headline, p.experience, p.about, r.id AS resume_id, r.original_name AS resume_name, r.size_bytes AS resume_size FROM users u JOIN profiles p ON p.user_id = u.id LEFT JOIN resumes r ON r.id = p.resume_id WHERE u.id = $1", [req.auth.id]);
  if (!result.rowCount) return sendError(res, 404, "Profile not found");
  res.json({ profile: result.rows[0] });
});

app.put("/api/profile", auth, role("seeker"), async (req, res) => {
  const { name, phone = "", location = "", headline = "", experience = "", about = "" } = req.body;
  if (!name?.trim()) return sendError(res, 400, "Name is required");
  await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name.trim(), req.auth.id]);
  const result = await pool.query("UPDATE profiles SET phone=$1, location=$2, headline=$3, experience=$4, about=$5, updated_at=NOW() WHERE user_id=$6 RETURNING *", [phone, location, headline, experience, about, req.auth.id]);
  res.json({ profile: result.rows[0] });
});

app.post("/api/profile/resume", auth, role("seeker"), upload.single("resume"), async (req, res) => {
  if (!req.file) return sendError(res, 400, "A PDF resume is required");
  try {
    const resumeId = randomUUID();
    await pool.query("INSERT INTO resumes (id, owner_id, original_name, stored_name, size_bytes) VALUES ($1,$2,$3,$4,$5)", [resumeId, req.auth.id, req.file.originalname, req.file.filename, req.file.size]);
    const previous = await pool.query("SELECT resume_id FROM profiles WHERE user_id = $1", [req.auth.id]);
    await pool.query("UPDATE profiles SET resume_id = $1, updated_at = NOW() WHERE user_id = $2", [resumeId, req.auth.id]);
    if (previous.rows[0]?.resume_id) {
      const old = await pool.query("SELECT stored_name FROM resumes WHERE id = $1", [previous.rows[0].resume_id]);
      await pool.query("DELETE FROM resumes WHERE id = $1", [previous.rows[0].resume_id]);
      if (old.rows[0]?.stored_name) await unlink(path.join(uploadDir, old.rows[0].stored_name)).catch(() => {});
    }
    res.status(201).json({ resume: { id: resumeId, name: req.file.originalname, sizeBytes: req.file.size } });
  } catch (error) {
    await unlink(req.file.path).catch(() => {});
    console.error(error);
    sendError(res, 500, "Could not save resume");
  }
});

app.post("/api/jobs/:jobId/applications", auth, role("seeker"), upload.single("resume"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { jobId } = req.params;
    const { fullName, email, phone, education, experience, courseName, courseProvider, courseStatus = "In progress", coverLetter = "" } = req.body;
    if (!fullName || !email || !phone || !education || !experience || !courseName || !courseProvider || !req.file) return sendError(res, 400, "Applicant details, course details and a PDF resume are required");
    await client.query("BEGIN");
    const job = await client.query("SELECT id FROM jobs WHERE id = $1", [jobId]);
    if (!job.rowCount) return sendError(res, 404, "Job not found");
    const existing = await client.query("SELECT id FROM applications WHERE job_id = $1 AND seeker_id = $2", [jobId, req.auth.id]);
    if (existing.rowCount) return sendError(res, 409, "You have already applied for this job");
    const resumeId = randomUUID();
    await client.query("INSERT INTO resumes (id, owner_id, original_name, stored_name, size_bytes) VALUES ($1,$2,$3,$4,$5)", [resumeId, req.auth.id, req.file.originalname, req.file.filename, req.file.size]);
    const application = await client.query("INSERT INTO applications (id, job_id, seeker_id, resume_id, full_name, email, phone, education, experience, course_name, course_provider, course_status, cover_letter) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *", [randomUUID(), jobId, req.auth.id, resumeId, fullName, email, phone, education, experience, courseName, courseProvider, courseStatus, coverLetter]);
    await client.query("COMMIT");
    res.status(201).json({ application: application.rows[0] });
  } catch (error) { await client.query("ROLLBACK"); if (req.file) await unlink(req.file.path).catch(() => {}); console.error(error); sendError(res, 500, "Could not submit application"); } finally { client.release(); }
});

app.get("/api/applications", auth, async (req, res) => {
  const query = req.auth.role === "provider" ? "SELECT a.*, j.title, j.company FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.provider_id=$1 ORDER BY a.created_at DESC" : "SELECT a.*, j.title, j.company FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.seeker_id=$1 ORDER BY a.created_at DESC";
  const result = await pool.query(query, [req.auth.id]);
  res.json({ applications: result.rows });
});

app.patch("/api/applications/:id/status", auth, role("provider"), async (req, res) => {
  const nextStatus = req.body.status;
  if (!["Accepted", "Rejected", "Unenrolled"].includes(nextStatus)) return sendError(res, 400, "Invalid application status");
  const result = await pool.query("UPDATE applications a SET status=$1, provider_decision=$2 FROM jobs j WHERE a.id=$3 AND a.job_id=j.id AND j.provider_id=$4 RETURNING a.*, j.title, j.company", [nextStatus, nextStatus.toLowerCase(), req.params.id, req.auth.id]);
  if (!result.rowCount) return sendError(res, 404, "Application not found");
  const application = result.rows[0];
  if (nextStatus === "Accepted") {
    const seeker = await pool.query("SELECT name, email FROM users WHERE id = $1", [application.seeker_id]);
    if (seeker.rowCount) {
      const email = await sendEnrollmentEmail({ to: seeker.rows[0].email, seekerName: seeker.rows[0].name, courseName: application.course_name, status: nextStatus, jobTitle: application.title, company: application.company });
      application.email_sent = email.status === "sent";
      application.email_mode = email.mode;
    }
  }
  res.json({ application });
});

app.get("/api/seekers", auth, role("provider"), async (_req, res) => {
  const result = await pool.query("SELECT u.id, u.name, u.email, p.phone, p.location, p.headline, p.experience, p.about, r.id AS resume_id, r.original_name AS resume_name FROM users u JOIN profiles p ON p.user_id=u.id LEFT JOIN resumes r ON r.id=p.resume_id WHERE u.role='seeker' ORDER BY u.created_at DESC");
  res.json({ seekers: result.rows });
});

app.get("/api/resumes/:id", auth, async (req, res) => {
  const result = await pool.query("SELECT r.*, j.provider_id FROM resumes r LEFT JOIN applications a ON a.resume_id=r.id LEFT JOIN jobs j ON j.id=a.job_id WHERE r.id=$1 AND (r.owner_id=$2 OR j.provider_id=$2)", [req.params.id, req.auth.id]);
  if (!result.rowCount) return sendError(res, 404, "Resume not found");
  const resume = result.rows[0];
  res.type("application/pdf").set("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(resume.original_name)}`).sendFile(resume.stored_name, { root: uploadDir });
});

app.use((error, _req, res, _next) => error instanceof multer.MulterError ? sendError(res, 400, "Resume must be a PDF no larger than 5 MB") : sendError(res, 500, "Unexpected server error"));

try {
  await setupDatabase();
  app.listen(port, () => console.log(`SmartRecruit API running at http://localhost:${port}`));
} catch (error) {
  console.error("Could not start API. Check DATABASE_URL and PostgreSQL.", error.message);
  process.exit(1);
}
