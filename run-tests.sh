#!/bin/bash

# Integration Tests Runner Script
# This script sets up the environment and runs the integration tests

set -e

echo "🚀 Starting Integration Tests Setup..."

# Load environment variables
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
fi

# Function to check if a service is healthy
check_service() {
    local service_name=$1
    local health_url=$2
    local max_attempts=30
    local attempt=1

    echo "🔍 Checking ${service_name} health..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s ${health_url} > /dev/null 2>&1; then
            echo "✅ ${service_name} is healthy"
            return 0
        fi
        
        echo "⏳ Waiting for ${service_name}... (attempt ${attempt}/${max_attempts})"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ ${service_name} failed to become healthy"
    return 1
}

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [ "$CLEANUP_ON_EXIT" = "true" ]; then
        docker compose down
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Parse command line arguments
RUN_TESTS=true
CLEANUP_ON_EXIT=true
HEADLESS=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cleanup)
            CLEANUP_ON_EXIT=false
            shift
            ;;
        --headed)
            HEADLESS=false
            shift
            ;;
        --setup-only)
            RUN_TESTS=false
            shift
            ;;
        *)
            echo "Unknown option $1"
            echo "Usage: $0 [--no-cleanup] [--headed] [--setup-only]"
            exit 1
            ;;
    esac
done

# Start Docker services
echo "🐳 Starting Docker services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
check_service "Database" "http://localhost:5432" || (echo "Database check skipped (PostgreSQL doesn't have HTTP endpoint)" && sleep 10)
check_service "Backend" "http://localhost:3001/health"
check_service "Frontend" "http://localhost:3000"

echo "✅ All services are ready!"

# Run tests if requested
if [ "$RUN_TESTS" = "true" ]; then
    echo "🧪 Running integration tests..."
    
    if [ "$HEADLESS" = "true" ]; then
        npm test
    else
        npm run test:headed
    fi
    
    echo "📊 Generating test reports..."
    npm run test:report
else
    echo "🔧 Setup complete. Services are running."
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend: http://localhost:3001"
    echo "   - Backend Health: http://localhost:3001/health"
    echo ""
    echo "To run tests manually: npm test"
    echo "To stop services: docker-compose down"
fi

echo "🎉 Done!"