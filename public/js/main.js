// Load all versions
async function loadVersions() {
    const response = await fetch('/versions');
    const versions = await response.json();
    const select = document.getElementById('versionSelect');
    select.innerHTML = versions.map(v => 
        `<option value="${v.version}">Version ${v.version} - ${new Date(v.timestamp).toLocaleString()}</option>`
    ).join('');
    loadVersion();
}

// Load specific version
async function loadVersion() {
    const version = document.getElementById('versionSelect').value;
    const response = await fetch(`/machines/${version}`);
    const data = await response.json();
    displayMachines(data.machines);
}

// Display machines
function displayMachines(machines) {
    const container = document.getElementById('machinesList');
    container.innerHTML = Object.entries(machines).map(([name, machine]) => `
        <div class="machine-card">
            <h3>${name}</h3>
            <p>Hostname: ${machine.hostname}</p>
            <p>User: ${machine.user}</p>
            <p>Device: ${machine.device}</p>
            <p>OS: ${machine.os}</p>
            <p>Role: ${machine.role}</p>
            <h4>Services:</h4>
            <pre>${JSON.stringify(machine.services, null, 2)}</pre>
            <h4>Network:</h4>
            <pre>${JSON.stringify(machine.network, null, 2)}</pre>
            <button onclick="editMachine('${name}')">Edit</button>
        </div>
    `).join('');
}

// Add new machine
document.getElementById('addMachineForm').onsubmit = async (e) => {
    e.preventDefault();
    const machine = {
        hostname: document.getElementById('hostname').value,
        user: document.getElementById('user').value,
        device: document.getElementById('device').value,
        os: document.getElementById('os').value,
        role: document.getElementById('role').value,
        services: {},
        network: {
            accessible_by: [],
            can_ssh_into: [],
            registry_accessible: false
        }
    };

    await fetch('/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(machine)
    });

    loadVersions();
    e.target.reset();
};

// Edit machine functionality (placeholder for now)
function editMachine(name) {
    console.log(`Editing machine: ${name}`);
    // TODO: Implement edit functionality
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadVersions();
});