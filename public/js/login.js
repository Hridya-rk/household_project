document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.getElementById('login-form');
    
    // Check if form exists
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');

    // Handle form submission
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Reset error messages
        [loginError, usernameError, passwordError].forEach(error => {
            if (error) error.style.display = 'none';
        });
        
        const username = usernameInput?.value.trim() || '';
        const password = passwordInput?.value.trim() || '';
        
        let isValid = true;
        
        // Validate username
        if (!username) {
            usernameError.textContent = 'Username is required';
            usernameError.style.display = 'block';
            isValid = false;
        } else {
            usernameError.style.display = 'none';
        }
        
        // Validate password
        if (!password) {
            passwordError.textContent = 'Password is required';
            passwordError.style.display = 'block';
            isValid = false;
        } else {
            passwordError.style.display = 'none';
        }
        
        if (isValid) {
            try {
                console.log('Attempting login...');
                const response = await fetch('http://localhost:5500/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);

                if (data.success) {
                    sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));
                    window.location.href = '/homepage.html';
                } else {
                    loginError.textContent = data.error || 'Invalid username or password';
                    loginError.style.display = 'block';
                    // Add link to register
                    loginError.innerHTML += '<br><a href="/register.html">Create an account</a>';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'Cannot connect to server. Please try again later.';
                loginError.style.display = 'block';
            }
        }
    });

    // Add click handler for signup link
    document.querySelector('.signup-link a').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/register.html';
    });
});
