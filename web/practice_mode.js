// Practice Mode Manager
class PracticeMode {
    constructor() {
        this.currentQuestion = null;
        this.questionCount = 0;
        this.correctCount = 0;
        this.streak = 0;
        this.attempts = [];
        this.lastQuestionId = 0;
        this.timerInterval = null;
        this.questionStartTime = 0;
        this.isPracticing = false;
        this.operation = 'addition';
        this.digits = 2;
        this.autoAdvanceTimer = null;
        this.feedbackShown = false;
        
        this.initializeEventListeners();
        this.loadAttempts();
    }

    initializeEventListeners() {
        document.getElementById('startBtn')?.addEventListener('click', () => this.startPractice());
        document.getElementById('stopBtn')?.addEventListener('click', () => this.stopPractice());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitAnswer());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.skipAutoAdvance());
        document.getElementById('answerInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !document.getElementById('submitBtn').disabled) {
                this.submitAnswer();
            }
        });
        document.getElementById('backBtn')?.addEventListener('click', () => navigateToHome());
    }

    skipAutoAdvance() {
        // Allow user to skip the auto-advance delay
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        this.generateNextQuestion();
    }

    startPractice() {
        this.operation = document.getElementById('operationSelect').value;
        this.digits = parseInt(document.getElementById('digitsSelect').value);
        
        this.isPracticing = true;
        this.questionCount = 0;
        this.correctCount = 0;
        this.streak = 0;
        
        // Hide settings, show practice area and controls
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('practiceArea').style.display = 'block';
        document.getElementById('practiceControls').style.display = 'block';
        document.getElementById('backBtn').style.display = 'none';
        
        this.generateNextQuestion();
    }

    stopPractice() {
        // Confirm stop
        if (!confirm('Stop practicing? Your current streak and session will be lost.')) {
            return;
        }
        
        // Reset state
        this.isPracticing = false;
        this.feedbackShown = false;
        
        // Clear timers
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.autoAdvanceTimer) clearTimeout(this.autoAdvanceTimer);
        
        // Show settings, hide practice area
        document.getElementById('settingsPanel').style.display = 'block';
        document.getElementById('practiceArea').style.display = 'none';
        document.getElementById('practiceControls').style.display = 'none';
        document.getElementById('backBtn').style.display = 'block';
        
        // Reset UI
        this.hideFeedback();
        document.getElementById('answerInput').value = '';
        document.getElementById('timerDisplay').textContent = '0.0s';
    }

    generateRandomNumber(digits) {
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateQuestion() {
        const digits = this.digits;
        let a, b, c, d, expression, answer, display;

        switch(this.operation) {
            case 'addition':
                a = this.generateRandomNumber(digits);
                b = this.generateRandomNumber(digits);
                answer = a + b;
                display = `${a} + ${b}`;
                break;

            case 'subtraction':
                a = this.generateRandomNumber(digits);
                b = this.generateRandomNumber(digits);
                // Ensure positive answer
                if (a < b) [a, b] = [b, a];
                answer = a - b;
                display = `${a} − ${b}`;
                break;

            case 'multiplication':
                a = this.generateRandomNumber(Math.min(digits, 3));
                b = this.generateRandomNumber(Math.min(digits, 3));
                answer = a * b;
                display = `${a} × ${b}`;
                break;

            case 'division':
                b = this.generateRandomNumber(Math.max(1, digits - 1));
                a = b * this.generateRandomNumber(digits - 1);
                answer = a / b;
                display = `${a} ÷ ${b}`;
                break;

            case 'complex':
                answer = this.generateComplexQuestion();
                display = answer.display;
                answer = answer.answer;
                break;

            default:
                a = this.generateRandomNumber(digits);
                b = this.generateRandomNumber(digits);
                answer = a + b;
                display = `${a} + ${b}`;
        }

        return {
            id: this.lastQuestionId + this.questionCount + 1,
            operation: this.operation,
            display: display,
            answer: answer,
            digits: digits
        };
    }

    generateComplexQuestion() {
        const digits = this.digits;
        const patterns = [
            this.patternMultipleAddition,
            this.patternAdditionWithMultiplication,
            this.patternMultipleSubtraction,
            this.patternSubtractionWithDivision,
            this.patternMixedOperations,
            this.patternAdditionWithDivision,
            this.patternThreeOperands,
            this.patternChainedOperations
        ];

        // Pick random pattern
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        return randomPattern.call(this, digits);
    }

    patternMultipleAddition(digits) {
        const a = this.generateRandomNumber(digits);
        const b = this.generateRandomNumber(digits);
        const c = this.generateRandomNumber(digits);
        return {
            display: `${a} + ${b} + ${c}`,
            answer: a + b + c
        };
    }

    patternAdditionWithMultiplication(digits) {
        const a = this.generateRandomNumber(Math.min(digits, 2));
        const b = this.generateRandomNumber(Math.min(digits, 2));
        const c = this.generateRandomNumber(digits);
        // a × b + c
        return {
            display: `${a} × ${b} + ${c}`,
            answer: (a * b) + c
        };
    }

    patternMultipleSubtraction(digits) {
        const a = this.generateRandomNumber(digits);
        const b = this.generateRandomNumber(Math.min(a, digits));
        const c = this.generateRandomNumber(Math.min(a - b, digits));
        // a - b - c
        return {
            display: `${a} − ${b} − ${c}`,
            answer: a - b - c
        };
    }

    patternSubtractionWithDivision(digits) {
        const divisor = this.generateRandomNumber(Math.max(2, digits - 1));
        const dividend = divisor * this.generateRandomNumber(digits - 1);
        const subtrahend = this.generateRandomNumber(digits);
        // dividend ÷ divisor - subtrahend
        return {
            display: `${dividend} ÷ ${divisor} − ${subtrahend}`,
            answer: (dividend / divisor) - subtrahend
        };
    }

    patternMixedOperations(digits) {
        const a = this.generateRandomNumber(Math.min(digits, 2));
        const b = this.generateRandomNumber(Math.min(digits, 2));
        const c = this.generateRandomNumber(digits);
        const d = this.generateRandomNumber(Math.min(digits, 2));
        // a × b + c − d (but with proper order of operations)
        return {
            display: `${a} × ${b} + ${c} − ${d}`,
            answer: (a * b) + c - d
        };
    }

    patternAdditionWithDivision(digits) {
        const divisor = this.generateRandomNumber(Math.max(2, digits - 1));
        const dividend = divisor * this.generateRandomNumber(digits - 1);
        const addend = this.generateRandomNumber(digits);
        // dividend ÷ divisor + addend
        return {
            display: `${dividend} ÷ ${divisor} + ${addend}`,
            answer: (dividend / divisor) + addend
        };
    }

    patternThreeOperands(digits) {
        const a = this.generateRandomNumber(digits);
        const b = this.generateRandomNumber(digits);
        const c = this.generateRandomNumber(digits);
        const d = this.generateRandomNumber(digits);
        // a + b + c + d
        return {
            display: `${a} + ${b} + ${c} + ${d}`,
            answer: a + b + c + d
        };
    }

    patternChainedOperations(digits) {
        const a = this.generateRandomNumber(Math.min(digits, 2));
        const b = this.generateRandomNumber(Math.min(digits, 2));
        const c = this.generateRandomNumber(digits);
        const d = this.generateRandomNumber(Math.min(digits, 2));
        // (a + b) × c − d
        return {
            display: `(${a} + ${b}) × ${c} − ${d}`,
            answer: ((a + b) * c) - d
        };
    }

    generateNextQuestion() {
        this.hideFeedback();
        this.currentQuestion = this.generateQuestion();
        this.questionCount++;
        this.questionStartTime = Date.now();

        // Update display
        document.getElementById('questionText').textContent = this.currentQuestion.display + ' = ?';
        document.getElementById('questionNumber').textContent = this.currentQuestion.id;
        
        // Enable input
        const input = document.getElementById('answerInput');
        input.value = '';
        input.disabled = false;
        input.focus();
        
        document.getElementById('submitBtn').disabled = false;

        // Start timer
        this.startTimer();
    }

    startTimer() {
        let elapsed = 0;
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            elapsed += 0.1;
            document.getElementById('timerDisplay').textContent = elapsed.toFixed(1) + 's';
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    submitAnswer() {
        this.stopTimer();
        
        const userAnswer = parseFloat(document.getElementById('answerInput').value);
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const isCorrect = Math.abs(userAnswer - this.currentQuestion.answer) < 0.01;

        // Update stats
        if (isCorrect) {
            this.correctCount++;
            this.streak++;
        } else {
            this.streak = 0;
        }

        // Store attempt
        const attempt = {
            id: this.currentQuestion.id,
            operation: this.currentQuestion.operation,
            digits: this.currentQuestion.digits,
            question: this.currentQuestion.display,
            userAnswer: userAnswer,
            correctAnswer: this.currentQuestion.answer,
            isCorrect: isCorrect,
            timeTaken: timeTaken,
            timestamp: new Date().toISOString()
        };

        this.attempts.push(attempt);
        this.saveAttempts();

        // Show feedback
        this.showFeedback(isCorrect, userAnswer, timeTaken);

        // Disable input
        document.getElementById('answerInput').disabled = true;
        document.getElementById('submitBtn').disabled = true;
    }

    showFeedback(isCorrect, userAnswer, timeTaken) {
        const feedbackBox = document.getElementById('feedbackBox');
        const feedbackText = document.getElementById('feedbackText');
        const correctAnswer = this.currentQuestion.answer;

        feedbackBox.className = 'feedback-box ' + (isCorrect ? 'correct' : 'incorrect');
        feedbackText.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect';
        feedbackText.style.color = isCorrect ? '#10b981' : '#ef4444';

        document.getElementById('userAnswer').textContent = userAnswer.toString();
        document.getElementById('correctAnswer').textContent = correctAnswer.toString();
        document.getElementById('timeTaken').textContent = timeTaken.toFixed(2) + 's';

        // Update stats summary
        this.updateStatsSummary();

        feedbackBox.style.display = 'block';
        this.feedbackShown = true;

        // Auto-advance after a delay (1.5s for correct, 2s for incorrect)
        const delay = isCorrect ? 1500 : 2000;
        const nextBtn = document.getElementById('nextBtn');
        
        // Clear any existing timer
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
        }
        
        // Show countdown on button
        let remaining = Math.ceil(delay / 1000);
        const originalText = 'Next Question';
        let countdownInterval;
        
        const updateCountdown = () => {
            if (remaining > 0) {
                nextBtn.textContent = `Next Question (${remaining}s)`;
            } else {
                nextBtn.textContent = originalText;
                if (countdownInterval) clearInterval(countdownInterval);
            }
        };
        
        updateCountdown();
        
        countdownInterval = setInterval(() => {
            remaining--;
            updateCountdown();
        }, 1000);

        this.autoAdvanceTimer = setTimeout(() => {
            if (countdownInterval) clearInterval(countdownInterval);
            nextBtn.textContent = originalText;
            this.generateNextQuestion();
        }, delay);
    }

    hideFeedback() {
        // Clear any auto-advance timers
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        document.getElementById('feedbackBox').style.display = 'none';
        this.feedbackShown = false;
    }

    updateStatsSummary() {
        document.getElementById('correctCount').textContent = this.correctCount;
        document.getElementById('streakCount').textContent = this.streak;
        document.getElementById('totalQuestions').textContent = this.questionCount;
        
        const accuracy = this.questionCount > 0 ? Math.round((this.correctCount / this.questionCount) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';

        const totalTime = this.attempts.reduce((sum, a) => sum + a.timeTaken, 0);
        const avgTime = this.questionCount > 0 ? (totalTime / this.questionCount).toFixed(2) : '0.00';
        document.getElementById('avgTime').textContent = avgTime + 's';
    }

    async saveAttempts() {
        // Save to localStorage first (for offline support)
        const attemptsData = {
            lastId: this.lastQuestionId + this.questionCount,
            attempts: this.attempts
        };
        localStorage.setItem('mathDrillAttempts', JSON.stringify(attemptsData));

        // Also save to Python backend if available
        if (typeof pybridge !== 'undefined' && pybridge) {
            try {
                const message = JSON.stringify({
                    type: 'save_attempts',
                    payload: { attempts: attemptsData }
                });
                pybridge.sendMessage(message);
                console.log('Attempts saved to Python backend');
            } catch (e) {
                console.warn('Could not save to Python backend:', e);
            }
        }
    }

    loadAttempts() {
        const saved = localStorage.getItem('mathDrillAttempts');
        if (saved) {
            const data = JSON.parse(saved);
            this.attempts = data.attempts || [];
            this.lastQuestionId = data.lastId || 0;
        }
    }
}

// Initialize Practice Mode when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.practiceMode = new PracticeMode();
});
