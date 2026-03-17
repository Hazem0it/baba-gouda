let logs = [];

// استدعاء المستخدمين، الستايل، وحالة تسجيل الدخول
let users = JSON.parse(localStorage.getItem('systemUsers')) || { "admin": "123" };
let currentTheme = localStorage.getItem('systemTheme') || 'light';
applyTheme(currentTheme);

// ==========================================
// نظام تسجيل الخروج التلقائي عند الخمول
// ==========================================
let idleTimeout;
const IDLE_TIME_LIMIT = 2 * 60 * 60 * 1000; // ساعتين (بالميلي ثانية)

// دالة تصفير العداد
function resetIdleTimer() {
    // نقوم بتشغيل العداد فقط إذا كان المستخدم مسجل الدخول بالفعل
    if (localStorage.getItem('loggedInUser')) {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(autoLogout, IDLE_TIME_LIMIT);
    }
}

// دالة الخروج التلقائي التي ستعمل عند انتهاء الساعتين
function autoLogout() {
    alert("⏳ تم تسجيل الخروج تلقائياً نظراً لعدم وجود نشاط لمدة ساعتين.");
    logout();
}

// مراقبة نشاط المستخدم (حركة ماوس، كيبورد، نقر، سكرول) لتصفير العداد
document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
document.addEventListener('click', resetIdleTimer);
document.addEventListener('scroll', resetIdleTimer);
// ==========================================

window.onload = function() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("revenue");
        resetIdleTimer(); // تشغيل العداد فور فتح الصفحة إذا كان مسجل دخول
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
        showPage("revenue");
        
        resetIdleTimer(); // بدء العداد عند تسجيل الدخول بنجاح
    } else {
        alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة!");
    }
}

function logout() {
    localStorage.removeItem('loggedInUser');
    clearTimeout(idleTimeout); // إيقاف العداد عند تسجيل الخروج
    
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.style.display = "none";
    });
    document.getElementById(page).style.display = "block";
}

function addUser() {
    let newUser = document.getElementById("newUsername").value;
    let newPass = document.getElementById("newPassword").value;

    if (newUser === "" || newPass === "") {
        alert("⚠️ يرجى إدخال اسم المستخدم وكلمة المرور.");
        return;
    }

    users[newUser] = newPass;
    localStorage.setItem('systemUsers', JSON.stringify(users));
    
    alert("✅ تم حفظ بيانات المستخدم بنجاح!");
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
    renderUsersList();
}

function renderUsersList() {
    let container = document.getElementById("usersListContainer");
    if (!container) return;
    container.innerHTML = "";
    
    for (let username in users) {
        let div = document.createElement("div");
        div.className = "user-item";
        let userText = `<span>👤 ${username}</span>`;
        let deleteBtn = "";
        if (username !== 'admin') {
            deleteBtn = `<button class="btn-delete" onclick="deleteUser('${username}')">حذف</button>`;
        } else {
            deleteBtn = `<span style="color:#7f8c8d; font-size:12px;">(حساب رئيسي)</span>`;
        }
        div.innerHTML = userText + deleteBtn;
        container.appendChild(div);
    }
}

function deleteUser(username) {
    if (confirm(`هل أنت متأكد أنك تريد حذف المستخدم: ${username}؟`)) {
        delete users[username];
        localStorage.setItem('systemUsers', JSON.stringify(users));
        renderUsersList();
    }
}

function changeTheme() {
    let theme = document.getElementById("themeSelect").value;
    applyTheme(theme);
    localStorage.setItem('systemTheme', theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    let themeSelect = document.getElementById("themeSelect");
    if(themeSelect) themeSelect.value = theme;
}

// ==========================================
// قسم العمليات (الإيراد والمديونية والسجل)
// ==========================================

function saveData() {
    let date = document.getElementById("date").value;
    let employee = document.getElementById("employee").value;
    let revenue = document.getElementById("revenueValue").value;
    let machine = document.getElementById("machine").value;
    let withdraw = document.getElementById("withdraw").value;
    let note = document.getElementById("note").value;

    let log = {
        type: "إيراد", 
        date, employee, revenue, machine, withdraw, note,
        time: new Date().toLocaleString()
    }

    logs.push(log);
    alert("تم حفظ الإيراد بنجاح ✅");
}

function saveDebt() {
    let date = document.getElementById("debtDate").value;
    let client = document.getElementById("debtClient").value;
    let amount = document.getElementById("debtAmount").value;
    let note = document.getElementById("debtNote").value;

    if(!client || !amount) {
        alert("⚠️ يرجى إدخال اسم العميل والمبلغ على الأقل!");
        return;
    }

    let log = {
        type: "مديونية", 
        date: date,
        client: client,
        amount: amount,
        note: note,
        time: new Date().toLocaleString()
    }

    logs.push(log);
    alert("تم تسجيل المديونية بنجاح ✅");
    
    document.getElementById("debtClient").value = "";
    document.getElementById("debtAmount").value = "";
    document.getElementById("debtNote").value = "";
}

function showLogs() {
    showPage("logs");
    let container = document.getElementById("logContainer");
    container.innerHTML = "";
    
    let reversedLogs = [...logs].reverse();

    reversedLogs.forEach(l => {
        let div = document.createElement("div");
        div.className = "log-item";
        
        if (l.type === "إيراد") {
            div.style.borderRight = "5px solid #2ecc71";
            div.innerHTML = `
                <strong style="color: #2ecc71;">[إيراد جديد]</strong><br>
                التاريخ: ${l.date}<br>
                الموظف: ${l.employee}<br>
                الايراد: ${l.revenue} | السحب: ${l.withdraw}<br>
                الملاحظة: ${l.note}<br>
                <small style="color:gray;">الوقت: ${l.time}</small>
            `;
        } else if (l.type === "مديونية") {
            div.style.borderRight = "5px solid #e74c3c";
            div.innerHTML = `
                <strong style="color: #e74c3c;">[مديونية جديدة]</strong><br>
                التاريخ: ${l.date}<br>
                اسم العميل: ${l.client}<br>
                المبلغ: ${l.amount}<br>
                الملاحظة: ${l.note}<br>
                <small style="color:gray;">الوقت: ${l.time}</small>
            `;
        }
        
        container.appendChild(div);
    });
}
