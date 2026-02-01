// AI Voice Assistant - ChatGPT/Gemini/Jarvis-like functionality
let isListening = false;
let isMuted = false;
let recognition = null;
let synthesis = window.speechSynthesis;
let conversationHistory = [];

// Initialize speech synthesis on page load
window.addEventListener('load', function() {
    // Trigger speech synthesis to enable it (some browsers require user interaction)
    if (synthesis) {
        synthesis.cancel(); // Reset
        console.log('Speech synthesis initialized');
        console.log('Available voices:', synthesis.getVoices().length);
        
        // Load voices
        if (synthesis.getVoices().length === 0) {
            synthesis.addEventListener('voiceschanged', function() {
                console.log('Voices loaded:', synthesis.getVoices().length);
            });
        }
    }
});

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
        console.log('Voice recognition started');
        document.getElementById('voiceVisualizer').classList.remove('hidden');
        document.getElementById('pulseOverlay').classList.remove('hidden');
        document.getElementById('assistantIcon').textContent = '🎤';
        document.getElementById('assistantStatus').textContent = 'Listening... Speak now';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log('Heard:', transcript);
        addUserMessage(transcript);
        processAIResponse(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        document.getElementById('voiceVisualizer').classList.add('hidden');
        document.getElementById('pulseOverlay').classList.add('hidden');
        document.getElementById('assistantIcon').textContent = '🎤';
        document.getElementById('assistantStatus').textContent = 'Error: ' + event.error;
        isListening = false;
    };
    
    recognition.onend = function() {
        document.getElementById('voiceVisualizer').classList.add('hidden');
        document.getElementById('pulseOverlay').classList.add('hidden');
        isListening = false;
        if (document.getElementById('assistantStatus').textContent === 'Listening...') {
            document.getElementById('assistantStatus').textContent = 'Click to start conversation';
        }
    };
}

// Toggle Voice Assistant
function toggleVoiceAssistant() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        isListening = false;
        document.getElementById('assistantIcon').textContent = '🎤';
        document.getElementById('assistantStatus').textContent = 'Click to start conversation';
    } else {
        // Activation greeting - like Jarvis
        const greetings = [
            'AI assistant mode activated. How may I assist you?',
            'Jarvis mode activated. Ready to help.',
            'Voice assistant online. Listening for your command.',
            'AI system ready. What can I do for you?'
        ];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        // Speak activation message
        speakText(greeting);
        
        // Wait a moment then start listening
        setTimeout(() => {
            recognition.start();
            isListening = true;
        }, 2000); // Wait for greeting to finish
    }
}

// Add user message to chat
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start gap-3 justify-end';
    messageDiv.innerHTML = `
        <div class="flex-1 text-right">
            <div class="inline-block rounded-lg p-3" style="background: #9b87d4; color: white;">
                <p class="text-sm">${escapeHtml(message)}</p>
            </div>
            <p class="text-xs mt-1" style="color: #7c6b9d;">${getCurrentTime()}</p>
        </div>
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: #7d67b8;">
            <span class="text-white text-sm">👤</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    conversationHistory.push({ role: 'user', content: message, timestamp: new Date() });
}

// Add AI message to chat
function addAIMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start gap-3';
    messageDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: #9b87d4;">
            <span class="text-white text-sm">🤖</span>
        </div>
        <div class="flex-1">
            <div class="rounded-lg p-3" style="background: white; border: 1px solid #e8e3f3;">
                <p class="text-sm" style="color: #3d2d5c;">${escapeHtml(message)}</p>
            </div>
            <p class="text-xs mt-1" style="color: #7c6b9d;">${getCurrentTime()}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    conversationHistory.push({ role: 'assistant', content: message, timestamp: new Date() });
    
    // Speak the response if not muted
    console.log('Muted status:', isMuted);
    if (!isMuted) {
        console.log('Attempting to speak message');
        speakText(message);
    } else {
        console.log('Speech muted');
    }
}

// Process AI Response using OpenRouter
async function processAIResponse(userInput) {
    // Show thinking indicator
    document.getElementById('aiThinkingIndicator').classList.remove('hidden');
    document.getElementById('assistantStatus').textContent = 'Thinking...';
    
    try {
        // Use OpenRouter API
        const result = await openRouterService.sendMessage(userInput, {
            sourceLanguage: document.getElementById('sourceLang')?.value,
            targetLanguage: document.getElementById('targetLang')?.value
        });
        
        document.getElementById('aiThinkingIndicator').classList.add('hidden');
        document.getElementById('assistantStatus').textContent = 'Speaking...';
        
        // Add AI response to chat
        addAIMessage(result.text);
        
        // Handle any translation commands
        if (result.translationCommands && result.translationCommands.length > 0) {
            for (const cmd of result.translationCommands) {
                // Trigger translation in the main app
                if (typeof performTranslation === 'function') {
                    document.getElementById('sourceText').value = cmd.text;
                    document.getElementById('sourceLang').value = cmd.sourceLang;
                    document.getElementById('targetLang').value = cmd.targetLang;
                    await performTranslation(cmd.text, cmd.sourceLang, cmd.targetLang);
                }
            }
        }
        
        document.getElementById('assistantStatus').textContent = 'Click to continue';
        
    } catch (error) {
        console.error('AI Response Error:', error);
        document.getElementById('aiThinkingIndicator').classList.add('hidden');
        document.getElementById('assistantStatus').textContent = 'Error occurred';
        
        // Fallback to simple responses on error
        const fallbackResponse = getSimpleResponse(userInput);
        addAIMessage(fallbackResponse + '\n\n(Note: AI service temporarily unavailable, using basic responses)');
    }
}

// Simple response fallback
function getSimpleResponse(input) {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return 'Hello! How can I assist you today?';
    } else if (lowerInput.includes('translate')) {
        return 'I can help you with translations! Please tell me what you want to translate and to which language.';
    } else if (lowerInput.includes('bargain') || lowerInput.includes('price')) {
        return 'I can help you with bargaining! Use the bargaining assistant section below to calculate offers and get phrases for negotiation.';
    } else if (lowerInput.includes('joke')) {
        const jokes = [
            'Why don\'t programmers like nature? It has too many bugs!',
            'What do you call a bear with no teeth? A gummy bear!',
            'Why did the translator break up? They had communication issues!'
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    } else if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
        return 'I can help you with: 1) Translations between multiple languages, 2) Voice conversations, 3) Bargaining assistance, 4) Festival greetings, 5) Answering questions. Just ask me anything!';
    } else {
        return 'I understand you said: "' + input + '". How can I help you with that?';
    }
}

// Text-to-Speech
function speakText(text) {
    if (!synthesis) {
        console.log('Speech synthesis not supported');
        return;
    }
    
    // Cancel any ongoing speech
    synthesis.cancel();
    
    // Small delay to ensure proper cancellation
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = 'en-US';
        
        utterance.onstart = function() {
            console.log('Speech started');
            document.getElementById('assistantIcon').textContent = '🔊';
        };
        
        utterance.onend = function() {
            console.log('Speech ended');
            document.getElementById('assistantIcon').textContent = '🎤';
            document.getElementById('assistantStatus').textContent = 'Click to continue';
        };
        
        utterance.onerror = function(event) {
            console.error('Speech error:', event.error);
            document.getElementById('assistantIcon').textContent = '🎤';
        };
        
        console.log('Speaking:', text.substring(0, 50) + '...');
        synthesis.speak(utterance);
    }, 100);
}

// Send text message
function sendTextMessage() {
    const input = document.getElementById('textInput');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        processAIResponse(message);
        input.value = '';
    }
}

// Quick prompt
function quickPrompt(prompt) {
    addUserMessage(prompt);
    processAIResponse(prompt);
}

// Clear AI conversation
function clearAIConversation() {
    if (confirm('Are you sure you want to clear the conversation?')) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: #9b87d4;">
                    <span class="text-white text-sm">🤖</span>
                </div>
                <div class="flex-1">
                    <div class="rounded-lg p-3" style="background: white; border: 1px solid #e8e3f3;">
                        <p class="text-sm" style="color: #3d2d5c;">Hello! I'm your AI assistant powered by OpenRouter. You can speak to me naturally - I can help with translations, answer questions, have conversations, and assist you with various tasks. How can I help you today?</p>
                    </div>
                    <p class="text-xs mt-1" style="color: #7c6b9d;">Just now</p>
                </div>
            </div>
        `;
        conversationHistory = [];
        
        // Also clear OpenRouter history
        if (typeof openRouterService !== 'undefined') {
            openRouterService.clearHistory();
        }
    }
}

// Toggle AI mute
function toggleAIMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if (isMuted) {
        btn.innerHTML = '🔇 Voice Off';
        synthesis.cancel();
    } else {
        btn.innerHTML = '🔊 Voice On';
    }
}

// Export AI conversation
function exportAIConversation() {
    if (conversationHistory.length === 0) {
        alert('No conversation to export!');
        return;
    }
    
    let exportText = '=== AI Voice Assistant Conversation ===\n';
    exportText += 'Date: ' + new Date().toLocaleString() + '\n\n';
    
    conversationHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        exportText += `${role} (${msg.timestamp.toLocaleTimeString()}): ${msg.content}\n\n`;
    });
    
    // Download as text file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation_' + Date.now() + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

console.log('AI Voice Assistant initialized');
