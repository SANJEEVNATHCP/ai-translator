// Voice Assistant - AI Voice Commands
let voiceAssistantActive = false;
let voiceRecognition = null;
let bestVoice = null;
let aiModeEnabled = false; // Toggle between command mode and AI conversation mode

// Preload and select best voice
function loadBestVoice() {
    if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        // Prefer Indian English female voices for better clarity
        bestVoice = voices.find(v => v.lang.includes('en-IN') && v.name.includes('Female')) ||
                    voices.find(v => v.lang.includes('en-IN')) ||
                    voices.find(v => v.lang.includes('en-US') && v.name.includes('Female')) ||
                    voices.find(v => v.lang.includes('en'));
    }
}

// Initialize voice assistant
function initVoiceAssistant() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SpeechRecognition();
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;
    voiceRecognition.lang = 'en-IN';
    voiceRecognition.maxAlternatives = 3;
    
    // Load voices
    loadBestVoice();
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadBestVoice;
    }
}

// Toggle voice assistant
function toggleVoiceAssistant() {
    if (!voiceRecognition) {
        initVoiceAssistant();
    }
    
    if (!voiceRecognition) {
        showNotification('Voice assistant not supported in this browser', 'error');
        return;
    }
    
    const orb = document.getElementById('voiceOrb');
    const icon = document.getElementById('orbIcon');
    const status = document.getElementById('voiceStatus');
    
    if (voiceAssistantActive) {
        // Deactivate
        voiceRecognition.stop();
        voiceAssistantActive = false;
        orb.classList.remove('animate-pulse');
        icon.textContent = '🎤';
        status.textContent = 'Click to activate voice commands';
        status.classList.remove('text-green-600', 'font-bold');
    } else {
        // Activate
        try {
            voiceRecognition.start();
            voiceAssistantActive = true;
            orb.classList.add('animate-pulse');
            icon.textContent = '🎙️';
            status.textContent = '🔴 Listening for commands...';
            status.classList.add('text-green-600', 'font-bold');
            
            // Speak welcome message
            speak('Namaste! Voice assistant activated. How may I help you?');
            
        } catch (error) {
            showNotification('Could not start voice assistant: ' + error.message, 'error');
        }
    }
    
    // Handle voice recognition results
    voiceRecognition.onresult = function(event) {
        const results = event.results;
        const lastResult = results[results.length - 1];
        const status = document.getElementById('voiceStatus');
        
        // Show interim results for better feedback
        if (!lastResult.isFinal) {
            const interim = lastResult[0].transcript;
            status.textContent = `🎙️ Hearing: "${interim}..."`;
            status.classList.add('text-blue-500');
        } else {
            // Use best confidence result
            const transcript = lastResult[0].transcript.toLowerCase().trim();
            const confidence = lastResult[0].confidence;
            
            status.classList.remove('text-blue-500');
            
            // Only process high confidence results
            if (confidence > 0.5 || !confidence) {
                processVoiceCommand(transcript);
            } else {
                status.textContent = '⚠️ Please speak more clearly';
                speak('I did not understand. Please repeat.');
            }
        }
    };
    
    voiceRecognition.onerror = function(event) {
        if (event.error !== 'no-speech') {
            showNotification('Voice error: ' + event.error, 'error');
        }
    };
    
    voiceRecognition.onend = function() {
        if (voiceAssistantActive) {
            try {
                voiceRecognition.start();
            } catch (error) {
                // Ignore restart errors
            }
        }
    };
}

// Process voice commands
async function processVoiceCommand(command) {
    const status = document.getElementById('voiceStatus');
    status.textContent = `Heard: "${command}"`;
    
    // Check if this is a direct command that should bypass AI
    if (openRouterService && openRouterService.isDirectCommand(command)) {
        processDirectCommand(command);
        return;
    }
    
    // Route to AI conversation mode or command mode
    if (aiModeEnabled && openRouterService && openRouterService.hasApiKey()) {
        await processAiConversation(command);
    } else {
        processDirectCommand(command);
    }
}

// Process with OpenRouter AI
async function processAiConversation(userMessage) {
    const status = document.getElementById('voiceStatus');
    const thinkingIndicator = document.getElementById('aiThinking');
    
    // Add user message to chat
    addChatMessage('user', userMessage);
    
    // Show thinking indicator
    if (thinkingIndicator) {
        thinkingIndicator.classList.remove('hidden');
    }
    status.textContent = '🤖 AI is thinking...';
    
    try {
        // Get current translation context
        const context = {
            sourceLanguage: document.getElementById('sourceLang').value,
            targetLanguage: document.getElementById('targetLang').value
        };
        
        // Send to OpenRouter
        const response = await openRouterService.sendMessage(userMessage, context);
        
        // Hide thinking indicator
        if (thinkingIndicator) {
            thinkingIndicator.classList.add('hidden');
        }
        
        // Add AI response to chat
        addChatMessage('assistant', response.text);
        
        // Speak the response
        status.textContent = '🔊 Speaking...';
        speak(response.text, () => {
            status.textContent = '🎙️ Listening for commands...';
        });
        
        // Process any translation commands embedded in response
        if (response.translationCommands && response.translationCommands.length > 0) {
            for (const cmd of response.translationCommands) {
                await executeTranslationCommand(cmd);
            }
        }
        
    } catch (error) {
        console.error('AI Error:', error);
        if (thinkingIndicator) {
            thinkingIndicator.classList.add('hidden');
        }
        
        const errorMsg = error.message.includes('API key') 
            ? 'Please configure your OpenRouter API key first.'
            : 'Sorry, I encountered an error. Please try again.';
        
        addChatMessage('system', errorMsg);
        speak(errorMsg);
        status.textContent = '❌ Error - Ready to retry';
    }
}

// Execute translation command from AI
async function executeTranslationCommand(cmd) {
    const { sourceLang, targetLang, text } = cmd;
    
    // Update UI
    document.getElementById('sourceLang').value = sourceLang;
    document.getElementById('targetLang').value = targetLang;
    document.getElementById('sourceText').value = text;
    
    // Perform translation
    await translateText();
}

// Process direct commands (fast, no AI)
function processDirectCommand(command) {
    
    // Command: Change target language
    const languages = {
        'hindi': 'hi', 'tamil': 'ta', 'telugu': 'te', 'bengali': 'bn',
        'marathi': 'mr', 'gujarati': 'gu', 'kannada': 'kn', 'malayalam': 'ml',
        'punjabi': 'pa', 'sanskrit': 'sa', 'urdu': 'ur', 'english': 'en'
    };
    
    // Check for "translate to [language]" command
    for (const [langName, langCode] of Object.entries(languages)) {
        if (command.includes(`translate to ${langName}`) || command.includes(`translate in ${langName}`)) {
            document.getElementById('targetLang').value = langCode;
            speak(`Translating to ${langName}`);
            translateText();
            return;
        }
    }
    
    // Check for "swap languages" command
    if (command.includes('swap') && command.includes('language')) {
        swapLanguages();
        speak('Languages swapped');
        return;
    }
    
    // Check for "speak translation" command
    if (command.includes('speak') || command.includes('read')) {
        speakTranslation();
        return;
    }
    
    // Check for "copy translation" command
    if (command.includes('copy')) {
        copyTranslation();
        speak('Translation copied');
        return;
    }
    
    // Check for patriotic phrases
    if (command.includes('jai hind') || command.includes('vande mataram')) {
        speak('Jai Hind! Long live India!');
        return;
    }
    
    // Default: treat as text to translate
    document.getElementById('sourceText').value = command;
    document.getElementById('charCount').textContent = command.length;
    window.voiceInputUsed = true;
    translateText();
}

// Text-to-speech function for assistant
function speak(text, callback) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 1.2;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Use best available voice
        if (bestVoice) {
            utterance.voice = bestVoice;
        }
        
        // Handle events
        utterance.onstart = function() {
            const orb = document.getElementById('voiceOrb');
            if (orb) orb.style.transform = 'scale(1.1)';
        };
        
        utterance.onend = function() {
            const orb = document.getElementById('voiceOrb');
            if (orb) orb.style.transform = 'scale(1)';
            if (callback) callback();
        };
        
        utterance.onerror = function(event) {
            console.error('Speech error:', event.error);
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initVoiceAssistant();
});
