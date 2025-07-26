

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const API_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('HTTP error! status: ${response.status}');
            
            const data = await response.json();
            const foundUser = data.users.find(user => user.email === email);

            if (foundUser) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUserEmail', email);

                // ✅ رسالة نجاح
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: 'Welcome back!',
                    timer: 1500,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1600);

            } else {
                // ❌ بريد أو كلمة مرور غير صحيحة
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Invalid email or password. Please try again.'
                });
            }

        } catch (error) {
            console.error('Login error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again later.'
            });
        }
    });
});









    // --------------------------------------------------------------------
    // الكود الخاص بتسجيل الدخول بجوجل
    // --------------------------------------------------------------------

    // 1. تهيئة خدمة تسجيل الدخول من جوجل
    google.accounts.id.initialize({
        client_id: "348768945048-7t56qa0m7mh3i1fcu5ivhd3maln32g3p.apps.googleusercontent.com", 
        callback: handleGoogleResponse // اسم الدالة التي ستستقبل استجابة جوجل
    });

    // 2. الحصول على زر تسجيل الدخول من HTML بواسطة الـ ID الخاص به
    const googleSignInButton = document.getElementById('googleSignInBtn');

    // 3. التحقق مما إذا كان الزر موجودًا بالفعل في الصفحة قبل إضافة event listener
    if (googleSignInButton) {
        // 4. ربط الزر بحدث النقر: عندما يتم النقر على الزر، افتح نافذة تسجيل الدخول من جوجل
        googleSignInButton.onclick = () => {
            google.accounts.id.prompt(); // هذا الأمر هو الذي يظهر نافذة تسجيل الدخول المنبثقة
        };
    }


// --------------------------------------------------------------------
// الدوال (الوظائف) التي ليست جزءًا من DOMContentLoaded
// --------------------------------------------------------------------

// هذه الدالة (الوظيفة) تُستدعى تلقائيًا بواسطة مكتبة جوجل عندما يقوم المستخدم بتسجيل الدخول بنجاح
function handleGoogleResponse(response) {
    const idToken = response.credential;
    console.log("تم تسجيل الدخول بنجاح! ID Token:", idToken);
}

