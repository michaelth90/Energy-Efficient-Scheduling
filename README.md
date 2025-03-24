# Energy Efficient Scheduling
Overview

This project implements an energy-efficient CPU scheduling algorithm that reduces power consumption while maintaining acceptable performance levels. The algorithm dynamically adjusts CPU frequency and scheduling decisions based on workload characteristics. Our goal is to reduce CPU energy consumption by as much as possible, while meeting the statistical performance requirements of multimedia tasks. The operating system therefore needs to provide predictable CPU scheduling and speed scaling. To do this, we enhance the CPU scheduler to integrate scheduling and speed scaling. This enhanced scheduler, called GRACE-OS, consists of three major components profiler, a SRT scheduler, and a speed adaptor. The profiler monitors the cycle usage of individual tasks, and automatically derives the probability distribution of their cycle demands from the cycle usage. The SRT scheduler is responsible for allocating cycles to tasks and scheduling them to deliver performance guarantees. It performs soft real-time scheduling based on the statistical performance requirements and demand distribution of each task. The speed adaptor adjusts CPU speed dynamically to save energy. It adapts each task’s execution speed based on the task’s time allocation, provided by the SRT scheduler, and demand distribution, provided by the profiler.

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
