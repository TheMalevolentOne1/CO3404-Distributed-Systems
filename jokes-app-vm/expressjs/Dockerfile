
FROM node:18-alpine

# Set the directory inside the container
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

COPY . .

# Port app runs on
EXPOSE 3000

# Start the application
CMD ["node", "backend.js"]