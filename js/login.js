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