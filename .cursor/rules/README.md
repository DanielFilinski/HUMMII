# Cursor AI Rules - Hummii Project

> **Structure and organization of AI assistant rules**
> **Updated:** October 27, 2025

## Rule Structure

### Always Applied Rules (`alwaysApply: true`)

These rules are **always active** regardless of context:

| File | Description | Priority |
|------|-------------|----------|
| **`config.mdc`** | Language & communication rules | HIGH |
| **`mamory.mdc`** | Project context and Canadian market requirements | HIGH |
| **`core-critical.mdc`** | Critical TypeScript, code quality, and security rules | CRITICAL |
| **`core-security.mdc`** | Security, PIPEDA compliance, and data protection | CRITICAL |

### Context-Aware Rules (`alwaysApply: false`)

These rules activate based on file patterns:

| File | Auto-Trigger | Description |
|------|-------------|-------------|
| **`nest.mdc`** | `api/**/*.ts`, `api/**/*.js` | NestJS backend coding standards |
| **`next.mdc`** | `frontend/**/*`, `admin/**/*` | Next.js frontend coding standards |
| **`ops-development.mdc`** | `*.md`, `docker-compose*.yml`, `Dockerfile`, `.env*` | Development and operations guide |
| **`ops-testing.mdc`** | `*.spec.ts`, `*.test.ts`, `*.e2e-spec.ts` | Testing strategies and best practices |

## Rule Hierarchy

```
┌─────────────────────────────────────┐
│  Always Applied (Critical)          │
│  ├── config.mdc                     │
│  ├── mamory.mdc                     │
│  ├── core-critical.mdc              │
│  └── core-security.mdc              │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Context-Aware (Auto-triggered)     │
│  ├── nest.mdc (Backend)             │
│  ├── next.mdc (Frontend)            │
│  ├── ops-development.mdc (Ops)      │
│  └── ops-testing.mdc (Testing)      │
└─────────────────────────────────────┘
```

## Quick Reference

### When working on Backend (NestJS)
- ✅ `core-critical.mdc` (always)
- ✅ `core-security.mdc` (always)
- ✅ `nest.mdc` (auto: when editing `api/**/*.ts`)

### When working on Frontend (Next.js)
- ✅ `core-critical.mdc` (always)
- ✅ `core-security.mdc` (always)
- ✅ `next.mdc` (auto: when editing `frontend/**/*` or `admin/**/*`)

### When writing tests
- ✅ `core-critical.mdc` (always)
- ✅ `ops-testing.mdc` (auto: when editing `*.spec.ts` or `*.test.ts`)

### When working with Docker/DevOps
- ✅ `core-critical.mdc` (always)
- ✅ `ops-development.mdc` (auto: when editing Docker files or `.env`)

## Key Rules Summary

### Language Rules (from `config.mdc`)
- **Code:** English
- **Documentation (.md, .txt):** Russian
- **Chat:** Russian
- **Internet search:** 2025 data only

### TypeScript Rules (from `core-critical.mdc`)
- ❌ **NEVER** use `any` type
- ✅ Always declare explicit types
- ✅ Use `unknown` for truly unknown types
- ✅ Strict mode enabled

### Security Rules (from `core-security.mdc`)
- ✅ PIPEDA compliance mandatory (Canada)
- ✅ HTTP-only cookies for tokens (NEVER localStorage)
- ✅ bcrypt cost 12+ for password hashing
- ✅ Parameterized queries (Prisma ORM)
- ✅ Rate limiting on all endpoints
- ✅ PII masking in logs

### Documentation Rules (from `config.mdc` and `core-critical.mdc`)
- ❌ **NEVER** create separate documentation files for routine tasks
- ✅ Update `docs/plans/backend/tasks/COMPLETED.md` with brief task entry
- ✅ Only create new docs for major features or architecture changes
- ✅ At task completion: Provide commit message + COMPLETED.md entry

### Before Every Command
- Describe what command will do
- Indicate what will be affected
- Warn about risks if any

## Related Documentation

### Core Documentation (`docs/`)

**Project Planning:**
- `docs/roadmap.md` - **NEW** - Complete roadmap with module dependencies and timeline
- `docs/TS.md` - Technical specification (main reference)

**Module Documentation:**
- `docs/modules/payments.md` - **NEW** - Stripe integration (Escrow, Connect, webhooks)
- `docs/modules/background-jobs.md` - **NEW** - Bull/BullMQ queues with retry policies
- `docs/modules/chat.md` - **UPDATED** - WebSocket security & reconnection logic
- `docs/modules/rating.md` - Reviews and rating system
- `docs/modules/Partner Portal.md` - QR codes and partner discounts

**API Documentation:**
- `docs/api/geolocation.md` - **NEW** - PostGIS + privacy-preserving location

**Security & Compliance:**
- `docs/security/audit-logging.md` - **NEW** - PIPEDA-compliant audit trail
- `docs/security.md` - General security guidelines

### Quick Links to New Features

**Backend developers should review:**
1. `docs/roadmap.md` - Know what to build and when
2. `docs/modules/payments.md` - Payment flows and escrow
3. `docs/security/audit-logging.md` - What events to log
4. `.cursor/rules/nest.mdc` - **UPDATED** with AI moderation, Guards examples, i18n

**DevOps should review:**
1. `.cursor/rules/ops-development.mdc` - **UPDATED** with Monitoring & Observability
2. `docs/roadmap.md` - Infrastructure requirements per phase

**All developers should know:**
- Stripe Connect setup (payments.md)
- PIPEDA audit logging requirements (audit-logging.md)
- WebSocket security patterns (chat.md)
- PostGIS privacy logic (geolocation.md)

## Recent Updates (November 2, 2025)

### Documentation Added
- ✅ **roadmap.md** - 6 phases, module dependencies, timeline to MVP
- ✅ **payments.md** - Escrow mechanism, Stripe Connect, webhook handlers
- ✅ **audit-logging.md** - AuditAction enum, retention policies, PIPEDA compliance
- ✅ **background-jobs.md** - 5 queue types, retry policies, concurrency limits
- ✅ **geolocation.md** - PostGIS queries, fuzzy location (±500m), radius search

### Rules Updated
- ✅ **nest.mdc** - Added AI Moderation (AWS Rekognition), Guards examples, Backend i18n
- ✅ **ops-development.mdc** - Added Monitoring & Observability (Sentry, Grafana, APM)
- ✅ **chat.md** - Added WebSocket security, reconnection logic, offline messages

## Rule Updates

When updating rules:
1. Keep files focused (< 2000 lines recommended)
2. Update this README if structure changes
3. Test rule activation with relevant file patterns
4. Document breaking changes
5. **NEW:** Reference detailed specs in `docs/` directory instead of duplicating in rules

## Critical Reminders

### For Backend Development
- ❌ **NEVER** use `any` type (use `unknown` instead)
- ✅ **ALWAYS** log audit events for PIPEDA compliance
- ✅ **ALWAYS** use HTTP-only cookies for tokens
- ✅ **ALWAYS** verify Stripe webhook signatures
- ✅ **ALWAYS** implement rate limiting (see nest.mdc)
- ✅ **ALWAYS** mask PII in logs (see audit-logging.md)

### For Frontend Development
- ❌ **NEVER** store tokens in localStorage (XSS vulnerability)
- ✅ **ALWAYS** validate input on both client and server
- ✅ **ALWAYS** implement proper error boundaries
- ✅ **ALWAYS** use next/image for optimization
- ✅ **ALWAYS** implement loading states

### For Security
- ✅ Review `docs/security/audit-logging.md` for events to log
- ✅ Review `docs/modules/payments.md` for secure payment handling
- ✅ Review `core-security.mdc` for PIPEDA requirements
- ✅ Implement content moderation (see nest.mdc AI Moderation section)

---

**Last updated:** November 2, 2025
**Maintainer:** AI Assistant Configuration
**Status:** Production-ready documentation

