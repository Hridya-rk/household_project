document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        window.location.href = 'homepage.html';
    }
    
    // Set up tabs
    document.getElementById('customer-tab').addEventListener('click', function() {
        setActiveTab('customer');
    });
    
    document.getElementById('provider-tab').addEventListener('click', function() {
        setActiveTab('provider');
    });
    
    // Function to set active tab
    function setActiveTab(tabId) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
        
        document.getElementById(tabId + '-tab').classList.add('active');
        document.getElementById(tabId + '-form-section').classList.add('active');
    }

    // Provider form submission
    document.getElementById('provider-register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get all form values
        const formData = {
            fullname: document.getElementById('provider-fullname').value.trim(),
            username: document.getElementById('provider-username').value.trim(),
            email: document.getElementById('provider-email').value.trim(),
            phone: document.getElementById('provider-phone').value.trim(),
            address: document.getElementById('provider-address').value.trim(),
            password: document.getElementById('provider-password').value,
            userType: 'provider',
            services: Array.from(document.querySelectorAll('input[name="service"]:checked'))
                        .map(cb => cb.value),
            experience: document.getElementById('provider-experience').value
        };

        // Validate form
        if (validateProviderForm(formData)) {
            try {
                console.log('Sending registration data:', formData);
                
                const response = await fetch('http://localhost:5500/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                console.log('Registration response:', data);

                if (data.success) {
                    document.getElementById('provider-success-message').style.display = 'block';
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 2000);
                } else {
                    throw new Error(data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                document.getElementById('provider-services-error').textContent = error.message;
                document.getElementById('provider-services-error').style.display = 'block';
            }
        }
    });
});

function validateProviderForm(data) {
    let isValid = true;
    const errors = {};

    if (!data.services || data.services.length === 0) {
        errors.services = 'Please select at least one service';
        isValid = false;
    }

    if (!data.experience) {
        errors.experience = 'Please select your experience level';
        isValid = false;
    }

    // Show errors if any
    Object.keys(errors).forEach(key => {
        const errorElement = document.getElementById(`provider-${key}-error`);
        if (errorElement) {
            errorElement.textContent = errors[key];
            errorElement.style.display = 'block';
        }
    });

    return isValid;
}

// Function to store user data in localStorage (simulating a database)
function storeUserData(userData) {
    // Get existing users or initialize empty array
    let users = JSON.parse(localStorage.getItem('housieUsers')) || [];
    
    // Add new user
    users.push(userData);
    
    // Save back to localStorage
    localStorage.setItem('housieUsers', JSON.stringify(users));
}

// Function to check if username already exists
function usernameExists(username) {
    let users = JSON.parse(localStorage.getItem('housieUsers')) || [];
    return users.some(user => user.username === username);
}

// Function to check if email already exists
function emailExists(email) {
    let users = JSON.parse(localStorage.getItem('housieUsers')) || [];
    return users.some(user => user.email === email);
}

// Add event listener to customer registration form
document.getElementById('customer-register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset all error messages
    document.querySelectorAll('#customer-register-form .error-message').forEach(elem => {
        elem.style.display = 'none';
    });
    
    // Get form values
    const fullname = document.getElementById('customer-fullname').value.trim();
    const username = document.getElementById('customer-username').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const password = document.getElementById('customer-password').value;
    const confirmPassword = document.getElementById('customer-confirm-password').value;
    
    // Validation flags
    let isValid = true;
    
    // Validate fullname
    if (!fullname) {
        document.getElementById('customer-fullname-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate username
    if (username.length < 5) {
        document.getElementById('customer-username-error').style.display = 'block';
        isValid = false;
    } else if (usernameExists(username)) {
        document.getElementById('customer-username-error').textContent = 'Username already exists';
        document.getElementById('customer-username-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
        document.getElementById('customer-email-error').style.display = 'block';
        isValid = false;
    } else if (emailExists(email)) {
        document.getElementById('customer-email-error').textContent = 'Email already exists';
        document.getElementById('customer-email-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate phone
    if (!phone) {
        document.getElementById('customer-phone-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate address
    if (!address) {
        document.getElementById('customer-address-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate password
    if (password.length < 8) {
        document.getElementById('customer-password-error').style.display = 'block';
        isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
        document.getElementById('customer-confirm-password-error').style.display = 'block';
        isValid = false;
    }
    
    // If valid, store data and redirect
    if (isValid) {
        // Create user object
        const userData = {
            fullname: fullname,
            username: username,
            email: email,
            phone: phone,
            address: address,
            password: password, // In a real application, NEVER store plaintext passwords
            userType: 'customer',
            registeredDate: new Date().toISOString()
        };
        
        // Store user data
        storeUserData(userData);
        
        // Show success message
        document.getElementById('customer-success-message').style.display = 'block';
        
        // Disable the submit button to prevent multiple submissions
        document.querySelector('#customer-register-form button[type="submit"]').disabled = true;
        
        // Store user in session storage to auto-login
        sessionStorage.setItem('loggedInUser', JSON.stringify({
            username: userData.username,
            fullname: userData.fullname,
            email: userData.email,
            userType: userData.userType
        }));
        
        // Redirect to homepage after 2 seconds
        setTimeout(function() {
            window.location.href = 'homepage.html';
        }, 2000);
    }
});
