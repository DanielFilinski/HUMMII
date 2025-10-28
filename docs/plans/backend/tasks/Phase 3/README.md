# Phase 3: Orders Module

**Статус:** 📋 Готово к реализации
**Приоритет:** 🔴 CRITICAL
**Длительность:** 2 недели (Week 7-8)
**Зависимости:** Phase 0 ✅, Phase 1 ✅, Phase 2 ✅

---

## 📄 Документы

### Основной файл задач
- **[phase-3-tasks.md](./phase-3-tasks.md)** - Полный список задач с примерами кода (9 секций, 70+ задач)

---

## 🎯 Ключевые deliverables

### 1. Order Lifecycle Management
- 7 статусов: draft → published → in_progress → pending_review → completed/cancelled/disputed
- Status transition validation
- Timestamps (publishedAt, startedAt, completedAt)
- Notifications on status changes

### 2. Order Types
- **Public orders** - Receive proposals from any contractor
- **Direct orders** - Send to specific contractor
- Order creation with geolocation
- Rate limiting (10 orders/hour)

### 3. Proposal System
- Contractors submit proposals (price, message, estimated days)
- Client views all proposals
- Accept/reject proposals
- Auto-assign contractor on acceptance
- One proposal per contractor per order
- Rate limiting (20 proposals/hour)

### 4. Search & Filtering
- Text search (title, description)
- Category filtering
- Budget range filtering
- Geospatial radius search (PostGIS)
- Sorting (date, budget, distance)
- Pagination (max 100 per page)

### 5. Authorization & Security
- Order owner validation (OrderOwnerGuard)
- Proposal owner validation
- Role-based access (CLIENT/CONTRACTOR)
- Precise location hidden for unauthorized users
- PII protection in responses

---

## 📊 Структура модуля

```
api/src/orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── proposals.controller.ts
├── proposals.service.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order.dto.ts
│   ├── create-proposal.dto.ts
│   ├── update-proposal.dto.ts
│   ├── search-orders.dto.ts
│   └── update-order-status.dto.ts
├── entities/
│   ├── order.entity.ts
│   └── proposal.entity.ts
├── guards/
│   ├── order-owner.guard.ts
│   └── proposal-owner.guard.ts
└── constants/
    └── status-transitions.ts
```

---

## 🔄 Order Status Flow

```
1. draft
   ↓ (publish)
2. published ───────────────────┐
   ↓ (accept proposal)          │
3. in_progress                  │ (cancel)
   ↓ (submit for review)        │
4. pending_review               │
   ↓ (approve)                  │
5. completed                    │
                                ↓
6. cancelled (final)

   dispute (from in_progress or pending_review)
   ↓
7. disputed
   ↓ (admin resolves)
   completed or cancelled
```

---

## 🔒 Security Highlights

- ✅ Order owner validation enforced
- ✅ Proposal owner validation enforced
- ✅ Role-based access control (CLIENT/CONTRACTOR)
- ✅ Precise location hidden for unauthorized users
- ✅ Rate limiting (10 orders/hour, 20 proposals/hour)
- ✅ Status transition validation
- ✅ Input validation with class-validator
- ✅ SQL injection prevention (Prisma)

---

## 📈 Testing Requirements

### Unit Tests (80%+ coverage)
- OrdersService tests (15+ test cases)
- ProposalsService tests (10+ test cases)
- Status transition validation
- Search & filtering logic

### E2E Tests
- Order lifecycle (create → publish → accept → complete)
- Proposal flow (submit → accept/reject)
- Search & filtering
- Authorization enforcement
- Rate limiting verification

### Performance Tests
- Geospatial search performance (PostGIS)
- Search with large datasets
- Pagination efficiency

---

## 🗺️ PostGIS Integration

### Geospatial Queries

```sql
-- Find orders within radius
SELECT o.*,
  ST_Distance(o.location::geography, ST_MakePoint(lng, lat)::geography) / 1000 AS distance
FROM "Order" o
WHERE ST_DWithin(
  o.location::geography,
  ST_MakePoint(lng, lat)::geography,
  radius * 1000
)
ORDER BY distance ASC;
```

### Features
- Radius search (km)
- Distance calculation
- Sort by distance
- Combine with filters (category, budget)

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

# Test order creation
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need plumber for bathroom repair",
    "description": "Looking for a licensed plumber...",
    "type": "public",
    "categoryId": "...",
    "budget": 500,
    "location": { "lat": 45.5017, "lng": -73.5673 },
    "address": "1234 Main St, Montreal, QC"
  }'
```

---

## 📚 Related Documentation

- [Stack_EN.md](../../../../Stack_EN.md) - Tech stack overview
- [roadmap.md](../../roadmap.md) - Full backend roadmap
- [.claude/backend/nestjs-guide.md](../../../../../.claude/backend/nestjs-guide.md) - NestJS patterns

---

## ✅ Definition of Done

Phase 3 считается завершенным когда:

- [ ] Все endpoints работают корректно
- [ ] Order lifecycle management функционирует (7 statuses)
- [ ] Proposal system работает
- [ ] Public/direct orders supported
- [ ] Search & filtering работает (text, category, location)
- [ ] Geospatial search (PostGIS) функционирует
- [ ] Status transitions validated
- [ ] Authorization enforced (order owner, contractor)
- [ ] Notifications sent on status changes
- [ ] Rate limiting active
- [ ] Unit tests pass (80%+ coverage)
- [ ] E2E tests pass
- [ ] Security audit пройден
- [ ] Documentation обновлена
- [ ] Code review completed

---

**Previous Phase:** [Phase 2: User Management](../Phase%202/)
**Next Phase:** Phase 4: Chat Module (Real-time Communication)

---

**Created:** January 2025
**Status:** Ready for implementation
