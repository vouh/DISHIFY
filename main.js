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
    const menuBtn = document.querySelector('.mobile-menu-btn i');
    const body = document.body;

    if (!navLinks || !menuBtn) {
        console.error('Mobile menu elements not found');
        return;
    }

    const isOpen = navLinks.classList.contains('active');

    if (isOpen) {
        // Close menu
        navLinks.classList.remove('active');
        menuBtn.classList.remove('fa-times');
        menuBtn.classList.add('fa-bars');
        body.classList.remove('overflow-hidden');
    } else {
        // Open menu
        navLinks.classList.add('active');
        menuBtn.classList.remove('fa-bars');
        menuBtn.classList.add('fa-times');
        body.classList.add('overflow-hidden');
    }
}

// Handle mobile dropdown toggles
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const content = this.nextElementSibling;
                const isOpen = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                        const c = d.querySelector('.dropdown-content');
                        if (c) c.style.display = 'none';
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
                content.style.display = isOpen ? 'none' : 'block';
            }
        });
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks && menuBtn && navLinks.classList.contains('active')) {
        if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
            toggleMobileMenu();
        }
    }
});

// Global variables to store all recipes and filtered recipes
let allRecipes = [];
let filteredRecipes = [];

// Function to fetch and flatten all recipes from the JSON file
async function fetchAllRecipes() {
    try {
        console.log('Fetching recipes...');
        const response = await fetch('recipes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Recipes data received:', data);
        
        // Flatten the nested structure to get all recipes
        allRecipes = Object.values(data.categories).flatMap(category => {
            if (category.recipes) {
                return category.recipes;
            }
            if (category.subcategories) {
                return Object.values(category.subcategories).flatMap(subcat => subcat.recipes || []);
            }
            return [];
        });
        
        console.log('Total recipes found:', allRecipes.length);
        filteredRecipes = [...allRecipes];
        return allRecipes;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

// Function to display recipes in the search results
function displaySearchResults(recipes) {
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResultsList = document.getElementById('searchResultsList');
    
    if (!searchResultsContainer || !searchResultsList) {
        console.error('Search results containers not found');
        return;
    }

    // Clear previous results
    searchResultsList.innerHTML = '';

    if (recipes.length === 0) {
        searchResultsList.innerHTML = `
            <div class="no-results-message">
                <i class="fas fa-search"></i>
                <p>No recipes found</p>
                <p>Try different keywords or browse our categories</p>
            </div>`;
    } else {
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'search-result-card';
            
            recipeCard.innerHTML = `
                <img src="${recipe.imageUrl || 'images/default-recipe.jpg'}" alt="${recipe.name}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-title">${recipe.name}</div>
                    <div class="search-result-tags">
                        ${recipe.tags.map(tag => `<span class="search-result-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="search-result-stats">
                        <span><i class="far fa-clock"></i>${recipe.cookTime}</span>
                        <span><i class="far fa-heart"></i>${recipe.likes || 0} likes</span>
                    </div>
                </div>
            `;

            recipeCard.addEventListener('click', () => {
                console.log('Recipe clicked:', recipe.name);
                localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                window.location.href = `recipe-detail.html?id=${recipe.id}`;
            });

            searchResultsList.appendChild(recipeCard);
        });
    }

    // Show the container with animation
    searchResultsContainer.style.display = 'block';
    setTimeout(() => {
        searchResultsContainer.classList.add('show');
    }, 10);
}

// Function to handle search input
function handleSearch(searchTerm) {
    console.log('Handling search for term:', searchTerm);
    
    if (!searchTerm.trim()) {
        filteredRecipes = [...allRecipes];
        return [];
    }

    searchTerm = searchTerm.toLowerCase();
    
    const results = allRecipes.filter(recipe => {
        const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
        const tagMatch = recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const descriptionMatch = recipe.description.toLowerCase().includes(searchTerm);
        const ingredientMatch = recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchTerm)
        );
        
        return nameMatch || tagMatch || descriptionMatch || ingredientMatch;
    });

    console.log('Search results:', results.length);
    return results;
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing search...');
    
    // Fetch all recipes first
    await fetchAllRecipes();

    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const searchContainer = document.querySelector('.search-container');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const closeResultsBtn = document.querySelector('.close-results-btn');

    console.log('Search elements found:', {
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        searchContainer: !!searchContainer,
        searchResultsContainer: !!searchResultsContainer
    });

    if (!searchInput || !searchButton || !searchContainer || !searchResultsContainer) {
        console.error('Some search elements are missing');
        return;
    }

    // Handle input typing with debounce
    let debounceTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        
        debounceTimeout = setTimeout(() => {
            const searchTerm = e.target.value;
            console.log('Searching for:', searchTerm);
            
            const results = handleSearch(searchTerm);
            console.log('Found results:', results.length);

            // Hide suggestions when showing search results
            const suggestionsContainer = searchContainer.querySelector('.search-suggestions');
            if (suggestionsContainer) {
                suggestionsContainer.style.display = searchTerm.trim() ? 'none' : 'flex';
            }

            // Display new search results if there's a search term
            if (searchTerm.trim()) {
                displaySearchResults(results);
            } else {
                searchResultsContainer.style.display = 'none';
                searchResultsContainer.classList.remove('show');
            }
        }, 300); // Debounce delay of 300ms
    });

    // Handle search button click
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value;
        if (searchTerm.trim()) {
            const results = handleSearch(searchTerm);
            displaySearchResults(results);
        }
    });

    // Handle Enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = searchInput.value;
            if (searchTerm.trim()) {
                const results = handleSearch(searchTerm);
                displaySearchResults(results);
            }
        }
    });

    // Handle close button click
    if (closeResultsBtn) {
        closeResultsBtn.addEventListener('click', () => {
            searchResultsContainer.classList.remove('show');
            setTimeout(() => {
                searchResultsContainer.style.display = 'none';
            }, 300);
            
            // Show suggestions again
            const suggestionsContainer = searchContainer.querySelector('.search-suggestions');
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'flex';
            }
        });
    }

    // Handle suggestion clicks
    const suggestions = document.querySelectorAll('.suggestion-item');
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            console.log('Suggestion clicked');
            const searchTerm = suggestion.querySelector('span').textContent.split(': ')[1];
            searchInput.value = searchTerm;
            
            const results = handleSearch(searchTerm);
            console.log('Suggestion search results:', results.length);
            
            displaySearchResults(results);
            
            // Hide suggestions
            const suggestionsContainer = searchContainer.querySelector('.search-suggestions');
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        });
    });
});

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
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    document.getElementById('currentDay').textContent = days[now.getDay()];
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
}

// Update time every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call

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