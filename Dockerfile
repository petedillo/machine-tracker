# Use Node.js Alpine as the base image
FROM node:20-alpine

# Create app directory and set ownership
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Start the application
CMD ["node", "server.js"]