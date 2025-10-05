FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Simple health check without curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { hostname: 'localhost', port: 3001, path: '/health', method: 'GET' }; \
  const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start the application
CMD ["npm", "start"]