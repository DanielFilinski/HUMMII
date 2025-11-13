# 🚀 Быстрый старт - Scenario Tests

## Установка

```bash
cd api
npm install
```

## Запуск

### 1. Убедитесь что API запущен

```bash
# Terminal 1: Запуск API
npm run start:dev

# Terminal 2: Проверка
curl http://localhost:3000/health
```

### 2. Запустите тесты

```bash
# Все сценарии
npm run test:scenarios

# Или с красивым выводом
./run-scenario-tests.sh

# Отдельный сценарий
npm run test:scenarios:health        # Health Check
npm run test:scenarios:verification  # Email Verification
npm run test:scenarios:user          # User Journey
npm run test:scenarios:order         # Order Lifecycle
```

### 3. Просмотрите отчеты

```bash
# HTML отчет (автоматически открывается)
npm run test:scenarios:report

# Или вручную
open test-reports/scenarios/scenario-tests-report.html
```

## Доступные сценарии

| Сценарий | Время | Команда |
|----------|-------|---------|
| 🚀 Health Check | ~1s | `npm run test:scenarios:health` |
| 📧 Email Verification | ~8s | `npm run test:scenarios:verification` |
| 👤 User Journey | ~7s | `npm run test:scenarios:user` |
| 📦 Order Lifecycle | ~10s | `npm run test:scenarios:order` |
| **Все сразу** | ~26s | `npm run test:scenarios` |

## Отчеты

После запуска доступны:

- **HTML Report:** `test-reports/scenarios/scenario-tests-report.html`
- **JUnit XML:** `test-reports/scenarios/junit-scenarios.xml`  
- **Logs:** `test-reports/scenarios/test-run-*.log`

## Структура

```
api/test/scenarios/
├── health-check.scenario.spec.ts       # 🚀 Health Check
├── email-verification.scenario.spec.ts # 📧 Email Verification
├── user-journey.scenario.spec.ts       # 👤 User Journey
├── order-lifecycle.scenario.spec.ts    # 📦 Order Lifecycle
├── jest-scenarios.json                 # Jest config
├── setup.ts                            # Setup файл
└── README.md                           # Полная документация
```

## CI/CD

Тесты автоматически запускаются в GitHub Actions:

- ✅ При push в `main` или `dev`
- ✅ При создании Pull Request
- ✅ Ручной запуск (workflow_dispatch)

**Workflow файл:** `.github/workflows/scenario-tests.yml`

## Troubleshooting

### API не запущен
```bash
npm run start:dev
```

### Timeout ошибки
Увеличьте timeout в `jest-scenarios.json`:
```json
{
  "testTimeout": 60000
}
```

### База данных
Убедитесь что PostgreSQL и Redis запущены:
```bash
docker-compose up -d postgres redis
```

## Подробнее

См. [полную документацию](./README.md) для:
- Написания новых сценариев
- Конфигурации
- Docker support
- CI/CD интеграции
- Troubleshooting

## Контакты

Вопросы? Проблемы? Создайте issue в репозитории.
