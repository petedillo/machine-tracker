const express = require('express');
const fs = require('fs').promises;
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Initialize data and versions
let originalData;
let versions;

// Function to initialize data
async function initializeData() {
    try {
        const data = await fs.readFile('machines.json', 'utf8');
        originalData = JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, create with empty machines object
        originalData = { machines: {} };
        await fs.writeFile('machines.json', JSON.stringify(originalData, null, 2));
    }
    
    versions = [{
        timestamp: new Date(),
        data: JSON.parse(JSON.stringify(originalData)),
        version: 1
    }];
}

// Initialize before starting server
initializeData().then(() => {
    // Get all versions
    app.get('/versions', (req, res) => {
        res.json(versions);
    });

    // Get specific version
    app.get('/machines/:version', (req, res) => {
        const version = parseInt(req.params.version);
        const versionData = versions.find(v => v.version === version);
        if (versionData) {
            res.json(versionData.data);
        } else {
            res.status(404).json({ error: 'Version not found' });
        }
    });

    // Add new machine
    app.post('/machines', async (req, res) => {
        try {
            const newMachine = req.body;
            const lastVersion = versions[versions.length - 1];
            const newData = JSON.parse(JSON.stringify(lastVersion.data));
            
            newData.machines[newMachine.hostname] = newMachine;
            
            versions.push({
                timestamp: new Date(),
                data: newData,
                version: lastVersion.version + 1
            });
            
            // Save the latest version to file
            await fs.writeFile('machines.json', JSON.stringify(newData, null, 2));
            
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add machine' });
        }
    });

    // Update existing machine
    app.put('/machines/:hostname', async (req, res) => {
        try {
            const hostname = req.params.hostname;
            const updatedMachine = req.body;
            const lastVersion = versions[versions.length - 1];
            const newData = JSON.parse(JSON.stringify(lastVersion.data));
            
            if (newData.machines[hostname]) {
                newData.machines[hostname] = updatedMachine;
                versions.push({
                    timestamp: new Date(),
                    data: newData,
                    version: lastVersion.version + 1
                });
                
                // Save the latest version to file
                await fs.writeFile('machines.json', JSON.stringify(newData, null, 2));
                
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Machine not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to update machine' });
        }
    });

    app.get('/machines', (req, res) => {
        const currentVersion = versions[versions.length - 1];
        res.json({
            version: currentVersion.version,
            currentVersion
        });
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize application:', error);
});