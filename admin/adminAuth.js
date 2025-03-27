// Get supabaseClient from window object (initialized in config.js)
const { supabaseClient } = window;

// Test credentials for development
const TEST_CREDENTIALS = {
    email: 'kelvin@dishify.com',
    password: '1234'
};

// DOM Elements
const adminLoginSection = document.getElementById('admin-login-section');
const adminDashboardSection = document.getElementById('admin-dashboard-section');
const adminLoginForm = document.getElementById('admin-login-form');
const emailInput = document.getElementById('admin-email');
const passwordInput = document.getElementById('admin-password');
const logoutButton = document.getElementById('admin-logout');

// Set test credentials in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    emailInput.value = TEST_CREDENTIALS.email;
    passwordInput.value = TEST_CREDENTIALS.password;
}

// Admin authentication
async function handleAdminLogin(email, password) {
    try {
        console.log('Attempting login with:', email); // Debug log

        // For development, allow test credentials
        if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
            console.log('Using test credentials'); // Debug log
            localStorage.setItem('adminSession', 'true');
            localStorage.setItem('adminEmail', email);
            showDashboard();
            return { user: { email: TEST_CREDENTIALS.email, role: 'admin' } };
        }

        // Regular authentication
        console.log('Authenticating with Supabase...'); // Debug log
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Supabase auth error:', error); // Debug log
            throw error;
        }

        if (!data.user) {
            console.error('No user data received'); // Debug log
            throw new Error('Authentication failed');
        }

        console.log('Authentication successful:', data.user); // Debug log

        // Store session
        localStorage.setItem('adminSession', 'true');
        localStorage.setItem('adminEmail', email);
        
        return { user: data.user };
    } catch (error) {
        console.error('Login error:', error); // Debug log
        return { error: error.message || 'Login failed' };
    }
}

// Admin session check
async function checkAdminSession() {
    try {
        const adminSession = localStorage.getItem('adminSession');
        const adminEmail = localStorage.getItem('adminEmail');

        if (!adminSession || !adminEmail) {
            return false;
        }

        // For test credentials in development
        if (adminEmail === TEST_CREDENTIALS.email) {
            return true;
        }

        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            console.error('Session check error:', error); // Debug log
            localStorage.removeItem('adminSession');
            localStorage.removeItem('adminEmail');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Session check error:', error); // Debug log
        return false;
    }
}

// Admin logout
async function handleAdminLogout() {
    try {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminEmail');
        adminLoginSection.style.display = 'block';
        adminDashboardSection.style.display = 'none';
        logoutButton.style.display = 'none';
        // Clear form
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show dashboard and hide login
function showDashboard() {
    console.log('Showing dashboard'); // Debug log
    adminLoginSection.style.display = 'none';
    adminDashboardSection.style.display = 'block';
    logoutButton.style.display = 'block';
    
    // Check if dashboard functions exist before calling them
    if (typeof loadDashboardStats === 'function' && typeof loadRecipes === 'function') {
        loadDashboardStats();
        loadRecipes('pending');
    } else {
        console.error('Dashboard functions not found. Make sure adminDashboard.js is loaded properly.');
    }
}

// Event Listeners
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted'); // Debug log

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    const { user, error } = await handleAdminLogin(email, password);
    
    if (error) {
        console.error('Login error:', error); // Debug log
        alert(error);
        return;
    }

    if (user) {
        showDashboard();
    }
});

// Attach logout listener
if (logoutButton) {
    logoutButton.addEventListener('click', handleAdminLogout);
}

// Check session on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Checking admin session...'); // Debug log
    const isAdmin = await checkAdminSession();
    if (isAdmin) {
        console.log('Admin session found, showing dashboard'); // Debug log
        showDashboard();
    } else {
        console.log('No admin session, showing login'); // Debug log
        adminLoginSection.style.display = 'block';
        adminDashboardSection.style.display = 'none';
        logoutButton.style.display = 'none';
    }
}); 