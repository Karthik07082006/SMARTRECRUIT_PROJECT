import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const starterJobs = [
  {id:1,title:"Senior Java Developer",company:"Nexa Systems",location:"Hyderabad",type:"Full-time",salary:"₹12–18 LPA",tags:["Java","Spring Boot","Microservices"],logo:"NS"},
  {id:2,title:"Frontend React Developer",company:"CloudPeak Technologies",location:"Bengaluru",type:"Full-time",salary:"₹9–15 LPA",tags:["React","JavaScript","CSS"],logo:"CP"},
  {id:3,title:"Data Analyst",company:"Vertex Analytics",location:"Remote",type:"Full-time",salary:"₹7–11 LPA",tags:["Python","SQL","Power BI"],logo:"VA"},
  {id:4,title:"DevOps Engineer",company:"FinStack",location:"Pune",type:"Full-time",salary:"₹11–17 LPA",tags:["AWS","Docker","Kubernetes"],logo:"FS"},
  {id:5,title:"UI/UX Designer",company:"Orbit Labs",location:"Hyderabad",type:"Full-time",salary:"₹8–13 LPA",tags:["Figma","UX","UI"],logo:"OL"},
  {id:6,title:"Software Engineering Intern",company:"BrightByte",location:"Chennai",type:"Internship",salary:"₹25–40K/month",tags:["Java","React","Git"],logo:"BB"},
  {id:7,title:"Backend Node.js Developer",company:"BlueGrid",location:"Remote",type:"Full-time",salary:"₹8–14 LPA",tags:["Node.js","MongoDB","REST"],logo:"BG"},
  {id:8,title:"Cloud Engineer",company:"SkyNet Digital",location:"Bengaluru",type:"Full-time",salary:"₹13–20 LPA",tags:["Azure","Cloud","Linux"],logo:"SD"}
];

function App(){
  const [screen,setScreen] = useState("register");
  const [role,setRole] = useState("seeker");
  const [user,setUser] = useState({name:"",email:"",password:""});
  const [jobs,setJobs] = useState(starterJobs);
  const [applications,setApplications] = useState([]);
  const [favoriteJobs,setFavoriteJobs] = useState([1,3]);
  const [darkMode,setDarkMode] = useState(false);
  const [toast,setToast] = useState("");

  const notify = m => { setToast(m); window.clearTimeout(window.__srToast); window.__srToast=setTimeout(()=>setToast(""),2400); };

  const toggleFavorite = jobId => {
    setFavoriteJobs(current => current.includes(jobId) ? current.filter(id => id !== jobId) : [...current, jobId]);
  };

  const finishRegister = () => {
    const safeName = user.name.trim() || (role==="seeker" ? "Alex Kumar" : "Smart Provider");
    const safeEmail = user.email.trim() || "demo@smartrecruit.com";
    setUser({name:safeName,email:safeEmail,password:user.password || ""});
    setScreen("login");
  };

  const login = () => {
    const safeName = user.name.trim() || (role==="seeker" ? "Alex Kumar" : "Smart Provider");
    setUser({...user,name:safeName,password:user.password || ""});
    setScreen("portal");
    notify("Login successful — welcome to SmartRecruit!");
  };

  if(screen==="register") return <Auth register role={role} setRole={setRole} user={user} setUser={setUser} onSubmit={finishRegister} switchToLogin={()=>setScreen("login")} darkMode={darkMode} setDarkMode={setDarkMode}/>;
  if(screen==="login") return <Auth role={role} setRole={setRole} user={user} setUser={setUser} onSubmit={login} switchToRegister={()=>setScreen("register")} darkMode={darkMode} setDarkMode={setDarkMode}/>;
  return <Portal role={role} user={user} jobs={jobs} setJobs={setJobs} applications={applications} setApplications={setApplications} notify={notify} logout={()=>{setScreen("login");notify("You have been logged out")}} toast={toast} favoriteJobs={favoriteJobs} toggleFavorite={toggleFavorite} darkMode={darkMode} setDarkMode={setDarkMode}/>;
}

function Logo({small=false}) {
  return <div className={"logo "+(small?"small":"")}>
    <div className="logo-mark">S</div>
    <div><b>Smart<span>Recruit</span></b>{!small&&<small>SMART TALENT • SMART HIRING</small>}</div>
  </div>
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
    <button className="theme-rail" onClick={()=>setDarkMode(!darkMode)} aria-label="Toggle black and white theme">
      <span>{darkMode ? "WHITE" : "DARK"}</span>
      <small>{darkMode ? "Light mode" : "Dark mode"}</small>
    </button>
  </div>
}

function Input({label,icon,value,onChange,placeholder,type="text"}) {
  return <label className="input"><span>{label}</span><div><i>{icon}</i><input type={type} value={value||""} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder}/></div></label>
}

function Portal({role,user,jobs,setJobs,applications,setApplications,notify,logout,toast,favoriteJobs,toggleFavorite,darkMode,setDarkMode}) {
  const [page,setPage] = useState("dashboard");
  const [query,setQuery] = useState("");
  const [showPost,setShowPost] = useState(false);
  const [sortBy,setSortBy] = useState("recommended");

  const apply = job => {
    if(applications.some(a=>a.id===job.id)) return notify("You already applied for this job.");
    setApplications([...applications,{id:job.id,title:job.title,company:job.company,date:"Today",status:"Applied"}]);
    notify(`Application sent to ${job.company}`);
  };

  const postJob = data => {
    const newJob={...data,id:Date.now(),logo:data.company.slice(0,2).toUpperCase(),tags:data.skills.split(",").map(s=>s.trim()).filter(Boolean)};
    setJobs([newJob,...jobs]);
    setShowPost(false);
    setPage("jobs");
    notify("New job posted successfully!");
  };

  const filtered = jobs.filter(j => (j.title+" "+j.company+" "+j.location+" "+j.tags.join(" ")).toLowerCase().includes(query.toLowerCase()));
  const sorted = [...filtered].sort((a,b) => {
    if(sortBy === "salary") return Number.parseInt(b.salary.match(/\d+/g)?.[0] || 0,10) - Number.parseInt(a.salary.match(/\d+/g)?.[0] || 0,10);
    if(sortBy === "newest") return b.id - a.id;
    return favoriteJobs.includes(b.id) - favoriteJobs.includes(a.id);
  });

  const seekerNav=[["dashboard","⌂","Dashboard"],["jobs","▣","Find Jobs"],["applications","✓","My Applications"],["profile","◎","My Profile"]];
  const providerNav=[["dashboard","⌂","Dashboard"],["jobs","▣","Job Postings"],["candidates","♙","Candidates"],["post","＋","Post a Job"]];
  const nav=role==="seeker"?seekerNav:providerNav;

  return <div className={darkMode ? "portal dark-mode" : "portal"}>
    <header className="header">
      <Logo small/>
      <nav>{nav.map(n=><button className={page===n[0]?"active":""} onClick={()=>setPage(n[0])} key={n[0]}>{n[1]} {n[2]}</button>)}</nav>
      <div className="account">
        <button className="theme-toggle" onClick={()=>setDarkMode(!darkMode)}>{darkMode ? "☀" : "☾"}</button>
        <button onClick={()=>notify("No new notifications")}>♢</button>
        <div className="avatar">{initials(user.name)}</div>
        <div className="account-text"><b>{user.name}</b><small>{role==="seeker"?"Job Seeker":"Job Provider"}</small></div>
        <button onClick={logout}>↪</button>
      </div>
    </header>
    <main className="main">
      {page==="dashboard"&&<Dashboard role={role} user={user} jobs={sorted} applications={applications} setPage={setPage} apply={apply} favoriteJobs={favoriteJobs} notify={notify}/>} 
      {page==="jobs"&&<Jobs role={role} jobs={sorted} query={query} setQuery={setQuery} applications={applications} apply={apply} setPage={setPage} sortBy={sortBy} setSortBy={setSortBy} favoriteJobs={favoriteJobs} toggleFavorite={toggleFavorite}/>} 
      {page==="applications"&&<Applications applications={applications} jobs={jobs}/>}
      {page==="profile"&&<Profile user={user} notify={notify}/>}
      {page==="candidates"&&<Candidates notify={notify}/>}
      {page==="post"&&<PostJob onPost={postJob}/>}
    </main>
    {showPost&&<PostJob onPost={postJob} modal/>}
    {toast&&<div className="toast">✓ &nbsp;{toast}</div>}
    <button className="theme-rail" onClick={()=>setDarkMode(!darkMode)} aria-label="Toggle black and white theme">
      <span>{darkMode ? "WHITE" : "DARK"}</span>
      <small>{darkMode ? "Light mode" : "Dark mode"}</small>
    </button>
  </div>
}

function initials(n){return (n||"SR").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}

function Dashboard({role,user,jobs,applications,setPage,apply,favoriteJobs,notify}) {
  const savedCount = favoriteJobs.length;
  if(role==="provider") return <><Title kicker="JOB PROVIDER" title={`Welcome, ${user.name.split(" ")[0]} 👋`} sub="Your SmartRecruit hiring workspace is ready." action={<button className="primary" onClick={()=>setPage("post")}>＋ Post a Job</button>}/>
    <div className="hero provider"><div><span className="badge light">SMART HIRING</span><h2>Build your strongest team.</h2><p>Publish jobs, review candidates and move your hiring pipeline forward.</p></div><div className="hero-circle"><b>{jobs.length}</b><span>live jobs</span></div></div>
    <Metrics values={[["12","Active jobs","+3 this month"],["186","Applications","+18% this week"],["34","Shortlisted","Across open roles"],["9","Interviews","This month"]]}/>
    <div className="grid2"><div className="card"><CardTitle title="Hiring pipeline" sub="Candidate progress across your open roles"/>{[["Applied",186,100],["Screening",72,62],["Shortlisted",34,36],["Interview",9,18],["Offer",3,9]].map(x=><div className="pipeline"><span>{x[0]}</span><div><i style={{width:x[2]+"%"}}/></div><b>{x[1]}</b></div>)}</div><div className="card"><CardTitle title="Your job postings"/>{jobs.slice(0,4).map(j=><div className="mini-job"><div>{j.logo}</div><span><b>{j.title}</b><small>{j.company} · {j.location}</small></span><em>Active</em></div>)}</div></div>
  </>;
  return <><Title kicker="JOB SEEKER" title={`Good morning, ${user.name.split(" ")[0]} 👋`} sub="Here are opportunities selected for your career journey." action={<button className="primary" onClick={()=>setPage("jobs")}>⌕ Explore Jobs</button>}/>
    <div className="hero seeker"><div><span className="badge light">PROFILE 82% COMPLETE</span><h2>Your next career move starts here.</h2><p>Explore real-looking demo opportunities and test the complete SmartRecruit experience.</p><button className="hero-btn" onClick={()=>setPage("jobs")}>Browse all jobs →</button></div><div className="orb"><b>✦</b></div></div>
    <Metrics values={[[applications.length,"Applications","+2 this month"],[savedCount,"Saved jobs","Quick shortlist"],["14","Matched jobs","6 new today"],["1","Interviews","Next: Friday"]]}/>
    <div className="section-head"><div><h3>Featured jobs</h3><p>Demo job data for your project presentation</p></div><button className="link" onClick={()=>setPage("jobs")}>View all →</button></div>
    <div className="job-grid">{jobs.slice(0,6).map(j=><JobCard key={j.id} job={j} apply={()=>apply(j)} applied={applications.some(a=>a.id===j.id)} favorite={favoriteJobs.includes(j.id)} onToggleFavorite={()=>{notify(j.id===favoriteJobs[0]?"Removed from saved jobs":"Saved to your shortlist");}}/>)}</div>
  </>
}

function Metrics({values}){return <div className="metrics">{values.map(v=><div className="metric"><div className="metric-icon">✦</div><div><b>{v[0]}</b><span>{v[1]}</span><small>{v[2]}</small></div></div>)}</div>}
function Title({kicker,title,sub,action}){return <div className="title"><div><span>{kicker}</span><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function CardTitle({title,sub}){return <div className="card-title"><div><h3>{title}</h3>{sub&&<p>{sub}</p>}</div></div>}

function Jobs({role,jobs,query,setQuery,applications,apply,setPage}) {
 return <><Title kicker={role==="provider"?"JOB POSTINGS":"OPPORTUNITIES"} title={role==="provider"?"Manage your job postings":"Find your next role"} sub={role==="provider"?"Your fake/demo jobs are listed below and can be extended with Post a Job.":"Choose from the demo jobs below for testing and presentation."} action={role==="provider"?<button className="primary" onClick={()=>setPage("post")}>＋ Add Job</button>:null}/>
   <div className="filters"><div>⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jobs, companies, skills..."/></div><select><option>All locations</option><option>Hyderabad</option><option>Bengaluru</option><option>Remote</option></select><select><option>All types</option><option>Full-time</option><option>Internship</option></select><button>☷ Filters</button></div>
   <div className="results"><b>{jobs.length} demo jobs available</b><span>SmartRecruit recommendations</span></div>
   {jobs.map(j=><JobCard key={j.id} job={j} wide apply={()=>apply(j)} applied={applications.some(a=>a.id===j.id)} provider={role==="provider"}/>)}
 </>;
}

function JobCard({job,wide=false,apply,applied,provider=false}) {
 return <article className={"job-card "+(wide?"wide":"")}><div className="job-logo">{job.logo}</div><div className="job-body"><div className="job-head"><div><h3>{job.title}</h3><p>{job.company} · {job.location}</p></div><button className="heart">♡</button></div><div className="chips">{job.tags.map(t=><span key={t}>{t}</span>)}</div><div className="job-meta"><span>◷ Recently posted</span><span>▤ {job.type}</span><span>₹ {job.salary.replace("₹ ","")}</span>{!provider&&<button className={applied?"applied":"apply"} onClick={apply}>{applied?"✓ Applied":"Apply now"}</button>}</div></div></article>
}

function Applications({applications,jobs}) {
 return <><Title kicker="APPLICATION TRACKER" title="My applications" sub="Monitor your submitted applications from one dashboard."/><Metrics values={[[applications.length,"Total applications","Your active search"],["1","Interview stage","Keep preparing"],["2","Under review","Awaiting response"],["6","Saved jobs","Explore more"]]}/><div className="card table-card"><CardTitle title="Application history"/><table><thead><tr><th>ROLE</th><th>COMPANY</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{applications.length?applications.map(a=><tr><td><b>{a.title}</b></td><td>{a.company}</td><td>{a.date}</td><td><span className="status">{a.status}</span></td></tr>):<tr><td colSpan="4" className="empty">No applications yet. Go to Find Jobs and apply to a demo job.</td></tr>}</tbody></table></div></>
}

function Profile({user,notify}){return <><Title kicker="MY PROFILE" title="Professional profile" sub="Your profile helps providers discover the right talent." action={<button className="primary" onClick={()=>notify("Profile saved successfully")}>Save changes</button>}/><div className="profile-grid"><div className="card profile-card"><div className="profile-top"><div className="profile-avatar">{initials(user.name)}</div><div><h2>{user.name}</h2><p>Full Stack Developer · Hyderabad, India</p><span>✓ Profile verified</span></div></div><div className="form-grid"><Field l="Full name" v={user.name}/><Field l="Email" v={user.email}/><Field l="Phone" v="+91 98765 43210"/><Field l="Location" v="Hyderabad, India"/><Field l="Headline" v="Full Stack Developer | Java & React"/><Field l="Experience" v="2–4 years"/></div><label className="field full"><span>About</span><textarea defaultValue="Software developer passionate about building scalable applications with Java, Spring Boot, React and cloud technologies."/></label></div><div className="card"><h3>Skills</h3><p>Key capabilities</p><div className="skills">{["Java","Spring Boot","React","JavaScript","REST APIs","MySQL","Git","Docker","AWS","Microservices"].map(s=><span>{s} ×</span>)}</div><button className="outline">＋ Add skill</button><hr/><h3>Resume</h3><div className="resume">▤ <div><b>SmartRecruit_Resume.pdf</b><small>Uploaded for demo</small></div></div></div></div></>}

function PostJob({onPost}){const [data,setData]=useState({title:"",company:"",location:"Hyderabad",type:"Full-time",salary:"₹8–14 LPA",skills:"Java, Spring Boot, SQL"});const update=(k,v)=>setData({...data,[k]:v});return <><Title kicker="JOB PROVIDER" title="Post a new job" sub="Add a demo job to your SmartRecruit provider account."/><div className="card form-card"><h3>Job information</h3><p>Fill these details and the new fake job will immediately appear in Job Postings.</p><div className="form-grid"><Field l="Job title" v={data.title} set={v=>update("title",v)}/><Field l="Company" v={data.company} set={v=>update("company",v)}/><Field l="Location" v={data.location} set={v=>update("location",v)}/><Field l="Employment type" v={data.type} set={v=>update("type",v)}/><Field l="Salary range" v={data.salary} set={v=>update("salary",v)}/><Field l="Skills (comma separated)" v={data.skills} set={v=>update("skills",v)}/></div><div className="form-actions"><button className="outline">Save draft</button><button className="primary" onClick={()=>onPost({...data,title:data.title||"Software Developer",company:data.company||"SmartRecruit Demo"})}>Publish Job →</button></div></div></>}

function Candidates({notify}){const c=[["Priya Sharma","Senior Java Developer","Java · Spring Boot · AWS","92%"],["Rahul Reddy","Backend Engineer","Java · Microservices · Docker","89%"],["Sneha Patel","Full Stack Developer","React · Node.js · SQL","86%"],["Vikram Singh","Software Engineer","Java · Kafka · Kubernetes","81%"]];return <><Title kicker="TALENT POOL" title="Candidates" sub="Demo candidate data for your provider dashboard."/><div className="candidate-list">{c.map(x=><div className="candidate"><div className="profile-avatar small">{initials(x[0])}</div><div className="candidate-info"><h3>{x[0]}</h3><p>{x[1]}</p><div className="chips">{x[2].split(" · ").map(s=><span>{s}</span>)}</div></div><div className="match"><b>{x[3]}</b><small>match</small></div><button className="outline" onClick={()=>notify("Candidate profile opened")}>View</button><button className="primary" onClick={()=>notify(x[0]+" shortlisted")}>Shortlist</button></div>)}</div></>}

function Field({l,v,set}){
  const props = set ? { value: v ?? "", onChange: e => set(e.target.value) } : { defaultValue: v ?? "" };
  return <label className="field"><span>{l}</span><input {...props}/></label>;
}

createRoot(document.getElementById("root")).render(<App/>);
