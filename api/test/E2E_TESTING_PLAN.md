# 🎯 Comprehensive E2E Testing Plan - Hummii API

**Дата создания:** 13 ноября 2025
**Версия:** 1.0
**Статус:** В процессе реализации

---

## 📊 Executive Summary

### Текущее состояние (на 13.11.2025)

| Метрика | Значение |
|---------|----------|
| **Всего endpoints в API** | 228 |
| **Покрыто E2E тестами** | 73 (32%) |
| **Не покрыто** | 155 (68%) ❌ |
| **Существующих E2E файлов** | 11 |
| **Scenario тестов** | 4 |
| **Всего тест-кейсов** | 168 |

### Цель

**Достичь 95%+ покрытия всех endpoints E2E тестами** в соответствии с Postman коллекцией и бизнес-требованиями.

---

## 🚨 Priority 1: CRITICAL Missing Tests (Must Have)

### 1. **Payments Module** ⚠️ КРИТИЧНО
**Priority:** HIGHEST
**Endpoints:** 30 (оценка)
**Покрытие:** 0% ❌

**Файл:** `test/payments.e2e-spec.ts` (создать)

**Endpoints для тестирования:**
```typescript
// Payment Intents
POST   /payments/create-payment-intent
POST   /payments/confirm-payment
GET    /payments/:id
GET    /payments/history

// Escrow
POST   /payments/escrow/deposit
POST   /payments/escrow/release
POST   /payments/escrow/refund

// Stripe Webhooks
POST   /webhooks/stripe (payment_intent.succeeded)
POST   /webhooks/stripe (payment_intent.failed)
POST   /webhooks/stripe (charge.refunded)

// Payout (Contractor)
POST   /payments/payout/request
GET    /payments/payout/status
```

**Критичные сценарии:**
- ✅ Create payment intent для заказа
- ✅ Confirm payment (3D Secure flow)
- ✅ Escrow deposit при accept proposal
- ✅ Escrow release при order completion
- ✅ Refund при dispute resolution
- ✅ Webhook signature verification
- ✅ Idempotency key handling

**Риски:** Без этих тестов - риск потери денег пользователей!

---

### 2. **Contractors Module** 🔥 HIGH
**Priority:** HIGH
**Endpoints:** 15
**Покрытие:** 0% ❌

**Файл:** `test/contractors.e2e-spec.ts` (создать)

**Endpoints для тестирования:**
```typescript
// Contractor Profile
POST   /contractors/me
PATCH  /contractors/me
GET    /contractors/me
GET    /contractors/:id
PATCH  /contractors/me/location

// Portfolio
POST   /contractors/me/portfolio
GET    /contractors/me/portfolio
PATCH  /contractors/me/portfolio/:id
DELETE /contractors/me/portfolio/:id
POST   /contractors/me/portfolio/reorder
GET    /contractors/:id/portfolio

// Categories
POST   /contractors/me/categories
DELETE /contractors/me/categories/:id
GET    /contractors/me/categories

// Discovery
GET    /contractors/nearby (geolocation)
```

**Критичные сценарии:**
- ✅ Create complete contractor profile
- ✅ Add portfolio with image upload
- ✅ Assign multiple categories
- ✅ Nearby search (latitude/longitude)
- ✅ Portfolio reordering
- ✅ Public profile visibility

---

### 3. **Categories Module** 📁
**Priority:** HIGH
**Endpoints:** 10
**Покрытие:** 0% ❌

**Файл:** `test/categories.e2e-spec.ts` (создать)

**Endpoints для тестирования:**
```typescript
// Public
GET    /categories/tree
GET    /categories/popular
GET    /categories/public
GET    /categories/:id/subcategories
GET    /categories/:id/path

// Admin
POST   /categories (admin)
GET    /categories (admin)
GET    /categories/:id (admin)
PATCH  /categories/:id (admin)
DELETE /categories/:id (admin)
```

**Критичные сценарии:**
- ✅ Get category tree (hierarchy)
- ✅ Get popular categories (for homepage)
- ✅ Admin: Create parent category
- ✅ Admin: Create subcategory
- ✅ Admin: Delete category (check cascading)
- ✅ Get category path (breadcrumbs)

---

### 4. **File Upload Module** 📤
**Priority:** HIGH
**Endpoints:** ~10 (оценка)
**Покрытие:** 0% ❌

**Файл:** `test/file-upload.e2e-spec.ts` (создать)

**Endpoints для тестирования:**
```typescript
// User Avatar
POST   /users/me/avatar
DELETE /users/me/avatar

// Portfolio Images
POST   /contractors/me/portfolio/:id/images
DELETE /contractors/me/portfolio/:id/images/:imageId

// Dispute Evidence
POST   /disputes/:id/evidence (file upload)
DELETE /disputes/:id/evidence/:evidenceId
```

**Критичные сценарии:**
- ✅ Upload valid image (JPEG, PNG, WebP)
- ✅ Reject invalid MIME type
- ✅ Reject file > max size (5MB)
- ✅ EXIF data stripping (privacy)
- ✅ Image compression/optimization
- ✅ Multiple file upload (portfolio)
- ✅ S3/CloudFlare R2 integration

---

## 🔧 Priority 2: Expand Existing Tests (Moderate Coverage)

### 5. **Orders Module** (expand existing)
**Priority:** MEDIUM
**Current Coverage:** 20% (5/25 endpoints)
**Файл:** `test/orders.e2e-spec.ts` (расширить)

**Missing Endpoints:**
```typescript
PATCH  /orders/:id           // Update order
DELETE /orders/:id           // Delete order
GET    /orders/:id           // Get single order
PATCH  /orders/:id/status    // Advanced status changes
```

**Добавить тесты:**
- ✅ Complete order lifecycle (DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED)
- ✅ Order cancellation (CLIENT/CONTRACTOR)
- ✅ Delete draft order
- ✅ Cannot delete published order
- ✅ Search with complex filters
- ✅ Pagination

---

### 6. **Proposals Module** (expand existing)
**Priority:** MEDIUM
**Current Coverage:** ~30%
**Файл:** `test/proposals.e2e-spec.ts` (создать отдельный)

**Missing Endpoints:**
```typescript
GET    /orders/:orderId/proposals       // Get all proposals for order
POST   /proposals/:id/reject            // Reject proposal
PATCH  /proposals/:id                   // Update proposal
GET    /proposals/my-proposals          // Contractor's proposals
```

**Добавить тесты:**
- ✅ Submit multiple proposals from different contractors
- ✅ Client rejects proposal
- ✅ Contractor updates proposal before acceptance
- ✅ Cannot submit proposal for own order
- ✅ Get my proposals as contractor

---

### 7. **Verification Module** (Stripe Identity)
**Priority:** MEDIUM
**Endpoints:** 2
**Покрытие:** 0% ❌

**Файл:** `test/verification.e2e-spec.ts` (создать)

**Endpoints:**
```typescript
POST   /verification/create        // Create verification session
GET    /verification/status        // Get verification status
```

**Критичные сценарии:**
- ✅ Create Stripe Identity verification session
- ✅ Check verification status
- ✅ Handle verification.succeeded webhook

---

## 🎭 Priority 3: Scenario Tests (как в Postman)

### 8. **Add Missing Scenarios**
**Priority:** MEDIUM
**Файл:** `test/scenarios/` (добавить новые)

**Текущие сценарии:**
- ✅ health-check.scenario.spec.ts
- ✅ email-verification.scenario.spec.ts
- ✅ user-journey.scenario.spec.ts
- ✅ order-lifecycle.scenario.spec.ts

**Добавить из Postman коллекции:**

#### **Scenario 5: Contractor Setup** (создать)
**Файл:** `contractor-setup.scenario.spec.ts`
```typescript
describe('Contractor Setup Scenario', () => {
  // Step 1: Register as CONTRACTOR
  // Step 2: Login
  // Step 3: Create contractor profile
  // Step 4: Add portfolio item with image
  // Step 5: Assign categories
  // Step 6: Create subscription (BASIC)
  // Step 7: Verify profile is public
});
```

#### **Scenario 6: Subscription Management** (создать)
**Файл:** `subscription-management.scenario.spec.ts`
```typescript
describe('Subscription Management Scenario', () => {
  // Step 1: Login contractor
  // Step 2: Get current subscription
  // Step 3: Upgrade to ELITE
  // Step 4: Verify features unlocked
  // Step 5: Downgrade to PRO
  // Step 6: Cancel subscription
  // Step 7: Reactivate subscription
});
```

#### **Scenario 7: Review System Flow** (создать)
**Файл:** `review-system.scenario.spec.ts`
```typescript
describe('Review System Flow', () => {
  // Step 1: Complete order
  // Step 2: Client creates review (5 stars)
  // Step 3: Get review details
  // Step 4: Contractor responds to review
  // Step 5: Verify rating updated
  // Step 6: Get contractor statistics
});
```

#### **Scenario 8: Dispute Resolution** (создать)
**Файл:** `dispute-resolution.scenario.spec.ts`
```typescript
describe('Dispute Resolution Flow', () => {
  // Step 1: Client creates dispute
  // Step 2: Upload evidence (files)
  // Step 3: Contractor adds message
  // Step 4: Admin resolves dispute
  // Step 5: Verify refund processed
});
```

#### **Scenario 9: Chat Flow** (создать)
**Файл:** `chat-flow.scenario.spec.ts`
```typescript
describe('Chat Flow Scenario', () => {
  // Step 1: Contractor sends message
  // Step 2: Client receives message
  // Step 3: Client replies
  // Step 4: Edit message
  // Step 5: Mark messages as read
  // Step 6: Export chat history (PIPEDA)
});
```

#### **Scenario 10: Notifications Flow** (создать)
**Файл:** `notifications-flow.scenario.spec.ts`
```typescript
describe('Notifications Flow', () => {
  // Step 1: Login user
  // Step 2: Get notifications
  // Step 3: Get unread count
  // Step 4: Mark notification as read
  // Step 5: Mark all as read
  // Step 6: Update notification preferences
  // Step 7: Delete notification
});
```

#### **Scenario 11: Security & Error Handling** (создать)
**Файл:** `security-errors.scenario.spec.ts`
```typescript
describe('Security & Error Handling', () => {
  // Unauthorized access (401)
  // Invalid email format (400)
  // Weak password (400)
  // Wrong password (401)
  // Rate limiting (429)
  // SQL injection attempts (400/500)
  // XSS attempts (sanitized)
});
```

#### **Scenario 12: Payment Flow** (создать) ⚠️ CRITICAL
**Файл:** `payment-flow.scenario.spec.ts`
```typescript
describe('Complete Payment Flow', () => {
  // Step 1: Client accepts proposal
  // Step 2: Create payment intent (Stripe)
  // Step 3: Confirm payment (3D Secure)
  // Step 4: Escrow deposit verified
  // Step 5: Contractor completes order
  // Step 6: Escrow released to contractor
  // Step 7: Verify payout
});
```

---

## 📁 File Structure Plan

```
api/test/
├── scenarios/                           # Scenario tests (E2E user journeys)
│   ├── health-check.scenario.spec.ts            ✅ Exists
│   ├── email-verification.scenario.spec.ts      ✅ Exists
│   ├── user-journey.scenario.spec.ts            ✅ Exists
│   ├── order-lifecycle.scenario.spec.ts         ✅ Exists
│   ├── contractor-setup.scenario.spec.ts        🆕 CREATE
│   ├── subscription-management.scenario.spec.ts 🆕 CREATE
│   ├── review-system.scenario.spec.ts           🆕 CREATE
│   ├── dispute-resolution.scenario.spec.ts      🆕 CREATE
│   ├── chat-flow.scenario.spec.ts               🆕 CREATE
│   ├── notifications-flow.scenario.spec.ts      🆕 CREATE
│   ├── security-errors.scenario.spec.ts         🆕 CREATE
│   ├── payment-flow.scenario.spec.ts            🆕 CREATE (CRITICAL)
│   ├── jest-scenarios.json                      ✅ Exists
│   ├── setup.ts                                 ✅ Exists
│   └── README.md                                ✅ Exists
│
├── auth.e2e-spec.ts                    ✅ Exists (73% coverage)
├── users.e2e-spec.ts                   ✅ Exists (40% coverage)
├── admin.e2e-spec.ts                   ✅ Exists (65% coverage)
├── orders.e2e-spec.ts                  ✅ Exists (20% coverage) - EXPAND
├── chat.e2e-spec.ts                    ✅ Exists (70% coverage)
├── reviews.e2e-spec.ts                 ✅ Exists (67% coverage)
├── disputes.e2e-spec.ts                ✅ Exists (60% coverage)
├── subscriptions.e2e-spec.ts           ✅ Exists (70% coverage)
├── notifications.e2e-spec.ts           ✅ Exists (67% coverage)
├── seo-analytics.e2e-spec.ts           ✅ Exists (70% coverage)
├── rate-limiting.e2e-spec.ts           ✅ Exists
│
├── payments.e2e-spec.ts                🆕 CREATE (CRITICAL)
├── contractors.e2e-spec.ts             🆕 CREATE (HIGH)
├── categories.e2e-spec.ts              🆕 CREATE (HIGH)
├── file-upload.e2e-spec.ts             🆕 CREATE (HIGH)
├── proposals.e2e-spec.ts               🆕 CREATE (MEDIUM)
├── verification.e2e-spec.ts            🆕 CREATE (MEDIUM)
├── geolocation.e2e-spec.ts             🆕 CREATE (LOW)
└── webhooks.e2e-spec.ts                🆕 CREATE (LOW)
```

---

## 🎯 Implementation Phases

### **Phase 1: Critical Missing Tests** (Week 1-2)
**Priority:** CRITICAL
**Estimated:** 40 hours

1. ✅ Create `payments.e2e-spec.ts` (16 hours)
   - Payment intents
   - Escrow flows
   - Webhook handling
   - Refunds

2. ✅ Create `contractors.e2e-spec.ts` (12 hours)
   - Profile CRUD
   - Portfolio management
   - Categories assignment
   - Nearby search

3. ✅ Create `categories.e2e-spec.ts` (6 hours)
   - Public endpoints
   - Admin management

4. ✅ Create `file-upload.e2e-spec.ts` (6 hours)
   - Avatar upload
   - Portfolio images
   - Evidence files

---

### **Phase 2: Expand Existing Tests** (Week 3)
**Priority:** MEDIUM
**Estimated:** 20 hours

5. ✅ Expand `orders.e2e-spec.ts` (4 hours)
   - Add missing endpoints
   - Complete workflows

6. ✅ Create `proposals.e2e-spec.ts` (6 hours)
   - Full proposal lifecycle

7. ✅ Create `verification.e2e-spec.ts` (4 hours)
   - Stripe Identity flows

8. ✅ Add missing tests to existing files (6 hours)

---

### **Phase 3: Scenario Tests** (Week 4)
**Priority:** MEDIUM
**Estimated:** 24 hours

9. ✅ Create `payment-flow.scenario.spec.ts` (6 hours) - CRITICAL
10. ✅ Create `contractor-setup.scenario.spec.ts` (3 hours)
11. ✅ Create `subscription-management.scenario.spec.ts` (3 hours)
12. ✅ Create `review-system.scenario.spec.ts` (2 hours)
13. ✅ Create `dispute-resolution.scenario.spec.ts` (3 hours)
14. ✅ Create `chat-flow.scenario.spec.ts` (2 hours)
15. ✅ Create `notifications-flow.scenario.spec.ts` (2 hours)
16. ✅ Create `security-errors.scenario.spec.ts` (3 hours)

---

### **Phase 4: Integration & CI/CD** (Week 5)
**Priority:** LOW
**Estimated:** 8 hours

17. ✅ Update GitHub Actions workflow
18. ✅ Add E2E test coverage reporting
19. ✅ Create test data seeding scripts
20. ✅ Documentation updates

---

## 📊 Success Metrics

### Target Coverage (after completion)

| Module | Current | Target | Status |
|--------|---------|--------|--------|
| Payments | 0% | 95% | 🔴 Critical |
| Contractors | 0% | 95% | 🔴 High |
| Categories | 0% | 90% | 🔴 High |
| File Upload | 0% | 90% | 🔴 High |
| Orders | 20% | 95% | 🟡 Medium |
| Proposals | 30% | 90% | 🟡 Medium |
| Auth | 73% | 95% | 🟢 Good |
| Users | 40% | 90% | 🟡 Medium |
| Admin | 65% | 90% | 🟢 Good |
| Chat | 70% | 90% | 🟢 Good |
| Reviews | 67% | 90% | 🟢 Good |
| Disputes | 60% | 90% | 🟡 Medium |
| Subscriptions | 70% | 95% | 🟢 Good |
| Notifications | 67% | 90% | 🟢 Good |
| SEO/Analytics | 70% | 85% | 🟢 Good |
| **OVERALL** | **32%** | **≥95%** | 🔴 **In Progress** |

### Quality Metrics

- ✅ All critical payment flows covered
- ✅ All Postman scenarios automated
- ✅ 95%+ endpoint coverage
- ✅ CI/CD integration
- ✅ < 5 min total test execution time
- ✅ All tests passing on main branch

---

## 🛠️ Testing Best Practices

### 1. Test Isolation
```typescript
beforeEach(async () => {
  // Clean database
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});

  // Create fresh test data
  testUser = await createTestUser();
});
```

### 2. Descriptive Test Names
```typescript
// ✅ Good
it('should reject payment if card is declined', ...)

// ❌ Bad
it('test payment', ...)
```

### 3. Test Edge Cases
```typescript
describe('Payment Edge Cases', () => {
  it('should handle insufficient funds');
  it('should handle expired card');
  it('should handle network timeout');
  it('should prevent double payment (idempotency)');
});
```

### 4. Use Test Helpers
```typescript
// test/helpers/test-helpers.ts
export async function createTestOrder(prisma, userId) {
  return await prisma.order.create({
    data: {
      title: 'Test Order',
      userId,
      status: 'DRAFT',
    },
  });
}
```

### 5. Clean Up Resources
```typescript
afterAll(async () => {
  // Delete Stripe test objects
  if (testPaymentIntentId) {
    await stripe.paymentIntents.cancel(testPaymentIntentId);
  }

  await prisma.$disconnect();
  await app.close();
});
```

---

## 📝 Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';

describe('ModuleName E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Setup: Create test user and login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /endpoint', () => {
    it('should do something successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/endpoint')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          field: 'value',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.field).toBe('value');
    });

    it('should return 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post('/endpoint')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          field: '', // Invalid
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/endpoint')
        .send({
          field: 'value',
        })
        .expect(401);
    });
  });
});
```

---

## 🔗 References

- **Existing E2E Tests:** `/root/Garantiny_old/HUMMII/api/test/`
- **Scenario Tests:** `/root/Garantiny_old/HUMMII/api/test/scenarios/`
- **Postman Collection:** `/root/Garantiny_old/HUMMII/docs/postman collection/Hummii-API-with-Scenarios.postman_collection.json`
- **API Controllers:** `/root/Garantiny_old/HUMMII/api/src/**/**.controller.ts`

---

## 📞 Questions & Support

**Contact:** Daniel Filinski
**Email:** admin@hummii.ca
**Documentation:** `/docs/`

---

**Last Updated:** 13 ноября 2025
**Status:** 🟡 In Progress
**Next Review:** After Phase 1 completion
