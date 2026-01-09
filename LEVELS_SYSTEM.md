# Levels System Implementation

## Overview
A complete gamified progression system for the Math Drill addon with 10 predefined levels, star-based unlocking, and persistent progress tracking.

## Files Created/Modified

### Backend (Python)

#### `levels_manager.py` (NEW)
- Manages level definitions and user progression
- Key Classes: `LevelsManager`
- Key Methods:
  - `load_level_data()` - Loads levels from JSON
  - `load_completions()` - Loads user progress from file
  - `save_completions()` - Persists completion data
  - `get_all_levels()` - Returns all levels with unlock status
  - `get_level(level_id)` - Fetches specific level
  - `complete_level()` - Marks level as complete, calculates stars
  - `get_progression_stats()` - Returns overall progress statistics
- Tracks: completed levels, stars earned, best times, accuracies

#### `bridge.py` (MODIFIED)
- Added `levels_manager` parameter to constructor
- New message handlers:
  - `_handle_load_levels()` - Returns all levels with progress
  - `_handle_get_level()` - Returns specific level data
  - `_handle_complete_level()` - Processes level completion
  - `_handle_get_level_progress()` - Returns progression stats

#### `main.py` (MODIFIED)
- Initialize `LevelsManager` alongside `AttemptsManager`
- Pass both managers to `Bridge` for communication

### Frontend (JavaScript/HTML/CSS)

#### `level_progress.html` (NEW)
- Level gameplay interface with:
  - Progress bar showing questions completed
  - Real-time accuracy percentage
  - Optional timer for time-based levels
  - Question display with number input
  - Feedback system with auto-advance (1.5s correct, 2s incorrect)
  - Stars counter (shows estimated stars during play)
  - Completion modal with star rewards

#### `level_progress.js` (NEW)
- Class: `LevelProgress`
- Key Features:
  - Question generation based on level operation (addition, subtraction, multiplication, division, complex)
  - Time tracking for question-solving only (excludes UI delays)
  - Auto-advance with countdown
  - Star calculation based on accuracy:
    - 3 stars: ≥95% accuracy
    - 2 stars: ≥85% accuracy
    - 1 star: ≥min accuracy requirement
  - Completion popup with star display and options (next level, retry, back)
  - URL parameter handling for level ID: `level_progress.html?levelId=1`

#### `levels.html` (MODIFIED)
- Now dynamically loads levels from `level_data.json`
- Displays progression statistics (total stars, completed levels)
- Shows level cards with:
  - Lock status with lock icon for locked levels
  - Difficulty badge with color coding
  - Earned stars for completed levels
  - Requirements for incomplete levels
  - Hover effects for unlocked levels

#### `levels.js` (NEW)
- Class: `LevelsManager`
- Key Features:
  - Loads all levels from Python backend via `load_levels` message
  - Dynamically renders level cards based on unlock status
  - Color-coded difficulty badges
  - Star display for completed levels
  - Click handling to navigate to `level_progress.html?levelId={id}`
  - Updates progression stats in real-time

#### `style.css` (EXTENDED)
- Added 400+ lines of new styles for:
  - `.levels-header` - Header with progression stats
  - `.levels-grid` - Responsive grid layout for level cards
  - `.level-card` - Card styling with states (locked, completed, normal)
  - `.level-card.locked` - Dimmed appearance for locked levels
  - `.level-card.completed` - Green gradient background for completed levels
  - `.difficulty-badge` - Color-coded difficulty indicators
  - `.level-stars` - Star display (filled/empty)
  - `.lock-badge` - Lock icon positioning
  - Level progress page styles:
    - `.level-progress-container` - Main container
    - `.progress-info-bar` - Stat display bar
    - `.progress-bar-container` - Progress visualization
    - `.level-practice-area` - Question area
    - `.question-container` - Question display
    - `.answer-input` - Answer input field
    - `.feedback-area` - Feedback messaging
    - `.stars-counter` - Stars display during play
  - Modal styles:
    - `.modal-overlay` - Semi-transparent background
    - `.modal-content.completion-modal` - Completion popup
    - `.earned-stars` - Star animation
    - `.completion-stats` - Final accuracy and time display
    - `.completion-actions` - Action buttons

### Data Files

#### `data/static/level_data.json` (CREATED/POPULATED)
10 predefined levels with progressive difficulty:

**Tier 1 (Easy):**
1. Counting Start - Single digit addition (5 questions)
2. Double Digits - Two-digit addition (8 questions)
3. Big Numbers - Three-digit addition (10 questions)

**Tier 2 (Medium):**
4. Subtraction Start - Two-digit subtraction (8 questions)
5. Multiply Basics - Multiplication tables (10 questions)
6. Division Training - Division basics (10 questions)

**Tier 3 (Hard):**
7. Mixed Operations - Complex multi-operation (12 questions)
8. Speed Challenge - Timed addition (10 questions, 30s limit)

**Tier 4 (Expert):**
9. Expert Mixed - Three-digit complex operations (15 questions)
10. Master Challenge - Ultimate challenge (20 questions)

Each level includes:
- id, name, description, operation type
- Difficulty level (Easy/Medium/Hard/Extreme)
- Requirements (total questions, min accuracy, min correct, time limit)
- Unlock conditions (e.g., "complete_level_1_with_1_star")

#### `data/user/level_completion.json` (AUTO-CREATED)
Tracks user progress:
```json
{
  "lastUpdated": "ISO timestamp",
  "completions": [
    {
      "levelId": 1,
      "starsEarned": 3,
      "correctAnswers": 5,
      "totalQuestions": 5,
      "bestAccuracy": 100,
      "bestTime": 45.2,
      "completionDate": "ISO timestamp",
      "isNewRecord": true
    }
  ]
}
```

## Features

### Level System
- ✅ 10 progressive levels (not impossible, achievable)
- ✅ Difficulty scaling from Easy → Extreme
- ✅ Multiple operations: addition, subtraction, multiplication, division, complex
- ✅ Unlock system based on star collection
- ✅ Star-based progression (need stars to unlock next levels)

### Gameplay
- ✅ Real-time progress bar (shows X/Y questions)
- ✅ Question counter with total
- ✅ Accuracy percentage tracking (updated per question)
- ✅ Time-based levels (optional time limit with countdown)
- ✅ Time tracking counts only question-solving, not UI delays
- ✅ Auto-advance after feedback (1.5s correct, 2s incorrect)
- ✅ Manual skip available
- ✅ Real-time star estimation during play

### Completion
- ✅ Beautiful completion modal with star animations
- ✅ Shows accuracy and time taken
- ✅ Option to go to next level (if available)
- ✅ Option to retry level
- ✅ Option to return to level selection

### Progression
- ✅ Level lock/unlock system
- ✅ Visual lock indicators (🔒) on locked levels
- ✅ Star display on level cards
- ✅ Overall progression statistics (total stars, completed count)
- ✅ Persistent data storage (survives addon restart)

## Star Calculation Logic

```
Accuracy ≥ 95%  → 3 Stars (Perfect!)
Accuracy ≥ 85%  → 2 Stars (Excellent)
Accuracy ≥ min  → 1 Star  (Passed)
Accuracy < min  → 0 Stars (Failed)

If time-based level exceeds time limit → reduce stars by 1 (min 1)
```

## Unlock Conditions

Levels use flexible unlock conditions:
- `"none"` - Available from start
- `"complete_level_X_with_Y_stars"` - Complete specific level with Y stars
- `"collect_X_stars_from_levels_A_to_B"` - Collect X total stars from level A to B

Example flow:
1. Level 1 unlocked by default
2. Complete Level 1 with 1+ stars → Level 2 unlocks
3. Complete Level 2 with 1+ stars → Level 3 unlocks
4. Complete Levels 1-3 with 7 total stars → Level 8 (Speed Challenge) unlocks

## Communication Flow

### Loading Levels
```
JavaScript: send 'load_levels' message
     ↓
Python: LevelsManager.get_all_levels() + get_progression_stats()
     ↓
JavaScript: Render level cards with unlock status
```

### Starting Level
```
JavaScript: send 'get_level' with levelId
     ↓
Python: LevelsManager.get_level(levelId)
     ↓
JavaScript: Load level data, generate questions
```

### Completing Level
```
JavaScript: send 'complete_level' with stats
     ↓
Python: LevelsManager.complete_level() calculates stars
     ↓
JavaScript: Show completion modal with results
     ↓
Python: Saves to level_completion.json
```

## Question Generation

### Standard Operations
- **Addition**: random(min, max) + random(min, max)
- **Subtraction**: max(a, b) - min(a, b) (never negative)
- **Multiplication**: random × random
- **Division**: (divisor × quotient) ÷ divisor

### Complex Operations (8 patterns)
1. (a + b) × c
2. (a - b) ÷ c
3. a × b + c
4. a ÷ c + b
5. a + b + c
6. a - b + c
7. a × b - c
8. (a + b) ÷ c

Questions are randomized for each level attempt, preventing memorization.

## Browser Compatibility

- Chrome/Chromium (Anki uses this)
- Firefox
- Edge
- Modern browsers with ES6+ support

## Testing Checklist

- [ ] Level 1 loads and can be completed
- [ ] Stars are calculated correctly (95%+ = 3 stars)
- [ ] Next level unlocks after completing with 1+ star
- [ ] Locked levels show lock icon and can't be clicked
- [ ] Progress bar updates correctly during gameplay
- [ ] Timer displays and counts down (time-based levels)
- [ ] Data persists after restarting addon
- [ ] Completion modal shows stars with animation
- [ ] Auto-advance works (1.5s correct, 2s incorrect)
- [ ] Time tracking excludes auto-advance delays
- [ ] Accuracy percentage updates in real-time
- [ ] Difficulty progression is achievable (not impossible)

## Future Enhancements

- [ ] Leaderboards
- [ ] Custom level creation
- [ ] Difficulty presets (Easy, Hard, Expert modes)
- [ ] Dark mode theme for levels
- [ ] Sound effects for level completion
- [ ] Achievement badges
- [ ] Level hints system
- [ ] Streaks and bonus multipliers
- [ ] Social sharing (screenshot level completion)
