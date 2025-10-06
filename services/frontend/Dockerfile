FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Simple health check without curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { hostname: 'localhost', port: 3000, path: '/', method: 'GET' }; \
  const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
  req.on('error', () => process.exit(1)); \
  req.end();"

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]