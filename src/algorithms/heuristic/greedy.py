def energy_aware_greedy(tasks, processors):
    schedule = {p.id: [] for p in processors}
    
    for task in sorted(tasks, key=lambda x: x.priority, reverse=True):
        best_processor = min(processors, 
                           key=lambda p: p.estimate_energy(task))
      
        schedule[best_processor.id].append(task)
        best_processor.update_utilization(task)
        
    return schedule
