import { SkeletonLoader } from '../components/SkeletonLoader.js';

export class UIController {
    constructor() {
        this.newsGrid = document.getElementById('newsGrid');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.placeholderImage = '/images/placeholder.png';
        this.currentCategory = 'latest';
        this.currentPage = 1;
        this.itemsPerPage = 12;

        // Create pagination container if it doesn't exist
        if (!this.paginationContainer) {
            this.paginationContainer = document.createElement('div');
            this.paginationContainer.id = 'paginationContainer';
            this.paginationContainer.className = 'mt-8';
            this.newsGrid.parentNode.insertBefore(this.paginationContainer, this.newsGrid.nextSibling);
        }
    }

    createPaginationControls(totalResults) {
        const totalPages = Math.ceil(totalResults / this.itemsPerPage);
        let paginationHTML = `
            <div class="flex items-center justify-center space-x-2 mt-8">
                <button 
                    class="px-4 py-2 rounded-full ${this.currentPage === 1 ? 'bg-gray-700 cursor-not-allowed' : 'bg-news-accent hover:bg-blue-600'} transition-colors"
                    ${this.currentPage === 1 ? 'disabled' : ''}
                    data-page="${this.currentPage - 1}">
                    Previous
                </button>
                ${this.generatePageNumbers(totalPages)}
                <button 
                    class="px-4 py-2 rounded-full ${this.currentPage === totalPages ? 'bg-gray-700 cursor-not-allowed' : 'bg-news-accent hover:bg-blue-600'} transition-colors"
                    ${this.currentPage === totalPages ? 'disabled' : ''}
                    data-page="${this.currentPage + 1}">
                    Next
                </button>
            </div>
        `;

        this.paginationContainer.innerHTML = paginationHTML;
        this.setupPaginationHandlers();
    }

    generatePageNumbers(totalPages) {
        let pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages.map(page => {
            if (page === '...') {
                return `<span class="px-4 py-2">...</span>`;
            }
            return `
                <button 
                    class="px-4 py-2 rounded-full ${page === this.currentPage ? 'bg-news-accent' : 'hover:bg-gray-800'} transition-colors"
                    data-page="${page}">
                    ${page}
                </button>
            `;
        }).join('');
    }

    setupPaginationHandlers() {
        this.paginationContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && !button.disabled) {
                const page = parseInt(button.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    const event = new CustomEvent('pageChange', { detail: { page } });
                    document.dispatchEvent(event);
                }
            }
        });
    }

    displayTrendingNews(articles) {
        const trendingSection = document.getElementById('trendingNews');
        if (!trendingSection) return;

        trendingSection.classList.remove('hidden');
        const trendingGrid = trendingSection.querySelector('.grid');
        
        const trendingHTML = articles.slice(0, 4).map(article => this.createTrendingCard(article)).join('');
        trendingGrid.innerHTML = trendingHTML;
    }

    createTrendingCard(article) {
        return `
            <article class="relative overflow-hidden rounded-lg shadow-lg group h-64">
                <div class="absolute inset-0">
                    <img 
                        src="${article.image_url || this.placeholderImage}" 
                        alt="${article.title}"
                        class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        onerror="this.onerror=null; this.src='${this.placeholderImage}';">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-4">
                    <h3 class="text-lg font-bold text-white mb-2 line-clamp-2">
                        <a href="${article.link}" target="_blank" class="hover:text-news-accent">
                            ${article.title}
                        </a>
                    </h3>
                    <div class="flex items-center justify-between text-sm text-gray-300">
                        <span>${article.source_name || 'Unknown Source'}</span>
                        <span>${new Date(article.pubDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </article>
        `;
    }

    createArticleCard(article) {
        const pubDate = new Date(article.pubDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <article class="bg-news-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full">
                <div class="relative overflow-hidden group">
                    ${article.image_url ? `
                        <img src="${article.image_url}" 
                             alt="${article.title}"
                             class="w-full h-48 md:h-56 object-cover transform transition-transform duration-300 group-hover:scale-110"
                             onerror="this.onerror=null; this.src='${this.placeholderImage}';">
                    ` : `
                        <div class="w-full h-48 md:h-56 bg-gray-800 flex items-center justify-center">
                            <img src="${this.placeholderImage}" 
                                 alt="No image available" 
                                 class="w-16 h-16 opacity-50">
                        </div>
                    `}
                    <div class="absolute top-2 right-2 flex flex-wrap gap-2 max-w-[calc(100%-1rem)]">
                        ${article.category?.map(cat => `
                            <span class="px-2 py-1 bg-news-accent/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                ${cat}
                            </span>
                        `).join('') || ''}
                    </div>
                    ${article.source_icon ? `
                        <div class="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1">
                            <img src="${article.source_icon}" alt="${article.source_name}" class="w-6 h-6">
                        </div>
                    ` : ''}
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <div class="flex items-center justify-between mb-2 text-sm text-gray-400">
                        <span>${article.source_name || 'Unknown Source'}</span>
                        <span>${pubDate}</span>
                    </div>
                    <h2 class="text-lg font-semibold mb-2 line-clamp-2 hover:text-news-accent transition-colors">
                        <a href="${article.link}" target="_blank" class="hover:underline">
                            ${article.title}
                        </a>
                    </h2>
                    <p class="text-gray-400 mb-4 line-clamp-3 text-sm flex-grow">
                        ${article.description || 'No description available'}
                    </p>
                    <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                        ${article.creator ? `
                            <span class="text-sm text-gray-500 line-clamp-1 flex-1 mr-4">
                                By ${Array.isArray(article.creator) ? article.creator[0] : article.creator}
                            </span>
                        ` : '<span></span>'}
                        <a href="${article.link}" 
                           target="_blank"
                           class="px-4 py-2 bg-news-accent text-white rounded-full hover:bg-blue-600 transition-colors text-sm whitespace-nowrap">
                            Read More
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    displayArticles(articles, append = false) {
        if (!append) {
            this.newsGrid.innerHTML = '';
        }
        
        if (!articles || articles.length === 0) {
            this.newsGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <h2 class="text-xl text-gray-400">No articles found</h2>
                </div>
            `;
            return;
        }

        // Filter out duplicate articles
        const filteredArticles = articles.filter(article => !article.duplicate);
        
        const newContent = filteredArticles.map(article => this.createArticleCard(article)).join('');
        if (append) {
            this.newsGrid.insertAdjacentHTML('beforeend', newContent);
        } else {
            this.newsGrid.innerHTML = newContent;
        }
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    showSkeletonLoader() {
        this.newsGrid.innerHTML = SkeletonLoader.getMultipleSkeletons(8);
    }

    setActiveCategory(category) {
        const buttons = document.querySelectorAll('nav button');
        buttons.forEach(btn => {
            const isActive = btn.textContent.toLowerCase() === category;
            btn.classList.toggle('bg-news-accent', isActive);
            btn.classList.toggle('hover:bg-gray-800', !isActive);
        });
        this.currentCategory = category;
        this.currentPage = 1; // Reset page when changing category
    }
}