const express = require('express');
const countryRoutes = require('./routes/countryRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/', countryRoutes);

// Health check / Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Country Currency API is running',
        version: '1.0.0',
        endpoints: {
            refresh: 'POST /countries/refresh',
            getAllCountries: 'GET /countries',
            filterByRegion: 'GET /countries?region=Africa',
            filterByCurrency: 'GET /countries?currency=NGN',
            sortByGDP: 'GET /countries?sort=gdp_desc',
            getCountryByName: 'GET /countries/:name',
            deleteCountry: 'DELETE /countries/:name',
            getStatus: 'GET /status',
            getSummaryImage: 'GET /countries/image'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log('='.repeat(50));
});

module.exports = app;