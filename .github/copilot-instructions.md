<!-- Copilot / AI agent instructions for quick onboarding to this repo -->
# Quick AI coding guide — Safe Driving Gamified Insurance App

This repository is a Node/TypeScript monorepo (Yarn/NPM workspaces) with an Expo React Native mobile app and several backend services. Use this note to get productive quickly.

- Repo layout: root workspace with `mobile/`, `services/*`, `packages/*` and `prisma/`.
- Monorepo scripts live in `package.json` at the repo root. Key scripts:
  - `npm run dev` (starts all services via workspaces)
  - `npm run build`, `npm run lint`, `npm run typecheck`
  - `npm run test` (Vitest unit tests), `npm run test:e2e` (Playwright)

- Mobile: `mobile/` is an Expo app. Useful scripts in `mobile/package.json`:
  - `npm start` -> `expo start`, `npm run ios|android|web` for targets.
  - Telemetry and UI live under `mobile/src/` (screens, components, services).

- Backend: `services/` contains microservices (user, trip, scoring, rewards, pricing, gateway, dashboard, admin).
  - Each service is a TypeScript Node app with its own `package.json` and `npm run dev`.
  - The API surface is defined in `safe_driving_app_api_spec.yaml` (OpenAPI). Use it to find endpoints and request/response shapes.

- Conventions to follow (concrete, discoverable rules):
  - Functional-first TypeScript. Prefer small pure functions (<50 lines).
  - Files: kebab-case. Types/interfaces: PascalCase. Functions: camelCase (verb-prefixed).
  - Use async/await; avoid nested callbacks.
  - Use Prisma for DB access (see `packages/prisma/`), Zod for request validation, and JWT for auth.
  - Path aliases are used (e.g. `@/` / `@services/`) — honor existing import style.

- API and security patterns:
  - REST endpoints follow `/v1/*` and are described in the OpenAPI YAML.
  - Include `X-Correlation-ID` header on requests when simulating or logging flows.
  - Follow AGENTS.md for error classes, response envelope (`{ data, meta, error }`), and HTTP status usage.

- Tests & CI:
  - Unit tests use Vitest. Quick run: `npm run test` at repo root (or per-package test scripts).
  - E2E uses Playwright; tests are under `tests/e2e` and Playwright config at `playwright.config.ts`.

- Linting & formatting:
  - ESLint + Prettier conventions are enforced. Use `npm run lint` and `npm run lint:fix`.
  - Type checking: `npm run typecheck`.

## Per-Service Dev Commands

Each service runs independently with `npm run dev` from its own folder. Common patterns:
- **User Service** (`services/user`): User registration, login, JWT issuance. `npm run dev` starts auth API.
- **Trip Service** (`services/trip`): Ingests telemetry, stores trips. `cd services/trip && npm run dev`.
- **Scoring Service** (`services/scoring`): Calculates driving scores from trip events.
- **Gateway Service** (`services/gateway`): API proxy and routing. Runs on port typically 3000.
- **Rewards, Pricing, Dashboard, Admin**: Follow same pattern (`npm run dev` per service).

To run all services: `npm run dev` from root (uses workspaces). To debug one:
```bash
cd services/user && npm run dev
cd services/trip && npm run dev
# etc.
```

## Database & Prisma

Database setup is under `packages/prisma/`. 
- Review `packages/prisma/prisma/schema.prisma` for the data model.
- Run migrations: `npx prisma migrate deploy` or `npx prisma generate` (from `packages/prisma`).
- Prisma client is auto-generated; services import it for DB access.

## Where to look for examples

- **Auth flows**: `services/user/src/` and OpenAPI paths `/auth/*` in `safe_driving_app_api_spec.yaml`.
- **Trip ingestion & scoring**: `services/trip/src/` and `services/scoring/src/`.
- **Mobile UI screens**: `mobile/src/screens/` (Dashboard, TripHistory, TripDetail, Profile, Rewards, Savings).
- **Response envelope**: Check `services/user/src/` for `{ data, meta, error }` pattern examples.
- **Error classes**: Look in service `src/` folders for custom error classes (ValidationError, NotFoundError, etc.).

## AI Change Checklist (Before submitting a PR)

- [ ] Code follows conventions (kebab-case files, PascalCase types, camelCase functions, verb-prefixed).
- [ ] All changes have accompanying Vitest unit tests with at least one edge case.
- [ ] No unused imports; check `npm run lint --fix` and verify no lint errors remain.
- [ ] Type-checked: `npm run typecheck` passes (no `any` types).
- [ ] Tested: `npm run test` passes locally.
- [ ] E2E (if API changes): `npm run test:e2e` passes.
- [ ] Commit message is clear and concise (e.g., "fix: validate trip duration in scoring service").

Reference: `AGENTS.md` at repository root contains extended conventions (coding style, build/test commands, and backlog priorities). Use it as the canonical longer guide.

If anything here is unclear or you want more service-specific hooks, tell me which service or workflow to expand and I will update this file.
