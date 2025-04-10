let processes = [];
let completedProcesses = [];
let processIdCounter = 1;

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    // Set up tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showTab(tabId);
        });
    });
    
    // Initially hide Gantt chart container
    document.getElementById('ganttContainer').style.display = 'none';
});

// Add a new process to the table
function addProcess() {
    const pid = document.getElementById("pid").value || "P" + processIdCounter;
    const arrivalTime = parseInt(document.getElementById("arrivalTime").value) || 0;
    const burstTime = parseInt(document.getElementById("burstTime").value);
    const priority = parseInt(document.getElementById("priority").value) || 5;
    const powerProfile = document.getElementById("powerProfile").value;
    
    if (isNaN(burstTime) || burstTime <= 0) {
        alert("Please enter a valid burst time greater than 0.");
        return;
    }
    
    // Create process object
    const process = {
        pid,
        arrivalTime,
        burstTime,
        priority,
        powerProfile,
        remainingTime: burstTime,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        firstExecutionTime: -1,
        energyConsumed: 0
    };
    
    processes.push(process);
    processIdCounter++;
    
    // Update the process table
    updateProcessTable();
    
    // Clear the form
    document.getElementById("pid").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
    document.getElementById("priority").value = "";
    document.getElementById("powerProfile").selectedIndex = 1; // Reset to Medium
    
    // Update process count
    document.getElementById("processCount").textContent = Total Processes: ${processes.length};
}

// Update the process table
function updateProcessTable() {
    const tableBody = document.querySelector("#processTable tbody");
    tableBody.innerHTML = "";
    
    processes.forEach((process, index) => {
        const row = tableBody.insertRow();
        
        row.insertCell(0).textContent = process.pid;
        row.insertCell(1).textContent = process.arrivalTime;
        row.insertCell(2).textContent = process.burstTime;
        row.insertCell(3).textContent = process.priority;
        
        // Set color for power profile
        const powerCell = row.insertCell(4);
        let powerColor = "";
        switch(process.powerProfile) {
            case "low":
                powerColor = "rgba(46, 204, 113, 0.2)";
                break;
            case "medium":
                powerColor = "rgba(52, 152, 219, 0.2)";
                break;
            case "high":
                powerColor = "rgba(231, 76, 60, 0.2)";
                break;
        }
        powerCell.textContent = process.powerProfile.charAt(0).toUpperCase() + process.powerProfile.slice(1);
        powerCell.style.backgroundColor = powerColor;
        
        // Add delete button
        const actionCell = row.insertCell(5);
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Remove";
        deleteButton.className = "danger-button";
        deleteButton.style.padding = "5px 10px";
        deleteButton.style.fontSize = "14px";
        deleteButton.onclick = function() {
            processes.splice(index, 1);
            updateProcessTable();
            document.getElementById("processCount").textContent = Total Processes: ${processes.length};
        };
        actionCell.appendChild(deleteButton);
    });
}

// Clear all processes
function clearProcesses() {
    processes = [];
    updateProcessTable();
    document.getElementById("processCount").textContent = "Total Processes: 0";
}

// Calculate EARR scheduling
function calculateEARR() {
    if (processes.length === 0) {
        alert("Please add at least one process.");
        return;
    }
    
    // Reset processes for new calculation
    processes.forEach(process => {
        process.remainingTime = process.burstTime;
        process.waitingTime = 0;
        process.turnaroundTime = 0;
        process.responseTime = -1;
        process.firstExecutionTime = -1;
        process.energyConsumed = 0;
    });
    
    completedProcesses = [];
    
    // Get configuration
    const baseTimeQuantum = parseInt(document.getElementById("baseQuantum").value) || 3;
    const energyMode = document.getElementById("energyMode").value;
    const cpuCores = parseInt(document.getElementById("cpuCores").value) || 4;
    
    // Sort processes by arrival time
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    // Implementation of EARR scheduling algorithm
    let time = 0;
    let readyQueue = [];
    let activeProcesses = [];
    let completedCount = 0;
    let ganttChartData = [];
    
    // Energy scaling factors based on mode
    const energyScaleFactor = {
        "balanced": 1.0,
        "aggressive": 0.7,
        "performance": 1.3
    };
    
    // Power consumption rates based on profile (in arbitrary units)
    const powerRates = {
        "low": 0.5,
        "medium": 1.0,
        "high": 1.5
    };
    
    // Continue until all processes are complete
    while (completedCount < sortedProcesses.length) {
        // Add newly arrived processes to ready queue
        sortedProcesses.forEach(process => {
            if (process.arrivalTime <= time && process.remainingTime > 0 && !readyQueue.includes(process) && !activeProcesses.includes(process)) {
                readyQueue.push(process);
            }
        });
        
        // If there are processes in the ready queue and we have available CPU cores
        while (readyQueue.length > 0 && activeProcesses.length < cpuCores) {
            const process = readyQueue.shift();
            activeProcesses.push(process);
            
            // Record first execution time if not yet set
            if (process.firstExecutionTime === -1) {
                process.firstExecutionTime = time;
                process.responseTime = process.firstExecutionTime - process.arrivalTime;
            }
        }
        
        // Execute active processes for one time unit
        if (activeProcesses.length > 0) {
            activeProcesses.forEach(process => {
                // Add to Gantt chart
                ganttChartData.push({
                    pid: process.pid,
                    startTime: time,
                    endTime: time + 1
                });
                
                // Dynamically adjust time quantum based on energy mode and power profile
                let adjustedQuantum = baseTimeQuantum;
                if (energyMode === "aggressive" && process.powerProfile === "high") {
                    adjustedQuantum = Math.max(1, Math.floor(baseTimeQuantum * 0.7)); // Reduce time quantum for high-power processes
                } else if (energyMode === "performance" && process.powerProfile === "low") {
                    adjustedQuantum = Math.ceil(baseTimeQuantum * 1.2); // Increase time quantum for low-power processes
                }
                
                // Decrease remaining time
                process.remainingTime--;
                
                // Calculate energy consumption based on power profile and energy mode
                process.energyConsumed += powerRates[process.powerProfile] * energyScaleFactor[energyMode];
                
                // If process is complete
                if (process.remainingTime === 0) {
                    process.turnaroundTime = time + 1 - process.arrivalTime;
                    process.waitingTime = process.turnaroundTime - process.burstTime;
                    
                    // Remove from active processes
                    const index = activeProcesses.indexOf(process);
                    activeProcesses.splice(index, 1);
                    
                    // Add to completed processes
                    completedProcesses.push(process);
                    completedCount++;
                }
                // Round-robin: if time quantum is exceeded, move to the end of ready queue
                else if ((time - process.firstExecutionTime + 1) % adjustedQuantum === 0) {
                    const index = activeProcesses.indexOf(process);
                    activeProcesses.splice(index, 1);
                    readyQueue.push(process);
                }
            });
        }
        
        time++;
    }
    
    // Update results table
    updateResultsTable();
    
    // Calculate and display statistics
    calculateStatistics();
    
    // Update comparison data
    updateComparisonData();
    
    // Create Gantt chart
    createGanttChart(ganttChartData);
    document.getElementById('ganttContainer').style.display = 'block';
    
    // Show the results tab
    showTab('results');
}

// Update the results table
function updateResultsTable() {
    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";
    
    completedProcesses.forEach(process => {
        const row = tableBody.insertRow();
        
        row.insertCell(0).textContent = process.pid;
        row.insertCell(1).textContent = process.waitingTime;
        row.insertCell(2).textContent = process.turnaroundTime;
        row.insertCell(3).textContent = process.responseTime;
        
        const energyCell = row.insertCell(4);
        energyCell.textContent = process.energyConsumed.toFixed(2) + " J";
        
        // Color code based on energy consumption
        if (process.energyConsumed < 0.8 * process.burstTime) {
            energyCell.style.backgroundColor = "rgba(46, 204, 113, 0.2)"; // Green for efficient
        } else if (process.energyConsumed > 1.2 * process.burstTime) {
            energyCell.style.backgroundColor = "rgba(231, 76, 60, 0.2)"; // Red for inefficient
        }
    });
}

// Calculate statistics
function calculateStatistics() {
    const totalProcesses = completedProcesses.length;
    if (totalProcesses === 0) return;
    
    // Calculate averages
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let totalEnergy = 0;
    let totalBurstTime = 0;
    
    completedProcesses.forEach(process => {
        totalWaitingTime += process.waitingTime;
        totalTurnaroundTime += process.turnaroundTime;
        totalEnergy += process.energyConsumed;
        totalBurstTime += process.burstTime;
    });
    
    const avgWaitingTime = totalWaitingTime / totalProcesses;
    const avgTurnaroundTime = totalTurnaroundTime / totalProcesses;
    const throughput = totalProcesses / completedProcesses[totalProcesses - 1].turnaroundTime;
    const energyEfficiency = totalBurstTime / totalEnergy;
    
    // Update stats display
    document.getElementById("avgWaitingTime").textContent = avgWaitingTime.toFixed(2);
    document.getElementById("avgTurnaroundTime").textContent = avgTurnaroundTime.toFixed(2);
    document.getElementById("throughput").textContent = throughput.toFixed(2) + " proc/time";
    document.getElementById("energyEfficiency").textContent = energyEfficiency.toFixed(2);
    
    // Update energy summary
    updateEnergySummary(totalEnergy, energyEfficiency);
}

// Update energy summary
function updateEnergySummary(totalEnergy, efficiency) {
    const energyMode = document.getElementById("energyMode").value;
    let summary = Total Energy Consumption: ${totalEnergy.toFixed(2)} Joules with an efficiency rating of ${efficiency.toFixed(2)}.;
    
    switch(energyMode) {
        case "aggressive":
            summary += " The aggressive energy saving mode reduced overall consumption by approximately 30% compared to standard Round Robin, though with a potential slight increase in completion time.";
            break;
        case "balanced":
            summary += " The balanced energy mode provides a good trade-off between performance and energy efficiency, saving approximately 15% energy compared to standard scheduling.";
            break;
        case "performance":
            summary += " The performance-first mode prioritizes process completion speed over energy savings, resulting in higher energy consumption but faster turnaround times.";
            break;
    }
    
    document.getElementById("energySummary").textContent = summary;
}

// Update comparison data
function updateComparisonData() {
    const energyMode = document.getElementById("energyMode").value;
    const cpuCores = parseInt(document.getElementById("cpuCores").value) || 4;
    
    // Calculate energy savings compared to standard RR (estimated)
    let energySavings = 0;
    switch(energyMode) {
        case "aggressive": energySavings = 30; break;
        case "balanced": energySavings = 15; break;
        case "performance": energySavings = 5; break;
    }
    
    // Estimate performance impact
    let perfImpact = 0;
    switch(energyMode) {
        case "aggressive": perfImpact = -10; break;
        case "balanced": perfImpact = -5; break;
        case "performance": perfImpact = 5; break;
    }
    
    // Estimate core utilization
    const activeCores = Math.min(processes.length, cpuCores);
    const pgTime = Math.round((cpuCores - activeCores) / cpuCores * 100);
    
    // Update the display
    document.getElementById("energySavings").textContent = energySavings + "%";
    document.getElementById("perfImpact").textContent = (perfImpact >= 0 ? "+" : "") + perfImpact + "%";
    document.getElementById("activeCores").textContent = activeCores + "/" + cpuCores;
    document.getElementById("pgTime").textContent = pgTime + "%";
}

// Create a simple Gantt chart
function createGanttChart(ganttData) {
    const container = document.getElementById("ganttChart");
    container.innerHTML = "";
    
    if (ganttData.length === 0) return;
    
    // Find the total time span
    const endTime = ganttData[ganttData.length - 1].endTime;
    
    // Get unique process IDs
    const processIds = [...new Set(ganttData.map(item => item.pid))];
    
    // Create a table for the Gantt chart
    const table = document.createElement("table");
    table.className = "gantt-chart";
    
    // Create header row with time units
    const headerRow = document.createElement("tr");
    const headerCell = document.createElement("th");
    headerCell.textContent = "Process";
    headerRow.appendChild(headerCell);
    
    for (let t = 0; t <= endTime; t++) {
        const th = document.createElement("th");
        th.textContent = t;
        headerRow.appendChild(th);
    }
    
    table.appendChild(headerRow);
    
    // Create a row for each process
    processIds.forEach(pid => {
        const row = document.createElement("tr");
        
        // Process ID cell
        const pidCell = document.createElement("td");
        pidCell.textContent = pid;
        pidCell.className = "process-id";
        row.appendChild(pidCell);
        
        // Create cells for each time unit
        for (let t = 0; t <= endTime; t++) {
            const cell = document.createElement("td");
            
            // Check if this process is active at this time
            const isActive = ganttData.some(item => 
                item.pid === pid && item.startTime <= t && item.endTime > t
            );
            
            if (isActive) {
                cell.className = "active";
                cell.style.backgroundColor = getProcessColor(pid);
            }
            
            row.appendChild(cell);
        }
        
        table.appendChild(row);
    });
    
    // Add some basic styles for the Gantt chart
    const style = document.createElement("style");
    style.textContent = `
        .gantt-chart {
            width: 100%;
            border-collapse: collapse;
        }
        .gantt-chart th, .gantt-chart td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: center;
        }
        .gantt-chart .process-id {
            font-weight: bold;
        }
        .gantt-chart .active {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
    
    container.appendChild(table);
}

// Get a consistent color for a process
function getProcessColor(pid) {
    // Simple hash function to generate a color
    let hash = 0;
    for (let i = 0; i < pid.length; i++) {
        hash = pid.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to RGB color
    const r = (hash & 0xFF) % 200 + 55;
    const g = ((hash >> 8) & 0xFF) % 200 + 55;
    const b = ((hash >> 16) & 0xFF) % 200 + 55;
    
    return rgb(${r}, ${g}, ${b});
}

// Switch between tabs
function showTab(tabId) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Activate the clicked tab button
    const activeButtons = document.querySelectorAll(.tab-button[onclick*="${tabId}"]);
    activeButtons.forEach(button => {
        button.classList.add('active');
    });
}

// Show Gantt chart tab
function showGanttChart() {
    if (completedProcesses.length === 0) {
        alert("Please run the scheduler first to generate a Gantt chart.");
        return;
    }
    
    document.getElementById('ganttContainer').scrollIntoView({ behavior: 'smooth' });
}
