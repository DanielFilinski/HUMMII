# Phase 2: User Management Module

**Статус:** 📋 Готово к реализации
**Приоритет:** 🔴 CRITICAL
**Длительность:** 2 недели (Week 5-6)
**Зависимости:** Phase 0 ✅, Phase 1 ✅

---

## 📄 Документы

### Основной файл задач
- **[phase-2-unified.md](./phase-2-unified.md)** - ✅ Unified comprehensive plan (RECOMMENDED)
- [phase-2-tasks.md](./phase-2-tasks.md) - Legacy (объединен в unified)
- [phase-2-user-management.md](./phase-2-user-management.md) - Legacy (объединен в unified)

---

## 🎯 Ключевые deliverables

### 1. User Profile Management
- GET/PATCH `/api/v1/users/me` - Управление профилем
- Rate limiting (5 requests/hour для обновлений)
- Audit logging для всех изменений

### 2. File Upload System
- Avatar upload с S3 integration
- File validation (MIME, size, EXIF stripping)
- Image optimization and resizing
- Max 5MB per file

### 3. Contractor Profile
- Extended profile for contractors
- Portfolio management (max 10 items)
- Services & pricing setup
- Category assignment (max 5 categories)
- License upload and management

### 4. Geolocation & Privacy
- PostGIS integration
- Fuzzy location (±500m for privacy)
- Precise address sharing (only after order acceptance)
- Radius search for contractors

### 5. Stripe Identity Verification
- Document verification flow
- Webhook handling
- Verification badges
- User marked as verified

### 6. PII Protection
- Field-level encryption (AES-256)
- Audit logging for all mutations
- PII masking in logs
- PIPEDA compliance

### 7. Role Switching
- Switch between CLIENT ↔ CONTRACTOR
- Auto-create contractor profile
- Regenerate JWT with new role

---

## 📊 Структура модуля

```
api/src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── update-profile.dto.ts
│   ├── update-contractor-profile.dto.ts
│   ├── create-contractor-profile.dto.ts
│   ├── add-portfolio-item.dto.ts
│   ├── add-service.dto.ts
│   ├── add-license.dto.ts
│   └── update-location.dto.ts
├── entities/
│   ├── user.entity.ts
│   ├── profile.entity.ts
│   └── contractor.entity.ts
├── decorators/
│   └── current-user.decorator.ts
└── guards/
    ├── profile-owner.guard.ts
    └── contractor-verified.guard.ts

api/src/shared/file-upload/
├── file-upload.module.ts
├── file-upload.service.ts
└── interceptors/
    └── file-validation.interceptor.ts

api/src/verification/
├── verification.module.ts
├── verification.controller.ts
└── verification.service.ts
```

---

## 🔒 Security Highlights

- ✅ File upload validation (MIME, size, EXIF)
- ✅ AES-256 encryption for sensitive fields
- ✅ PII masking in all logs
- ✅ Fuzzy location (±500m) for public display
- ✅ Precise address only after order acceptance
- ✅ Rate limiting on all endpoints
- ✅ Audit logging for all mutations
- ✅ Stripe Identity verification integration

---

## 📈 Testing Requirements

### Unit Tests (80%+ coverage)
- UsersService tests (15+ test cases)
- FileUploadService tests
- VerificationService tests

### E2E Tests
- Profile management flow
- Contractor profile setup
- Portfolio CRUD operations
- File uploads (avatar, portfolio)
- Geolocation (update, search)
- Role switching

### Security Tests
- File upload validation
- Authorization enforcement
- PII protection
- Rate limiting verification

---

## 🚀 Quick Start

```bash
# Start Docker services
docker compose up -d

# Generate Prisma Client
pnpm run prisma:generate

# Run migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

---

## 📚 Related Documentation

- [Stack_EN.md](../../../../Stack_EN.md) - Tech stack overview
- [security.md](../../../../security.md) - Security requirements
- [SECURITY_BEST_PRACTICES.md](../../../../../SECURITY_BEST_PRACTICES.md) - Security guidelines
- [.claude/backend/nestjs-guide.md](../../../../../.claude/backend/nestjs-guide.md) - NestJS patterns

---

## ✅ Definition of Done

Phase 2 считается завершенным когда:

- [ ] Все endpoints работают корректно
- [ ] User profile management функционирует
- [ ] Contractor profile system работает
- [ ] Portfolio management работает (max 10 items)
- [ ] File upload (S3) работает
- [ ] Geolocation (PostGIS + fuzzy) работает
- [ ] Stripe Identity verification интегрирована
- [ ] PII protection реализована
- [ ] Audit logging работает
- [ ] Unit tests pass (80%+ coverage)
- [ ] E2E tests pass
- [ ] Security audit пройден
- [ ] Documentation обновлена
- [ ] Code review completed

---

**Next Phase:** [Phase 3: Orders Module](../Phase%203/)

---

**Created:** January 2025
**Status:** Ready for implementation
