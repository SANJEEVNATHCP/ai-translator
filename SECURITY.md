# API Security Implementation Guide

## 🔒 Security Features Implemented

### 1. **Backend Server (`server.js`)**
- All API calls are proxied through a secure backend
- API keys are stored in environment variables (never exposed to client)
- Server handles authentication and makes requests to OpenRouter API

### 2. **Authentication**
- Client-side API key is different from server API key
- Client sends key in `Authorization: Bearer` header
- Server validates key using constant-time comparison (prevents timing attacks)

### 3. **Rate Limiting**
- Global: 100 requests per 15 minutes per IP
- API endpoints: 30 requests per minute
- Prevents abuse and DDoS attacks

### 4. **CORS Protection**
- Only allowed origins can access the API
- Configure in `.env` file with `ALLOWED_ORIGINS`

### 5. **Security Headers**
- Helmet.js sets security headers automatically
- Includes: CSP, X-Frame-Options, X-Content-Type-Options, etc.

### 6. **Input Sanitization**
- All user input is sanitized to prevent injection attacks
- Maximum input length: 10,000 characters
- HTML tags are removed

### 7. **Request Validation**
- Request size limited to 10MB
- Only POST and GET methods allowed
- Timeout: 30 seconds per request

## 🚀 Setup Instructions

### Prerequisites
```bash
npm install
```

### Environment Variables
Create a `.env` file in your project root:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
REFERER_URL=https://yourdomain.com
```

### Starting the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 📝 API Endpoints

### Health Check
```
GET /health
```

### Chat Completion
```
POST /api/chat
Authorization: Bearer YOUR_CLIENT_API_KEY
Content-Type: application/json

{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "Hello"}
  ],
  "model": "openai/gpt-3.5-turbo"
}
```

### Translation
```
POST /api/translate
Authorization: Bearer YOUR_CLIENT_API_KEY
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "sourceLang": "en",
  "targetLang": "hi"
}
```

## 🔑 Key Security Points

### ✅ DO:
- Store API keys in `.env` file (never in code)
- Use HTTPS in production
- Validate all user inputs
- Use environment variables for configuration
- Implement CORS properly
- Use rate limiting
- Log security events

### ❌ DON'T:
- Hardcode API keys in JavaScript files
- Expose API keys to the browser console
- Trust client-provided data
- Use HTTP in production
- Disable rate limiting
- Reveal error details to clients
- Store sensitive data in localStorage unencrypted

## 🛡️ Production Checklist

- [ ] Update `ALLOWED_ORIGINS` to your actual domain
- [ ] Change `NODE_ENV` to `production`
- [ ] Use HTTPS only
- [ ] Set strong `CLIENT_API_KEY` values
- [ ] Enable proper logging and monitoring
- [ ] Set up rate limit thresholds based on expected usage
- [ ] Test CORS configuration
- [ ] Review and customize security headers
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Keep dependencies updated: `npm audit fix`

## 🔍 Monitoring & Logging

Add monitoring to track:
- Failed authentication attempts
- Rate limit violations
- API errors
- Unusual patterns

Example with Morgan (HTTP logger):
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

## 📚 Additional Resources

- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
