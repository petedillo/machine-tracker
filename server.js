require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const app = express();
const port = process.env.PORT || 3000;

// ✅ Enable CORS for all origins
app.use(cors());

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
    // Import routes
    const apiRoutes = require('./router/api')(versions, fs);
    const viewRoutes = require('./router/views')();

    // Use routes
    app.use('/api', apiRoutes);
    app.use('/', viewRoutes);

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to initialize application:', error);
});