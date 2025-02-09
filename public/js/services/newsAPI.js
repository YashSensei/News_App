export class NewsAPI {
    constructor(cacheService) {
        this.nextPage = null;
        this.isLoading = false;
        this.baseUrl = window.location.port === '5500' ? 'http://localhost:3000' : '';
        this.currentCategory = null;
        this.placeholderImage = '/images/placeholder.png';
        this.cacheService = cacheService;
        this.pendingRequests = new Map();
    }

    async getTopHeadlines(category = null, forceFetch = false, page = 1) {
        const cacheKey = `${category || 'latest'}_page${page}`;
        
        // Check if there's a pending request for this category
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Check cache first if not forcing fetch
        if (!forceFetch) {
            const cachedData = this.cacheService.get(cacheKey);
            if (cachedData) {
                console.log(`Using cached data for ${cacheKey}`);
                return cachedData;
            }
        }

        if (this.isLoading) return null;
        
        this.isLoading = true;
        
        // Create a new promise for this request
        const requestPromise = (async () => {
            try {
                const params = new URLSearchParams();
                
                if (category && category !== 'latest') {
                    params.append('category', category);
                    this.currentCategory = category;
                }
                
                if (this.nextPage) {
                    params.append('page', this.nextPage);
                }

                const url = `${this.baseUrl}/api/news${params.toString() ? `?${params.toString()}` : ''}`;
                console.log('Fetching from:', url);
                
                const response = await fetch(url, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.status === "success") {
                    this.nextPage = data.nextPage;
                    const processedData = {
                        articles: data.results?.filter(article => article && article.title)
                            .map(article => ({
                                ...article,
                                image_url: this.isValidImageUrl(article.image_url) ? 
                                    article.image_url : this.placeholderImage
                            })) || [],
                        totalResults: data.totalResults,
                        hasMore: !!data.nextPage
                    };

                    // Cache the processed data
                    this.cacheService.set(cacheKey, processedData, category === 'latest');
                    return processedData;
                }
                
                if (data.error) {
                    console.error('API Error:', data.error);
                }
                return null;
            } catch (error) {
                console.error('Error fetching news:', error);
                return null;
            } finally {
                this.isLoading = false;
                this.pendingRequests.delete(cacheKey);
            }
        })();

        // Store the promise
        this.pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }

    async getTrending() {
        const cacheKey = 'trending';
        const cachedData = this.cacheService.get(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/news/trending`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === "success" && Array.isArray(data.results)) {
                const processedData = data.results.map(article => ({
                    ...article,
                    image_url: this.isValidImageUrl(article.image_url) ? 
                        article.image_url : this.placeholderImage
                }));
                this.cacheService.set(cacheKey, processedData, true);
                return processedData;
            }
            return null;
        } catch (error) {
            console.error('Error fetching trending:', error);
            return null;
        }
    }

    isValidImageUrl(url) {
        if (!url) return false;
        // Basic URL validation
        try {
            new URL(url);
            // Check if it's an image URL
            return url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i);
        } catch {
            return false;
        }
    }

    async loadMore() {
        if (!this.nextPage || this.isLoading) return null;
        return this.getTopHeadlines(this.currentCategory);
    }

    async searchNews(query) {
        if (this.isLoading) return null;
        
        this.isLoading = true;
        try {
            // Build query parameters
            const params = new URLSearchParams({
                q: query
            });

            if (this.nextPage) {
                params.append('page', this.nextPage);
            }

            // Make the API call
            const url = `${this.baseUrl}/api/news/search?${params.toString()}`;
            console.log('Searching at:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === "success") {
                this.nextPage = data.nextPage;
                return {
                    articles: data.results || [],
                    totalResults: data.totalResults,
                    hasMore: !!data.nextPage
                };
            }
            
            if (data.error) {
                console.error('API Error:', data.error);
            }
            return null;
        } catch (error) {
            console.error('Error searching news:', error);
            return null;
        } finally {
            this.isLoading = false;
        }
    }
} 