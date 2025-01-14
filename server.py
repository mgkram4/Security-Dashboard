import random
from datetime import datetime, timedelta

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

class SystemStatus:
    def __init__(self):
        self.firewall_status = "Active"
        self.ids_status = "Active"
        self.last_scan = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.vulnerabilities = 3  # Base number of vulnerabilities
        self.patch_status = "Up to date"
        self.cpu_usage = 30  # Base CPU usage
        self.memory_usage = 40  # Base memory usage
        self.network_load = 20  # Base network load
        self.blocked_ips = len(global_threats) * 2  # Each threat might have multiple IPs
        self.total_attacks = len(global_threats) * 10  # Each threat generates multiple attacks
        self.last_update = datetime.now().strftime("%H:%M:%S")

    def update_for_threat(self, threat_type):
        """Update system metrics based on threat type"""
        if threat_type == "Brute Force":
            self.cpu_usage = min(self.cpu_usage + 15, 100)  # CPU spike from auth attempts
            self.memory_usage = min(self.memory_usage + 5, 100)
            self.network_load = min(self.network_load + 10, 100)
            self.firewall_status = "Active (Blocking)"
            
        elif threat_type == "SQL Injection":
            self.cpu_usage = min(self.cpu_usage + 25, 100)  # Heavy DB load
            self.memory_usage = min(self.memory_usage + 20, 100)  # Memory pressure from DB
            self.network_load = min(self.network_load + 5, 100)
            self.ids_status = "Analyzing"
            
        elif threat_type == "Port Scan":
            self.cpu_usage = min(self.cpu_usage + 10, 100)
            self.memory_usage = min(self.memory_usage + 5, 100)
            self.network_load = min(self.network_load + 30, 100)  # High network activity
            self.firewall_status = "Under Attack"

class Threat:
    def __init__(self, type, severity, source_ip, details=None):
        self.type = type
        self.severity = severity
        self.source_ip = source_ip
        self.details = details
        
class Incident:
    def __init__(self, id, type, severity, status, created):
        self.id = id
        self.type = type
        self.severity = severity
        self.status = status
        self.created = created

@app.route('/')
def index():
    system_status = SystemStatus()
    threats = [
        Threat(type="Phishing", severity="High", source_ip="192.168.1.1", details="Suspicious email link"),
        Threat(type="Ransomware", severity="Medium", source_ip="192.168.1.2", details="Encrypted files"),
        Threat(type="DDoS", severity="Low", source_ip="192.168.1.3", details="Flood of traffic")
    ]
    incidents = [
        Incident(id=1, type="Phishing", severity="High", status="Active", created=datetime.now().strftime("%Y-%m-%d %H:%M")),
        Incident(id=2, type="Ransomware", severity="Medium", status="Active", created=datetime.now().strftime("%Y-%m-%d %H:%M")),
        Incident(id=3, type="DDoS", severity="Low", status="Active", created=datetime.now().strftime("%Y-%m-%d %H:%M"))
    ]
    return render_template('index.html', system_status=system_status, threats=threats, incidents=incidents)

@app.route('/monitor')
def monitor():
    system_status = SystemStatus()
    
    # Update system status based on active threats
    for threat in global_threats:
        system_status.update_for_threat(threat.type)
    
    # Generate incidents based on actual threats
    incidents = []
    for i, threat in enumerate(global_threats, 1):
        incidents.append(
            Incident(
                id=i,
                type=threat.type,
                severity=threat.severity,
                status="Active",
                created=(datetime.now() - timedelta(minutes=random.randint(0, 30))).strftime("%Y-%m-%d %H:%M")
            )
        )

    return jsonify({
        'system_status': vars(system_status),
        'threats': [vars(threat) for threat in global_threats],
        'incidents': [vars(incident) for incident in incidents]
    })

@app.route('/test/generate-event', methods=['POST'])
def generate_test_event():
    event_type = request.args.get('type', 'unknown')
    
    # Simulate different types of attacks
    if event_type == 'brute_force':
        new_threat = Threat(
            type="Brute Force", 
            severity="High", 
            source_ip="10.0.0." + str(random.randint(1, 255)),
            details="Multiple failed login attempts"
        )
    elif event_type == 'sql_injection':
        new_threat = Threat(
            type="SQL Injection",
            severity="Critical",
            source_ip="192.168." + str(random.randint(1, 255)) + "." + str(random.randint(1, 255)),
            details="Malicious SQL query detected"
        )
    elif event_type == 'port_scan':
        new_threat = Threat(
            type="Port Scan",
            severity="Medium",
            source_ip="172.16." + str(random.randint(1, 255)) + "." + str(random.randint(1, 255)),
            details="Sequential port scanning detected"
        )
    else:
        return jsonify({'error': 'Unknown event type'}), 400

    # Add to global threats list (you might want to use a proper database in production)
    global_threats.append(new_threat)
    return jsonify(vars(new_threat))

@app.route('/test/reset', methods=['POST'])
def reset_threats():
    global global_threats
    global_threats = []
    # Return a fresh system status
    system_status = SystemStatus()
    return jsonify({
        'status': 'success', 
        'message': 'All threats cleared',
        'system_status': vars(system_status)
    })

# Add this at the top of the file with other imports
global_threats = []

if __name__ == '__main__':
    app.run(debug=True)