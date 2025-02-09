export class CacheService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.trendingTimeout = 15 * 60 * 1000; // 15 minutes for trending
    }

    set(key, data, isTrending = false) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            timeout: isTrending ? this.trendingTimeout : this.cacheTimeout
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > cached.timeout;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    getTimeRemaining(key) {
        const cached = this.cache.get(key);
        if (!cached) return 0;
        
        return Math.max(0, cached.timeout - (Date.now() - cached.timestamp));
    }

    clear(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    isValid(key) {
        return this.get(key) !== null;
    }
} 