let logs = [];

// استدعاء المستخدمين من الذاكرة، وإذا لم يوجد ننشئ مستخدم افتراضي (admin / 123)
let users = JSON.parse(localStorage.getItem('systemUsers')) || { "admin": "123" };

// استدعاء الستايل المحفوظ عند تحميل الصفحة
let currentTheme = localStorage.getItem('systemTheme') || 'light';
applyTheme(currentTheme);

// دالة تسجيل الدخول (تم تعديلها لتتحقق من الباسورد)
function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    // التحقق هل المستخدم موجود وهل الباسورد مطابق؟
    if (users[user] && users[user] === pass) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("revenue");
    } else {
        alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة!");
    }
}

// دالة التنقل بين الصفحات
function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.style.display = "none";
    });
    document.getElementById(page).style.display = "block";
}

// دالة إضافة أو تغيير الباسورد للمستخدم
function addUser() {
    let newUser = document.getElementById("newUsername").value;
    let newPass = document.getElementById("newPassword").value;

    if (newUser === "" || newPass === "") {
        alert("⚠️ يرجى إدخال اسم المستخدم وكلمة المرور.");
        return;
    }

    // إضافة أو تحديث المستخدم في الكائن
    users[newUser] = newPass;
    // حفظ في ذاكرة المتصفح
    localStorage.setItem('systemUsers', JSON.stringify(users));
    
    alert("✅ تم حفظ بيانات المستخدم بنجاح!");
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
}

// دالة تغيير الستايل (Theme)
function changeTheme() {
    let theme = document.getElementById("themeSelect").value;
    applyTheme(theme);
    // حفظ الستايل في الذاكرة
    localStorage.setItem('systemTheme', theme);
}

// دالة تطبيق الستايل على الموقع
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    let themeSelect = document.getElementById("themeSelect");
    if(themeSelect) {
        themeSelect.value = theme;
    }
}

// دالة حفظ الإيراد
function saveData() {
    let date = document.getElementById("date").value;
    let employee = document.getElementById("employee").value;
    let revenue = document.getElementById("revenueValue").value;
    let machine = document.getElementById("machine").value;
    let withdraw = document.getElementById("withdraw").value;
    let note = document.getElementById("note").value;

    let log = {
        date, employee, revenue, machine, withdraw, note,
        time: new Date().toLocaleString()
    }

    logs.push(log);
    alert("تم الحفظ بنجاح");
}

// دالة عرض السجل
function showLogs() {
    showPage("logs");
    let container = document.getElementById("logContainer");
    container.innerHTML = "";
    logs.forEach(l => {
        let div = document.createElement("div");
        div.className = "log-item";
        div.innerHTML = `
            التاريخ: ${l.date}<br>
            الموظف: ${l.employee}<br>
            الايراد: ${l.revenue}<br>
            السحب: ${l.withdraw}<br>
            الوقت: ${l.time}
        `;
        container.appendChild(div);
    });
}
