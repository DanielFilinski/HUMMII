# ✅ Чеклист тестирования верификации email

## Перед началом

- [ ] Postman установлен (v10.0+)
- [ ] Импортирована коллекция `Hummii-API-with-Scenarios.postman_collection.json`
- [ ] Импортирован environment `Hummii-API-Environment.postman_environment.json`
- [ ] API запущен локально (`docker-compose up` или `npm run start:dev`)
- [ ] База данных доступна (PostgreSQL)

## Способ 1: Быстрый тест (с готовым пользователем)

### Шаги:

1. [ ] Создать тестового пользователя в БД:
   ```sql
   INSERT INTO users (id, email, password, name, "isVerified", "verificationToken", "verificationTokenExpiry", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'test@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyC7mQ5Y7gZq', -- password: Test123!
     'Test User',
     false,
     'test-token-12345',
     NOW() + INTERVAL '24 hours',
     NOW(),
     NOW()
   );
   ```

2. [ ] В Postman Environment установить:
   - `verification_token` = `test-token-12345`
   - `test_email` = `test@example.com`

3. [ ] Запустить сценарий **"📧 Email Verification Flow"**

4. [ ] Проверить результаты:
   - ✅ Все 6 тестов пройдены
   - ✅ Пользователь верифицирован

## Способ 2: Полный цикл (с регистрацией)

### Шаги:

1. [ ] Запустить первый шаг сценария **"Complete User Journey"**:
   - `1. Register New User`

2. [ ] Получить `verification_token` из базы:
   ```bash
   docker exec hummii-postgres psql -U postgres -d hummii -t -c \
     "SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1"
   ```

3. [ ] Скопировать токен и установить в Environment:
   - Variable: `verification_token`
   - Value: `{скопированный_токен}`

4. [ ] Продолжить выполнение сценария:
   - `2. Verify Email`
   - `3. Login User`
   - `4. Get User Profile`
   - `5. Update Profile`

5. [ ] Проверить в профиле `isVerified: true`

## Способ 3: Автоматизация с Newman

### Шаги:

1. [ ] Установить Newman:
   ```bash
   npm install -g newman
   ```

2. [ ] Создать скрипт `run-verification-test.sh`:
   ```bash
   #!/bin/bash
   
   # Получить токен из БД
   TOKEN=$(docker exec hummii-postgres psql -U postgres -d hummii -t -c \
     "SELECT verificationToken FROM users ORDER BY createdAt DESC LIMIT 1" | xargs)
   
   # Запустить тесты
   newman run "docs/postman collection/Hummii-API-with-Scenarios.postman_collection.json" \
     --folder "📧 Email Verification Flow" \
     --environment "docs/postman collection/Hummii-API-Environment.postman_environment.json" \
     --env-var "verification_token=$TOKEN"
   ```

3. [ ] Сделать скрипт исполняемым:
   ```bash
   chmod +x run-verification-test.sh
   ```

4. [ ] Запустить:
   ```bash
   ./run-verification-test.sh
   ```

## Проверка результатов

### В Postman:

- [ ] Все тесты зеленые (PASSED)
- [ ] Консоль показывает:
  ```
  ✅ Step 1: User Registered - PASSED
  ✅ Step 2: Pre-verification login attempt - PASSED
  ✅ Step 3: Email Verified - PASSED
  ✅ Step 4: Post-verification login - PASSED
  ✅ Step 5: Profile verification status - PASSED
  ✅ Step 6: Invalid token rejection - PASSED
  🎉 Email Verification Flow - ALL TESTS PASSED!
  ```

### В базе данных:

```sql
-- Проверить статус пользователя
SELECT 
  email,
  "isVerified",
  "verificationToken",
  "verificationTokenExpiry"
FROM users
WHERE email = 'test@example.com';
```

Ожидаемый результат:
- [ ] `isVerified` = `true`
- [ ] `verificationToken` = `null`
- [ ] `verificationTokenExpiry` = `null`

## Устранение проблем

### Проблема: "Invalid or expired verification token"

**Решение 1:** Проверить срок действия токена
```sql
SELECT 
  email,
  "verificationTokenExpiry" > NOW() as is_valid
FROM users
WHERE email = 'test@example.com';
```

**Решение 2:** Создать новый токен
```sql
UPDATE users
SET 
  "isVerified" = false,
  "verificationToken" = encode(gen_random_bytes(32), 'hex'),
  "verificationTokenExpiry" = NOW() + INTERVAL '24 hours'
WHERE email = 'test@example.com'
RETURNING "verificationToken";
```

### Проблема: Пользователь уже верифицирован

**Решение:** Сбросить статус верификации
```sql
UPDATE users
SET 
  "isVerified" = false,
  "verificationToken" = encode(gen_random_bytes(32), 'hex'),
  "verificationTokenExpiry" = NOW() + INTERVAL '24 hours'
WHERE email = 'test@example.com';
```

### Проблема: Email не отправляется

**Проверить настройки email:**
```bash
# Проверить переменные окружения
docker exec hummii-api env | grep MAIL

# Проверить логи
docker logs hummii-api | grep -i mail
```

**Для разработки:** Используйте MailHog
```yaml
# docker-compose.yml
mailhog:
  image: mailhog/mailhog
  ports:
    - "1025:1025"  # SMTP
    - "8025:8025"  # UI
```

Доступ к UI: http://localhost:8025

## Очистка после тестов

```sql
-- Удалить тестовых пользователей
DELETE FROM users
WHERE email LIKE 'test%@example.com'
OR email LIKE 'verify.test%@example.com';

-- Или удалить всех неверифицированных старше 1 часа
DELETE FROM users
WHERE "isVerified" = false
AND "createdAt" < NOW() - INTERVAL '1 hour';
```

## Дополнительные команды

### Посмотреть всех неверифицированных пользователей:
```sql
SELECT 
  email,
  "createdAt",
  "verificationTokenExpiry" > NOW() as token_valid
FROM users
WHERE "isVerified" = false
ORDER BY "createdAt" DESC;
```

### Верифицировать пользователя вручную (для тестов):
```sql
UPDATE users
SET "isVerified" = true,
    "verificationToken" = null,
    "verificationTokenExpiry" = null
WHERE email = 'test@example.com';
```

## Интеграция в CI/CD

Пример для GitHub Actions:

```yaml
# .github/workflows/api-tests.yml
- name: Wait for API to be ready
  run: |
    for i in {1..30}; do
      curl -f http://localhost:3000/health && break
      sleep 2
    done

- name: Run verification tests
  run: |
    TOKEN=$(docker exec postgres psql -U postgres -d hummii -t -c \
      "SELECT \"verificationToken\" FROM users ORDER BY \"createdAt\" DESC LIMIT 1" | xargs)
    
    newman run postman-collection.json \
      --folder "Email Verification Flow" \
      --env-var "verification_token=$TOKEN" \
      --reporters cli,json \
      --reporter-json-export newman-results.json
```

## Готово! 🎉

Теперь вы можете:
- ✅ Тестировать верификацию email в Postman
- ✅ Автоматизировать тесты с Newman
- ✅ Интегрировать в CI/CD pipeline
- ✅ Отлаживать проблемы с верификацией

Для подробной информации см. [VERIFICATION_TESTING_GUIDE.md](./VERIFICATION_TESTING_GUIDE.md)
