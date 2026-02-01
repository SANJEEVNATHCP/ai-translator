# Bharat Voice Translator - Build Prompts & Requirements

## Project Brief

**Project Name:** Bharat Voice Translator 🇮🇳  
**Version:** 1.0.0  
**Theme:** A celebration of Indian languages and culture - Republic Day 2026  
**Purpose:** A web-based multilingual translation and cultural assistant with AI-powered voice interaction

---

## Core Project Vision

> "Create a web-based application that combines real-time translation, speech recognition, and conversational AI to help users communicate across language barriers while learning about Indian culture. The app should support 12+ Indian languages and provide voice-based interaction with AI assistance."

---

## Functional Requirements & Prompts

### 1. Multi-Language Translation System

**Prompt:**
> Build a real-time translation feature that supports 12+ languages including English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Sanskrit, and Urdu. Implement live translation with debouncing to prevent excessive API calls. Include a character counter (0-∞) for the source text, dropdown selectors for source and target languages, and display error messages for failed translations with a loading indicator.

**Key Requirements:**
- Support for 12+ Indian and international languages
- Real-time translation with 500ms debounce
- Character count display in the input field
- Cache translations using browser sessionStorage for repeated queries
- Source and target language dropdown selectors
- Display translated text with proper HTML formatting
- Show loading indicators during translation
- Display error messages for translation failures
- Special character and diacritics support

---

### 2. Voice Input & Output System

**Prompt:**
> Implement Web Speech API integration for automatic voice input capture from the microphone. Include real-time listening indicators with visual feedback (pulse animation), support for continuous speech input, and automatic transcript conversion to text. Also implement Text-to-Speech functionality to speak translations aloud in the target language with multi-language voice support and auto-speak feature after voice-based translation.

**Key Requirements:**
- **Speech Recognition (Web Speech API):**
  - Automatic voice input capture from microphone
  - Real-time listening indicator with visual feedback
  - Support for continuous speech input
  - Voice visualization with pulse animation
  - Automatic transcript conversion to text
  
- **Text-to-Speech (Speech Synthesis API):**
  - Speak translations aloud in target language
  - Multi-language voice support
  - Auto-speak feature after voice-based translation
  - Mute/unmute functionality
  - Multiple voice options per language

---

### 3. AI-Powered Conversation Mode

**Prompt:**
> Create two operating modes for the assistant: (1) Command Mode for fast, quick voice commands for specific tasks, and (2) AI Mode for natural conversations with intelligent responses. Integrate OpenRouter API using GPT-3.5-turbo or similar models. Maintain conversation history (last 10 messages) with context-aware responses and support multi-turn dialogue. The AI should provide assistance with translation support, cultural knowledge about Indian festivals, bargaining help for Indian markets, emergency phrases for travelers, and tips for navigating Indian markets.

**Key Requirements:**
- Two distinct operating modes:
  - Command Mode: Fast voice commands
  - AI Mode: Natural conversations with intelligent responses
- OpenRouter API integration for LLM-powered responses
- Support GPT-3.5-turbo and other models
- Maintain conversation history (last 10 messages)
- Context-aware responses
- Multi-turn dialogue support
- API key management (hardcoded default + user override via localStorage)

---

### 4. AI Knowledge Base Capabilities

**Prompt:**
> Configure the AI assistant to provide expertise in the following areas: (1) Translation Support - help users translate between supported languages, (2) Cultural Knowledge - information about Indian festivals (Diwali, Holi, Eid, Pongal, Navratri, Christmas, Independence Day, Republic Day, Ganesh Chaturthi), (3) Bargaining Help - negotiation strategies for Indian markets covering vegetables, clothes, electronics, jewelry, street food, and auto-rickshaws, (4) Natural Conversation - friendly, helpful, and context-aware responses, (5) Emergency Phrases - critical phrases for travelers and visitors, and (6) Market Assistance - tips for navigating Indian markets and cultural spaces.

**Key Knowledge Domains:**
- Translation Support
- Indian Festivals & Holidays (Diwali, Holi, Eid, Pongal, Navratri, Christmas, Independence Day, Republic Day, Ganesh Chaturthi)
- Bargaining Tips (vegetables, clothes, electronics, jewelry, street food, auto-rickshaws)
- Emergency Phrases for travelers
- Market Navigation & Cultural Assistance
- Natural conversation abilities

---

### 5. Chat & Conversation Management

**Prompt:**
> Build a chat history display system that shows: (1) User messages in blue bubbles aligned right, (2) AI responses in gray bubbles aligned left, (3) System messages in yellow alerts centered, with timestamps for each message and iconography (👤 for user, 🤖 for AI, ⚠️ for system). Include conversation control features like clearing chat history with confirmation, loading persistent history from sessionStorage, and maintaining conversation context across messages.

**Key Requirements:**
- Chat history display with distinct message types:
  - User messages: blue bubbles, right-aligned, 👤 icon
  - AI responses: gray bubbles, left-aligned, 🤖 icon
  - System messages: yellow alerts, center-aligned, ⚠️ icon
- Timestamps for each message
- Clear conversation history with confirmation
- Load persistent history from sessionStorage
- Maintain conversation context across messages
- Automatic message persistence during session

---

### 6. User Interface & Experience Design

**Prompt:**
> Design a responsive, mobile-first user interface using Tailwind CSS. Create three main panels: (1) Translation Panel with source/target language selectors, text input with character counter, output display, copy and TTS buttons, (2) Voice Assistant Panel with microphone toggle, status indicator, and visual voice feedback with pulse animation, (3) Chat Panel with AI Mode toggle, chat history display, API key settings, and clear conversation button. Implement dark mode with CSS variables using Catppuccin-inspired colors and Indian theme colors (saffron, green, navy). Include an Ashoka wheel watermark background and ensure touch-friendly buttons (min-height: 44px) for mobile devices.

**UI Components:**
- Responsive grid layout (1 column mobile, 2+ columns desktop)
- **Header:**
  - App title and branding
  - Theme toggle (Light/Dark mode)
  - API key configuration option
  
- **Translation Panel:**
  - Source language dropdown
  - Source text input with character counter
  - Target language dropdown
  - Target text output display
  - Copy button
  - Text-to-Speech button
  
- **Voice Assistant Panel:**
  - Microphone toggle button
  - Assistant status indicator
  - Visual voice feedback (pulse animation)
  - Voice visualization indicator
  
- **Chat Panel:**
  - AI Mode toggle button
  - Chat history display area
  - API key settings (if needed)
  - Clear conversation button

**Design Features:**
- Mobile-first responsive design
- Tailwind CSS utility-first styling
- Dark mode with CSS variables
- Catppuccin-inspired color scheme
- Indian theme colors (saffron #FF9933, green #138808, navy #003399)
- Ashoka wheel watermark background
- Touch-friendly buttons (min-height: 44px)
- Smooth animations and transitions
- Accessibility support (keyboard navigation, screen readers)

---

### 7. API Integration & Security

**Prompt:**
> Implement secure backend API proxy using Express.js to handle all API calls. Store API keys in environment variables (never expose to client). Create authentication using Bearer token headers with constant-time comparison to prevent timing attacks. Set up rate limiting (100 requests per 15 minutes per IP globally, 30 requests per minute per endpoint). Configure CORS protection with allowed origins from .env, implement Helmet.js for security headers (CSP, X-Frame-Options, X-Content-Type-Options), sanitize all user input to prevent injection attacks (max 10,000 characters), and limit request size to 10MB with 30-second timeout. Support Google Translate API for text translation alongside OpenRouter API for AI responses.

**Backend Features:**
- Express.js server setup
- Environment variables for API keys and configuration
- Bearer token authentication
- Rate limiting (100 req/15 min globally, 30 req/min per endpoint)
- CORS protection with configurable allowed origins
- Helmet.js for security headers
- Input sanitization (max 10,000 characters, HTML removal)
- Request validation (10MB limit, 30s timeout)
- POST and GET methods only

**API Endpoints:**
- `GET /health` - Health check
- `POST /api/chat` - Chat completion with OpenRouter
- `POST /api/translate` - Text translation
- `POST /api/speak` - Text-to-speech

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5 | Semantic markup |
| **Frontend** | CSS3 + Tailwind | Styling and responsive design |
| **Frontend** | JavaScript (ES6+) | Application logic |
| **Frontend** | Web Speech API | Voice recognition & synthesis |
| **Frontend** | localStorage/sessionStorage | Client-side data persistence |
| **Backend** | Node.js | Runtime environment |
| **Backend** | Express.js | Web framework |
| **Backend** | Helmet | Security headers |
| **Backend** | express-rate-limit | Rate limiting |
| **Backend** | cors | CORS middleware |
| **Backend** | axios | HTTP requests |
| **Backend** | dotenv | Environment variables |
| **External API** | OpenRouter API | LLM/AI backend (GPT-3.5-turbo) |
| **External API** | Google Translate API | Text translation service |

---

## Module Architecture

### Frontend Modules

**1. app.js - Translation Service Layer**
- `translateText()` - Triggers on text input
- `performTranslation(sourceText, sourceLang, targetLang)` - Main translation logic
- Cache management with sessionStorage
- Debounced API calls (500ms)

**2. ai-voice-assistant.js - Voice I/O Handler**
- `startListening()` - Start speech recognition
- `stopListening()` - Stop speech recognition
- `speak(text, language)` - Text-to-speech output
- Voice visualization and pulse animation
- Real-time transcript handling

**3. conversation-ui.js - Chat Interface**
- `displayMessage(message, type)` - Show chat messages
- `clearHistory()` - Clear conversation with confirmation
- `loadHistory()` - Load persistent chat history
- Message formatting and timestamps
- Icon and styling for different message types

**4. openrouter-service.js - AI Integration**
- `initializeAssistant()` - Setup assistant mode
- `sendMessage(userMessage, mode)` - Send message to AI
- `getResponse(context)` - Get AI response with context
- Conversation history management
- Error handling and timeouts

**5. secure-client.js - Security & API Client**
- API key management (client-side)
- Secure API request construction
- Authorization header setup
- Error handling for API calls

### Backend Modules

**1. server.js - Express Server**
- Routes setup
- Middleware configuration (CORS, Helmet, rate-limiting)
- Environment variable loading
- Health check endpoint

---

## File Structure

```
project-root/
├── index.html              # Main UI markup
├── styles.css              # Custom CSS (Tailwind)
├── app.js                  # Translation features
├── ai-voice-assistant.js   # Voice I/O functionality
├── conversation-ui.js      # Chat interface
├── openrouter-service.js   # AI/LLM integration
├── secure-client.js        # Security & API client
├── server.js               # Express backend
├── package.json            # Dependencies
├── .env                    # Environment variables (git-ignored)
├── README.md               # Project documentation
├── requirement.md          # Detailed requirements
├── design.md               # Architecture documentation
├── SECURITY.md             # Security implementation guide
└── BUILD_PROMPTS.md        # This file

```

---

## Key Features Summary

### Translation Features
✅ 12+ language support (Indian & International)  
✅ Real-time translation with debouncing  
✅ Character counter  
✅ Translation caching with sessionStorage  
✅ Error handling and loading states  

### Voice Features
✅ Web Speech API integration  
✅ Continuous speech recognition  
✅ Text-to-speech output  
✅ Multi-language voice support  
✅ Visual feedback (pulse animation)  

### AI Features
✅ Two operating modes (Command & AI)  
✅ OpenRouter API integration  
✅ Conversation history (last 10 messages)  
✅ Context-aware responses  
✅ Knowledge base (festivals, bargaining, emergency phrases)  

### UI/UX Features
✅ Responsive design (mobile-first)  
✅ Dark mode with CSS variables  
✅ Indian theme colors  
✅ Ashoka wheel watermark  
✅ Touch-friendly buttons  
✅ Smooth animations  

### Security Features
✅ Backend API proxy  
✅ Environment variable API keys  
✅ Bearer token authentication  
✅ Rate limiting (100/15min global, 30/min per endpoint)  
✅ CORS protection  
✅ Security headers (Helmet.js)  
✅ Input sanitization (max 10,000 chars)  
✅ Request validation (10MB limit, 30s timeout)  

---

## Environment Configuration

**Required Environment Variables (.env):**

```env
# API Configuration
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
PORT=3000
NODE_ENV=production

# Security Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
REFERER_URL=https://yourdomain.com

# Optional: Client-side API key override
CLIENT_API_KEY=your-client-key-here
```

---

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)
- Requires Web Speech API support for voice features

---

## Deployment Considerations

1. **Frontend:** Deploy static files (HTML, CSS, JS) to CDN or static host
2. **Backend:** Deploy Node.js server to cloud (Heroku, AWS, Google Cloud, etc.)
3. **API Keys:** Store in environment variables on server only
4. **CORS:** Configure allowed origins for your domain
5. **HTTPS:** Required for production Web Speech API
6. **Rate Limiting:** Monitor and adjust based on usage
7. **Session Storage:** Cleared on browser refresh; use localStorage for longer persistence

---

## Development Guidelines

### Adding New Languages
1. Add language code to language selector (index.html)
2. Update language map in app.js
3. Test with Google Translate API

### Adding New Knowledge Domains
1. Update system prompt in openrouter-service.js
2. Add new context examples
3. Test with multiple conversation scenarios

### Customizing Theme Colors
1. Edit CSS variables in styles.css
2. Update color palette in Tailwind configuration
3. Adjust Ashoka wheel background as needed

---

## Testing Recommendations

1. **Translation:** Test with all 12 languages, verify caching
2. **Voice:** Test speech recognition in different languages
3. **AI:** Test both Command and AI modes, verify context
4. **UI:** Test responsive design on mobile/desktop/tablet
5. **Security:** Test rate limiting, CORS, input sanitization
6. **Performance:** Monitor API response times and caching

---

**Last Updated:** February 1, 2026  
**Status:** Production Ready  
**License:** MIT
