export class SearchController {
    constructor(newsAPI, uiController) {
        this.newsAPI = newsAPI;
        this.uiController = uiController;
        this.searchInput = document.getElementById('searchInput');
        this.setupSearchHandler();
    }

    setupSearchHandler() {
        let debounceTimer;
        
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const query = e.target.value.trim();
                if (query.length >= 3) {
                    this.uiController.showLoading();
                    const newsData = await this.newsAPI.searchNews(query);
                    if (newsData) {
                        this.uiController.displayArticles(newsData.articles);
                        this.uiController.updateLoadMoreButton(newsData.hasMore);
                    }
                    this.uiController.hideLoading();
                }
            }, 500);
        });
    }
} 