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

// Function to find a recipe by name in the categories data
function findRecipeByName(categories, recipeName) {
    for (const categoryId in categories) {
        const category = categories[categoryId];
        if (category.recipes) {
            const recipe = category.recipes.find(r => r.name === recipeName);
            if (recipe) return recipe;
        }
        if (category.subcategories) {
            for (const subcategoryId in category.subcategories) {
                const subcategory = category.subcategories[subcategoryId];
                const recipe = subcategory.recipes.find(r => r.name === recipeName);
                if (recipe) return recipe;
            }
        }
    }
    return null;
}

// Function to handle recipe card clicks
async function handleRecipeCardClick(recipeName) {
    const categories = await fetchRecipes();
    if (!categories) return;

    const recipe = findRecipeByName(categories, recipeName);
    if (recipe) {
        // Store the recipe data in localStorage
        localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
        // Redirect to the recipe detail page
        window.location.href = 'recipe-detail.html';
    }
}

// Add click event listeners to recipe cards when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        card.addEventListener('click', () => {
            const recipeName = card.querySelector('h3').textContent;
            handleRecipeCardClick(recipeName);
        });
    });
}); 