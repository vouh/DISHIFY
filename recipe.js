// Recipe template for rendering
const recipeTemplate = (recipe) => `
    <div class="recipe-card" data-aos="fade-up" data-recipe='${JSON.stringify(recipe)}'>
        <div class="recipe-image-wrapper">
            <img src="${recipe.imageUrl}" alt="${recipe.name}" class="recipe-image">
            <div class="recipe-overlay">
                <i class="fas fa-utensils"></i>
                <span>${recipe.tags[0]}</span>
            </div>
        </div>
        <div class="recipe-content">
            <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
            </div>
            <h3>${recipe.name}</h3>
            <p class="recipe-description">${recipe.description}</p>
            <div class="recipe-stats">
                <span><i class="far fa-clock" style="color: #FF5722;"></i> ${recipe.cookTime}</span>
                <span><i class="far fa-heart" style="color: #FF5722;"></i> ${recipe.likes}</span>
            </div>
        </div>
    </div>
`;

// Function to fetch recipes from JSON file
async function fetchRecipes() {
    try {
        const response = await fetch('recipes.json');
        const data = await response.json();
        return data.categories;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return null;
    }
}

// Function to render recipes in a specific grid
function renderRecipesToGrid(recipes, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // Always show exactly 4 recipes
    let recipesToShow = recipes;
    if (recipes.length < 4) {
        // If less than 4 recipes, duplicate existing ones to fill the grid
        recipesToShow = [...recipes];
        while (recipesToShow.length < 4) {
            recipesToShow.push({...recipes[recipesToShow.length % recipes.length]});
        }
    } else if (recipes.length > 4) {
        // If more than 4 recipes, take only the first 4
        recipesToShow = recipes.slice(0, 4);
    }

    grid.innerHTML = recipesToShow.map(recipe => recipeTemplate(recipe)).join('');

    // Add click event listeners to the newly rendered recipe cards
    grid.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipeData = JSON.parse(card.getAttribute('data-recipe'));
            handleRecipeClick(recipeData);
        });
    });
}

// Function to handle recipe card clicks
function handleRecipeClick(recipe) {
    // Store the recipe data in localStorage
    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
    // Redirect to the recipe detail page
    window.location.href = 'recipe-detail.html';
}

// Function to initialize recipe grids
async function initializeRecipeGrids() {
    const categories = await fetchRecipes();
    if (!categories) return;

    // Handle By Meal-Time section
    const mealTimeCategory = categories['2']; // Using the ID from your data
    if (mealTimeCategory && mealTimeCategory.subcategories) {
        // Breakfast
        const breakfastRecipes = Object.values(categories)
            .flatMap(category => {
                if (category.recipes) {
                    return category.recipes.filter(recipe => 
                        recipe && recipe.tags.includes('Breakfast'));
                }
                if (category.subcategories) {
                    return Object.values(category.subcategories)
                        .flatMap(subcat => (subcat.recipes || [])
                            .filter(recipe => recipe && recipe.tags.includes('Breakfast')));
                }
                return [];
            });
        renderRecipesToGrid(breakfastRecipes, 'breakfast-grid');

        // Lunch
        const lunchRecipes = Object.values(categories)
            .flatMap(category => {
                if (category.recipes) {
                    return category.recipes.filter(recipe => 
                        recipe && recipe.tags.includes('Lunch'));
                }
                if (category.subcategories) {
                    return Object.values(category.subcategories)
                        .flatMap(subcat => (subcat.recipes || [])
                            .filter(recipe => recipe && recipe.tags.includes('Lunch')));
                }
                return [];
            });
        renderRecipesToGrid(lunchRecipes, 'lunch-grid');

        // Dinner
        const dinnerRecipes = Object.values(categories)
            .flatMap(category => {
                if (category.recipes) {
                    return category.recipes.filter(recipe => 
                        recipe && recipe.tags.includes('Dinner'));
                }
                if (category.subcategories) {
                    return Object.values(category.subcategories)
                        .flatMap(subcat => (subcat.recipes || [])
                            .filter(recipe => recipe && recipe.tags.includes('Dinner')));
                }
                return [];
            });
        renderRecipesToGrid(dinnerRecipes, 'dinner-grid');
    }

    // Handle By Cuisine section
    const cuisineCategory = categories['1'];
    if (cuisineCategory && cuisineCategory.subcategories) {
        // African
        const africanRecipes = cuisineCategory.subcategories['1a']?.recipes || [];
        renderRecipesToGrid(africanRecipes, 'african-grid');

        // Asian
        const asianRecipes = cuisineCategory.subcategories['1b']?.recipes || [];
        renderRecipesToGrid(asianRecipes, 'asian-grid');

        // European
        const europeanRecipes = cuisineCategory.subcategories['1c']?.recipes || [];
        renderRecipesToGrid(europeanRecipes, 'european-grid');
    }

    // Handle Desserts section
    const dessertCategory = categories['3'];
    if (dessertCategory && dessertCategory.recipes) {
        renderRecipesToGrid(dessertCategory.recipes, 'desserts-grid');
    }

    // Handle Healthy section
    const healthyCategory = categories['4'];
    if (healthyCategory && healthyCategory.recipes) {
        renderRecipesToGrid(healthyCategory.recipes, 'healthy-grid');
    }

    // Handle Snacks section
    const snacksCategory = categories['5'];
    if (snacksCategory && snacksCategory.recipes) {
        renderRecipesToGrid(snacksCategory.recipes, 'snacks-grid');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeRecipeGrids();

    // Add click event listeners to sidebar links for smooth scrolling
    const sidebarLinks = document.querySelectorAll('.category, .nav-item');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const categoryId = link.getAttribute('data-category');
            let targetSection;

            // Map category IDs to section IDs
            switch(categoryId) {
                case '1':
                case '1a':
                case '1b':
                case '1c':
                    targetSection = document.querySelector('.cuisine');
                    break;
                case '2':
                case '2a':
                case '2b':
                case '2c':
                    targetSection = document.querySelector('.meal-time');
                    break;
                case '3':
                    targetSection = document.querySelector('.desserts');
                    break;
                case '4':
                    targetSection = document.querySelector('.healthy');
                    break;
                case '5':
                    targetSection = document.querySelector('.snacks');
                    break;
            }

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                // Close sidebar on mobile
                const sidebar = document.querySelector('aside');
                const overlay = document.querySelector('.sidebar-overlay');
                if (sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                }
            }
        });
    });

    // Add smooth scrolling for dropdown menu links
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                // Close dropdown if on mobile
                const dropdown = link.closest('.dropdown-content');
                if (dropdown) {
                    dropdown.style.display = 'none';
                    setTimeout(() => {
                        dropdown.style.display = '';
                    }, 500);
                }
            }
        });
    });
});