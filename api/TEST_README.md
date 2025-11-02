# 🧪 Hummii API Testing Guide

Comprehensive testing setup for the Hummii API with E2E and unit tests running in isolated Docker environment.

## 📋 Overview

- **E2E Tests**: Full integration tests for Auth, Users, and Admin modules
- **Unit Tests**: Service-level tests with mocked dependencies
- **Coverage**: 70%+ code coverage target
- **Environment**: Isolated test database in Docker
- **Execution**: One-command test runner

## 🚀 Quick Start

### Run All Tests (Recommended)

From project root:
```bash
./test.sh
```

This will:
1. Start isolated test database in Docker
2. Run Prisma migrations
3. Execute unit tests (parallel, ~10s)
4. Execute E2E tests (sequential, ~30s)
5. Generate coverage report
6. Cleanup test database

### Alternative Commands

From `api/` directory:

```bash
# Run all tests locally (requires test DB on port 5433)
npm run test:all

# Run only unit tests (fast)
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run tests with coverage report
npm run test:cov

# Watch mode for development
npm run test:watch

# Watch E2E tests
npm run test:e2e:watch

# Run in complete Docker environment
npm run test:docker

# Stop Docker test environment
npm run test:docker:down
```

## 📁 Test Structure

```
api/
├── test/
│   ├── auth.e2e-spec.ts          # Auth E2E tests (505 lines)
│   ├── users.e2e-spec.ts          # Users E2E tests (NEW)
│   ├── admin.e2e-spec.ts          # Admin E2E tests (NEW)
│   ├── setup.ts                   # Global test setup
│   ├── jest-e2e.json             # E2E configuration
│   └── helpers/
│       └── test-db.ts            # Database utilities
├── src/
│   ├── auth/
│   │   └── auth.service.spec.ts  # Auth unit tests
│   ├── users/
│   │   └── users.service.spec.ts # Users unit tests
│   ├── admin/
│   │   └── admin.service.spec.ts # Admin unit tests (NEW)
│   └── shared/
│       ├── email/
│       │   └── email.service.spec.ts  # Email unit tests (NEW)
│       └── audit/
│           └── audit.service.spec.ts  # Audit unit tests (NEW)
└── jest.config.js                # Unit test configuration

docker-compose.test.yml           # Test environment
test.sh                          # One-command test runner
```

## 🎯 Test Coverage

### Auth Module (100%)
- ✅ User registration with validation
- ✅ Email verification flow
- ✅ Login with JWT tokens
- ✅ Token refresh with rotation
- ✅ Password reset flow
- ✅ Logout and session invalidation
- ✅ Rate limiting
- ✅ Security headers

### Users Module (90%+)
- ✅ Get user profile
- ✅ Update profile
- ✅ Delete account (PIPEDA compliant soft delete)
- ✅ Export user data (PIPEDA data portability)
- ✅ Session management
- ✅ Audit logging

### Admin Module (85%+)
- ✅ List users with pagination/filters
- ✅ Get user details
- ✅ Add/remove user roles
- ✅ Lock/unlock user accounts
- ✅ Soft delete users
- ✅ View audit logs
- ✅ Platform statistics

### Shared Services (80%+)
- ✅ Email service (verification, reset, welcome)
- ✅ Audit logging (PIPEDA compliance)
- ✅ Database utilities

## 🔧 Configuration

### Test Environment Variables

File: `api/.env.test` (create if not exists)

```env
NODE_ENV=test
DATABASE_URL=postgresql://hummii_test:test_password@localhost:5433/hummii_test
JWT_ACCESS_SECRET=test_access_secret_key
JWT_REFRESH_SECRET=test_refresh_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
FRONTEND_URL=http://localhost:3001
EMAIL_FROM=test@hummii.ca
APP_NAME=Hummii Test
```

### Coverage Thresholds

Target: 70% for all metrics (branches, functions, lines, statements)

## 🐳 Docker Test Environment

### Test Database

- PostgreSQL 15 Alpine
- In-memory (tmpfs) for speed
- Port 5433 (to avoid conflicts with dev DB)
- Isolated from development environment

### Running Tests in Docker

```bash
# Start test containers
npm run test:docker

# Stop and cleanup
npm run test:docker:down
```

## 📊 Coverage Reports

Generate coverage report:

```bash
cd api
npm run test:cov
```

View report:
- Terminal: Summary displayed after tests
- HTML: `api/coverage/lcov-report/index.html`

## 🔍 Writing Tests

### E2E Test Example

```typescript
describe('Endpoint (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    // Setup test app and login
  });

  it('should test endpoint', () => {
    return request(app.getHttpServer())
      .get('/api/v1/endpoint')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

### Unit Test Example

```typescript
describe('Service', () => {
  let service: MyService;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: Dependency, useValue: mockDependency },
      ],
    }).compile();

    service = module.get(MyService);
  });

  it('should test method', async () => {
    mockDependency.method.mockResolvedValue('result');
    const result = await service.myMethod();
    expect(result).toBe('result');
  });
});
```

## 🛡️ PIPEDA Compliance Testing

Tests verify Canadian privacy law (PIPEDA) compliance:

- ✅ Data export (user can download all their data)
- ✅ Soft deletion (account anonymization)
- ✅ Audit logging (1 year retention minimum)
- ✅ Session invalidation on deletion
- ✅ PII masking in logs

## 🐛 Debugging Tests

### Run specific test file

```bash
npm test -- auth.service.spec.ts
npm run test:e2e -- --testNamePattern="Users"
```

### Debug mode

```bash
npm run test:debug
```

Then attach debugger to `node --inspect-brk` on port 9229.

### View detailed logs

Remove console mocks in `test/setup.ts` to see full output.

## ⚡ Performance

- **Unit tests**: ~5-10 seconds (parallel execution)
- **E2E tests**: ~20-30 seconds (sequential, with real DB)
- **Total**: ~30-40 seconds for full test suite

## 🔄 CI/CD Integration (Future)

Tests are ready for CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: ./test.sh
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 📝 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Always cleanup test data in `afterAll/afterEach`
3. **Mocking**: Mock external dependencies (email, payment, etc.)
4. **Assertions**: Be specific with expectations
5. **Coverage**: Aim for 70%+ but focus on critical paths
6. **Speed**: Unit tests should be fast, E2E can be slower

## 🆘 Troubleshooting

### Tests fail with "Connection refused"

- Ensure test database is running: `docker compose -f docker-compose.test.yml ps`
- Check port 5433 is available: `lsof -i :5433`

### Tests timeout

- Increase timeout in `test/setup.ts`: `jest.setTimeout(60000)`
- Check database connection in logs

### "Table does not exist" errors

- Run migrations: `DATABASE_URL=... npx prisma migrate deploy`
- Regenerate Prisma Client: `npx prisma generate`

### Coverage too low

- Identify untested files: Open `coverage/lcov-report/index.html`
- Add tests for critical paths first

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)
- [PIPEDA Compliance](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/)

---

**Last Updated**: November 2, 2025  
**Status**: Production Ready ✅  
**Maintainer**: Hummii Development Team

