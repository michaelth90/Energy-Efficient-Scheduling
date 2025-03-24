import numpy as np
from collections import deque

class EAEDFScheduler:
    def _init_(self, max_freq=3.6, min_freq=1.2):
        self.max_freq = max_freq
        self.min_freq = min_freq
        self.ready_queue = deque()
        
    def add_task(self, task):
        self.ready_queue.append(task)
        
    def schedule(self):
        if not self.ready_queue:
            return None
            
        sorted_tasks = sorted(self.ready_queue, key=lambda x: x['deadline'])
        current_task = sorted_tasks[0]
        freq = self.calculate_optimal_freq(current_task)
        self.execute_task(current_task, freq)
        return current_task
    
    def calculate_optimal_freq(self, task):
        required_freq = task['wcet'] / task['deadline'] * self.max_freq
        return max(min(required_freq, self.max_freq), self.min_freq)
    
    def execute_task(self, task, freq):
        print(f"Executing task {task['id']} at {freq:.2f}GHz")
