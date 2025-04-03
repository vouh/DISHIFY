// Get supabaseClient from window object (initialized in config.js)
const { supabaseClient } = window;

// Make modal functions globally available
window.openAddRecipeModal = function() {
    const addRecipeModal = document.getElementById('add-recipe-modal');
    if (addRecipeModal) {
        addRecipeModal.classList.add('active');
        addRecipeModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form and preview
        const addRecipeForm = document.getElementById('add-recipe-form');
        if (addRecipeForm) {
            addRecipeForm.reset();
        }
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
    }
};

window.closeAddRecipeModal = function() {
    const addRecipeModal = document.getElementById('add-recipe-modal');
    if (addRecipeModal) {
        addRecipeModal.classList.remove('active');
        addRecipeModal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.handleAddRecipe = async function(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding Recipe...';
        
        const formData = new FormData(form);
        
        // Process ingredients and instructions into arrays
        const ingredients = formData.get('ingredients')
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
            
        const instructions = formData.get('instructions')
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        // Get dietary info
        const dietaryInfo = Array.from(form.querySelectorAll('input[name="dietary_info"]:checked'))
            .map(checkbox => checkbox.value);

        // Prepare recipe data
        const recipeData = {
            title: formData.get('title'),
            description: formData.get('description'),
            cooking_time: parseInt(formData.get('cooking_time')),
            servings: parseInt(formData.get('servings')),
            difficulty: formData.get('difficulty'),
            cuisine_type: formData.get('cuisine_type'),
            dietary_info: dietaryInfo,
            ingredients: ingredients,
            instructions: instructions,
            status: 'pending',
            user_id: (await supabaseClient.auth.getUser()).data.user.id
        };

        // Upload image
        const imageFile = formData.get('image');
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            const { data: imageData, error: imageError } = await supabaseClient.storage
                .from('recipe-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

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
        window.closeAddRecipeModal();
        form.reset();
        
        // Reload recipes and stats
        loadRecipes(currentTab);
        loadDashboardStats();

        alert('Recipe added successfully!');
    } catch (error) {
        console.error('Error adding recipe:', error);
        alert('Failed to add recipe: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Recipe';
    }
};

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

    const dietaryInfo = recipe.dietary_info && recipe.dietary_info.length > 0 
        ? `<div class="recipe-dietary-info">${recipe.dietary_info.join(', ')}</div>` 
        : '';

    card.innerHTML = `
        <div class="recipe-image-container">
            <img src="${recipe.image_url || '../images/default-recipe.jpg'}" alt="${recipe.title}">
            <div class="recipe-status ${statusClass}">${recipe.status}</div>
        </div>
        <div class="recipe-card-content">
            <h3>${recipe.title}</h3>
            <p class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${recipe.cooking_time} mins</span>
                <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                <span><i class="fas fa-chart-line"></i> ${recipe.difficulty}</span>
            </p>
            ${dietaryInfo}
            <p class="recipe-description">${recipe.description || ''}</p>
            <p class="recipe-cuisine">Cuisine: ${recipe.cuisine_type}</p>
            <p class="recipe-timestamp">Added: ${new Date(recipe.created_at).toLocaleDateString()}</p>
        </div>
        ${recipe.status === 'pending' ? `
        <div class="recipe-actions">
            <button class="btn-approve" onclick="handleRecipeAction('${recipe.id}', 'approved')">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn-reject" onclick="handleRecipeAction('${recipe.id}', 'rejected')">
                <i class="fas fa-times"></i> Reject
            </button>
            <button class="btn-view" onclick="viewRecipeDetails('${recipe.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
        ` : `
        <div class="recipe-actions">
            <button class="btn-view" onclick="viewRecipeDetails('${recipe.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
        `}
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

// Add event listeners for modal
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    addRecipeModal?.addEventListener('click', (e) => {
        if (e.target === addRecipeModal) {
            window.closeAddRecipeModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addRecipeModal?.classList.contains('active')) {
            window.closeAddRecipeModal();
        }
    });

    // Initialize image preview
    const recipeImage = document.getElementById('recipe-image');
    recipeImage?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('image-preview');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Recipe preview">`;
                }
            }
            reader.readAsDataURL(file);
        }
    });
});

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

// Add recipe details view function
async function viewRecipeDetails(recipeId) {
    try {
        const { data: recipe, error } = await supabaseClient
            .from('recipes')
            .select('*')
            .eq('id', recipeId)
            .single();

        if (error) throw error;

        const detailsModal = document.createElement('div');
        detailsModal.className = 'modal recipe-details-modal active';
        
        detailsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${recipe.title}</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="recipe-details">
                    <img src="${recipe.image_url || '../images/default-recipe.jpg'}" alt="${recipe.title}" class="recipe-detail-image">
                    <div class="recipe-info">
                        <p class="recipe-meta">
                            <span><i class="fas fa-clock"></i> ${recipe.cooking_time} mins</span>
                            <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                            <span><i class="fas fa-chart-line"></i> ${recipe.difficulty}</span>
                        </p>
                        <p class="recipe-description">${recipe.description}</p>
                        <div class="recipe-section">
                            <h3>Ingredients</h3>
                            <ul>${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                        <div class="recipe-section">
                            <h3>Instructions</h3>
                            <ol>${recipe.instructions.map(item => `<li>${item}</li>`).join('')}</ol>
                        </div>
                        ${recipe.dietary_info && recipe.dietary_info.length > 0 ? `
                        <div class="recipe-section">
                            <h3>Dietary Information</h3>
                            <div class="dietary-tags">
                                ${recipe.dietary_info.map(item => `<span class="dietary-tag">${item}</span>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(detailsModal);
    } catch (error) {
        console.error('Error loading recipe details:', error);
        alert('Failed to load recipe details');
    }
}