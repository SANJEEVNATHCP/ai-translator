# Design Document - Bharat Voice Translator

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (index.html)             │
│              HTML/CSS/Tailwind + Dark Mode                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────────┐   │    ┌────────▼────────┐
        │   app.js       │   │    │ ai-voice-       │
        │ Translation    │   │    │ assistant.js    │
        │ Features       │   │    │ Voice I/O       │
        └────────────────┘   │    └─────────────────┘
                │            │             │
                │      ┌─────▼─────┐      │
                │      │ Voice UI  │      │
                │      │conversation-│    │
                │      │ ui.js      │    │
                │      └───────────┘    │
                │            │          │
                └────────────┼──────────┘
                             │
                ┌────────────▼──────────────┐
                │  openrouter-service.js    │
                │  AI/LLM Integration       │
                │  Conversation Manager     │
                └────────────┬──────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼────────┐  ┌────▼──────────┐
            │  OpenRouter    │  │  Google       │
            │  API (LLM)     │  │  Translate    │
            └────────────────┘  └───────────────┘
```

---

## Component Architecture

### 1. **index.html** - Main UI Layer
**Purpose**: User interface and DOM structure

**Key Sections**:
- **Header**: App title, theme toggle, API key configuration
- **Translation Panel**:
  - Source language selector
  - Source text input (with character counter)
  - Target language selector
  - Target text output
  - Copy button
  - TTS (Text-to-Speech) button
  
- **Voice Assistant Panel**:
  - Microphone toggle button
  - Assistant status indicator
  - Visual voice feedback (pulse animation)
  - Voice visualization indicator
  
- **Chat Panel**:
  - AI Mode toggle button
  - Chat history display
  - Settings for API key (if needed)
  - Clear conversation button

**Styling Features**:
- Responsive grid layout (1 column mobile, 2+ columns desktop)
- Tailwind CSS with custom color variables
- Dark mode support with CSS variables
- Indian theme colors (saffron, green, navy)
- Ashoka wheel watermark background

---

### 2. **app.js** - Translation Service Layer
**Purpose**: Handle all text translation functionality

**Key Functions**:

#### `translateText()`
```javascript
Triggers when user types in source text field
- Debounces input (500ms)
- Gets source/target languages
- Calls performTranslation()
```

#### `performTranslation(sourceText, sourceLang, targetLang)`
```javascript
Main translation logic
1. Check sessionStorage cache first
2. If cached: use cached result
3. If not cached: call Google Translate API
4. Save result to cache
5. Display translated text
6. Save to history
7. Auto-speak if voice input was used
```

#### `speakTranslation()`
```javascript
Text-to-Speech functionality
- Uses Web Speech API (speechSynthesis)
- Speaks the translated text
- Supports multiple languages
```

#### `saveToHistory(sourceText, targetText, sourceLang, targetLang)`
```javascript
Saves translations to persistent storage
- Stores in localStorage as JSON array
- Updates history display
```

#### `copyToClipboard()`
```javascript
Utility function
- Copies translated text to clipboard
- Shows notification feedback
```

**Data Flow**:
```
User Input → translateText() 
    ↓
Check Cache (sessionStorage)
    ↓
If miss: API Call → Google Translate
    ↓
Save to Cache
    ↓
Update UI with Translation
    ↓
Save to History
    ↓
Auto-speak (if needed)
```

---

### 3. **ai-voice-assistant.js** - Voice I/O & Command Processing
**Purpose**: Handle speech recognition, speech synthesis, and AI mode toggle

**Key Components**:

#### Speech Recognition (Web Speech API)
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
recognition = new SpeechRecognition()

Configuration:
- continuous: false (single phrase)
- interimResults: false (final results only)
- lang: 'en-US' (default, user-selectable)
```

**Recognition Lifecycle**:
```
onstart → Show listening indicator
  ↓
onresult → Capture transcript
  ↓
Process transcript (Command or AI Mode)
  ↓
onend → Hide listening indicator
  ↓
onerror → Display error message
```

#### Speech Synthesis
```javascript
const synthesis = window.speechSynthesis

Configuration:
- Supports multiple languages
- Multiple voices per language
- Rate, pitch, volume adjustable
```

**Functions**:

#### `toggleVoiceAssistant()`
```javascript
Activation button handler
1. If listening: stop recognition
2. If not listening:
   - Play activation greeting
   - Wait for greeting to finish (2 seconds)
   - Start speech recognition
```

#### `addUserMessage(transcript)`
```javascript
Displays user's voice input as message
- Shows in chat as blue bubble
- Triggers AI response processing
```

#### `processAIResponse(userInput)`
```javascript
Router for two modes:
- Command Mode: Fast voice commands
  ├─ "translate" → trigger translation
  ├─ "history" → show past translations
  ├─ "clear" → clear conversation
  └─ "help" → show available commands

- AI Mode: Full conversation
  └─ Send to OpenRouter API
     ↓
     Get intelligent response
     ↓
     Extract translation commands (if any)
     ↓
     Display response & speak aloud
```

#### `speakText(text, language)`
```javascript
Converts text to speech
1. Create SpeechSynthesisUtterance
2. Set language and voice
3. Use speechSynthesis.speak()
4. Handle completion/error
```

**Global State**:
```javascript
isListening: boolean - Recognition active status
isMuted: boolean - Audio output muted status
recognition: SpeechRecognition object
synthesis: SpeechSynthesis API
conversationHistory: Array - Current session messages
```

---

### 4. **openrouter-service.js** - AI/LLM Integration
**Purpose**: Manage conversational AI using OpenRouter API

**Class**: `OpenRouterService`

**Constructor**:
```javascript
this.apiKey = localStorage.getItem('openrouter_api_key') || DEFAULT_API_KEY
this.baseURL = 'https://openrouter.ai/api/v1/chat/completions'
this.model = 'openai/gpt-3.5-turbo'
this.maxHistoryLength = 10
```

**System Prompt Configuration**:
```
The AI is configured as:
- Multilingual assistant for Indian languages
- Translation helper
- Cultural knowledge expert
- Bargaining/market negotiation advisor
- Friendly and conversational
- Speaks to TTS (2-3 sentences max)
```

**Key Methods**:

#### `sendMessage(userMessage, context)`
```javascript
API Call Flow:
1. Check if API key exists
2. Add user message to history
3. Build messages array:
   - System prompt
   - Previous conversation context
   - Current user message
4. HTTP POST to OpenRouter API
5. Handle streaming/completion response
6. Extract translation commands (if embedded)
7. Clean response text
8. Add AI response to history
9. Return response to UI
```

#### `extractTranslationCommands(responseText)`
```javascript
Parses AI response for embedded translation triggers
Format: TRANSLATE:[source_lang]->[target_lang]:[text]

Example:
"Let me translate that for you. 
 TRANSLATE:english->hindi:Hello, how are you?"

Returns: Array of translation objects
```

#### `addMessage(role, content)`
```javascript
Maintains conversation history
- role: 'user', 'assistant', or 'system'
- content: message text
- Limits history to last 10 messages
- Persists to sessionStorage
```

#### `loadHistory()` / `saveHistory()`
```javascript
sessionStorage ↔ conversationHistory sync
- Load on service initialization
- Save after each message
- Auto-clear on page reload
```

**API Request Structure**:
```json
{
  "model": "openai/gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "[system prompt with capabilities]"
    },
    {
      "role": "user",
      "content": "user message"
    }
  ],
  "headers": {
    "Authorization": "Bearer {API_KEY}",
    "Content-Type": "application/json"
  }
}
```

**API Response Handling**:
```javascript
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "AI response text"
      },
      "finish_reason": "stop"
    }
  ]
}
```

---

### 5. **conversation-ui.js** - Chat UI Helpers
**Purpose**: Display and manage conversation in chat interface

**Key Functions**:

#### `addChatMessage(role, content)`
```javascript
Displays message in chat bubble

Message Types:
- User (role='user'):
  ├─ Blue background
  ├─ Right-aligned
  ├─ Icon: 👤
  └─ White text

- Assistant (role='assistant'):
  ├─ Gray background
  ├─ Left-aligned
  ├─ Icon: 🤖
  └─ Dark text

- System (role='system'):
  ├─ Yellow background
  ├─ Center-aligned
  ├─ Icon: ⚠️
  └─ Small font
  
All messages include:
- Timestamp (HH:MM:SS)
- Auto-scroll to bottom
```

#### `clearConversation()`
```javascript
1. Show confirmation dialog
2. Clear chatHistory DOM
3. Reset to empty state
4. Clear OpenRouter history
5. Show success notification
```

#### `toggleAiMode()`
```javascript
Switches between two modes:

Command Mode (OFF):
├─ Fast voice commands
├─ Pre-defined actions
├─ Low latency
└─ Button: Gray

AI Mode (ON):
├─ Full AI conversation
├─ Natural language
├─ Slower (API calls)
└─ Button: Green
```

---

## Data Flow Diagrams

### Translation Data Flow
```
User types source text
       ↓
Input event listener (debounce 500ms)
       ↓
translateText() called
       ↓
┌──────────────────────────┐
│  Check sessionStorage     │
│  Cache (key format:       │
│  "en:hi:Hello")          │
└────────┬─────────────────┘
         │
    ┌────▼─────┐
    │ Hit?      │
    └┬────────┬─┘
   Yes│      No│
    ┌─▼─┐    ┌─▼──────────────┐
    │Use│    │ Google         │
    │   │    │ Translate API  │
    │   │    │ Call           │
    └─┬─┘    └────┬───────────┘
      │          │
      └────┬─────┘
           ↓
    Save to cache
           ↓
    Display result
           ↓
    Save to history
           ↓
Auto-speak (if voice input)
```

### AI Conversation Data Flow
```
User speaks → Speech Recognition
    ↓
Transcript → addUserMessage()
    ↓
Display in chat (blue bubble)
    ↓
AI Mode enabled?
    │
    ├─ NO → Command Mode
    │        ├─ Check voice commands
    │        └─ Execute quick action
    │
    └─ YES → processAIResponse()
             ↓
        OpenRouter API Call
             ↓
        LLM Response
             ↓
        Extract translations (if any)
             ↓
        Clean response text
             ↓
        addChatMessage() → Display (gray bubble)
             ↓
        speakText() → Audio output
```

### Voice Recognition Lifecycle
```
Start
  ↓
toggleVoiceAssistant()
  ├─ Play greeting
  ├─ Wait 2 seconds
  │
  └─ recognition.start()
       ↓
    recognition.onstart
       ├─ Show pulse animation
       └─ Update status "Listening..."
       ↓
    User speaks...
       ↓
    recognition.onresult
       ├─ Get transcript
       └─ Process message
       ↓
    recognition.onend
       ├─ Hide animation
       └─ Update status
       
If error:
    recognition.onerror
    └─ Show error message
```

---

## AI System Architecture

### Model Configuration
```
Provider: OpenRouter
Model: openai/gpt-3.5-turbo
Cost: Low (fastest inference)
Alternative: Can switch to other models in dropdown
```

### Prompt Engineering
```
System Role:
"You are a helpful multilingual AI assistant 
integrated into an Indian translation and cultural app"

Capabilities List:
1. Translation Support
   - Multi-language support
   - Include TRANSLATE command for UI integration
   
2. Cultural Knowledge
   - Festivals, customs, traditions
   - Practical and accurate information
   
3. Bargaining Help
   - Market negotiation strategies
   - India-specific haggling tips
   
4. Natural Conversation
   - Friendly tone
   - Brief responses (2-3 sentences for TTS)
   - Simple language
   
5. Context Awareness
   - Remember conversation
   - Use language preferences
```

### Translation Command Extraction
```
AI Response Example:
"I'd be happy to help! Let me translate that.
TRANSLATE:english->hindi:Hello, how are you?"

Parser extracts:
- Source: english
- Target: hindi  
- Text: Hello, how are you?

Then:
1. Clean response text (remove TRANSLATE command)
2. Display: "I'd be happy to help! Let me translate that."
3. Auto-trigger translation in app.js
4. Show translated result
```

---

## State Management

### Session State
```javascript
// In window scope
let aiModeEnabled = false        // AI vs Command mode
let isListening = false           // Voice recognition active
let isMuted = false               // Audio output muted
let conversationHistory = []      // Current conversation
let translationCache = {}         // Cached translations
```

### Persistent Storage
```javascript
// localStorage (survives page refresh)
{
  "openrouter_api_key": "sk-or-v1-..."
}

// sessionStorage (cleared on page reload)
{
  "ai_conversation_history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "en:hi:hello": "नमस्ते",  // Cache entries
  "translation_history": [...]
}
```

---

## Error Handling

### Translation Errors
```javascript
if (!sourceText) {
  display: "Translation will appear here..."
  return
}

if (API fails) {
  display: error message
  check: cache or offline mode
}
```

### Voice Recognition Errors
```javascript
if (!supported) {
  alert: "Speech recognition not supported"
}

if (permission denied) {
  status: "Microphone access required"
}

if (recognition fails) {
  onerror: Display error message
  status: "Error: [error type]"
}
```

### AI API Errors
```javascript
if (!hasApiKey) {
  throw: "OpenRouter API key not configured"
  show: Configuration prompt
}

if (API fails) {
  display: "Unable to reach AI service"
  fallback: Command mode only
}
```

---

## Performance Optimizations

### Caching Strategy
```
Translation Cache (sessionStorage):
- Key: "sourceLang:targetLang:text"
- TTL: Session duration
- Benefits: Instant repeat translations
- Drawback: Only client-side cache

History Cache:
- Store last 10 conversations
- Reduce API token usage
- Improve response context
```

### Debouncing
```javascript
Translation Input: 500ms debounce
- Prevents excessive API calls
- Waits for user to finish typing
- Reduces costs
```

### Lazy Loading
```
Voice recognition: Only init on user interaction
Speech synthesis: Load voices on first TTS call
API connection: Establish only when needed
```

---

## Security Considerations

### API Key Management
```
Default: Hardcoded in openrouter-service.js
Option: User can override via localStorage
Risk: Key exposed in source code
Mitigation: Use environment variables in production
```

### Input Sanitization
```javascript
escapeHtml(text): Prevent XSS
- Convert < > " ' to HTML entities
- Applied to all user input before display
```

### CORS & HTTPS
```
All API calls over HTTPS
CORS handled by API providers:
- OpenRouter accepts CORS requests
- Google Translate via proxy or direct
```

---

## Testing Considerations

### Manual Testing Scenarios
1. **Translation**:
   - Translate same text twice (cache hit)
   - Switch languages
   - Special characters
   - Long text
   
2. **Voice**:
   - Recognize English accent
   - Recognize Hindi accent
   - Handle silence
   - Test error scenarios
   
3. **AI Chat**:
   - Ask questions
   - Request translations
   - Cultural knowledge
   - Bargaining advice
   
4. **UI**:
   - Dark mode toggle
   - Mobile responsiveness
   - Button accessibility
   - Error messages

### Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile browsers
- Speech API support
- Storage availability

---

## Future Enhancements

1. **Backend Integration**:
   - User authentication
   - Persistent history across devices
   - Premium API models
   - Usage analytics

2. **Features**:
   - Document translation
   - Image text recognition (OCR)
   - Real-time video translation
   - Offline mode with local models

3. **Optimization**:
   - CDN for static assets
   - API rate limiting
   - Model fine-tuning for Indian languages
   - WebSocket for real-time chat

4. **Accessibility**:
   - Multi-language UI
   - Voice control customization
   - Keyboard shortcuts
   - Screen reader optimization

---

## Deployment Architecture

```
Frontend (Static Files)
├─ index.html
├─ app.js
├─ ai-voice-assistant.js
├─ conversation-ui.js
├─ openrouter-service.js
├─ styles.css
└─ (served via: Vercel, Netlify, GitHub Pages)

External APIs
├─ OpenRouter (LLM)
├─ Google Translate
└─ Web APIs (Browser built-in)
```

