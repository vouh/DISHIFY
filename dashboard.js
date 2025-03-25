// Dashboard functionality
async function showDashboard(userId) {
    console.log('Showing dashboard for user:', userId);
    
    // Hide all sections except nav
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.style.display = 'none');
    
    // Hide footer
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
    
    const dashboardContainer = document.getElementById('dashboard-container') || createDashboardContainer();
    
    // Fetch user profile
    console.log('Fetching user profile...');
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    let userProfile = profile;

    if (error) {
        console.log('Profile fetch error:', error.code, error.message);
        // Create empty profile if it doesn't exist
        if (error.code === 'PGRST116') {
            console.log('Creating new profile for user...');
            const { data: newProfile, error: createError } = await supabaseClient
                .from('profiles')
                .insert([{ id: userId }])
                .select()
                .single();
                
            if (createError) {
                console.error('Error creating profile:', createError.message);
                return;
            }
            
            console.log('New profile created:', newProfile);
            userProfile = newProfile;
        } else {
            return;
        }
    }

    // Check if profile needs to be completed
    const needsProfile = !userProfile?.display_name;
    console.log('Profile needs completion:', needsProfile);
    console.log('Current profile data:', userProfile);

    dashboardContainer.innerHTML = `
        <div class="dashboard-content bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mt-4">
            ${needsProfile ? getProfileForm() : getDashboardView(userProfile)}
        </div>
    `;

    if (needsProfile) {
        setupProfileFormListeners(userId);
    } else {
        setupDashboardListeners(userId);
    }

    // Show dashboard, hide auth buttons
    dashboardContainer.style.cssText = 'display: block; padding: 2rem; margin-top: 2rem;';
    document.querySelector('.nav-links .auth-buttons').style.display = 'none';
    hideAllDialogs();
}

function createDashboardContainer() {
    const container = document.createElement('div');
    container.id = 'dashboard-container';
    container.className = 'dashboard-container';
    container.style.cssText = 'display: none; padding: 2rem; margin-top: 2rem;';
    document.body.insertBefore(container, document.querySelector('section'));
    return container;
}

function getProfileForm() {
    return `
        <div class="profile-form">
            <h2 class="text-2xl font-bold mb-4">Complete Your Profile</h2>
            <form id="profile-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Display Name</label>
                    <input type="text" id="display-name" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Phone (WhatsApp)</label>
                    <input type="tel" id="phone" 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Instagram Handle</label>
                    <input type="text" id="instagram" 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                </div>
                <button type="submit" 
                        class="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    Save Profile
                </button>
            </form>
        </div>
    `;
}

function getDashboardView(profile) {
    return `
        <div class="dashboard-view">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold">Welcome, ${profile.display_name}!</h2>
                <button onclick="handleSignOut()" 
                        class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Sign Out
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-3">Your Profile</h3>
                    <div class="space-y-2">
                        <p><span class="font-medium">Phone:</span> ${profile.phone || 'Not provided'}</p>
                        <p><span class="font-medium">Instagram:</span> ${profile.instagram || 'Not provided'}</p>
                    </div>
                    <button onclick="editProfile()" 
                            class="mt-4 text-orange-500 hover:text-orange-600 focus:outline-none">
                        Edit Profile
                    </button>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-3">Your Recipes</h3>
                    <button onclick="showAddRecipeForm()" 
                            class="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                        Add New Recipe
                    </button>
                    <div id="user-recipes" class="mt-4">
                        Loading your recipes...
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function setupProfileFormListeners(userId) {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const displayName = document.getElementById('display-name').value;
        const phone = document.getElementById('phone').value;
        const instagram = document.getElementById('instagram').value;

        const { data, error } = await supabaseClient
            .from('profiles')
            .update({
                display_name: displayName,
                phone: phone,
                instagram: instagram,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            alert('Error saving profile: ' + error.message);
            return;
        }

        // Refresh dashboard with completed profile
        showDashboard(userId);
    });
}

function setupDashboardListeners(userId) {
    // Load user's recipes
    loadUserRecipes(userId);
}

async function loadUserRecipes(userId) {
    const recipesContainer = document.getElementById('user-recipes');
    if (!recipesContainer) return;

    const { data: recipes, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        recipesContainer.innerHTML = 'Error loading recipes';
        return;
    }

    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<p class="text-gray-500">You haven\'t added any recipes yet.</p>';
        return;
    }

    recipesContainer.innerHTML = recipes.map(recipe => `
        <div class="recipe-card mt-3 p-3 bg-white rounded shadow-sm">
            <h4 class="font-medium">${recipe.title}</h4>
            <p class="text-sm text-gray-600">${recipe.description || ''}</p>
        </div>
    `).join('');
}

function hideAllDialogs() {
    // Hide all modal dialogs
    const dialogs = document.querySelectorAll('.dialog');
    dialogs.forEach(dialog => dialog.style.display = 'none');
}

// Export functions
window.showDashboard = showDashboard;
window.editProfile = function() {
    // To be implemented
    alert('Edit profile feature coming soon!');
};
