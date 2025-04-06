# Energy Efficient CPU Scheduling
Overview

An energy-efficient CPU scheduling is an algorithm that reduces power consumption while maintaining acceptable performance levels. The algorithm dynamically adjusts CPU frequency and scheduling decisions based on workload characteristics. Our goal is to reduce CPU energy consumption by as much as possible, while meeting the statistical performance requirements of multimedia tasks. The operating system therefore needs to provide predictable CPU scheduling and speed scaling. To do this, we enhance the CPU scheduler to integrate scheduling and speed scaling.

This project implements an Energy-Aware Round Robin (EARR) scheduling algorithm for CPU process management with a focus on energy efficiency. The system provides a web-based interface where users can input process details (Process ID, Arrival Time, and Burst Time) and visualize the scheduling results, including waiting time, turnaround time, and energy consumption metrics.

The EARR algorithm extends traditional Round Robin scheduling by incorporating energy consumption considerations, making it relevant for modern computing systems where energy efficiency is critical. The algorithm dynamically adjusts time quantum and considers processor power states to optimize both performance and energy usage.

Key improvements over traditional RR:

Dynamic Time Quantum: Adjusts based on process characteristics

Energy Modeling: Tracks power consumption in Joules

Efficient Context Switching: Minimizes overhead

Key Features:

Energy-aware scheduling decisions

Real-time calculations

No backend required

Educational visualization

Technology Used:-

Programming Languages:

HTML5: For website structure and content.

CSS3: For styling and visual presentation.

JavaScript: For algorithm implementation and interactivity.
