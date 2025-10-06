# Integration Tests Project

A comprehensive integration testing project using Playwright framework with Docker Compose services. This project demonstrates how to test frontend and backend services working together, including database interactions.

## 🏗️ Architecture

The project consists of several services orchestrated with Docker Compose:

- **Frontend**: React application (Port 3000)
- **Backend**: Node.js/Express API (Port 3001)
- **Database**: PostgreSQL with sample data (Port 5432)
- **Redis**: Caching service (Port 6379)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or higher)
- npm

### 1. Clone and Setup

```bash
git clone https://github.com/takttusur/integration-tests.git
cd integration-tests
npm install
cp .env.example .env
```

### 2. Start Services and Run Tests

```bash
# Option 1: Run everything (setup + tests + cleanup)
./run-tests.sh

# Option 2: Just start services for development
./dev-setup.sh

# Option 3: Manual control
npm run services:up
npm test
npm run services:down
```

## 📋 Available Commands

### Service Management
```bash
npm run services:up      # Start all Docker services
npm run services:down    # Stop all Docker services
npm run services:logs    # View service logs
```

### Testing
```bash
npm test                 # Run tests in headless mode
npm run test:headed      # Run tests with browser UI
npm run test:debug       # Run tests in debug mode
npm run test:report      # Show HTML test report
npm run test:integration # Full integration test (services + tests)
npm run test:ci          # CI-friendly test run with JUnit output
```

### Development
```bash
./dev-setup.sh          # Quick development environment setup
./run-tests.sh --setup-only  # Start services without running tests
./run-tests.sh --headed      # Run tests with browser UI
./run-tests.sh --no-cleanup  # Don't stop services after tests
```

## 🧪 Test Structure

The tests are organized into several categories:

### API Tests (`tests/api.test.js`)
- Backend health checks
- API endpoint testing
- Database integration
- Error handling

### Frontend Tests (`tests/frontend.test.js`)
- UI component testing
- Form interactions
- Data display
- Responsive design

### End-to-End Tests (`tests/e2e.test.js`)
- Complete user journeys
- Cross-service integration
- Data consistency
- Performance checks

## 🌐 Service Endpoints

When services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

### API Endpoints

- `GET /health` - Service health check
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user
- `GET /api/posts` - List published posts
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts` - Create new post

## 🗄️ Database Schema

The PostgreSQL database includes:

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `full_name`
- `created_at`, `updated_at`

### Posts Table
- `id` (Primary Key)
- `title`
- `content`
- `author_id` (Foreign Key to users)
- `published` (Boolean)
- `created_at`, `updated_at`

### Sample Data
The database is automatically seeded with test users and posts for testing.

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
# Database
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testdb
POSTGRES_DB=testdb
POSTGRES_USER=testuser
POSTGRES_PASSWORD=testpass

# Services
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379

# Testing
TEST_TIMEOUT=30000
TEST_RETRY_COUNT=2
HEADLESS=true
```

### Playwright Configuration

The `playwright.config.js` file configures:
- Multiple browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshot and video capture on failure
- HTML and JUnit reporting

## 📊 Test Reports

After running tests, reports are available:

- **HTML Report**: `npx playwright show-report`
- **JUnit XML**: `test-results/junit.xml`
- **Screenshots**: `test-results/` (on failure)
- **Videos**: `test-results/` (on failure)

## 🐳 Docker Services

### Frontend Service
- **Base**: Node.js 18 Alpine
- **Build**: React production build
- **Serve**: Using `serve` package
- **Health Check**: HTTP GET to port 3000

### Backend Service
- **Base**: Node.js 18 Alpine
- **Dependencies**: Express, PostgreSQL client
- **Health Check**: HTTP GET to `/health`
- **Database**: Waits for PostgreSQL to be ready

### Database Service
- **Base**: PostgreSQL 15 Alpine
- **Initialization**: Runs `services/database/init.sql`
- **Health Check**: `pg_isready`
- **Persistence**: Named volume `postgres_data`

## 🔍 Troubleshooting

### Services won't start
```bash
# Check Docker status
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Reset everything
docker-compose down -v
docker-compose up -d
```

### Tests failing
```bash
# Run tests with debug info
npm run test:debug

# Check service health
curl http://localhost:3001/health
curl http://localhost:3000

# Run specific test file
npx playwright test tests/api.test.js
```

### Browser installation issues
```bash
# Install Playwright browsers manually
npx playwright install
npx playwright install-deps
```

## 🏃‍♂️ CI/CD Integration

For continuous integration, use:

```bash
npm run test:ci
```

This command:
1. Starts all services
2. Waits for health checks
3. Runs tests with JUnit output
4. Generates reports
5. Cleans up services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Open an issue on GitHub

---

**Happy Testing! 🎉**
