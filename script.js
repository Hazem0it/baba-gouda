// ⚠️ ضع الرابط الذي نسخته من جوجل هنا بين علامتي التنصيص
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXX4mIc2iEnbUDYDUMqYX6mY1gIJD92x_zZprDD8xi_doxNJj115oaxL0ncDlr2LCcXg/exec"; 

// تعريف مصفوفة السجل (ستكون فارغة في البداية وسيتم جلبها من جوجل)
let logs = [];

// استدعاء المستخدمين والستايل من ذاكرة المتصفح
let users = JSON.parse(localStorage.getItem('systemUsers')) || { "admin": "123" };
let currentTheme = localStorage.getItem('systemTheme') || 'light';
applyTheme(currentTheme);

// ==========================================
// نظام تسجيل الخروج التلقائي
// ==========================================
let idleTimeout;
const IDLE_TIME_LIMIT = 2 * 60 * 60 * 1000; // ساعتين بالميلي ثانية

function resetIdleTimer() {
    if (localStorage.getItem('loggedInUser')) {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(autoLogout, IDLE_TIME_LIMIT);
    }
}

function autoLogout() {
    alert("⏳ تم تسجيل الخروج تلقائياً نظراً لعدم وجود نشاط لمدة ساعتين.");
    logout();
}

document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
document.addEventListener('click', resetIdleTimer);
document.addEventListener('scroll', resetIdleTimer);

// ==========================================
// أحداث عند تحميل الصفحة
// ==========================================
window.onload = function() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("home");
        loadTotals(); // جلب الأرقام واللوج من جوجل
        resetIdleTimer();
    }
    renderUsersList();
}

// ==========================================
// نظام الدخول والخروج والتنقل
// ==========================================
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
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

// ==========================================
// جلب البيانات من جوجل (المجاميع + اللوج)
// ==========================================
async function loadTotals() {
    if(!GOOGLE_SCRIPT_URL.startsWith("http")) {
        console.warn("⚠️ لم يتم وضع رابط جوجل شيت.");
        return;
    }
    
    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, { redirect: "follow" });
        let result = await response.json();
        
        if(result.status === "success") {
            // تحديث مربعات الأرقام في الرئيسية
            document.getElementById("total-refaat").innerText = result.data["رفعت"];
            document.getElementById("total-mohamed").innerText = result.data["محمد"];
            document.getElementById("total-mahmoud").innerText = result.data["محمود"];
            document.getElementById("total-hazem").innerText = result.data["حازم"];
            let totalAll = document.getElementById("total-all");
            if(totalAll) totalAll.innerText = result.data["المجموع"];

            // سحب السجل (اللوج) من جوجل وحفظه في الموقع
            logs = result.logs || []; 
        } else {
            console.error("خطأ من الشيت: " + result.message);
        }
    } catch (error) {
        console.error("خطأ في الاتصال بالسيرفر:", error);
    }
}

// ==========================================
// تسجيل الإيراد والمديونية
// ==========================================
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
    btn.innerText = "⏳ جاري الحفظ في السحابة...";
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
            alert("تم حفظ الإيراد بنجاح ✅");
            
            // تصفير الخانات
            document.getElementById("date").value = "";
            document.getElementById("revenueValue").value = "";
            document.getElementById("machine").value = "";
            document.getElementById("withdraw").value = "";
            document.getElementById("note").value = "";

            loadTotals(); // تحديث اللوج والمجاميع فوراً من جوجل
        } else {
            alert("❌ فشل الحفظ: " + result.message);
        }
    } catch(error) {
        alert("❌ خطأ في الاتصال بالسيرفر.");
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

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
    btn.innerText = "⏳ جاري الحفظ في السحابة...";
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
            
            // تصفير الخانات
            document.getElementById("debtDate").value = "";
            document.getElementById("debtClient").value = "";
            document.getElementById("debtAmount").value = "";
            document.getElementById("debtNote").value = "";

            loadTotals(); // تحديث الأرقام واللوج فوراً من جوجل
        } else {
            alert("❌ فشل الحفظ: " + result.message);
        }
    } catch(error) {
        alert("❌ خطأ في الاتصال بالسيرفر.");
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

// ==========================================
// عرض السجل (اللوج)
// ==========================================
function showLogs() {
    showPage("logs");
    let container = document.getElementById("logContainer");
    container.innerHTML = "";
    
    // عرض الأحدث أولاً
    let reversedLogs = [...logs].reverse();

    if(reversedLogs.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>لا توجد سجلات محفوظة حتى الآن.</p>";
        return;
    }

    reversedLogs.forEach(l => {
        let div = document.createElement("div");
        div.className = "log-item";
        
        let displayDate = l.date;
        if(l.date && String(l.date).includes("T")) {
            displayDate = new Date(l.date).toLocaleDateString('ar-EG');
        }

        if (l.type === "إيراد") {
            div.style.borderRight = "5px solid #2ecc71";
            div.innerHTML = `
                <strong style="color: #2ecc71;">[إيراد]</strong><br>
                التاريخ: ${displayDate}<br>
                الموظف: ${l.name}<br>
                الايراد: ${l.amount} | السحب: ${l.withdraw || "0"}<br>
                الملاحظة: ${l.note}<br>
                <small style="color:gray;">وقت التسجيل: ${l.time}</small>
            `;
        } else {
            div.style.borderRight = "5px solid #e74c3c";
            div.innerHTML = `
                <strong style="color: #e74c3c;">[مديونية]</strong><br>
                التاريخ: ${displayDate}<br>
                الموظف: ${l.name}<br>
                المبلغ: ${l.amount}<br>
                الملاحظة: ${l.note}<br>
                <small style="color:gray;">وقت التسجيل: ${l.time}</small>
            `;
        }
        container.appendChild(div);
    });
}

// ==========================================
// إدارة المستخدمين والستايل
// ==========================================
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
