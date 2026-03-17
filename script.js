const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXX4mIc2iEnbUDYDUMqYX6mY1gIJD92x_zZprDD8xi_doxNJj115oaxL0ncDlr2LCcXg/exec"; 

let logs = [];
let users = JSON.parse(localStorage.getItem('systemUsers')) || { "admin": "123" };
let currentTheme = localStorage.getItem('systemTheme') || 'light';
applyTheme(currentTheme);

let idleTimeout;
const IDLE_TIME_LIMIT = 2 * 60 * 60 * 1000;

function resetIdleTimer() {
    if (localStorage.getItem('loggedInUser')) {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(autoLogout, IDLE_TIME_LIMIT);
    }
}

function autoLogout() {
    alert("⏳ تم تسجيل الخروج تلقائياً نظراً لعدم وجود نشاط.");
    logout();
}

document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
document.addEventListener('click', resetIdleTimer);
document.addEventListener('scroll', resetIdleTimer);

window.onload = function() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("home");
        loadTotals();
        resetIdleTimer();
    }
    renderUsersList();
}

function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    if (users[user] && users[user] === pass) {
        localStorage.setItem('loggedInUser', user);
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("home");
        loadTotals();
        resetIdleTimer();
    } else {
        alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة!");
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    clearTimeout(idleTimeout);
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

// دالة جلب الأرقام مع معالجة الأخطاء
async function loadTotals() {
    if(!GOOGLE_SCRIPT_URL.startsWith("http")) {
        alert("⚠️ لم تقم بوضع رابط جوجل شيت في ملف script.js");
        return;
    }
    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, { redirect: "follow" });
        let result = await response.json();
        
        if(result.status === "success") {
            document.getElementById("total-refaat").innerText = result.data["رفعت"];
            document.getElementById("total-mohamed").innerText = result.data["محمد"];
            document.getElementById("total-mahmoud").innerText = result.data["محمود"];
            document.getElementById("total-hazem").innerText = result.data["حازم"];
            let totalAll = document.getElementById("total-all");
            if(totalAll) totalAll.innerText = result.data["المجموع"];
        } else {
            alert("❌ خطأ من الشيت: " + result.message);
        }
    } catch (error) {
        alert("❌ تعذر الاتصال بجوجل شيت. تأكد من الرابط أو من اتصال الإنترنت.");
        document.getElementById("total-refaat").innerText = "خطأ اتصال";
        document.getElementById("total-mohamed").innerText = "خطأ اتصال";
        document.getElementById("total-mahmoud").innerText = "خطأ اتصال";
        document.getElementById("total-hazem").innerText = "خطأ اتصال";
    }
}

// حفظ الإيراد
async function saveData() {
    let year = document.getElementById("year").value;
    let date = document.getElementById("date").value;
    let employee = document.getElementById("employee").value;
    let revenue = document.getElementById("revenueValue").value;
    let machine = document.getElementById("machine").value;
    let withdraw = document.getElementById("withdraw").value;
    let note = document.getElementById("note").value;

    if(!date || !employee || !revenue) {
        alert("⚠️ يرجى إدخال التاريخ واسم الموظف والإيراد!");
        return;
    }

    let dataToSend = { action: "addRevenue", year: year, date: date, employee: employee, revenue: revenue, machine: machine, withdraw: withdraw, note: note };
    
    let btn = document.querySelector("#revenue .btn-primary");
    let originalText = btn.innerText;
    btn.innerText = "⏳ جاري الحفظ...";
    btn.disabled = true;

    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(dataToSend)
        });
        
        let result = await response.json();
        if(result.status === "success") {
            alert("تم حفظ الإيراد بنجاح في شيت " + year + " ✅");
            logs.push({ type: "إيراد", date, employee, revenue, machine, withdraw, note, time: new Date().toLocaleString() });
        } else {
            alert("❌ فشل الحفظ: " + result.message);
        }
    } catch(error) {
        alert("❌ خطأ في الاتصال بالسيرفر.");
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

// حفظ المديونية
async function saveDebt() {
    let date = document.getElementById("debtDate").value;
    let client = document.getElementById("debtClient").value; 
    let amount = document.getElementById("debtAmount").value;
    let note = document.getElementById("debtNote").value;

    if(!date || !client || !amount) {
        alert("⚠️ يرجى إدخال التاريخ، اسم الموظف، والمبلغ!");
        return;
    }

    let dataToSend = { action: "addDebt", date: date, employee: client, amount: amount, note: note };
    
    let btn = document.querySelector("#debt .btn-primary");
    let originalText = btn.innerText;
    btn.innerText = "⏳ جاري الحفظ...";
    btn.disabled = true;

    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(dataToSend)
        });
        
        let result = await response.json();
        if(result.status === "success") {
            alert("تم حفظ المديونية بنجاح ✅");
            logs.push({ type: "مديونية", date: date, client: client, amount: amount, note: note, time: new Date().toLocaleString() });
            loadTotals(); // تحديث الأرقام فوراً
        } else {
            alert("❌ فشل الحفظ: " + result.message);
        }
    } catch(error) {
        alert("❌ خطأ في الاتصال بالسيرفر.");
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

// باقي الأكواد الأساسية
function showLogs() {
    showPage("logs");
    let container = document.getElementById("logContainer");
    container.innerHTML = "";
    let reversedLogs = [...logs].reverse();
    reversedLogs.forEach(l => {
        let div = document.createElement("div");
        div.className = "log-item";
        div.style.borderRight = l.type === "إيراد" ? "5px solid #2ecc71" : "5px solid #e74c3c";
        div.innerHTML = `<strong>[${l.type}]</strong><br>التاريخ: ${l.date}<br>الاسم: ${l.employee || l.client}<br>الوقت: ${l.time}`;
        container.appendChild(div);
    });
}
function addUser() { /* محتوى دالة إضافة مستخدم كما كان */ }
function renderUsersList() { /* محتوى دالة المستخدمين كما كان */ }
function deleteUser(username) { /* محتوى دالة الحذف كما كان */ }
function changeTheme() { /* محتوى تغيير الستايل كما كان */ }
function applyTheme(theme) { /* تطبيق الستايل كما كان */ }
