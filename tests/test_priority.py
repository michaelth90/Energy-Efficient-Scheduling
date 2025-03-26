from src.models import Task, Processor
from src.algorithms.heuristic.priority import schedule

def test_scheduler_prioritizes_correctly():
    tasks = [Task("t1", 2, 10), Task("t2", 1, 5)]
    procs = [Processor("p1", 10), Processor("p2", 5)]
    
    result = schedule(tasks, procs)
    assert "t1" in result["assignments"]["p2"]
    assert result["energy"] == 5*10 + 5*5
