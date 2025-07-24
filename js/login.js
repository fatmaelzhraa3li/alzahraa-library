// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // جلب العناصر الأساسية من الـ DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const messageDisplay = document.getElementById('message'); // العنصر اللي هنعرض فيه الرسائل
    const googleSignInBtn = document.getElementById('googleSignInBtn'); // الزر الجديد لجوجل

    // رابط الـ API اللي فيه بيانات المستخدمين
    const API_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

    // --- وظيفة "Remember Me" (تذكرني) ---
    // عند تحميل الصفحة، نتحقق إذا كان فيه إيميل محفوظ
    if (localStorage.getItem('rememberedEmail')) {
        emailInput.value = localStorage.getItem('rememberedEmail');
        rememberMeCheckbox.checked = true; // نعلم على "تذكرني" لو كان فيه إيميل محفوظ
    }

    // --- وظيفة إظهار/إخفاء كلمة المرور ---
    togglePassword.addEventListener('click', () => {
        // تبديل نوع حقل كلمة المرور بين 'password' و 'text'
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // تبديل أيقونة العين بين 'eye' و 'eye-slash'
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // --- التعامل مع إرسال نموذج تسجيل الدخول (بالإيميل وكلمة المرور) ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج (إعادة تحميل الصفحة)

        // جلب القيم المدخلة
        const email = emailInput.value.trim(); // .trim() لإزالة المسافات البيضاء الزائدة
        const password = passwordInput.value.trim();

        // عرض رسالة "جاري التحقق..."
        messageDisplay.textContent = 'Verifying credentials...';
        messageDisplay.className = 'message'; // لإزالة أي كلاسات سابقة (مثل 'error' أو 'success')

        try {
            // جلب بيانات المستخدمين من الـ API
            const response = await fetch(API_URL);
            if (!response.ok) {
                // إذا كان هناك مشكلة في استجابة الـ API (مثل 404 أو 500)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // تحويل الاستجابة إلى JSON

            // البحث عن المستخدم بالإيميل وكلمة المرور في بيانات الـ API
            // نفترض أن الـ API يرجع مصفوفة من المستخدمين، وكل مستخدم له 'email' و 'password'
            const foundUser = data.users.find(user => user.email === email && user.password === password);

            if (foundUser) {
                // تسجيل الدخول ناجح
                messageDisplay.textContent = 'Login successful! Redirecting...';
                messageDisplay.className = 'message success'; // إضافة كلاس للرسائل الناجحة (ممكن تنسيقه بالـ CSS)

                // --- التعامل مع "Remember Me" ---
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberedEmail', email); // حفظ الإيميل إذا تم اختيار "تذكرني"
                } else {
                    localStorage.removeItem('rememberedEmail'); // مسح الإيميل إذا لم يتم اختيار "تذكرني"
                }

                // حفظ حالة تسجيل الدخول (مثلاً، لتحديد إذا كان المستخدم مسجل دخول أو لا)
                // ممكن تخزين الـ user ID أو أي بيانات للمستخدم في localStorage أو sessionStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUserEmail', email); // مثال: حفظ إيميل المستخدم الحالي

                // إعادة توجيه المستخدم لصفحة الـ Home بعد ثانية واحدة (لإظهار رسالة النجاح)
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } else {
                // بيانات الدخول غير صحيحة
                messageDisplay.textContent = 'Invalid email or password. Please try again.';
                messageDisplay.className = 'message error'; // إضافة كلاس للرسائل الخطأ
            }

        } catch (error) {
            // التعامل مع أي أخطاء تحدث أثناء جلب البيانات أو معالجتها
            console.error('Login error:', error);
            messageDisplay.textContent = 'An error occurred. Please try again later.';
            messageDisplay.className = 'message error';
        }
    });

    // --- التعامل مع زر "Sign in with Google Account" ---
    googleSignInBtn.addEventListener('click', () => {
        messageDisplay.textContent = 'You clicked "Sign in with Google Account". (Actual Google Sign-In requires API integration)';
        messageDisplay.className = 'message'; // يمكنك تغيير اللون إذا أردتِ
        // في هذه النقطة، ستقومين بدمج كود Google Sign-In API الفعلي
        // على سبيل المثال:
        // window.location.href = 'YOUR_GOOGLE_AUTH_URL';
        // أو استخدام مكتبة Google Identity Services
        console.log('Initiating Google Sign-In process...');
    });
});
