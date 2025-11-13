# 📧 Руководство по тестированию верификации email в Postman

## Обзор

Коллекция Postman для Hummii API включает полный сценарий тестирования верификации email. Этот документ объясняет, как работать с токенами верификации email при тестировании.

## Процесс верификации email

### 1. Регистрация пользователя
При регистрации нового пользователя:
- Создается аккаунт с `isVerified: false`
- Генерируется токен верификации (срок действия 24 часа)
- Отправляется email с токеном верификации

### 2. Верификация email
Пользователь переходит по ссылке из письма:
```
GET /api/v1/auth/verify-email?token={verification_token}
```

### 3. После верификации
- `isVerified` меняется на `true`
- Токен верификации удаляется
- Пользователь получает полный доступ

## Тестирование в Postman

### Сценарий 1: Полный путь пользователя (Complete User Journey)

Включает этапы:
1. **Register New User** - Регистрация (получаете `isVerified: false`)
2. **Verify Email** - Верификация email
3. **Login User** - Вход в систему
4. **Get User Profile** - Проверка профиля (`isVerified: true`)
5. **Update Profile** - Обновление профиля

### Сценарий 2: Email Verification Flow

Специализированный сценарий для тестирования верификации:
1. **Register User** - Создание тестового пользователя
2. **Try Login Before Verification** - Попытка входа до верификации
3. **Verify Email with Token** - Верификация email
4. **Login After Verification** - Успешный вход после верификации
5. **Verify Profile Shows isVerified=true** - Проверка статуса
6. **Try Invalid Token** - Тест с невалидным токеном

## Получение токена верификации

### Способ 1: Из базы данных (Рекомендуется для тестирования)

```sql
-- Получить токен для конкретного пользователя
SELECT 
    id,
    email,
    verificationToken,
    verificationTokenExpiry,
    isVerified
FROM users 
WHERE email = 'test@example.com';
```

**Пример:**
```bash
# PostgreSQL
psql -U postgres -d hummii -c "SELECT email, verificationToken FROM users WHERE email = 'test.user.1731513600000@example.com';"
```

### Способ 2: Из email (Если настроена отправка)

Если настроена отправка email (через Mailgun, SendGrid и т.д.), проверьте:
- Входящие письма на указанный email
- Sandbox/тестовый inbox провайдера email
- Логи email сервиса

### Способ 3: Из логов API

Если в режиме разработки логируются токены:
```bash
# Просмотр логов API
docker logs hummii-api | grep "verificationToken"
```

### Способ 4: Использование MailHog (Dev окружение)

Если используется MailHog для перехвата email:
```bash
# MailHog UI обычно доступен на
http://localhost:8025
```

## Установка токена в Postman

### Метод 1: Через переменные окружения (Environment Variables)

1. В Postman перейдите в **Environments**
2. Выберите `Hummii API - Local`
3. Добавьте переменную:
   - **Variable:** `verification_token`
   - **Initial Value:** `{ваш_токен_из_базы}`
   - **Current Value:** `{ваш_токен_из_базы}`
4. Сохраните

### Метод 2: Через Pre-request Script

Добавьте в Pre-request Script шага "Verify Email":

```javascript
// Установить токен напрямую (для быстрого тестирования)
pm.environment.set('verification_token', 'ваш_токен_здесь');
```

### Метод 3: Временная подстановка

В URL запроса замените:
```
{{verification_token}}
```
на реальный токен:
```
abc123def456...
```

## Примеры SQL запросов для тестирования

### Получить последний зарегистрированный токен
```sql
SELECT 
    email,
    verificationToken,
    verificationTokenExpiry,
    createdAt
FROM users 
ORDER BY createdAt DESC 
LIMIT 1;
```

### Найти все неподтвержденные аккаунты
```sql
SELECT 
    id,
    email,
    verificationToken,
    isVerified,
    createdAt
FROM users 
WHERE isVerified = false
ORDER BY createdAt DESC;
```

### Проверить истек ли токен
```sql
SELECT 
    email,
    verificationToken,
    verificationTokenExpiry,
    CASE 
        WHEN verificationTokenExpiry > NOW() THEN 'Valid'
        ELSE 'Expired'
    END as token_status
FROM users 
WHERE email = 'test@example.com';
```

### Сбросить токен верификации (для повторного тестирования)
```sql
UPDATE users
SET 
    isVerified = false,
    verificationToken = encode(gen_random_bytes(32), 'hex'),
    verificationTokenExpiry = NOW() + INTERVAL '24 hours'
WHERE email = 'test@example.com';
```

## Автоматизация для CI/CD

### Вариант 1: Использование Newman CLI

```bash
# Запуск с предустановленным токеном
newman run Hummii-API-with-Scenarios.postman_collection.json \
  --environment local.postman_environment.json \
  --env-var "verification_token=$(psql -U postgres -d hummii -t -c \"SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1\")"
```

### Вариант 2: Docker Compose с тестовым скриптом

```yaml
# docker-compose.test.yml
services:
  newman:
    image: postman/newman
    command: >
      run /etc/newman/collection.json
      --environment /etc/newman/environment.json
      --env-var "verification_token=${VERIFICATION_TOKEN}"
    volumes:
      - ./docs/postman collection:/etc/newman
    depends_on:
      - api
      - postgres
```

```bash
# Скрипт для получения токена и запуска тестов
#!/bin/bash
export VERIFICATION_TOKEN=$(docker exec hummii-postgres psql -U postgres -d hummii -t -c "SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1")
docker-compose -f docker-compose.test.yml up newman
```

## Обработка ошибок

### Ошибка: "Invalid or expired verification token"

**Причины:**
- Токен истек (срок действия 24 часа)
- Неправильный токен
- Email уже верифицирован
- Токен был удален из базы

**Решение:**
```sql
-- Проверить статус токена
SELECT 
    email,
    isVerified,
    verificationTokenExpiry > NOW() as is_token_valid
FROM users 
WHERE email = 'test@example.com';
```

### Ошибка: "User already verified"

Email уже верифицирован. Для повторного тестирования:
```sql
-- Сброс статуса верификации
UPDATE users
SET 
    isVerified = false,
    verificationToken = encode(gen_random_bytes(32), 'hex'),
    verificationTokenExpiry = NOW() + INTERVAL '24 hours'
WHERE email = 'test@example.com'
RETURNING email, verificationToken;
```

## Best Practices

### 1. Использование уникальных email для каждого теста
```javascript
// В Pre-request Script
const timestamp = Date.now();
const testEmail = `test.${timestamp}@example.com`;
pm.environment.set('test_email', testEmail);
```

### 2. Очистка тестовых данных
```sql
-- Удаление тестовых пользователей
DELETE FROM users 
WHERE email LIKE 'test.%@example.com'
AND createdAt < NOW() - INTERVAL '1 hour';
```

### 3. Создание helper-скрипта

```bash
#!/bin/bash
# get-verification-token.sh

EMAIL=$1
if [ -z "$EMAIL" ]; then
    echo "Usage: ./get-verification-token.sh email@example.com"
    exit 1
fi

TOKEN=$(docker exec hummii-postgres psql -U postgres -d hummii -t -c \
  "SELECT verificationToken FROM users WHERE email = '$EMAIL'")

echo "Verification token for $EMAIL:"
echo "$TOKEN" | xargs
```

Использование:
```bash
./get-verification-token.sh test@example.com
```

## Интеграция с Jest/Supertest

Для автоматических тестов в коде:

```typescript
// test/auth.e2e-spec.ts
describe('Email Verification', () => {
  let verificationToken: string;
  let userEmail: string;

  it('should register user and generate verification token', async () => {
    userEmail = `test.${Date.now()}@example.com`;
    
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: userEmail,
        password: 'Test123!',
        name: 'Test User'
      })
      .expect(201);

    // Получить токен из БД
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    verificationToken = user.verificationToken;
    expect(verificationToken).toBeDefined();
    expect(user.isVerified).toBe(false);
  });

  it('should verify email with valid token', async () => {
    await request(app.getHttpServer())
      .get(`/auth/verify-email?token=${verificationToken}`)
      .expect(200);

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    expect(user.isVerified).toBe(true);
    expect(user.verificationToken).toBeNull();
  });

  it('should reject invalid token', async () => {
    await request(app.getHttpServer())
      .get('/auth/verify-email?token=invalid-token')
      .expect(400);
  });
});
```

## FAQ

### Q: Можно ли пропустить верификацию в тестах?

A: Для тестовой среды можно добавить опцию автоматической верификации:

```typescript
// auth.service.ts (только для DEV!)
async register(registerDto: RegisterDto) {
  const isDevMode = this.configService.get('NODE_ENV') === 'development';
  
  const user = await this.prisma.user.create({
    data: {
      ...userData,
      isVerified: isDevMode ? true : false, // Auto-verify в dev
    }
  });
}
```

### Q: Как протестировать истечение токена?

```sql
-- Сделать токен истекшим
UPDATE users
SET verificationTokenExpiry = NOW() - INTERVAL '1 hour'
WHERE email = 'test@example.com';
```

### Q: Можно ли использовать фиксированный токен для тестов?

Да, в тестовой среде:

```typescript
// auth.service.ts
const verificationToken = this.configService.get('NODE_ENV') === 'test' 
  ? 'test-token-12345'  // Фиксированный токен для тестов
  : crypto.randomBytes(32).toString('hex');
```

## Связанные документы

- [API Documentation](../api/)
- [Testing Guide](../../TESTING_GUIDE.md)
- [Quick Start](../../README.md)
- [Security Best Practices](../../SECURITY_BEST_PRACTICES.md)
