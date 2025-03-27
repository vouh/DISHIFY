// Get supabaseClient from window object (initialized in config.js)
const { supabaseClient } = window;

// DOM Elements
const addRecipeBtn = document.getElementById('add-recipe-btn');
const addRecipeModal = document.getElementById('add-recipe-modal');
const addRecipeForm = document.getElementById('add-recipe-form');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.cancel-btn');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-recipes');
const tabButtons = document.querySelectorAll('.tab-btn');
const pendingRecipesGrid = document.getElementById('pending-recipes');

// Stats Elements
const pendingCount = document.getElementById('pending-count');
const approvedCount = document.getElementById('approved-count');
const totalCount = document.getElementById('total-count');
const usersCount = document.getElementById('users-count');

// Current active tab
let currentTab = 'pending';

// Load dashboard stats
async function loadDashboardStats() {
    try {
        // Get pending recipes count
        const { count: pending, error: pendingError } = await supabaseClient
            .from('recipes')
            .select('*', { count: 'exact' })
            .eq('status', 'pending');

        if (!pendingError) {
            pendingCount.textContent = pending;
        }

        // Get approved recipes count
        const { count: approved, error: approvedError } = await supabaseClient
            .from('recipes')
            .select('*', { count: 'exact' })
            .eq('status', 'approved');

        if (!approvedError) {
            approvedCount.textContent = approved;
        }

        // Get total recipes count
        const { count: total, error: totalError } = await supabaseClient
            .from('recipes')
            .select('*', { count: 'exact' });

        if (!totalError) {
            totalCount.textContent = total;
        }

        // Get active users count
        const { count: users, error: usersError } = await supabaseClient
            .from('profiles')
            .select('*', { count: 'exact' });

        if (!usersError) {
            usersCount.textContent = users;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recipes based on status
async function loadRecipes(status = 'pending') {
    try {
        let query = supabaseClient
            .from('recipes')
            .select(`
                *,
                profiles:user_id (
                    username,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: recipes, error } = await query;

        if (error) throw error;

        displayRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        alert('Failed to load recipes. Please try again.');
    }
}

// Display recipes in grid
function displayRecipes(recipes) {
    pendingRecipesGrid.innerHTML = '';

    if (recipes.length === 0) {
        pendingRecipesGrid.innerHTML = '<p class="no-recipes">No recipes found.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        pendingRecipesGrid.appendChild(card);
    });
}

// Create recipe card element
function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const statusClass = recipe.status === 'approved' ? 'status-approved' : 
                       recipe.status === 'rejected' ? 'status-rejected' : 'status-pending';

    card.innerHTML = `
        <img src="${recipe.image_url || '../images/default-recipe.jpg'}" alt="${recipe.title}">
        <div class="recipe-card-content">
            <div class="recipe-status ${statusClass}">${recipe.status}</div>
            <h3>${recipe.title}</h3>
            <p>By: ${recipe.profiles?.username || 'Anonymous'}</p>
            <p>Submitted: ${new Date(recipe.created_at).toLocaleDateString()}</p>
            <p>${recipe.description || ''}</p>
        </div>
        ${recipe.status === 'pending' ? `
        <div class="recipe-actions">
            <button class="btn-approve" onclick="handleRecipeAction('${recipe.id}', 'approved')">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn-reject" onclick="handleRecipeAction('${recipe.id}', 'rejected')">
                <i class="fas fa-times"></i> Reject
            </button>
        </div>
        ` : ''}
    `;
    return card;
}

// Handle recipe approval/rejection
async function handleRecipeAction(recipeId, status) {
    try {
        const { error } = await supabaseClient
            .from('recipes')
            .update({ status: status })
            .eq('id', recipeId);

        if (error) throw error;

        // Reload current tab recipes and stats
        loadRecipes(currentTab);
        loadDashboardStats();

        // Show success message
        alert(`Recipe ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
        console.error('Error updating recipe status:', error);
        alert('Failed to update recipe status. Please try again.');
    }
}

// Handle new recipe submission
async function handleAddRecipe(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const recipeData = {
        title: formData.get('recipe-title'),
        description: formData.get('recipe-description'),
        ingredients: formData.get('recipe-ingredients'),
        instructions: formData.get('recipe-instructions'),
        status: 'pending',
        user_id: (await supabaseClient.auth.getUser()).data.user.id
    };

    try {
        // Upload image if provided
        const imageFile = formData.get('recipe-image');
        if (imageFile) {
            const { data: imageData, error: imageError } = await supabaseClient.storage
                .from('recipe-images')
                .upload(`${Date.now()}-${imageFile.name}`, imageFile);

            if (imageError) throw imageError;

            const { data: { publicUrl } } = supabaseClient.storage
                .from('recipe-images')
                .getPublicUrl(imageData.path);

            recipeData.image_url = publicUrl;
        }

        // Save recipe to database
        const { error } = await supabaseClient
            .from('recipes')
            .insert([recipeData]);

        if (error) throw error;

        // Close modal and reset form
        closeAddRecipeModal();
        e.target.reset();
        
        // Reload recipes and stats
        loadRecipes(currentTab);
        loadDashboardStats();

        alert('Recipe added successfully!');
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert('Failed to add recipe. Please try again.');
    }
}

// Modal functions
function openAddRecipeModal() {
    addRecipeModal.classList.add('active');
}

function closeAddRecipeModal() {
    addRecipeModal.classList.remove('active');
    addRecipeForm.reset();
}

// Event listeners
addRecipeBtn.addEventListener('click', openAddRecipeModal);
closeModalBtn.addEventListener('click', closeAddRecipeModal);
cancelBtn.addEventListener('click', closeAddRecipeModal);
addRecipeForm.addEventListener('submit', handleAddRecipe);

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update current tab and load recipes
        currentTab = button.dataset.tab;
        loadRecipes(currentTab);
    });
});

// Filter and search
statusFilter.addEventListener('change', (e) => {
    currentTab = e.target.value;
    loadRecipes(currentTab);
});

searchInput.addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.toLowerCase();
    const recipes = document.querySelectorAll('.recipe-card');
    
    recipes.forEach(recipe => {
        const title = recipe.querySelector('h3').textContent.toLowerCase();
        const description = recipe.querySelector('p:last-child').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            recipe.style.display = 'block';
        } else {
            recipe.style.display = 'none';
        }
    });
}, 300));

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecipes('pending');
}); 