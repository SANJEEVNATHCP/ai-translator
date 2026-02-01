// Translation functionality using Google Translate API
let translationTimeout = null;

// Update character count
document.getElementById('sourceText').addEventListener('input', function() {
    const count = this.value.length;
    document.getElementById('charCount').textContent = count;
});

// Translate text with debounce
function translateText() {
    clearTimeout(translationTimeout);
    
    const sourceText = document.getElementById('sourceText').value.trim();
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    if (!sourceText) {
        document.getElementById('targetText').innerHTML = '<span class="text-gray-400 italic">Translation will appear here...</span>';
        return;
    }
    
    // Debounce translation
    translationTimeout = setTimeout(async () => {
        await performTranslation(sourceText, sourceLang, targetLang);
    }, 500);
}

// Perform translation using Google Translate API
async function performTranslation(text, sourceLang, targetLang) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const targetText = document.getElementById('targetText');
    
    // Check cache first
    const cacheKey = `${sourceLang}:${targetLang}:${text}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
        const translatedText = cached;
        targetText.innerHTML = `<div class="text-gray-900 font-medium text-lg">${escapeHtml(translatedText)}</div>`;
        
        // Save to history
        saveToHistory(text, translatedText, sourceLang, targetLang);
        
        // Auto-speak if voice was used for input
        if (window.voiceInputUsed) {
            speakTranslation();
            window.voiceInputUsed = false;
        }
        return;
    }
    
    // Show loading
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    targetText.innerHTML = '<span class="text-gray-400 italic">Translating...</span>';
    
    try {
        // Using free Google Translate API endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Translation service unavailable');
        }
        
        const data = await response.json();
        
        // Extract translated text
        let translatedText = '';
        if (data && data[0]) {
            data[0].forEach(item => {
                if (item[0]) {
                    translatedText += item[0];
                }
            });
        }
        
        if (translatedText) {
            targetText.innerHTML = `<div class="text-gray-900 font-medium text-lg">${escapeHtml(translatedText)}</div>`;
            
            // Cache the translation
            sessionStorage.setItem(cacheKey, translatedText);
            
            // Track analytics
            trackTranslation(sourceLang, targetLang);
            
            // Save to history
            saveToHistory(text, translatedText, sourceLang, targetLang);
            
            // Auto-speak if voice was used for input
            if (window.voiceInputUsed) {
                speakTranslation();
                window.voiceInputUsed = false;
            }
        } else {
            throw new Error('No translation received');
        }
        
    } catch (err) {
        error.classList.remove('hidden');
        error.innerHTML = `<strong>❌ Translation Error:</strong> ${err.message}. Please try again.`;
        targetText.innerHTML = '<span class="text-red-400">Translation failed</span>';
    } finally {
        loading.classList.add('hidden');
    }
}

// Swap languages
function swapLanguages() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceText = document.getElementById('sourceText');
    const targetTextDiv = document.getElementById('targetText');
    
    // Don't swap if source is auto-detect
    if (sourceLang.value === 'auto') {
        showNotification('Cannot swap when "Auto Detect" is selected', 'warning');
        return;
    }
    
    // Swap language values
    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;
    
    // Swap text content
    const targetTextContent = targetTextDiv.textContent;
    if (targetTextContent && !targetTextContent.includes('Translation will appear') && !targetTextContent.includes('Translating')) {
        sourceText.value = targetTextContent;
        document.getElementById('charCount').textContent = targetTextContent.length;
        translateText();
    }
    
    showNotification('Languages swapped!', 'success');
}

// Copy translation to clipboard
function copyTranslation() {
    const targetText = document.getElementById('targetText').textContent;
    
    if (targetText && !targetText.includes('Translation will appear') && !targetText.includes('Translating')) {
        navigator.clipboard.writeText(targetText).then(() => {
            showNotification('✅ Copied to clipboard!', 'success');
        }).catch(err => {
            showNotification('Failed to copy: ' + err.message, 'error');
        });
    } else {
        showNotification('Nothing to copy!', 'warning');
    }
}

// Speak translation using Text-to-Speech
function speakTranslation() {
    const targetText = document.getElementById('targetText').textContent;
    const targetLang = document.getElementById('targetLang').value;
    
    if (targetText && !targetText.includes('Translation will appear') && !targetText.includes('Translating')) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(targetText);
            
            // Map language codes to speech synthesis languages
            const langMap = {
                'en': 'en-US', 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN',
                'bn': 'bn-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'kn': 'kn-IN',
                'ml': 'ml-IN', 'pa': 'pa-IN', 'sa': 'hi-IN', 'ur': 'ur-PK'
            };
            
            utterance.lang = langMap[targetLang] || 'en-US';
            utterance.rate = 1.2;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Select best voice for language
            const voices = window.speechSynthesis.getVoices();
            const targetVoice = voices.find(v => v.lang.startsWith(targetLang)) ||
                              voices.find(v => v.lang === utterance.lang);
            if (targetVoice) {
                utterance.voice = targetVoice;
            }
            
            // Visual feedback
            const speakBtn = document.querySelector('button[onclick="speakTranslation()"]');
            if (speakBtn) {
                speakBtn.classList.add('animate-pulse');
                utterance.onend = () => speakBtn.classList.remove('animate-pulse');
            }
            
            // Speak immediately
            window.speechSynthesis.speak(utterance);
        } else {
            showNotification('Text-to-speech not supported', 'error');
        }
    } else {
        showNotification('Nothing to speak!', 'warning');
    }
}

// Set quick phrase
function setQuickPhrase(phrase) {
    document.getElementById('sourceText').value = phrase;
    document.getElementById('charCount').textContent = phrase.length;
    translateText();
}

// Start voice input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('Voice input not supported in this browser. Use Chrome, Edge, or Safari.', 'error');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const sourceLang = document.getElementById('sourceLang').value;
    const btn = document.getElementById('voiceInputBtn');
    
    // Set recognition language
    const langMap = {
        'auto': 'en-IN', 'en': 'en-US', 'hi': 'hi-IN', 'ta': 'ta-IN',
        'te': 'te-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'gu': 'gu-IN',
        'kn': 'kn-IN', 'ml': 'ml-IN', 'pa': 'pa-IN', 'sa': 'hi-IN', 'ur': 'ur-PK'
    };
    
    recognition.lang = langMap[sourceLang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    btn.textContent = '🎤 Listening...';
    btn.classList.add('animate-pulse', 'bg-red-500', 'hover:bg-red-600');
    btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('sourceText').value = transcript;
        document.getElementById('charCount').textContent = transcript.length;
        window.voiceInputUsed = true;
        translateText();
    };
    
    recognition.onerror = function(event) {
        showNotification('Voice input error: ' + event.error, 'error');
    };
    
    recognition.onend = function() {
        btn.textContent = '🎤 Voice Input';
        btn.classList.remove('animate-pulse', 'bg-red-500', 'hover:bg-red-600');
        btn.classList.add('bg-blue-500', 'hover:bg-blue-600');
    };
    
    recognition.start();
}

// Show notification
function showNotification(message, type) {
    const colors = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-orange-500',
        'info': 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type] || 'bg-gray-500'} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Trigger translation when language changes
document.getElementById('sourceLang').addEventListener('change', translateText);
document.getElementById('targetLang').addEventListener('change', translateText);

// Welcome message
setTimeout(() => {
    showNotification('🇮🇳 Happy Republic Day! Translator ready.', 'success');
    loadTheme();
    loadHistory();
}, 500);

// ============================================
// THEME FUNCTIONALITY
// ============================================

function changeTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeNames = {
        'blue': '🔵 Blue Theme',
        'lavender': '💜 Lavender Theme',
        'green': '💚 Green Theme',
        'orange': '🧡 Orange Theme',
        'pink': '💖 Pink Theme',
        'ocean': '🌊 Ocean Theme',
        'sunset': '🌅 Sunset Theme',
        'forest': '🌲 Forest Theme',
        'neon': '⚡ Neon Theme',
        'galaxy': '🌌 Galaxy Theme',
        'tricolor': '🇮🇳 Tricolor Theme',
        'monochrome': '⚪ Monochrome Theme',
        'coffee': '☕ Coffee Theme',
        'winter': '❄️ Winter Theme',
        'grape': '🍇 Grape Theme',
        'citrus': '🍊 Citrus Theme',
        'berry': '🍓 Berry Theme',
        'dark-blue': '🌑 Dark Blue Theme',
        'dark-purple': '🌑 Dark Purple Theme',
        'dark-green': '🌑 Dark Green Theme',
        'dark-ocean': '🌑 Dark Ocean Theme',
        'amoled': '⚫ AMOLED Black Theme',
        'midnight': '🌃 Midnight Theme',
        'dark': '🌙 Dark Theme'
    };
    
    showNotification(themeNames[theme] + ' applied!', 'success');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'blue';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const selector = document.getElementById('themeSelector');
    if (selector) {
        selector.value = savedTheme;
    }
}

// ============================================
// TRANSLATION HISTORY & FAVORITES
// ============================================

let translationHistory = [];
let favoriteTranslations = [];
let currentTranslation = null;

function loadHistory() {
    const saved = localStorage.getItem('translationHistory');
    const savedFavorites = localStorage.getItem('favoriteTranslations');
    
    if (saved) {
        translationHistory = JSON.parse(saved);
    }
    if (savedFavorites) {
        favoriteTranslations = JSON.parse(savedFavorites);
    }
}

function saveToHistory(source, target, sourceLang, targetLang) {
    const entry = {
        id: Date.now(),
        source: source,
        target: target,
        sourceLang: sourceLang,
        targetLang: targetLang,
        timestamp: new Date().toISOString()
    };
    
    currentTranslation = entry;
    
    // Add to beginning of array
    translationHistory.unshift(entry);
    
    // Keep only last 50 translations
    if (translationHistory.length > 50) {
        translationHistory = translationHistory.slice(0, 50);
    }
    
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    updateFavoriteButton();
}

function toggleFavorite() {
    if (!currentTranslation) {
        showNotification('⚠️ No translation to save!', 'warning');
        return;
    }
    
    const existingIndex = favoriteTranslations.findIndex(f => f.id === currentTranslation.id);
    
    if (existingIndex >= 0) {
        // Remove from favorites
        favoriteTranslations.splice(existingIndex, 1);
        document.getElementById('favoriteBtn').textContent = '☆';
        showNotification('🗑️ Removed from favorites', 'info');
    } else {
        // Add to favorites
        favoriteTranslations.unshift(currentTranslation);
        document.getElementById('favoriteBtn').textContent = '★';
        showNotification('⭐ Added to favorites!', 'success');
    }
    
    localStorage.setItem('favoriteTranslations', JSON.stringify(favoriteTranslations));
}

function updateFavoriteButton() {
    if (!currentTranslation) return;
    
    const isFavorite = favoriteTranslations.some(f => f.id === currentTranslation.id);
    document.getElementById('favoriteBtn').textContent = isFavorite ? '★' : '☆';
}

function toggleHistory() {
    const sidebar = document.getElementById('historySidebar');
    const isHidden = sidebar.classList.contains('hidden');
    
    if (isHidden) {
        sidebar.classList.remove('hidden');
        setTimeout(() => {
            sidebar.style.transform = 'translateX(0)';
        }, 10);
        showHistoryTab();
    } else {
        sidebar.style.transform = 'translateX(100%)';
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 300);
    }
}

function showHistoryTab() {
    document.getElementById('historyTab').className = 'flex-1 px-4 py-2 rounded-lg bg-saffron text-white font-bold';
    document.getElementById('favoritesTab').className = 'flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold';
    
    const content = document.getElementById('historyContent');
    
    if (translationHistory.length === 0) {
        content.innerHTML = '<p class="text-gray-500 text-center py-8">No translation history yet</p>';
        return;
    }
    
    content.innerHTML = translationHistory.map(item => `
        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition" onclick="loadHistoryItem(${item.id})">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">${escapeHtml(item.source.substring(0, 50))}${item.source.length > 50 ? '...' : ''}</div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">${escapeHtml(item.target.substring(0, 50))}${item.target.length > 50 ? '...' : ''}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
}

function showFavoritesTab() {
    document.getElementById('historyTab').className = 'flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold';
    document.getElementById('favoritesTab').className = 'flex-1 px-4 py-2 rounded-lg bg-saffron text-white font-bold';
    
    const content = document.getElementById('historyContent');
    
    if (favoriteTranslations.length === 0) {
        content.innerHTML = '<p class="text-gray-500 text-center py-8">No favorites yet<br/>⭐ Click ★ to save translations</p>';
        return;
    }
    
    content.innerHTML = favoriteTranslations.map(item => `
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg cursor-pointer hover:shadow-lg transition" onclick="loadHistoryItem(${item.id})">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white">${escapeHtml(item.source.substring(0, 50))}${item.source.length > 50 ? '...' : ''}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-300 mt-1">${escapeHtml(item.target.substring(0, 50))}${item.target.length > 50 ? '...' : ''}</div>
                </div>
                <button onclick="event.stopPropagation(); removeFavorite(${item.id})" class="text-xl hover:scale-125 transition">🗑️</button>
            </div>
        </div>
    `).join('');
}

function loadHistoryItem(id) {
    const allItems = [...translationHistory, ...favoriteTranslations];
    const item = allItems.find(i => i.id === id);
    
    if (item) {
        document.getElementById('sourceText').value = item.source;
        document.getElementById('sourceLang').value = item.sourceLang;
        document.getElementById('targetLang').value = item.targetLang;
        document.getElementById('charCount').textContent = item.source.length;
        translateText();
        toggleHistory();
    }
}

function removeFavorite(id) {
    const index = favoriteTranslations.findIndex(f => f.id === id);
    if (index >= 0) {
        favoriteTranslations.splice(index, 1);
        localStorage.setItem('favoriteTranslations', JSON.stringify(favoriteTranslations));
        showFavoritesTab();
        updateFavoriteButton();
        showNotification('🗑️ Removed from favorites', 'info');
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all translation history? Favorites will be kept.')) {
        translationHistory = [];
        localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
        showHistoryTab();
        showNotification('🗑️ History cleared', 'info');
    }
}

// ============================================
// EMERGENCY PHRASES
// ============================================

function showEmergencyPhrases() {
    document.getElementById('emergencyModal').classList.remove('hidden');
}

function hideEmergencyPhrases() {
    document.getElementById('emergencyModal').classList.add('hidden');
}

function setEmergencyPhrase(phrase) {
    document.getElementById('sourceText').value = phrase;
    document.getElementById('charCount').textContent = phrase.length;
    window.voiceInputUsed = true;
    translateText();
    hideEmergencyPhrases();
    showNotification('🚨 Emergency phrase ready', 'error');
}

// ============================================
// BULK PURCHASE CALCULATOR
// ============================================

function calculateBulk() {
    const price = parseFloat(document.getElementById('bulkPrice').value) || 0;
    const qty = parseInt(document.getElementById('bulkQty').value) || 0;
    const total = price * qty;
    
    document.getElementById('bulkTotal').textContent = '₹' + total.toLocaleString('en-IN');
}

function translateBulkOffer() {
    const price = parseFloat(document.getElementById('bulkPrice').value);
    const qty = parseInt(document.getElementById('bulkQty').value);
    const total = price * qty;
    
    if (!price || !qty) {
        showNotification('⚠️ Please enter price and quantity!', 'warning');
        return;
    }
    
    const phrase = `I want to buy ${qty} pieces. What is your best price for bulk order? Total is ${total} rupees.`;
    document.getElementById('sourceText').value = phrase;
    document.getElementById('charCount').textContent = phrase.length;
    window.voiceInputUsed = true;
    translateText();
    showNotification('📦 Bulk order phrase ready!', 'success');
}

// ============================================
// FESTIVAL GREETINGS
// ============================================

function setFestivalGreeting(festival) {
    const greetings = {
        'diwali': 'Happy Diwali! May the festival of lights bring joy, prosperity, and happiness to you and your family. Shubh Deepavali!',
        'holi': 'Happy Holi! May the colors of joy, love, and happiness fill your life. Enjoy the festival of colors!',
        'eid': 'Eid Mubarak! May Allah bless you with peace, happiness, and prosperity. Have a blessed Eid!',
        'pongal': 'Happy Pongal! May the harvest festival bring abundance and prosperity to your life. Pongal Vazhthukal!',
        'navratri': 'Happy Navratri! May Goddess Durga bless you with strength and success. Jai Mata Di!',
        'christmas': 'Merry Christmas! May the joy and peace of Christmas be with you and your loved ones.',
        'independence': 'Happy Independence Day! Jai Hind! Celebrating 78 years of freedom and unity. Proud to be Indian!',
        'republic': 'Happy Republic Day! Jai Hind! Celebrating the pride and glory of our Constitution. Vande Mataram!',
        'ganesh': 'Happy Ganesh Chaturthi! Ganpati Bappa Morya! May Lord Ganesha remove all obstacles and bring success.'
    };
    
    const greeting = greetings[festival] || '';
    document.getElementById('sourceText').value = greeting;
    document.getElementById('charCount').textContent = greeting.length;
    window.voiceInputUsed = true;
    translateText();
    showNotification('🎉 Festival greeting ready!', 'success');
}

// Bargaining & Negotiation Features

// Calculate bargain offer
function calculateBargain() {
    const askedPrice = parseFloat(document.getElementById('askedPrice').value) || 0;
    const discount = parseInt(document.getElementById('discountSlider').value);
    
    document.getElementById('discountValue').textContent = discount + '%';
    
    const offerPrice = Math.round(askedPrice * (1 - discount / 100));
    const savedAmount = askedPrice - offerPrice;
    
    document.getElementById('offerPrice').textContent = '₹' + offerPrice.toLocaleString('en-IN');
    document.getElementById('savedAmount').textContent = '₹' + savedAmount.toLocaleString('en-IN');
}

// Translate bargain offer phrase
function translateBargainPhrase() {
    const askedPrice = parseFloat(document.getElementById('askedPrice').value);
    const offerPrice = document.getElementById('offerPrice').textContent.replace('₹', '').replace(/,/g, '');
    
    if (!askedPrice || askedPrice === 0) {
        showNotification('⚠️ Please enter the asked price first!', 'warning');
        return;
    }
    
    const phrase = `This is too expensive. I will give you ${offerPrice} rupees. Is that okay?`;
    document.getElementById('sourceText').value = phrase;
    document.getElementById('charCount').textContent = phrase.length;
    
    // Auto-translate and speak
    window.voiceInputUsed = true;
    translateText();
    
    showNotification('💰 Bargaining phrase ready!', 'success');
}

// Set bargaining phrase
function setBargainPhrase(phrase) {
    document.getElementById('sourceText').value = phrase;
    document.getElementById('charCount').textContent = phrase.length;
    window.voiceInputUsed = true;
    translateText();
}

// Set market scenario phrases
function setScenario(scenario) {
    const scenarios = {
        'vegetables': 'Is this fresh? How much per kilo? Can you give me a better price?',
        'clothes': 'Can I try this? What is the material? Any discount on this?',
        'electronics': 'Is this original? Do you have warranty? What is your best price?',
        'jewelry': 'Is this pure gold? Can you show me the certificate? What is the making charge?',
        'street-food': 'Is this hygienic? One plate please. How much for two plates?',
        'auto-rickshaw': 'Will you go by meter? How much to go to this address? Too much, I will give you 50 rupees.'
    };
    
    const phrase = scenarios[scenario] || '';
    document.getElementById('sourceText').value = phrase;
    document.getElementById('charCount').textContent = phrase.length;
    window.voiceInputUsed = true;
    translateText();
    
    const scenarioNames = {
        'vegetables': '🥬 Vegetables',
        'clothes': '👕 Clothes',
        'electronics': '📱 Electronics',
        'jewelry': '💍 Jewelry',
        'street-food': '🍜 Street Food',
        'auto-rickshaw': '🛺 Auto/Taxi'
    };
    
    showNotification(`Scenario: ${scenarioNames[scenario]}`, 'info');
}

// ============================================
// ANALYTICS & STATISTICS
// ============================================

let analyticsData = JSON.parse(localStorage.getItem('analyticsData')) || {
    totalTranslations: 0,
    languageUsage: {},
    languagePairs: {},
    dailyCount: {},
    hourlyCount: {},
    lastUpdated: new Date().toISOString()
};

let analyticsCharts = {
    languageChart: null,
    trendChart: null,
    pairsChart: null,
    hourChart: null
};

// Track translation for analytics
function trackTranslation(sourceLang, targetLang) {
    // Update total count
    analyticsData.totalTranslations++;
    
    // Track language usage
    analyticsData.languageUsage[sourceLang] = (analyticsData.languageUsage[sourceLang] || 0) + 1;
    analyticsData.languageUsage[targetLang] = (analyticsData.languageUsage[targetLang] || 0) + 1;
    
    // Track language pairs
    const pair = `${sourceLang} → ${targetLang}`;
    analyticsData.languagePairs[pair] = (analyticsData.languagePairs[pair] || 0) + 1;
    
    // Track daily count
    const today = new Date().toISOString().split('T')[0];
    analyticsData.dailyCount[today] = (analyticsData.dailyCount[today] || 0) + 1;
    
    // Track hourly count
    const hour = new Date().getHours();
    analyticsData.hourlyCount[hour] = (analyticsData.hourlyCount[hour] || 0) + 1;
    
    // Save to localStorage
    analyticsData.lastUpdated = new Date().toISOString();
    localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
}

// Toggle analytics modal
function toggleAnalytics() {
    const modal = document.getElementById('analyticsModal');
    const isHidden = modal.classList.contains('hidden');
    
    if (isHidden) {
        modal.classList.remove('hidden');
        updateAnalyticsDashboard();
    } else {
        modal.classList.add('hidden');
        // Destroy charts to free memory
        Object.values(analyticsCharts).forEach(chart => {
            if (chart) chart.destroy();
        });
        analyticsCharts = {
            languageChart: null,
            trendChart: null,
            pairsChart: null,
            hourChart: null
        };
    }
}

// Update analytics dashboard
function updateAnalyticsDashboard() {
    // Update summary cards
    document.getElementById('totalTranslations').textContent = analyticsData.totalTranslations;
    document.getElementById('languagesUsed').textContent = Object.keys(analyticsData.languageUsage).length;
    document.getElementById('favoritesCount').textContent = favoriteTranslations.length;
    
    // Calculate today's count
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('todayCount').textContent = analyticsData.dailyCount[today] || 0;
    
    // Render charts
    renderLanguageChart();
    renderTrendChart();
    renderPairsChart();
    renderHourChart();
    renderDetailedStats();
}

// Render language usage pie chart
function renderLanguageChart() {
    const ctx = document.getElementById('languageChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (analyticsCharts.languageChart) {
        analyticsCharts.languageChart.destroy();
    }
    
    const languageNames = {
        'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu',
        'bn': 'Bengali', 'mr': 'Marathi', 'gu': 'Gujarati', 'kn': 'Kannada',
        'ml': 'Malayalam', 'pa': 'Punjabi', 'sa': 'Sanskrit', 'ur': 'Urdu',
        'auto': 'Auto-detect'
    };
    
    const sortedLanguages = Object.entries(analyticsData.languageUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const labels = sortedLanguages.map(([lang]) => languageNames[lang] || lang);
    const data = sortedLanguages.map(([, count]) => count);
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cdd6f4' : '#1f2937';
    
    analyticsCharts.languageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF9933', '#138808', '#000080', '#FFA500',
                    '#9C27B0', '#E91E63', '#00BCD4', '#4CAF50'
                ],
                borderWidth: 2,
                borderColor: isDark ? '#1e1e2e' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 10,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render translation trend line chart
function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    if (analyticsCharts.trendChart) {
        analyticsCharts.trendChart.destroy();
    }
    
    // Get last 7 days
    const dates = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        counts.push(analyticsData.dailyCount[dateStr] || 0);
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cdd6f4' : '#1f2937';
    const gridColor = isDark ? '#45475a' : '#e5e7eb';
    
    analyticsCharts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Translations',
                data: counts,
                borderColor: '#FF9933',
                backgroundColor: 'rgba(255, 153, 51, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#FF9933'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

// Render language pairs bar chart
function renderPairsChart() {
    const ctx = document.getElementById('pairsChart');
    if (!ctx) return;
    
    if (analyticsCharts.pairsChart) {
        analyticsCharts.pairsChart.destroy();
    }
    
    const sortedPairs = Object.entries(analyticsData.languagePairs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    const labels = sortedPairs.map(([pair]) => pair);
    const data = sortedPairs.map(([, count]) => count);
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cdd6f4' : '#1f2937';
    const gridColor = isDark ? '#45475a' : '#e5e7eb';
    
    analyticsCharts.pairsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Count',
                data: data,
                backgroundColor: '#138808',
                borderColor: '#138808',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: { size: 10 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Render hourly usage chart
function renderHourChart() {
    const ctx = document.getElementById('hourChart');
    if (!ctx) return;
    
    if (analyticsCharts.hourChart) {
        analyticsCharts.hourChart.destroy();
    }
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const counts = hours.map(h => analyticsData.hourlyCount[h] || 0);
    const labels = hours.map(h => `${h}:00`);
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cdd6f4' : '#1f2937';
    const gridColor = isDark ? '#45475a' : '#e5e7eb';
    
    analyticsCharts.hourChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Translations',
                data: counts,
                backgroundColor: '#000080',
                borderColor: '#000080',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 9 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Render detailed statistics
function renderDetailedStats() {
    const container = document.getElementById('detailedStats');
    if (!container) return;
    
    const languageNames = {
        'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu',
        'bn': 'Bengali', 'mr': 'Marathi', 'gu': 'Gujarati', 'kn': 'Kannada',
        'ml': 'Malayalam', 'pa': 'Punjabi', 'sa': 'Sanskrit', 'ur': 'Urdu'
    };
    
    // Find most used language
    let mostUsedLang = 'N/A';
    let maxCount = 0;
    Object.entries(analyticsData.languageUsage).forEach(([lang, count]) => {
        if (lang !== 'auto' && count > maxCount) {
            maxCount = count;
            mostUsedLang = languageNames[lang] || lang;
        }
    });
    
    // Find most popular pair
    const topPair = Object.entries(analyticsData.languagePairs)
        .sort((a, b) => b[1] - a[1])[0];
    
    // Calculate average per day
    const daysWithData = Object.keys(analyticsData.dailyCount).length || 1;
    const avgPerDay = (analyticsData.totalTranslations / daysWithData).toFixed(1);
    
    // Peak hour
    let peakHour = 'N/A';
    let peakCount = 0;
    Object.entries(analyticsData.hourlyCount).forEach(([hour, count]) => {
        if (count > peakCount) {
            peakCount = count;
            peakHour = `${hour}:00`;
        }
    });
    
    const stats = [
        { label: 'Most Used Language', value: mostUsedLang },
        { label: 'Most Popular Pair', value: topPair ? topPair[0] : 'N/A' },
        { label: 'Average Per Day', value: avgPerDay },
        { label: 'Peak Usage Hour', value: peakHour },
        { label: 'Total History Items', value: translationHistory.length },
        { label: 'Last Updated', value: new Date(analyticsData.lastUpdated).toLocaleString() }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <div class="text-xs text-gray-500 dark:text-gray-400">${stat.label}</div>
            <div class="text-lg font-bold text-gray-800 dark:text-white mt-1">${stat.value}</div>
        </div>
    `).join('');
}
