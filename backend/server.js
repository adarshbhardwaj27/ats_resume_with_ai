const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '10mb' }));

// Simple rate limiting (per IP, 30 requests per minute)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 30;

app.use('/api', (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip).filter(t => t > windowStart);
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    if (timestamps.length > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', analyzeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    const provider = process.env.AI_PROVIDER || 'openai';
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`AI Provider: ${provider}`);
    console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
    console.log(`Gemini API Key configured: ${!!process.env.GEMINI_API_KEY}`);
});
