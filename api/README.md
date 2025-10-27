# Hummii Backend API

Service Marketplace Platform API for Canada - Built with NestJS, PostgreSQL, Redis, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+ (with PostGIS extension)
- Redis 7+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate Prisma Client
pnpm run prisma:generate

# Run database migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

### With Docker

```bash
# Start all services (PostgreSQL, Redis, API)
docker compose up -d

# View logs
docker compose logs -f api

# Stop all services
docker compose down
```

## 📂 Project Structure

```
api/
├── src/
│   ├── core/                 # Global infrastructure
│   │   ├── filters/          # Exception filters
│   │   ├── guards/           # Authentication & authorization guards
│   │   ├── interceptors/     # Request/response interceptors
│   │   └── pipes/            # Validation pipes
│   ├── shared/               # Shared utilities
│   │   ├── prisma/           # Prisma service
│   │   ├── services/         # Cross-module services
│   │   └── utils/            # Helper functions
│   ├── config/               # Configuration files
│   ├── auth/                 # Authentication module (Phase 1)
│   ├── users/                # User management module (Phase 2)
│   ├── orders/               # Order management module (Phase 3)
│   ├── chat/                 # Real-time chat module (Phase 4)
│   ├── reviews/              # Reviews & ratings module (Phase 5)
│   ├── payments/             # Payment processing module (Phase 6)
│   ├── app.module.ts         # Root application module
│   └── main.ts               # Application entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Database seeding
├── test/                     # E2E tests
├── logs/                     # Application logs
├── .env                      # Environment variables (not in Git)
├── .env.example              # Example environment variables
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🔧 Available Commands

### Development

```bash
# Start development server (watch mode)
pnpm run start:dev

# Start production server
pnpm run start:prod

# Build for production
pnpm run build

# Format code
pnpm run format

# Lint code
pnpm run lint
```

### Database (Prisma)

```bash
# Generate Prisma Client
pnpm run prisma:generate

# Create new migration
pnpm run migration:generate -- -n MigrationName

# Run migrations
pnpm run migration:run

# Open Prisma Studio (Database GUI)
pnpm run prisma:studio

# Seed database
pnpm run prisma:seed
```

### Testing

```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api/v1/health
- **Version:** http://localhost:3000/api/v1/version

## 🔒 Security Features

✅ **Authentication & Authorization**
- JWT-based authentication (15min access, 7d refresh)
- HTTP-only cookies (NEVER localStorage)
- Role-Based Access Control (RBAC)
- OAuth2.0 (Google, Apple Sign In)
- Email verification mandatory
- Password reset flow
- Failed login tracking & account lockout

✅ **API Security**
- Helmet.js security headers
- CORS with whitelist
- Rate limiting (100 req/min global, stricter for auth)
- Input validation (DTOs with class-validator)
- Request/response logging with PII masking
- CSRF protection

✅ **Data Protection**
- bcrypt password hashing (cost 12+)
- Field-level encryption (AES-256) for SIN, etc.
- PII masking in logs
- Secure session management (Redis)
- Soft delete for PIPEDA compliance

✅ **PIPEDA Compliance (Canada)**
- User data export (JSON)
- Account deletion (right to erasure)
- Data portability
- Audit logging
- Privacy controls

## 🌍 Environment Variables

See `.env.example` for all required environment variables.

Critical variables:
```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hummii_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (MUST be strong secrets in production)
JWT_ACCESS_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-secret

# Stripe (Test keys for development)
STRIPE_SECRET_KEY=sk_test_...
```

## 🧪 Testing

### Unit Tests

```bash
pnpm run test
```

### E2E Tests

```bash
# Make sure test database is running
docker compose up -d postgres redis

# Run E2E tests
pnpm run test:e2e
```

### Test Coverage

```bash
pnpm run test:cov
```

Target: 80%+ coverage on critical paths.

## 🚢 Deployment

### Production Build

```bash
# Build Docker image
docker build -t hummii-api:latest -f docker/api.Dockerfile .

# Run container
docker run -p 3000:3000 --env-file .env.production hummii-api:latest
```

### Environment Setup

1. Copy `.env.example` to `.env.production`
2. Generate strong JWT secrets: `openssl rand -base64 64`
3. Set production database URL
4. Configure Stripe production keys
5. Set up monitoring (Sentry DSN)

### Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Strong JWT secrets generated
- [ ] Database migrations run
- [ ] SSL/TLS configured
- [ ] Rate limiting active
- [ ] Logging configured
- [ ] Monitoring active (Sentry)
- [ ] Backups configured
- [ ] Security audit passed

## 📊 Implementation Phases

- ✅ **Phase 0:** Foundation & Infrastructure (Weeks 1-2)
- ⏳ **Phase 1:** Authentication & Authorization (Weeks 3-4)
- ⏳ **Phase 2:** User Management (Weeks 5-6)
- ⏳ **Phase 3:** Orders Module (Weeks 7-8)
- ⏳ **Phase 4:** Chat Module (Weeks 9-10)
- ⏳ **Phase 5:** Reviews & Ratings (Weeks 11-12)
- ⏳ **Phase 6:** Payments (Stripe) (Weeks 13-15)

See `docs/plans/backend/roadmap.md` for full roadmap.

## 🔗 Related Documentation

- [Backend Roadmap](../docs/plans/backend/roadmap.md)
- [Backend Security Checklist](../docs/plans/backend/security-checklist.md)
- [Phase 1 Tasks](../docs/plans/backend/tasks/phase-1-tasks.md)
- [NestJS Guide](./.claude/backend/nestjs-guide.md)
- [Project Context](./.claude/core/project-context.md)
- [Critical Rules](./.claude/core/critical-rules.md)

## 🐛 Troubleshooting

### Database connection error

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Prisma Client generation failed

```bash
# Delete node_modules and reinstall
rm -rf node_modules
pnpm install

# Regenerate Prisma Client
pnpm run prisma:generate
```

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

## 📞 Support

- **Documentation:** `/docs/` directory
- **Issues:** GitHub Issues
- **Security:** security@hummii.ca
- **Privacy:** privacy@hummii.ca
- **General:** admin@hummii.ca

---

**Last Updated:** January 2025
**Version:** 1.0.0 (Phase 0 Complete)
**License:** UNLICENSED
