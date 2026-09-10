import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { getSentEmails, sendEnrollmentEmail } from "./mailer.js";

const app = express();
const port = Number(process.env.API_PORT || 4000);
const secret = process.env.JWT_SECRET || "smartrecruit-memory-only";
const users = [];
const profiles = new Map();
const jobs = [
  { id: randomUUID(), title: "Senior Java Developer", company: "Nexa Systems", location: "Hyderabad", type: "Full-time", salary: "₹12–18 LPA", tags: ["Java", "Spring Boot", "Microservices"] },
  { id: randomUUID(), title: "Frontend React Developer", company: "CloudPeak Technologies", location: "Bengaluru", type: "Full-time", salary: "₹9–15 LPA", tags: ["React", "JavaScript", "CSS"] }
];
const applications = [];
const resumes = new Map();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype === "application/pdf") });

app.use(cors());
app.use(express.json());
const error = (res, status, message) => res.status(status).json({ error: message });
const publicUser = user => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const tokenFor = user => jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "1d" });
const auth = (req, res, next) => { try { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ""); if (!token) return error(res, 401, "Authentication required"); req.auth = jwt.verify(token, secret); next(); } catch { error(res, 401, "Invalid token"); } };
const role = expected => (req, res, next) => req.auth.role === expected ? next() : error(res, 403, `${expected} access required`);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "smartrecruit-api", storage: "memory" }));
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role: accountRole = "seeker" } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();
  if (!name?.trim() || !normalizedEmail || !password || !["seeker", "provider"].includes(accountRole)) return error(res, 400, "Name, email, password and role are required");
  if (users.some(user => user.email === normalizedEmail)) return error(res, 409, "Account already exists");
  const user = { id: randomUUID(), name: name.trim(), email: normalizedEmail, role: accountRole, passwordHash: await bcrypt.hash(password, 10) };
  users.push(user);
  if (accountRole === "seeker") profiles.set(user.id, { userId: user.id, name: user.name, email: user.email, phone: "", location: "", headline: "", experience: "", about: "", resumeId: null });
  res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
});
app.post("/api/auth/login", async (req, res) => { const user = users.find(item => item.email === req.body.email?.toLowerCase().trim()); if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) return error(res, 401, "Invalid email or password"); res.json({ user: publicUser(user), token: tokenFor(user) }); });
app.get("/api/auth/me", auth, (req, res) => { const user = users.find(item => item.id === req.auth.id); user ? res.json({ user: publicUser(user) }) : error(res, 404, "User not found"); });
app.get("/api/jobs", auth, (_req, res) => res.json({ jobs }));
app.post("/api/jobs", auth, role("provider"), (req, res) => { const job = { id: randomUUID(), ...req.body, providerId: req.auth.id, tags: req.body.tags || [] }; jobs.unshift(job); res.status(201).json({ job }); });
app.get("/api/profile", auth, role("seeker"), (req, res) => { const profile = profiles.get(req.auth.id); profile ? res.json({ profile }) : error(res, 404, "Profile not found"); });
app.put("/api/profile", auth, role("seeker"), (req, res) => { const profile = { ...profiles.get(req.auth.id), ...req.body, userId: req.auth.id }; profiles.set(req.auth.id, profile); const user = users.find(item => item.id === req.auth.id); user.name = profile.name || user.name; res.json({ profile }); });
app.post("/api/profile/resume", auth, role("seeker"), upload.single("resume"), (req, res) => { if (!req.file) return error(res, 400, "A PDF resume is required"); const id = randomUUID(); resumes.set(id, { id, ownerId: req.auth.id, name: req.file.originalname, buffer: req.file.buffer }); const profile = profiles.get(req.auth.id); profile.resumeId = id; res.status(201).json({ resume: { id, name: req.file.originalname, sizeBytes: req.file.size } }); });
app.post("/api/jobs/:jobId/applications", auth, role("seeker"), upload.single("resume"), (req, res) => { const job = jobs.find(item => item.id === req.params.jobId); if (!job) return error(res, 404, "Job not found"); if (!req.file) return error(res, 400, "A PDF resume is required"); if (applications.some(item => item.jobId === job.id && item.seekerId === req.auth.id)) return error(res, 409, "You already applied for this job"); const resumeId = randomUUID(); resumes.set(resumeId, { id: resumeId, ownerId: req.auth.id, providerId: job.providerId, name: req.file.originalname, buffer: req.file.buffer }); const application = { id: randomUUID(), jobId: job.id, seekerId: req.auth.id, providerId: job.providerId, resumeId, ...req.body, title: job.title, company: job.company, status: "Pending review", providerDecision: "pending", createdAt: new Date().toISOString() }; applications.push(application); res.status(201).json({ application }); });
app.get("/api/applications", auth, (req, res) => res.json({ applications: applications.filter(item => req.auth.role === "seeker" ? item.seekerId === req.auth.id : item.providerId === req.auth.id) }));
app.patch("/api/applications/:id/status", auth, role("provider"), async (req, res) => { const application = applications.find(item => item.id === req.params.id); if (!application || application.providerId !== req.auth.id) return error(res, 404, "Application not found"); if (!["Accepted", "Rejected", "Unenrolled"].includes(req.body.status)) return error(res, 400, "Invalid status"); application.status = req.body.status; application.providerDecision = req.body.status.toLowerCase(); if (req.body.status === "Accepted") { const email = await sendEnrollmentEmail({ to: application.email, seekerName: application.fullName, courseName: application.courseName, status: application.status, jobTitle: application.title, company: application.company }); application.emailSent = email.status === "sent"; application.emailMode = email.mode; } res.json({ application }); });
app.post("/api/dev/enrollment-email", async (req, res) => { const { to, seekerName, courseName, jobTitle, company } = req.body; if (!to || !courseName) return error(res, 400, "Recipient email and course name are required"); const email = await sendEnrollmentEmail({ to, seekerName: seekerName || "Seeker", courseName, status: "Accepted", jobTitle: jobTitle || "SmartRecruit application", company: company || "SmartRecruit" }); res.status(email.status === "sent" ? 200 : 202).json({ email }); });
app.get("/api/dev/emails", auth, role("provider"), (_req, res) => res.json({ emails: getSentEmails() }));
app.get("/api/seekers", auth, role("provider"), (_req, res) => res.json({ seekers: [...profiles.values()] }));
app.get("/api/resumes/:id", auth, (req, res) => { const resume = resumes.get(req.params.id); if (!resume || (resume.ownerId !== req.auth.id && resume.providerId !== req.auth.id)) return error(res, 404, "Resume not found"); res.type("application/pdf").set("Content-Disposition", `inline; filename="${resume.name.replace(/"/g, "")}"`).send(resume.buffer); });
app.use((err, _req, res, _next) => err instanceof multer.MulterError ? error(res, 400, "Resume must be a PDF no larger than 5 MB") : error(res, 500, "Unexpected server error"));
app.listen(port, () => console.log(`SmartRecruit memory API running at http://localhost:${port}`));
