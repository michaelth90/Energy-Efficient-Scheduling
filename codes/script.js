let processes = [];

function addProcess() {
    let pid = document.getElementById("pid").value;
    let arrivalTime = parseInt(document.getElementById("arrivalTime").value);
    let burstTime = parseInt(document.getElementById("burstTime").value);

    if (!pid || isNaN(arrivalTime) || isNaN(burstTime)) {
        alert("Please enter valid process details.");
        return;
    }

    processes.push({ pid, arrivalTime, burstTime, remainingTime: burstTime, waitingTime: 0, turnaroundTime: 0 });
    
    let table = document.getElementById("processTable");
    let row = table.insertRow();
    row.insertCell(0).innerText = pid;
    row.insertCell(1).innerText = arrivalTime;
    row.insertCell(2).innerText = burstTime;

    document.getElementById("pid").value = "";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("burstTime").value = "";
}

function calculateEARR() {
    let timeQuantum = 3; // Base quantum
    let time = 0;
    let queue = [...processes];

    let resultTable = document.getElementById("resultTable");
    resultTable.innerHTML = `<tr>
        <th>Process ID</th>
        <th>Waiting Time</th>
        <th>Turnaround Time</th>
        <th>Energy Consumption</th>
    </tr>`;

    while (queue.length > 0) {
        let process = queue.shift();
        
        // Adjust time quantum dynamically based on CPU load (simplified logic)
        let adjustedQuantum = Math.max(1, Math.min(timeQuantum, process.remainingTime));
        
        time += adjustedQuantum;
        process.remainingTime -= adjustedQuantum;

        if (process.remainingTime > 0) {
            queue.push(process); // Requeue the process if not finished
        } else {
            process.turnaroundTime = time - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.burstTime;

            // Estimate energy consumption (simplified)
            let energyConsumed = process.burstTime * 0.5; 

            let row = resultTable.insertRow();
            row.insertCell(0).innerText = process.pid;
            row.insertCell(1).innerText = process.waitingTime;
            row.insertCell(2).innerText = process.turnaroundTime;
            row.insertCell(3).innerText = energyConsumed.toFixed(2) + " Joules";
        }
    }
}
