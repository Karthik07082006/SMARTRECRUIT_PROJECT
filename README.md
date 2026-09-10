# SmartRecruit v2

## What was fixed
The login flow now definitely opens the internal SmartRecruit portal after login.

Flow:
Register → choose Job Seeker / Job Provider → Create Account & Continue → Login → role-based portal.

The app also contains fake/demo job data so the Job Seeker dashboard immediately shows jobs after login.

## Job Seeker demo data
8 fake jobs are preloaded:
- Senior Java Developer
- Frontend React Developer
- Data Analyst
- DevOps Engineer
- UI/UX Designer
- Software Engineering Intern
- Backend Node.js Developer
- Cloud Engineer

The seeker can:
- Browse jobs
- Search jobs
- Apply to demo jobs
- See applications
- Open profile

## Job Provider demo data
The provider sees the same preloaded fake job postings and can:
- View Job Postings
- Add a new fake job using Post a Job
- View demo candidates
- Shortlist candidates
- See hiring pipeline

## Run in VS Code

1. Extract SmartRecruit.zip.
2. Open the SmartRecruit folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the Vite URL, normally:

```text
http://localhost:5173
```

## Test quickly

For Job Seeker:
1. Register
2. Select Job Seeker
3. Enter any name/email/password, or leave demo fields
4. Click Create account & continue
5. Click Login securely
6. Dashboard opens with 8 fake jobs
7. Click Find Jobs and Apply now
8. Complete Applicant details and Course registration, then click Submit application
9. Open My Applications and click View details to see the submitted job and course information

For Job Provider:
1. Sign out
2. Register
3. Select Job Provider
4. Create account
5. Login
6. Job Provider dashboard opens
7. Click Job Postings or Post a Job
8. Publish a fake job; it appears immediately in Job Postings

## Backend
The project now includes a local Node.js + Express + PostgreSQL API in `server/`.

It provides:
- JWT registration, login and role-based authorization
- Seeker profiles and provider seeker directory
- Provider job creation and job listing
- Seeker applications with validation
- PDF resume uploads stored on disk with PostgreSQL metadata
- Protected resume preview/download links for the owner or the relevant provider
- Provider application decisions: Accepted, Rejected and Unenrolled

### Run the backend locally

1. Install PostgreSQL and create a database named `smartrecruit`.
2. Copy `.env.example` to `.env` and update the database credentials if needed.
3. Install dependencies:

```bash
npm install
```

4. Start the API:

```bash
npm run server:dev
```

The API runs at `http://localhost:4000`. Check it with `GET /api/health`.

The current React screens still use their browser demo state. The API is ready for the next integration step, where those localStorage actions will be replaced with authenticated API calls.

### Run the Spring Boot backend in STS

The Spring Boot replacement is in `backend-spring/` and is importable as an existing Maven project.

1. In Spring Tool Suite, choose **File → Import → Maven → Existing Maven Projects**.
2. Select the `backend-spring` folder.
3. Configure PostgreSQL and SMTP in STS environment variables or `backend-spring/src/main/resources/application.yml`.
4. Run `com.smartrecruit.SmartRecruitApplication` as **Spring Boot App**.

The Spring API uses the same `http://localhost:4000/api` routes as the Node API. PostgreSQL must be running with the `smartrecruit` database. For real Gmail delivery, set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` using a Gmail App Password.
