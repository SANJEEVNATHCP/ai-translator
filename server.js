// Secure Backend Server for API handling
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

// ============= SECURITY MIDDLEWARE =============

// Set security headers
app.use(helmet());

// CORS configuration - restrict to your domain
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

// Rate limiting - prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for API endpoint
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit to 30 requests per minute
    skipSuccessfulRequests: false,
});

// ============= MIDDLEWARE HELPERS =============

// Validate API key from environment
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    const validKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API key' });
    }
    
    // Use constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(validKey))) {
        return res.status(403).json({ error: 'Invalid API key' });
    }
    
    next();
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .trim()
        .substring(0, 10000); // Limit input length
};

// ============= API ENDPOINTS =============

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Chat completion endpoint - SECURED
 */
app.post('/api/chat', apiLimiter, validateApiKey, async (req, res) => {
    try {
        const { messages, model = 'openai/gpt-3.5-turbo' } = req.body;
        
        // Validate input
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }
        
        // Sanitize all messages
        const sanitizedMessages = messages.map(msg => ({
            role: msg.role,
            content: sanitizeInput(msg.content)
        }));
        
        // Make request to OpenRouter API (do not expose API key to client)
        const openrouterResponse = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: model,
                messages: sanitizedMessages,
                temperature: 0.7,
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.REFERER_URL || 'http://localhost:3000',
                    'X-Title': 'Bharat Voice Translator'
                },
                timeout: 30000 // 30 second timeout
            }
        );
        
        // Return only necessary data to client
        res.json({
            content: openrouterResponse.data.choices[0].message.content,
            model: openrouterResponse.data.model,
            usage: {
                prompt_tokens: openrouterResponse.data.usage.prompt_tokens,
                completion_tokens: openrouterResponse.data.usage.completion_tokens
            }
        });
        
    } catch (error) {
        console.error('API Error:', error.message);
        
        // Don't expose internal error details to client
        if (error.response?.status === 401) {
            return res.status(503).json({ error: 'API authentication failed' });
        }
        
        res.status(500).json({ error: 'Failed to process request' });
    }
});

/**
 * Translation endpoint - SECURED
 */
app.post('/api/translate', apiLimiter, validateApiKey, async (req, res) => {
    try {
        const { text, sourceLang, targetLang } = req.body;
        
        // Validate input
        if (!text || !sourceLang || !targetLang) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const sanitizedText = sanitizeInput(text);
        
        // Call OpenRouter for translation
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}. Respond with ONLY the translated text, no explanations.`
                    },
                    {
                        role: 'user',
                        content: sanitizedText
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.REFERER_URL || 'http://localhost:3000',
                    'X-Title': 'Bharat Voice Translator'
                },
                timeout: 30000
            }
        );
        
        res.json({
            translated: response.data.choices[0].message.content,
            sourceLang,
            targetLang
        });
        
    } catch (error) {
        console.error('Translation Error:', error.message);
        res.status(500).json({ error: 'Translation failed' });
    }
});

// ============= ERROR HANDLING =============

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============= SERVER STARTUP =============

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔒 Secure API Server running on port ${PORT}`);
    console.log(`✓ CORS enabled`);
    console.log(`✓ Rate limiting active`);
    console.log(`✓ Security headers configured`);
});

module.exports = app;
