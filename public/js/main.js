import { MachineUtils } from './machineUtils.js';

// Load all versions
async function loadVersions() {
    const response = await fetch('/versions');
    const versions = await response.json();
    const select = document.getElementById('versionSelect');
    select.innerHTML = versions.map(v => 
        `<option value="${v.version}">Version ${v.version} - ${new Date(v.timestamp).toLocaleString()}</option>`
    ).join('');
    await loadVersion();
}

// Load specific version
async function loadVersion() {
    const version = document.getElementById('versionSelect').value;
    const response = await fetch(`/machines/${version}`);
    const data = await response.json();
    MachineUtils.displayMachines(data.machines);
}

// Modal functionality
const modal = document.getElementById('addMachineModal');
const btn = document.getElementById('openModalBtn');
const span = document.getElementsByClassName('close')[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
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

    modal.style.display = "none";
    await loadVersions();
    e.target.reset();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadVersions();
});

// Make functions globally available
window.App = {
    loadVersions,
    loadVersion
};