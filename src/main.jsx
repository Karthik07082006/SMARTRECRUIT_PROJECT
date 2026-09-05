import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const starterJobs = [
  {id:1,title:"Senior Java Developer",company:"Nexa Systems",location:"Hyderabad",type:"Full-time",salary:"₹12–18 LPA",tags:["Java","Spring Boot","Microservices"],logo:"NS",logoKey:"nexa",description:"Own backend services used by millions of customers and help shape Nexa's next generation platform.",responsibilities:["Design resilient Spring Boot services","Review code and mentor engineers","Partner with product and platform teams"],requirements:["4+ years of Java experience","Strong Spring Boot and REST API skills","Experience with SQL and distributed systems"],benefits:["Flexible hybrid work","Learning budget","Medical insurance"]},
  {id:2,title:"Frontend React Developer",company:"CloudPeak Technologies",location:"Bengaluru",type:"Full-time",salary:"₹9–15 LPA",tags:["React","JavaScript","CSS"],logo:"CP",logoKey:"cloudpeak",description:"Build accessible, fast product experiences for teams managing their cloud infrastructure around the world.",responsibilities:["Create reusable React components","Translate product designs into responsive screens","Improve performance and frontend testing"],requirements:["2+ years with React","Strong JavaScript and CSS fundamentals","Comfort working with REST APIs"],benefits:["Remote-friendly team","Conference allowance","Quarterly team offsites"]},
  {id:3,title:"Data Analyst",company:"Vertex Analytics",location:"Remote",type:"Full-time",salary:"₹7–11 LPA",tags:["Python","SQL","Power BI"],logo:"VA",logoKey:"vertex",description:"Turn operational data into clear recommendations that help Vertex customers make better decisions every week.",responsibilities:["Build reliable reporting datasets","Create dashboards for business teams","Explain trends through concise analysis"],requirements:["Strong SQL skills","Working knowledge of Python","Experience with Power BI or similar tools"],benefits:["Fully remote role","Annual learning stipend","Flexible working hours"]},
  {id:4,title:"DevOps Engineer",company:"FinStack",location:"Pune",type:"Full-time",salary:"₹11–17 LPA",tags:["AWS","Docker","Kubernetes"],logo:"FS",logoKey:"finstack",description:"Help FinStack ship secure financial products by improving cloud infrastructure, observability, and delivery automation.",responsibilities:["Maintain AWS and Kubernetes environments","Automate build and release pipelines","Improve reliability and incident response"],requirements:["3+ years in DevOps or SRE","Hands-on AWS and Docker experience","Knowledge of CI/CD and monitoring"],benefits:["Production engineering mentorship","Wellness support","Performance bonus"]},
  {id:5,title:"UI/UX Designer",company:"Orbit Labs",location:"Hyderabad",type:"Full-time",salary:"₹8–13 LPA",tags:["Figma","UX","UI"],logo:"OL",logoKey:"orbit",description:"Shape simple, thoughtful experiences for Orbit Labs products from early research through polished interaction design.",responsibilities:["Plan user interviews and usability tests","Create flows, wireframes, and prototypes","Collaborate with product and engineering"],requirements:["Portfolio showing product design work","Strong Figma skills","Clear communication and user empathy"],benefits:["Design conference budget","Collaborative studio","Flexible leave policy"]},
  {id:6,title:"Software Engineering Intern",company:"BrightByte",location:"Chennai",type:"Internship",salary:"₹25–40K/month",tags:["Java","React","Git"],logo:"BB",logoKey:"brightbyte",description:"Learn from experienced engineers while contributing to real product features across BrightByte's Java and React stack.",responsibilities:["Implement small features with guidance","Write tests and document your work","Join code reviews and engineering demos"],requirements:["Pursuing a computer science degree","Basic JavaScript or Java knowledge","Curiosity and willingness to learn"],benefits:["Paid internship","Dedicated mentor","Certificate on completion"]},
  {id:7,title:"Backend Node.js Developer",company:"BlueGrid",location:"Remote",type:"Full-time",salary:"₹8–14 LPA",tags:["Node.js","MongoDB","REST"],logo:"BG",logoKey:"bluegrid",description:"Develop dependable APIs and data services that power BlueGrid's collaboration tools for distributed teams.",responsibilities:["Build Node.js APIs and integrations","Model data in MongoDB","Monitor and improve service reliability"],requirements:["2+ years with Node.js","Experience designing REST APIs","Comfort with automated testing"],benefits:["Work from anywhere","Home office setup","Skill development budget"]},
  {id:8,title:"Cloud Engineer",company:"SkyNet Digital",location:"Bengaluru",type:"Full-time",salary:"₹13–20 LPA",tags:["Azure","Cloud","Linux"],logo:"SD",logoKey:"skynet",description:"Design secure Azure foundations and help delivery teams deploy scalable applications with confidence.",responsibilities:["Build Azure infrastructure patterns","Manage Linux-based workloads","Advise teams on cloud cost and security"],requirements:["Azure experience and certification preferred","Strong Linux fundamentals","Knowledge of networking and IaC"],benefits:["Certification support","Hybrid work model","Employee stock options"]}
];

const starterCourses = [
  {id:1,title:"Java Full Stack Bootcamp",provider:"SkillForge Academy",category:"Development",duration:"12 weeks",level:"Intermediate",rating:4.8,students:"3.2k learners",price:"₹8,999",description:"Build enterprise-ready Java and React applications from scratch with guided projects and mentorship.",summary:"Learn backend APIs, frontend integration, and deployment workflows for full-stack development.",outcomes:["Spring Boot REST APIs","React UI architecture","Database design and SQL","Deployment basics"],modules:["Java Fundamentals","Spring Boot","React & Redux","Full-stack Projects"],schedule:"Mon & Wed · 7:00 PM IST"},
  {id:2,title:"Azure Cloud Fundamentals",provider:"CloudNest Labs",category:"Cloud",duration:"6 weeks",level:"Beginner",rating:4.7,students:"5.6k learners",price:"₹5,499",description:"Master Azure services, cloud architecture, and deployment essentials for modern application hosting.",summary:"Understand IAM, networking, storage, and monitoring for cloud-first environments.",outcomes:["Azure resource planning","Virtual networking","Storage and security","Monitoring and troubleshooting"],modules:["Cloud concepts","Azure services","Security basics","Hands-on labs"],schedule:"Tue & Thu · 6:30 PM IST"},
  {id:3,title:"Data Analytics with SQL & Python",provider:"InsightWorks",category:"Analytics",duration:"8 weeks",level:"Beginner",rating:4.9,students:"4.9k learners",price:"₹6,799",description:"Turn raw business data into dashboards and weekly insights using SQL, Python, and visualization tools.",summary:"Work with real datasets and create data storytelling projects for reporting and analytics roles.",outcomes:["SQL querying","Python data cleaning","Visualization dashboards","Business insight presentation"],modules:["SQL foundations","Python for data","Data visualization","Capstone analytics"],schedule:"Sat · 10:00 AM IST"},
  {id:4,title:"UX Design Sprint",provider:"PixelCraft Studio",category:"Design",duration:"4 weeks",level:"Beginner",rating:4.6,students:"2.1k learners",price:"₹4,299",description:"Create user-centered product flows, wireframes, and polished interfaces for real digital experiences.",summary:"Develop problem-solving, prototyping, and collaboration skills for design-focused roles.",outcomes:["User research","Wireframing","Interaction design","Prototype testing"],modules:["Design principles","Figma workflows","Interaction patterns","Portfolio project"],schedule:"Sun · 11:00 AM IST"}
];

const SESSION_KEY = "smartrecruit-session";
const APPLICATIONS_KEY = "smartrecruit-applications";
const THEME_KEY = "smartrecruit-theme";
const PROFILES_KEY = "smartrecruit-profiles";
const SESSION_LENGTH = 60 * 60 * 1000;

function readStorage(key, fallback) {
  try { const value=localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function App(){
  const savedSession=readStorage(SESSION_KEY,null);
  const activeSession=savedSession && savedSession.expiresAt>Date.now() ? savedSession : null;
  const rememberedUser=activeSession?.user?.name==="Alex Kumar" ? {...activeSession.user,name:"Karthik"} : activeSession?.user;
  const [screen,setScreen] = useState(activeSession ? "portal" : "register");
  const [role,setRole] = useState(activeSession?.role || "seeker");
  const [user,setUser] = useState(rememberedUser || {name:"",email:"",password:""});
  const [jobs,setJobs] = useState(starterJobs);
  const [applications,setApplications] = useState(()=>readStorage(APPLICATIONS_KEY,[]));
  const [favoriteJobs,setFavoriteJobs] = useState([1,3]);
  const [darkMode,setDarkMode] = useState(()=>readStorage(THEME_KEY,"day")==="night");
  const [toast,setToast] = useState("");

  useEffect(()=>{ localStorage.setItem(APPLICATIONS_KEY,JSON.stringify(applications)); },[applications]);
  useEffect(()=>{ localStorage.setItem(THEME_KEY,darkMode?"night":"day"); },[darkMode]);

  useEffect(()=>{
    if(screen!=="portal") return undefined;
    const session=readStorage(SESSION_KEY,null);
    if(!session || session.expiresAt<=Date.now()) return undefined;
    const timer=window.setTimeout(()=>{localStorage.removeItem(SESSION_KEY);setScreen("login");},session.expiresAt-Date.now());
    return ()=>window.clearTimeout(timer);
  },[screen]);

  const notify = m => { setToast(m); window.clearTimeout(window.__srToast); window.__srToast=setTimeout(()=>setToast(""),2400); };

  const toggleFavorite = jobId => {
    setFavoriteJobs(current => current.includes(jobId) ? current.filter(id => id !== jobId) : [...current, jobId]);
  };

  const finishRegister = () => {
    const safeName = user.name.trim() || (role==="seeker" ? "Karthik" : "Smart Provider");
    const safeEmail = user.email.trim() || "demo@smartrecruit.com";
    setUser({name:safeName,email:safeEmail,password:user.password || ""});
    setScreen("login");
  };

  const login = () => {
    const safeName = user.name.trim() || (role==="seeker" ? "Karthik" : "Smart Provider");
    const sessionUser={name:safeName,email:user.email.trim() || "demo@smartrecruit.com"};
    setUser({...user,...sessionUser,password:user.password || ""});
    localStorage.setItem(SESSION_KEY,JSON.stringify({user:sessionUser,role,expiresAt:Date.now()+SESSION_LENGTH}));
    setScreen("portal");
    notify("Login successful — welcome to SmartRecruit!");
  };

  if(screen==="register") return <Auth register role={role} setRole={setRole} user={user} setUser={setUser} onSubmit={finishRegister} switchToLogin={()=>setScreen("login")} darkMode={darkMode} setDarkMode={setDarkMode}/>;
  if(screen==="login") return <Auth role={role} setRole={setRole} user={user} setUser={setUser} onSubmit={login} switchToRegister={()=>setScreen("register")} darkMode={darkMode} setDarkMode={setDarkMode}/>;
  return <Portal role={role} user={user} setUser={setUser} jobs={jobs} setJobs={setJobs} applications={applications} setApplications={setApplications} notify={notify} logout={()=>{localStorage.removeItem(SESSION_KEY);setScreen("login");notify("You have been logged out")}} toast={toast} favoriteJobs={favoriteJobs} toggleFavorite={toggleFavorite} darkMode={darkMode} setDarkMode={setDarkMode}/>;
}

function Logo({small=false}) {
  return <div className={"logo "+(small?"small":"")}>
    <div className="logo-mark"><span>S</span><i/></div>
    <div><b>Smart<span>Recruit</span></b>{!small&&<small>SMART TALENT • SMART HIRING</small>}</div>
  </div>
}

function CompanyLogo({job,compact=false}) {
  return <div className={"company-logo logo-"+(job.logoKey||"custom")+(compact?" compact":"")} aria-label={`${job.company} logo`}><span>{job.logo}</span><i/></div>;
}

function Auth({register=false,role,setRole,user,setUser,onSubmit,switchToLogin,switchToRegister,darkMode,setDarkMode}) {
  return <div className={darkMode ? "auth dark-mode" : "auth"}>
    <section className="auth-brand">
      <div className="top-bar"><Logo/><button className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>{darkMode ? "☀" : "☾"}</button></div>
      <div className="brand-copy">
        <span className="badge dark">✦ SMART TALENT • SMART HIRING</span>
        <h1>Where talent<br/><span>meets opportunity.</span></h1>
        <p>SmartRecruit connects ambitious job seekers with growing organizations through one simple, secure hiring platform.</p>
        <div className="benefits"><div>✓ Discover relevant job opportunities</div><div>✓ Build a professional profile</div><div>✓ Hire and manage candidates easily</div></div>
      </div>
      <footer>© 2026 SmartRecruit • Secure recruitment workspace</footer>
    </section>
    <section className="auth-form-area">
      <div className="auth-card">
        <div className="mobile-brand"><Logo small/><button className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>{darkMode ? "☀" : "☾"}</button></div>
        <span className="kicker">{register?"CREATE ACCOUNT":"WELCOME BACK"}</span>
        <h2>{register?"Join SmartRecruit":"Login to SmartRecruit"}</h2>
        <p className="sub">{register?"Register first, then continue to your secure login.":"Continue to your role-based SmartRecruit workspace."}</p>

        <div className="role-picker">
          <button className={role==="seeker"?"on":""} onClick={()=>setRole("seeker")}><strong>♙</strong><span>Job Seeker<small>Find jobs</small></span></button>
          <button className={role==="provider"?"on":""} onClick={()=>setRole("provider")}><strong>▣</strong><span>Job Provider<small>Hire talent</small></span></button>
        </div>

        {register && <Input label="Full name" icon="♙" value={user.name} onChange={v=>setUser({...user,name:v})} placeholder={role==="seeker"?"Enter your full name":"Enter provider name"}/>}
        <Input label="Email address" icon="✉" value={user.email} onChange={v=>setUser({...user,email:v})} placeholder="you@example.com"/>
        <Input label="Password" icon="⌑" type="password" value={user.password} onChange={v=>setUser({...user,password:v})} placeholder="Enter your password"/>

        {register ? <label className="agree"><input type="checkbox"/> I agree to the Terms and Privacy Policy</label> :
          <div className="remember"><label><input type="checkbox"/> Remember me</label><button>Forgot password?</button></div>}

        <button className="auth-submit" onClick={onSubmit}>{register?"Create account & continue":"Login securely"} <b>→</b></button>

        <div className="switch">{register?"Already have an account?":"Don't have an account?"}
          <button onClick={register?switchToLogin:switchToRegister}>{register?" Login":" Register"}</button>
        </div>
        <div className="security">◈ JWT-ready secure authentication • Role-based access</div>
      </div>
    </section>
    <button className="theme-rail" onClick={()=>setDarkMode(!darkMode)} aria-label={`Switch to ${darkMode ? "day" : "night"} mode`}>
      <span>{darkMode ? "DAY" : "NIGHT"}</span>
      <small>{darkMode ? "Day mode" : "Night mode"}</small>
    </button>
  </div>
}

function Input({label,icon,value,onChange,placeholder,type="text"}) {
  return <label className="input"><span>{label}</span><div><i>{icon}</i><input type={type} value={value||""} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder}/></div></label>
}

function Portal({role,user,setUser,jobs,setJobs,applications,setApplications,notify,logout,toast,favoriteJobs,toggleFavorite,darkMode,setDarkMode}) {
  const [page,setPage] = useState("dashboard");
  const [pageHistory,setPageHistory] = useState([]);
  const [query,setQuery] = useState("");
  const [location,setLocation] = useState("all");
  const [jobType,setJobType] = useState("all");
  const [showPost,setShowPost] = useState(false);
  const [selectedJob,setSelectedJob] = useState(null);
  const [selectedJobDetails,setSelectedJobDetails] = useState(null);
  const [selectedCourse,setSelectedCourse] = useState(null);
  const [sortBy,setSortBy] = useState("recommended");

  const navigate = nextPage => {
    if (nextPage === page) return;
    setPageHistory(current => [...current, page]);
    setPage(nextPage);
  };

  const goBack = fallback => {
    setPageHistory(current => {
      if (!current.length) {
        setPage(fallback);
        return current;
      }
      const previousPage = current[current.length - 1];
      setPage(previousPage);
      return current.slice(0, -1);
    });
  };

  const openJobDetails = job => {
    setSelectedJobDetails(job);
    navigate("job-detail");
  };

  const sendCourseRegistrationEmail = details => {
    const recipient = (details.courseEmail || details.email || "").trim();
    if (!recipient) return;

    const subject = encodeURIComponent(`Course registration confirmation: ${details.courseName}`);
    const body = encodeURIComponent(
      `Hello,\n\nYour course registration has been confirmed.\n\nCourse: ${details.courseName}\nProvider: ${details.courseProvider || "Not provided"}\nStatus: ${details.courseStatus || "In progress"}\nJob: ${details.title || "SmartRecruit application"}\nCompany: ${details.company || "SmartRecruit"}\n\nThis is a confirmation from SmartRecruit.\n\nRegards,\nSmartRecruit Team`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const apply = job => {
    const activeRecord = applications.find(a => a.id === job.id && a.status !== "Rejected" && a.status !== "Unenrolled");
    if(activeRecord) return notify(activeRecord.status === "Accepted" ? "This course is already enrolled and can be unenrolled from your application tracker." : "You already applied for this job.");
    setSelectedJob(job);
  };

  const statusClassName = status => {
    if (status === "Rejected") return "status rejected";
    if (status === "Accepted") return "status accepted";
    if (status === "Unenrolled") return "status unenrolled";
    return "status";
  };

  const unenrollApplication = applicationId => {
    setApplications(current => current.map(application => application.id === applicationId ? {
      ...application,
      status: "Unenrolled",
      enrolled: false,
      providerDecision: "unenrolled",
      courseMessage: `Enrollment withdrawn for ${application.courseName}. You can enroll again later.`
    } : application));
    notify("Course unenrolled successfully.");
  };

  const submitApplication = details => {
    const courseMessage=`Your ${details.courseName} registration is confirmed for the ${selectedJob.title} application at ${selectedJob.company}.`;
    const application = {
      ...details,
      courseMessage,
      emailSent:true,
      id:selectedJob.id,
      title:selectedJob.title,
      company:selectedJob.company,
      date:"Today",
      status:"Pending review",
      providerDecision:"pending",
    };

    sendCourseRegistrationEmail({
      ...application,
      title: selectedJob.title,
      company: selectedJob.company,
      courseName: details.courseName,
      courseProvider: details.courseProvider,
      courseStatus: details.courseStatus,
      courseEmail: details.courseEmail || details.email,
    });

    setApplications([...applications, application]);
    setSelectedJob(null);
    setPage("applications");
    notify(`Application sent to ${selectedJob.company}. Awaiting provider approval.`);
  };

  const postJob = data => {
    const newJob={...data,id:Date.now(),logo:data.company.slice(0,2).toUpperCase(),logoKey:"custom",tags:data.skills.split(",").map(s=>s.trim()).filter(Boolean)};
    setJobs([newJob,...jobs]);
    setShowPost(false);
    setPage("jobs");
    notify("New job posted successfully!");
  };

  const filtered = jobs.filter(j => (j.title+" "+j.company+" "+j.location+" "+j.tags.join(" ")).toLowerCase().includes(query.toLowerCase()) && (location==="all" || j.location===location) && (jobType==="all" || j.type===jobType));
  const sorted = [...filtered].sort((a,b) => {
    if(sortBy === "salary") return Number.parseInt(b.salary.match(/\d+/g)?.[0] || 0,10) - Number.parseInt(a.salary.match(/\d+/g)?.[0] || 0,10);
    if(sortBy === "newest") return b.id - a.id;
    return favoriteJobs.includes(b.id) - favoriteJobs.includes(a.id);
  });

  const seekerNav=[["dashboard","⌂","Dashboard"],["jobs","▣","Find Jobs"],["applications","✓","My Applications"],["profile","◎","My Profile"]];
  const providerNav=[["dashboard","⌂","Dashboard"],["jobs","▣","Job Postings"],["seeker-profiles","♙","Seeker Profiles"],["candidates","▣","Applications"],["post","＋","Post a Job"]];
  const nav=role==="seeker"?seekerNav:providerNav;

  return <div className={darkMode ? "portal dark-mode" : "portal"}>
    <header className="header">
      <Logo small/>
      <nav>{nav.map(n=><button className={page===n[0]?"active":""} onClick={()=>navigate(n[0])} key={n[0]}>{n[1]} {n[2]}</button>)}</nav>
      <div className="account">
        <button className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>{darkMode ? "☀" : "☾"}</button>
        <button onClick={()=>notify("No new notifications")}>♢</button>
        <div className="avatar">{initials(user.name)}</div>
        <div className="account-text"><b>{user.name}</b><small>{role==="seeker"?"Job Seeker":"Job Provider"}</small></div>
        <button className="logout-button" onClick={logout}>Logout</button>
      </div>
    </header>
    <main className="main">
      {page==="dashboard"&&<Dashboard role={role} user={user} jobs={sorted} applications={applications} setPage={navigate} apply={apply} onOpenJob={openJobDetails} favoriteJobs={favoriteJobs} toggleFavorite={toggleFavorite} notify={notify}/>} 
      {page==="jobs"&&<Jobs role={role} jobs={sorted} query={query} setQuery={setQuery} location={location} setLocation={setLocation} jobType={jobType} setJobType={setJobType} applications={applications} apply={apply} setPage={navigate} onOpenJob={openJobDetails} favoriteJobs={favoriteJobs} toggleFavorite={toggleFavorite}/>} 
      {page==="job-detail"&&<JobDetail job={selectedJobDetails} onBack={()=>goBack("jobs")} onDashboard={()=>navigate("dashboard")} onJobs={()=>navigate("jobs")} onApply={()=>apply(selectedJobDetails)}/>} 
      {page==="applications"&&<Applications applications={applications} jobs={jobs} onUnenroll={unenrollApplication} statusClassName={statusClassName}/>} 
      {page==="profile"&&<ProfileEditor user={user} setUser={setUser} role={role} notify={notify}/>} 
      {page==="candidates"&&<Candidates applications={applications} setApplications={setApplications} notify={notify}/>} 
      {page==="seeker-profiles"&&<SeekerProfiles/>} 
      {page==="post"&&<PostJob onPost={postJob}/>} 
    </main>
    {showPost&&<PostJob onPost={postJob} modal/>}
    {selectedJob&&<ApplicationForm job={selectedJob} user={user} onCancel={()=>setSelectedJob(null)} onSubmit={submitApplication}/>} 
    {toast&&<div className="toast">✓ &nbsp;{toast}</div>}
    <button className="theme-rail" onClick={()=>setDarkMode(!darkMode)} aria-label={`Switch to ${darkMode ? "day" : "night"} mode`}>
      <span>{darkMode ? "DAY" : "NIGHT"}</span>
      <small>{darkMode ? "Day mode" : "Night mode"}</small>
    </button>
  </div>
}

function initials(n){return (n||"SR").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}

function indianGreeting(){
  const hour=Number(new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",hourCycle:"h23"}).format(new Date()));
  if(hour>=5 && hour<12) return "Good morning";
  if(hour>=12 && hour<17) return "Good afternoon";
  if(hour>=17 && hour<21) return "Good evening";
  return "Good night";
}

function Dashboard({role,user,jobs,applications,setPage,apply,onOpenJob,favoriteJobs,toggleFavorite,notify}) {
  const savedCount = favoriteJobs.length;
  if(role==="provider") return <><Title kicker="JOB PROVIDER" title={`Welcome, ${user.name.split(" ")[0]} 👋`} sub="Your SmartRecruit hiring workspace is ready." action={<div className="dashboard-actions"><button className="outline" onClick={()=>setPage("seeker-profiles")}>♙ View seeker profiles</button><button className="primary" onClick={()=>setPage("post")}>＋ Post a Job</button></div>}/>
    <div className="hero provider"><div><span className="badge light">SMART HIRING</span><h2>Build your strongest team.</h2><p>Publish jobs, review candidates and move your hiring pipeline forward.</p></div><div className="hero-circle"><b>{jobs.length}</b><span>live jobs</span></div></div>
    <Metrics values={[["12","Active jobs","+3 this month"],["186","Applications","+18% this week"],["34","Shortlisted","Across open roles"],["9","Interviews","This month"]]}/>
    <div className="grid2"><div className="card"><CardTitle title="Hiring pipeline" sub="Candidate progress across your open roles"/>{[["Applied",186,100],["Screening",72,62],["Shortlisted",34,36],["Interview",9,18],["Offer",3,9]].map(x=><div className="pipeline"><span>{x[0]}</span><div><i style={{width:x[2]+"%"}}/></div><b>{x[1]}</b></div>)}</div><div className="card"><CardTitle title="Your job postings"/>{jobs.slice(0,4).map(j=><div className="mini-job"><CompanyLogo job={j} compact/><span><b>{j.title}</b><small>{j.company} · {j.location}</small></span><em>Active</em></div>)}</div></div>
  </>;
  return <><Title kicker="JOB SEEKER" title={`${indianGreeting()}, ${user.name.split(" ")[0]} 👋`} sub="Here are opportunities selected for your career journey." action={<button className="primary" onClick={()=>setPage("jobs")}>⌕ Explore Jobs</button>}/>
    <div className="hero seeker"><div><span className="badge light">PROFILE 82% COMPLETE</span><h2>Your next career move starts here.</h2><p>Explore real-looking demo opportunities and test the complete SmartRecruit experience.</p><button className="hero-btn" onClick={()=>setPage("jobs")}>Browse all jobs →</button></div><div className="orb"><b>✦</b></div></div>
    <Metrics values={[[applications.filter(a => a.status !== "Rejected" && a.status !== "Unenrolled").length,"Applications","+2 this month"],[savedCount,"Saved jobs","Quick shortlist"],["14","Matched jobs","6 new today"],["1","Interviews","Next: Friday"]]}/>
    <div className="section-head"><div><h3>Featured jobs</h3><p>Demo job data for your project presentation</p></div><button className="link" onClick={()=>setPage("jobs")}>View all →</button></div>
    <div className="job-grid">{jobs.slice(0,6).map(j=>{
      const jobApplication = applications.find(a => a.id === j.id && a.status !== "Rejected" && a.status !== "Unenrolled");
      const applied = !!jobApplication;
      const enrolled = jobApplication?.status === "Accepted";
      return <JobCard key={j.id} job={j} onOpenJob={onOpenJob} apply={()=>apply(j)} applied={applied} enrolled={enrolled} favorite={favoriteJobs.includes(j.id)} onToggleFavorite={()=>{toggleFavorite(j.id);notify(favoriteJobs.includes(j.id)?"Removed from saved jobs":"Saved to your shortlist");}}/>
    })}</div>
  </>
}

function CourseCatalog({courses,onOpenCourse,onBack}) {
  return <><Title kicker="LEARNING PATHS" title="Courses and certifications" sub="Explore mock learning programs designed for career growth." action={<button className="primary" onClick={onBack}>← Back</button>}/>
    <div className="course-grid wide">{courses.map(course => <button type="button" className="course-card" key={course.id} onClick={()=>onOpenCourse?.(course)}><div className="course-top"><span>{course.category}</span><strong>{course.rating} ★</strong></div><h4>{course.title}</h4><p>{course.provider}</p><div className="course-meta"><small>{course.duration}</small><small>{course.level}</small></div><div className="course-footer"><b>{course.price}</b><em>View details</em></div></button>)}</div>
  </>
}

function CourseDetail({course,onBack}) {
  if(!course) return null;
  const [showPayment,setShowPayment] = useState(false);
  const [paymentComplete,setPaymentComplete] = useState(false);
  return <div className="course-detail-panel"><div className="course-detail-header"><div><span className="badge light">{course.category}</span><h2>{course.title}</h2><p>{course.provider} · {course.duration}</p></div><button className="primary" onClick={onBack}>Back to courses</button></div>
    <div className="course-detail-content">
      <div className="card course-detail-main">
        <h3>About this course</h3>
        <p>{course.description}</p>
        <div className="course-stats"><span>{course.level}</span><span>{course.rating} ★ rating</span><span>{course.students}</span></div>
        <div className="detail-block"><h4>What you will learn</h4><ul>{course.outcomes.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div className="detail-block"><h4>Course modules</h4><ul>{course.modules.map(item => <li key={item}>{item}</li>)}</ul></div>
      </div>
      <aside className="card course-side-panel">
        <div className="side-price"><strong>{course.price}</strong><small>{course.schedule}</small></div>
        <p>{course.summary}</p>
        <button className="primary wide-btn" onClick={()=>{setShowPayment(true);setPaymentComplete(false);}}>Enroll now</button>
        <button className="outline wide-btn" onClick={onBack}>View all courses</button>
      </aside>
    </div>
    {showPayment&&<div className="payment-backdrop"><div className="payment-modal"><button className="modal-close" onClick={()=>setShowPayment(false)} aria-label="Close payment dialog">×</button>{paymentComplete?<div className="payment-success"><div className="success-mark">✓</div><h3>Payment simulated successfully</h3><p>Your seat for <b>{course.title}</b> is reserved in this demo.</p><button className="primary wide-btn" onClick={()=>setShowPayment(false)}>Continue learning</button></div>:<><span className="kicker">DEMO CHECKOUT</span><h3>Pay to reserve your seat</h3><p className="payment-course">{course.title} · {course.price}</p><div className="qr-code" aria-label="Fake QR code for demo payment"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><p className="scan-note">Scan with any UPI app</p><div className="upi-row"><span>UPI ID</span><b>smartrecruit.demo@upi</b></div><button className="primary wide-btn" onClick={()=>setPaymentComplete(true)}>I have completed payment</button><button className="outline wide-btn" onClick={()=>setShowPayment(false)}>Cancel</button><small className="demo-payment-note">Demo only · No real money will be charged</small></>}</div></div>}
  </div>
}

function Metrics({values}){return <div className="metrics">{values.map(v=><div className="metric"><div className="metric-icon">✦</div><div><b>{v[0]}</b><span>{v[1]}</span><small>{v[2]}</small></div></div>)}</div>}
function Title({kicker,title,sub,action}){return <div className="title"><div><span>{kicker}</span><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function CardTitle({title,sub}){return <div className="card-title"><div><h3>{title}</h3>{sub&&<p>{sub}</p>}</div></div>}

function Jobs({role,jobs,query,setQuery,location,setLocation,jobType,setJobType,applications,apply,setPage,onOpenJob,favoriteJobs,toggleFavorite}) {
 return <><Title kicker={role==="provider"?"JOB POSTINGS":"OPPORTUNITIES"} title={role==="provider"?"Manage your job postings":"Find your next role"} sub={role==="provider"?"Your fake/demo jobs are listed below and can be extended with Post a Job.":"Choose from the demo jobs below for testing and presentation."} action={role==="provider"?<button className="primary" onClick={()=>setPage("post")}>＋ Add Job</button>:null}/>
   <div className="filters"><div>⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jobs, companies, skills..."/></div><select value={location} onChange={e=>setLocation(e.target.value)}><option value="all">All locations</option><option value="Hyderabad">Hyderabad</option><option value="Bengaluru">Bengaluru</option><option value="Pune">Pune</option><option value="Chennai">Chennai</option><option value="Remote">Remote</option></select><select value={jobType} onChange={e=>setJobType(e.target.value)}><option value="all">All types</option><option value="Full-time">Full-time</option><option value="Internship">Internship</option></select><button onClick={()=>{setQuery("");setLocation("all");setJobType("all");}}>↺ Clear</button></div>
   <div className="results"><b>{jobs.length} demo jobs available</b><span>SmartRecruit recommendations</span></div>
   {jobs.map(j=>{
      const jobApplication = applications.find(a => a.id === j.id && a.status !== "Rejected" && a.status !== "Unenrolled");
      const applied = !!jobApplication;
      const enrolled = jobApplication?.status === "Accepted";
      return <JobCard key={j.id} job={j} wide onOpenJob={onOpenJob} apply={()=>apply(j)} applied={applied} enrolled={enrolled} provider={role==="provider"} favorite={favoriteJobs.includes(j.id)} onToggleFavorite={()=>toggleFavorite(j.id)}/>;
   }) }
 </>;
}

function JobDetail({job,onBack,onDashboard,onJobs,onApply}) {
  if(!job) return null;
  return <div className="job-detail-page"><div className="detail-nav"><button className="link" onClick={onDashboard}>Dashboard</button><span>/</span><button className="link" onClick={onJobs}>Find Jobs</button><span>/</span><b>{job.title}</b></div><Title kicker="JOB DETAILS" title={job.title} sub={`${job.company} · ${job.location}`} action={<button className="primary" onClick={onBack}>← Back</button>}/>
    <div className="job-detail-layout"><div className="card job-detail-main"><div className="job-detail-brand"><CompanyLogo job={job}/><div><h2>{job.company}</h2><p>{job.location} · {job.type} · {job.salary}</p></div></div><div className="chips">{job.tags.map(tag=><span key={tag}>{tag}</span>)}</div><section><h3>About the role</h3><p>{job.description}</p></section><section><h3>What you will do</h3><ul>{job.responsibilities.map(item=><li key={item}>{item}</li>)}</ul></section><section><h3>What you bring</h3><ul>{job.requirements.map(item=><li key={item}>{item}</li>)}</ul></section></div><aside className="card job-detail-side"><h3>Role summary</h3><div className="job-detail-facts"><span><b>Location</b>{job.location}</span><span><b>Job type</b>{job.type}</span><span><b>Salary</b>{job.salary}</span></div><button className="primary wide-btn" onClick={onApply}>Apply now</button><h3>Benefits</h3><ul>{job.benefits.map(item=><li key={item}>{item}</li>)}</ul></aside></div>
  </div>
}

function JobCard({job,wide=false,onOpenJob,apply,applied,provider=false,favorite=false,onToggleFavorite,enrolled=false}) {
  const actionLabel = enrolled ? "✓ Enrolled" : applied ? "✓ Applied" : "Apply now";
  return <article className={"job-card "+(wide?"wide":"")} onClick={()=>onOpenJob?.(job)} role={onOpenJob?"button":undefined} tabIndex={onOpenJob?0:undefined}><CompanyLogo job={job}/><div className="job-body"><div className="job-head"><div><h3>{job.title}</h3><p>{job.company} · {job.location}</p></div><button className={favorite?"heart saved":"heart"} onClick={event=>{event.stopPropagation();onToggleFavorite?.();}} aria-label={favorite?"Remove saved job":"Save job"}>{favorite?"♥":"♡"}</button></div><div className="chips">{job.tags.map(t=><span key={t}>{t}</span>)}</div><div className="job-meta"><span>◷ Recently posted</span><span>▤ {job.type}</span><span>₹ {job.salary.replace("₹ ","")}</span>{!provider&&<button className={enrolled || applied ? "applied" : "apply"} onClick={event=>{event.stopPropagation();if(!enrolled) apply();}} disabled={enrolled}>{actionLabel}</button>}</div></div></article>
}

function Applications({applications,jobs,onUnenroll,statusClassName}) {
 const [selected,setSelected] = useState(null);
 return <><Title kicker="APPLICATION TRACKER" title="My applications" sub="Monitor your submitted applications from one dashboard."/><Metrics values={[[applications.filter(a=>a.status !== "Rejected" && a.status !== "Unenrolled").length,"Total applications","Your active search"],[applications.filter(a=>a.status==="Pending review"||a.status==="Accepted"||a.status==="Applied").length,"Submitted","Awaiting response"],[applications.filter(a=>a.courseName).length,"Course details","Included in applications"],["6","Saved jobs","Explore more"]]}/><div className="card table-card"><CardTitle title="Application history" sub="Select an application to view the details you submitted."/><table><thead><tr><th>ROLE</th><th>COMPANY</th><th>DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{applications.length?applications.map(a=><tr key={a.id}><td><b>{a.title}</b></td><td>{a.company}</td><td>{a.date}</td><td><span className={statusClassName ? statusClassName(a.status) : "status"}>{a.status}</span></td><td><div className="row-actions"><button className="link" onClick={()=>setSelected(selected?.id===a.id?null:a)}>View details</button>{a.status === "Accepted" && <button className="link danger-link" onClick={()=>onUnenroll?.(a.id)}>Unenroll</button>}</div></td></tr>):<tr><td colSpan="5" className="empty">No applications yet. Go to Find Jobs and apply to a demo job.</td></tr>}</tbody></table>{selected&&<ApplicationDetails application={selected} onUnenroll={onUnenroll} statusClassName={statusClassName}/>}</div></>
}

function ApplicationDetails({application,onUnenroll,statusClassName}) {
 return <div className="application-details"><div><span className="kicker">SUBMITTED APPLICATION</span><h3>{application.title}</h3><p>{application.company} · Applied {application.date}</p></div><span className={statusClassName ? statusClassName(application.status) : "status"}>{application.status}</span><div className="detail-grid"><Field l="Applicant" v={application.fullName}/><Field l="Email" v={application.email}/><Field l="Phone" v={application.phone}/><Field l="Education" v={application.education}/><Field l="Experience" v={application.experience}/><Field l="Course / certification" v={application.courseName || "Not provided"}/><Field l="Course provider" v={application.courseProvider || "Not provided"}/><Field l="Course email" v={application.courseEmail || "Not provided"}/><Field l="Course status" v={application.courseStatus || "Not provided"}/></div><div className="email-confirmation"><span>✉</span><div><b>{application.status === "Accepted" ? "Enrollment accepted by provider" : application.status === "Rejected" ? "Enrollment rejected by provider" : application.status === "Unenrolled" ? "Enrollment withdrawn by seeker" : "Course registration message sent"}</b><small>{application.courseEmail} · {application.courseMessage}</small></div></div>{application.status === "Accepted" && <button className="outline" onClick={()=>onUnenroll?.(application.id)}>Unenroll course</button>}<div className="resume-attachment"><span>PDF</span><div><b>{application.resumeName || "No resume attached"}</b><small>{application.resumeSize ? `${application.resumeSize} MB · Ready for review` : "No resume was uploaded"}</small></div></div><div className="detail-note"><b>Cover note</b><p>{application.coverLetter || "No cover note provided."}</p></div></div>
}

function ApplicationForm({job,user,onCancel,onSubmit}) {
 const [data,setData] = useState({fullName:user.name||"",email:user.email||"",phone:"",education:"",experience:"",courseName:"",courseProvider:"",courseEmail:user.email||"",courseStatus:"In progress",coverLetter:""});
 const [resumeError,setResumeError] = useState("");
 const [formError,setFormError] = useState("");
 const update=(key,value)=>setData(current=>({...current,[key]:value}));
 const handleResume = event => { const file=event.target.files?.[0]; if(!file) return; if(file.type!=="application/pdf"){setResumeError("Please upload a PDF file.");event.target.value="";return;} if(file.size>5*1024*1024){setResumeError("Resume must be 5 MB or smaller.");event.target.value="";return;} setResumeError(""); update("resumeName",file.name); update("resumeSize",(file.size/(1024*1024)).toFixed(2)); };
 const submit = () => { const submission={...data,courseEmail:data.email}; const required=["fullName","email","phone","education","experience","courseName","courseProvider","resumeName"]; if(required.some(key=>!String(submission[key]||"").trim())){setFormError("Complete all applicant and course details, including the course message email, then attach a PDF resume before applying.");return;} if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.courseEmail)){setFormError("Enter a valid email address for the course registration message.");return;} setFormError(""); onSubmit(submission); };
 return <div className="modal-backdrop"><div className="application-modal"><div className="modal-head"><div><span className="kicker">APPLY FOR THIS ROLE</span><h2>{job.title}</h2><p>{job.company} · {job.location}</p></div><button className="modal-close" onClick={onCancel} aria-label="Close application form">×</button></div><div className="application-section"><h3>Applicant details <em className="required-note">Required</em></h3><div className="form-grid"><Field l="Full name *" v={data.fullName} set={v=>update("fullName",v)}/><Field l="Email address *" v={data.email} set={v=>update("email",v)}/><Field l="Phone number *" v={data.phone} set={v=>update("phone",v)}/><Field l="Education *" v={data.education} set={v=>update("education",v)}/><Field l="Experience *" v={data.experience} set={v=>update("experience",v)}/></div></div><div className="application-section"><h3>Course registration <em className="required-note">Required</em></h3><p className="form-hint">Add the course or certification that supports your application.</p><div className="form-grid"><Field l="Course / certification *" v={data.courseName} set={v=>update("courseName",v)}/><Field l="Course provider *" v={data.courseProvider} set={v=>update("courseProvider",v)}/><label className="field"><span>Course status</span><select value={data.courseStatus} onChange={e=>update("courseStatus",e.target.value)}><option>In progress</option><option>Completed</option><option>Planning to enroll</option></select></label></div></div><div className="resume-upload"><div><h3>Resume <em className="required-note">Required</em></h3><p className="form-hint">Upload your latest resume as a PDF, up to 5 MB.</p></div><label className="resume-picker"><span>＋ Choose PDF</span><input type="file" accept="application/pdf,.pdf" onChange={handleResume}/></label>{data.resumeName&&<div className="selected-resume"><b>{data.resumeName}</b><span>{data.resumeSize} MB</span></div>}{resumeError&&<small className="resume-error">{resumeError}</small>}</div><label className="field full"><span>Why are you a good fit?</span><textarea value={data.coverLetter} onChange={e=>update("coverLetter",e.target.value)} placeholder="Share a short note with the hiring team..."/></label>{formError&&<div className="form-error">{formError}</div>}<div className="form-actions"><button className="outline" onClick={onCancel}>Cancel</button><button className="primary" onClick={submit}>Submit application →</button></div></div></div>
}

function Profile({user,notify}){return <><Title kicker="MY PROFILE" title="Professional profile" sub="Your profile helps providers discover the right talent." action={<button className="primary" onClick={()=>notify("Profile saved successfully")}>Save changes</button>}/><div className="profile-grid"><div className="card profile-card"><div className="profile-top"><div className="profile-avatar">{initials(user.name)}</div><div><h2>{user.name}</h2><p>Full Stack Developer · Hyderabad, India</p><span>✓ Profile verified</span></div></div><div className="form-grid"><Field l="Full name" v={user.name}/><Field l="Email" v={user.email}/><Field l="Phone" v="+91 98765 43210"/><Field l="Location" v="Hyderabad, India"/><Field l="Headline" v="Full Stack Developer | Java & React"/><Field l="Experience" v="2–4 years"/></div><label className="field full"><span>About</span><textarea defaultValue="Software developer passionate about building scalable applications with Java, Spring Boot, React and cloud technologies."/></label></div><div className="card"><h3>Skills</h3><p>Key capabilities</p><div className="skills">{["Java","Spring Boot","React","JavaScript","REST APIs","MySQL","Git","Docker","AWS","Microservices"].map(s=><span>{s} ×</span>)}</div><button className="outline">＋ Add skill</button><hr/><h3>Resume</h3><div className="resume">▤ <div><b>SmartRecruit_Resume.pdf</b><small>Uploaded for demo</small></div></div></div></div></>}

function PostJob({onPost}){const [data,setData]=useState({title:"",company:"",location:"Hyderabad",type:"Full-time",salary:"₹8–14 LPA",skills:"Java, Spring Boot, SQL"});const update=(k,v)=>setData({...data,[k]:v});return <><Title kicker="JOB PROVIDER" title="Post a new job" sub="Add a demo job to your SmartRecruit provider account."/><div className="card form-card"><h3>Job information</h3><p>Fill these details and the new fake job will immediately appear in Job Postings.</p><div className="form-grid"><Field l="Job title" v={data.title} set={v=>update("title",v)}/><Field l="Company" v={data.company} set={v=>update("company",v)}/><Field l="Location" v={data.location} set={v=>update("location",v)}/><Field l="Employment type" v={data.type} set={v=>update("type",v)}/><Field l="Salary range" v={data.salary} set={v=>update("salary",v)}/><Field l="Skills (comma separated)" v={data.skills} set={v=>update("skills",v)}/></div><div className="form-actions"><button className="outline">Save draft</button><button className="primary" onClick={()=>onPost({...data,title:data.title||"Software Developer",company:data.company||"SmartRecruit Demo"})}>Publish Job →</button></div></div></>}

function SeekerProfiles(){
  const profiles=Object.values(readStorage(PROFILES_KEY,{}));
  const [selected,setSelected]=useState(null);
  return <><Title kicker="TALENT DIRECTORY" title="Seeker profiles" sub="Browse job seeker profiles and uploaded resumes independently from applications."/><div className="profile-directory">{profiles.length?profiles.map(profile=><div className="card directory-card" key={profile.email}><div className="profile-top"><div className="profile-avatar">{initials(profile.name)}</div><div><h2>{profile.name}</h2><p>{profile.headline} · {profile.location}</p><span>{profile.experience}</span></div></div><p className="directory-about">{profile.about}</p><div className="directory-footer">{profile.resume?.dataUrl?<a className="resume-open-link" href={profile.resume.dataUrl} target="_blank" rel="noreferrer">Open {profile.resume.name} ↗</a>:<span>{profile.resume?`Resume: ${profile.resume.name}`:"No resume uploaded"}</span>}<button className="outline" onClick={()=>setSelected(profile)}>View profile</button></div></div>):<div className="card empty-directory"><h3>No seeker profiles available yet</h3><p>Profiles appear here after job seekers save their profile details.</p></div>}</div>{selected&&<CandidateProfileModal candidate={{profile:selected,profileResume:selected.resume,application:{title:"Open talent profile",company:"SmartRecruit directory",status:"Profile"}}} onClose={()=>setSelected(null)}/>}</>
}

function Candidates({applications,setApplications,notify}){
  const [statusFilter,setStatusFilter] = useState("all");
  const [search,setSearch] = useState("");
  const [selectedCandidate,setSelectedCandidate] = useState(null);
  const profiles=readStorage(PROFILES_KEY,{});

  const filteredRequests = applications.filter(application => {
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    const text = `${application.fullName || ""} ${application.title || ""} ${application.company || ""} ${application.courseName || ""} ${application.courseProvider || ""}`.toLowerCase();
    const matchesSearch = !search || text.includes(search.toLowerCase());
    return (application.status === "Pending review" || application.status === "Accepted" || application.status === "Rejected") && matchesStatus && matchesSearch;
  });

  const updateStatus = (id, nextStatus) => {
    setApplications(current => current.map(application => application.id === id ? {
      ...application,
      status: nextStatus,
      enrolled: nextStatus === "Accepted",
      providerDecision: nextStatus.toLowerCase(),
      courseMessage: nextStatus === "Accepted"
        ? `Enrollment accepted by provider for ${application.courseName}.`
        : nextStatus === "Rejected"
          ? `Enrollment rejected by provider for ${application.courseName}.`
          : application.courseMessage
    } : application));
    notify(nextStatus === "Accepted" ? "Enrollment accepted" : nextStatus === "Rejected" ? "Enrollment rejected" : "Status updated");
  };

  return <>
    <Title kicker="RECRUITER DASHBOARD" title="Applicant enrollments" sub="Review and manage seeker applications before enrollment is finalized."/>
    <div className="card" style={{padding:"18px 20px", marginBottom:"18px"}}>
      <div className="filters" style={{marginBottom:0}}>
        <div>⌕<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search applicants, roles or courses..."/></div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="Pending review">Pending review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </div>
    <div className="candidate-list">{filteredRequests.length ? filteredRequests.map(application => { const profile=profiles[application.email]||{}; const profileResume=profile.resume||application.resumeName&&{name:application.resumeName,size:application.resumeSize}; return <div className="candidate" key={application.id}><div className="profile-avatar small">{initials(application.fullName || application.name || "SE")}</div><div className="candidate-info"><h3>{application.fullName || application.name || "Seeker"}</h3><p>{application.title} · {application.company}</p><div className="chips">{[application.courseName, application.courseProvider, application.courseStatus].filter(Boolean).map((item, idx)=><span key={`${application.id}-${idx}`}>{item}</span>)}</div>{profileResume&&<div className="candidate-resume"><b>Resume</b><span>{profileResume.name} · {profileResume.size} MB</span></div>}</div><div className="match"><b>{application.status}</b><small>{application.providerDecision === "pending" ? "Awaiting review" : application.providerDecision || "reviewed"}</small></div><button className="link profile-view-button" onClick={()=>setSelectedCandidate({application,profile,profileResume})}>View profile</button>{application.status === "Pending review" ? <><button className="outline" onClick={()=>updateStatus(application.id, "Rejected")}>Reject</button><button className="primary" onClick={()=>updateStatus(application.id, "Accepted")}>Accept</button></> : <button className="primary" onClick={()=>updateStatus(application.id, application.status === "Accepted" ? "Rejected" : "Accepted")}>{application.status === "Accepted" ? "Mark rejected" : "Mark accepted"}</button>}</div>}) : <div className="card"><h3>No enrollment requests match your filters</h3><p>Try clearing the search or changing the status filter.</p></div>}</div>
    {selectedCandidate&&<CandidateProfileModal candidate={selectedCandidate} onClose={()=>setSelectedCandidate(null)}/>} 
  </>
}

function CandidateProfileModal({candidate,onClose}){
  const {application,profile,profileResume}=candidate;
  return <div className="modal-backdrop"><div className="candidate-profile-modal"><div className="modal-head"><div><span className="kicker">SEEKER PROFILE</span><h2>{profile.name||application.fullName||"Job seeker"}</h2><p>{profile.headline||"Applicant profile"} · Applied for {application.title}</p></div><button className="modal-close" onClick={onClose} aria-label="Close seeker profile">×</button></div><div className="candidate-profile-grid"><div><div className="profile-avatar large">{initials(profile.name||application.fullName||"SE")}</div></div><div className="candidate-profile-fields"><Field l="Email" v={profile.email||application.email}/><Field l="Phone" v={profile.phone||application.phone||"Not provided"}/><Field l="Location" v={profile.location||"Not provided"}/><Field l="Experience" v={profile.experience||application.experience||"Not provided"}/></div><div className="candidate-profile-section"><h3>About</h3><p>{profile.about||"No profile summary provided."}</p></div><div className="candidate-profile-section"><h3>Application for this job</h3><p>{application.title} · {application.company}</p><div className="chips"><span>{application.status}</span>{application.courseName&&<span>{application.courseName}</span>}</div></div><div className="candidate-profile-section resume-access"><h3>Uploaded resume</h3>{profileResume?<div className="resume-attachment"><span>PDF</span><div><b>{profileResume.name}</b><small>{profileResume.size} MB · Available for provider review</small></div>{profileResume.dataUrl&&<a className="resume-open-link" href={profileResume.dataUrl} target="_blank" rel="noreferrer">Open resume ↗</a>}</div>:<p>No resume uploaded by this seeker.</p>}</div></div></div></div>
}

function ProfileEditor({user,setUser,role,notify}){
 const savedProfile=readStorage(PROFILES_KEY,{})[user.email]||{};
 const [profile,setProfile]=useState({name:user.name||"Karthik",email:user.email||"demo@smartrecruit.com",phone:user.phone||"6300577500",location:user.location||"Hyderabad, India",headline:user.headline||"Full Stack Developer | Java & React",experience:user.experience||"2–4 years",about:user.about||"Software developer passionate about building scalable applications with Java, Spring Boot, React and cloud technologies.",resume:savedProfile.resume||null});
 const [resumeError,setResumeError]=useState("");
 const update=(key,value)=>setProfile(current=>({...current,[key]:value}));
 const handleResume=event=>{const file=event.target.files?.[0];if(!file)return;if(file.type!=="application/pdf"){setResumeError("Please upload a PDF file.");event.target.value="";return;}if(file.size>5*1024*1024){setResumeError("Resume must be 5 MB or smaller.");event.target.value="";return;}const reader=new FileReader();reader.onload=()=>{setResumeError("");update("resume",{name:file.name,size:(file.size/(1024*1024)).toFixed(2),dataUrl:reader.result});};reader.readAsDataURL(file);};
 const save=()=>{const nextUser={...user,...profile};setUser(nextUser);const session=readStorage(SESSION_KEY,null);if(session)localStorage.setItem(SESSION_KEY,JSON.stringify({...session,user:{...session.user,...profile}}));const profiles=readStorage(PROFILES_KEY,{});profiles[profile.email]={...profile,resume:profile.resume||null};localStorage.setItem(PROFILES_KEY,JSON.stringify(profiles));notify("Profile saved to this browser");};
 return <><Title kicker="MY PROFILE" title="Professional profile" sub="Your profile helps providers discover the right talent." action={<button className="primary" onClick={save}>Save changes</button>}/><div className="profile-grid"><div className="card profile-card"><div className="profile-top"><div className="profile-avatar">{initials(profile.name)}</div><div><h2>{profile.name}</h2><p>{profile.headline} · {profile.location}</p><span>✓ Profile verified</span></div></div><div className="form-grid"><Field l="Full name" v={profile.name} set={v=>update("name",v)}/><Field l="Email" v={profile.email} set={v=>update("email",v)}/><Field l="Phone" v={profile.phone} set={v=>update("phone",v)}/><Field l="Location" v={profile.location} set={v=>update("location",v)}/><Field l="Headline" v={profile.headline} set={v=>update("headline",v)}/><Field l="Experience" v={profile.experience} set={v=>update("experience",v)}/></div><label className="field full"><span>About</span><textarea value={profile.about} onChange={e=>update("about",e.target.value)}/></label></div><div className="card"><h3>Skills</h3><p>Key capabilities</p><div className="skills">{["Java","Spring Boot","React","JavaScript","REST APIs","MySQL","Git","Docker","AWS","Microservices"].map(s=><span key={s}>{s} ×</span>)}</div><button className="outline">＋ Add skill</button><hr/><h3>Resume</h3><label className="resume-picker"><span>＋ Choose PDF</span><input type="file" accept="application/pdf,.pdf" onChange={handleResume}/></label>{profile.resume?<div className="selected-resume"><b>{profile.resume.name}</b><span>{profile.resume.size} MB · Visible to providers</span></div>:<small className="resume-help">Add a PDF resume so providers can review it with your applications.</small>}{resumeError&&<small className="resume-error">{resumeError}</small>}</div></div></>}

function Field({l,v,set}){
  const props = set ? { value: v ?? "", onChange: e => set(e.target.value) } : { defaultValue: v ?? "" };
  return <label className="field"><span>{l==="Email address *"?"Email for application & course message *":l}</span><input {...props}/></label>;
}

createRoot(document.getElementById("root")).render(<App/>);
