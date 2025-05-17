const express = require('express');
const router = express.Router();
const path = require('path');

module.exports = function() {
    // Serve the main page
    router.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    return router;
};