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

### Before Every Command
- Describe what command will do
- Indicate what will be affected
- Warn about risks if any

## Related Documentation

For detailed guides, see `.claude/` directory:
- `.claude/INDEX.md` - Navigation guide
- `.claude/core/` - Core project rules
- `.claude/backend/` - Backend-specific guides
- `.claude/frontend/` - Frontend-specific guides
- `.claude/ops/` - Operations guides

## Rule Updates

When updating rules:
1. Keep files focused (< 2000 lines recommended)
2. Update this README if structure changes
3. Test rule activation with relevant file patterns
4. Document breaking changes

---

**Last updated:** October 27, 2025
**Maintainer:** AI Assistant Configuration

