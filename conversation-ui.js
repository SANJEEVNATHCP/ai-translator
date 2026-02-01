// UI Helper Functions for AI Conversation

// Add message to chat history
function addChatMessage(role, content) {
    const chatHistory = document.getElementById('chatHistory');
    
    // Remove empty state if present
    const emptyState = chatHistory.querySelector('.text-center.text-gray-400');
    if (emptyState) {
        chatHistory.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = role === 'user' 
        ? 'flex justify-end' 
        : role === 'system'
        ? 'flex justify-center'
        : 'flex justify-start';
    
    const bubble = document.createElement('div');
    bubble.className = role === 'user'
        ? 'bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[80%] shadow'
        : role === 'system'
        ? 'bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg max-w-[90%] text-sm border border-yellow-300'
        : 'bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-[80%] shadow';
    
    const icon = role === 'user' ? '👤' : role === 'system' ? '⚠️' : '🤖';
    bubble.innerHTML = `<div class="flex items-start gap-2">
        <span class="text-lg">${icon}</span>
        <div>
            <p class="text-sm whitespace-pre-wrap">${escapeHtml(content)}</p>
            <p class="text-xs opacity-70 mt-1">${new Date().toLocaleTimeString()}</p>
        </div>
    </div>`;
    
    messageDiv.appendChild(bubble);
    chatHistory.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Clear conversation
function clearConversation() {
    if (confirm('Clear entire conversation history?')) {
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.innerHTML = `<div class="text-center text-gray-400 py-8">
            <p class="text-sm">💡 <strong>Command Mode</strong>: Fast voice commands</p>
            <p class="text-sm mt-2">🤖 <strong>AI Mode</strong>: Natural conversations</p>
            <p class="text-xs mt-4 text-gray-500">Configure API key and toggle AI Mode above to start chatting!</p>
        </div>`;
        
        // Clear OpenRouter history
        if (openRouterService) {
            openRouterService.clearHistory();
        }
        
        showNotification('Conversation cleared', 'success');
    }
}

// Save API key (kept for backward compatibility, but not needed with hardcoded key)
function saveApiKey() {
    showNotification('API key is pre-configured!', 'success');
}

// Toggle AI Mode
function toggleAiMode() {
    aiModeEnabled = !aiModeEnabled;
    
    const toggleBtn = document.getElementById('aiModeToggle');
    if (aiModeEnabled) {
        toggleBtn.className = 'bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition w-full md:w-auto min-h-[44px]';
        toggleBtn.textContent = '🤖 AI Mode: ON';
        showNotification('AI Mode enabled - Have natural conversations!', 'success');
        addChatMessage('system', '🤖 AI Mode activated! Ask me anything or request translations.');
    } else {
        toggleBtn.className = 'bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold transition w-full md:w-auto min-h-[44px]';
        toggleBtn.textContent = '🤖 AI Mode: OFF';
        showNotification('Command Mode enabled - Fast voice commands', 'success');
        addChatMessage('system', '⚡ Command Mode activated! Use quick voice commands.');
    }
}

// Load API key on startup
document.addEventListener('DOMContentLoaded', function() {
    // API key is pre-configured
    if (openRouterService && openRouterService.hasApiKey()) {
        addChatMessage('system', '🤖 AI Assistant ready! Toggle AI Mode to start conversations.');
    } else {
        addChatMessage('system', '⚠️ Please configure your OpenRouter API key in openrouter-service.js');
    }
});

// Utility function to escape HTML (reuse from app.js if not defined)
if (typeof escapeHtml === 'undefined') {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
