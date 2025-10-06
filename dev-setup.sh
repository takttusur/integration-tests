#!/bin/bash

# Quick development setup script
# This script starts all services for development

set -e

echo "🔧 Starting Development Environment..."

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start services
echo "🐳 Starting Docker services..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

# Show service status
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🌐 Services are available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Backend Health: http://localhost:3001/health"
echo "   - Database: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose logs -f"
echo "   - Stop services: docker compose down"
echo "   - Run tests: npm test"
echo "   - Run tests (headed): npm run test:headed"