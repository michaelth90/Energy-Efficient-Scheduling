class PriorityScheduler:
    def __init__(self, processors):
        self.processors = processors
    
    def schedule(self, tasks):
        schedule = {p['id']: [] for p in self.processors}
        total_energy = 0.0
        
        sorted_tasks = sorted(tasks, key=lambda x: x['priority'], reverse=True)
        
        for task in sorted_tasks:
            best_proc = min(
                self.processors,
                key=lambda p: p['efficiency'] * task['demand'] * task['duration']
            )
            
            schedule[best_proc['id']].append(task['id'])
            task_energy = best_proc['efficiency'] * task['demand'] * task['duration']
            total_energy += task_energy
            
        return {
            'schedule': schedule,
            'energy': total_energy
        }
