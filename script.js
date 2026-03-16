let logs = [];

// استدعاء المستخدمين، الستايل، وحالة تسجيل الدخول
let users = JSON.parse(localStorage.getItem('systemUsers')) || { "admin": "123" };
let currentTheme = localStorage.getItem('systemTheme') || 'light';
applyTheme(currentTheme);

// التحقق عند تحميل الصفحة إذا كان المستخدم مسجل دخول بالفعل
window.onload = function() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("revenue");
    }
    renderUsersList(); // تحديث قائمة المستخدمين في الإعدادات
}

function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    if (users[user] && users[user] === pass) {
        // حفظ حالة الدخول في المتصفح
        localStorage.setItem('loggedInUser', user);
        
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("revenue");
    } else {
        alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة!");
    }
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('loggedInUser'); // مسح حالة الدخول
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
    
    // تفريغ حقول الدخول
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
    
    renderUsersList(); // تحديث القائمة فوراً بعد الإضافة
}

// دالة عرض وحذف المستخدمين
function renderUsersList() {
    let container = document.getElementById("usersListContainer");
    if (!container) return;
    container.innerHTML = "";
    
    for (let username in users) {
        let div = document.createElement("div");
        div.className = "user-item";
        
        // عرض اسم المستخدم
        let userText = `<span>👤 ${username}</span>`;
        
        // إضافة زر حذف (نمنع حذف حساب admin لكي لا تغلق النظام على نفسك)
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

// دالة حذف مستخدم
function deleteUser(username) {
    if (confirm(`هل أنت متأكد أنك تريد حذف المستخدم: ${username}؟`)) {
        delete users[username]; // مسح من الكائن
        localStorage.setItem('systemUsers', JSON.stringify(users)); // تحديث الذاكرة
        renderUsersList(); // تحديث القائمة المعروضة
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

function saveData() {
    let date = document.getElementById("date").value;
    let employee = document.getElementById("employee").value;
    let revenue = document.getElementById("revenueValue").value;
    let machine = document.getElementById("machine").value;
    let withdraw = document.getElementById("withdraw").value;
    let note = document.getElementById("note").value;

    let log = { date, employee, revenue, machine, withdraw, note, time: new Date().toLocaleString() }
    logs.push(log);
    alert("تم الحفظ بنجاح");
}

function showLogs() {
    showPage("logs");
    let container = document.getElementById("logContainer");
    container.innerHTML = "";
    logs.forEach(l => {
        let div = document.createElement("div");
        div.className = "log-item";
        div.innerHTML = `التاريخ: ${l.date}<br>الموظف: ${l.employee}<br>الايراد: ${l.revenue}<br>السحب: ${l.withdraw}<br>الوقت: ${l.time}`;
        container.appendChild(div);
    });
}
