# Math Drill Addon - Backend Documentation

## Architecture

The Math Drill addon consists of:

1. **Frontend**: Web-based UI (HTML, CSS, JavaScript)
2. **Backend**: Python/Anki integration
3. **Data Storage**: JSON-based attempts tracking
4. **Bridge**: Qt WebChannel for communication

## Files Overview

### Python Backend Files

#### `attempts_manager.py`
Handles all data storage and retrieval for practice attempts.

**Key Methods:**
- `save_attempts(attempts_data)` - Save attempts to JSON file
- `load_attempts()` - Load attempts from JSON file
- `get_attempt_statistics()` - Calculate statistics from attempts
- `get_attempts_by_operation(operation)` - Filter attempts by operation
- `clear_attempts()` - Clear all attempt data
- `get_file_path()` - Get the attempts file location

**Data Structure:**
```json
{
  "lastId": 123,
  "attempts": [
    {
      "id": 1,
      "operation": "addition",
      "digits": 2,
      "question": "45 + 67",
      "userAnswer": 112,
      "correctAnswer": 112,
      "isCorrect": true,
      "timeTaken": 2.45,
      "timestamp": "2026-01-09T10:30:00"
    }
  ],
  "lastSaved": "2026-01-09T10:30:00",
  "totalAttempts": 123
}
```

#### `bridge.py`
Implements the Qt WebChannel bridge for JavaScript ↔ Python communication.

**Message Types Handled:**
- `save_attempts` - Save practice attempts
- `load_attempts` - Load practice attempts
- `get_statistics` - Get attempt statistics
- `hello` - Test message
- `get_cards` - Get card count from collection
- `show_info` - Show info dialog

**Message Format:**
```json
{
  "type": "message_type",
  "payload": {
    "key": "value"
  }
}
```

#### `main.py`
Main addon entry point that initializes the UI and connects components.

**Key Features:**
- Creates the addon dialog window
- Initializes AttemptsManager
- Sets up the bridge with attempts manager
- Loads the web interface

#### `__init__.py`
Addon initialization and menu registration.

## Data Flow

### Saving Attempts
```
JavaScript (practice_mode.js)
    ↓
pybridge.sendMessage({type: 'save_attempts', payload: {attempts: data}})
    ↓
Bridge.sendMessage() → _handle_save_attempts()
    ↓
AttemptsManager.save_attempts()
    ↓
Write to ~/data/attempts.json
    ↓
Response sent back to JavaScript
```

### Loading Statistics
```
JavaScript (analytics.js)
    ↓
pybridge.sendMessage({type: 'get_statistics', payload: {}})
    ↓
Bridge.sendMessage() → _handle_get_statistics()
    ↓
AttemptsManager.get_attempt_statistics()
    ↓
Calculate and return statistics
    ↓
JavaScript displays statistics
```

## Attempt Statistics

The `get_attempt_statistics()` method returns:

```python
{
    'totalAttempts': int,
    'correctCount': int,
    'accuracy': float,  # percentage
    'avgTime': float,   # seconds
    'byOperation': {
        'addition': {
            'count': int,
            'correct': int,
            'accuracy': float,
            'avgTime': float
        },
        # ... other operations
    }
}
```

## Frontend Integration

### Practice Mode (`practice_mode.js`)
- Generates questions based on operation and digit count
- Runs timers for each question
- Sends attempts to backend via `saveAttempts()`
- Uses localStorage as fallback

### Analytics Page (`analytics.js`)
- Requests statistics from backend
- Displays overall performance metrics
- Shows operation-specific stats
- Lists recent attempts
- Can clear all data with confirmation

## File Storage Location

Attempts are stored in: `<addon_folder>/data/attempts.json`

Default Anki addon location: `~/.local/share/Anki2/addons21/math_drill/data/attempts.json` (Linux/Mac)
or `%APPDATA%\Anki2\addons21\math_drill\data\attempts.json` (Windows)

## Error Handling

Both frontend and backend include:
- Try-catch blocks for error handling
- User feedback via messages
- Fallback to localStorage if backend unavailable
- Detailed error logging

## Future Enhancements

1. Database integration (SQLite/PostgreSQL)
2. Cloud synchronization
3. Spaced repetition algorithm
4. Custom question creation
5. User profiles and progress tracking
6. Export functionality (CSV, PDF)
7. Leaderboards and achievements

## Testing

To test the backend:

1. Start Anki and open the Math Drill addon
2. Go to Practice Mode, solve some problems
3. Check `~/.local/share/Anki2/addons21/math_drill/data/attempts.json`
4. Go to Analytics to see statistics

## Debugging

Check the browser console (F12) for JavaScript errors.
Check Anki console for Python errors.

Example Python debugging in bridge:
```python
print(f"Received message type: {msg_type}")
print(f"Payload: {payload}")
```

Example JavaScript debugging:
```javascript
console.log('Saving attempts:', attemptsData);
console.log('Bridge response:', message);
```
