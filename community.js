// Community Page JavaScript

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Removed automatic auth check
    initializeEventListeners();
    adjustGridLayout();
    window.addEventListener('resize', adjustGridLayout);
});

// Manual auth check - only call this when needed
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        // No session, redirect to index
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Simple auth check
async function manualAuthCheck() {
    // Don't check if we just signed up
    if (sessionStorage.getItem('justSignedUp')) {
        sessionStorage.removeItem('justSignedUp');
        return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        // No session, redirect to index
        window.location.href = 'index.html';
        return;
    }

    // Set up listener for sign out
    supabaseClient.auth.onAuthStateChange((event, _session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        }
    });
}

function initializeEventListeners() {
    // Add event listener for profile form submission
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Add event listener for edit profile button
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', editProfile);
    }
}

// Dashboard Functions
function updateDateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    document.getElementById('currentDay').textContent = days[now.getDay()];
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show');
}

// Community Profile Functions
function updateProfileUI(profile) {
    // Get elements
    const userNameElement = document.getElementById('userName');
    const userProfilePic = document.getElementById('userProfilePic');
    const userBio = document.getElementById('userBio');
    const userLocation = document.getElementById('userLocation');
    const socialLinks = document.getElementById('socialLinks');

    // Update elements if they exist
    if (userNameElement) {
        userNameElement.textContent = profile.full_name || 'Anonymous User';
    }

    if (userProfilePic) {
        userProfilePic.src = profile.avatar_url || 'images/default-avatar.png';
        userProfilePic.alt = profile.full_name || 'User avatar';
    }

    if (userBio) {
        userBio.textContent = profile.bio || 'No bio available';
    }

    if (userLocation) {
        userLocation.textContent = profile.city && profile.country ? 
            `${profile.city}, ${profile.country}` : 'Location not set';
    }

    if (socialLinks) {
        socialLinks.innerHTML = '';
        if (profile.facebook_url) {
            socialLinks.innerHTML += `<a href="${profile.facebook_url}" target="_blank" class="social-link"><i class="fab fa-facebook"></i></a>`;
        }
        if (profile.instagram_url) {
            socialLinks.innerHTML += `<a href="${profile.instagram_url}" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>`;
        }
        if (profile.tiktok_url) {
            socialLinks.innerHTML += `<a href="${profile.tiktok_url}" target="_blank" class="social-link"><i class="fab fa-tiktok"></i></a>`;
        }
        if (profile.whatsapp_number) {
            socialLinks.innerHTML += `<a href="https://wa.me/${profile.whatsapp_number}" target="_blank" class="social-link"><i class="fab fa-whatsapp"></i></a>`;
        }
    }
}

function editProfile() {
    const dialog = document.getElementById('editProfileDialog');
    if (dialog) {
        dialog.showModal();
    }
}

function previewProfilePhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editProfilePic');
            if (preview) {
                preview.src = e.target.result;
            }
            // Store the temporary URL for later use
            window.tempPhotoUrl = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function handleProfileSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        full_name: formData.get('fullName'),
        city: formData.get('city'),
        country: formData.get('country'),
        bio: formData.get('bio'),
        avatar_url: window.tempPhotoUrl || document.getElementById('userProfilePic').src,
        facebook_url: formData.get('facebook'),
        instagram_url: formData.get('instagram'),
        tiktok_url: formData.get('tiktok'),
        whatsapp_number: formData.get('whatsapp')
    };

    // Update UI with new profile data
    updateProfileUI(profileData);

    // Close the dialog
    document.getElementById('editProfileDialog').close();

    // Show success notification
    showNotification('Profile updated successfully!', 'success');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger reflow to enable animation
    notification.offsetHeight;
    notification.classList.add('show');

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle profile sidebar
function toggleProfile() {
    const sidebar = document.querySelector('.left-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');

    // Wait for transition to complete before recalculating grid
    setTimeout(() => {
        adjustGridLayout();
    }, 300); // Match the transition duration
}

function adjustGridLayout() {
    const membersGrid = document.querySelector('.members-grid');
    if (membersGrid) {
        const cards = membersGrid.querySelectorAll('.member-card');
        const gridWidth = membersGrid.offsetWidth;
        const cardWidth = 250; // minimum card width
        const gap = 25; // gap between cards
        
        // Calculate number of columns that can fit
        const columns = Math.floor((gridWidth + gap) / (cardWidth + gap));
        
        // Update grid template columns
        if (columns > 0) {
            const columnWidth = `${Math.floor((gridWidth - (gap * (columns - 1))) / columns)}px`;
            membersGrid.style.gridTemplateColumns = `repeat(${columns}, ${columnWidth})`;
        }
    }
}

// Make functions globally available
window.toggleMobileMenu = toggleMobileMenu;
window.toggleProfile = toggleProfile;
