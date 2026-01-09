# Simple Hello Addon

A basic Anki addon that demonstrates how to create a simple plugin for Anki.

## Features

- Adds a "Show Hello Message" menu item to Anki's Tools menu
- Shows a friendly hello message when clicked
- Displays a notification when the addon is loaded

## Installation

1. Copy the entire addon folder to your Anki addons directory
   - Windows: `%APPDATA%\Anki2\addons21\`
   - Mac: `~/Library/Application Support/Anki2/addons21/`
   - Linux: `~/.local/share/Anki2/addons21/`

2. Restart Anki
3. You should see a notification that the addon loaded successfully
4. Go to Tools → Show Hello Message to test the addon

## Files

- `manifest.json`: Addon metadata and configuration
- `__init__.py`: Main addon code
- `README.md`: This documentation file

## How it works

The addon uses Anki's Python API to:
1. Register a new menu item in the Tools menu
2. Connect that menu item to a function that shows a message dialog
3. Display a notification when the addon is loaded

## Customization

You can modify the `__init__.py` file to:
- Change the message text
- Add more menu items
- Implement additional functionality

## Compatibility

- Anki 2.1.50+ (point version 231200+)
- Tested on Windows, Mac, and Linux
