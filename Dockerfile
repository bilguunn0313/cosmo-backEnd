# Use Node.js 20 LTS
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript)
RUN npm install

# Copy source code
COPY . .

# Copy env file explicitly
# COPY .env .env

# Build TypeScript to JavaScript
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# Start the app
# This will use whatever is in your package.json "start" script
CMD ["npm", "start"]