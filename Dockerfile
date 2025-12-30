# Dockerfile for QuickS3
# Use a small Node LTS base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Only copy package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy rest of the app
COPY . .

# Expose port (can be overridden with -e PORT)
EXPOSE 3000

# Use production environment by default
ENV NODE_ENV=production

# Healthcheck (simple)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the app
CMD ["node", "server.js"]