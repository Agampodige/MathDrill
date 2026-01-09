from aqt import mw
from aqt.qt import QAction
from aqt.utils import showInfo
from .main import show_addon_dialog

# Initialize the addon
def init():
    # Create the action
    action = QAction("Simple Addon Dialog", mw)
    action.triggered.connect(show_addon_dialog)
    
    # Add to Tools menu
    mw.form.menuTools.addAction(action)
    
    showInfo("Simple Addon with bridge loaded successfully!")

# Call init to register the addon
init()
