# Contributing to Safe Driving Gamified Insurance App

Thank you for contributing! Please follow these guidelines to ensure code quality and security.

---

## Before You Commit

### 1. Security Check

```bash
# Verify no secrets are in staged changes
git diff --cached | grep -i "secret\|password\|api_key\|token\|private_key"
# Should return NOTHING

# Verify .env files are not staged
git status | grep ".env"
# Should return NOTHING (except .env.example)
```

### 2. Code Quality

```bash
# Format code automatically
npm run lint:fix

# Type check TypeScript
npm run typecheck

# Run tests
npm run test

# Build for production (ensures no build errors)
npm run build
```

### 3. Commit Message Format

Follow this format for clear, informative commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring (no behavior change)
- `test` - Adding/updating tests
- `docs` - Documentation changes
- `perf` - Performance improvement
- `ci` - CI/CD configuration
- `chore` - Build, dependencies, etc.

**Scopes:**

- `auth` - Authentication/authorization
- `trip` - Trip service
- `scoring` - Scoring service
- `rewards` - Rewards service
- `pricing` - Pricing service
- `dashboard` - Dashboard service
- `admin` - Admin service
- `gateway` - API Gateway
- `db` - Database/Prisma
- `mobile` - React Native app

**Examples:**

```bash
git commit -m "feat(scoring): add phone distraction detection

- Implement accelerometer variance analysis for phone detection
- Add 15-point deduction for detected phone distraction
- Update coaching messages for distraction events
- Add unit tests with 95% coverage

Closes #42"
```

```bash
git commit -m "fix(trip): handle duplicate telemetry events

- Add idempotency check using event ID hash
- Prevent duplicate scoring of same event
- Add integration test for batch telemetry

Fixes #38"
```

---

## Pull Request Checklist

Before submitting a PR:

- [ ] Tests pass: `npm run test`
- [ ] TypeScript checks pass: `npm run typecheck`
- [ ] Linting passes: `npm run lint` (auto-fixed: `npm run lint:fix`)
- [ ] No secrets in code or config
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow format
- [ ] Changes are focused (one feature per PR)
- [ ] Code follows AGENTS.md conventions

---

## Code Review Process

1. **Automated Checks** - CI/CD pipeline runs:
   - Linting
   - Type checking
   - Unit tests
   - Build verification

2. **Code Review** - At least 1 team member reviews:
   - Code quality
   - Security implications
   - Test coverage
   - Documentation

3. **Approval & Merge** - After approval:
   - Squash commits if multiple
   - Rebase on latest main
   - Delete feature branch after merge

---

## Development Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/safe-driving-app.git
cd safe-driving-app

# Install dependencies
npm install

# Create local env file (from template)
cp .env.example .env.local
# Edit .env.local with real values for local development

# Start Docker services (PostgreSQL, Redis)
docker-compose up -d

# Run all services
npm run dev

# In another terminal, run tests
npm run test:watch
```

---

## Reporting Issues

### Found a Bug?

1. Check if issue already exists
2. Open new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots/logs if applicable

### Security Vulnerability?

**DO NOT** open a public issue. Instead:

1. Email security@safedrivingapp.com (or maintainer email)
2. Provide details: what, how, impact
3. Allow 48 hours for response

---

## Release Process

Only maintainers handle releases:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.2.3`
4. Create GitHub release with notes
5. Deploy to staging, then production

---

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Need to report a bug?** Open an Issue
- **Security concern?** Email privately (see above)
- **Want to contribute a feature?** Create an issue first to discuss approach

---

## Code Style Conventions

See [AGENTS.md](../AGENTS.md) for detailed conventions:

- TypeScript strict mode (no `any`)
- Zod validation for inputs
- Custom error classes
- Functional patterns
- 50-line max per function
- 300-line max per file
- 100-character max line length

---

## Testing Requirements

All PRs must include tests:

- **Unit tests** - Individual functions/services
- **Integration tests** - Service interactions
- **E2E tests** - Critical user flows

Target: **80%+ code coverage**

```bash
npm run test:coverage
```

---

## Documentation

Update documentation when:

- Adding new APIs
- Changing data models
- Modifying config options
- Introducing new services

Keep updated:

- [README.md](../README.md)
- [SETUP.md](../SETUP.md)
- [SECURITY_AND_BEST_PRACTICES.md](../SECURITY_AND_BEST_PRACTICES.md)
- Inline code comments (for complex logic)

---

Thank you for contributing to the Safe Driving App! 🚀
