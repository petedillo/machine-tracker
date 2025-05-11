/**
 * Utility class for managing machines in the system.
 */
export class MachineUtils {
    static async getMachine(version, hostname) {
        const response = await fetch(`/machines/${version}`);
        const data = await response.json();
        return data.machines[hostname];
    }

    static displayMachines(machines) {
        const container = document.getElementById('machinesList');
        container.innerHTML = Object.entries(machines).map(([name, machine]) =>
            this.createMachineCard(name, machine)
        ).join('');
    }

    static createMachineCard(name, machine) {
        return `
        <div class="machine-card">
            <h3>${name}</h3>
            ${this.createBasicInfo(machine)}
            ${this.createServicesSection(machine.services, machine.ip)}
            ${this.createNetworkSection(machine.network)}
            <div class="machine-actions">
                <button onclick="MachineUtils.editMachine('${name}')">Edit</button>
                <button class="delete-btn" onclick="MachineUtils.deleteMachine('${name}')">Delete</button>
            </div>
        </div>
    `;
    }

    static createBasicInfo(machine) {
        return `
            <p>Hostname: ${machine.hostname}</p>
            <p>User: ${machine.user}</p>
            <p>Device: ${machine.device}</p>
            <p>OS: ${machine.os}</p>
            <p>Role: ${machine.role}</p>
            <p>IP: ${machine.ip}</p>
            <p>Tags: ${machine.tags?.join(', ') || 'None'}</p>
        `;
    }

    static createServicesSection(services, ip) {
        const servicesList = Object.entries(services).map(([name, details]) => {
            const hasPort = 'port' in details;
            const serviceUrl = hasPort ? `http://${ip}:${details.port}` : null;

            if (hasPort) {
                return `
                <div class="service-item">
                    <a href="${serviceUrl}" target="_blank" class="service-tag ${details.type || 'default'}">
                        ${name} <span class="service-port">:${details.port}</span>
                    </a>
                </div>`;
            } else {
                const popupContent = Object.entries(details)
                    .filter(([key]) => key !== 'type')
                    .map(([key, value]) => `
                    <div class="service-popup-pair">
                        <span class="service-popup-key">${key}:</span>
                        <span class="service-popup-value">${value}</span>
                    </div>
                `).join('');

                return `
                <div class="service-item">
                    <span class="service-tag ${details.type || 'default'}">${name}</span>
                    <div class="service-popup">
                        <div class="service-popup-content">
                            ${popupContent}
                        </div>
                    </div>
                </div>`;
            }
        }).join('');

        return `
        <h4>Services:</h4>
        <div class="services-list">
            ${servicesList || '<p>No services configured</p>'}
        </div>
    `;
}

    static createNetworkSection(network) {
        return `
            <h4>Network:</h4>
            <div class="network-info">
                ${this.createNetworkList('Can SSH into', network.can_ssh_into)}
                ${this.createNetworkList('Accessible by', network.accessible_by)}
                <p>Registry Accessible: ${network.registry_accessible ? 'Yes' : 'No'}</p>
            </div>
        `;
    }

    static createNetworkList(title, items) {
        if (!items || items.length === 0) return '';
        return `
            <div class="network-list">
                <strong>${title}:</strong>
                <ul>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    static async editMachine(hostname) {
        const version = document.getElementById('versionSelect').value;
        const machine = await this.getMachine(version, hostname);

        if (!document.getElementById('editMachineModal')) {
            this.createEditModal();
        }

        this.populateEditForm(hostname, machine);
        document.getElementById('editMachineModal').style.display = 'block';
    }

    static createEditModal() {
        const modalHtml = `
            <div id="editMachineModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="document.getElementById('editMachineModal').style.display='none'">&times;</span>
                    <h2>Edit Machine</h2>
                    <form id="editMachineForm">
                        <input type="hidden" id="edit-original-hostname">
                        <div class="form-group">
                            <label>Hostname:</label>
                            <input type="text" id="edit-hostname" required>
                        </div>
                        <div class="form-group">
                            <label>User:</label>
                            <input type="text" id="edit-user" required>
                        </div>
                        <div class="form-group">
                            <label>Device:</label>
                            <input type="text" id="edit-device" required>
                        </div>
                        <div class="form-group">
                            <label>OS:</label>
                            <input type="text" id="edit-os" required>
                        </div>
                        <div class="form-group">
                            <label>Role:</label>
                            <input type="text" id="edit-role" required>
                        </div>
                        <div class="form-group">
                            <label>IP:</label>
                            <input type="text" id="edit-ip" required>
                        </div>
                        <div class="form-group">
                            <label>Tags (comma-separated):</label>
                            <input type="text" id="edit-tags">
                        </div>
                        <div class="form-group">
                            <label>Registry Accessible:</label>
                            <input type="checkbox" id="edit-registry-accessible">
                        </div>
                        <div class="form-group">
                            <label>Can SSH Into (comma-separated):</label>
                            <input type="text" id="edit-can-ssh-into">
                        </div>
                        <div class="form-group">
                            <label>Accessible By (comma-separated):</label>
                            <input type="text" id="edit-accessible-by">
                        </div>
                        <button type="submit">Update Machine</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.initializeEditFormHandler();
    }

    static populateEditForm(hostname, machine) {
        document.getElementById('edit-original-hostname').value = hostname;
        document.getElementById('edit-hostname').value = machine.hostname;
        document.getElementById('edit-user').value = machine.user;
        document.getElementById('edit-device').value = machine.device;
        document.getElementById('edit-os').value = machine.os;
        document.getElementById('edit-role').value = machine.role;
        document.getElementById('edit-ip').value = machine.ip;
        document.getElementById('edit-tags').value = (machine.tags || []).join(', ');
        document.getElementById('edit-registry-accessible').checked = machine.network.registry_accessible;
        document.getElementById('edit-can-ssh-into').value = (machine.network.can_ssh_into || []).join(', ');
        document.getElementById('edit-accessible-by').value = (machine.network.accessible_by || []).join(', ');
    }

    static initializeEditFormHandler() {
        document.getElementById('editMachineForm').onsubmit = async (e) => {
            e.preventDefault();
            const originalHostname = document.getElementById('edit-original-hostname').value;

            const updatedMachine = {
                hostname: document.getElementById('edit-hostname').value,
                user: document.getElementById('edit-user').value,
                device: document.getElementById('edit-device').value,
                os: document.getElementById('edit-os').value,
                role: document.getElementById('edit-role').value,
                ip: document.getElementById('edit-ip').value,
                tags: document.getElementById('edit-tags').value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0),
                services: {}, // Maintained from original
                network: {
                    registry_accessible: document.getElementById('edit-registry-accessible').checked,
                    can_ssh_into: document.getElementById('edit-can-ssh-into').value
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item.length > 0),
                    accessible_by: document.getElementById('edit-accessible-by').value
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item.length > 0)
                }
            };

            try {
                const response = await fetch(`/machines/${originalHostname}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedMachine)
                });

                if (!response.ok) {
                    throw new Error('Failed to update machine');
                }

                document.getElementById('editMachineModal').style.display = 'none';
                window.loadVersions();
            } catch (error) {
                console.error('Error updating machine:', error);
                alert('Failed to update machine');
            }
        };
    }

    static async deleteMachine(hostname) {
        if (!confirm(`Are you sure you want to delete ${hostname}?`)) {
            return;
        }

        try {
            const response = await fetch(`/machines/${hostname}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete machine');
            }

            window.loadVersions();
        } catch (error) {
            console.error('Error deleting machine:', error);
            alert('Failed to delete machine');
        }
    }
}

window.MachineUtils = MachineUtils;