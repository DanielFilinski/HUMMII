# Миграция: Add Cookie Preferences

**Дата:** 2025-11-03  
**Миграция:** `20251103042338_add_cookie_preferences`  
**Статус:** ✅ Успешно применена

---

## Что добавлено

### Prisma Schema

Добавлено поле `cookiePreferences` в модель `User`:

```prisma
model User {
  // ...
  // Cookie preferences (PIPEDA compliance)
  cookiePreferences Json? // { essential: boolean, functional: boolean, analytics: boolean, marketing: boolean }
  // ...
}
```

### Database Migration

```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "cookiePreferences" JSONB;

-- Comment
COMMENT ON COLUMN "users"."cookiePreferences" IS 'User cookie consent preferences (PIPEDA compliance)';
```

---

## Backend Endpoint

**Endpoint:** `POST /users/me/cookie-preferences`

**Request Body:**
```json
{
  "preferences": {
    "essential": true,    // Always true (required)
    "functional": true,   // User choice
    "analytics": false,  // User choice
    "marketing": false   // User choice
  }
}
```

**Response:**
```json
{
  "message": "Cookie preferences updated successfully",
  "preferences": {
    "essential": true,
    "functional": true,
    "analytics": false,
    "marketing": false
  }
}
```

---

## Audit Logging

Обновления cookie preferences логируются в `AuditLog`:

- **Action:** `COOKIE_PREFERENCES_UPDATED`
- **Entity:** `USER`
- **Metadata:** Содержит обновлённые preferences

---

## PIPEDA Compliance

Этот функционал реализует:
- **Right to Withdraw Consent** — пользователь может изменить согласие на cookies в любое время
- **Transparency** — пользователь видит свои текущие настройки
- **Audit Trail** — все изменения логируются для compliance

---

## Frontend Integration (TODO)

Фронтенд должен:
1. Показать Cookie Consent Banner при первом посещении
2. Отправить `POST /users/me/cookie-preferences` при выборе пользователя
3. Сохранить preferences в localStorage для неавторизованных пользователей
4. Синхронизировать с backend при авторизации

---

**Файлы миграции:**
- `api/prisma/migrations/20251103042338_add_cookie_preferences/migration.sql`

**Статус:** ✅ Применена к базе данных `hummii_dev`

