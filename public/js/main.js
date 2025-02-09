import { NewsAPI } from './services/newsAPI.js';
import { UIController } from './controllers/UIController.js';
import { SearchController } from './controllers/SearchController.js';
import { CategoryController } from './controllers/CategoryController.js';
import { CacheService } from './services/CacheService.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize services
    const cacheService = new CacheService();
    const newsAPI = new NewsAPI(cacheService);
    const uiController = new UIController();
    
    // Initialize controllers
    const searchController = new SearchController(newsAPI, uiController);
    const categoryController = new CategoryController(newsAPI, uiController, cacheService);

    // Load initial news with skeleton
    uiController.showSkeletonLoader();
    try {
        // First try to get trending news
        const trendingNews = await newsAPI.getTrending();
        if (trendingNews && Array.isArray(trendingNews)) {
            uiController.displayTrendingNews(trendingNews);
        }

        // Then get regular news
        const newsData = await newsAPI.getTopHeadlines();
        if (newsData?.articles) {
            cacheService.set('latest', newsData);
            uiController.displayArticles(newsData.articles);
            if (newsData.totalResults > 0) {
                uiController.createPaginationControls(newsData.totalResults);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        uiController.displayArticles([]);
    }

    // Handle pagination
    document.addEventListener('pageChange', async (e) => {
        const page = e.detail.page;
        uiController.showSkeletonLoader();
        try {
            const newsData = await newsAPI.getTopHeadlines(null, true, page);
            if (newsData?.articles) {
                uiController.displayArticles(newsData.articles);
                uiController.createPaginationControls(newsData.totalResults);
            }
        } catch (error) {
            console.error('Error changing page:', error);
        }
    });

    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', 
                document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            );
        });

        // Set initial theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
    }

    // Handle logo click for trending news
    const logo = document.querySelector('.text-news-accent');
    if (logo) {
        logo.addEventListener('click', async () => {
            uiController.showSkeletonLoader();
            try {
                const trendingNews = await newsAPI.getTrending();
                if (trendingNews) {
                    uiController.displayTrendingNews(trendingNews);
                }
            } catch (error) {
                console.error('Error loading trending news:', error);
            }
        });
    }
}); 