# Security & Best Practices Guide

> Essential guidelines for maintaining code quality, security, and compliance in the Safe Driving Gamified Insurance App.

---

## Table of Contents

1. [Environment & Secrets](#environment--secrets)
2. [Git & Version Control](#git--version-control)
3. [TypeScript & Code Quality](#typescript--code-quality)
4. [Database Security](#database-security)
5. [API Security](#api-security)
6. [Dependency Management](#dependency-management)
7. [Testing & QA](#testing--qa)
8. [Deployment & Production](#deployment--production)
9. [Incident Response](#incident-response)

---

## Environment & Secrets

### ✅ DO

- **Use `.env.local` for secrets** - Never commit actual environment variables
  ```bash
  cp .env.example .env.local
  # Edit .env.local with real values (git-ignored)
  ```
- **Generate strong JWT secrets** - Use cryptographically secure random values
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Rotate secrets regularly** - Every 90 days in production
- **Use environment-specific configs** - Separate dev, staging, production
- **Document all env vars** in `.env.example` with descriptions
- **Use Zod for validation** - Validate env vars at startup, fail fast
- **Load secrets from secure vaults** - AWS Secrets Manager, HashiCorp Vault (production)

### ❌ DON'T

- **Hardcode secrets in code** - Not even "test" secrets
- **Log secrets** - Never print API keys, tokens, passwords to logs
- **Commit `.env` files** - .gitignore covers this, but be careful with `git add -f`
- **Share secrets in chat/Slack** - Use vaults for sharing credentials
- **Use weak passwords** - Database user passwords must be 16+ characters
- **Store secrets in comments** - `// API_KEY=abc123` is still in git history

### Example: Proper Secret Handling

```typescript
// ✅ GOOD: Load and validate at startup
import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be 32+ characters'),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
});

const config = envSchema.parse(process.env);
// If env var is missing/invalid, app crashes with clear error (fail-fast)

// ❌ BAD: Accessing process.env directly
const secret = process.env.JWT_SECRET; // Could be undefined, no validation
```

---

## Git & Version Control

### ✅ DO

- **Use meaningful commit messages** - Reference issue numbers, explain why

  ```bash
  git commit -m "feat: add trip scoring engine (SCORE-01)

  - Implement detection for speeding, harsh braking, acceleration
  - Add coaching message generation
  - Publish trip-scored event to queue
  "
  ```

- **Review all code before merge** - Use pull requests, require approvals
- **Protect main branch** - Require status checks, disable force pushes
- **Sign commits with GPG** - For high-security environments
  ```bash
  git config --global commit.gpgSign true
  ```
- **Use semantic versioning** - v1.0.0, v1.0.1, v1.1.0, v2.0.0
- **Create release notes** - Document breaking changes, new features, bug fixes
- **Revert safely** - Use `git revert` (creates new commit) vs `git reset` (destructive)

### ❌ DON'T

- **Force push to main** - Only in emergencies with team agreement
- **Commit and push without testing** - Always `npm run test` before pushing
- **Use vague commit messages** - "fix bug", "update stuff" don't help future devs
- **Leave commented-out code** - Delete it or open a GitHub issue instead
- **Commit secrets accidentally** - If it happens, use `git filter-branch` to remove history
  ```bash
  # If you accidentally committed a secret:
  git filter-branch --tree-filter 'rm -f .env' HEAD
  # Then notify team to rotate the secret!
  ```

### Emergency: Secrets Leaked to Git

1. **Immediately rotate** the compromised secret (JWT, API key, password)
2. **Run BFG Repo-Cleaner** to remove from history:
   ```bash
   bfg --delete-files .env
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push --force-with-lease
   ```
3. **Notify the team** and update deployment (service may have cached old secret)
4. **Enable secret scanning** (GitHub, GitLab automatically flag leaked secrets)

---

## TypeScript & Code Quality

### ✅ DO

- **Use strict TypeScript mode** - No `any` types
  ```bash
  npm run typecheck  # Before every commit
  ```
- **Define explicit return types** - Helps catch errors

  ```typescript
  // ✅ GOOD
  function calculateScore(trip: TripData): ScoreResult {
    // ...
  }

  // ❌ BAD
  function calculateScore(trip: TripData): any {
    // ...
  }
  ```

- **Use Zod for validation** - Especially for API requests/responses

  ```typescript
  const tripSchema = z.object({
    userId: z.string().uuid(),
    startTime: z.date(),
    distance: z.number().positive(),
  });

  const trip = tripSchema.parse(req.body); // Throws ZodError if invalid
  ```

- **Create custom error classes** - Type-safe error handling
  ```typescript
  class ValidationError extends Error {
    constructor(
      message: string,
      public readonly statusCode = 400,
    ) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  ```
- **Use const assertions for enums** - Prevent accidental mutation

  ```typescript
  const TRIP_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed',
  } as const; // as const prevents reassignment

  type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];
  ```

- **Test edge cases** - Null, undefined, empty strings, negative numbers
- **Linting before commit** - `npm run lint:fix` auto-fixes formatting issues

### ❌ DON'T

- **Use `any` type** - Use `unknown` and narrow with type guards instead
- **Disable TypeScript checks** - No `// @ts-ignore` comments
- **Create overly large functions** - Keep functions <50 lines
- **Use deeply nested logic** - Refactor into smaller functions
- **Forget to handle errors** - Every async function needs try-catch
- **Skip tests for "simple" code** - Write tests especially for edge cases

---

## Database Security

### ✅ DO

- **Use parameterized queries** - Prisma does this automatically

  ```typescript
  // ✅ GOOD: Prisma prevents SQL injection
  const user = await prisma.user.findUnique({
    where: { email: userInput },
  });

  // ❌ BAD: Raw SQL (never do this!)
  const user = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`);
  ```

- **Use Prisma migrations** - Version control your schema
  ```bash
  npx prisma migrate dev --name add_user_email_index
  git add prisma/migrations
  git commit -m "database: add email index for faster lookups"
  ```
- **Set up connection pooling** - Use PgBouncer for production (Prisma supports it)
- **Enable row-level security (RLS)** - PostgreSQL feature for fine-grained access control
- **Index frequently queried columns** - Improve query performance
  ```prisma
  model Trip {
    id        String   @id @default(cuid())
    userId    String
    createdAt DateTime @default(now())

    @@index([userId])  // Index for fast user lookups
    @@index([createdAt])  // Index for time-range queries
  }
  ```
- **Enable audit logging** - Track who changed what and when
- **Back up regularly** - Automated daily backups, test restore process
- **Encrypt data at rest** - Use managed database services (RDS, Supabase)

### ❌ DON'T

- **Use default passwords** - Change PostgreSQL default password immediately
- **Expose database directly** - Only connect through app (use VPN in prod)
- **Store sensitive data as plain text** - Hash passwords, encrypt API keys
- **Skip database backups** - Automate backups and test restores monthly
- **Modify schema in production manually** - Always use migrations
- **Log full user data** - Only log IDs, never emails or sensitive fields

---

## API Security

### ✅ DO

- **Use HTTPS/TLS** - All production traffic must be encrypted
- **Implement CORS properly** - Restrict origins, avoid `*` in production
  ```typescript
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(','),
      credentials: true,
    }),
  );
  ```
- **Validate all inputs** - Use Zod, never trust client data
- **Sanitize output** - Remove sensitive fields from responses

  ```typescript
  // ❌ DON'T send password
  return { userId, email, password: user.password };

  // ✅ DO exclude sensitive fields
  return { userId, email }; // password omitted
  ```

- **Rate limit endpoints** - Prevent brute force, DoS attacks
  ```typescript
  app.post('/login', rateLimit({ windowMs: 60000, max: 5 }), async (req, res) => {
    // Max 5 login attempts per minute per IP
  });
  ```
- **Use authentication on all endpoints** - JWT tokens with expiry
- **Implement request signing** - For inter-service communication

  ```typescript
  // Service A signs request with HMAC
  const signature = createHmac('sha256', SERVICE_SECRET).update(body).digest('hex');

  // Service B verifies signature
  if (!verifySignature(body, signature, SERVICE_SECRET)) throw new Error('Unauthorized');
  ```

- **Log security events** - Failed logins, invalid tokens, rate limit hits
- **Use security headers** - Helmet.js provides defaults
  ```typescript
  import helmet from 'helmet';
  app.use(helmet()); // Sets CSP, X-Frame-Options, etc.
  ```

### ❌ DON'T

- **Trust user IDs from client** - Always use logged-in user context

  ```typescript
  // ❌ BAD: User can fetch anyone's data
  const trip = await prisma.trip.findUnique({ where: { id: req.body.tripId } });

  // ✅ GOOD: Only fetch data for logged-in user
  const trip = await prisma.trip.findUnique({
    where: {
      id: req.body.tripId,
      userId: req.user.id, // Only their own trips
    },
  });
  ```

- **Return stack traces to clients** - Could leak internal details
- **Use weak algorithms** - No MD5, SHA1; use bcrypt (passwords), HMAC-SHA256 (signing)
- **Embed secrets in URLs** - Use Authorization header instead
- **Skip error handling** - All endpoints should return consistent error format

---

## Dependency Management

### ✅ DO

- **Keep dependencies updated** - Run `npm outdated` weekly
  ```bash
  npm update  # Update minor/patch versions
  npm audit   # Check for security vulnerabilities
  npm audit fix  # Auto-fix known vulnerabilities
  ```
- **Review dependency security** - Use `npm audit` and Dependabot
- **Lock versions** - Commit `package-lock.json` to git
- **Audit major updates** - Test thoroughly before upgrading major versions
- **Use minimal dependencies** - Evaluate cost-benefit of each package
- **Monitor for abandoned packages** - Check GitHub activity, last updated date

### ❌ DON'T

- **Use `*` or `>` in package.json** - Lock versions for reproducibility

  ```json
  // ❌ BAD
  "dependencies": {
    "express": "*",
    "prisma": ">= 5.0.0"
  }

  // ✅ GOOD
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.7.0"
  }
  ```

- **Ignore `npm audit` warnings** - Fix or document as accepted risk
- **Use unmaintained packages** - Check last update date before adding
- **Add every shiny new package** - More dependencies = more vulnerabilities

---

## Testing & QA

### ✅ DO

- **Write tests for all features** - Unit, integration, E2E
  ```bash
  npm run test              # Run all tests
  npm run test:watch       # Watch mode for development
  npm run test:coverage    # Check coverage (target: 80%+)
  ```
- **Test error paths** - Invalid inputs, database failures, network errors
- **Use fixtures/factories** - Avoid test data duplication
  ```typescript
  // Create consistent test data
  function createTestUser(overrides?: Partial<User>): User {
    return {
      id: uuid(),
      email: 'test@example.com',
      ...overrides,
    };
  }
  ```
- **Test async operations** - Promises, timeouts, retries
- **Mock external services** - Don't hit real APIs during tests
- **Run tests before committing** - Use pre-commit hooks
  ```bash
  git config core.hooksPath .githooks
  # Create .githooks/pre-commit to run tests
  ```
- **Maintain test database** - Separate from production
- **Write integration tests** - Test service interactions

### ❌ DON'T

- **Skip tests for "simple" code** - Edge cases are often in "simple" code
- **Use `skip()` or `only()` permanently** - Leave tests pending with TODO instead

  ```typescript
  // ❌ BAD: Test never runs (easy to forget)
  test.skip('calculates trip score', () => { ... });

  // ✅ GOOD: Clear this is intentional
  test.todo('calculate trip score with multiple harsh events');
  ```

- **Test implementation details** - Test behavior, not internals
- **Create flaky tests** - Tests should always pass if code is correct
- **Skip E2E tests** - They catch integration bugs unit tests miss

---

## Deployment & Production

### ✅ DO

- **Use a deployment checklist** - Review before every production release
  ```markdown
  - [ ] All tests passing
  - [ ] Code reviewed and approved
  - [ ] Database migrations tested
  - [ ] Security review completed
  - [ ] Performance tested (load test)
  - [ ] Rollback plan documented
  - [ ] Monitoring/alerting configured
  - [ ] Communication sent to stakeholders
  ```
- **Use semantic versioning** - v1.2.3 = major.minor.patch
- **Tag releases in git** - `git tag v1.2.3`
- **Create release notes** - Communicate changes to stakeholders
- **Use blue-green deployments** - Run two versions, switch seamlessly
- **Monitor error rates** - Alert if error % spikes above baseline
- **Set up structured logging** - JSON logs for easy parsing
  ```typescript
  logger.info('trip_completed', {
    tripId: trip.id,
    userId: trip.userId,
    score: trip.score,
    durationMs: Date.now() - startTime,
  });
  ```
- **Enable distributed tracing** - Track requests across services
- **Document rollback procedure** - Know how to revert if issues occur

### ❌ DON'T

- **Deploy on Friday 4pm** - Deploy during business hours for support
- **Deploy without backups** - Always back up before major changes
- **Use production data for testing** - Use separate test/staging database
- **Skip staging environment** - Test in staging before production
- **Forget to monitor** - Set up alerting for errors, latency, resource usage
- **Deploy directly via SSH** - Use automated CI/CD pipelines

---

## Incident Response

### When Something Goes Wrong

1. **Stay calm** - Panic leads to mistakes
2. **Assess impact** - How many users affected? What data is at risk?
3. **Communicate** - Notify stakeholders immediately
4. **Contain** - Stop the bleeding (kill jobs, revert, disable feature)
5. **Fix** - Apply minimal fix first, comprehensive fix later
6. **Verify** - Ensure fix is working in staging
7. **Deploy** - Push fix to production
8. **Monitor** - Watch metrics for next 30 minutes
9. **Document** - Write post-mortem within 24 hours

### Example: Database Went Down

```markdown
1. Impact: Login service down for 15 min, ~1000 active users affected
2. Root Cause: PostgreSQL connection pool exhausted by stale connections
3. Immediate Fix: Restart database service (killed stale connections)
4. Proper Fix: Implement connection timeout, enable PgBouncer
5. Prevention: Add alert for connection pool usage >80%
6. Timeline: Detect 14:22 → Notify 14:23 → Contain 14:25 → Deploy fix 14:45
```

---

## Security Checklist Before Launch

### Pre-Launch Security Review

- [ ] **Secrets**: No hardcoded API keys, passwords, or tokens in code
- [ ] **Dependencies**: No known vulnerabilities (`npm audit`)
- [ ] **Authentication**: JWT tokens have expiry, refresh tokens implemented
- [ ] **Database**: Password hashing (bcrypt), no plain-text sensitive data
- [ ] **API**: CORS configured, rate limiting enabled, input validation strict
- [ ] **Logging**: No secrets in logs, structured logging implemented
- [ ] **HTTPS**: All traffic encrypted, certificate valid
- [ ] **Headers**: Security headers set (CSP, X-Frame-Options, HSTS)
- [ ] **Backups**: Automated backups configured, restore tested
- [ ] **Monitoring**: Error alerting, performance monitoring, security logging
- [ ] **Documentation**: README, API docs, deployment guide, incident response
- [ ] **Testing**: Unit tests 80%+ coverage, E2E tests for critical flows
- [ ] **Code Review**: All code reviewed before merge, no TODO comments

---

## Quick Reference: Files to Never Commit

```bash
# These patterns are in .gitignore - verify they're being ignored:
.env*                   # Environment files with secrets
.env.local              # Local development secrets
node_modules/           # Dependencies (huge, installable)
*.log                   # Log files (may contain sensitive data)
coverage/               # Test coverage reports
dist/                   # Build artifacts
.DS_Store              # macOS files
.idea/                 # IDE configs
.vscode/               # VSCode workspace settings
```

Verify before pushing:

```bash
git status              # See what will be committed
git diff --cached       # Review changes
git diff                # See unstaged changes
```

---

## Questions?

For security concerns, open an issue on GitHub (private repo) or contact the security team.

**Never publicly disclose security vulnerabilities** - Always use responsible disclosure: contact maintainers first.

---

**Last Updated**: April 22, 2026  
**Maintained By**: Engineering Team  
**Review Frequency**: Quarterly
