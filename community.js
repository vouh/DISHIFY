// Community Page JavaScript

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    initializeEventListeners();
    
    // Initialize grid layout
    adjustGridLayout();
    window.addEventListener('resize', adjustGridLayout);
});

function initializePage() {
    // Load initial profile data
    updateProfileUI({
        full_name: '',
        city: '',
        country: '',
        bio: '',
        avatar_url: 'https://via.placeholder.com/150',
        facebook_url: '',
        instagram_url: '',
        tiktok_url: '',
        whatsapp_number: ''
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
function updateProfileUI(profileData) {
    // Update profile picture
    const profilePics = document.querySelectorAll('#userProfilePic, #editProfilePic');
    profilePics.forEach(pic => {
        pic.src = profileData.avatar_url || 'https://via.placeholder.com/150';
    });

    // Update user information
    document.querySelector('.user-name').textContent = profileData.full_name || 'Your Name';
    document.querySelector('.user-location').innerHTML = 
        `<i class="fas fa-map-marker-alt"></i> ${profileData.city ? profileData.city + ', ' : ''}${profileData.country || 'Add your location'}`;
    document.querySelector('.user-bio').textContent = profileData.bio || 'Share your cooking journey...';

    // Update form fields if they exist
    const fullNameInput = document.getElementById('fullName');
    const cityInput = document.getElementById('city');
    const countryInput = document.getElementById('country');
    const bioInput = document.getElementById('bio');

    if (fullNameInput) fullNameInput.value = profileData.full_name || '';
    if (cityInput) cityInput.value = profileData.city || '';
    if (countryInput) countryInput.value = profileData.country || '';
    if (bioInput) bioInput.value = profileData.bio || '';

    // Update social links
    updateSocialLinks(profileData);
}

function updateSocialLinks(profileData) {
    const socialLinksContainer = document.querySelector('.social-links');
    socialLinksContainer.innerHTML = '';

    if (profileData.facebook_url) {
        socialLinksContainer.innerHTML += `<a href="${profileData.facebook_url}" class="social-link" target="_blank"><i class="fab fa-facebook"></i></a>`;
    }
    if (profileData.instagram_url) {
        socialLinksContainer.innerHTML += `<a href="${profileData.instagram_url}" class="social-link" target="_blank"><i class="fab fa-instagram"></i></a>`;
    }
    if (profileData.tiktok_url) {
        socialLinksContainer.innerHTML += `<a href="${profileData.tiktok_url}" class="social-link" target="_blank"><i class="fab fa-tiktok"></i></a>`;
    }
    if (profileData.whatsapp_number) {
        socialLinksContainer.innerHTML += `<a href="https://wa.me/${profileData.whatsapp_number}" class="social-link" target="_blank"><i class="fab fa-whatsapp"></i></a>`;
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
