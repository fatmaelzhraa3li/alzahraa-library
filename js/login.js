document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email'); // تم تغييرها من username
    const passwordInput = document.getElementById('password');
    const messageDisplay = document.getElementById('message');
    const togglePassword = document.getElementById('togglePassword'); // لأيقونة العين
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const signUpLink = document.getElementById('signUpLink');

    // --- منطق نموذج تسجيل الدخول الرئيسي ---
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // منع الإرسال الافتراضي للنموذج

        const email = emailInput.value; // تم تغييرها من username
        const password = passwordInput.value;

        messageDisplay.textContent = ''; // مسح أي رسائل سابقة
        messageDisplay.className = 'message'; // إعادة تعيين الفئة للتنسيق

        try {
            // جلب بيانات المستخدم من ملف data.json
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();

            // التحقق من بيانات المستخدم
            // هنا، سنبحث عن 'username' في ملف JSON وكأنه الإيميل.
            // الأفضل أن تكون المفاتيح في JSON متطابقة (أي 'email' بدلاً من 'username').
            const foundUser = users.find(user => 
                user.username === email && user.password === password
            );

            if (foundUser) {
                messageDisplay.textContent = 'Login successful!';
                messageDisplay.classList.add('success');
                // في تطبيق حقيقي، سيتم إعادة التوجيه هنا:
                // window.location.href = 'dashboard.html';
                console.log('User logged in:', email);
                emailInput.value = '';
                passwordInput.value = '';
            } else {
                messageDisplay.textContent = 'Invalid email or password.';
                messageDisplay.classList.add('error');
            }
        } catch (error) {
            console.error('Error fetching or parsing user data:', error);
            messageDisplay.textContent = 'An error occurred. Please try again.';
            messageDisplay.classList.add('error');
        }
    });

    // --- وظيفة إظهار/إخفاء كلمة المرور ---
    if (togglePassword) { // التأكد من وجود الأيقونة قبل إضافة المستمع
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // تغيير أيقونة العين
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // --- عنصر نائب لنسيت كلمة المرور ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // منع سلوك الرابط الافتراضي
            alert('Forgot Password functionality would send a reset link to your email! (Requires backend support)');
        });
    }

    // --- عنصر نائب للتسجيل (Sign Up) ---
    if (signUpLink) {
        signUpLink.addEventListener('click', (event) => {
            event.preventDefault(); // منع سلوك الرابط الافتراضي
            alert('Sign Up functionality would take you to a registration page! (Requires backend to create new users)');
        });
    }
});



