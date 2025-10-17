# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json first to leverage Docker's caching
COPY package*.json ./

# Install dependencies (production-only)
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose the port your application runs on (optional, for documentation purposes)
EXPOSE 4000

# Start the application
CMD ["node", "src/index.js"]
