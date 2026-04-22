# Safe Driving Gamified Insurance App - Setup Guide

This guide will help you set up and run the MVP end-to-end locally.

## Prerequisites

- **Node.js**: v20.0.0 or higher
- **Docker**: For PostgreSQL and Redis (optional, can run local instances)
- **npm**: v10+

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Infrastructure (PostgreSQL + Redis)

```bash
docker-compose up -d
```

This starts:

- **PostgreSQL** on port 5432 (credentials: postgres/postgres)
- **Redis** on port 6379

### 3. Set up Environment Variables

Create a `.env` file in the root directory:

```bash
# Core Configuration
NODE_ENV=development
JWT_SECRET=your-secret-key-minimum-32-characters-long!!!
JWT_EXPIRY_SECONDS=86400

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/safe_driving?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Service Ports
USER_SERVICE_PORT=3000
TRIP_SERVICE_PORT=3001
SCORING_SERVICE_PORT=3002
DASHBOARD_SERVICE_PORT=3003
REWARDS_SERVICE_PORT=3004
PRICING_SERVICE_PORT=3005
ADMIN_SERVICE_PORT=3006
GATEWAY_PORT=3100
```

### 4. Create the Database Schema

```bash
cd packages/prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/safe_driving?schema=public" npx prisma migrate dev --name init
```

This creates all tables in the database.

### 5. Start All Services

In one terminal, start all backend services:

```bash
npm run dev
```

This will start:

- **Gateway** (http://localhost:3100) - Single entry point
- **User Service** (http://localhost:3000) - Auth & profiles
- **Trip Service** (http://localhost:3001) - Trip capture & telematics
- **Scoring Service** (http://localhost:3002) - Trip scoring engine
- **Rewards Service** (http://localhost:3004) - Points & gamification
- **Pricing Service** (http://localhost:3005) - Savings simulator
- **Dashboard Service** (http://localhost:3003) - Query optimization
- **Admin Service** (http://localhost:3006) - Operator tools

## API Usage Examples

All endpoints are proxied through the **Gateway** at `http://localhost:3100/v1/`

### 1. Sign Up

```bash
curl -X POST http://localhost:3100/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Driver"
  }'
```

Response:

```json
{
  "data": {
    "userId": "clx...",
    "email": "driver@example.com"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3100/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": "clx...",
      "email": "driver@example.com",
      "firstName": "John",
      "lastName": "Driver"
    }
  }
}
```

### 3. Start a Trip

```bash
curl -X POST http://localhost:3100/v1/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "startLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

### 4. Send Telemetry Data

```bash
curl -X POST http://localhost:3100/v1/trips/{tripId}/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "batchId": "batch-001",
    "telemetryData": [
      {
        "timestamp": "2024-04-22T10:00:00Z",
        "speedMps": 15.5,
        "acceleration": 0.5,
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    ]
  }'
```

### 5. Complete a Trip

```bash
curl -X POST http://localhost:3100/v1/trips/{tripId}/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "endLocation": {
      "latitude": 40.7600,
      "longitude": -73.9776
    }
  }'
```

This triggers:

1. Trip completion
2. Automatic scoring
3. Reward point assignment
4. Savings tier update

### 6. Get Scoring Results

```bash
curl http://localhost:3100/v1/scores/{tripId} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:

```json
{
  "data": {
    "tripId": "...",
    "scoreValue": 85.5,
    "events": [
      {
        "eventType": "speeding",
        "severity": "low",
        "impact": 5
      }
    ]
  }
}
```

### 7. Get Rewards Status

```bash
curl http://localhost:3100/v1/rewards \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Get Savings Estimate

```bash
curl http://localhost:3100/v1/pricing/savings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Running Tests

### Unit & Integration Tests

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

## Architecture Overview

```
Mobile App
    ↓
API Gateway (http://localhost:3100)
    ↓
┌─────────────────────────────────────┐
│   Microservices (Event-Driven)      │
├─────────────────────────────────────┤
│ • User Service (Auth)                │
│ • Trip Ingestion Service             │
│ • Scoring Service (Event Consumer)   │
│ • Rewards Service (Event Consumer)   │
│ • Pricing Service (Event Consumer)   │
│ • Dashboard Query Service            │
│ • Admin Service                      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Data Layer                        │
├─────────────────────────────────────┤
│ • PostgreSQL (Primary OLTP Store)   │
│ • Redis (Caching + Bull Queue)      │
└─────────────────────────────────────┘
```

## Event-Driven Flow

1. **User starts trip** → `trip-started` event published
2. **Telemetry received** → `telemetry-received` event published
3. **Trip completed** → `trip-completed` event published
4. **Scoring service** consumes `trip-completed` → calculates score → publishes `trip-scored`
5. **Rewards service** consumes `trip-scored` → updates points/streaks
6. **Pricing service** consumes `trip-scored` → updates savings tier
7. **Dashboard service** consumes all events → materializes read models

## Database Migrations

Add a new table? Create a migration:

```bash
cd packages/prisma

# Make schema changes to prisma/schema.prisma, then:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/safe_driving?schema=public" npx prisma migrate dev --name describe_change
```

View current schema status:

```bash
npx prisma studio
```

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Check if docker container is running
docker ps | grep postgres

# Check logs
docker logs $(docker ps | grep postgres | awk '{print $1}')

# Or use local PostgreSQL
# Update DATABASE_URL to your local instance
```

### Redis Connection Error

```bash
# Check redis
redis-cli ping
# Should respond with: PONG
```

### Port Already in Use

Services use these default ports:

- 3000: User Service
- 3001: Trip Service
- 3002: Scoring Service
- 3003: Dashboard Service
- 3004: Rewards Service
- 3005: Pricing Service
- 3006: Admin Service
- 3100: Gateway
- 5432: PostgreSQL
- 6379: Redis

Change them in `.env` or run: `PORT=3200 npm run dev`

### Prisma Client Not Found

```bash
cd packages/prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/safe_driving" npx prisma generate
```

## Development Workflow

1. **Make code changes**
2. **Services hot-reload** (via nodemon)
3. **Run tests**: `npm run test`
4. **Type check**: `npm run typecheck`
5. **Format code**: `npm run lint:fix`
6. **Commit changes**

## Code Style

- **Formatting**: Prettier (2 spaces, single quotes)
- **Linting**: ESLint + TypeScript strict mode
- **Type Safety**: No 'any' types - use explicit types
- **Naming**: kebab-case files, camelCase functions, PascalCase interfaces
- **Functions**: Max 50 lines, clear responsibilities
- **Files**: Max 300 lines

See [AGENTS.md](./AGENTS.md) for full code standards.

## Next Steps

1. ✅ Auth & User Service (Complete)
2. ✅ Trip Ingestion (In Progress)
3. ✅ Scoring Engine (In Progress)
4. ⏳ Dashboard Query Service
5. ⏳ Rewards & Gamification
6. ⏳ Pricing Simulator
7. ⏳ Admin Console
8. ⏳ E2E Tests & Launch Readiness

## Help

- See [AGENTS.md](./AGENTS.md) for architecture principles
- See [Safe Driving Gamified Insurance App MVP PRD.md](./Safe%20Driving%20Gamified%20Insurance%20App%20MVP%20PRD.md) for product requirements
- See [Safe Driving Gamified Insurance App MVP Sprint Plan.md](./Safe%20Driving%20Gamified%20Insurance%20App%20MVP%20Sprint%20Plan.md) for timeline
- See [Safe Driving Gamified Insurance App MVP Engineering Backlog.md](./Safe%20Driving%20Gamified%20Insurance%20App%20MVP%20Engineering%20Backlog.md) for detailed tasks

---

**Last Updated**: April 22, 2026  
**Status**: Phase 1 & 2 Implementation In Progress
