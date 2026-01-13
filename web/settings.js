// Settings Page Handler

// Default settings
const DEFAULT_SETTINGS = {
    theme: 'auto',
    soundEnabled: true,
    notificationsEnabled: true,
    problemsPerSession: 10,
    difficultyLevel: 'medium',
    showTimer: true,
    showAccuracy: true,
    autoCheckAnswers: false,
    darkMode: true
};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

// Save settings to localStorage and backend
function saveSettings(settings) {
    // Save to localStorage first
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Also save to backend file
    if (window.pybridge) {
        const message = {
            type: 'save_settings',
            payload: {
                settings: settings
            }
        };
        try {
            window.pybridge.sendMessage(JSON.stringify(message));
            console.log('Settings saved to backend');
        } catch (e) {
            console.warn('Could not save to backend:', e);
        }
    }
}

// Apply settings to the application
function applySettings(settings) {
    // Apply theme
    if (window.applyTheme) {
        applyTheme(settings.theme);
    }
    
    // Store settings in window for global access
    window.appSettings = settings;
    
    // Log for debugging
    console.log('Settings applied:', settings);
}

// Load settings from backend file (if available)
function loadSettingsFromBackend() {
    if (window.pybridge) {
        const message = {
            type: 'load_settings',
            payload: {}
        };
        try {
            window.pybridge.sendMessage(JSON.stringify(message));
            console.log('Loading settings from backend...');
        } catch (e) {
            console.warn('Could not load from backend:', e);
        }
    }
}

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    const settings = loadSettings();
    applySettings(settings);
    
    // Populate form with saved settings
    const themeSelect = document.getElementById('themeSelect');
    const soundToggle = document.getElementById('soundToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const problemsInput = document.getElementById('problemsPerSession');
    const difficultySelect = document.getElementById('difficultyLevel');
    const timerDisplay = document.getElementById('timerDisplay');
    const accuracyDisplay = document.getElementById('accuracyDisplay');
    const autoCheck = document.getElementById('autoCheck');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const backBtn = document.getElementById('backBtn');
    const successMessage = document.getElementById('successMessage');
    
    // Set form values
    if (themeSelect) {
        themeSelect.value = settings.theme;
        themeSelect.addEventListener('change', (e) => {
            if (window.applyTheme) {
                applyTheme(e.target.value);
            }
        });
    }
    if (soundToggle) soundToggle.checked = settings.soundEnabled;
    if (notificationsToggle) notificationsToggle.checked = settings.notificationsEnabled;
    if (problemsInput) problemsInput.value = settings.problemsPerSession;
    if (difficultySelect) difficultySelect.value = settings.difficultyLevel;
    if (timerDisplay) timerDisplay.checked = settings.showTimer;
    if (accuracyDisplay) accuracyDisplay.checked = settings.showAccuracy;
    if (autoCheck) autoCheck.checked = settings.autoCheckAnswers;
    
    // Back button handler
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Save button handler
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const newSettings = {
                theme: themeSelect?.value || 'auto',
                soundEnabled: soundToggle?.checked || true,
                notificationsEnabled: notificationsToggle?.checked || true,
                problemsPerSession: parseInt(problemsInput?.value || 10),
                difficultyLevel: difficultySelect?.value || 'medium',
                showTimer: timerDisplay?.checked || true,
                showAccuracy: accuracyDisplay?.checked || true,
                autoCheckAnswers: autoCheck?.checked || false,
                darkMode: settings.darkMode
            };
            
            // Validate problems per session
            if (newSettings.problemsPerSession < 5) {
                newSettings.problemsPerSession = 5;
                if (problemsInput) problemsInput.value = 5;
            } else if (newSettings.problemsPerSession > 50) {
                newSettings.problemsPerSession = 50;
                if (problemsInput) problemsInput.value = 50;
            }
            
            saveSettings(newSettings);
            applySettings(newSettings);
            showSuccessMessage('Settings saved successfully!');
            
            console.log('Settings saved:', newSettings);
        });
    }
    
    // Reset button handler
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                saveSettings(DEFAULT_SETTINGS);
                applySettings(DEFAULT_SETTINGS);
                
                // Update form
                if (themeSelect) themeSelect.value = DEFAULT_SETTINGS.theme;
                if (soundToggle) soundToggle.checked = DEFAULT_SETTINGS.soundEnabled;
                if (notificationsToggle) notificationsToggle.checked = DEFAULT_SETTINGS.notificationsEnabled;
                if (problemsInput) problemsInput.value = DEFAULT_SETTINGS.problemsPerSession;
                if (difficultySelect) difficultySelect.value = DEFAULT_SETTINGS.difficultyLevel;
                if (timerDisplay) timerDisplay.checked = DEFAULT_SETTINGS.showTimer;
                if (accuracyDisplay) accuracyDisplay.checked = DEFAULT_SETTINGS.showAccuracy;
                if (autoCheck) autoCheck.checked = DEFAULT_SETTINGS.autoCheckAnswers;
                
                // Apply theme
                if (window.applyTheme) {
                    applyTheme(DEFAULT_SETTINGS.theme);
                }
                
                showSuccessMessage('Settings reset to default!');
                console.log('Settings reset to default');
            }
        });
    }
});

// Show success message
function showSuccessMessage(message = 'Settings saved successfully!') {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = '✓ ' + message;
        successMessage.style.display = 'block';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
}

// Get current settings
function getSettings() {
    return loadSettings();
}

// Update specific setting
function updateSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
    applySettings(settings);
    return settings;
}

// Check if a feature is enabled
function isSettingEnabled(key) {
    const settings = getSettings();
    return settings[key] === true;
}

// Get setting value
function getSettingValue(key) {
    const settings = getSettings();
    return settings[key] !== undefined ? settings[key] : DEFAULT_SETTINGS[key];
}
