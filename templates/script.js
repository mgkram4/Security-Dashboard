
const REFRESH_INTERVAL = 30000;

async function updateThreats() {
    try {
        const response = await fetch('/monitor', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        const threatsContainer = document.querySelector('.threats-container');
        
        // Update threats display
        if (data.threats && data.threats.length > 0) {
            threatsContainer.innerHTML = data.threats.map(threat => `
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
        }
    } catch (error) {
        console.error('Error fetching threats:', error);
    }
}


async function generateTestEvent(type) {
    try {
        const response = await fetch(`/test/generate-event?type=${type}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Refresh the dashboard after generating event
        updateThreats();
    } catch (error) {
        console.error('Error generating test event:', error);
    }
}

function addTestControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'test-controls';
    controlsContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2>Test Controls</h2>
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

document.addEventListener('DOMContentLoaded', () => {
    // Add test controls if in development environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addTestControls();
    }
    
    updateThreats();
    setInterval(updateThreats, REFRESH_INTERVAL);
});