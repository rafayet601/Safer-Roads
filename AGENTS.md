# AGENTS.md - Safe Driving Gamified Insurance App

> Agentic coding guidelines for this repository. Operate within these conventions when implementing features.

## Project Overview

Greenfield MVP for a safe-driving behavior platform with smartphone telematics, trip scoring, gamification, and premium savings simulation.

- **Mobile**: React Native (Expo)
- **Backend**: Node.js/TypeScript microservices (User, Trip, Scoring, Rewards, Pricing, Dashboard, Admin)
- **API**: REST with JWT authentication
- **DB**: PostgreSQL (primary), Redis (caching)

## Build & Test Commands

```bash
# Install dependencies
npm install

# Development
npm run dev              # Start all services (or service-specific)
cd services/user && npm run dev

# Linting
npm run lint             # ESLint across codebase
npm run lint:fix        # Auto-fix lint issues

# Type checking
npm run typecheck       # TypeScript strict mode

# Testing
npm run test            # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report

# Run a single test
npm run test -- --testPathPattern="auth.spec.ts"
# or with vitest:
npx vitest run src/auth/auth.spec.ts

# Build
npm run build          # Production build for all services
npm run build:mobile   # Build React Native app

# E2E tests
npm run test:e2e      # Playwright/Cypress suite
```

**Test Framework:** Use Vitest for unit tests, Playwright for E2E. All new code requires tests.

## Code Style Guidelines

### General Principles

- Use functional patterns; avoid classes unless necessary
- Write small, focused functions (< 50 lines)
- Keep files under 300 lines
- Use async/await over promises
- Avoid nested callbacks; prefer explicit error handling

### Formatting

- Use Prettier for code formatting (2 spaces, single quotes)
- Maximum line length: 100 characters
- Trailing commas in arrays and objects
- Semi-colons always

### TypeScript Conventions

```typescript
// Use explicit types for function parameters and returns
function calculateScore(trip: TripData, events: Event[]): ScoreResult {
  // ...
}

// Prefer interfaces over types for objects
interface TripSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'completed' | 'aborted';
}

// Use readonly for immutable data
interface ReadonlyTrip extends Readonly<TripSession> {}

// Avoid 'any'; use 'unknown' when type is uncertain
function parsePayload(data: unknown): TripData {
  if (!isTripData(data)) throw new InvalidPayloadError();
  return data;
}
```

### Naming Conventions

- **Files**: kebab-case (`trip-service.ts`, `auth-middleware.ts`)
- **Interfaces/Types**: PascalCase (`TripSession`, `ScoreResult`)
- **Functions**: camelCase, verb-prefixed (`calculateScore`, `validateTelemetry`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Enums**: PascalCase, singular (`TripStatus`, `EventType`)
- **Boolean variables**: is/isHas/has prefix (`isActive`, `hasScore`)

### Imports

```typescript
// Order: external, internal, relative
import { useState, useEffect } from 'react';
import { JwtService } from '@services/jwt';
import { TripEntity } from '../entities/trip';

import { calculateScore } from './scoring utils';
import { validateEmail } from '@/shared/validation';

// Use path aliases (@/ for src, @services/, @entities/)
```

### Error Handling

- Use custom error classes with codes and status codes
- Always use try-catch for async operations
- Throw typed errors (ValidationError, NotFoundError, etc.)

### API Design

- RESTful endpoints: `/v1/trips`, `/v1/scores`
- Consistent response format with data, meta, and error fields
- Standard HTTP status codes (200, 201, 400, 401, 404, 500)
- Include correlation IDs in headers (`X-Correlation-ID`)

### Database

- Use an ORM (Prisma recommended)
- Write migrations for schema changes
- Use transactions for multi-table operations

### Security

- Never log secrets or tokens
- Validate all input (use Zod for schema validation)
- Use parameterized queries
- Implement rate limiting on public endpoints

## Existing Documentation

- API Spec: `safe_driving_app_api_spec.yaml` (OpenAPI 3.0)
- Architecture: `safe_driving_app_architecture.mmd`
- Engineering Backlog: `Safe Driving Gamified Insurance App MVP Engineering Backlog.md`
- PRD: `Safe Driving Gamified Insurance App MVP PRD.md`

## Priority Order (from Engineering Backlog)

1. AUTH-01: Define MVP service contracts and API conventions
2. AUTH-02: Set up environments and delivery pipeline
3. TRIP-01: Define telemetry event contract
4. AUTH-03: Implement user registration API
5. AUTH-04: Implement login and token issuance