// OpenRouter API Service for Conversational AI
class OpenRouterService {
    constructor() {
        // Hardcoded API key - replace with your actual OpenRouter API key
        const DEFAULT_API_KEY = 'OPENROUTER_API_KEY'; // Replace this with your actual key
        this.apiKey = localStorage.getItem('openrouter_api_key') || DEFAULT_API_KEY;
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
        this.conversationHistory = this.loadHistory();
        this.maxHistoryLength = 10;
        this.model = 'openai/gpt-3.5-turbo'; // Fast and cost-effective
        
        this.systemPrompt = `You are a helpful multilingual AI assistant integrated into an Indian translation and cultural app. Your capabilities:

1. TRANSLATION SUPPORT: Help users translate between English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Sanskrit, and Urdu. When users ask for translation, respond conversationally AND trigger the translation by including the phrase "TRANSLATE:[source_lang]->[target_lang]:[text]" in your response.

2. CULTURAL KNOWLEDGE: Provide information about Indian festivals (Diwali, Holi, Eid, Pongal, Navratri, Christmas, Independence Day, Republic Day, Ganesh Chaturthi), bargaining tips for Indian markets, emergency phrases, and travel assistance.

3. BARGAINING HELP: When users discuss prices or bargaining, offer negotiation strategies suitable for Indian markets (vegetables, clothes, electronics, jewelry, street food, auto-rickshaws).

4. NATURAL CONVERSATION: Be friendly, concise, and helpful. Keep responses brief (2-3 sentences) for voice interaction. Use simple language that works well with text-to-speech.

5. CONTEXT AWARENESS: Remember the conversation context and user's language preferences.

Respond in a warm, helpful manner as if you're a knowledgeable Indian friend assisting with language and cultural navigation.`;
    }

    loadHistory() {
        const saved = sessionStorage.getItem('ai_conversation_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        sessionStorage.setItem('ai_conversation_history', JSON.stringify(this.conversationHistory));
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openrouter_api_key', key);
    }

    hasApiKey() {
        return this.apiKey && this.apiKey.length > 0;
    }

    addMessage(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Keep only last N messages to manage token usage
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
        
        this.saveHistory();
    }

    clearHistory() {
        this.conversationHistory = [];
        sessionStorage.removeItem('ai_conversation_history');
    }

    getHistory() {
        return this.conversationHistory;
    }

    extractTranslationCommands(text) {
        // Extract TRANSLATE commands from AI response
        const regex = /TRANSLATE:(\w+)->(\w+):(.+?)(?=TRANSLATE:|$)/g;
        const commands = [];
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            commands.push({
                sourceLang: match[1],
                targetLang: match[2],
                text: match[3].trim()
            });
        }
        
        return commands;
    }

    cleanResponseText(text) {
        // Remove TRANSLATE commands from display text
        return text.replace(/TRANSLATE:\w+->\w+:.+?(?=TRANSLATE:|$)/g, '').trim();
    }

    async sendMessage(userMessage, context = {}) {
        if (!this.hasApiKey()) {
            throw new Error('OpenRouter API key not configured');
        }

        // Add user message to history
        this.addMessage('user', userMessage);

        // Build messages array for API
        const messages = [
            { role: 'system', content: this.systemPrompt }
        ];

        // Add conversation context
        if (context.sourceLanguage && context.targetLanguage) {
            messages.push({
                role: 'system',
                content: `Current translation context: Source language is ${context.sourceLanguage}, target language is ${context.targetLanguage}.`
            });
        }

        // Add conversation history
        messages.push(...this.conversationHistory);

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'Bharat Multilingual Bridge'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 200, // Keep responses concise for voice
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            // Add assistant response to history
            this.addMessage('assistant', assistantMessage);

            // Extract any translation commands
            const translationCommands = this.extractTranslationCommands(assistantMessage);
            const cleanText = this.cleanResponseText(assistantMessage);

            return {
                text: cleanText,
                fullText: assistantMessage,
                translationCommands: translationCommands,
                usage: data.usage
            };

        } catch (error) {
            console.error('OpenRouter API Error:', error);
            throw error;
        }
    }

    // Quick command detection - returns true if this should be handled by existing command system
    isDirectCommand(text) {
        const commandPatterns = [
            /^(swap|switch) language/i,
            /^copy/i,
            /^speak/i,
            /^clear history/i,
            /^emergency/i,
            /^sos/i,
            /^(jai hind|vande mataram)/i
        ];

        return commandPatterns.some(pattern => pattern.test(text.trim()));
    }

    // Check if API is configured and ready
    async testConnection() {
        if (!this.hasApiKey()) {
            return { success: false, error: 'No API key configured' };
        }

        try {
            await this.sendMessage('Hello', {});
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Global instance
const openRouterService = new OpenRouterService();
