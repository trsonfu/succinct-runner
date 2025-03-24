const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3007;
const RUST_SERVER_URL = 'http://127.0.0.1:8080';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://succinct-runner.tempestcrypto.net"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: ['https://succinct-runner.tempestcrypto.net', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Logging middleware
app.use(morgan('combined'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../web')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API endpoints
app.post('/api/generate-proof', async (req, res) => {
    try {
        const { score } = req.body;
        
        // Input validation
        if (!score || typeof score !== 'number' || score <= 0) {
            return res.status(400).json({ 
                error: 'Invalid score',
                details: 'Score must be a positive number'
            });
        }

        // Forward request to Rust server
        const response = await axios.post(`${RUST_SERVER_URL}/prove`, { score });
        
        res.json({
            success: true,
            ...response.data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Proof generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate proof',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server URL: https://succinct-runner.tempestcrypto.net`);
}); 