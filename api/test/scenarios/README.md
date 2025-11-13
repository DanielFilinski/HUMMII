# 🎯 Scenario Tests - Automated Testing Suite

Автоматизированные тесты на основе пользовательских сценариев для Hummii API.

## 📋 Содержание

- [Обзор](#обзор)
- [Доступные сценарии](#доступные-сценарии)
- [Быстрый старт](#быстрый-старт)
- [Запуск тестов](#запуск-тестов)
- [Отчеты](#отчеты)
- [CI/CD Integration](#cicd-integration)

## 🎯 Обзор

Scenario Tests — это набор E2E тестов, которые проверяют полные пользовательские сценарии взаимодействия с API, от начала до конца. Каждый сценарий тестирует реальный use case.

### Преимущества

✅ **Автоматизация** - Не нужно запускать Postman вручную  
✅ **CI/CD Ready** - Интеграция с GitHub Actions, GitLab CI  
✅ **Детальные отчеты** - HTML и JUnit отчеты  
✅ **Параллельный запуск** - Отдельные сценарии или все сразу  
✅ **Real Database** - Тесты с реальной базой данных  
✅ **Автоматическая очистка** - Cleanup после каждого теста  

## 📦 Доступные сценарии

### 1. 🚀 Quick Health Check
**Файл:** `health-check.scenario.spec.ts`  
**Время:** ~1 сек  
**Тесты:**
- Health check endpoint
- API version endpoint

### 2. 📧 Email Verification Flow
**Файл:** `email-verification.scenario.spec.ts`  
**Время:** ~8 сек  
**Тесты:**
- Регистрация пользователя (isVerified=false)
- Попытка входа до верификации
- Верификация email с токеном
- Успешный вход после верификации
- Проверка статуса isVerified=true
- Отклонение невалидного токена

### 3. 👤 Complete User Journey
**Файл:** `user-journey.scenario.spec.ts`  
**Время:** ~7 сек  
**Тесты:**
- Регистрация пользователя
- Верификация email
- Логин
- Получение профиля
- Обновление профиля

### 4. 📦 Order Lifecycle
**Файл:** `order-lifecycle.scenario.spec.ts`  
**Время:** ~10 сек  
**Тесты:**
- Создание клиента и подрядчика
- Логин клиента
- Создание заказа (Draft)
- Публикация заказа
- Отправка предложения (Contractor)
- Принятие предложения (Client)
- Завершение заказа

## 🚀 Быстрый старт

### Предварительные требования

```bash
# 1. База данных запущена
docker-compose up -d postgres redis

# 2. API запущен
cd api
npm run start:dev
```

### Установка зависимостей

```bash
cd api
npm install
```

Дополнительные пакеты уже установлены:
- `jest-html-reporters` - HTML отчеты
- `jest-junit` - JUnit XML отчеты

## 🎮 Запуск тестов

### Все сценарии последовательно

```bash
# Через npm script
npm run test:scenarios

# Или через shell script (с красивым выводом)
./run-scenario-tests.sh
```

### Отдельные сценарии

```bash
# Health Check
npm run test:scenarios:health

# Email Verification
npm run test:scenarios:verification

# User Journey
npm run test:scenarios:user

# Order Lifecycle
npm run test:scenarios:order
```

### Watch mode (для разработки)

```bash
npm run test:scenarios:watch
```

### С генерацией отчета

```bash
# Запуск + автоматическое открытие HTML отчета
npm run test:scenarios:report
```

## 📊 Отчеты

### HTML Report

После запуска тестов генерируется красивый HTML отчет:

```
test-reports/scenarios/scenario-tests-report.html
```

**Содержит:**
- Сводка по всем тестам
- Детали каждого теста
- Время выполнения
- Консольные логи
- Ошибки (если есть)

**Открыть отчет:**
```bash
# Linux
xdg-open test-reports/scenarios/scenario-tests-report.html

# MacOS
open test-reports/scenarios/scenario-tests-report.html

# Windows
start test-reports/scenarios/scenario-tests-report.html
```

### JUnit XML Report

Для интеграции с CI/CD:

```
test-reports/scenarios/junit-scenarios.xml
```

Используется в Jenkins, GitLab CI, GitHub Actions для отображения результатов.

### Log Files

Детальные логи каждого запуска:

```
test-reports/scenarios/test-run-YYYYMMDD_HHMMSS.log
```

## 🔧 Конфигурация

### Jest Configuration

Файл: `test/scenarios/jest-scenarios.json`

```json
{
  "testRegex": ".scenario.spec.ts$",
  "testTimeout": 30000,
  "reporters": [
    "default",
    "jest-html-reporters",
    "jest-junit"
  ]
}
```

### Environment Variables

Тесты используют те же переменные окружения, что и API:

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/hummii
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## 🐳 Docker Support

### Запуск тестов в Docker

```bash
# Build и run
docker-compose -f docker-compose.test.yml up --build

# Только scenarios
docker-compose -f docker-compose.test.yml run api npm run test:scenarios
```

### docker-compose.test.yml

```yaml
version: '3.8'
services:
  api-test:
    build: ./api
    command: npm run test:scenarios
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/hummii_test
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./api/test-reports:/app/test-reports
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/scenario-tests.yml
name: Scenario Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json
      
      - name: Install dependencies
        working-directory: ./api
        run: npm ci
      
      - name: Run migrations
        working-directory: ./api
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/hummii_test
      
      - name: Run scenario tests
        working-directory: ./api
        run: npm run test:scenarios
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/hummii_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload test reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: api/test-reports/scenarios/
      
      - name: Publish test results
        if: always()
        uses: EnricoMi/publish-unit-test-result-action@v2
        with:
          files: api/test-reports/scenarios/junit-scenarios.xml
```

### GitLab CI

```yaml
# .gitlab-ci.yml
scenario-tests:
  stage: test
  image: node:20
  
  services:
    - postgres:15
    - redis:7-alpine
  
  variables:
    POSTGRES_DB: hummii_test
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/hummii_test
    REDIS_URL: redis://redis:6379
  
  before_script:
    - cd api
    - npm ci
    - npx prisma migrate deploy
  
  script:
    - npm run test:scenarios
  
  artifacts:
    when: always
    paths:
      - api/test-reports/scenarios/
    reports:
      junit: api/test-reports/scenarios/junit-scenarios.xml
```

## 📝 Написание новых сценариев

### Шаблон сценария

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * 🎯 My New Scenario
 * 
 * Tests: Description of what this scenario tests
 * Steps:
 * 1. Step 1 description
 * 2. Step 2 description
 * ...
 */
describe('🎯 My New Scenario (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  // Test variables
  let testData: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    
    console.log('🎬 Starting My New Scenario...');
  });

  afterAll(async () => {
    // Cleanup
    await app.close();
  });

  describe('Step 1: Description', () => {
    it('should do something', async () => {
      const response = await request(app.getHttpServer())
        .get('/endpoint')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      
      console.log('✅ Step 1: Description - PASSED');
    });
  });

  // More steps...
});
```

### Добавление в runner

1. Создайте файл: `test/scenarios/my-scenario.scenario.spec.ts`
2. Добавьте npm script в `package.json`:
```json
{
  "scripts": {
    "test:scenarios:my": "jest --config ./test/scenarios/jest-scenarios.json --testPathPattern=my-scenario --runInBand"
  }
}
```
3. Добавьте в `run-scenario-tests.sh`:
```bash
scenarios=(
    ...
    "🎯 My New Scenario:my"
)
```

## 🐛 Troubleshooting

### Тесты падают с timeout

Увеличьте timeout в `jest-scenarios.json`:
```json
{
  "testTimeout": 60000
}
```

### База данных не очищается

Проверьте `afterAll` hooks в тестах. Должна быть очистка:
```typescript
afterAll(async () => {
  if (userId) {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  }
  await app.close();
});
```

### API не отвечает

Проверьте, что API запущен:
```bash
curl http://localhost:3000/health
```

Или запустите:
```bash
npm run start:dev
```

### Конфликты с существующими данными

Используйте уникальные email/данные в каждом тесте:
```typescript
const timestamp = Date.now();
const testEmail = `test.${timestamp}@example.com`;
```

## 📚 Дополнительные ресурсы

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Postman Collection](../../docs/postman%20collection/)

## 🤝 Contributing

При добавлении новых endpoints обязательно создайте соответствующие scenario tests:

1. Создайте новый scenario файл
2. Добавьте npm scripts
3. Обновите runner script
4. Обновите эту документацию
5. Добавьте CI/CD конфигурацию при необходимости

## 📄 License

Private - Hummii Platform
