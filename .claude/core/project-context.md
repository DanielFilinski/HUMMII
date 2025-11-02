# Контекст проекта Hummii

> **О проекте, архитектуре и текущем статусе**
> **Версия:** 1.0 | **Обновлено:** 27 октября 2025

---

## 📋 Оглавление

1. [Обзор проекта](#обзор-проекта)
2. [Текущий статус](#текущий-статус)
3. [Архитектура](#архитектура)
4. [Tech Stack](#tech-stack)
5. [Структура проекта](#структура-проекта)
6. [Ключевые модули](#ключевые-модули)
7. [Внешние сервисы](#внешние-сервисы)

---

## 🎯 Обзор проекта

### Что такое Hummii?

**Hummii** - современная платформа-маркетплейс для поиска и найма исполнителей (contractors) в Канаде.

### Целевой рынок
🇨🇦 **Канада** - со всеми вытекающими требованиями:
- PIPEDA compliance (Canadian Privacy Law)
- Двуязычность (English + French)
- CAD валюта
- Canadian payment methods

### Ценностное предложение

1. **Для клиентов:**
   - Поиск проверенных исполнителей по геолокации
   - Система рейтингов и отзывов
   - Безопасные платежи через Stripe
   - Real-time чат с модерацией

2. **Для исполнителей:**
   - Верификация через Stripe Identity
   - Портфолио и профиль
   - Партнерская программа (скидки в магазинах)
   - Подписки с разными уровнями доступа

3. **Для партнеров:**
   - Интеграция через QR-коды
   - Скидки для исполнителей
   - Analytics и отчетность

### Ключевые stakeholders

| Роль | Описание |
|------|----------|
| **CLIENT** | Покупатели услуг |
| **CONTRACTOR** | Поставщики услуг (проверенные) |
| **ADMIN** | Модераторы и менеджеры платформы |
| **PARTNER** | Retail магазины (партнеры) |

---

## 📊 Текущий статус

### Фаза проекта
**🔧 Планирование и конфигурация** - основные приложения еще не реализованы

### Что готово ✅

| Компонент | Статус | Детали |
|-----------|--------|--------|
| **Docker infrastructure** | ✅ Готово | `docker-compose.yml`, `docker-compose.prod.yml` |
| **CI/CD pipelines** | ✅ Настроено | GitHub Actions (`.github/workflows/`) |
| **Документация** | ✅ Полная | 9 файлов, 3,121 строка |
| **Environment config** | ✅ Готово | `.env.example` (251 строка) |
| **Cursor AI rules** | ✅ Готово | `.cursor/rules/` (4 файла) |
| **Project structure** | ✅ Создана | Все директории на месте |

### Что в разработке ⏳

| Компонент | Статус | Приоритет |
|-----------|--------|-----------|
| **API (NestJS)** | ⏳ Пустая директория | Высокий |
| **Frontend (Next.js)** | ⏳ Пустая директория | Высокий |
| **Admin (Refine)** | ⏳ Пустая директория | Средний |

### Следующие шаги

**MVP Phase 1:** (Приоритет: ВЫСОКИЙ)
1. Инициализировать NestJS backend с Prisma
2. Настроить аутентификацию (JWT)
3. Реализовать User management
4. Создать базовый frontend (Next.js App Router)
5. Интегрировать Stripe для платежей

**MVP Phase 2:**
6. Реализовать систему заказов
7. Добавить real-time chat (Socket.io)
8. Интегрировать Google Maps (геолокация)
9. Добавить систему рейтингов
10. Создать admin panel (Refine)

**📖 Подробный план:** [`docs/plan.md`](../../docs/plan.md)

---

## 🏗️ Архитектура

### High-level обзор

```
┌─────────────────┐
│   Cloudflare    │  CDN + DDoS Protection
└────────┬────────┘
         │
┌────────▼────────┐
│     Nginx       │  Reverse Proxy + SSL/TLS
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┬──────────────┐
    │          │              │              │
┌───▼───┐  ┌──▼──┐      ┌────▼─────┐   ┌───▼────┐
│  API  │  │ WS  │      │ Frontend │   │ Admin  │
│ :3000 │  │:3000│      │  :3001   │   │ :3002  │
└───┬───┘  └──┬──┘      └──────────┘   └────────┘
    │         │
    └────┬────┘
         │
    ┌────┴──────┬───────────┬──────────┐
    │           │           │          │
┌───▼────┐  ┌──▼────┐  ┌───▼───┐  ┌──▼──┐
│ Postgres│  │ Redis │  │  S3   │  │ Ext │
│  :5432  │  │ :6379 │  │  CDN  │  │ APIs│
└─────────┘  └───────┘  └───────┘  └─────┘
```

### Микросервисная готовность

**Текущая архитектура:** Monolith (MVP)
**Будущее:** Микросервисы

**Запланированные сервисы:**
- `auth-service` - Аутентификация
- `user-service` - Управление пользователями
- `order-service` - Система заказов
- `chat-service` - Real-time коммуникация
- `payment-service` - Обработка платежей
- `notification-service` - Уведомления
- `search-service` - Поиск и фильтрация

---

## 🛠️ Tech Stack

### Backend (API)

**Основа:**
- **Framework:** NestJS (Progressive Node.js framework)
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 20+

**Database & ORM:**
- **Database:** PostgreSQL 15+ с PostGIS extension
- **ORM:** Prisma (type-safe, auto-migration)
- **Caching:** Redis 7+

**Real-time & Jobs:**
- **WebSocket:** Socket.io (real-time chat)
- **Jobs:** Bull/BullMQ с Redis
- **Cron:** @nestjs/schedule

**Storage:**
- **Files:** AWS S3
- **CDN:** CloudFront

**API Docs:**
- **Swagger/OpenAPI** (auto-generated)

### Frontend (User-facing)

**Основа:**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Runtime:** React 18+

**Styling:**
- **CSS Framework:** Tailwind CSS
- **Components:** Shadcn/ui или Chakra UI

**State Management:**
- **Global UI:** Zustand (theme, preferences)
- **Server State:** React Query / TanStack Query
- **Forms:** React Hook Form + Zod

**Real-time:**
- **WebSocket:** Socket.io-client
- **Maps:** Google Maps API

**i18n:**
- **Library:** next-intl (English + French)

### Admin Panel

**Framework:**
- **Refine** (React-based admin framework)
- **Integration:** Next.js
- **Access:** Role-based (admin only)

### Infrastructure

**Containerization:**
- **Docker** (Alpine Linux base)
- **Docker Compose** (dev & prod)

**CI/CD:**
- **GitHub Actions**
  - Lint & format checks
  - Unit tests + coverage
  - Security scanning (CodeQL, Snyk, Trivy)
  - Dependency auditing

**Deployment:**
- **Options:** AWS / DigitalOcean / Vercel
- **Database:** AWS RDS / DO Managed DB
- **Reverse Proxy:** Nginx + Let's Encrypt

**📖 Полный стек:** [`docs/Stack_EN.md`](../../docs/Stack_EN.md) (537 строк)

---

## 📂 Структура проекта

```
Hummii/
├── .github/                    # CI/CD workflows
│   ├── workflows/
│   │   ├── ci.yml             # Основной CI pipeline
│   │   └── security.yml       # Security scans
│   └── dependabot.yml
│
├── .cursor/                   # Cursor AI rules
│   └── rules/
│       ├── config.mdc         # Language rules (alwaysApply)
│       ├── mamory.mdc         # Project context (alwaysApply)
│       ├── nest.mdc           # NestJS standards
│       └── next.mdc           # Next.js standards
│
├── .claude/                   # Claude Code guides (НОВОЕ)
│   ├── INDEX.md               # Navigator
│   ├── core/                  # Критичные правила
│   ├── backend/               # Backend guides
│   ├── frontend/              # Frontend guides
│   └── ops/                   # Operations guides
│
├── api/                       # Backend (NestJS) ⏳ ПУСТО
│   ├── src/
│   │   ├── core/              # Global infrastructure
│   │   ├── shared/            # Shared utilities
│   │   ├── auth/              # Authentication
│   │   ├── users/             # User management
│   │   ├── orders/            # Order system
│   │   ├── chat/              # Real-time messaging
│   │   └── prisma/            # Database schema
│   └── test/
│
├── frontend/                  # User app (Next.js) ⏳ ПУСТО
│   ├── app/                   # App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── hooks/                 # Custom hooks
│
├── admin/                     # Admin panel (Refine) ⏳ ПУСТО
│   ├── app/
│   └── components/
│
├── docker/                    # Docker configs ✅
│   ├── api.Dockerfile
│   ├── frontend.Dockerfile
│   ├── admin.Dockerfile
│   └── postgres/init.sql
│
├── docs/                      # Documentation ✅
│   ├── Stack_EN.md            # PRIMARY tech reference
│   ├── TS.md                  # Technical spec (Russian)
│   ├── DEPLOYMENT.md
│   ├── security.md
│   ├── modules/               # Feature specs
│   └── api/                   # API integration guides
│
├── docker-compose.yml         # Dev environment ✅
├── docker-compose.prod.yml    # Prod environment ✅
├── .env.example               # Environment template (251 lines) ✅
├── start.sh                   # Quick start script ✅
├── CLAUDE.md                  # Original guide (will be updated)
├── SECURITY_BEST_PRACTICES.md # Security guide (2800+ lines) ✅
└── README.md                  # Project overview ✅
```

### Ключевые директории

| Путь | Назначение | Статус |
|------|-----------|--------|
| `/api/src/` | Backend business logic | ⏳ Пусто |
| `/frontend/app/` | Next.js pages (App Router) | ⏳ Пусто |
| `/admin/` | Admin dashboard | ⏳ Пусто |
| `/docs/` | Comprehensive documentation | ✅ Готово |
| `/.claude/` | Modular guides for Claude Code | ✅ Готово |
| `/.cursor/rules/` | Coding standards | ✅ Готово |
| `/docker/` | Container configs | ✅ Готово |

---

## 🔑 Ключевые модули

### 1. Authentication & Authorization
- JWT tokens (access 15min, refresh 7days)
- HTTP-only cookies
- OAuth2 (Google, Apple)
- Optional 2FA/MFA

**Эндпоинты:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

**📖 Детали:** [`backend/nestjs-guide.md#authentication`](../backend/nestjs-guide.md)

### 2. User Management
**Роли:** CLIENT, CONTRACTOR, ADMIN, PARTNER

**Верификация:**
- Email verification (обязательно)
- Phone verification (Twilio)
- Identity verification (Stripe Identity - для contractors)

**📖 Детали:** [`backend/nestjs-guide.md#user-management`](../backend/nestjs-guide.md)

### 3. Real-time Chat
- **Technology:** Socket.io
- **Features:** Text only, typing indicators, read receipts
- **Moderation:** Auto-filter (phones, emails, URLs, profanity)
- **Retention:** 90 days

**📖 Детали:** [`docs/modules/chat.md`](../../docs/modules/chat.md)

### 4. Payment Processing
- **Provider:** Stripe
- **Currency:** CAD
- **Methods:** Cards, Apple Pay, Google Pay, ACH
- **Features:** 3D Secure, subscriptions, refunds

**📖 Детали:** [`backend/nestjs-guide.md#payments`](../backend/nestjs-guide.md)

### 5. Geolocation & Search
- **Maps:** Google Maps API
- **Database:** PostGIS (PostgreSQL extension)
- **Features:** Radius search, distance calculation

**📖 Детали:** [`docs/api/geolocation.md`](../../docs/api/geolocation.md)

### 6. Rating & Review System
- **Algorithm:** Weighted scoring
- **Bidirectional:** Clients ↔ Contractors
- **Moderation:** Text review approval queue

**📖 Детали:** [`docs/modules/rating.md`](../../docs/modules/rating.md)

### 7. Order Management
**Lifecycle:**
```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED → PAID
                  ↓
              CANCELLED / DISPUTED
```

**📖 Детали:** [`backend/nestjs-guide.md#orders`](../backend/nestjs-guide.md)

### 8. Notifications
- **Provider:** OneSignal
- **Channels:** Email, Push, In-app
- **Priority:** HIGH / MEDIUM / LOW

**📖 Детали:** [`docs/api/onesignal.md`](../../docs/api/onesignal.md)

### 9. Partner Portal
- **Features:** QR codes, discounts, analytics
- **Integration:** API + Webhooks

**📖 Детали:** [`docs/modules/Partner Portal.md`](../../docs/modules/Partner%20Portal.md)

---

## 🌐 Внешние сервисы

### Обязательные (Required)

| Сервис | Назначение | Стоимость (месяц) |
|--------|-----------|-------------------|
| **Stripe** | Платежи + верификация | 2.9% + $0.30 per transaction |
| **Google Maps API** | Геолокация, autocomplete | ~$50-200 |
| **OneSignal** | Email + push уведомления | ~$50-100 |
| **Twilio Verify** | SMS верификация | ~$150-200 |

### Рекомендуемые

| Сервис | Назначение | Стоимость (месяц) |
|--------|-----------|-------------------|
| **Sentry** | Error tracking | ~$26 (Team plan) |
| **Google Analytics** | Analytics | Free |
| **hCaptcha** | Bot protection | Free (10k req/month) |

### Опциональные

| Сервис | Назначение | Стоимость (месяц) |
|--------|-----------|-------------------|
| **OpenAI GPT-4** | AI chatbot support | Pay-as-you-go |
| **ClamAV** | Virus scanning | Self-hosted (Free) |

### Всего: MVP стоимость

**Минимум:** ~$455-660/месяц + Stripe transaction fees

**📖 Детальная оценка:** [`docs/Stack_EN.md#cost-estimation`](../../docs/Stack_EN.md)

---

## 🔐 Security & Compliance

### PIPEDA (Canadian Privacy Law)

**Обязательные права пользователей:**
- ✅ Right to access (export data)
- ✅ Right to rectification (update data)
- ✅ Right to erasure (delete account)
- ✅ Right to data portability

**Эндпоинты:**
- `GET /api/v1/users/me/data` - Export all data
- `PATCH /api/v1/users/me` - Update data
- `DELETE /api/v1/users/me` - Delete account

**📖 Детали:** [`security-compliance.md`](security-compliance.md)

### Data Retention

| Тип данных | Период хранения | Причина |
|------------|-----------------|---------|
| Chat messages | 90 days | Business requirement |
| Payment records | 7 years | Canadian tax law |
| User accounts | Until deleted | User choice |
| Audit logs | 1 year minimum | Security requirement |

### Encryption

- **At rest:** PostgreSQL TDE
- **In transit:** TLS 1.3, HTTPS only
- **Field-level:** AES-256 for sensitive data

**📖 Детали:** [`SECURITY_BEST_PRACTICES.md`](../../SECURITY_BEST_PRACTICES.md)

---

## 📞 Связанные документы

### Для разработки

- [**Critical Rules**](critical-rules.md) - Обязательные правила
- [**Security & Compliance**](security-compliance.md) - PIPEDA, шифрование
- [**Backend Guide**](../backend/nestjs-guide.md) - NestJS паттерны
- [**Frontend Guide**](../frontend/nextjs-guide.md) - Next.js паттерны
- [**Development Guide**](../ops/development.md) - Setup, Docker
- [**Testing Guide**](../ops/testing.md) - Unit, E2E тесты

### Официальная документация

- [`docs/Stack_EN.md`](../../docs/Stack_EN.md) - Полный tech stack (PRIMARY)
- [`docs/TS.md`](../../docs/TS.md) - Техническое задание (Russian)
- [`docs/DEPLOYMENT.md`](../../docs/DEPLOYMENT.md) - Production deployment
- [`docs/security.md`](../../docs/security.md) - Security measures
- [`SECURITY_BEST_PRACTICES.md`](../../SECURITY_BEST_PRACTICES.md) - Comprehensive guide

### Модули

- [`docs/modules/chat.md`](../../docs/modules/chat.md) - Chat system design
- [`docs/modules/rating.md`](../../docs/modules/rating.md) - Rating algorithm
- [`docs/modules/Partner Portal.md`](../../docs/modules/Partner%20Portal.md) - Partner integration

---

## 🎯 Следующие действия

### Для Claude Code

**Когда начинаете работу:**
1. Всегда читайте [`critical-rules.md`](critical-rules.md) первым
2. Загружайте контекст для нужной области (Backend/Frontend/Ops)
3. Проверяйте security requirements для задачи
4. Следуйте coding standards из `.cursor/rules/`

**Documentation Strategy:**
- **NEVER create separate documentation files for routine tasks**
- For backend tasks: Update `docs/plans/backend/tasks/COMPLETED.md` with brief task entry
- Only create new docs for major features, architecture changes, or deployment guides
- At task completion: Provide commit message + COMPLETED.md entry

### Для новых разработчиков

**Quick start:**
1. Прочитайте [`critical-rules.md`](critical-rules.md)
2. Прочитайте этот файл (project-context.md)
3. Настройте окружение: [`../ops/development.md`](../ops/development.md)
4. Выберите свою область и читайте соответствующий guide

---

**Последнее обновление:** 2 ноября 2025
**Статус проекта:** Planning & Configuration Phase
**Следующая фаза:** MVP Phase 1 (Backend + Frontend initialization)
