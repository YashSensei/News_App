const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Cache for API responses
const cache = {
    categories: new Map(),
    trending: {
        data: null,
        timestamp: null
    }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TRENDING_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// News API endpoint for latest news
app.get('/api/news', async (req, res) => {
    try {
        const { page, category } = req.query;
        const apiKey = process.env.NEWS_API_KEY;
        
        // Check cache for non-paginated requests
        const cacheKey = category || 'latest';
        if (!page && cache.categories.has(cacheKey)) {
            const cached = cache.categories.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log(`Serving cached data for ${cacheKey}`);
                return res.json(cached.data);
            }
            cache.categories.delete(cacheKey);
        }

        let url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en&country=in`;
        
        if (category && category !== 'latest') {
            url += `&category=${category.toLowerCase()}`;
        }
        
        if (page) {
            url += `&page=${page}`;
        }

        console.log('Making request to:', url);
        const response = await axios.get(url);

        // Cache the response if it's not paginated
        if (!page) {
            cache.categories.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Add trending news endpoint
app.get('/api/news/trending', async (req, res) => {
    try {
        if (cache.trending.data && 
            Date.now() - cache.trending.timestamp < TRENDING_CACHE_DURATION) {
            return res.json({
                status: 'success',
                results: cache.trending.data
            });
        }

        const apiKey = process.env.NEWS_API_KEY;
        const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en&country=in&category=top`;

        const response = await axios.get(url);
        
        if (response.data.status === "success") {
            cache.trending = {
                data: response.data.results,
                timestamp: Date.now()
            };
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending:', error);
        res.status(500).json({ error: 'Failed to fetch trending news' });
    }
});

// Search endpoint
app.get('/api/news/search', async (req, res) => {
    try {
        const { q, page } = req.query;
        const apiKey = process.env.NEWS_API_KEY;
        
        let url = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=en&qInTitle=${encodeURIComponent(q)}`;
        
        if (page) {
            url += `&page=${page}`;
        }

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error searching news:', error);
        res.status(500).json({ error: 'Failed to search news' });
    }
});

// Catch all routes to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app; 