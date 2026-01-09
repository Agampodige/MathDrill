// Navigation System
function setupNavigation() {
    const homeButtons = document.querySelectorAll('.nav-button');
    const backButtons = document.querySelectorAll('#backBtn');
    
    console.log('Setting up navigation, found buttons:', homeButtons.length, backButtons.length);
    
    // Add click listeners to navigation buttons
    homeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            console.log('Navigating to:', page);
            navigateToPage(page);
        });
    });
    
    // Add click listeners to back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Going back to home');
            navigateToHome();
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    setupNavigation();
    initializeTheme();
});

// Also setup on window load as backup
window.addEventListener('load', function() {
    console.log('Window Load');
    setupNavigation();
});

function navigateToPage(pageName) {
    const pages = {
        'free_drills': 'free_drills.html',
        'levels': 'levels.html',
        'practice_mode': 'practice_mode.html',
        'analytics': 'analytics.html',
        'settings': 'settings.html'
    };
    
    if (pages[pageName]) {
        window.location.href = pages[pageName];
    }
}

function navigateToHome() {
    window.location.href = 'index.html';
}

// Theme Management (for future customization)
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(themeName) {
    const body = document.body;
    
    if (themeName === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    localStorage.setItem('theme', themeName);
}

// Python Bridge Integration (for Anki addon)
let pybridge = null;
let isConnected = false;

// Initialize WebChannel connection
if (typeof qt !== 'undefined' && qt.webChannelTransport) {
    window.addEventListener('load', function() {
        new QWebChannel(qt.webChannelTransport, function(channel) {
            pybridge = channel.objects.pybridge;
            
            if (pybridge) {
                isConnected = true;
                console.log('✅ Successfully connected to Python bridge');
                
                // Set up message listener
                pybridge.messageReceived.connect(function(message) {
                    console.log('📩 Received from Python:', message);
                    handlePythonMessage(message);
                });
            } else {
                console.log('❌ Failed to connect to Python bridge');
            }
        });
    });
}

function handlePythonMessage(message) {
    try {
        const data = JSON.parse(message);
        const type = data.type;
        const payload = data.payload;
        
        switch(type) {
            case 'hello_response':
                console.log(`👋 Python says: ${payload.message}`);
                break;
            case 'data_response':
                console.log(`📊 Received data: `, payload);
                break;
            default:
                console.log('Unknown message type:', type);
        }
    } catch (e) {
        console.error('Error parsing message:', e);
    }
}

function sendToPython(type, payload) {
    if (isConnected && pybridge) {
        const message = JSON.stringify({
            type: type,
            payload: payload
        });
        pybridge.sendMessage(message);
    } else {
        console.warn('Python bridge not connected');
    }
}
