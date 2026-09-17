package com.smartrecruit.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrecruit.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class SmartRecruitController {
    private final JdbcTemplate db;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final ObjectMapper json = new ObjectMapper();
    private final JavaMailSender mail;
    private final Path uploadDir;
    private final String mailFrom;
    private final String smtpHost;

    public SmartRecruitController(JdbcTemplate db, PasswordEncoder passwords, JwtService jwt, JavaMailSender mail,
                                   @Value("${smartrecruit.upload-dir}") String uploadDir,
                                   @Value("${smartrecruit.mail-from:}") String mailFrom,
                                   @Value("${spring.mail.host:}") String smtpHost) throws IOException {
        this.db = db; this.passwords = passwords; this.jwt = jwt; this.mail = mail; this.mailFrom = mailFrom; this.smtpHost = smtpHost;
        this.uploadDir = Paths.get(uploadDir); Files.createDirectories(this.uploadDir);
    }

    @GetMapping({"", "/"})
    public Map<String, Object> root() {
        return Map.of("ok", true, "service", "smartrecruit-api", "framework", "spring-boot", "message", "Use /api/health or /api/auth/login");
    }

    @GetMapping("/health") public Map<String, Object> health() { return Map.of("ok", true, "service", "smartrecruit-api", "framework", "spring-boot"); }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String name = text(body, "name"), email = text(body, "email").toLowerCase(), password = text(body, "password"), role = text(body, "role");
        if (role.isBlank()) role = "seeker";
        if (name.isBlank() || email.isBlank() || password.isBlank() || !Set.of("seeker", "provider").contains(role)) return error(HttpStatus.BAD_REQUEST, "Name, email, password and a valid role are required");
        if (password.length() < 8) return error(HttpStatus.BAD_REQUEST, "Password must contain at least 8 characters");
        if (db.query("SELECT id FROM users WHERE email = ?", (ResultSetExtractor<Boolean>) rs -> rs.next(), email)) {
            return error(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        UUID id = UUID.randomUUID();
        db.update("INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)", id, name, email, passwords.encode(password), role);
        if (role.equals("seeker")) db.update("INSERT INTO profiles (user_id) VALUES (?)", id);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse(id, name, email, role));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email = text(body, "email").toLowerCase();
        List<Map<String, Object>> rows = db.queryForList("SELECT id,name,email,password_hash,role FROM users WHERE email = ?", email);
        if (rows.isEmpty() || !passwords.matches(text(body, "password"), String.valueOf(rows.get(0).get("password_hash")))) return error(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        Map<String, Object> user = rows.get(0); return ResponseEntity.ok(authResponse((UUID) user.get("id"), String.valueOf(user.get("name")), String.valueOf(user.get("email")), String.valueOf(user.get("role"))));
    }

    @GetMapping("/auth/me") public Map<String, Object> me(Authentication auth) { return Map.of("user", user(UUID.fromString(auth.getName()))); }

    @GetMapping("/jobs") public Map<String, Object> jobs() { return Map.of("jobs", db.queryForList("SELECT * FROM jobs ORDER BY created_at DESC").stream().map(this::job).toList()); }

    @PostMapping("/jobs") public ResponseEntity<?> createJob(@RequestBody Map<String, Object> body, Authentication auth) {
        require(auth, "provider"); String title = text(body, "title"), company = text(body, "company"), location = text(body, "location");
        if (title.isBlank() || company.isBlank() || location.isBlank()) return error(HttpStatus.BAD_REQUEST, "Title, company and location are required");
        UUID id = UUID.randomUUID(); db.update("INSERT INTO jobs (id,provider_id,title,company,location,type,salary,tags,description,responsibilities,requirements,benefits) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", id, UUID.fromString(auth.getName()), title, company, location, textOr(body,"type","Full-time"), text(body,"salary"), jsonText(body.get("tags")), text(body,"description"), jsonText(body.get("responsibilities")), jsonText(body.get("requirements")), jsonText(body.get("benefits")));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("job", job(db.queryForMap("SELECT * FROM jobs WHERE id = ?", id))));
    }

    @GetMapping("/profile") public Map<String, Object> profile(Authentication auth) { require(auth, "seeker"); return Map.of("profile", db.queryForMap("SELECT u.id,u.name,u.email,p.phone,p.location,p.headline,p.experience,p.about,p.resume_id FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?", UUID.fromString(auth.getName()))); }

    @PutMapping("/profile") public Map<String, Object> updateProfile(@RequestBody Map<String, Object> body, Authentication auth) {
        require(auth, "seeker"); UUID id = UUID.fromString(auth.getName()); String name = text(body,"name"); if (name.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Name is required");
        db.update("UPDATE users SET name=? WHERE id=?", name, id); db.update("UPDATE profiles SET phone=?,location=?,headline=?,experience=?,about=?,updated_at=NOW() WHERE user_id=?", text(body,"phone"),text(body,"location"),text(body,"headline"),text(body,"experience"),text(body,"about"),id); return profile(auth);
    }

    @PostMapping(value="/jobs/{jobId}/applications", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> apply(@PathVariable UUID jobId, @RequestParam Map<String,String> fields, @RequestPart("resume") MultipartFile resume, Authentication auth) throws IOException {
        require(auth,"seeker"); if (resume == null || resume.isEmpty() || !"application/pdf".equalsIgnoreCase(resume.getContentType())) return error(HttpStatus.BAD_REQUEST,"A PDF resume is required");
        if (db.query("SELECT id FROM applications WHERE job_id=? AND seeker_id=?", (ResultSetExtractor<Boolean>) rs -> rs.next(), jobId, UUID.fromString(auth.getName()))) return error(HttpStatus.CONFLICT,"You have already applied for this job");
        UUID resumeId=UUID.randomUUID(), applicationId=UUID.randomUUID(); String stored=resumeId+".pdf"; Files.copy(resume.getInputStream(),uploadDir.resolve(stored),StandardCopyOption.REPLACE_EXISTING);
        db.update("INSERT INTO resumes (id,owner_id,original_name,stored_name,size_bytes) VALUES (?,?,?,?,?)",resumeId,UUID.fromString(auth.getName()),resume.getOriginalFilename(),stored,resume.getSize());
        db.update("INSERT INTO applications (id,job_id,seeker_id,resume_id,full_name,email,phone,education,experience,course_name,course_provider,course_status,cover_letter) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",applicationId,jobId,UUID.fromString(auth.getName()),resumeId,fields.get("fullName"),fields.get("email"),fields.get("phone"),fields.get("education"),fields.get("experience"),fields.get("courseName"),fields.get("courseProvider"),textOr(fields,"courseStatus","In progress"),textOr(fields,"coverLetter",""));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("application", db.queryForMap("SELECT * FROM applications WHERE id=?",applicationId)));
    }

    @GetMapping("/applications") public Map<String,Object> applications(Authentication auth) { String sql = auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_provider")) ? "SELECT a.*,j.title,j.company FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.provider_id=? ORDER BY a.created_at DESC" : "SELECT a.*,j.title,j.company FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.seeker_id=? ORDER BY a.created_at DESC"; return Map.of("applications",db.queryForList(sql,UUID.fromString(auth.getName()))); }

    @PatchMapping("/applications/{id}/status") public Map<String,Object> status(@PathVariable UUID id,@RequestBody Map<String,Object> body,Authentication auth) { require(auth,"provider"); String next=text(body,"status"); if(!Set.of("Accepted","Rejected","Unenrolled").contains(next)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid application status"); db.update("UPDATE applications a SET status=?,provider_decision=? FROM jobs j WHERE a.id=? AND a.job_id=j.id AND j.provider_id=?",next,next.toLowerCase(),id,UUID.fromString(auth.getName())); Map<String,Object> app=db.queryForMap("SELECT a.*,j.title,j.company FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=?",id); if(next.equals("Accepted")) sendEmail(String.valueOf(app.get("email")),String.valueOf(app.get("full_name")),String.valueOf(app.get("course_name")),String.valueOf(app.get("title")),String.valueOf(app.get("company")),next); return Map.of("application",app); }

    @PostMapping("/dev/enrollment-email") public ResponseEntity<?> enrollmentEmail(@RequestBody Map<String,Object> body) { String to=text(body,"to"), course=text(body,"courseName"); if(to.isBlank()||course.isBlank()) return error(HttpStatus.BAD_REQUEST,"Recipient email and course name are required"); boolean sent=sendEmail(to,textOr(body,"seekerName","Seeker"),course,textOr(body,"jobTitle","SmartRecruit application"),textOr(body,"company","SmartRecruit"),"Accepted"); return ResponseEntity.status(sent?HttpStatus.OK:HttpStatus.ACCEPTED).body(Map.of("email",Map.of("to",to,"status",sent?"sent":"queued","mode",sent?"smtp":"development"))); }

    @GetMapping("/resumes/{id}") public ResponseEntity<byte[]> resume(@PathVariable UUID id,Authentication auth) throws IOException { Map<String,Object> row=db.queryForMap("SELECT * FROM resumes WHERE id=? AND owner_id=?",id,UUID.fromString(auth.getName())); byte[] bytes=Files.readAllBytes(uploadDir.resolve(String.valueOf(row.get("stored_name")))); return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION,"inline; filename=\""+row.get("original_name")+"\"").body(bytes); }

    private boolean sendEmail(String to,String name,String course,String job,String company,String status) { if(smtpHost==null||smtpHost.isBlank()) return false; SimpleMailMessage message=new SimpleMailMessage(); message.setFrom(mailFrom.isBlank()?null:mailFrom); message.setTo(to); message.setSubject("Your enrollment was accepted: "+course); message.setText("Hello "+name+",\n\nYour enrollment for "+course+" has been accepted by "+company+" for the "+job+" application.\n\nYou are now enrolled in the course.\n\nRegards,\nSmartRecruit Team"); mail.send(message); return true; }
    private Map<String,Object> authResponse(UUID id,String name,String email,String role){ return Map.of("user",Map.of("id",id,"name",name,"email",email,"role",role),"token",jwt.create(id,role)); }
    private Map<String,Object> user(UUID id){return db.queryForMap("SELECT id,name,email,role FROM users WHERE id=?",id);}
    private Map<String,Object> job(Map<String,Object> row){Map<String,Object> out=new LinkedHashMap<>(row); for(String key:List.of("tags","responsibilities","requirements","benefits")){try{out.put(key,json.readTree(String.valueOf(row.get(key))));}catch(Exception ignored){}} return out;}
    private void require(Authentication auth,String role){if(auth==null||auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("ROLE_"+role))) throw new ResponseStatusException(HttpStatus.FORBIDDEN,role+" access required");}
    private ResponseEntity<Map<String,String>> error(HttpStatus status,String message){return ResponseEntity.status(status).body(Map.of("error",message));}
    private String text(Map<String,?> map,String key){Object value=map.get(key);return value==null?"":String.valueOf(value).trim();}
    private String textOr(Map<String,?> map,String key,String fallback){String value=text(map,key);return value.isBlank()?fallback:value;}
    private String jsonText(Object value){try{return value==null?"[]":json.writeValueAsString(value);}catch(Exception e){return "[]";}}
}
