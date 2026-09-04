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

For Job Provider:
1. Sign out
2. Register
3. Select Job Provider
4. Create account
5. Login
6. Job Provider dashboard opens
7. Click Job Postings or Post a Job
8. Publish a fake job; it appears immediately in Job Postings

## Backend integration
This is a frontend demo. It is prepared to later connect:

React → API Gateway → JWT/Auth Service → Eureka → Job Service / Application Service / Profile Service.

Real authentication/database APIs are not included in this ZIP.
