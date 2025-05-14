
## Description

Machine Tracker is a Node.js-based web application that helps manage and track machine information. The application uses Express.js as the backend framework and provides a user interface for managing machine data.

## Technical Stack

- **Backend**: Node.js with Express.js (v4.18.2)
- **Development Tools**: nodemon (v3.1.10)
- **Frontend**: HTML, CSS, JavaScript
- **Data Storage**: JSON file-based storage (machines.json)

## Getting Started

1. **Installation**
   ```bash
   npm install
   ```

2. **Running the Application**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000` (or the configured port)

## Project Components

- `server.js`: Main application server file
- `machines.json`: Data storage file for machine information
- `public/`: Frontend assets directory
  - `index.html`: Main application page
  - `css/styles.css`: Application styling
  - `js/machineUtils.js`: Utility functions for machine management
  - `js/main.js`: Main frontend JavaScript logic

## Development

To run the application in development mode with automatic restarting:
```bash
npm run dev
```