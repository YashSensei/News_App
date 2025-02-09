export class CategoryController {
    constructor(newsAPI, uiController, cacheService) {
        this.newsAPI = newsAPI;
        this.uiController = uiController;
        this.cacheService = cacheService;
        this.setupCategoryHandlers();
        this.pendingCategory = null;
    }

    async switchCategory(category) {
        // Cancel any pending category switch
        this.pendingCategory = category;
        
        // Update UI immediately
        this.uiController.setActiveCategory(category);
        this.uiController.showSkeletonLoader();

        // Check cache first
        const cachedData = this.cacheService.get(category);
        if (cachedData) {
            console.log(`Using cached data for ${category}`);
            this.uiController.displayArticles(cachedData.articles);
            if (cachedData.totalResults > 0) {
                this.uiController.createPaginationControls(cachedData.totalResults);
            }
            return;
        }

        // If not in cache, fetch new data
        try {
            const newsData = await this.newsAPI.getTopHeadlines(category === 'latest' ? null : category);
            
            // Check if category hasn't changed during fetch
            if (this.pendingCategory === category && newsData?.articles) {
                this.cacheService.set(category, newsData);
                this.uiController.displayArticles(newsData.articles);
                if (newsData.totalResults > 0) {
                    this.uiController.createPaginationControls(newsData.totalResults);
                }
            }
        } catch (error) {
            console.error('Error loading category news:', error);
            this.uiController.displayArticles([]);
        }
    }

    setupCategoryHandlers() {
        const categoryButtons = document.querySelectorAll('nav button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.textContent.toLowerCase();
                this.switchCategory(category);
            });
        });
    }
} 