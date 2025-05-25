const express = require('express');
const router = express.Router();

module.exports = function (versions, fs) {
    // Get machines
    router.get('/', (req, res) => {
        const currentVersion = versions[versions.length - 1];
        res.json({
            currentVersion
        });
    });
    // Get all versions
    router.get('/versions', (req, res) => {
        res.json(versions);
    });

    // Get current version
    router.get('/version/current', (req, res) => {
        const currentVersion = versions[versions.length - 1];
        res.json({
            version: currentVersion.version,
            timestamp: currentVersion.timestamp
        });
    });

    // Get specific version
    router.get('/machines/:version', (req, res) => {
        const version = parseInt(req.params.version);
        const versionData = versions.find(v => v.version === version);
        if (versionData) {
            res.json(versionData.data);
        } else {
            res.status(404).json({error: 'Version not found'});
        }
    });

    // Add new machine
    router.post('/machines', async (req, res) => {
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

            res.json({success: true});
        } catch (error) {
            res.status(500).json({error: 'Failed to add machine'});
        }
    });

    // Update existing machine
    router.put('/machines/:hostname', async (req, res) => {
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

                res.json({success: true});
            } else {
                res.status(404).json({error: 'Machine not found'});
            }
        } catch (error) {
            res.status(500).json({error: 'Failed to update machine'});
        }
    });

    // Dashy config endpoint
    router.get('/dashy-config', (req, res) => {
        const currentVersion = versions[versions.length - 1];

        const services = [];

        const machines = currentVersion.data.machines;
        for (const [hostname, machine] of Object.entries(machines)) {
            for (const [serviceName, service] of Object.entries(machine.services || {})) {
                // Fallback to port 80 if not defined
                const port = service.port || 80;
                const ip = machine.ip || 'localhost';

                services.push({
                    name: `${hostname} - ${serviceName}`,
                    url: `http://${ip}:${port}`,
                    description: service.description || '',
                    icon: 'mdi:server'
                });
            }
        }

        const dashyConfig = {
            appConfig: {
                title: 'Dio Dashboard',
                theme: 'dark',
            },
            sections: [
                {
                    name: 'Services',
                    items: services
                }
            ]
        };

        res.json(dashyConfig);
    });


    return router;
};