const REFRESH_INTERVAL = 30000;

async function updateDashboard() {
    try {
        const response = await fetch('/monitor', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // Update system status
        updateSystemStatus(data.system_status);
        // Update threats
        updateThreats(data.threats);
        // Update incidents
        updateIncidents(data.incidents);
        
        // Add pulse animation to show real-time updates
        addUpdatePulse();
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateSystemStatus(status) {
    // Update defense status with visual feedback
    const firewallStatus = document.querySelector('.status-item .status-active');
    firewallStatus.textContent = status.firewall_status;
    firewallStatus.className = 'status-active ' + 
        (status.firewall_status === 'Under Attack' ? 'status-danger' : 
         status.firewall_status === 'Active (Blocking)' ? 'status-warning' : '');

    const idsStatus = document.querySelector('.status-item:nth-child(2) .status-active');
    idsStatus.textContent = status.ids_status;
    idsStatus.className = 'status-active ' + 
        (status.ids_status === 'Analyzing' ? 'status-warning' : '');

    // Update scan time
    document.querySelector('.status-item:nth-child(3) span:last-child').textContent = status.last_scan;
    
    // Update progress bars with color-coded thresholds
    updateProgressBar('cpu', status.cpu_usage);
    updateProgressBar('memory', status.memory_usage);
    updateProgressBar('network', status.network_load);
    
    // Update metrics with formatted numbers
    document.getElementById('blockedIPs').textContent = status.blocked_ips.toLocaleString();
    document.getElementById('totalAttacks').textContent = status.total_attacks.toLocaleString();
    document.getElementById('vulnerabilities').textContent = status.vulnerabilities;
    document.getElementById('patchStatus').textContent = status.patch_status;
    document.getElementById('lastUpdate').textContent = status.last_update;

    // Add visual feedback for high-stress conditions
    const metricsCard = document.querySelector('.metrics-grid').closest('.card');
    if (status.cpu_usage > 80 || status.memory_usage > 80 || status.network_load > 80) {
        metricsCard.classList.add('stress');
    } else {
        metricsCard.classList.remove('stress');
    }
}

function updateProgressBar(id, value) {
    const bar = document.getElementById(`${id}Bar`);
    const text = document.getElementById(`${id}Text`);
    
    bar.style.width = `${value}%`;
    text.textContent = `${value}%`;
    
    // Update color based on value
    bar.className = 'progress-fill ' + 
        (value > 90 ? 'danger' : 
         value > 70 ? 'warning' : '');
}

function addUpdatePulse() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('pulse');
        setTimeout(() => card.classList.remove('pulse'), 1000);
    });
}

async function resetThreats() {
    try {
        const response = await fetch('/test/reset', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        await updateDashboard();
        
        // Show feedback
        const button = document.querySelector('.reset-button');
        button.textContent = 'Cleared!';
        button.classList.add('success');
        
        setTimeout(() => {
            button.textContent = 'Reset Threats';
            button.classList.remove('success');
        }, 2000);
        
    } catch (error) {
        console.error('Error resetting threats:', error);
    }
}

function addTestControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'test-controls';
    controlsContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Test Controls</h2>
                <button onclick="resetThreats()" class="reset-button">
                    Reset Threats
                </button>
            </div>
            <div class="card-content">
                <button onclick="generateTestEvent('brute_force')" class="test-button">
                    Simulate Brute Force
                </button>
                <button onclick="generateTestEvent('sql_injection')" class="test-button">
                    Simulate SQL Injection
                </button>
                <button onclick="generateTestEvent('port_scan')" class="test-button">
                    Simulate Port Scan
                </button>
            </div>
        </div>
    `;
    
    document.querySelector('.container').appendChild(controlsContainer);
}

async function generateTestEvent(type) {
    try {
        const response = await fetch(`/test/generate-event?type=${type}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        // Immediately refresh the dashboard
        await updateDashboard();
        
        // Show feedback to user
        const button = document.querySelector(`button[onclick="generateTestEvent('${type}')"]`);
        const originalText = button.textContent;
        button.textContent = 'Generated!';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error generating test event:', error);
    }
}

function updateThreats(threats) {
    if (!Array.isArray(threats)) return;
    
    const threatsHTML = threats.map(threat => `
        <div class="alert alert-${threat.severity.toLowerCase()}">
            <div class="alert-header">
                <span>${threat.type}</span>
                <span class="badge badge-${threat.severity.toLowerCase()}">${threat.severity}</span>
            </div>
            <div class="alert-content">
                Source IP: ${threat.source_ip}
                ${threat.details ? `<br>Details: ${threat.details}` : ''}
            </div>
        </div>
    `).join('');
    
    // Find the threats card content and update it
    const threatCards = document.querySelectorAll('.card');
    const threatCard = Array.from(threatCards).find(card => 
        card.querySelector('.card-header h2').textContent === 'Active Threats'
    );
    
    if (threatCard) {
        const content = threatCard.querySelector('.card-content');
        content.innerHTML = threatsHTML;
    }
}

function updateIncidents(incidents) {
    if (!Array.isArray(incidents)) return;
    
    const incidentsHTML = incidents.map(incident => `
        <tr>
            <td>${incident.id}</td>
            <td>${incident.type}</td>
            <td>
                <span class="badge badge-${incident.severity.toLowerCase()}">
                    ${incident.severity}
                </span>
            </td>
            <td>${incident.status}</td>
            <td>${incident.created}</td>
        </tr>
    `).join('');
    
    const incidentsTable = document.querySelector('.incidents-table tbody');
    if (incidentsTable) {
        incidentsTable.innerHTML = incidentsHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addTestControls();
    }
    
    updateDashboard();
    setInterval(updateDashboard, REFRESH_INTERVAL);
});