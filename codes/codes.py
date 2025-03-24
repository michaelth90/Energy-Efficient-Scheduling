class PARoundRobin:
    def _init_(self, time_quantum=10):
        self.time_quantum = time_quantum
        self.tasks = []
        
    def add_task(self, task):
        self.tasks.append(task)
        
    def schedule(self):
        energy_savings = 0
        while self.tasks:
            for task in self.tasks[:]:
                adj_quantum = self.calculate_quantum(task)
                energy = self.execute_task(task, adj_quantum)
                energy_savings += energy
                task['remaining'] -= adj_quantum
                if task['remaining'] <= 0:
                    self.tasks.remove(task)
        return energy_savings
    
    def calculate_quantum(self, task):
        base_quantum = self.time_quantum
        if task['type'] == 'cpu_bound':
            return base_quantum * 0.8
        return base_quantum * 1.2
    
    def execute_task(self, task, quantum):
        print(f"Executing {task['id']} for {quantum}ms")
        return quantum * 0.75
