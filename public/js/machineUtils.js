/**
 * Utility class for managing machines in the system.
 */
export class MachineUtils {
    /**
     * Retrieves a specific machine by its version and hostname.
     * @param {string|number} version - The version of the machine configuration to retrieve
     * @param {string} hostname - The hostname of the machine to retrieve
     * @returns {Promise<Object>} The machine object if found
     */
    static async getMachine(version, hostname) {
        const response = await fetch(`/machines/${version}`);
        const data = await response.json();
        return data.machines[hostname];
    }

    /**
     * Displays all machines in the DOM.
     * @param {Object} machines - Object containing all machines, keyed by hostname
     */
    static displayMachines(machines) {
        const container = document.getElementById('machinesList');
        container.innerHTML = Object.entries(machines).map(([name, machine]) => 
            this.createMachineCard(name, machine)
        ).join('');
    }

    /**
     * Creates an HTML card representation of a machine.
     * @param {string} name - The hostname of the machine
     * @param {Object} machine - The machine object containing all machine details
     * @returns {string} HTML string representing the machine card
     */
    static createMachineCard(name, machine) {
        return `
            <div class="machine-card">
                <h3>${name}</h3>
                ${this.createBasicInfo(machine)}
                ${this.createServicesSection(machine.services)}
                ${this.createNetworkSection(machine.network)}
                <div class="machine-actions">
                    <button onclick="MachineUtils.editMachine('${name}')">Edit</button>
                    <button class="delete-btn" onclick="MachineUtils.deleteMachine('${name}')">Delete</button>
                </div>
            </div>
        `;
    }

    /**
     * Creates the basic information section of a machine card.
     * @param {Object} machine - Machine object containing basic information
     * @returns {string} HTML string for basic information section
     */
    static createBasicInfo(machine) {
        return `
            <p>Hostname: ${machine.hostname}</p>
            <p>User: ${machine.user}</p>
            <p>Device: ${machine.device}</p>
            <p>OS: ${machine.os}</p>
            <p>Role: ${machine.role}</p>
        `;
    }

    /**
     * Creates the services section of a machine card.
     * @param {Object} services - Object containing service configurations
     * @returns {string} HTML string for services section
     */
    static createServicesSection(services) {
        const servicesList = Object.entries(services).map(([name, details]) => `
            <div class="service-item">
                <strong>${name}:</strong> 
                ${Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(', ')}
            </div>
        `).join('');

        return `
            <h4>Services:</h4>
            <div class="services-list">
                ${servicesList || '<p>No services configured</p>'}
            </div>
        `;
    }

    /**
     * Creates the network section of a machine card.
     * @param {Object} network - Network configuration object
     * @returns {string} HTML string for network section
     */
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

    /**
     * Creates a list of network items.
     * @param {string} title - Title for the network list section
     * @param {string[]} items - Array of network items
     * @returns {string} HTML string for network list
     */
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

    /**
     * Initiates the machine editing process.
     * @param {string} hostname - Hostname of the machine to edit
     * @returns {Promise<void>}
     */
    static async editMachine(hostname) {
        const version = document.getElementById('versionSelect').value;
        const machine = await this.getMachine(version, hostname);
        
        if (!document.getElementById('editMachineModal')) {
            this.createEditModal();
        }

        this.populateEditForm(hostname, machine);
        document.getElementById('editMachineModal').style.display = 'block';
    }

    /**
     * Creates the edit modal in the DOM if it doesn't exist.
     * @private
     */
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

    /**
     * Populates the edit form with machine data.
     * @param {string} hostname - Original hostname of the machine
     * @param {Object} machine - Machine object containing all details
     * @private
     */
    static populateEditForm(hostname, machine) {
        document.getElementById('edit-original-hostname').value = hostname;
        document.getElementById('edit-hostname').value = machine.hostname;
        document.getElementById('edit-user').value = machine.user;
        document.getElementById('edit-device').value = machine.device;
        document.getElementById('edit-os').value = machine.os;
        document.getElementById('edit-role').value = machine.role;
        document.getElementById('edit-registry-accessible').checked = machine.network.registry_accessible;
        document.getElementById('edit-can-ssh-into').value = (machine.network.can_ssh_into || []).join(', ');
        document.getElementById('edit-accessible-by').value = (machine.network.accessible_by || []).join(', ');
    }

    /**
     * Initializes the edit form submit handler.
     * @private
     */
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

    /**
     * Deletes a machine after confirmation.
     * @param {string} hostname - Hostname of the machine to delete
     * @returns {Promise<void>}
     */
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

// Add to window object for onclick handlers
window.MachineUtils = MachineUtils;