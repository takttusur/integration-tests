#!/bin/bash

# Simple development setup without building custom images
# This starts just the database and redis, allowing backend and frontend to run locally

set -e

echo "🔧 Starting Development Environment (Local Mode)..."

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start only infrastructure services
echo "🐳 Starting infrastructure services (DB + Redis)..."
docker compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Show service status
echo "📊 Service Status:"
docker compose -f docker-compose.dev.yml ps

echo ""
echo "🌐 Infrastructure services are ready:"
echo "   - Database: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "🚀 To start the application services locally:"
echo "   1. Backend: cd services/backend && npm install && npm start"
echo "   2. Frontend: cd services/frontend && npm install && npm start"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose -f docker-compose.dev.yml logs -f"
echo "   - Stop services: docker compose -f docker-compose.dev.yml down"
echo "   - Run tests: npm test"