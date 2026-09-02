let currentUser=JSON.parse(localStorage.getItem("studypulseUser"))||{id:"demo",name:"Ashwini",email:"ashwini@example.com"};
let tasks=[],subjects=[];
const $=s=>document.querySelector(s);
async function api(url,opt={}){const r=await fetch(url,{headers:{"Content-Type":"application/json"},...opt});if(!r.ok)throw new Error((await r.json().catch(()=>({message:"Request failed"}))).message);return r.status===204?null:r.json();}
function setUserName(){document.querySelectorAll(".profile b").forEach(x=>x.textContent=currentUser.name);const h=document.querySelector(".welcome h1");if(h)h.innerHTML=`Good afternoon, ${currentUser.name}! 👋`;}
async function refresh(){
 const d=await api(`/api/dashboard?userId=${currentUser.id}`);tasks=d.tasks;subjects=d.subjects;
 $("#totalTasks").textContent=d.stats.total;$("#pendingTasks").textContent=d.stats.pending;$("#completedTasks").textContent=d.stats.completed;
 renderTaskList($("#taskList"),tasks.filter(t=>t.deadline==="2026-09-02").slice(0,5));renderTaskList($("#allTasks"),tasks);renderSubjects();
}
function renderTaskList(target,list){if(!target)return;target.innerHTML=list.length?list.map(t=>`<div class="task ${t.status==="Completed"?"done":""}"><button class="check" data-id="${t.id}">${t.status==="Completed"?"✓":""}</button><div class="task-info"><span class="task-name">${t.title}</span><span class="task-meta">${t.subject} · ${t.deadline}</span></div><em class="tag ${t.priority.toLowerCase()}">${t.priority}</em></div>`).join(""):`<div style="padding:20px;color:#999;font-size:12px">No tasks found.</div>`;target.querySelectorAll(".check").forEach(b=>b.onclick=async()=>{await api(`/api/tasks/${b.dataset.id}/toggle`,{method:"PATCH"});await refresh();});}
function renderSubjects(){const grid=document.querySelector(".subject-grid");if(!grid)return;grid.innerHTML=subjects.map(s=>`<div class="subject-card"><h2>${s.name}</h2><p>${s.description||"No description"} </p><div class="row"><b>Progress</b><span>${s.progress}%</span></div><div class="bar"><i style="width:${s.progress}%"></i></div></div>`).join("");}
function showPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));$("#"+id)?.classList.add("active-page");document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===id));}
document.querySelectorAll(".nav-item[data-page]").forEach(n=>n.onclick=()=>showPage(n.dataset.page));
document.querySelectorAll("[data-page-link]").forEach(n=>n.onclick=()=>showPage(n.dataset.pageLink));
const modal=$("#modal");function openModal(){modal.classList.add("show");populateSubjects()}function closeModal(){modal.classList.remove("show")}
function populateSubjects(){$("#taskSubject").innerHTML=subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}
$("#addTaskBtn").onclick=openModal;$("#addTaskBtn2").onclick=openModal;$("#closeModal").onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};
$("#taskForm").onsubmit=async e=>{e.preventDefault();await api("/api/tasks",{method:"POST",body:JSON.stringify({userId:currentUser.id,title:$("#taskTitle").value,subjectId:$("#taskSubject").value,deadline:$("#taskDeadline").value,priority:$("#taskPriority").value})});e.target.reset();closeModal();await refresh();showPage("tasks");};
$("#searchInput").oninput=e=>{const q=e.target.value.toLowerCase();renderTaskList($("#allTasks"),tasks.filter(t=>(t.title+" "+t.subject).toLowerCase().includes(q)));showPage("tasks");};
setUserName();refresh().catch(err=>alert("Start the backend with: npm start\n\n"+err.message));