const ExploreAPI = {
    async getStories(search = '', category = 'All', limit = 20, offset = 0) {
        try {
            const url = new URL(`${API_URL}/explore/stories`);
            if (search) url.searchParams.append('search', search);
            if (category) url.searchParams.append('category', category);
            url.searchParams.append('limit', limit);
            url.searchParams.append('offset', offset);

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching explore stories:', error);
            return { success: false, message: 'Network error' };
        }
    },
    
    async getCategories() {
        try {
            const response = await fetch(`${API_URL}/categories`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, message: 'Network error' };
        }
    }
};

// Common UI Helper for formatting dates
function formatExploreDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Note: auth.js is loaded so Auth.updateNav() has already run if included correctly.
    // We don't call Auth.requireAuth() because Explore is public.

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.getElementById('category-filters');
    const resultsContainer = document.getElementById('explore-results');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    let currentSearch = '';
    let currentCategory = 'All';

    // Initialize Page
    await loadCategories();
    await fetchAndRenderStories();

    // Event Listeners
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentSearch = searchInput.value.trim();
        fetchAndRenderStories();
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentSearch = '';
            searchInput.value = '';
            setCategoryActive('All');
            fetchAndRenderStories();
        });
    }

    // Functions
    async function loadCategories() {
        const res = await ExploreAPI.getCategories();
        if (res.success && res.categories) {
            res.categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline-primary rounded-pill category-btn text-nowrap';
                btn.dataset.category = cat.name;
                btn.textContent = cat.name;
                
                btn.addEventListener('click', () => {
                    setCategoryActive(cat.name);
                    fetchAndRenderStories();
                });
                
                categoryFilters.appendChild(btn);
            });
            
            // Attach event to the static "All" button
            const allBtn = categoryFilters.querySelector('[data-category="All"]');
            if (allBtn) {
                allBtn.addEventListener('click', () => {
                    setCategoryActive('All');
                    fetchAndRenderStories();
                });
            }
        }
    }

    function setCategoryActive(catName) {
        currentCategory = catName;
        const btns = categoryFilters.querySelectorAll('.category-btn');
        btns.forEach(b => {
            if (b.dataset.category === catName) {
                b.classList.remove('btn-outline-primary');
                b.classList.add('btn-primary');
            } else {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
            }
        });
    }

    async function fetchAndRenderStories() {
        // Show loading
        resultsContainer.innerHTML = '';
        loadingState.classList.remove('d-none');
        emptyState.classList.add('d-none');
        errorState.classList.add('d-none');

        const res = await ExploreAPI.getStories(currentSearch, currentCategory);
        
        loadingState.classList.add('d-none');

        if (res.success) {
            const stories = res.stories;
            
            if (stories.length === 0) {
                emptyState.classList.remove('d-none');
            } else {
                stories.forEach(story => {
                    resultsContainer.appendChild(createStoryCard(story));
                });
            }
        } else {
            errorState.classList.remove('d-none');
        }
    }

    function createStoryCard(story) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 d-flex align-items-stretch';

        const imgHtml = story.cover_image 
            ? `<img src="${story.cover_image.image_url}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${story.title}">`
            : `<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center text-white" style="height: 200px;"><i class="bi bi-image fs-1 opacity-50"></i></div>`;

        const avatarHtml = story.author.profile_image_url
            ? `<img src="${story.author.profile_image_url}" class="rounded-circle me-2" style="width:24px; height:24px; object-fit:cover;">`
            : `<div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style="width:24px; height:24px; font-size:12px;">${story.author.full_name.charAt(0).toUpperCase()}</div>`;

        col.innerHTML = `
            <div class="card shadow-sm w-100 border-0 h-100">
                ${imgHtml}
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary">${story.category ? story.category.name : 'General'}</span>
                        <small class="text-muted"><i class="bi bi-geo-alt"></i> ${story.location}</small>
                    </div>
                    
                    <h5 class="card-title fw-bold text-truncate">${story.title}</h5>
                    
                    <p class="card-text text-muted mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${story.description}
                    </p>
                    
                    <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                        <a href="profile.html?id=${story.author.id}" class="text-decoration-none text-dark d-flex align-items-center author-link">
                            ${avatarHtml}
                            <span class="small text-truncate" style="max-width: 100px;">${story.author.full_name}</span>
                        </a>
                        <small class="text-muted">${formatExploreDate(story.created_at)}</small>
                    </div>
                    
                    <a href="story.html?id=${story.id}" class="btn btn-outline-primary w-100 mt-3 rounded-pill">View Story</a>
                </div>
            </div>
        `;
        
        return col;
    }
});
