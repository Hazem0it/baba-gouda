// ⚠️ ضع الرابط الجديد الخاص بجوجل شيت هنا (بعد عمل New Deployment)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxmzEOPoZbep-cSd8Oi2-4-qBezk09HdO0TFOS8MBmleQuU-du75sFJsRu5e839TaoaZw/exec"; 

let logs = [];
let users = JSON.parse(localStorage.getItem('systemUsers')) || { "admin": "123" };
let currentTheme = localStorage.getItem('systemTheme') || 'light';
applyTheme(currentTheme);

let idleTimeout;
const IDLE_TIME_LIMIT = 2 * 60 * 60 * 1000; 

// قائمة الموظفين بقت ديناميكية (هتتملي من جوجل شيت)
let EMPLOYEE_NAMES = [];

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
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(page).style.display = "block";
}

function updateStatValue(id, value) {
    let el = document.getElementById(id);
    if(el) {
        el.setAttribute('data-val', value);
        if(el.innerText !== '****' && el.innerText !== 'جاري التحميل...') {
            el.innerText = value;
        } else {
            el.innerText = '****'; 
        }
    }
}

function toggleVisibility(id, iconEl) {
    let el = document.getElementById(id);
    if(!el || !el.hasAttribute('data-val') || el.getAttribute('data-val') === "") return; 
    
    if (el.innerText === '****') {
        el.innerText = el.getAttribute('data-val');
        iconEl.innerText = '🙈'; 
    } else {
        el.innerText = '****';
        iconEl.innerText = '👁️'; 
    }
}

async function loadTotals() {
    if(!GOOGLE_SCRIPT_URL.startsWith("http")) return;
    try {
        let response = await fetch(GOOGLE_SCRIPT_URL, { redirect: "follow" });
        let result = await response.json();
        
        if(result.status === "success") {
            updateStatValue("total-refaat", result.data["رفعت"]);
            updateStatValue("total-mohamed", result.data["محمد"]);
            updateStatValue("total-mahmoud", result.data["محمود"]);
            updateStatValue("total-hazem", result.data["حازم"]);
            updateStatValue("total-all", result.data["المجموع"]);

            logs = result.logs || []; 
        }
    } catch (error) {
        console.error("خطأ في الاتصال:", error);
    }
}

function getBase64(file) {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = () => resolve(reader.result.split(',')[1]);
     reader.onerror = error => reject(error);
   });
}

async function loadAllEmployeesData() {
    let year = document.getElementById("year").value;
    let date = document.getElementById("date").value;
    let container = document.getElementById("allEmployeesContainer");
    let statusText = document.getElementById("checkStatus");
    let saveBtn = document.getElementById("saveAllBtn");

    if(!date) return; 

    // إخفاء الزرار وتفريغ الشاشة لحد ما نجيب الداتا
    saveBtn.style.display = "none";
    container.innerHTML = "";

    // الخطوة الأولى: جلب أسماء الموظفين من الشيت ديناميكياً
    statusText.innerText = "⏳ جاري قراءة أسماء الموظفين من الشيت...";
    statusText.style.color = "#3498db";

    try {
        let empResponse = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "getEmployees", year: year })
        });
        
        let empResult = await empResponse.json();
        
        if(empResult.status === "success" && empResult.data.length > 0) {
            EMPLOYEE_NAMES = empResult.data; 
        } else {
            statusText.innerText = "❌ لم يتم العثور على موظفين في شيت هذه السنة.";
            statusText.style.color = "#e74c3c";
            return;
        }
    } catch (error) {
        statusText.innerText = "❌ حدث خطأ أثناء الاتصال بجوجل شيت لجلب الأسماء.";
        statusText.style.color = "#e74c3c";
        return;
    }

    // الخطوة الثانية: جلب بيانات كل موظف
    statusText.innerText = "⏳ جاري فحص السجلات السابقة لجميع الموظفين... برجاء الانتظار";
    statusText.style.color = "#f39c12";

    try {
        let promises = EMPLOYEE_NAMES.map(emp => {
            let dataToSend = { action: "checkRevenue", year: year, date: date, employee: emp };
            return fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                redirect: "follow",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(dataToSend)
            }).then(res => res.json()).then(result => ({ emp, result })).catch(() => ({ emp, result: { status: "error" } }));
        });

        let results = await Promise.all(promises);

        statusText.innerText = "✅ تم جلب البيانات. يمكنك الآن التعديل عليهم جميعاً.";
        statusText.style.color = "#2ecc71";
        saveBtn.style.display = "block";

        results.forEach(item => {
            renderEmployeeBlock(item.emp, item.result);
        });

    } catch (error) {
        statusText.innerText = "❌ حدث خطأ أثناء جلب بيانات الإيراد.";
        statusText.style.color = "#e74c3c";
    }
}

function renderEmployeeBlock(empName, result) {
    let container = document.getElementById("allEmployeesContainer");
    
    let data = (result.status === "success" && result.data) ? result.data : {};
    
    let revVal = data.revenue || "";
    let macOld = data.machine || "0";
    let withVal = data.withdraw || "";
    let noteVal = data.note || "";
    
    let receiptsHtml = "";
    if(data.receiptUrls && data.receiptUrls.length > 0) {
        receiptsHtml = `<div style="margin-top: 15px; background: #e8f4f8; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #bde0fe;">
            <strong style="color:#2c3e50;">📄 المرفقات السابقة:</strong><br>
            <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:8px;">`;
        data.receiptUrls.forEach((url, index) => {
            receiptsHtml += `<a href="${url}" target="_blank" style="background:#2980b9; color:white; padding:5px 15px; border-radius:20px; text-decoration:none; font-size:14px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">🔗 عرض المرفق ${index + 1}</a>`;
        });
        receiptsHtml += `</div></div>`;
    }

    let block = document.createElement("div");
    block.className = "employee-record-block";
    block.dataset.emp = empName;
    
    // التصميم الجديد للكارت
    block.innerHTML = `
        <div class="employee-card">
            <div class="employee-header">
                <span style="font-size: 22px;">👨‍💼</span>
                <h3>الموظف: ${empName}</h3>
            </div>
            
            <div class="employee-body">
                <div class="emp-form-grid">
                    <div class="form-group">
                        <label>💰 قيمة الإيراد</label>
                        <input type="number" class="emp-revenue" placeholder="0" value="${revVal}">
                    </div>
                    
                    <div class="form-group">
                        <label>💳 شحن الماكينة</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="number" class="emp-mac-old" value="${macOld}" disabled style="background:#e9ecef; width: 45%; color: #6c757d; font-weight: bold; text-align:center; border: 1px solid #ced4da;" title="الرصيد التراكمي السابق">
                            <input type="number" class="emp-mac-add" placeholder="+ إضافة شحن" style="width: 55%; border: 2px solid #3498db; text-align:center;">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>📉 السحب</label>
                        <input type="number" class="emp-withdraw" placeholder="0" value="${withVal}">
                    </div>
                    
                    <div class="form-group">
                        <label>📝 الملاحظة</label>
                        <input type="text" class="emp-note" placeholder="اكتب تفاصيل إضافية هنا..." value="${noteVal}">
                    </div>
                    
                    <div class="form-group file-upload-wrapper">
                        <label style="display:block; margin-bottom:10px; color:#7f8c8d; font-weight:bold;">📎 إرفاق إيصالات (اضغط هنا لاختيار الملفات)</label>
                        <input type="file" class="emp-receipt" accept=".pdf,image/*" multiple style="border:none; background:transparent; width: 100%; cursor: pointer;">
                        ${receiptsHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(block);
}

async function saveAllEmployeesData() {
    let year = document.getElementById("year").value;
    let date = document.getElementById("date").value;
    
    if(!date) {
        alert("⚠️ يرجى إدخال التاريخ!");
        return;
    }

    let blocks = document.querySelectorAll(".employee-record-block");
    let activeRequests = [];
    let btn = document.getElementById("saveAllBtn");
    let originalText = btn.innerText;

    for (let block of blocks) {
        let employee = block.dataset.emp;
        let revenue = block.querySelector(".emp-revenue").value;
        let machineAdd = block.querySelector(".emp-mac-add").value;
        let withdraw = block.querySelector(".emp-withdraw").value;
        let note = block.querySelector(".emp-note").value;
        let fileInput = block.querySelector(".emp-receipt");
        let files = fileInput.files;
        
        if(revenue !== "" || machineAdd !== "" || withdraw !== "" || note !== "" || files.length > 0) {
            
            let filesArray = [];
            for(let i=0; i<files.length; i++) {
                let base64 = await getBase64(files[i]);
                filesArray.push({
                    name: files[i].name,
                    mimeType: files[i].type,
                    base64: base64
                });
            }

            activeRequests.push({ 
                action: "addRevenue", year: year, date: date, employee: employee, 
                revenue: revenue, machineAdd: machineAdd, withdraw: withdraw, note: note, files: filesArray 
            });
        }
    }

    if(activeRequests.length === 0) {
        alert("⚠️ لا توجد بيانات جديدة أو معدلة للحفظ!");
        return;
    }

    btn.innerText = `⏳ جاري حفظ بيانات ${activeRequests.length} موظفين في السحابة... (قد يستغرق بعض الوقت)`;
    btn.disabled = true;

    try {
        for (let reqData of activeRequests) {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                redirect: "follow",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(reqData)
            });
        }
        
        alert("تم حفظ بيانات جميع الموظفين بنجاح ✅");
        loadAllEmployeesData(); 
        loadTotals(); 
    } catch(error) {
        alert("❌ حدث خطأ أثناء الرفع! تأكد من اتصال الإنترنت.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
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
            
            document.getElementById("debtDate").value = "";
            document.getElementById("debtClient").value = "";
            document.getElementById("debtAmount").value = "";
            document.getElementById("debtNote").value = "";

            loadTotals(); 
        } else {
            alert("❌ فشل الحفظ: " + result.message);
        }
    } catch(error) {
        alert("❌ خطأ في الاتصال بالسيرفر.");
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

async function showLogs() {
    showPage("logs");
    let container = document.getElementById("logContainer");
    container.innerHTML = "<p style='text-align:center;'>⏳ جاري تحميل أحدث السجلات...</p>";
    
    await loadTotals(); 
    
    container.innerHTML = "";
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

        if (String(l.type).includes("إيراد")) {
            div.style.borderRight = "5px solid #2ecc71";
            let revText = l.amount ? `الايراد: <span style="color:#2ecc71; font-weight:bold;">${l.amount}</span>` : "";
            let withText = l.withdraw ? `السحب: <span style="color:#e74c3c; font-weight:bold;">${l.withdraw}</span>` : "";
            let separator = (revText && withText) ? " | " : "";
            
            let detailsHtml = "";
            if (l.note && l.note.trim() !== "") {
                detailsHtml = `<br><span style="color:#8e44ad; font-weight:bold;">⚙️ التغييرات:</span> ${l.note}`;
            }

            div.innerHTML = `
                <strong style="color: #2ecc71;">[${l.type}]</strong> - الموظف: <strong>${l.name}</strong><br>
                التاريخ: ${displayDate}<br>
                ${revText} ${separator} ${withText}
                ${detailsHtml}<br>
                <small style="color:gray;">وقت التسجيل: ${l.time}</small>
            `;
        } else {
            div.style.borderRight = "5px solid #e74c3c";
            div.innerHTML = `
                <strong style="color: #e74c3c;">[مديونية]</strong><br>
                التاريخ: ${displayDate}<br>
                الاسم: ${l.name}<br>
                المبلغ: ${l.amount}<br>
                الملاحظة: ${l.note}<br>
                <small style="color:gray;">وقت التسجيل: ${l.time}</small>
            `;
        }
        container.appendChild(div);
    });
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
