// ضع الرابط الذي نسخته من جوجل هنا بين علامتي التنصيص
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxszRW2bc1lOL2jMTFdSep8fOzEERWOV9LlpdHHeyCityrYTPaKWB3TalpaLT1xRiV1RQ/exec"; 

// ... (أكواد المستخدمين والخمول كما هي) ...

// في دالة الدخول (login) ودالة الـ (window.onload)، قم بتغيير showPage("revenue") إلى showPage("home")
// واضف استدعاء لدالة loadTotals() لجلب الأرقام فور الدخول:

window.onload = function() {
    let loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showPage("home"); // فتح الرئيسية
        loadTotals();     // تحميل المجاميع
        resetIdleTimer();
    }
    renderUsersList();
}

// ==========================================
// قسم ربط المديونية بجوجل شيت
// ==========================================

// دالة جلب المجاميع من جوجل شيت
async function loadTotals() {
    if(!GOOGLE_SCRIPT_URL.startsWith("http")) return; // لعدم حدوث خطأ إذا لم تضع الرابط
    
    try {
        let response = await fetch(GOOGLE_SCRIPT_URL);
        let result = await response.json();
        
        if(result.status === "success") {
            document.getElementById("total-refaat").innerText = result.data["رفعت"];
            document.getElementById("total-mohamed").innerText = result.data["محمد"];
            document.getElementById("total-mahmoud").innerText = result.data["محمود"];
            document.getElementById("total-hazem").innerText = result.data["حازم"];
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// تعديل دالة حفظ المديونية
async function saveDebt() {
    let date = document.getElementById("debtDate").value;
    let client = document.getElementById("debtClient").value; // الآن هو select
    let amount = document.getElementById("debtAmount").value;
    let note = document.getElementById("debtNote").value;

    if(!date || !client || !amount) {
        alert("⚠️ يرجى إدخال التاريخ، واختيار الموظف، والمبلغ!");
        return;
    }

    // تجهيز البيانات للإرسال
    let dataToSend = {
        action: "addDebt",
        date: date,
        employee: client,
        amount: amount,
        note: note
    };

    // تغيير نص الزر لتوضيح أنه يتم الإرسال
    let btn = document.querySelector("#debt .btn-primary");
    let originalText = btn.innerText;
    btn.innerText = "⏳ جاري الإرسال لجوجل شيت...";
    btn.disabled = true;

    try {
        // إرسال البيانات لجوجل
        let response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(dataToSend)
        });
        
        let result = await response.json();

        if(result.status === "success") {
            alert("تم حفظ المديونية في جوجل شيت بنجاح ✅");
            
            // إضافة التعديل للوج المحلي أيضاً
            logs.push({
                type: "مديونية", 
                date: date, client: client, amount: amount, note: note,
                time: new Date().toLocaleString()
            });
            
            // تصفير الحقول
            document.getElementById("debtDate").value = "";
            document.getElementById("debtClient").value = "";
            document.getElementById("debtAmount").value = "";
            document.getElementById("debtNote").value = "";
            
            // تحديث مجاميع الرئيسية تلقائياً
            loadTotals();
        } else {
            alert("❌ حدث خطأ أثناء الحفظ في جوجل شيت.");
        }
    } catch(error) {
        alert("❌ خطأ في الاتصال. تأكد من الإنترنت أو رابط السكربت.");
    }

    btn.innerText = originalText;
    btn.disabled = false;
}
