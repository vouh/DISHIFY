// Use supabaseClient from config.js
const supabaseClient = window.supabaseClient;

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const welcomeMessage = document.createElement('div');
welcomeMessage.className = 'welcome-message';
welcomeMessage.style.display = 'none';
document.body.appendChild(welcomeMessage);

// Login functionality
async function handleLogin(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        return { data };
        
    } catch (error) {
        console.error('Login error:', error);
        return { error: error.message };
    }
}

// Sign up functionality
async function handleSignUp(email, password) {
    try {
        // First check connection
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk) {
            throw new Error('Unable to connect to database. Please try again later.');
        }
        
        // Use signUp with minimal options
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        console.log('Signup successful:', data);
        return { data };
        
    } catch (error) {
        console.error('Signup error:', error);
        return { error: error.message };
    }
}

// Password reset functionality
async function handlePasswordReset(email) {
    try {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        
        if (error) throw error;
        return { data };
        
    } catch (error) {
        return { error: error.message };
    }
}

// Sign out functionality
async function handleSignOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        hideWelcomeMessage();
        showLoginDialog();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
}

// Show welcome message
async function showWelcomeMessage(email) {
    console.log('Showing dashboard for:', email);
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        console.error('Error getting user:', error.message);
        return;
    }
    console.log('User data:', user);
    // showDashboard(user.id);
}

// Hide welcome message
function hideWelcomeMessage() {
    welcomeMessage.style.display = 'none';
    document.querySelector('.nav-links .auth-buttons').style.display = 'flex';
}

// Dialog control functions
function showLoginDialog() {
    document.getElementById('signupDialog').close();
    document.getElementById('forgotPasswordDialog').close();
    document.getElementById('loginDialog').showModal();
}

function showSignupDialog() {
    document.getElementById('loginDialog').close();
    document.getElementById('forgotPasswordDialog').close();
    document.getElementById('signupDialog').showModal();
}

function showForgotPasswordDialog() {
    document.getElementById('loginDialog').close();
    document.getElementById('signupDialog').close();
    document.getElementById('forgotPasswordDialog').showModal();
}

// Form event listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { data, error } = await handleLogin(email, password);
    if (error) {
        alert(error);
        return;
    }
    
    document.getElementById('loginDialog').close();
    window.location.href = 'community.html';
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    const { data, error } = await handleSignUp(email, password);
    if (error) {
        alert(error);
        return;
    }
    
    // Clear any existing session check flags
    sessionStorage.removeItem('redirecting');
    
    alert('Sign up successful! Please check your email for verification.');
    document.getElementById('signupDialog').close();
});

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    
    const { data, error } = await handlePasswordReset(email);
    if (error) {
        alert(error);
        return;
    }
    
    alert('Password reset link sent to your email!');
    document.getElementById('forgotPasswordDialog').close();
});

// Clear signup flag when leaving the page
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('justSignedUp');
});
