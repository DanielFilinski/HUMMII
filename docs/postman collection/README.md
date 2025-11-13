# Hummii API - Postman Collection

Complete Postman collections for testing Hummii API endpoints.

## 📦 Files

### 🎯 Коллекции

- **Hummii-API-with-Scenarios.postman_collection.json** ⭐ **РЕКОМЕНДУЕТСЯ** - Коллекция с 10 автоматизированными тестовыми сценариями
- **Hummii-WebSocket.postman_collection.json** 🔌 **НОВОЕ** - WebSocket endpoints для real-time функционала
- **Hummii-API.postman_collection.json** - Оригинальная коллекция со всеми 185+ endpoints
- **Hummii-API-Environment.postman_environment.json** - Environment variables для локальной разработки

### 📚 Документация

- **[POSTMAN_SCENARIOS_GUIDE.md](./POSTMAN_SCENARIOS_GUIDE.md)** - Подробное руководство по использованию тестовых сценариев
- **[WEBSOCKET_TESTING_GUIDE.md](./WEBSOCKET_TESTING_GUIDE.md)** - Руководство по тестированию WebSocket

---

## 🎯 Что Нового: Тестовые Сценарии

### ✨ Возможности

Новая коллекция **Hummii-API-with-Scenarios.postman_collection.json** содержит:

✅ **10 автоматизированных сценариев** - запуск в один клик  
✅ **~40 последовательных запросов** - полные пользовательские flow  
✅ **Автоматическое управление токенами** - не нужно копировать вручную  
✅ **Встроенные assertions** - автоматические проверки корректности  
✅ **Генерация тестовых данных** - уникальные email при каждом запуске  
✅ **Консольные логи** - детальная информация о выполнении  
✅ **CI/CD готовность** - интеграция с Newman CLI  

### 🎬 Доступные Сценарии

1. 🚀 **Quick Health Check** - Проверка доступности API (~1 сек)
2. 👤 **Complete User Journey** - Регистрация → Логин → Профиль (~5 сек)
3. 📦 **Order Lifecycle** - Полный цикл заказа (~10 сек)
4. 🏗️ **Contractor Setup** - Настройка профиля подрядчика (~6 сек)
5. 💎 **Subscription Management** - Управление подписками (~6 сек)
6. ⭐ **Review System Flow** - Создание и ответ на отзывы (~6 сек)
7. ⚖️ **Dispute Resolution** - Разрешение споров (~6 сек)
8. 💬 **Chat Flow** - Отправка и получение сообщений (~5 сек)
9. 🔔 **Notifications Flow** - Система уведомлений (~7 сек)
10. 🔐 **Security & Error Handling** - Тестирование безопасности (~5 сек)

### ⚡ Быстрый Запуск Сценариев

```
1. Импортируйте Hummii-API-with-Scenarios.postman_collection.json
2. Выберите Environment: "Hummii API - Local"
3. Раскройте папку "🎯 Test Scenarios"
4. Правый клик на любой сценарий → "Run folder"
5. Нажмите "Run" и наблюдайте за результатами!
```

**Полная документация:** [POSTMAN_SCENARIOS_GUIDE.md](./POSTMAN_SCENARIOS_GUIDE.md)

---

## 🔌 WebSocket Testing (НОВОЕ!)

### ✨ WebSocket Endpoints

Hummii API использует **Socket.IO** для real-time коммуникации:

#### 💬 Chat WebSocket
- **URL:** `ws://localhost:3000/chat`
- **Функции:** 
  - Мгновенные сообщения
  - Typing indicators (печатает...)
  - Read receipts (прочитано)
  - Online presence
  - Message editing

#### 🔔 Notifications WebSocket
- **URL:** `ws://localhost:3000/notifications`
- **Функции:**
  - Real-time уведомления
  - Unread count tracking
  - Mark as read
  - Instant delivery (<200ms)

### 🚀 Быстрый Старт WebSocket

```
1. Импортируйте Hummii-WebSocket.postman_collection.json
2. Требуется Postman Desktop v10.18+ (WebSocket support)
3. Получите JWT token через HTTP login
4. Откройте WebSocket request
5. URL: ws://localhost:3000/chat?token={{access_token}}
6. Click "Connect"
7. Отправляйте JSON события и получайте ответы!
```

### 📝 Пример WebSocket События

```json
{
  "event": "send_message",
  "data": {
    "orderId": "order-uuid",
    "content": "Hello!",
    "type": "TEXT"
  }
}
```

### 🧪 Методы Тестирования WebSocket

| Метод | Удобство | Автоматизация | Использование |
|-------|----------|---------------|---------------|
| **Postman Desktop** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Ручное тестирование |
| **Browser Console** | ⭐⭐⭐⭐ | ⭐ | Разработка |
| **wscat CLI** | ⭐⭐ | ⭐⭐⭐ | Быстрые тесты |
| **Jest Tests** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | CI/CD |

**Полное руководство:** [WEBSOCKET_TESTING_GUIDE.md](./WEBSOCKET_TESTING_GUIDE.md)

---

## 🚀 Quick Start

### 1. Import Collection and Environment

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Hummii-API.postman_collection.json`
   - `Hummii-API-Environment.postman_environment.json`
4. Select environment: **Hummii API - Local**

### 2. Configure Base URL

If your API runs on a different port or host, update the `base_url` variable in the environment:

- Default: `http://localhost:3000/api/v1`
- Production: `https://api.hummii.ca/api/v1`

### 3. Start API Server

```bash
# Using Docker
docker compose up -d postgres redis api

# Or manually
cd api
pnpm run start:dev
```

### 4. Run Tests

#### Basic Flow:

1. **Register User** - Creates a new user account
2. **Verify Email** - Get token from database (see below)
3. **Login** - Gets access and refresh tokens (automatically saved)
4. **Get Current User Profile** - Test protected route
5. **Update User Profile** - Modify user data
6. **Export User Data** - PIPEDA compliance
7. **Logout** - End session

## 📋 Collection Structure

### Authentication
- `Register User` - Create new account
- `Verify Email` - Verify email address
- `Login` - Authenticate and get tokens
- `Refresh Token` - Get new access token
- `Logout` - End current session
- `Logout All Sessions` - End all sessions
- `Password Reset Request` - Request password reset
- `Password Reset Confirm` - Confirm password reset
- `Get Active Sessions` - List all sessions
- `Delete Session` - Remove specific session

### Users
- `Get Current User Profile` - Get authenticated user data
- `Update User Profile` - Update user information
- `Export User Data` - Export all user data (PIPEDA)
- `Delete User Account` - Soft delete account (PIPEDA)

### Contractors
- `Create Contractor Profile` - Create contractor profile
- `Update Contractor Profile` - Update contractor information
- `Get Contractor Profile` - Get contractor profile
- `Update Location` - Update contractor location
- `Add Portfolio Item` - Add portfolio item
- `Update Portfolio Item` - Update portfolio item
- `Delete Portfolio Item` - Delete portfolio item
- `Assign Categories` - Assign categories to contractor

### Orders
- `Create Order` - Create new order
- `Publish Order` - Publish order
- `Get Order Details` - Get order information
- `Update Order Status` - Update order status
- `Search Orders` - Search and filter orders
- `Submit Proposal` - Submit proposal for order
- `Accept Proposal` - Accept contractor proposal
- `Reject Proposal` - Reject contractor proposal

### Chat
- `Get Messages` - Get chat message history
- `Send Message` - Send message (REST fallback)
- `Edit Message` - Edit message (within 5 minutes)
- `Mark as Read` - Mark messages as read
- `Export Chat` - Export chat as PDF/TXT (PIPEDA)

### Reviews
- `Create Review` - Create review for completed order
- `Get User Reviews` - Get reviews for a user
- `Update Review` - Update review (before moderation)
- `Delete Review` - Delete review (soft delete)
- `Respond to Review` - Respond to review
- `Report Review` - Report inappropriate review
- `Get Review Statistics` - Get rating statistics

### Subscriptions
- `Create Subscription` - Create subscription (CONTRACTOR only)
- `Get My Subscription` - Get current subscription
- `Upgrade Subscription` - Upgrade subscription tier
- `Downgrade Subscription` - Downgrade subscription tier
- `Cancel Subscription` - Cancel subscription
- `Reactivate Subscription` - Reactivate canceled subscription
- `Customer Portal` - Get Stripe Customer Portal session

### Notifications
- `Get Notifications` - Get user notifications
- `Get Unread Count` - Get unread notifications count
- `Mark as Read` - Mark notification as read
- `Mark All as Read` - Mark all notifications as read
- `Delete Notification` - Delete notification
- `Get Preferences` - Get notification preferences
- `Update Preferences` - Update notification preferences

### Disputes
- `Create Dispute` - Create dispute for order
- `Get Disputes` - Get user disputes
- `Get Dispute Details` - Get dispute information
- `Upload Evidence` - Upload dispute evidence
- `Add Message` - Add message to dispute
- `Get Messages` - Get dispute messages

### Categories
- `Get Category Tree` - Get hierarchical category structure
- `Get Popular Categories` - Get popular categories
- `Get Public Categories` - Get all active categories
- `Get Subcategories` - Get category subcategories
- `Create Category` - Create category (ADMIN only)
- `Update Category` - Update category (ADMIN only)
- `Delete Category` - Delete category (ADMIN only)

### SEO & Analytics
- `Generate Slug` - Generate unique slug for contractor
- `Validate Slug` - Check slug availability
- `Update Slug` - Update contractor slug
- `Get Sitemap` - Get sitemap XML
- `Track View` - Track profile/order view
- `Track Search` - Track search query
- `Track Conversion` - Track conversion event

### Admin
- `User Management` - List, view, update users
- `Contractor Verification` - Approve/reject contractors
- `Portfolio Moderation` - Approve/reject portfolio items
- `Review Moderation` - Moderate reviews
- `Order Management` - Manage orders
- `Subscription Management` - Manage subscriptions
- `Notification Management` - Send bulk notifications
- `System Settings` - Manage system settings
- `Feature Flags` - Manage feature flags
- `Audit Logs` - View audit logs
- `Statistics` - Get platform statistics

### Security Tests
- `Register - Weak Password` - Test validation
- `Register - Invalid Email` - Test validation
- `Get Profile - Unauthorized` - Test auth guard
- `Get Profile - Invalid Token` - Test token validation
- `Rate Limiting Test` - Test rate limiting

## 🔐 Getting Verification and Reset Tokens

### Option 1: From Database (Recommended for Testing)

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U hummii -d hummii_dev

# Get verification token
SELECT email, "verificationToken" FROM users WHERE email = 'test@example.com';

# Get reset token (after requesting password reset)
SELECT email, "resetToken" FROM users WHERE email = 'test@example.com';

# Exit
\q
```

Then copy the token to Postman environment variable:
- `verification_token` for email verification
- `reset_token` for password reset

### Option 2: From Email

1. Check email inbox for verification/reset email
2. Extract token from email link
3. Update environment variable in Postman

## 🔄 Automatic Token Management

The collection automatically saves tokens after login:

- `access_token` - Saved after successful login
- `refresh_token` - Saved after successful login
- `user_id` - Saved after successful login
- `user_email` - Saved after registration/login

These tokens are automatically used in authenticated requests via Bearer token.

## ✅ Test Scripts

Each request includes test scripts that:

1. Verify status codes
2. Validate response structure
3. Check response times
4. Automatically save tokens (for login/refresh)
5. Clear tokens (for logout/delete account)

## 📊 Running Tests in Sequence

### Full Registration Flow

```
1. Register User
2. Verify Email (get token from DB first)
3. Login
4. Get Current User Profile
5. Update User Profile
6. Export User Data
7. Logout
```

### Password Reset Flow

```
1. Password Reset Request
2. Get reset_token from database
3. Password Reset Confirm (with new password)
4. Login with new password
```

### Session Management Flow

```
1. Login (creates session)
2. Get Active Sessions (save session_id)
3. Delete Session (using session_id)
4. Logout All Sessions
```

## 🧪 Testing Security Features

### Rate Limiting

1. Run `Rate Limiting Test` request
2. Send it 10+ times quickly using Postman's "Send" button or runner
3. After 5 requests per minute, you should get `429 Too Many Requests`

### Validation

1. Run `Register - Weak Password` - Should return `400 Bad Request`
2. Run `Register - Invalid Email` - Should return `400 Bad Request`

### Authentication

1. Run `Get Profile - Unauthorized` - Should return `401 Unauthorized`
2. Run `Get Profile - Invalid Token` - Should return `401 Unauthorized`

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000/api/v1` |
| `access_token` | JWT access token | (auto-filled after login) |
| `refresh_token` | JWT refresh token | (auto-filled after login) |
| `user_id` | Current user ID | (auto-filled after login) |
| `user_email` | Current user email | `test@example.com` |
| `verification_token` | Email verification token | (from DB or email) |
| `reset_token` | Password reset token | (from DB or email) |
| `session_id` | Session ID | (from Get Active Sessions) |

## 📝 Notes

### Token Expiration

- **Access Token**: 15 minutes (default)
- **Refresh Token**: 7 days (default)

If access token expires:
1. Use `Refresh Token` request to get new tokens
2. Tokens are automatically saved and used in subsequent requests

### PIPEDA Compliance

The collection includes PIPEDA compliance endpoints:
- **Right to Access**: `Export User Data`
- **Right to Rectification**: `Update User Profile`
- **Right to Erasure**: `Delete User Account`
- **Right to Data Portability**: `Export User Data`

### Rate Limits

- **Login**: 5 requests per minute
- **Register**: 5 requests per minute
- **Password Reset**: 3 requests per minute
- **Global**: 100 requests per minute

## 🐛 Troubleshooting

### Connection Refused

- Ensure API server is running: `docker compose ps api`
- Check API logs: `docker compose logs api`
- Verify port: Default is `3000`

### 401 Unauthorized

- Token may be expired - use `Refresh Token` request
- Token may be invalid - re-run `Login` request
- Check that `access_token` variable is set in environment

### 400 Bad Request

- Check request body format (must be valid JSON)
- Verify all required fields are present
- Check validation rules (password length, email format, etc.)

### 429 Too Many Requests

- Rate limit exceeded - wait 60 seconds before retrying
- Reduce request frequency in test scripts

## 🔗 Related Documentation

- [API README](../../../api/README.md)
- [Security Documentation](../../security.md)
- [Deployment Guide](../../DEPLOYMENT.md)

---

## 🔄 Updating the Collection

### Automatic Update (Recommended)

The Postman collection can be automatically updated from Swagger documentation:

```bash
# From project root
./scripts/update-postman-collection.sh
```

This script will:
1. Export Swagger JSON from the running API
2. Convert Swagger to Postman collection format
3. Update `docs/postman collection/Hummii-API.postman_collection.json`
4. Preserve existing test scripts and environment variables

### Manual Update

1. Ensure API is running: `cd api && npm run start:dev`
2. Export Swagger: `cd api && npm run export-swagger`
3. Convert to Postman: `openapi2postmanv2 -s docs/api/swagger.json -o "docs/postman collection/Hummii-API.postman_collection.json"`

### Adding Custom Test Scripts

After updating the collection, you may need to add custom test scripts for specific endpoints. Test scripts are preserved during automatic updates, but new endpoints will have basic scripts.

## 📝 Notes

### Collection Organization

The collection is organized by modules:
- Authentication
- Users
- Contractors
- Orders
- Chat
- Reviews
- Subscriptions
- Notifications
- Disputes
- Categories
- SEO & Analytics
- Admin
- Security Tests

Each module folder contains all related endpoints with proper authentication and test scripts.

### Rate Limits

- **Login**: 5 requests per minute
- **Register**: 5 requests per minute
- **Password Reset**: 3 requests per minute
- **Chat Messages**: 20 messages per minute
- **Order Creation**: 10 orders per hour
- **Review Creation**: 5 reviews per hour
- **Global**: 100 requests per minute

**Last Updated:** January 6, 2025  
**Version:** 2.0.0  
**API Version:** 1.0

