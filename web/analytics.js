// Analytics Manager
class AnalyticsManager {
    constructor() {
        this.statistics = null;
        this.attempts = [];
        
        this.initializeEventListeners();
        this.loadStatistics();
    }

    initializeEventListeners() {
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadStatistics());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearAllData());
        document.getElementById('backBtn')?.addEventListener('click', () => navigateToHome());
    }

    loadStatistics() {
        // Try to get statistics from Python backend first
        if (typeof pybridge !== 'undefined' && pybridge) {
            const message = JSON.stringify({
                type: 'get_statistics',
                payload: {}
            });
            pybridge.sendMessage(message);
        } else {
            // Fallback to localStorage
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('mathDrillAttempts');
        if (saved) {
            const data = JSON.parse(saved);
            this.attempts = data.attempts || [];
            this.calculateStatistics();
        } else {
            this.showEmptyState();
        }
    }

    calculateStatistics() {
        if (this.attempts.length === 0) {
            this.showEmptyState();
            return;
        }

        // Overall statistics
        const totalProblems = this.attempts.length;
        const correctAnswers = this.attempts.filter(a => a.isCorrect).length;
        const overallAccuracy = Math.round((correctAnswers / totalProblems) * 100);
        const totalTime = this.attempts.reduce((sum, a) => sum + a.timeTaken, 0);
        const avgTime = (totalTime / totalProblems).toFixed(2);

        // Update overall stats display
        document.getElementById('totalProblems').textContent = totalProblems;
        document.getElementById('correctAnswers').textContent = correctAnswers;
        document.getElementById('overallAccuracy').textContent = overallAccuracy + '%';
        document.getElementById('avgTime').textContent = avgTime + 's';

        // Calculate statistics by operation
        this.displayOperationStats();

        // Display recent attempts
        this.displayRecentAttempts();
    }

    displayOperationStats() {
        const byOperation = {};

        // Group by operation
        this.attempts.forEach(attempt => {
            const op = attempt.operation;
            if (!byOperation[op]) {
                byOperation[op] = {
                    count: 0,
                    correct: 0,
                    totalTime: 0,
                    items: []
                };
            }
            
            byOperation[op].count++;
            if (attempt.isCorrect) byOperation[op].correct++;
            byOperation[op].totalTime += attempt.timeTaken;
            byOperation[op].items.push(attempt);
        });

        // Create operation stats HTML
        const statsHtml = Object.entries(byOperation).map(([op, data]) => {
            const accuracy = Math.round((data.correct / data.count) * 100);
            const avgTime = (data.totalTime / data.count).toFixed(2);
            const opDisplay = this.getOperationDisplay(op);

            return `
                <div class="operation-stat-card">
                    <h3>${opDisplay}</h3>
                    <div class="stat-row">
                        <span>Attempts:</span> <strong>${data.count}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Correct:</span> <strong>${data.correct}/${data.count}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span> <strong>${accuracy}%</strong>
                    </div>
                    <div class="stat-row">
                        <span>Avg Time:</span> <strong>${avgTime}s</strong>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('operationStats').innerHTML = statsHtml || '<p>No data available</p>';
    }

    displayRecentAttempts() {
        const tbody = document.getElementById('attemptsBody');
        
        // Show last 20 attempts
        const recent = this.attempts.slice(-20).reverse();

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No attempts yet</td></tr>';
            return;
        }

        const html = recent.map(attempt => `
            <tr class="${attempt.isCorrect ? 'correct-row' : 'incorrect-row'}">
                <td>${attempt.id}</td>
                <td>${this.getOperationDisplay(attempt.operation)}</td>
                <td>${attempt.question}</td>
                <td>${attempt.userAnswer}</td>
                <td>${attempt.correctAnswer}</td>
                <td>${attempt.timeTaken.toFixed(2)}</td>
                <td class="result-cell">${attempt.isCorrect ? '✓' : '✗'}</td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    displayStatisticsFromBackend(stats) {
        if (stats.error) {
            console.error('Error loading statistics:', stats.error);
            this.loadFromLocalStorage();
            return;
        }

        // Update overall stats
        document.getElementById('totalProblems').textContent = stats.totalAttempts || 0;
        document.getElementById('correctAnswers').textContent = stats.correctCount || 0;
        document.getElementById('overallAccuracy').textContent = (stats.accuracy || 0) + '%';
        document.getElementById('avgTime').textContent = (stats.avgTime || 0) + 's';

        // Display operation stats
        const byOperation = stats.byOperation || {};
        const statsHtml = Object.entries(byOperation).map(([op, data]) => {
            const opDisplay = this.getOperationDisplay(op);
            return `
                <div class="operation-stat-card">
                    <h3>${opDisplay}</h3>
                    <div class="stat-row">
                        <span>Attempts:</span> <strong>${data.count}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Correct:</span> <strong>${data.correct}/${data.count}</strong>
                    </div>
                    <div class="stat-row">
                        <span>Accuracy:</span> <strong>${Math.round(data.accuracy)}%</strong>
                    </div>
                    <div class="stat-row">
                        <span>Avg Time:</span> <strong>${data.avgTime.toFixed(2)}s</strong>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('operationStats').innerHTML = statsHtml || '<p>No data available</p>';

        // Load attempts for recent table
        this.loadFromLocalStorage();
    }

    getOperationDisplay(op) {
        const displays = {
            'addition': 'Addition (+)',
            'subtraction': 'Subtraction (−)',
            'multiplication': 'Multiplication (×)',
            'division': 'Division (÷)',
            'complex': 'Complex (Mixed)'
        };
        return displays[op] || op;
    }

    showEmptyState() {
        document.getElementById('totalProblems').textContent = '0';
        document.getElementById('correctAnswers').textContent = '0';
        document.getElementById('overallAccuracy').textContent = '0%';
        document.getElementById('avgTime').textContent = '0.0s';
        document.getElementById('operationStats').innerHTML = '<p class="loading">No practice attempts yet. Start practicing to see your statistics!</p>';
        document.getElementById('attemptsBody').innerHTML = '<tr><td colspan="7" class="loading">No attempts yet</td></tr>';
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete all practice data? This cannot be undone.')) {
            localStorage.removeItem('mathDrillAttempts');
            
            // Clear on Python backend too
            if (typeof pybridge !== 'undefined' && pybridge) {
                const message = JSON.stringify({
                    type: 'clear_attempts',
                    payload: {}
                });
                pybridge.sendMessage(message);
            }
            
            this.attempts = [];
            this.showEmptyState();
            alert('All data has been cleared!');
        }
    }
}

// Handle messages from Python backend
function handleBackendMessage(message) {
    try {
        const data = JSON.parse(message);
        
        if (data.type === 'statistics_response' && window.analyticsManager) {
            window.analyticsManager.displayStatisticsFromBackend(data.payload);
        }
    } catch (e) {
        console.error('Error handling backend message:', e);
    }
}

// Initialize Analytics Manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.analyticsManager = new AnalyticsManager();
});
