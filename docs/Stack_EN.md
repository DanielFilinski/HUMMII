# Technology Stack - Hummii Platform

**Last Updated:** October 24, 2025

## Overview

Hummii is a service marketplace connecting clients with verified contractors in Canada. This document outlines the complete technology stack and architecture decisions.

---

## Frontend Stack

### Core Technologies
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **UI Components:** Shadcn/ui or Chakra UI + Tailwind CSS
- **State Management:**
  - **Zustand** - global UI state (theme, user preferences)
  - **React Query (TanStack Query)** - server state management
- **Forms:** React Hook Form + Zod validation
- **Maps:** Google Maps API
- **Real-time:** Socket.io-client (chat functionality)
- **Internationalization:** next-intl (English + French for Canada)

### Application Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Protected pages
│   └── (public)/          # Public pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   └── layouts/           # Layout components
├── lib/                   # Utilities and helpers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

---

## Backend Stack (API)

### Core Technologies
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL 15+ (with PostGIS extension)
- **Cache:** Redis 7+
- **ORM:** Prisma
- **Real-time:** Socket.io (WebSocket gateway)
- **File Storage:** AWS S3 + CloudFront CDN
- **Task Queue:** Bull/BullMQ (background jobs)
- **Scheduler:** @nestjs/schedule (cron jobs)
- **API Documentation:** Swagger/OpenAPI (auto-generated)

### Module Structure
```
api/
├── src/
│   ├── core/              # Global filters, guards, interceptors
│   │   ├── filters/       # Exception filters
│   │   ├── guards/        # Authentication/authorization guards
│   │   └── interceptors/  # Request/response interceptors
│   ├── shared/            # Shared utilities and services
│   │   ├── utils/         # Helper functions
│   │   └── services/      # Shared business logic
│   ├── auth/              # Authentication module
│   ├── users/             # Users module
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── entities/      # Prisma entities
│   │   ├── services/      # Business logic
│   │   └── controllers/   # HTTP controllers
│   ├── orders/            # Orders module
│   ├── reviews/           # Reviews & ratings module
│   ├── chat/              # Chat/WebSocket module
│   ├── payments/          # Stripe integration
│   ├── disputes/          # Dispute resolution
│   ├── notifications/     # Notification system
│   ├── categories/        # Categories management
│   └── partners/          # Partner Portal integration
└── prisma/
    └── schema.prisma      # Database schema
```

### Background Jobs & Queues
- **Queue System:** Bull/BullMQ + Redis
- **Job Types:**
  - **Email Notifications Queue** (priority: high)
  - **Push Notifications Queue** (priority: medium)
  - **Image Processing Queue** (portfolio uploads)
  - **Data Cleanup Queue** (scheduled, weekly)
  - **Webhook Retries Queue** (Stripe events)
  
### API Versioning
- **Base URL:** `/api/v1/`
- **Strategy:** URI versioning
- **Breaking Changes:** Require new version
- **Backward Compatibility:** Maintain at least 2 versions

---

## Admin Panel

### Technologies
- **Framework:** Refine (recommended by next.mdc rules)
- **Backend:** Uses main API endpoints
- **Access Control:** Role-based (admin only)

### Features
- User management (search, filter, ban, verify)
- Moderation queues (profiles, portfolio, reviews, disputes)
- Analytics dashboard (user growth, revenue, disputes)
- Bulk actions (approve/reject, category management)
- Audit logging UI

---

## Partner Portal

### Technologies
- **Framework:** Refine + Next.js
- **Purpose:** Separate application for partner stores
- **Backend:** Uses main API with partner-specific endpoints

### Features
- Partner store registration
- QR code scanner for contractor validation
- Discount configuration by subscription tier
- Transaction history
- Usage statistics

---

## Infrastructure

### Containerization
- **Docker** - containerization
- **Docker Compose** - local development & production orchestration
- **Nginx** - reverse proxy, load balancing, SSL termination

### CI/CD
- **GitHub Actions** - automated testing and deployment
- **Deployment Strategy:**
  - Frontend: Vercel (or AWS/DigitalOcean)
  - Backend: AWS/DigitalOcean
  - Database: Managed PostgreSQL (AWS RDS / DigitalOcean Managed DB)

---

## External Services

### 1. Authentication & Verification
- **Stripe Identity** - document verification (mandatory for contractors)
- **OAuth Providers:** Google Sign-In, Apple Sign-In

### 2. Payments
- **Stripe** - payment processing, subscriptions, Customer Portal
- **Features:** Cards, Apple Pay, Google Pay, ACH transfers (Canada)
- **Security:** PCI DSS compliant, 3D Secure (SCA), webhook verification

### 3. Maps & Geolocation
- **Google Maps API** - maps display, geocoding, radius search
- **PostGIS** - PostgreSQL extension for geospatial queries
- **Privacy:** Fuzzy location (±500m), district/city only publicly

### 4. Notifications
- **OneSignal** - email and push notifications
- **Channels:** In-App (Socket.io), Email (when offline), Push (if enabled)

### 5. File Storage
- **AWS S3** - file storage (avatars, portfolio images, documents)
- **CloudFront CDN** - content delivery network
- **Processing:** Image optimization, EXIF stripping, virus scanning

### 6. AI & Support
- **OpenAI API (GPT-4)** - AI-powered support chatbot
- **Fallback:** Email escalation for unresolved queries

### 7. Monitoring & Error Tracking
- **Sentry** - error tracking and performance monitoring
- **Google Analytics** - web analytics
- **Mixpanel / Amplitude** - product analytics (optional)

---

## Security Implementation

### Authentication
- **JWT Tokens:** 15-min access token, 7-day refresh token
- **Storage:** HTTP-only cookies (secure, SameSite=Strict)
- **Email Verification:** Mandatory before activation
- **2FA/MFA:** Optional (TOTP-based)
- **Password Hashing:** bcrypt (cost factor 12) or Argon2

### API Protection
- **Rate Limiting** (@nestjs/throttler):
  - Global: 100 requests/min per IP
  - Auth endpoints: 5 requests/min (login, register, password reset)
  - Chat/messaging: 20 messages/min per user
  - Order creation: 10 requests/hour per user
  - Profile updates: 5 requests/hour per user
  - File uploads: 10 uploads/hour per user
- **CORS:** Whitelist only (production domains)
- **Helmet.js:** Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- **CSRF Protection:** Token-based for state-changing operations
- **Request Limits:** 10MB max payload size

### Data Protection
- **Encryption at Rest:** PostgreSQL TDE (Transparent Data Encryption)
- **Encryption in Transit:** TLS 1.3 (HTTPS everywhere)
- **Field-level Encryption:** AES-256 for sensitive data (credit cards, SIN numbers)
- **PII Masking in Logs:**
  - Emails: `u***@example.com`
  - Phones: `***-***-1234`
  - Never log: passwords, tokens, credit cards, SIN numbers

### Input Validation
- **Backend:** class-validator + class-transformer (NestJS DTOs)
  - `whitelist: true` - strip unknown properties
  - `forbidNonWhitelisted: true` - throw error on unknown properties
  - `transform: true` - automatic type conversion
- **Frontend:** Zod schemas for all forms
- **SQL Injection:** Prevented by ORM parameterized queries (Prisma)
- **XSS Protection:** Input sanitization (DOMPurify for HTML)
- **File Upload Validation:**
  - MIME type whitelist: `image/jpeg`, `image/png`, `image/webp`
  - File size limit: 5MB per image
  - Virus scanning: ClamAV or cloud service
  - EXIF metadata stripping

### Content Moderation
- **Automatic Moderation Service:**
  - Block phone numbers (regex patterns)
  - Block email addresses (regex)
  - Block external links (except platform URLs)
  - Block social media handles (`@instagram`, `@telegram`, `@whatsapp`)
  - Profanity filter (Canadian English + French)
- **Implementation:**
  - Configurable regex patterns
  - Return moderation flags (phone, email, link, social)
  - Replace blocked content with `***` or `[removed]`
  - Log moderation events for analytics
- **Rate Limiting for Content:**
  - Messages: 20 per minute per user
  - Orders: 10 per hour per user
  - Profile updates: 5 per hour per user
- **Report/Flag System:**
  - Users can report inappropriate content
  - Auto-suspend after threshold (3 reports)
  - Admin review queue
  - Track repeat offenders

---

## PIPEDA Compliance (Canada)

### Data Minimization
- Collect only necessary data
- Document purpose for each data field
- Mark optional fields explicitly

### PII Protection in Logs
- Never log: passwords, tokens, credit cards, SIN numbers
- Mask emails: `u***@example.com`
- Mask phone numbers: `***-***-1234`
- Use correlation IDs instead of user IDs in logs

### User Rights Endpoints
- **Right to Access:** `GET /api/v1/users/me/export` - export all data (JSON/PDF)
- **Right to Rectification:** `PATCH /api/v1/users/me` - update profile
- **Right to Erasure:** `DELETE /api/v1/users/me` - full account deletion + anonymization
- **Right to Data Portability:** `GET /api/v1/users/me/data-portability` - machine-readable export

### Encryption
- **Database:** PostgreSQL TDE (encryption at rest)
- **Transport:** TLS 1.3 (HTTPS only)
- **Sensitive Fields:** AES-256 field-level encryption (credit cards, SIN)

### Data Retention Policies
- **Chat messages:** 90 days after order completion (then read-only)
- **Audit logs:** 90 days minimum
- **Payment records:** 7 years (Canadian tax law)
- **User profiles:** Until account deletion
- **Anonymous reviews:** Kept after account deletion (user ID removed)

### Audit Logging
- Log all data access and modifications
- Log authentication attempts (success and failures)
- Log admin actions (moderation, user management)
- Never log sensitive data in audit trails

### Data Breach Response
- **Notification:** Within 72 hours to affected users
- **Reporting:** Notify Privacy Commissioner of Canada if serious
- **Documentation:** Incident response plan prepared
- **Prevention:** Regular security audits

### Privacy Documentation
- **Privacy Policy** (English + French)
- **Terms of Service** (English + French)
- **Cookie Consent Management**
- **List of Third-party Data Processors:**
  - Stripe (payments, identity verification)
  - Google Maps (geolocation)
  - OneSignal (notifications)
  - AWS S3 (file storage)
  - OpenAI (AI support)
  - Sentry (error tracking)

---

## Testing & Quality Assurance

### Testing Strategy

**Backend Testing:**
- **Unit Tests:** Jest for each service/controller
- **Integration Tests:** Supertest for API endpoints
- **E2E Tests:** Test each API module end-to-end
- **Smoke Tests:** `/admin/test` endpoint for each controller
- **Coverage Target:** 80%+ for critical code

**Frontend Testing:**
- **Unit Tests:** Jest for complex utilities and hooks
- **Component Tests:** React Testing Library (NOT Enzyme)
- **Integration Tests:** Critical user flows (registration, order creation, payment)
- **Accessibility Tests:** jest-axe for a11y compliance
- **E2E Tests:** Playwright or Cypress for full flows
- **Coverage Target:** 80%+ on critical paths

### Critical Paths to Test
1. **Payment Flows:**
   - Successful payment
   - Failed payment (card declined)
   - Refund processing
   - Subscription payment
2. **Dispute Resolution:**
   - Open dispute
   - Upload evidence
   - Admin decision
   - Fund distribution
3. **Subscription Management:**
   - Upgrade/downgrade
   - Payment failure
   - Cancellation
   - Feature gating
4. **Notification Delivery:**
   - In-app notifications
   - Email delivery
   - Push notifications
5. **QR Code System:**
   - Generation
   - Validation
   - Expiration
   - Discount calculation

### Code Quality Tools
- **ESLint + Prettier** - code formatting
- **Husky** - pre-commit hooks
- **lint-staged** - staged files linting
- **Commitlint** - commit message conventions
- **SonarQube / CodeQL** - static code analysis
- **Snyk / Dependabot** - dependency vulnerability scanning

### Performance Testing
- **k6 or Artillery** - load testing
- **Lighthouse CI** - frontend performance
- **Database Query Analysis** - slow query monitoring

---

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# API: http://localhost:3000
# Frontend: http://localhost:3001
# Admin: http://localhost:3002
# Database: localhost:5432
# Redis: localhost:6379
```

### Code Review Checklist
- [ ] Code follows project conventions (nest.mdc / next.mdc rules)
- [ ] Security best practices applied
- [ ] Performance optimizations considered
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] TypeScript types properly defined
- [ ] Tests written for new features
- [ ] No `console.log` or debug code
- [ ] Comments explain "why", not "what"
- [ ] Documentation updated if needed

---

## Performance Optimization

### Frontend
- **Code Splitting:** Route-based automatic splitting (Next.js App Router)
- **Lazy Loading:** `dynamic()` for heavy components (maps, charts)
- **Image Optimization:** Always use `next/image` component
- **Bundle Analysis:** Regular `npm run analyze`
- **Caching:** React Query stale-while-revalidate strategy

### Backend
- **Database Optimization:**
  - Indexes on frequently queried fields
  - Connection pooling (Prisma)
  - Query optimization (avoid N+1)
- **Caching Strategy:**
  - Redis for frequently accessed data
  - Cache invalidation on updates
  - TTL-based expiration
- **API Performance:**
  - Pagination for large datasets
  - Response compression (gzip)
  - CDN for static assets

---

## Monitoring & Observability

### Structured Logging
- **Library:** Winston or Pino
- **Format:** JSON structured logs
- **Levels:** error, warn, info, debug
- **Correlation IDs:** For request tracking across services

### Error Tracking
- **Sentry Integration:**
  - Capture unhandled exceptions
  - Add context (user, request, environment)
  - Alert on critical errors
  - Track error trends

### Performance Monitoring
- **APM Tools:** New Relic or DataDog (optional)
- **Metrics to Track:**
  - API response times
  - Database query performance
  - WebSocket connection stability
  - Queue job processing times
  - Error rates by endpoint

### Health Checks
- **Endpoints:**
  - `GET /health` - basic health check
  - `GET /health/db` - database connectivity
  - `GET /health/redis` - Redis connectivity
  - `GET /health/storage` - S3 connectivity

---

## Scalability Considerations

### Horizontal Scaling
- **API:** Stateless design allows multiple instances
- **Frontend:** Static deployment (Vercel Edge Network)
- **Database:** Read replicas for heavy read operations
- **Redis:** Redis Cluster for distributed caching
- **File Storage:** CDN distribution (CloudFront)

### Load Balancing
- **Production Options:**
  - AWS Application Load Balancer (ALB)
  - DigitalOcean Load Balancer
  - Cloudflare (DDoS protection + CDN)

---

## Cost Optimization

### Estimated Monthly Costs (MVP Phase)

**Infrastructure:**
- **Server:** $50-100/month (DigitalOcean/AWS)
- **Database:** $30-50/month (Managed PostgreSQL)
- **Redis:** $15-30/month (Managed Redis)
- **CDN:** $10-50/month (CloudFront/Cloudflare)

**External Services:**
- **Stripe:** 2.9% + $0.30 per transaction
- **Google Maps API:** ~$200/month (10k requests/day)
- **OneSignal:** Free tier (up to 10k subscribers)
- **OpenAI API:** ~$50-100/month (support bot)
- **Sentry:** Free tier (5k events/month)

**Total Estimated:** $355-530/month + transaction fees

---

## Migration Strategy

### Phase 1: MVP (Months 1-3)
- Core functionality only
- Single server deployment
- Basic monitoring

### Phase 2: Growth (Months 4-6)
- Add advanced features (Partner Portal, AI moderation)
- Implement horizontal scaling
- Enhanced monitoring and analytics

### Phase 3: Scale (Months 7-12)
- Kubernetes orchestration (optional)
- Multi-region deployment
- Advanced caching strategies
- Mobile apps (React Native)

---

## References

- **Next.js Rules:** `.cursor/rules/next.mdc`
- **NestJS Rules:** `.cursor/rules/nest.mdc`
- **Technical Specification:** `docs/TS.md`
- **Deployment Guide:** `docs/DEPLOYMENT.md`
- **Security Docs:** `docs/security.md`
- **API Docs (Geolocation):** `docs/api/geolocation.md`
- **API Docs (OneSignal):** `docs/api/onesignal.md`
- **API Docs (Verification):** `docs/api/verification.md`
- **Module Docs (Chat):** `docs/modules/chat.md`
- **Module Docs (Rating):** `docs/modules/rating.md`
- **Module Docs (Partner Portal):** `docs/modules/Partner Portal.md`
- **SEO Configuration:** `docs/configs/SEO.md`

---

**Last Updated:** October 24, 2025
**Status:** ✅ Complete and aligned with nest.mdc and next.mdc rules

