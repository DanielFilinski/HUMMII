# 🧪 Стратегия Тестирования API Hummii

## 📊 Текущее Состояние Проекта

### Статистика API
- **Модули**: 15+ функциональных модулей
- **Контроллеры**: 21 контроллер
- **Эндпоинты**: ~185 REST API endpoints
- **Swagger документация**: ✅ Полностью документирована
- **WebSocket**: ✅ Реализован для чата и уведомлений

### Покрытие Тестами
- **Unit тесты**: 19 файлов (*.service.spec.ts)
- **E2E тесты**: 11 файлов (*.e2e-spec.ts)
- **Integration тесты**: 3 файла
- **Целевое покрытие**: 70%+ (настроено в jest.config.js)

---

## 🎯 Рекомендуемая Стратегия Тестирования

### 1. Автоматическое Тестирование (ПРИОРИТЕТ №1) ✅

**Преимущества:**
- ✅ Быстрая регрессионная проверка
- ✅ Покрытие критических путей
- ✅ Интеграция в CI/CD
- ✅ Повторяемые тесты
- ✅ Тестирование изоляции

**Что уже есть:**

#### Unit Tests (Быстрые, изолированные)
```bash
# Запуск unit тестов
cd /root/Garantiny_old/HUMMII/api
npm run test:unit

# С покрытием
npm run test:cov

# В watch режиме
npm run test:watch
```

Покрыто unit тестами:
- ✅ Auth Service (регистрация, логин, токены)
- ✅ Users Service (CRUD, экспорт данных)
- ✅ Admin Service (управление пользователями)
- ✅ Orders Service (создание, обновление заказов)
- ✅ Proposals Service (предложения подрядчиков)
- ✅ Reviews Service (отзывы и рейтинги)
- ✅ Subscriptions Service (подписки Stripe)
- ✅ Notifications Service (уведомления)
- ✅ Disputes Service (споры)
- ✅ Contractors Service (профили подрядчиков)
- ✅ Categories Service (категории услуг)
- ✅ Analytics Service (аналитика)
- ✅ SEO Services (slug, metadata)
- ✅ Chat Content Moderation (модерация контента)
- ✅ Email Service (отправка писем)
- ✅ Audit Service (логирование действий)

#### E2E Tests (Полная интеграция)
```bash
# Запуск E2E тестов
npm run test:e2e

# С watch режимом
npm run test:e2e:watch

# Все тесты (unit + e2e)
npm run test:all
```

Покрыто E2E тестами:
- ✅ Auth Flow (регистрация → верификация → логин → refresh → logout)
- ✅ Users (профиль, обновление, экспорт PIPEDA, удаление)
- ✅ Admin (управление пользователями, роли, блокировка, аудит)
- ✅ Orders (создание, публикация, статусы)
- ✅ Proposals (создание, принятие, отклонение)
- ✅ Chat (сообщения, редактирование, экспорт)
- ✅ Reviews (создание, ответы, жалобы)
- ✅ Subscriptions (создание, upgrade/downgrade, отмена)
- ✅ Disputes (создание, доказательства, сообщения)
- ✅ Notifications (получение, прочтение, настройки)
- ✅ Rate Limiting (защита от перегрузки)
- ✅ SEO & Analytics (slug, tracking)

#### Integration Tests (Жизненные циклы)
- ✅ Order Lifecycle (полный цикл заказа от создания до завершения)
- ✅ Subscription Features (функции подписок)
- ✅ User Profile (работа с профилем)

### 2. Ручное Тестирование через Postman (ПРИОРИТЕТ №2) ✅

**Преимущества:**
- ✅ Визуальный интерфейс
- ✅ Легко тестировать edge cases
- ✅ Сохранение тестовых данных
- ✅ Экспорт/импорт коллекций

**Что доступно:**
- 📦 Готовая Postman коллекция: `docs/postman collection/Hummii-API.postman_collection.json` (3086 строк)
- 🌍 Environment файл: `docs/postman collection/Hummii-API-Environment.postman_environment.json`
- 📚 Документация: `docs/postman collection/README.md`

**Как использовать:**
```bash
# 1. Импортируйте в Postman оба файла:
#    - Hummii-API.postman_collection.json
#    - Hummii-API-Environment.postman_environment.json

# 2. Выберите Environment: "Hummii API - Local"

# 3. Запустите API сервер
cd /root/Garantiny_old/HUMMII
docker compose up -d postgres redis
cd api
npm run start:dev

# 4. Тестируйте эндпоинты в Postman
```

**Что покрыто в Postman:**

**Authentication (11 endpoints)**
- Register User
- Verify Email
- Login
- Refresh Token
- Logout / Logout All
- Password Reset (request/confirm)
- Google OAuth
- Active Sessions (get/delete)

**Users (5 endpoints)**
- Get/Update Profile
- Export User Data (PIPEDA)
- Delete Account
- Avatar Upload

**Contractors (8+ endpoints)**
- Create/Update Profile
- Portfolio Management
- Location Updates
- Category Assignment

**Orders (8+ endpoints)**
- Create/Publish Order
- Update Status
- Search Orders
- Proposals (submit/accept/reject)

**Chat (7+ endpoints)**
- Get/Send Messages
- Edit Messages
- Mark as Read
- Export Chat (PIPEDA)
- Report Messages

**Reviews (8+ endpoints)**
- Create/Update/Delete Review
- Get Reviews
- Respond to Review
- Report Review
- Statistics

**Subscriptions (7+ endpoints)**
- Create Subscription
- Upgrade/Downgrade
- Cancel/Reactivate
- Customer Portal

**Notifications (7+ endpoints)**
- Get Notifications
- Unread Count
- Mark as Read (single/all)
- Preferences

**Disputes (7+ endpoints)**
- Create Dispute
- Upload Evidence
- Messages
- Get Details

**Categories (7+ endpoints)**
- Get Tree/Popular/Public
- Create/Update/Delete (Admin)
- Subcategories

**SEO & Analytics (7+ endpoints)**
- Generate/Validate Slug
- Sitemaps
- Track Events

**Admin (множество endpoints)**
- User Management
- Platform Statistics
- Audit Logs

### 3. Swagger UI (ПРИОРИТЕТ №3) ✅

**Преимущества:**
- ✅ Интерактивная документация
- ✅ Try-it-out функционал
- ✅ Автоматическая генерация из кода
- ✅ Описание схем данных

**Как использовать:**
```bash
# 1. Запустите API сервер
cd /root/Garantiny_old/HUMMII/api
npm run start:dev

# 2. Откройте в браузере
http://localhost:3000/api/docs

# 3. Используйте "Authorize" для JWT токена
# 4. Тестируйте эндпоинты через "Try it out"
```

**Что доступно:**
- 📋 Все 185+ эндпоинтов документированы
- 🏷️ Группировка по тегам (Auth, Users, Orders, etc.)
- 📝 Схемы DTO с валидацией
- 🔒 Bearer Auth для защищенных эндпоинтов
- 📊 Примеры запросов/ответов

---

## 🚀 Пошаговый План Тестирования

### Этап 1: Автоматические Тесты (Основа)

**День 1: Запуск существующих тестов**
```bash
cd /root/Garantiny_old/HUMMII/api

# 1. Установить зависимости (если нужно)
npm install

# 2. Настроить test environment
cp .env.example .env.test
# Отредактировать .env.test для тестовой БД

# 3. Запустить тестовую БД
docker compose -f ../docker-compose.test.yml up -d

# 4. Запустить миграции
npx prisma migrate deploy

# 5. Запустить все тесты
npm run test:all

# 6. Генерация отчета покрытия
npm run test:cov
# Отчет в: api/coverage/lcov-report/index.html
```

**Ожидаемый результат:**
- ✅ Unit тесты: ~5-10 секунд, >70% покрытие
- ✅ E2E тесты: ~20-30 секунд
- ⚠️ Некоторые тесты могут падать (как показано в выводе)

**День 2: Фиксация падающих тестов**
```bash
# Посмотреть детали падений
npm run test:unit 2>&1 | tee test-results.log

# Основные проблемы:
# 1. SubscriptionsService - ожидает NotFoundException, получает BadRequestException
# 2. ContentModerationService - проблемы с Canadian phone numbers
```

**Исправление:**
- Обновить тесты под актуальную логику
- Или исправить логику сервисов, если это баги

### Этап 2: Postman Тестирование (Ручное)

**День 3-5: Функциональное тестирование**

**Тестовый сценарий #1: Полный цикл пользователя**
```
1. Register User (/auth/register)
2. Verify Email (/auth/verify-email?token=XXX)
   - Получить token из БД или email
3. Login (/auth/login)
   - Получить access_token (сохранится автоматически)
4. Get Profile (/users/me)
5. Update Profile (/users/me)
6. Upload Avatar (/users/me/avatar)
7. Export Data (/users/me/export) - PIPEDA
8. Logout (/auth/logout)
```

**Тестовый сценарий #2: Подрядчик создает профиль**
```
1. Login as user
2. Create Contractor Profile (/contractors/me)
3. Add Portfolio Items (/contractors/me/portfolio)
4. Assign Categories (/contractors/me/categories)
5. Update Location (/contractors/me/location)
6. Create Subscription (/subscriptions) - PREMIUM/ELITE
7. Get Contractor Profile (/contractors/me)
```

**Тестовый сценарий #3: Жизненный цикл заказа**
```
1. Login as client
2. Create Order (/orders) - status: DRAFT
3. Publish Order (/orders/:id/publish) - status: OPEN
4. Login as contractor
5. Submit Proposal (/orders/:orderId/proposals)
6. Login as client
7. Accept Proposal (/proposals/:id/accept) - status: IN_PROGRESS
8. Send Chat Message (/chat/:orderId/messages)
9. Update Order Status (/orders/:id/status) - COMPLETED
10. Create Review (/reviews)
```

**Тестовый сценарий #4: Споры**
```
1. Create Dispute (/disputes)
2. Upload Evidence (/disputes/:id/evidence)
3. Add Messages (/disputes/:id/messages)
4. Admin reviews dispute
```

**Тестовый сценарий #5: Admin панель**
```
1. Login as admin
2. Get All Users (/admin/users)
3. Get User Details (/admin/users/:id)
4. Add Role (/admin/users/:id/roles)
5. Lock User (/admin/users/:id/lock)
6. View Audit Logs (/admin/audit-logs)
7. Get Platform Stats (/admin/stats)
```

### Этап 3: Swagger UI Тестирование

**День 6: Проверка документации и edge cases**
```
1. Открыть http://localhost:3000/api/docs
2. Получить JWT токен через /auth/login
3. Нажать "Authorize" и вставить токен
4. Протестировать каждый модуль:
   - Попробовать валидные запросы
   - Попробовать невалидные данные
   - Проверить ответы 400, 401, 403, 404
   - Проверить пагинацию (page, limit)
   - Проверить фильтрацию и сортировку
```

### Этап 4: Нагрузочное Тестирование (Опционально)

**День 7: Performance & Load Testing**
```bash
# Использовать k6 или Apache Bench
cd /root/Garantiny_old/HUMMII
./scripts/run-load-tests.sh

# Или вручную
ab -n 1000 -c 10 http://localhost:3000/api/v1/health
```

---

## 📋 Чек-лист Тестирования

### Функциональное Тестирование

#### Authentication ✓
- [ ] Регистрация с валидными данными
- [ ] Регистрация с дубликатом email
- [ ] Верификация email (valid/invalid token)
- [ ] Логин (correct/incorrect credentials)
- [ ] Refresh token (valid/expired/revoked)
- [ ] Logout (single session / all sessions)
- [ ] Password reset flow
- [ ] Google OAuth flow
- [ ] Rate limiting (слишком много попыток)

#### Users ✓
- [ ] Get profile (authenticated)
- [ ] Update profile (valid/invalid data)
- [ ] Upload avatar (valid/invalid formats)
- [ ] Delete account (soft delete)
- [ ] Export data (PIPEDA compliance)
- [ ] Switch role (CLIENT ↔ CONTRACTOR)

#### Orders ✓
- [ ] Create order (DRAFT status)
- [ ] Publish order (OPEN status)
- [ ] Search orders (filters, pagination)
- [ ] Update order (owner only)
- [ ] Change status (state machine validation)
- [ ] Delete order (permissions)

#### Proposals ✓
- [ ] Submit proposal (contractor only)
- [ ] Get proposals for order
- [ ] Accept proposal (client only, order status check)
- [ ] Reject proposal
- [ ] Update proposal

#### Chat ✓
- [ ] Send message (order participants only)
- [ ] Get messages (pagination)
- [ ] Edit message (within 5 minutes)
- [ ] Mark as read
- [ ] Content moderation (profanity, phone numbers)
- [ ] Export chat (PIPEDA)

#### Reviews ✓
- [ ] Create review (completed order only)
- [ ] Get reviews (pagination, filtering)
- [ ] Update review (before moderation)
- [ ] Delete review (soft delete)
- [ ] Respond to review (contractor)
- [ ] Report review
- [ ] Rating calculation

#### Subscriptions ✓
- [ ] Create subscription (Stripe integration)
- [ ] Get subscription details
- [ ] Upgrade subscription
- [ ] Downgrade subscription
- [ ] Cancel subscription
- [ ] Reactivate subscription
- [ ] Webhook handling (Stripe events)

#### Notifications ✓
- [ ] Get notifications (pagination)
- [ ] Unread count
- [ ] Mark as read (single/all)
- [ ] Delete notification
- [ ] Preferences (get/update)
- [ ] Real-time delivery (WebSocket)

#### Disputes ✓
- [ ] Create dispute
- [ ] Upload evidence (multiple files)
- [ ] Add messages
- [ ] Get dispute details
- [ ] Admin resolution

#### Admin ✓
- [ ] List users (pagination, filters)
- [ ] Get user details
- [ ] Add/remove roles
- [ ] Lock/unlock accounts
- [ ] View audit logs
- [ ] Platform statistics

#### SEO & Analytics ✓
- [ ] Generate unique slug
- [ ] Validate slug availability
- [ ] Track views, searches, conversions
- [ ] Generate sitemaps
- [ ] Export analytics

### Нефункциональное Тестирование

#### Security ✓
- [ ] JWT authentication работает
- [ ] Refresh token rotation
- [ ] RBAC (роли и права доступа)
- [ ] Rate limiting на критических endpoints
- [ ] CORS настроен корректно
- [ ] Helmet security headers
- [ ] SQL injection защита (Prisma ORM)
- [ ] XSS защита
- [ ] File upload validation

#### Performance ✓
- [ ] Response time < 200ms для простых запросов
- [ ] Response time < 1s для сложных запросов
- [ ] Database query optimization (indexes)
- [ ] Redis caching работает
- [ ] Pagination для больших данных

#### Compliance ✓
- [ ] PIPEDA: Export user data
- [ ] PIPEDA: Delete user data (soft delete)
- [ ] PIPEDA: Audit logging
- [ ] PIPEDA: Cookie consent
- [ ] Email verification required

#### Reliability ✓
- [ ] Error handling (все exceptions пойманы)
- [ ] Graceful degradation
- [ ] Transaction consistency (Prisma transactions)
- [ ] WebSocket reconnection
- [ ] Queue retry logic (BullMQ)

---

## 🔧 Инструменты и Команды

### Быстрый Старт
```bash
# 1. Клонировать проект (если еще не клонирован)
cd /root/Garantiny_old/HUMMII

# 2. Установить зависимости
cd api
npm install

# 3. Настроить окружение
cp .env.example .env
# Отредактировать .env

# 4. Запустить зависимости (БД, Redis)
docker compose up -d postgres redis

# 5. Миграции
npx prisma migrate deploy
npx prisma generate

# 6. Запустить сервер
npm run start:dev

# 7. Проверить здоровье
curl http://localhost:3000/api/v1/health

# 8. Открыть Swagger
# http://localhost:3000/api/docs
```

### Тестовые Команды
```bash
# Unit тесты
npm run test:unit

# E2E тесты
npm run test:e2e

# Все тесты
npm run test:all

# С покрытием
npm run test:cov

# Watch режим (разработка)
npm run test:watch

# Debug режим
npm run test:debug

# Docker тестирование (изолированное)
npm run test:docker
npm run test:docker:down
```

### Postman
```bash
# Импортировать коллекцию
# File -> Import -> Select files:
#   - /root/Garantiny_old/HUMMII/docs/postman collection/Hummii-API.postman_collection.json
#   - /root/Garantiny_old/HUMMII/docs/postman collection/Hummii-API-Environment.postman_environment.json

# Выбрать Environment: "Hummii API - Local"
# Настроить base_url если нужно (по умолчанию: http://localhost:3000/api/v1)
```

### Swagger UI
```
URL: http://localhost:3000/api/docs

1. Получить токен через /auth/login
2. Нажать "Authorize" (вверху справа)
3. Вставить: Bearer <ваш_токен>
4. Тестировать эндпоинты
```

### Логи и Мониторинг
```bash
# API логи
tail -f /root/Garantiny_old/HUMMII/logs/api/app.log

# Database queries (при включенном Prisma logging)
# Установить в .env: DATABASE_LOG_LEVEL=info

# Prometheus metrics
curl http://localhost:3000/metrics

# Health check
curl http://localhost:3000/api/v1/health
```

---

## 📊 Метрики Качества

### Целевые Показатели
- **Code Coverage**: ≥ 70% (текущая цель)
- **E2E Coverage**: Все критические пути покрыты
- **Response Time**: < 200ms (95 percentile)
- **Error Rate**: < 1%
- **Uptime**: > 99.5%

### Отчетность
```bash
# После каждого запуска тестов
npm run test:cov

# Открыть HTML отчет
open api/coverage/lcov-report/index.html
# или
firefox api/coverage/lcov-report/index.html
```

---

## ⚠️ Известные Проблемы

### Падающие Тесты (на момент проверки)
1. **SubscriptionsService.upgradeSubscription**
   - Ожидает: `NotFoundException`
   - Получает: `BadRequestException`
   - Решение: Обновить тест или логику сервиса

2. **ContentModerationService.moderateMessage**
   - Проблема с блокировкой Canadian phone numbers с +1
   - Решение: Проверить регулярное выражение

### Рекомендации
```bash
# 1. Посмотреть все падающие тесты
npm run test:all 2>&1 | tee test-failures.log

# 2. Отфильтровать только FAIL
grep "FAIL\|Error\|Expected\|Received" test-failures.log

# 3. Исправить тесты или код

# 4. Перезапустить
npm run test:all
```

---

## 🎓 Обучение Команды

### Для Разработчиков
- **Jest**: https://jestjs.io/docs/getting-started
- **NestJS Testing**: https://docs.nestjs.com/fundamentals/testing
- **Supertest**: https://github.com/visionmedia/supertest

### Для QA
- **Postman**: https://learning.postman.com/
- **Swagger**: https://swagger.io/docs/
- **REST API Testing**: https://www.guru99.com/testing-rest-api-manually.html

---

## 📝 Выводы и Рекомендации

### ✅ Что уже готово
1. **Автотесты**: Отличное покрытие unit и E2E тестов
2. **Postman**: Полная коллекция с 3086 строк
3. **Swagger**: Автодокументация всех эндпоинтов
4. **CI/CD Ready**: Тесты готовы к интеграции в pipeline

### 🎯 Рекомендуемый подход
**Комбинированная стратегия: 70% авто + 30% ручное**

1. **Автотесты (ежедневно/при коммитах)**
   - Unit тесты для бизнес-логики
   - E2E для критических путей
   - Интеграция в CI/CD

2. **Postman (недельно/перед релизом)**
   - Ручная проверка новых фич
   - Edge cases и негативные сценарии
   - Экспорт результатов тестирования

3. **Swagger (по необходимости)**
   - Проверка документации
   - Быстрые ad-hoc тесты
   - Демонстрация API клиентам

### 🚀 Следующие Шаги
1. **Немедленно**: Запустить `npm run test:all` и зафиксировать baseline
2. **День 1-2**: Исправить падающие тесты
3. **День 3-5**: Пройти чек-лист в Postman
4. **День 6**: Проверить Swagger документацию
5. **День 7**: Настроить CI/CD с автотестами
6. **Еженедельно**: Регрессионное тестирование через Postman

### 💡 Дополнительные Улучшения
- [ ] Добавить Contract Testing (Pact)
- [ ] Настроить Load Testing (k6, Artillery)
- [ ] Добавить Security Testing (OWASP ZAP)
- [ ] Мониторинг покрытия в Codecov
- [ ] E2E тесты для WebSocket (Socket.io)

---

## 📞 Поддержка

**Документация проекта:**
- API README: `/root/Garantiny_old/HUMMII/api/README.md`
- Test README: `/root/Garantiny_old/HUMMII/api/TEST_README.md`
- Postman Guide: `/root/Garantiny_old/HUMMII/docs/postman collection/README.md`

**Быстрые ссылки:**
- Swagger UI: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/v1/health
- Metrics: http://localhost:3000/metrics

---

**Создано**: 13 ноября 2025  
**Версия**: 1.0  
**Статус**: ✅ Готово к использованию
