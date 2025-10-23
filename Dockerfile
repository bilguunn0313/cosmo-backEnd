# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install dependencies for native builds
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy build artifacts and node_modules
COPY --from=build /app ./

# Expose port
EXPOSE 3000

# Set environment variables (can override with docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "dist/index.js"]
