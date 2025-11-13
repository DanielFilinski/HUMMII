# 📊 Отчет по покрытию API тестами Postman

**Дата создания:** 13 ноября 2025  
**Анализируемые файлы:**
- `docs/postman collection/Hummii-API-with-Scenarios.postman_collection.json`
- `docs/postman collection/Hummii-API.postman_collection.json`
- Все контроллеры API в `api/src/`

---

## 📈 Общая статистика

| Метрика | Значение |
|---------|----------|
| **Всего эндпоинтов в контроллерах** | 185 |
| **Всего эндпоинтов в Postman** | 151 |
| **Покрыто тестами** | 131 |
| **НЕ покрыто (отсутствует в Postman)** | 54 |
| **Лишние в Postman (нет в контроллерах)** | 20 |
| **Процент покрытия** | **70.8%** |

---

## ✅ ЧТО УЖЕ РЕАЛИЗОВАНО В POSTMAN

### Покрытие по модулям:

#### 🔐 Authentication (11/12 эндпоинтов - 91.7%)
- ✓ POST `/auth/register` - Регистрация пользователя
- ✓ GET `/auth/verify-email` - Верификация email
- ✓ POST `/auth/login` - Вход в систему
- ✓ POST `/auth/logout` - Выход из системы
- ✓ POST `/auth/logout-all` - Выход из всех сессий
- ✓ POST `/auth/refresh` - Обновление токена
- ✓ POST `/auth/password-reset/request` - Запрос сброса пароля
- ✓ POST `/auth/password-reset/confirm` - Подтверждение сброса пароля
- ✓ GET `/auth/sessions` - Получение активных сессий
- ✓ DELETE `/auth/sessions/:sessionId` - Удаление сессии
- ✓ GET `/auth/google` - OAuth Google

#### 👤 Users (4/7 эндпоинтов - 57.1%)
- ✓ GET `/users/me` - Получение профиля
- ✓ PATCH `/users/me` - Обновление профиля
- ✓ DELETE `/users/me` - Удаление аккаунта
- ✓ GET `/users/me/export` - Экспорт данных (PIPEDA)
- ✗ POST `/users/me/avatar` - **НЕ ПОКРЫТО**
- ✗ POST `/users/me/cookie-preferences` - **НЕ ПОКРЫТО**
- ✗ POST `/users/me/switch-role` - **НЕ ПОКРЫТО**

#### 📦 Orders (10/10 эндпоинтов - 100%)
- ✓ POST `/orders` - Создание заказа
- ✓ POST `/orders/:id/publish` - Публикация заказа
- ✓ GET `/orders/:id` - Получение заказа
- ✓ PATCH `/orders/:id` - Обновление заказа
- ✓ PATCH `/orders/:id/status` - Обновление статуса
- ✓ GET `/orders/search` - Поиск заказов
- ✓ GET `/orders/my-orders` - Мои заказы
- ✓ DELETE `/orders/:id` - Удаление заказа
- ✓ POST `/orders/:orderId/proposals` - Создание предложения
- ✓ GET `/orders/:orderId/proposals` - Получение предложений

#### 💼 Proposals (4/4 эндпоинтов - 100%)
- ✓ POST `/proposals/:id/accept` - Принятие предложения
- ✓ POST `/proposals/:id/reject` - Отклонение предложения
- ✓ GET `/proposals/my-proposals` - Мои предложения
- ✓ PATCH `/proposals/:id` - Обновление предложения

#### 🏗️ Contractors (15/15 эндпоинтов - 100%)
- ✓ POST `/contractors/me` - Создание профиля подрядчика
- ✓ GET `/contractors/me` - Получение профиля
- ✓ PATCH `/contractors/me` - Обновление профиля
- ✓ PATCH `/contractors/me/location` - Обновление локации
- ✓ GET `/contractors/:id` - Публичный профиль
- ✓ GET `/contractors/nearby` - Поиск ближайших
- ✓ POST `/contractors/me/portfolio` - Добавление работы в портфолио
- ✓ GET `/contractors/me/portfolio` - Мое портфолио
- ✓ PATCH `/contractors/me/portfolio/:id` - Обновление портфолио
- ✓ DELETE `/contractors/me/portfolio/:id` - Удаление из портфолио
- ✓ POST `/contractors/me/portfolio/reorder` - Сортировка портфолио
- ✓ GET `/contractors/:id/portfolio` - Публичное портфолио
- ✓ POST `/contractors/me/categories` - Назначение категорий
- ✓ DELETE `/contractors/me/categories/:id` - Удаление категории
- ✓ GET `/contractors/me/categories` - Мои категории

#### 📁 Categories (10/10 эндпоинтов - 100%)
- ✓ GET `/categories/tree` - Дерево категорий
- ✓ GET `/categories/popular` - Популярные категории
- ✓ GET `/categories/public` - Публичные категории
- ✓ GET `/categories` - Все категории
- ✓ GET `/categories/:id/subcategories` - Подкатегории
- ✓ GET `/categories/:id/path` - Путь категории
- ✓ GET `/categories/:id` - Детали категории
- ✓ POST `/categories` - Создание категории (admin)
- ✓ PATCH `/categories/:id` - Обновление категории (admin)
- ✓ DELETE `/categories/:id` - Удаление категории (admin)

#### ⭐ Reviews (8/8 эндпоинтов - 100%)
- ✓ POST `/reviews` - Создание отзыва
- ✓ GET `/reviews/user/:userId` - Отзывы пользователя
- ✓ GET `/reviews/:id` - Детали отзыва
- ✓ PATCH `/reviews/:id` - Обновление отзыва
- ✓ DELETE `/reviews/:id` - Удаление отзыва
- ✓ POST `/reviews/:id/response` - Ответ на отзыв
- ✓ POST `/reviews/:id/report` - Жалоба на отзыв
- ✓ GET `/reviews/stats/:userId` - Статистика отзывов

#### 💬 Chat (8/8 эндпоинтов - 100%)
- ✓ GET `/chat/:orderId/messages` - Получение сообщений
- ✓ POST `/chat/:orderId/messages` - Отправка сообщения
- ✓ PATCH `/chat/:orderId/messages/:messageId` - Редактирование сообщения
- ✓ POST `/chat/:orderId/mark-read` - Отметка как прочитанное
- ✓ GET `/chat/:orderId/unread-count` - Количество непрочитанных
- ✓ GET `/chat/my-chats` - Мои чаты
- ✓ GET `/chat/:orderId/export` - Экспорт чата (PIPEDA)
- ✓ POST `/chat/:orderId/report` - Жалоба на чат

#### 🔔 Notifications (9/9 эндпоинтов - 100%)
- ✓ GET `/notifications` - Получение уведомлений
- ✓ GET `/notifications/unread-count` - Количество непрочитанных
- ✓ PATCH `/notifications/:id/read` - Отметка как прочитанное
- ✓ POST `/notifications/mark-all-read` - Отметить все
- ✓ DELETE `/notifications/:id` - Удаление уведомления
- ✓ DELETE `/notifications` - Удаление всех
- ✓ GET `/notifications/preferences` - Настройки уведомлений
- ✓ PATCH `/notifications/preferences` - Обновление настроек
- ✓ POST `/notifications/preferences/reset` - Сброс настроек

#### 💎 Subscriptions (7/7 эндпоинтов - 100%)
- ✓ POST `/subscriptions` - Создание подписки
- ✓ GET `/subscriptions/me` - Моя подписка
- ✓ PATCH `/subscriptions/upgrade` - Повышение тарифа
- ✓ PATCH `/subscriptions/downgrade` - Понижение тарифа
- ✓ DELETE `/subscriptions` - Отмена подписки
- ✓ POST `/subscriptions/reactivate` - Возобновление подписки
- ✓ POST `/subscriptions/portal` - Портал Stripe

#### ⚖️ Disputes (8/8 эндпоинтов - 100%)
- ✓ POST `/disputes` - Создание спора
- ✓ GET `/disputes` - Список споров
- ✓ GET `/disputes/:id` - Детали спора
- ✓ POST `/disputes/:id/evidence` - Загрузка доказательств
- ✓ GET `/disputes/:id/evidence` - Получение доказательств
- ✓ DELETE `/disputes/:id/evidence/:evidenceId` - Удаление доказательства
- ✓ POST `/disputes/:id/messages` - Добавление сообщения
- ✓ GET `/disputes/:id/messages` - Получение сообщений

#### ✅ Verification (2/2 эндпоинтов - 100%)
- ✓ POST `/verification/create` - Создание сессии верификации
- ✓ GET `/verification/status` - Статус верификации

#### 🗺️ SEO & Sitemap (4/4 эндпоинтов - 100%)
- ✓ GET `/sitemap.xml` - Главная карта сайта
- ✓ GET `/sitemap-static.xml` - Статические страницы
- ✓ GET `/sitemap-contractors.xml` - Карта подрядчиков
- ✓ GET `/sitemap-categories.xml` - Карта категорий

#### 🔧 System (4/4 эндпоинтов - 100%)
- ✓ GET `/` - Health check
- ✓ GET `/version` - Версия API
- ✓ GET `/metrics` - Метрики Prometheus
- ✓ POST `/webhooks/stripe` - Webhook Stripe
- ✓ POST `/webhooks/sendgrid/events` - Webhook SendGrid

#### 👨‍💼 Admin (26/61 эндпоинтов - 42.6%)
Базовое покрытие:
- ✓ GET `/admin/users` - Список пользователей
- ✓ GET `/admin/users/:id` - Детали пользователя
- ✓ POST `/admin/users/:id/roles` - Добавление роли
- ✓ DELETE `/admin/users/:id/roles` - Удаление роли
- ✓ PATCH `/admin/users/:id/lock` - Блокировка пользователя
- ✓ PATCH `/admin/users/:id/unlock` - Разблокировка пользователя
- ✓ GET `/admin/contractors/pending` - Ожидающие верификации
- ✓ PATCH `/admin/contractors/:id/verify` - Верификация подрядчика
- ✓ PATCH `/admin/contractors/:id/reject` - Отклонение верификации
- ✓ GET `/admin/audit-logs` - Журнал аудита
- ✓ GET `/admin/stats` - Общая статистика
- ✓ GET `/admin/portfolio/pending` - Ожидающие модерации портфолио
- ✓ PATCH `/admin/portfolio/:id/approve` - Одобрение портфолио
- ✓ PATCH `/admin/portfolio/:id/reject` - Отклонение портфолио
- ✓ GET `/admin/reviews/pending` - Ожидающие модерации отзывы
- ✓ PATCH `/admin/reviews/:id/moderate` - Модерация отзыва
- ✓ GET `/admin/orders` - Все заказы
- ✓ GET `/admin/subscriptions` - Все подписки
- ✓ POST `/admin/notifications/bulk` - Массовая рассылка
- ✓ GET `/admin/settings` - Настройки системы
- ✓ PATCH `/admin/settings` - Обновление настроек
- ✓ GET `/admin/feature-flags` - Feature flags
- ✓ POST `/admin/feature-flags` - Создание feature flag
- ✓ GET `/admin/disputes` - Очередь споров
- ✓ POST `/admin/disputes/:id/resolve` - Разрешение спора
- ✓ GET `/admin/categories/analytics` - Аналитика категорий

---

## ❌ ЧТО НЕ ПОКРЫТО POSTMAN ТЕСТАМИ

### Критические непокрытые эндпоинты:

#### 👨‍💼 Admin Module (35 эндпоинтов - ВЫСОКИЙ ПРИОРИТЕТ)

**Управление пользователями:**
- ✗ DELETE `/admin/users/:id` - Удаление пользователя
- ✗ PATCH `/admin/users/:id/role` - Изменение роли

**Детальная аналитика:**
- ✗ GET `/admin/audit-logs/:id` - Детали записи аудита
- ✗ GET `/admin/orders/:id` - Детали заказа
- ✗ GET `/admin/orders/stats` - Статистика заказов
- ✗ GET `/admin/subscriptions/:id` - Детали подписки
- ✗ GET `/admin/subscriptions/stats` - Статистика подписок
- ✗ GET `/admin/stats/users` - Статистика пользователей
- ✗ GET `/admin/disputes/:id` - Детали спора
- ✗ GET `/admin/disputes/stats` - Статистика споров

**Модерация контента:**
- ✗ GET `/admin/reviews/flagged` - Отзывы с жалобами
- ✗ GET `/admin/reviews/reports` - Жалобы на отзывы
- ✗ PATCH `/admin/reviews/reports/:id/resolve` - Разрешение жалобы
- ✗ DELETE `/admin/reviews/:id` - Удаление отзыва
- ✗ POST `/admin/reviews/:id/response` - Ответ администратора
- ✗ POST `/admin/reviews/bulk-moderate` - Массовая модерация

**Управление заказами:**
- ✗ PATCH `/admin/orders/:id/status` - Изменение статуса заказа
- ✗ PATCH `/admin/orders/:id/cancel` - Отмена заказа

**Управление подписками:**
- ✗ PATCH `/admin/subscriptions/:id/tier` - Изменение тарифа
- ✗ PATCH `/admin/subscriptions/:id/extend` - Продление подписки
- ✗ PATCH `/admin/subscriptions/:id/cancel` - Отмена подписки

**Управление спорами:**
- ✗ PATCH `/admin/disputes/:id/status` - Изменение статуса спора

**Уведомления:**
- ✗ GET `/admin/notifications/:id` - Детали уведомления
- ✗ GET `/admin/notifications/stats` - Статистика уведомлений
- ✗ GET `/admin/notifications/templates` - Шаблоны уведомлений
- ✗ GET `/admin/notifications/user/:userId` - Уведомления пользователя

**Настройки системы:**
- ✗ GET `/admin/settings/:key` - Получение настройки по ключу
- ✗ PATCH `/admin/settings/bulk` - Массовое обновление настроек
- ✗ DELETE `/admin/settings/:key` - Удаление настройки
- ✗ GET `/admin/feature-flags/:name` - Детали feature flag
- ✗ PATCH `/admin/feature-flags/:name` - Обновление feature flag
- ✗ DELETE `/admin/feature-flags/:name` - Удаление feature flag

**SEO (Admin):**
- ✗ POST `/admin/seo/refresh-sitemap` - Обновление sitemap
- ✗ POST `/admin/seo/revalidate/:contractorId` - Ревалидация SEO
- ✗ POST `/admin/seo/warm-cache` - Прогрев кэша

#### 📊 Analytics Module (15 эндпоинтов - ВЫСОКИЙ ПРИОРИТЕТ)

**Публичная аналитика:**
- ✗ POST `/v1/analytics/track-view` - Отслеживание просмотров
- ✗ POST `/v1/analytics/track-search` - Отслеживание поиска
- ✗ POST `/v1/analytics/track-conversion` - Отслеживание конверсий

**Админ аналитика:**
- ✗ GET `/v1/analytics/overview` - Общая статистика
- ✗ GET `/v1/analytics/contractors` - Статистика подрядчиков
- ✗ GET `/v1/analytics/searches` - Статистика поиска
- ✗ GET `/v1/analytics/conversions` - Статистика конверсий
- ✗ GET `/v1/analytics/export` - Экспорт аналитики

#### 🔍 SEO Module (7 эндпоинтов - СРЕДНИЙ ПРИОРИТЕТ)
- ✗ POST `/v1/seo/generate-slug` - Генерация SEO-slug
- ✗ GET `/v1/seo/validate-slug/:slug` - Проверка доступности slug
- ✗ PATCH `/v1/seo/update-slug` - Обновление slug
- ✗ GET `/v1/seo/metadata/:contractorId` - SEO метаданные
- ✗ GET `/v1/seo/opengraph/:contractorId` - OpenGraph метаданные
- ✗ GET `/v1/seo/structured-data/:contractorId` - Структурированные данные
- ✗ GET `/v1/seo/redirects` - Список редиректов

#### 👤 Users Module (3 эндпоинта - СРЕДНИЙ ПРИОРИТЕТ)
- ✗ POST `/users/me/avatar` - Загрузка аватара
- ✗ POST `/users/me/cookie-preferences` - Настройки cookies (PIPEDA)
- ✗ POST `/users/me/switch-role` - Переключение роли

#### 🔐 Auth Module (1 эндпоинт - НИЗКИЙ ПРИОРИТЕТ)
- ✗ GET `/auth/google/callback` - OAuth Google callback

---

## 🎯 ТЕСТОВЫЕ СЦЕНАРИИ

### Реализованные сценарии в `Hummii-API-with-Scenarios.postman_collection.json`:

1. **🚀 Quick Health Check** (2 шага)
   - Проверка работоспособности API
   - Получение версии API

2. **👤 Complete User Journey** (5 шагов)
   - Регистрация → Email верификация → Вход → Получение профиля → Обновление профиля

3. **📧 Email Verification Flow** (6 шагов)
   - Регистрация → Попытка входа до верификации → Верификация → Вход → Проверка статуса → Тест невалидного токена

4. **📦 Order Lifecycle** (6 шагов)
   - Вход клиента → Создание заказа → Публикация → Отправка предложения → Принятие → Завершение

5. **🏗️ Contractor Setup** (4 шага)
   - Вход → Создание профиля → Добавление портфолио → Создание подписки

6. **💎 Subscription Management** (4 шага)
   - Вход → Получение подписки → Повышение тарифа → Отмена

7. **⭐ Review System Flow** (4 шага)
   - Вход клиента → Создание отзыва → Получение отзыва → Ответ подрядчика

8. **⚖️ Dispute Resolution Flow** (4 шага)
   - Вход → Создание спора → Добавление сообщения → Получение деталей

9. **💬 Chat Flow** (4 шага)
   - Вход → Отправка сообщения → Получение сообщений → Отметка как прочитанное

10. **🔔 Notifications Flow** (5 шагов)
    - Вход → Получение уведомлений → Подсчет непрочитанных → Отметить все → Обновление настроек

11. **🔐 Security & Error Handling** (4 шага)
    - Неавторизованный доступ → Невалидный email → Слабый пароль → Неверный пароль

---

## ⚠️ ЛИШНИЕ ЭНДПОИНТЫ В POSTMAN

Эти эндпоинты присутствуют в Postman коллекциях, но отсутствуют в контроллерах. Возможно, они устарели или содержат опечатки:

### Analytics (3 эндпоинта)
- POST `/analytics/track-view` (должно быть `/v1/analytics/track-view`)
- POST `/analytics/track-search` (должно быть `/v1/analytics/track-search`)
- POST `/analytics/track-conversion` (должно быть `/v1/analytics/track-conversion`)

### Admin Analytics (5 эндпоинтов)
- GET `/admin/analytics/overview` (должно быть `/v1/analytics/overview`)
- GET `/admin/analytics/contractors` (должно быть `/v1/analytics/contractors`)
- GET `/admin/analytics/searches` (должно быть `/v1/analytics/searches`)
- GET `/admin/analytics/conversions` (должно быть `/v1/analytics/conversions`)
- GET `/admin/analytics/export` (должно быть `/v1/analytics/export`)

### SEO (7 эндпоинтов)
- POST `/seo/generate-slug` (должно быть `/v1/seo/generate-slug`)
- GET `/seo/validate-slug/:slug` (должно быть `/v1/seo/validate-slug/:slug`)
- PATCH `/seo/update-slug` (должно быть `/v1/seo/update-slug`)
- GET `/seo/metadata/:contractorId` (должно быть `/v1/seo/metadata/:contractorId`)
- GET `/seo/opengraph/:contractorId` (должно быть `/v1/seo/opengraph/:contractorId`)
- GET `/seo/structured-data/:contractorId` (должно быть `/v1/seo/structured-data/:contractorId`)
- GET `/seo/redirects` (должно быть `/v1/seo/redirects`)

### Health (3 эндпоинта)
- GET `/health` (есть только `/` в контроллерах)
- GET `/health/queue` (отсутствует в контроллерах)
- GET `/health/queue/metrics` (отсутствует в контроллерах)

### Subscriptions (2 эндпоинта)
- POST `/subscriptions/cancel` (должно быть DELETE `/subscriptions`)
- POST `/subscriptions/upgrade` (должно быть PATCH `/subscriptions/upgrade`)

---

## 💡 РЕКОМЕНДАЦИИ

### 1. Критические сценарии для добавления (ВЫСОКИЙ ПРИОРИТЕТ):

#### 1.1 Admin Dashboard Flow
**Описание:** Полный цикл работы администратора  
**Шаги:**
1. Login as admin
2. GET `/admin/stats` - View platform statistics
3. GET `/admin/stats/users` - View user statistics
4. GET `/admin/users` - List all users
5. GET `/admin/users/:id` - View user details
6. PATCH `/admin/users/:id/lock` - Lock suspicious user
7. GET `/admin/audit-logs` - Review audit trail
8. GET `/admin/audit-logs/:id` - View specific audit log

#### 1.2 Content Moderation Flow
**Описание:** Модерация контента администратором  
**Шаги:**
1. Login as admin
2. GET `/admin/reviews/pending` - Get pending reviews
3. GET `/admin/reviews/flagged` - Get flagged reviews
4. PATCH `/admin/reviews/:id/moderate` - Moderate review (approve/reject)
5. GET `/admin/portfolio/pending` - Get pending portfolio items
6. PATCH `/admin/portfolio/:id/approve` - Approve portfolio
7. POST `/admin/reviews/bulk-moderate` - Bulk moderation
8. GET `/admin/reviews/reports` - View all reports
9. PATCH `/admin/reviews/reports/:id/resolve` - Resolve report

#### 1.3 Full Dispute Resolution Flow
**Описание:** Полный цикл разрешения спора  
**Шаги:**
1. Login as client
2. POST `/disputes` - Create dispute
3. POST `/disputes/:id/evidence` - Upload evidence (multiple files)
4. POST `/disputes/:id/messages` - Add message
5. Login as contractor
6. GET `/disputes/:id` - View dispute
7. POST `/disputes/:id/evidence` - Upload counter-evidence
8. POST `/disputes/:id/messages` - Add response
9. Login as admin
10. GET `/admin/disputes` - View disputes queue
11. GET `/admin/disputes/:id` - View dispute details
12. PATCH `/admin/disputes/:id/status` - Update status
13. POST `/admin/disputes/:id/resolve` - Resolve dispute
14. GET `/admin/disputes/stats` - View statistics

#### 1.4 Analytics Tracking Flow
**Описание:** Полный цикл аналитики  
**Шаги:**
1. POST `/v1/analytics/track-view` - Track profile view
2. POST `/v1/analytics/track-search` - Track search query
3. POST `/v1/analytics/track-conversion` - Track conversion event
4. Login as admin
5. GET `/v1/analytics/overview` - View overview
6. GET `/v1/analytics/contractors` - View contractor performance
7. GET `/v1/analytics/searches` - View search statistics
8. GET `/v1/analytics/conversions` - View conversion funnel
9. GET `/v1/analytics/export?format=json` - Export data

#### 1.5 SEO & Metadata Management
**Описание:** Управление SEO и метаданными  
**Шаги:**
1. Login as contractor
2. POST `/v1/seo/generate-slug` - Generate unique slug
3. GET `/v1/seo/validate-slug/:slug` - Validate slug
4. PATCH `/v1/seo/update-slug` - Update slug
5. GET `/v1/seo/metadata/:contractorId` - Get metadata
6. GET `/v1/seo/opengraph/:contractorId` - Get OpenGraph tags
7. GET `/v1/seo/structured-data/:contractorId` - Get JSON-LD
8. GET `/v1/seo/redirects` - View redirect history
9. Login as admin
10. POST `/admin/seo/refresh-sitemap` - Refresh sitemap
11. POST `/admin/seo/warm-cache` - Warm SEO cache

#### 1.6 Subscription Lifecycle
**Описание:** Полный жизненный цикл подписки  
**Шаги:**
1. Login as contractor
2. POST `/subscriptions` - Create subscription (STANDARD)
3. GET `/subscriptions/me` - View current subscription
4. PATCH `/subscriptions/upgrade` - Upgrade to PROFESSIONAL
5. GET `/subscriptions/me` - Verify upgrade
6. PATCH `/subscriptions/downgrade` - Downgrade to STANDARD
7. GET `/subscriptions/me` - Verify downgrade
8. DELETE `/subscriptions` - Cancel subscription
9. GET `/subscriptions/me` - Verify cancellation
10. POST `/subscriptions/reactivate` - Reactivate subscription
11. POST `/subscriptions/portal` - Access Stripe portal
12. Login as admin
13. GET `/admin/subscriptions` - View all subscriptions
14. GET `/admin/subscriptions/:id` - View subscription details
15. GET `/admin/subscriptions/stats` - View statistics
16. PATCH `/admin/subscriptions/:id/extend` - Extend subscription

#### 1.7 Contractor Verification Flow
**Описание:** Верификация подрядчика  
**Шаги:**
1. Login as contractor
2. POST `/verification/create` - Create verification session
3. GET `/verification/status` - Check verification status
4. Login as admin
5. GET `/admin/contractors/pending` - View pending verifications
6. PATCH `/admin/contractors/:id/verify` - Verify contractor
7. (Alternative) PATCH `/admin/contractors/:id/reject` - Reject verification
8. Login as contractor
9. GET `/verification/status` - Verify status updated

#### 1.8 File Upload & Management
**Описание:** Загрузка и управление файлами  
**Шаги:**
1. Login as user
2. POST `/users/me/avatar` - Upload avatar (multipart/form-data)
3. GET `/users/me` - Verify avatar uploaded
4. Login as contractor
5. POST `/contractors/me/portfolio` - Add portfolio with image
6. GET `/contractors/me/portfolio` - Verify portfolio added
7. PATCH `/contractors/me/portfolio/:id` - Update portfolio item
8. Login as dispute participant
9. POST `/disputes/:id/evidence` - Upload evidence files (multiple)
10. GET `/disputes/:id/evidence` - Verify files uploaded
11. DELETE `/disputes/:id/evidence/:evidenceId` - Delete evidence

#### 1.9 Advanced Order Management (Admin)
**Описание:** Управление заказами администратором  
**Шаги:**
1. Login as admin
2. GET `/admin/orders` - List all orders
3. GET `/admin/orders/:id` - View order details
4. GET `/admin/orders/stats` - View order statistics
5. PATCH `/admin/orders/:id/status` - Update order status
6. PATCH `/admin/orders/:id/cancel` - Cancel order

#### 1.10 System Settings & Feature Flags
**Описание:** Управление настройками системы  
**Шаги:**
1. Login as admin
2. GET `/admin/settings` - Get all settings
3. GET `/admin/settings/:key` - Get specific setting
4. PATCH `/admin/settings` - Update setting
5. PATCH `/admin/settings/bulk` - Bulk update settings
6. DELETE `/admin/settings/:key` - Delete setting
7. GET `/admin/feature-flags` - List feature flags
8. GET `/admin/feature-flags/:name` - Get feature flag
9. POST `/admin/feature-flags` - Create feature flag
10. PATCH `/admin/feature-flags/:name` - Update feature flag
11. DELETE `/admin/feature-flags/:name` - Delete feature flag

### 2. Улучшения для существующих сценариев:

#### 2.1 Добавить негативные тесты
- Попытки доступа без авторизации (401)
- Попытки доступа с невалидным токеном (401)
- Попытки доступа к чужим ресурсам (403)
- Невалидные данные (400)
- Несуществующие ресурсы (404)

#### 2.2 Добавить граничные случаи
- Пустые значения
- Очень длинные строки (overflow)
- Максимальные лимиты (файлы, pagination)
- Специальные символы в данных
- SQL injection попытки
- XSS попытки

#### 2.3 Добавить тесты производительности
- Большие объемы данных (pagination с 1000+ записей)
- Параллельные запросы (race conditions)
- Rate limiting проверка

#### 2.4 Добавить проверки PIPEDA
- Экспорт данных в различных форматах
- Удаление данных и проверка каскадного удаления
- Проверка анонимизации данных

#### 2.5 Добавить проверки email/webhooks
- Mock email сервиса для проверки отправки
- Webhook тесты для Stripe
- Webhook тесты для SendGrid

### 3. Исправления в Postman коллекциях:

#### 3.1 Исправить пути эндпоинтов
Заменить в коллекции:
- `/analytics/*` → `/v1/analytics/*`
- `/seo/*` → `/v1/seo/*`
- `/admin/analytics/*` → `/v1/analytics/*` (с admin auth)
- `/health` → `/` (или добавить соответствующий контроллер)
- POST `/subscriptions/cancel` → DELETE `/subscriptions`
- POST `/subscriptions/upgrade` → PATCH `/subscriptions/upgrade`

#### 3.2 Добавить недостающие эндпоинты
Создать запросы для всех 54 непокрытых эндпоинтов (см. раздел "Что не покрыто")

### 4. Организация тестов:

#### 4.1 Создать новые папки в коллекции
- 📁 Admin Flows
  - Admin Dashboard
  - Content Moderation
  - User Management
  - System Settings
- 📁 Advanced Scenarios
  - Full Dispute Resolution
  - Subscription Lifecycle
  - Contractor Verification
  - Analytics Tracking
- 📁 File Operations
  - Avatar Upload
  - Portfolio Images
  - Evidence Files
- 📁 Negative Tests
  - Authorization Errors
  - Validation Errors
  - Not Found Errors
- 📁 Performance Tests
  - Pagination Tests
  - Rate Limiting Tests
  - Concurrent Requests

#### 4.2 Добавить pre-request scripts
- Автоматическая генерация тестовых данных
- Автоматическое получение токенов
- Настройка переменных окружения

#### 4.3 Добавить test scripts
- Проверка кодов ответов
- Проверка структуры ответов
- Проверка бизнес-логики
- Автоматическое сохранение ID для следующих запросов

---

## 📋 План действий

### Фаза 1: Критические исправления (1-2 дня)
1. ✅ Исправить пути эндпоинтов в Postman (analytics, seo, admin/analytics)
2. ✅ Добавить сценарий "Admin Dashboard Flow"
3. ✅ Добавить сценарий "Content Moderation Flow"
4. ✅ Добавить сценарий "Analytics Tracking Flow"

### Фаза 2: Покрытие Admin модуля (2-3 дня)
1. ✅ Добавить все admin эндпоинты по управлению пользователями
2. ✅ Добавить admin эндпоинты по аналитике
3. ✅ Добавить admin эндпоинты по настройкам системы
4. ✅ Добавить admin эндпоинты по управлению контентом

### Фаза 3: SEO и Analytics (1-2 дня)
1. ✅ Добавить все SEO эндпоинты
2. ✅ Добавить публичные analytics эндпоинты
3. ✅ Создать сценарий "SEO & Metadata Management"

### Фаза 4: Дополнительные сценарии (2-3 дня)
1. ✅ Добавить "Full Dispute Resolution Flow"
2. ✅ Добавить "Subscription Lifecycle"
3. ✅ Добавить "Contractor Verification Flow"
4. ✅ Добавить "File Upload & Management"

### Фаза 5: Негативные тесты (1-2 дня)
1. ✅ Добавить тесты на неавторизованный доступ
2. ✅ Добавить тесты на невалидные данные
3. ✅ Добавить тесты на граничные случаи
4. ✅ Добавить тесты на rate limiting

### Фаза 6: Оптимизация и документация (1 день)
1. ✅ Оптимизировать pre-request scripts
2. ✅ Улучшить test assertions
3. ✅ Добавить описания ко всем запросам
4. ✅ Создать README для коллекций

---

## 📊 Целевые показатели

| Метрика | Текущее | Цель |
|---------|---------|------|
| **Покрытие эндпоинтов** | 70.8% | 95%+ |
| **Покрытие Admin модуля** | 42.6% | 90%+ |
| **Покрытие Analytics** | 0% | 100% |
| **Покрытие SEO** | 0% | 100% |
| **Количество сценариев** | 11 | 25+ |
| **Негативные тесты** | 4 | 50+ |

---

## 🎯 Выводы

1. **Базовое покрытие хорошее (70.8%)**, но есть критические пробелы:
   - Admin функционал покрыт только на 42.6%
   - Analytics модуль не покрыт совсем (0%)
   - SEO модуль не покрыт совсем (0%)

2. **Существующие сценарии качественные**, покрывают основные user flows:
   - Регистрация и аутентификация
   - Работа с заказами
   - Работа с отзывами
   - Чат и уведомления
   - Споры и подписки

3. **Требуется добавить:**
   - Админские сценарии (управление платформой)
   - Аналитические сценарии
   - SEO сценарии
   - Больше негативных тестов
   - Тесты на граничные случаи

4. **Найдены ошибки в путях** (20 эндпоинтов):
   - Неправильные пути для analytics
   - Неправильные пути для SEO
   - Несоответствие методов HTTP

5. **Рекомендуется создать:**
   - 14 новых комплексных сценариев
   - 50+ негативных тестов
   - Тесты производительности
   - Автоматизацию через Newman/CI

---

**Отчет сгенерирован:** 13 ноября 2025  
**Версия:** 1.0
