class LevelsManager {
    constructor() {
        this.levels = [];
        this.stats = {};
        this.initializeEventListeners();
        this.loadLevels();
    }

    initializeEventListeners() {
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    loadLevels() {
        // Request levels from Python backend
        const message = {
            type: 'load_levels',
            payload: {}
        };

        window.pybridge.sendMessage(JSON.stringify(message));

        // Listen for response
        if (window.pybridge && window.pybridge.messageReceived) {
            window.pybridge.messageReceived.connect((response) => {
                try {
                    const data = JSON.parse(response);
                    if (data.type === 'load_levels_response') {
                        this.levels = data.payload.levels || [];
                        this.stats = data.payload.stats || {};
                        this.displayLevels();
                        this.updateStats();
                    }
                } catch (e) {
                    console.error('Error loading levels:', e);
                }
            });
        }
    }

    displayLevels() {
        const container = document.getElementById('levelsContainer');
        container.innerHTML = '';

        if (!this.levels || this.levels.length === 0) {
            container.innerHTML = '<p class="no-levels">No levels found. Check your configuration.</p>';
            return;
        }

        this.levels.forEach((level) => {
            const card = this.createLevelCard(level);
            container.appendChild(card);
        });
    }

    createLevelCard(level) {
        const card = document.createElement('div');
        card.className = 'level-card';

        if (level.isLocked) {
            card.classList.add('locked');
        } else if (level.isCompleted) {
            card.classList.add('completed');
        }

        // Create stars display for completed levels
        let starsHtml = '';
        if (level.isCompleted) {
            starsHtml = '<div class="level-stars">';
            for (let i = 0; i < level.starsEarned; i++) {
                starsHtml += '<span class="star-filled">★</span>';
            }
            for (let i = level.starsEarned; i < 3; i++) {
                starsHtml += '<span class="star-empty">☆</span>';
            }
            starsHtml += '</div>';
        }

        // Create lock badge if locked
        let lockHtml = '';
        if (level.isLocked) {
            lockHtml = '<div class="lock-badge">🔒</div>';
        }

        // Create difficulty badge
        const diffColor = this.getDifficultyColor(level.difficulty);
        const diffBadge = `<span class="difficulty-badge" style="background-color: ${diffColor};">${level.difficulty}</span>`;

        const completionText = level.isCompleted 
            ? `<p class="completion-date">Completed</p>`
            : `<p class="requirements">Complete ${level.requirements.minCorrect}/${level.requirements.totalQuestions} questions</p>`;

        card.innerHTML = `
            <div class="level-card-header">
                <h3>${level.name}</h3>
                ${diffBadge}
            </div>
            <p class="level-description">${level.description}</p>
            ${completionText}
            ${starsHtml}
            ${lockHtml}
        `;

        // Add click handler only if unlocked
        if (!level.isLocked) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => this.startLevel(level.id));
        }

        return card;
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'Easy': '#4CAF50',
            'Medium': '#FF9800',
            'Hard': '#FF5722',
            'Extreme': '#9C27B0'
        };
        return colors[difficulty] || '#999';
    }

    startLevel(levelId) {
        window.location.href = `level_progress.html?levelId=${levelId}`;
    }

    updateStats() {
        if (!this.stats) return;

        document.getElementById('totalStars').textContent = this.stats.totalStars || 0;
        document.getElementById('completedCount').textContent = this.stats.completedLevels || 0;
        document.getElementById('totalCount').textContent = this.stats.totalLevels || 0;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Setup WebChannel
    if (typeof QWebChannel !== 'undefined') {
        new QWebChannel(qt.webChannelTransport, (channel) => {
            window.pybridge = channel.objects.pybridge;
            new LevelsManager();
        });
    } else {
        // Fallback if WebChannel not immediately available
        window.addEventListener('load', () => {
            if (typeof QWebChannel !== 'undefined') {
                new QWebChannel(qt.webChannelTransport, (channel) => {
                    window.pybridge = channel.objects.pybridge;
                    new LevelsManager();
                });
            }
        });
    }
});
