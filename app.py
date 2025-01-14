import random
from datetime import datetime

from flask import Flask, jsonify, render_template

app = Flask(__name__)

class SystemStatus:
    def __init__(self):
        self.firewall_status = "Active"
        self.ids_status = "Active"
        self.last_scan = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.vulnerabilities = random.randint(0, 10)
        self.patch_status = "Up to date"

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

def generate_mock_data():
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
    return system_status, threats, incidents

@app.route('/')
def index():
    system_status, threats, incidents = generate_mock_data()
    return render_template('index.html', system_status=system_status, threats=threats, incidents=incidents)

@app.route('/monitor', methods=['GET'])
def monitor():
    system_status, threats, incidents = generate_mock_data()
    return jsonify({
        'system_status': system_status.__dict__,
        'threats': [t.__dict__ for t in threats],
        'incidents': [i.__dict__ for i in incidents]
    })

if __name__ == '__main__':
    app.run(debug=True)