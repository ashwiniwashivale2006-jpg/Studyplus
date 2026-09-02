const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join('/tmp', 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [{id:"demo", name:"Ashwini", email:"ashwini@example.com", password:hash("demo123")}],
      subjects: [
        {id:"s1", userId:"demo", name:"Data Structures", description:"Linked lists, stacks, queues and trees", progress:82},
        {id:"s2", userId:"demo", name:"Web Development", description:"HTML, CSS and JavaScript", progress:74},
        {id:"s3", userId:"demo", name:"Computer Organization", description:"CPU, memory and I/O", progress:61},
        {id:"s4", userId:"demo", name:"Environmental Studies", description:"Environment and sustainability", progress:49}
      ],
      tasks: [
        {id:"t1", userId:"demo", title:"Complete Linked List Notes", subjectId:"s1", deadline:"2026-09-02", priority:"High", status:"Completed"},
        {id:"t2", userId:"demo", title:"Practice JavaScript Functions", subjectId:"s2", deadline:"2026-09-02", priority:"Medium", status:"Pending"},
        {id:"t3", userId:"demo", title:"Revise CPU Organization", subjectId:"s3", deadline:"2026-09-02", priority:"Low", status:"Pending"},
        {id:"t4", userId:"demo", title:"Read Environmental Protection Act", subjectId:"s4", deadline:"2026-09-03", priority:"Medium", status:"Pending"}
      ]
    };
    saveDB(initial);
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function saveDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }
function hash(v){ return crypto.createHash("sha256").update(v).digest("hex"); }
function id(){ return crypto.randomUUID(); }

app.post("/api/register",(req,res)=>{
  const {name,email,password}=req.body;
  if(!name||!email||!password) return res.status(400).json({message:"All fields are required"});
  const db=loadDB();
  if(db.users.some(u=>u.email.toLowerCase()===email.toLowerCase())) return res.status(409).json({message:"Email already registered"});
  const user={id:id(),name,email,password:hash(password)};
  db.users.push(user); saveDB(db);
  res.status(201).json({user:{id:user.id,name:user.name,email:user.email}});
});
app.post("/api/login",(req,res)=>{
  const {email,password}=req.body, db=loadDB();
  const user=db.users.find(u=>u.email.toLowerCase()===String(email).toLowerCase() && u.password===hash(String(password)));
  if(!user) return res.status(401).json({message:"Invalid email or password"});
  res.json({user:{id:user.id,name:user.name,email:user.email}});
});
app.get("/api/dashboard",(req,res)=>{
  const userId=req.query.userId||"demo",db=loadDB();
  const subjects=db.subjects.filter(s=>s.userId===userId);
  const tasks=db.tasks.filter(t=>t.userId===userId);
  const enriched=tasks.map(t=>({...t,subject:subjects.find(s=>s.id===t.subjectId)?.name||"General"}));
  res.json({subjects,tasks:enriched,stats:{total:tasks.length,pending:tasks.filter(t=>t.status!=="Completed").length,completed:tasks.filter(t=>t.status==="Completed").length}});
});
app.get("/api/subjects",(req,res)=>{const db=loadDB();res.json(db.subjects.filter(s=>s.userId===(req.query.userId||"demo")));});
app.post("/api/subjects",(req,res)=>{
  const {userId="demo",name,description=""}=req.body;if(!name)return res.status(400).json({message:"Subject name required"});
  const db=loadDB(),s={id:id(),userId,name,description,progress:0};db.subjects.push(s);saveDB(db);res.status(201).json(s);
});
app.put("/api/subjects/:id",(req,res)=>{
  const db=loadDB(),s=db.subjects.find(x=>x.id===req.params.id);if(!s)return res.sendStatus(404);
  Object.assign(s,{name:req.body.name??s.name,description:req.body.description??s.description,progress:Math.max(0,Math.min(100,Number(req.body.progress??s.progress)))});
  saveDB(db);res.json(s);
});
app.delete("/api/subjects/:id",(req,res)=>{
  const db=loadDB();db.subjects=db.subjects.filter(s=>s.id!==req.params.id);db.tasks=db.tasks.filter(t=>t.subjectId!==req.params.id);saveDB(db);res.sendStatus(204);
});
app.get("/api/tasks",(req,res)=>{const db=loadDB(),subjects=db.subjects;let list=db.tasks.filter(t=>t.userId===(req.query.userId||"demo")).map(t=>({...t,subject:subjects.find(s=>s.id===t.subjectId)?.name||"General"}));if(req.query.status)list=list.filter(t=>t.status===req.query.status);res.json(list);});
app.post("/api/tasks",(req,res)=>{
  const {userId="demo",title,description="",subjectId,deadline,priority="Medium"}=req.body;
  if(!title||!subjectId||!deadline)return res.status(400).json({message:"Title, subject and deadline are required"});
  const db=loadDB(),t={id:id(),userId,title,description,subjectId,deadline,priority,status:"Pending"};db.tasks.push(t);saveDB(db);res.status(201).json(t);
});
app.put("/api/tasks/:id",(req,res)=>{
  const db=loadDB(),t=db.tasks.find(x=>x.id===req.params.id);if(!t)return res.sendStatus(404);
  ["title","description","subjectId","deadline","priority","status"].forEach(k=>{if(req.body[k]!==undefined)t[k]=req.body[k]});
  saveDB(db);res.json(t);
});
app.patch("/api/tasks/:id/toggle",(req,res)=>{
  const db=loadDB(),t=db.tasks.find(x=>x.id===req.params.id);if(!t)return res.sendStatus(404);
  t.status=t.status==="Completed"?"Pending":"Completed";saveDB(db);res.json(t);
});
app.delete("/api/tasks/:id",(req,res)=>{const db=loadDB();db.tasks=db.tasks.filter(t=>t.id!==req.params.id);saveDB(db);res.sendStatus(204);});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`StudyPulse running at http://localhost:${PORT}`));
