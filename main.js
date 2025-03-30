// Navigation scroll effect
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        nav.style.background = 'white';
        nav.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Recipe search functionality
function searchRecipes() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.toLowerCase();
    const recipeCards = document.querySelectorAll('.recipe-card');

    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const tags = card.querySelector('.recipe-tags').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || tags.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        // Add your newsletter subscription logic here
        alert('Thank you for subscribing!');
        this.reset();
    });
}

// Text reveal animation
function textReveal() {
    const title = document.querySelector('[data-animation="text-reveal"]');
    if (!title) return;

    const text = title.textContent;
    title.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.display = 'inline-block';
        span.style.transition = 'all 0.3s ease';
        title.appendChild(span);
        
        setTimeout(() => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, 100 * i);
    }
}

// Search bar animation
function initSearchAnimation() {
    // Only run if all required elements exist
    try {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const searchSuggestions = document.querySelector('.search-suggestions');
    
        if (!searchContainer || !searchInput || !searchSuggestions) {
            console.log('Search elements not found, skipping search animation setup');
            return;
        }

    searchInput.addEventListener('focus', () => {
        searchContainer.style.transform = 'scale(1.02)';
        searchSuggestions.style.display = 'flex';
        searchSuggestions.style.opacity = '1';
    });

    searchInput.addEventListener('blur', () => {
        searchContainer.style.transform = 'scale(1)';
        setTimeout(() => {
            if (!searchInput.matches(':focus')) {
                searchSuggestions.style.opacity = '0';
            }
        }, 200);
    });

    searchInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            searchContainer.classList.add('has-content');
        } else {
            searchContainer.classList.remove('has-content');
        }
    });
    } catch (error) {
        console.log('Error in search animation:', error);
    }
}

// Typing effect initialization
document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.hero h1');
    if (title) {
        // Store the original text
        const text = title.textContent;
        // Clear the text initially
        title.textContent = '';
        // Set a small delay before starting the animation
        setTimeout(() => {
            title.textContent = text;
            title.style.visibility = 'visible';
        }, 500);
    }
});

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    textReveal();
    initSearchAnimation();
    
    // Animate features on scroll
    const features = document.querySelectorAll('.feature');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        feature.style.transition = 'all 0.6s ease';
        observer.observe(feature);
    });
});

// Immediate script loading verification
console.log('Script loaded!');

// Footer DateTime Display
function updateDateTime() {
    try {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[now.getDay()];
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
        const dayElement = document.getElementById('currentDay');
        const timeElement = document.getElementById('currentTime');
        const yearElement = document.getElementById('currentYear');
        
        if (dayElement) dayElement.textContent = dayName;
        if (timeElement) timeElement.textContent = timeString;
        if (yearElement) yearElement.textContent = now.getFullYear();
    } catch (error) {
        console.log('Error updating date/time:', error);
    }
}

// Initialize date/time display
if (document.getElementById('currentDay') || 
    document.getElementById('currentTime') || 
    document.getElementById('currentYear')) {
updateDateTime();
setInterval(updateDateTime, 1000);
}

// Notification System
function showNotification(message, type = 'default') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to document
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Dialog handling functions
function showLogin() {
    console.log('Opening login dialog');
    const loginDialog = document.getElementById('loginDialog');
    if (loginDialog) {
        loginDialog.showModal();
    } else {
        console.error('Login dialog not found');
    }
}

function showSignup() {
    console.log('Opening signup dialog');
    const signupDialog = document.getElementById('signupDialog');
    if (signupDialog) {
        signupDialog.showModal();
    } else {
        console.error('Signup dialog not found');
    }
}

function switchToSignup() {
    document.getElementById('loginDialog').close();
    showSignup();
}

function switchToLogin() {
    document.getElementById('signupDialog').close();
    showLogin();
}

function showForgotPassword() {
    document.getElementById('loginDialog').close();
    document.getElementById('forgotPasswordDialog').showModal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Looking for buttons
    console.log('Looking for buttons...');
    
    // Verify buttons are working
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');

    if (loginBtn) {
        console.log('Login button found');
        loginBtn.addEventListener('click', showLogin);
    }

    if (signupBtn) {
        console.log('Signup button found');
        signupBtn.addEventListener('click', showSignup);
    }

    // Click outside to close dialogs
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect();
            if (e.clientY < rect.top || e.clientY > rect.bottom ||
                e.clientX < rect.left || e.clientX > rect.right) {
                dialog.close();
            }
        });
    });

    // Run text reveal animation
    textReveal();
});