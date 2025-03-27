# Energy Efficient Scheduling
Overview

An energy-efficient CPU scheduling is an algorithm that reduces power consumption while maintaining acceptable performance levels. The algorithm dynamically adjusts CPU frequency and scheduling decisions based on workload characteristics. Our goal is to reduce CPU energy consumption by as much as possible, while meeting the statistical performance requirements of multimedia tasks. The operating system therefore needs to provide predictable CPU scheduling and speed scaling. To do this, we enhance the CPU scheduler to integrate scheduling and speed scaling. 
This project implements an Energy-Aware Round Robin (EARR) scheduling algorithm for CPU process management with a focus on energy efficiency. The system provides a web-based interface where users can input process details (Process ID, Arrival Time, and Burst Time) and visualize the scheduling results, including waiting time, turnaround time, and energy consumption metrics.
The EARR algorithm extends traditional Round Robin scheduling by incorporating energy consumption considerations, making it relevant for modern computing systems where energy efficiency is critical. The algorithm dynamically adjusts time quantum and considers processor power states to optimize both performance and energy usage.
Features:
- Dynamic voltage and frequency scaling (DVFS) integration
- Workload-aware task scheduling
- Energy-performance tradeoff optimization
- Real-time and non-real-time task support
- Deadline Awareness
- Quality of Service (QoS) Considerations 

Algorithm Types Implemented:
1. Energy-Aware Earliest Deadline First (EA-EDF)
2. Power-Aware Round Robin (PA-RR)
3. Dynamic Priority Energy-Efficient Scheduling (DPES)

Requirements:
- Python 3.8+
- Linux kernel (for DVFS testing)
- psutil library
- numpy

Block Diagram:
```

+-------------------------------------------------------+
|               Energy-Efficient Scheduler               |
+-------------------------------------------------------+
|  +-------------------+       +---------------------+  |
|  |   Task Queue      |       |   Power Management  |  |
|  | (Ready Processes) |<--->  |   (DVFS, Sleep)     |  |
|  +-------------------+       +---------------------+  |
|           |                           ^                |
|           v                           |                |
|  +-------------------+       +---------------------+  |
|  |  Scheduling Logic |       |   Energy Monitor    |  |
|  | (E.g., EDF, MLFQ) |<----->| (CPU Utilization,   |  |
|  +-------------------+       |  Temp, Power)       |  |
|           |                  +---------------------+  |
|           v                                           |
|  +-------------------+                                |
|  |  CPU Core (Low    |                                |
|  |  Power States)    |                                |
|  +-------------------+                                |
+-------------------------------------------------------+
+-------------------------------------------------------+
```
