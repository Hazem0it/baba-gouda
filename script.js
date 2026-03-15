
let logs = [];

function login(){

document.getElementById("loginPage").style.display="none";
document.getElementById("dashboard").style.display="block";

showPage("revenue");

}



function showPage(page){

document.querySelectorAll(".page").forEach(p=>{

p.style.display="none";

})

document.getElementById(page).style.display="block";

}



function saveData(){

let date=document.getElementById("date").value
let employee=document.getElementById("employee").value
let revenue=document.getElementById("revenueValue").value
let machine=document.getElementById("machine").value
let withdraw=document.getElementById("withdraw").value
let note=document.getElementById("note").value

let log={

date,
employee,
revenue,
machine,
withdraw,
note,
time:new Date().toLocaleString()

}

logs.push(log)

alert("تم الحفظ")

}



function showLogs(){

showPage("logs")

let container=document.getElementById("logContainer")

container.innerHTML=""

logs.forEach(l=>{

let div=document.createElement("div")

div.className="log-item"

div.innerHTML=`

التاريخ: ${l.date}<br>
الموظف: ${l.employee}<br>
الايراد: ${l.revenue}<br>
السحب: ${l.withdraw}<br>
الوقت: ${l.time}

`

container.appendChild(div)

})

}