// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(
    'https://itukwxjrkjlpimafhhie.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0dWt3eGpya2pscGltYWZoaGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTI1NzcsImV4cCI6MjA1ODIyODU3N30.29hEH2ZTIkCgfiVt-2cwJzHw6PeLMdHYf7bfk3sV0nI'
);

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
        return { error: error.message };
    }
}

// Sign up functionality
async function handleSignUp(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        return { data };
        
    } catch (error) {
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
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
}

// Show welcome message
function showWelcomeMessage(email) {
    welcomeMessage.innerHTML = `
        <div class="welcome-content">
            <h1>Welcome to Dishify!</h1>
            <p>Logged in as: ${email}</p>
            <button onclick="handleSignOut()" class="signout-btn">Sign Out</button>
        </div>
    `;
    welcomeMessage.style.display = 'block';
    document.querySelector('.nav-links .auth-buttons').style.display = 'none';
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
    showWelcomeMessage(email);
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
    
    alert('Sign up successful! Please check your email for verification.');
    document.getElementById('signupDialog').close();
    showLoginDialog();
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

// Auth state change listener
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        showWelcomeMessage(session.user.email);
    } else if (event === 'SIGNED_OUT') {
        hideWelcomeMessage();
    }
});
