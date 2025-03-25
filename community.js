// Community Page JavaScript

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCommunityPage);

async function initializeCommunityPage() {
    // Temporarily disable auth check for development
    /*
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
        window.location.href = 'index.html';
        return;
    }
    */

    // Load dummy data for now
    await Promise.all([
        loadDummyProfile(),
        loadDummyMembers(),
        loadDummyRecipes()
    ]);
}

// Temporary dummy data functions
async function loadDummyProfile() {
    const profile = {
        display_name: 'Test User',
        profile_pic_url: 'https://via.placeholder.com/100',
        bio: 'Food lover and cooking enthusiast'
    };

    // Update profile section
    const profilePics = document.querySelectorAll('.user-profile-menu .profile-pic, .user-profile-card .profile-pic');
    profilePics.forEach(pic => {
        pic.src = profile.profile_pic_url;
        pic.alt = profile.display_name;
    });

    document.querySelector('.user-name').textContent = profile.display_name;
    document.querySelector('.user-bio').textContent = profile.bio;
}

async function loadDummyMembers() {
    const members = [
        { id: 1, display_name: 'John Doe', profile_pic_url: 'https://via.placeholder.com/60' },
        { id: 2, display_name: 'Jane Smith', profile_pic_url: 'https://via.placeholder.com/60' },
        { id: 3, display_name: 'Mike Johnson', profile_pic_url: 'https://via.placeholder.com/60' },
        { id: 4, display_name: 'Sarah Wilson', profile_pic_url: 'https://via.placeholder.com/60' },
        { id: 5, display_name: 'Tom Brown', profile_pic_url: 'https://via.placeholder.com/60' },
        { id: 6, display_name: 'Lisa Davis', profile_pic_url: 'https://via.placeholder.com/60' }
    ];

    const membersGrid = document.getElementById('members-grid');
    membersGrid.innerHTML = members.map(member => `
        <div class="member-card" onclick="viewProfile('${member.id}')">
            <img src="${member.profile_pic_url}" 
                 alt="${member.display_name}"
                 class="member-pic">
            <p class="member-name">${member.display_name}</p>
        </div>
    `).join('');
}

async function loadDummyRecipes() {
    const recipes = [
        {
            title: 'Kenyan Pilau',
            description: 'Traditional Kenyan rice dish with aromatic spices',
            image_url: 'https://via.placeholder.com/400x300',
            profiles: {
                display_name: 'Chef John',
                profile_pic_url: 'https://via.placeholder.com/40'
            },
            created_at: new Date()
        },
        {
            title: 'Nyama Choma',
            description: 'Grilled meat with Kenyan spices',
            image_url: 'https://via.placeholder.com/400x300',
            profiles: {
                display_name: 'Chef Mary',
                profile_pic_url: 'https://via.placeholder.com/40'
            },
            created_at: new Date(Date.now() - 86400000) // 1 day ago
        }
    ];

    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <img src="${recipe.profiles.profile_pic_url}" 
                     alt="${recipe.profiles.display_name}"
                     class="author-pic">
                <div class="recipe-meta">
                    <p class="author-name">${recipe.profiles.display_name}</p>
                    <p class="recipe-time">${formatDate(recipe.created_at)}</p>
                </div>
            </div>
            <img src="${recipe.image_url}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3>${recipe.title}</h3>
                <p>${recipe.description}</p>
            </div>
        </div>
    `).join('');
}

// Recipe Upload Dialog
function showRecipeUpload() {
    const dialog = document.getElementById('recipeUploadDialog');
    dialog.showModal();
}

// Profile Completion Dialog
function showProfileCompletion() {
    // Create and show profile completion dialog
    const dialog = document.createElement('dialog');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h2>Complete Your Profile</h2>
            <p>Please complete your profile to get the most out of the Dishify community!</p>
            <form id="profile-completion-form">
                <input type="text" name="display_name" placeholder="Display Name" required>
                <input type="tel" name="phone" placeholder="Phone Number">
                <input type="text" name="instagram" placeholder="Instagram Handle">
                <input type="text" name="whatsapp" placeholder="WhatsApp Number">
                <input type="file" name="profile_pic" accept="image/*">
                <button type="submit">Save Profile</button>
            </form>
        </div>
    `;
    document.body.appendChild(dialog);
    dialog.showModal();

    // Handle form submission
    dialog.querySelector('form').addEventListener('submit', handleProfileUpdate);
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const form = e.target;
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) return;

    const formData = new FormData(form);
    const updates = {
        id: user.id,
        display_name: formData.get('display_name'),
        phone: formData.get('phone'),
        instagram: formData.get('instagram'),
        whatsapp: formData.get('whatsapp'),
        updated_at: new Date()
    };

    const { error } = await supabaseClient
        .from('profiles')
        .upsert(updates);

    if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
        return;
    }

    // Close dialog and reload page
    e.target.closest('dialog').close();
    window.location.reload();
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function viewProfile(userId) {
    // Implement profile viewing functionality
    console.log('Viewing profile:', userId);
}

function viewAllMembers() {
    // Implement view all members functionality
    console.log('Viewing all members');
}

function showMyRecipes() {
    // Implement my recipes view
    console.log('Showing my recipes');
}

// Export functions for global use
window.showRecipeUpload = showRecipeUpload;
window.viewProfile = viewProfile;
window.viewAllMembers = viewAllMembers;
window.showMyRecipes = showMyRecipes;
