let processes = [];
let results = [];

// Tab switching functionality
function showTab(tabId) {
    // Remove active class from all tab buttons and content
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to the clicked tab button
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    // Show the corresponding tab content
    document.getElementById(tabId).classList.add('active');
}

// Process handling functions
function addProcess() {
    // Get values from the form
    const pid = document.getElementById('pid').value;
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
    const burstTime = parseInt(document.getElementById('burstTime').value);
    const priority = parseInt(document.getElementById('priority').value) || 5;
    const powerProfile = document.getElementById('powerProfile').value;
    
    // Validate inputs
    if (!pid || isNaN(arrivalTime) || isNaN(burstTime) || burstTime <= 0) {
        alert('Please fill all required fields with valid values.');
        return;
    }
    
    // Add to processes array
    processes.push({
        pid: pid,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        priority: priority,
        powerProfile: powerProfile,
        remainingTime: burstTime
    });
    
    // Update the table
    updateProcessTable();
    
    // Clear the form
    document.getElementById('processForm').reset();
}

function updateProcessTable() {
    const tbody = document.querySelector('#processTable tbody');
    tbody.innerHTML = '';
    
    processes.forEach((process, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.pid}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.priority}</td>
            <td>${process.powerProfile}</td>
            <td><button class="danger-button" onclick="removeProcess(${index})">Remove</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Update process count
    document.getElementById('processCount').textContent = `Total Processes: ${processes.length}`;
}

function removeProcess(index) {
    processes.splice(index, 1);
    updateProcessTable();
}

function clearProcesses() {
    processes = [];
    updateProcessTable();
}

// Scheduling algorithm functions
function calculateEARR() {
    if (processes.length === 0) {
        alert('Please add at least one process.');
        return;
    }
    
    // Get configuration
    const baseQuantum = parseInt(document.getElementById('baseQuantum').value);
    const energyMode = document.getElementById('energyMode').value;
    const cpuCores = parseInt(document.getElementById('cpuCores').value);
    
    // Implement EARR scheduling algorithm here
    // This is a simplified example
    
    // Reset results
    results = [];
    
    // Sort processes by arrival time
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    // Clone processes for calculation
    const processQueue = sortedProcesses.map(p => ({ ...p }));
    
    let currentTime = 0;
    let completed = 0;
    const ganttChart = [];
    
    // Simple RR simulation with energy considerations
    while (completed < processQueue.length) {
        let foundProcess = false;
        
        for (let i = 0; i < processQueue.length; i++) {
            if (processQueue[i].remainingTime > 0 && processQueue[i].arrivalTime <= currentTime) {
                foundProcess = true;
                
                // Calculate quantum based on power profile and energy mode
                let quantum = baseQuantum;
                if (energyMode === 'aggressive' && processQueue[i].powerProfile === 'high') {
                    quantum = Math.max(1, baseQuantum - 1); // Reduce time for high power processes
                } else if (energyMode === 'performance' && processQueue[i].powerProfile === 'high') {
                    quantum = baseQuantum + 1; // Increase time for high power processes
                }
                
                // Execute process for quantum or remaining time
                const executeTime = Math.min(quantum, processQueue[i].remainingTime);
                
                // Add to Gantt chart
                ganttChart.push({
                    pid: processQueue[i].pid,
                    start: currentTime,
                    end: currentTime + executeTime
                });
                
                // Update time and remaining time
                currentTime += executeTime;
                processQueue[i].remainingTime -= executeTime;
                
                // If process is completed
                if (processQueue[i].remainingTime === 0) {
                    completed++;
                    
                    // Calculate metrics
                    const turnaroundTime = currentTime - processQueue[i].arrivalTime;
                    const waitingTime = turnaroundTime - processQueue[i].burstTime;
                    
                    // Calculate energy based on power profile
                    let energyConsumption;
                    switch (processQueue[i].powerProfile) {
                        case 'low':
                            energyConsumption = processQueue[i].burstTime * 1.0;
                            break;
                        case 'medium':
                            energyConsumption = processQueue[i].burstTime * 1.5;
                            break;
                        case 'high':
                            energyConsumption = processQueue[i].burstTime * 2.5;
                            break;
                        default:
                            energyConsumption = processQueue[i].burstTime * 1.5;
                    }
                    
                    // Add to results
                    results.push({
                        pid: processQueue[i].pid,
                        waitingTime: waitingTime,
                        turnaroundTime: turnaroundTime,
                        responseTime: 0, // Simplified, should calculate first execution time
                        energyConsumption: energyConsumption.toFixed(2)
                    });
                }
                
                break; // Move to next time slot
            }
        }
        
        // If no process was found, move time forward
        if (!foundProcess) {
            currentTime++;
        }
    }
    
    // Update results table and statistics
    updateResultsTable();
    updateStatistics();
    updateEnergyAnalysis();
    updateComparison();
    
    // Store Gantt chart data for later use
    window.ganttChartData = ganttChart;
}

function updateResultsTable() {
    const tbody = document.querySelector('#resultTable tbody');
    tbody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.pid}</td>
            <td>${result.waitingTime}</td>
            <td>${result.turnaroundTime}</td>
            <td>${result.responseTime}</td>
            <td>${result.energyConsumption}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateStatistics() {
    // Calculate average waiting time
    const avgWaitingTime = results.reduce((sum, result) => sum + result.waitingTime, 0) / results.length;
    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
    
    // Calculate average turnaround time
    const avgTurnaroundTime = results.reduce((sum, result) => sum + result.turnaroundTime, 0) / results.length;
    document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
    
    // Calculate throughput (processes per unit time)
    const maxCompletionTime = Math.max(...results.map(result => result.turnaroundTime + processes.find(p => p.pid === result.pid).arrivalTime));
    const throughput = processes.length / maxCompletionTime;
    document.getElementById('throughput').textContent = throughput.toFixed(2);
    
    // Calculate energy efficiency
    const totalEnergy = results.reduce((sum, result) => sum + parseFloat(result.energyConsumption), 0);
    const energyEfficiency = processes.length / totalEnergy;
    document.getElementById('energyEfficiency').textContent = energyEfficiency.toFixed(2);
}

function updateEnergyAnalysis() {
    // Simple energy summary for now
    const energyMode = document.getElementById('energyMode').value;
    const totalEnergy = results.reduce((sum, result) => sum + parseFloat(result.energyConsumption), 0);
    
    let summary = `Total energy consumption: ${totalEnergy.toFixed(2)} units. `;
    
    switch (energyMode) {
        case 'aggressive':
            summary += 'Aggressive energy saving mode prioritized power efficiency over performance.';
            break;
        case 'balanced':
            summary += 'Balanced mode maintained equilibrium between performance and energy consumption.';
            break;
        case 'performance':
            summary += 'Performance-first mode optimized for speed with reasonable power constraints.';
            break;
    }
    
    document.getElementById('energySummary').textContent = summary;
    
    // Energy chart would go here with a charting library
    document.getElementById('energyChart').innerHTML = 'Energy consumption chart would be displayed here.';
}

function updateComparison() {
    // Simplified comparison calculations
    const energyMode = document.getElementById('energyMode').value;
    let energySavings, perfImpact;
    
    switch (energyMode) {
        case 'aggressive':
            energySavings = '20-30%';
            perfImpact = '-5 to -10%';
            break;
        case 'balanced':
            energySavings = '10-15%';
            perfImpact = '-2 to -5%';
            break;
        case 'performance':
            energySavings = '5-10%';
            perfImpact = '0 to -2%';
            break;
        default:
            energySavings = '10-15%';
            perfImpact = '-2 to -5%';
    }
    
    document.getElementById('energySavings').textContent = energySavings;
    document.getElementById('perfImpact').textContent = perfImpact;
    
    // Core utilization
    const cpuCores = parseInt(document.getElementById('cpuCores').value);
    const activeCores = Math.min(cpuCores, processes.length);
    document.getElementById('activeCores').textContent = `${activeCores}/${cpuCores}`;
    
    const pgTime = ((cpuCores - activeCores) / cpuCores * 100).toFixed(0);
    document.getElementById('pgTime').textContent = `${pgTime}%`;
}

function showGanttChart() {
    if (!window.ganttChartData || window.ganttChartData.length === 0) {
        alert('Please run the scheduler first to generate the Gantt chart.');
        return;
    }
    
    // Simple text-based Gantt chart
    let ganttHTML = '<div style="position: relative; height: 300px; overflow-x: auto;">';
    
    // Get unique process IDs
    const processes = [...new Set(window.ganttChartData.map(item => item.pid))];
    
    // Calculate scale
    const lastEndTime = Math.max(...window.ganttChartData.map(item => item.end));
    const timeUnit = Math.max(500 / lastEndTime, 20); // At least 20px per time unit
    
    // Create rows for each process
    processes.forEach((pid, index) => {
        const yPos = 50 + index * 40;
        
        // Add process label
        ganttHTML += `<div style="position: absolute; left: 0; top: ${yPos}px;">${pid}</div>`;
        
        // Add execution blocks
        window.ganttChartData.filter(item => item.pid === pid).forEach(block => {
            const width = (block.end - block.start) * timeUnit;
            const left = block.start * timeUnit + 50; // 50px offset for labels
            
            ganttHTML += `
                <div style="position: absolute; left: ${left}px; top: ${yPos - 15}px; width: ${width}px; height: 30px; background-color: var(--primary-color); 
                     color: white; text-align: center; line-height: 30px; border-radius: 3px;">
                    ${block.end - block.start}
                </div>
            `;
        });
    });
    
    // Add time axis
    ganttHTML += '<div style="position: absolute; top: 10px; left: 50px; right: 0;">';
    for (let t = 0; t <= lastEndTime; t += 5) {
        ganttHTML += `<div style="position: absolute; left: ${t * timeUnit}px;">${t}</div>`;
    }
    ganttHTML += '</div>';
    
    ganttHTML += '</div>';
    
    document.getElementById('ganttChart').innerHTML = ganttHTML;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set first tab as active by default
    showTab('results');
});
