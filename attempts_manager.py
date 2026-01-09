"""
Attempts Manager - Handles saving and loading practice mode attempts
"""
import json
import os
from datetime import datetime
from pathlib import Path


class AttemptsManager:
    """Manage practice mode attempts data"""
    
    def __init__(self, addon_folder):
        """Initialize the attempts manager
        
        Args:
            addon_folder (str): Path to the addon folder
        """
        self.addon_folder = addon_folder
        self.attempts_file = os.path.join(addon_folder, 'data','user', 'attempts.json')
        self._ensure_data_folder()
    
    def _ensure_data_folder(self):
        """Ensure the data folder exists"""
        data_folder = os.path.dirname(self.attempts_file)
        if not os.path.exists(data_folder):
            os.makedirs(data_folder, exist_ok=True)
    
    def save_attempts(self, attempts_data):
        """Save attempts to file
        
        Args:
            attempts_data (dict): Dictionary with 'lastId' and 'attempts' list
            
        Returns:
            dict: Response with status
        """
        try:
            self._ensure_data_folder()
            
            # Prepare data structure
            save_data = {
                'lastId': attempts_data.get('lastId', 0),
                'attempts': attempts_data.get('attempts', []),
                'lastSaved': datetime.now().isoformat(),
                'totalAttempts': len(attempts_data.get('attempts', []))
            }
            
            # Write to file
            with open(self.attempts_file, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)
            
            return {
                'status': 'success',
                'message': f'Saved {save_data["totalAttempts"]} attempts',
                'lastId': save_data['lastId']
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to save attempts: {str(e)}'
            }
    
    def load_attempts(self):
        """Load attempts from file
        
        Returns:
            dict: Dictionary with 'lastId' and 'attempts' list
        """
        try:
            if not os.path.exists(self.attempts_file):
                return {
                    'lastId': 0,
                    'attempts': [],
                    'message': 'No previous attempts found'
                }
            
            with open(self.attempts_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return {
                'lastId': data.get('lastId', 0),
                'attempts': data.get('attempts', []),
                'totalAttempts': len(data.get('attempts', [])),
                'lastSaved': data.get('lastSaved', '')
            }
        except Exception as e:
            return {
                'lastId': 0,
                'attempts': [],
                'error': f'Failed to load attempts: {str(e)}'
            }
    
    def get_attempt_statistics(self):
        """Get statistics from all attempts
        
        Returns:
            dict: Statistics including accuracy, average time, etc.
        """
        try:
            data = self.load_attempts()
            attempts = data.get('attempts', [])
            
            if not attempts:
                return {
                    'totalAttempts': 0,
                    'correctCount': 0,
                    'accuracy': 0,
                    'avgTime': 0,
                    'byOperation': {}
                }
            
            # Calculate overall stats
            correct_count = sum(1 for a in attempts if a.get('isCorrect', False))
            total_time = sum(a.get('timeTaken', 0) for a in attempts)
            avg_time = total_time / len(attempts) if attempts else 0
            accuracy = (correct_count / len(attempts) * 100) if attempts else 0
            
            # Stats by operation
            by_operation = {}
            for attempt in attempts:
                op = attempt.get('operation', 'unknown')
                if op not in by_operation:
                    by_operation[op] = {
                        'count': 0,
                        'correct': 0,
                        'totalTime': 0
                    }
                
                by_operation[op]['count'] += 1
                if attempt.get('isCorrect', False):
                    by_operation[op]['correct'] += 1
                by_operation[op]['totalTime'] += attempt.get('timeTaken', 0)
            
            # Calculate operation accuracy
            for op in by_operation:
                op_data = by_operation[op]
                op_data['accuracy'] = (op_data['correct'] / op_data['count'] * 100) if op_data['count'] > 0 else 0
                op_data['avgTime'] = op_data['totalTime'] / op_data['count'] if op_data['count'] > 0 else 0
                del op_data['totalTime']
            
            return {
                'totalAttempts': len(attempts),
                'correctCount': correct_count,
                'accuracy': round(accuracy, 2),
                'avgTime': round(avg_time, 2),
                'byOperation': by_operation
            }
        except Exception as e:
            return {
                'error': f'Failed to calculate statistics: {str(e)}'
            }
    
    def get_attempts_by_operation(self, operation):
        """Get all attempts for a specific operation
        
        Args:
            operation (str): Operation type (addition, subtraction, etc.)
            
        Returns:
            list: List of attempts for the operation
        """
        try:
            data = self.load_attempts()
            attempts = data.get('attempts', [])
            return [a for a in attempts if a.get('operation') == operation]
        except Exception as e:
            return []
    
    def clear_attempts(self):
        """Clear all attempts (use with caution!)
        
        Returns:
            dict: Response with status
        """
        try:
            if os.path.exists(self.attempts_file):
                os.remove(self.attempts_file)
            
            return {
                'status': 'success',
                'message': 'All attempts cleared'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to clear attempts: {str(e)}'
            }
    
    def get_file_path(self):
        """Get the attempts file path
        
        Returns:
            str: Full path to attempts.json
        """
        return self.attempts_file
