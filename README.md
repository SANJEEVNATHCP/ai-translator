# Bharat Voice Translator 🇮🇳

> A web-based multilingual translation and cultural assistant with AI-powered voice interaction

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-38B2AC.svg)](https://tailwindcss.com)
[![OpenRouter API](https://img.shields.io/badge/API-OpenRouter-FF6B35.svg)](https://openrouter.ai)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [File Structure](#file-structure)
- [API Documentation](#api-documentation)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Bharat Voice Translator** is a celebration of Indian languages and culture - Republic Day 2026 🇮🇳. This application combines real-time translation, speech recognition, and conversational AI to help users communicate across language barriers while learning about Indian culture.

Perfect for:
- 🗣️ **Travelers** - Quick translations on the go
- 🏪 **Merchants** - Communicate with customers in multiple languages
- 📚 **Learners** - Understand Indian culture and festivals
- 💰 **Shoppers** - Bargaining tips and market navigation
- 🤖 **Tech enthusiasts** - AI-powered voice assistance

---

## ✨ Features

### 🌐 Multi-Language Translation
- **12+ Languages Supported**: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Sanskrit, Urdu
- **Real-Time Translation**: Instant translations with smart caching
- **Live Character Count**: Monitor input length
- **Translation Cache**: Repeat translations load instantly from browser cache

### 🎙️ Voice Input & Output
- **Speech Recognition**: Talk instead of type - works in real-time
- **Text-to-Speech**: Hear translations in target language
- **Visual Feedback**: Pulse animation shows when app is listening
- **Multiple Voice Options**: Choose from available system voices

### 🤖 AI-Powered Conversation
- **Two Modes**:
  - ⚡ **Command Mode**: Fast voice commands
  - 💬 **AI Mode**: Natural conversations with intelligent responses
- **OpenRouter Integration**: Powered by GPT-3.5-turbo
- **Context Awareness**: AI remembers conversation history
- **Multi-turn Dialogue**: Natural back-and-forth conversations

### 🏛️ Cultural Knowledge Base
- **Festivals & Holidays**: Information about Diwali, Holi, Eid, Pongal, Navratri, Christmas, Independence Day, Republic Day, Ganesh Chaturthi
- **Bargaining Tips**: Market negotiation strategies specific to India
- **Emergency Phrases**: Critical phrases for travelers
- **Market Assistance**: Tips for navigating Indian markets

### 💾 Smart Storage
- **Chat History**: Persistent conversation within session
- **Translation Cache**: Fast repeat translations
- **API Key Management**: Secure configuration options
- **Session Storage**: Automatic cleanup on page refresh

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode**: Eye-friendly theme for night usage
- **Indian Theme Colors**: Saffron, Green, Navy blue
- **Smooth Animations**: Polished user experience
- **Accessibility**: Keyboard navigation and screen reader support

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic markup |
| **CSS3** | Styling with Tailwind |
| **JavaScript (ES6+)** | Application logic |
| **Tailwind CSS** | Utility-first styling |
| **OpenRouter API** | LLM/AI backend |
| **Google Translate API** | Text translation |
| **Web Speech API** | Voice recognition & synthesis |
| **localStorage/sessionStorage** | Client-side data persistence |

---

## 🚀 Quick Start

### Option 1: Direct Browser Access
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Configure OpenRouter API key (or use default)
4. Start translating!

### Option 2: Local Web Server
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser

---

## 📦 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Microphone (for voice features - optional)
- OpenRouter API key (free tier available)

### Steps

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/bharat-voice-translator.git
cd bharat-voice-translator
```

2. **Folder Structure**
```
bharat-voice-translator/
├── index.html                 # Main HTML file
├── app.js                     # Translation logic
├── ai-voice-assistant.js      # Voice I/O & AI mode
├── conversation-ui.js         # Chat interface
├── openrouter-service.js      # AI/LLM integration
├── styles.css                 # Custom styling
├── voice-assistant.js         # Voice helper functions
└── README.md                  # This file
```

3. **No Installation Required!**
   - This is a static web application
   - No npm packages to install
   - No build process needed
   - Just open `index.html` in browser

---

## ⚙️ Configuration

### OpenRouter API Key Setup

The app comes with a **default API key** for immediate use. To use your own key:

#### Option 1: Edit Source Code
```javascript
// In openrouter-service.js, line 4
const DEFAULT_API_KEY = 'your-api-key-here';
```

#### Option 2: Configure in Browser
1. Click the **⚙️ Settings** button
2. Paste your OpenRouter API key
3. Click **Save**

#### Get Your Free API Key
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for free account
3. Generate API key from dashboard
4. Copy and paste into app

### Language Selection
```javascript
Available Languages:
English, Hindi, Tamil, Telugu, Bengali, Marathi, 
Gujarati, Kannada, Malayalam, Punjabi, Sanskrit, Urdu
```

### Theme Configuration
- **Light Mode**: Click 🌙 icon (appears as 🌙)
- **Dark Mode**: Click 🌞 icon (appears as 🌞)

---

## 📖 Usage

### 1. Text Translation

**Step 1**: Select source language
```
┌─ English ─┐
└───────────┘
```

**Step 2**: Type or paste text
```
┌──────────────────────────┐
│ Type your text here...   │
│ (0 characters)           │
└──────────────────────────┘
```

**Step 3**: Select target language
```
┌─ Hindi ─┐
└─────────┘
```

**Step 4**: View translation instantly
```
┌──────────────────────────┐
│ आपका अनुवाद यहाँ दिखेगा │
└──────────────────────────┘
```

**Step 5**: Copy or speak the translation
- 📋 **Copy**: Click copy button
- 🔊 **Speak**: Click speaker icon

### 2. Voice Input

**Enable Voice Assistant**:
1. Click the 🎤 button
2. Wait for activation greeting
3. Speak naturally
4. App transcribes and responds

**Auto Modes**:
- **Command Mode** (Off): Quick voice commands
  ```
  "Translate hello to Hindi"
  "Show history"
  "Clear chat"
  ```
  
- **AI Mode** (On): Full conversations
  ```
  "Tell me about Diwali"
  "How do I bargain in Indian markets?"
  "Translate 'good morning' to Tamil"
  ```

### 3. Chat & AI Conversation

**Start Conversation**:
1. Toggle **AI Mode: ON** (green button)
2. Click 🎤 to start speaking
3. Or type in the input field
4. AI responds and remembers context

**Clear Chat**:
1. Click **Clear Conversation**
2. Confirm the action
3. History deleted, new conversation starts

---

## 🧠 How It Works

### Translation Flow
```
User Input
    ↓
Check Browser Cache (instant)
    ↓
If not cached: API Call to Google Translate
    ↓
Save to Cache (sessionStorage)
    ↓
Display Translation
    ↓
Save to History
```

### AI Conversation Flow
```
User speaks (or types)
    ↓
Speech Recognition (if voice)
    ↓
Send to OpenRouter API (GPT-3.5-turbo)
    ↓
Process AI Response
    ├─ Extract any embedded translation commands
    └─ Clean response text
    ↓
Display in Chat
    ↓
Text-to-Speech (speak response)
    ↓
Save to Conversation History
```

### Voice Recognition Flow
```
Click 🎤 Button
    ↓
Activation Greeting plays
    ↓
Wait 2 seconds
    ↓
Start Listening (visual pulse)
    ↓
User Speaks
    ↓
Convert to Text (transcript)
    ↓
Process Message
    ├─ Command Mode: Quick action
    └─ AI Mode: Full conversation
    ↓
Display Response
```

---

## 📁 File Structure

### index.html
Main user interface with:
- Translation panel
- Voice assistant controls
- Chat interface
- Settings modal
- Responsive layout with Tailwind CSS

### app.js (Translation)
Key functions:
- `translateText()` - Debounced translation trigger
- `performTranslation()` - API call and caching
- `speakTranslation()` - Text-to-speech
- `saveToHistory()` - Store translations
- `copyToClipboard()` - Utility function

### ai-voice-assistant.js (Voice & AI)
Key functions:
- `toggleVoiceAssistant()` - Start/stop listening
- `addUserMessage()` - Display user input
- `processAIResponse()` - Route to Command or AI mode
- `speakText()` - Play audio response
- Speech Recognition lifecycle handlers

### conversation-ui.js (Chat UI)
Key functions:
- `addChatMessage()` - Display chat bubble
- `clearConversation()` - Clear history
- `toggleAiMode()` - Switch modes
- Message styling and formatting

### openrouter-service.js (AI/LLM)
Class: `OpenRouterService`

Key methods:
- `constructor()` - Initialize API config
- `sendMessage()` - Send to LLM API
- `addMessage()` - Manage history
- `extractTranslationCommands()` - Parse AI responses
- `cleanResponseText()` - Format output

### styles.css
Custom styling:
- Dark mode variables
- Animations (pulse, fade)
- Responsive utilities
- Theme colors

### voice-assistant.js
Helper functions:
- Voice utilities
- Gesture handling
- Additional voice features

---

## 🔌 API Documentation

### OpenRouter API
**Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

**Request Example**:
```json
{
  "model": "openai/gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful multilingual AI assistant..."
    },
    {
      "role": "user",
      "content": "Translate hello to Hindi"
    }
  ]
}
```

**Response Example**:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "The Hindi translation of 'hello' is 'नमस्ते' (Namaste)..."
      }
    }
  ]
}
```

### Google Translate API
**Endpoint**: Google Translate free endpoint (via app.js)

**Supported Languages**:
```
English, Hindi, Tamil, Telugu, Bengali, Marathi,
Gujarati, Kannada, Malayalam, Punjabi, Sanskrit, Urdu
```

### Web Speech API
**Speech Recognition** (Browser built-in)
```javascript
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
};
```

**Speech Synthesis** (Browser built-in)
```javascript
const synthesis = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance('Hello');
synthesis.speak(utterance);
```

---

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| Opera | 76+ | ✅ Full Support |
| Mobile Chrome | Latest | ✅ Full Support |
| Mobile Safari | Latest | ✅ Full Support |

**Note**: Voice features require HTTPS or localhost

---

## 🐛 Troubleshooting

### Voice Recognition Not Working
**Problem**: Microphone not recognized
```
Solution:
1. Check browser permissions
2. Ensure HTTPS (or localhost)
3. Try Chrome or Edge browser
4. Reload page and grant permissions
```

**Problem**: "Speech recognition not supported"
```
Solution:
1. Update your browser
2. Try Chrome (best support)
3. Check if it's not incognito mode
```

### Translation Not Appearing
**Problem**: Translation takes too long
```
Solution:
1. Check internet connection
2. Verify API key is valid
3. Check browser console for errors (F12)
4. Try a shorter text
```

**Problem**: Translation shows error
```
Solution:
1. Clear browser cache
2. Try different language pair
3. Check if Google Translate is accessible
4. Reload the page
```

### AI Response Not Working
**Problem**: "OpenRouter API key not configured"
```
Solution:
1. Get API key from openrouter.ai
2. Edit openrouter-service.js (line 4)
3. Or configure in app settings
4. Reload the page
```

**Problem**: API calls failing
```
Solution:
1. Check internet connection
2. Verify API key is correct
3. Check OpenRouter service status
4. Try enabling AI Mode again
```

### Dark Mode Not Persisting
**Problem**: Dark mode resets on reload
```
Solution:
1. This is expected (no persistent storage)
2. Or manually add to localStorage
3. See JavaScript console
```

### Mobile Microphone Permission
**Problem**: Can't access microphone on mobile
```
Solution:
1. Check Settings → Safari/Chrome → Microphone
2. Grant permission for the website
3. Reload the page
4. Try again
```

---

## 🚀 Performance Tips

1. **Cache Usage**: Repeat translations load instantly
2. **Debouncing**: Translation waits 500ms after typing
3. **Voice**: Short responses for better TTS quality
4. **History**: Last 10 messages kept in memory
5. **Offline**: Some features work without internet (cached data)

---

## 📝 Example Use Cases

### Use Case 1: Market Shopping
```
Visitor: "🎤 Click mic"
App: "Listening... Speak now"
Visitor: "How much is this?"
App: "You: How much is this?"
AI: "यह कितना है? (Translation: How much is this?)"
AI: "Here's how to bargain: Start at 60% of asking price..."
```

### Use Case 2: Festival Learning
```
User: "Tell me about Diwali"
AI: "Diwali, known as the Festival of Lights..."
Translation: English → Hindi with cultural context
```

### Use Case 3: Quick Translation
```
User: Types "Thank you"
App: Selects Hindi
Result: "धन्यवाद" (Dhanyavaad)
User: Clicks 🔊 to hear pronunciation
```

---

## 📚 Documentation Files

- **README.md** (this file) - Quick start and usage guide
- **[requirement.md](requirement.md)** - Functional & non-functional requirements
- **[design.md](design.md)** - Architecture and technical design

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. **Report Bugs**: Open an issue with details
2. **Suggest Features**: Describe your idea
3. **Improve Code**: Submit pull requests
4. **Improve Docs**: Fix typos or add examples

### Development Setup
```bash
# Clone repo
git clone <repo>

# Make changes
# Edit HTML/JS/CSS files directly

# Test in browser
# Open index.html in browser

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

---

## 📄 License

This project is licensed under the **MIT License** - see LICENSE file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person 
obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction.
```

---

## 🙏 Acknowledgments

- 🇮🇳 Celebrating Indian languages and culture
- 🤖 Powered by OpenRouter & OpenAI
- 🎨 UI built with Tailwind CSS
- 🎤 Voice features via Web Speech API
- 💖 Built with passion for language accessibility

---

## 📞 Support

Need help? 

- 📖 Check [troubleshooting](#troubleshooting) section
- 🐛 Report bugs on GitHub Issues
- 💬 Discuss in GitHub Discussions
- 📧 Email: support@example.com

---

## 🗺️ Roadmap

- [ ] Backend API integration
- [ ] User authentication
- [ ] Multi-device sync
- [ ] Document translation
- [ ] Image text recognition
- [ ] Offline mode
- [ ] Progressive Web App
- [ ] Mobile app (React Native)

---

## 📊 Project Stats

```
Language:      JavaScript, HTML, CSS
Lines of Code: ~2000+
Components:    5 main modules
APIs:          2 external services
Browsers:      5+ major browsers
Mobile:        ✅ Fully responsive
Accessibility: ♿ WCAG compliant
```

---

## 🎉 Getting Started

**Ready to use?**

```
1. Open index.html in your browser
2. Grant microphone permission (for voice)
3. Start translating or chatting
4. Enjoy breaking language barriers!
```

**Happy translating! 🚀**

---

<div align="center">

**Made with ❤️ for India 🇮🇳**

[⬆ back to top](#bharat-voice-translator-)

</div>
