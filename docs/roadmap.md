# Hummii Platform - Roadmap разработки

> **Version:** 1.0  
> **Last Updated:** November 2, 2025  
> **Status:** Активная разработка

---

## 📊 Текущее состояние проекта

### Реализованные модули (30%)

| Модуль | Статус | Покрытие тестами | Документация |
|--------|--------|------------------|--------------|
| **Auth Module** | ✅ Завершён | 85% | ✅ Полная |
| **Users Module** | ✅ Завершён | 82% | ✅ Полная |
| **Admin Module** | ✅ Завершён | 78% | ✅ Полная |
| **Infrastructure** | ✅ Завершён | - | ✅ Полная |

**Infrastructure включает:**
- Core (filters, guards, interceptors)
- Shared (Prisma, Email, Audit)
- Rate Limiting
- Security Headers (Helmet)
- CORS Configuration
- Logging (Winston)
- API Versioning

---

## 🚀 Критический путь к MVP (Phase 1-3)

### Phase 1: Foundation ✅ (Завершено)

**Цель:** Инфраструктура и базовая аутентификация

- [x] Docker infrastructure
- [x] PostgreSQL + Prisma setup
- [x] Redis integration
- [x] Authentication (JWT + HTTP-only cookies)
- [x] User management (CRUD + PIPEDA endpoints)
- [x] Admin panel API
- [x] Security setup (Helmet, CORS, Rate Limiting)
- [x] Audit logging foundation

**Результат:** Пользователи могут регистрироваться и авторизовываться

---

### Phase 2: Core Business Logic 🔄 (В разработке - 0%)

**Цель:** Основной функционал платформы (заказы, отклики, портфолио)

**Приоритет:** КРИТИЧЕСКИЙ

#### 2.1 Orders Module (High Priority) 🔴

**Зависимости:** Users, Auth

**Функционал:**
- [ ] CRUD для заказов (черновики, публикация, редактирование)
- [ ] Жизненный цикл заказа (7 статусов)
  - `draft` → `published` → `in_progress` → `pending_review` → `completed`
  - `cancelled`, `disputed`
- [ ] Фильтрация и поиск заказов
- [ ] Отклики исполнителей на заказы
- [ ] Принятие/отклонение откликов клиентом
- [ ] Notifications integration (при создании, принятии заказа)

**Endpoints:**
```typescript
POST   /api/v1/orders                    // Create order (draft)
GET    /api/v1/orders                    // List orders (with filters)
GET    /api/v1/orders/:id                // Get order details
PATCH  /api/v1/orders/:id                // Update order
DELETE /api/v1/orders/:id                // Delete order (draft only)
POST   /api/v1/orders/:id/publish        // Publish order
POST   /api/v1/orders/:id/cancel         // Cancel order
POST   /api/v1/orders/:id/responses      // Create response (contractor)
GET    /api/v1/orders/:id/responses      // Get responses (client)
POST   /api/v1/orders/:id/accept/:responseId  // Accept response
```

**Тестирование:** 80%+ coverage

**Документация:** API spec + flow diagrams

**Срок:** 2 недели

---

#### 2.2 Portfolio Module (High Priority) 🔴

**Зависимости:** Users

**Функционал:**
- [ ] CRUD для портфолио (max 10 работ, 5 фото на работу)
- [ ] Загрузка изображений (S3 integration)
- [ ] Image optimization (resize to 1024x1024, compress)
- [ ] AI модерация (NSFW detection)
- [ ] Ручная модерация администратором
- [ ] Публичное отображение портфолио

**Endpoints:**
```typescript
POST   /api/v1/portfolio                 // Add portfolio item
GET    /api/v1/portfolio/:userId         // Get user portfolio
PATCH  /api/v1/portfolio/:id             // Update portfolio item
DELETE /api/v1/portfolio/:id             // Delete portfolio item
POST   /api/v1/portfolio/:id/images      // Upload images
DELETE /api/v1/portfolio/:id/images/:imageId // Delete image
```

**S3 Configuration:**
- Bucket: `hummii-portfolio`
- Permissions: Public read, authenticated write
- CDN: CloudFront

**Тестирование:** 75%+ coverage

**Срок:** 1.5 недели

---

#### 2.3 Categories Module (Medium Priority) 🟡

**Зависимости:** None

**Функционал:**
- [ ] Иерархическая структура категорий (category → subcategory)
- [ ] CRUD для категорий (Admin only)
- [ ] Выбор категорий исполнителем (max 5, зависит от subscription)
- [ ] Фильтрация по категориям
- [ ] i18n support (EN + FR)

**Endpoints:**
```typescript
GET    /api/v1/categories               // Get category tree
GET    /api/v1/categories/:id           // Get category details
POST   /api/v1/admin/categories         // Create category (admin)
PATCH  /api/v1/admin/categories/:id     // Update category (admin)
DELETE /api/v1/admin/categories/:id     // Delete category (admin)
```

**Database Schema:**
```typescript
model Category {
  id          String   @id @default(cuid())
  parentId    String?  @map("parent_id")
  nameEn      String   @map("name_en")
  nameFr      String   @map("name_fr")
  slug        String   @unique
  icon        String?
  description String?
  order       Int      @default(0)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
}
```

**Срок:** 1 неделя

---

### Phase 3: Communication & Trust 🔄 (Следующая - 0%)

**Цель:** Чат, отзывы, рейтинг, верификация

**Приоритет:** ВЫСОКИЙ

#### 3.1 Chat Module (High Priority) 🔴

**Зависимости:** Orders, Users

**Функционал:**
- [ ] WebSocket gateway (Socket.io)
- [ ] Real-time messaging (только текст, max 2000 символов)
- [ ] Chat rooms (private между клиентом и исполнителем)
- [ ] Message history (постоянное хранение до удаления аккаунта)
- [ ] Read receipts (доставлено/прочитано)
- [ ] Typing indicator
- [ ] Edit message (5 минут после отправки)
- [ ] Автоматическая модерация контента
- [ ] Redis для online status

**WebSocket Events:**
```typescript
// Client → Server
socket.emit('send_message', { orderId, content })
socket.emit('typing', { orderId })
socket.emit('read_messages', { orderId })

// Server → Client
socket.on('new_message', { message })
socket.on('user_typing', { userId })
socket.on('messages_read', { orderId, readAt })
```

**Endpoints (REST fallback):**
```typescript
GET    /api/v1/chat/:orderId/messages   // Get message history
POST   /api/v1/chat/:orderId/messages   // Send message (fallback)
PATCH  /api/v1/chat/:orderId/messages/:id // Edit message
```

**Security:**
- JWT authentication для WebSocket connections
- Rate limiting: 20 messages/min per user
- Content moderation (phone, email, links, profanity)

**Срок:** 2 недели

---

#### 3.2 Reviews Module (High Priority) 🔴

**Зависимости:** Orders

**Функционал:**
- [ ] Двусторонняя система рейтинга
  - Клиенты оценивают исполнителей (4 критерия)
  - Исполнители оценивают клиентов (3 критерия)
- [ ] Текстовый комментарий (опционально, max 2000 символов)
- [ ] 14 дней на оставление отзыва
- [ ] Обе стороны оценивают одновременно (не видят оценку друг друга)
- [ ] Отзыв нельзя редактировать
- [ ] Публичный ответ на отзыв (один раз)
- [ ] Расчёт общего рейтинга (взвешенный)

**Rating Criteria:**

Клиент → Исполнитель:
- Quality of Work (1-5★)
- Professionalism (1-5★)
- Communication (1-5★)
- Value for Money (1-5★)

Исполнитель → Клиент:
- Communication (1-5★)
- Professionalism (1-5★)
- Payment (1-5★)

**Endpoints:**
```typescript
POST   /api/v1/reviews/:orderId          // Submit review
GET    /api/v1/reviews/user/:userId      // Get user reviews
POST   /api/v1/reviews/:reviewId/reply   // Reply to review
GET    /api/v1/reviews/:reviewId         // Get review details
```

**Weighted Rating Formula:**
```typescript
overallRating = (averageRating * 0.7) + (experienceScore * 0.2) + (verificationBonus * 0.1)

experienceScore = Math.min(completedOrders / 100, 1) * 5
verificationBonus = isVerified ? 0.5 : 0
```

**Срок:** 1.5 недели

---

#### 3.3 Verification Module (Medium Priority) 🟡

**Зависимости:** Users

**Функционал:**
- [ ] Stripe Identity integration
- [ ] Верификация канадских документов (Driver's License, Passport, Provincial ID)
- [ ] Webhook: `verification.session.completed`
- [ ] Обновление статуса верификации в БД
- [ ] "Verified" badge на профиле
- [ ] Verification Guard (защита определённых endpoint'ов)
- [ ] Expiration reminder (2 года)

**Endpoints:**
```typescript
POST   /api/v1/verification/create-session  // Create Stripe Identity session
GET    /api/v1/verification/status          // Get verification status
POST   /api/v1/verification/webhook         // Stripe webhook handler
```

**Срок:** 1 неделя

---

### Phase 4: Payments & Disputes 💳 (Планируется)

**Цель:** Финансовые транзакции и разрешение споров

**Приоритет:** КРИТИЧЕСКИЙ (блокирует запуск)

#### 4.1 Payments Module (Critical) 🔴

**Зависимости:** Orders, Users

**Функционал:**
- [ ] Stripe PaymentIntents integration
- [ ] Escrow mechanism (заморозка средств до завершения)
- [ ] Выплаты исполнителям (Stripe Connect или Transfer)
- [ ] Комиссия платформы (вычитается автоматически)
- [ ] Refunds (при спорах)
- [ ] 3D Secure (SCA)
- [ ] Webhook handlers (payment_intent.succeeded, etc.)
- [ ] Idempotency keys
- [ ] Transaction history

**Endpoints:**
```typescript
POST   /api/v1/payments/create-intent      // Create payment intent
POST   /api/v1/payments/confirm             // Confirm payment
POST   /api/v1/payments/refund              // Refund payment (admin/dispute)
GET    /api/v1/payments/history             // Transaction history
POST   /api/v1/payments/webhook             // Stripe webhook
GET    /api/v1/payments/balance             // User balance
POST   /api/v1/payments/withdraw            // Withdraw funds (contractor)
```

**См. детали:** `docs/modules/payments.md` (будет создан)

**Срок:** 3 недели

---

#### 4.2 Disputes Module (Critical) 🔴

**Зависимости:** Orders, Payments

**Функционал:**
- [ ] Открытие спора (любая сторона)
- [ ] Загрузка доказательств (фото, скриншоты)
- [ ] Заморозка средств
- [ ] Админ-панель для рассмотрения споров
- [ ] Типы решений (FULL_REFUND, FULL_PAYMENT, PARTIAL, BLOCK_USER)
- [ ] SLA: 3-5 рабочих дней
- [ ] Уведомления обеим сторонам
- [ ] История споров пользователя

**Lifecycle:**
```
OPENED → UNDER_REVIEW → AWAITING_RESPONSE → RESOLVED → CLOSED
```

**Endpoints:**
```typescript
POST   /api/v1/disputes/:orderId           // Open dispute
GET    /api/v1/disputes/:disputeId         // Get dispute details
POST   /api/v1/disputes/:id/evidence       // Upload evidence
GET    /api/v1/disputes/my                 // My disputes
POST   /api/v1/admin/disputes/:id/resolve  // Resolve dispute (admin)
```

**Срок:** 2 недели

---

### Phase 5: Subscriptions & Partner Portal 💼 (Планируется)

**Цель:** Монетизация и партнёрская программа

**Приоритет:** СРЕДНИЙ (можно запустить MVP без этого)

#### 5.1 Subscriptions Module 🟡

**Зависимости:** Payments, Users

**Функционал:**
- [ ] Stripe Subscriptions integration
- [ ] Subscription tiers (Basic Free, Standard, Professional, Advanced)
- [ ] Feature gating based on subscription
- [ ] @SubscriptionGuard decorator
- [ ] Webhook handlers (subscription lifecycle)
- [ ] Proration при upgrade/downgrade
- [ ] Subscription reminders (7, 3, 1 день до истечения)
- [ ] Analytics (MRR, churn rate)

**Tiers:**
```typescript
Basic (Free):       Max 3 categories
Standard ($19/mo):  5 categories, 5% partner discounts
Professional ($39/mo): Unlimited categories, 10% discounts, priority listing
Advanced ($99/mo):  All features, 15% discounts, featured profile, no platform fee
```

**Срок:** 2 недели

---

#### 5.2 Partners Module (QR Codes) 🟡

**Зависимости:** Subscriptions

**Функционал:**
- [ ] QR code generation (time-limited, 15 минут)
- [ ] QR signature verification
- [ ] Partner Portal API
- [ ] Discount validation endpoint
- [ ] Usage tracking
- [ ] Partner management (регистрация, профиль)
- [ ] Статистика использования скидок

**Endpoints:**
```typescript
POST   /api/v1/partners/qr/generate        // Generate QR code (contractor)
POST   /api/v1/partners/qr/validate        // Validate QR code (partner)
GET    /api/v1/partners/qr/history         // QR usage history
POST   /api/v1/partners/register           // Register partner
GET    /api/v1/partners/dashboard          // Partner dashboard data
```

**Срок:** 1.5 недели

---

### Phase 6: Advanced Features 🚀 (Опционально)

**Приоритет:** НИЗКИЙ (после запуска MVP)

#### 6.1 Notifications Module 🟢

**Зависимости:** Все предыдущие модули

**Функционал:**
- [ ] OneSignal integration
- [ ] Multi-channel delivery (In-App, Email, Push)
- [ ] Notification priorities (HIGH, MEDIUM, LOW)
- [ ] User preferences (per-channel toggles)
- [ ] Notification history
- [ ] Rate limiting (max 50/day per user)
- [ ] Templates with i18n

**Срок:** 2 недели

---

#### 6.2 Geolocation Module 🟢

**Зависимости:** Users, Orders

**Функционал:**
- [ ] Google Maps API integration
- [ ] PostGIS для поиска по радиусу
- [ ] Fuzzy location (±500м) для конфиденциальности
- [ ] Геокодирование адресов
- [ ] Поиск исполнителей на карте
- [ ] Фильтр по радиусу (5км, 10км, 25км)

**Срок:** 1.5 недели

---

## 📈 Timeline

### Q4 2025 (Ноябрь - Декабрь)

**Ноябрь:**
- Week 1-2: Orders Module ✅
- Week 3: Portfolio Module ✅
- Week 4: Categories Module ✅

**Декабрь:**
- Week 1-2: Chat Module ✅
- Week 3: Reviews Module ✅
- Week 4: Verification Module ✅

### Q1 2026 (Январь - Март)

**Январь:**
- Week 1-3: Payments Module ✅
- Week 4: Testing & Bug fixes

**Февраль:**
- Week 1-2: Disputes Module ✅
- Week 3-4: Subscriptions Module ✅

**Март:**
- Week 1-2: Partners Module ✅
- Week 3: Notifications Module ✅
- Week 4: Final testing

### MVP Launch Target: End of March 2026

**Post-MVP (Q2 2026):**
- Geolocation Module
- Performance optimization
- Mobile app development
- Marketing & user acquisition

---

## 🔗 Зависимости между модулями

```
Infrastructure (Core, Shared)
    ↓
Auth + Users + Admin
    ↓
Categories (независимый)
    ↓
Orders ← Portfolio
    ↓
Chat + Reviews + Verification (параллельно)
    ↓
Payments
    ↓
Disputes
    ↓
Subscriptions
    ↓
Partners (QR Codes)
    ↓
Notifications + Geolocation (независимые)
```

---

## ✅ Definition of Done для каждого модуля

Модуль считается завершённым, когда:

- [x] Все endpoint'ы реализованы
- [x] DTOs с валидацией (class-validator)
- [x] Swagger документация
- [x] Unit tests (75%+ coverage для core logic)
- [x] E2E tests для критических flow
- [x] Error handling (все исключения обрабатываются)
- [x] Audit logging (для PIPEDA compliance)
- [x] Security review (rate limiting, validation, authorization)
- [x] Performance tested (response time < 200ms для простых запросов)
- [x] Documentation updated (README, API spec)

---

## 🎯 MVP Minimum Feature Set

**Для запуска MVP необходимы:**

✅ Phase 1: Foundation (DONE)
🔄 Phase 2: Core Business Logic (IN PROGRESS)
🔄 Phase 3: Communication & Trust (NEXT)
🔴 Phase 4: Payments & Disputes (CRITICAL)

**Можно отложить после MVP:**
- Phase 5: Subscriptions (можно запустить всех на Free tier)
- Phase 5: Partners (QR Codes)
- Phase 6: Advanced notifications
- Phase 6: Geolocation (можно использовать простой поиск по городу)

---

## 📊 Метрики успеха

**Технические метрики:**
- API response time < 200ms (p95)
- Test coverage > 75%
- Zero critical security vulnerabilities
- Uptime > 99.5%

**Бизнес-метрики (после запуска):**
- Time to first order < 5 минут
- Order completion rate > 80%
- User satisfaction (reviews) > 4.0★
- Dispute rate < 5%

---

**Last updated:** November 2, 2025  
**Next review:** Weekly на standup meetings

