# Development Guide - Hummii

> **Версия:** 1.0
> **Последнее обновление:** 27 октября 2025
> **Проект:** Hummii Service Marketplace Platform

---

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Настройка окружения](#настройка-окружения)
3. [Доступные скрипты](#доступные-скрипты)
4. [Команды базы данных](#команды-базы-данных)
5. [Общие задачи](#общие-задачи)
6. [Проверка качества кода](#проверка-качества-кода)
7. [Docker команды](#docker-команды)
8. [Troubleshooting](#troubleshooting)
9. [Быстрая справка](#быстрая-справка)

---

## Быстрый старт

### Предварительные требования

- **Node.js** 20+
- **Docker Desktop** (рекомендуется) или Docker Engine + Docker Compose v2+
- **pnpm** (рекомендуется) или npm/yarn
- **Git**

### Quick Start с Docker (рекомендуется)

```bash
# 1. Клонировать репозиторий
git clone git@github.com:DanielFilinski/HUMMII.git
cd Hummii

# 2. Копировать файл окружения
cp .env.example .env

# 3. Редактировать .env с вашими значениями
nano .env  # или используйте ваш любимый редактор

# 4. Запустить все сервисы
docker compose up -d

# 5. Проверить статус
docker compose ps

# 6. Просмотреть логи
docker compose logs -f
```

### Доступ к сервисам

После запуска Docker Compose:

| Сервис | URL | Описание |
|--------|-----|----------|
| API | http://localhost:3000 | Backend NestJS |
| Swagger | http://localhost:3000/api | API документация |
| Frontend | http://localhost:3001 | Next.js приложение |
| Admin | http://localhost:3002 | Admin панель Refine |
| PgAdmin | http://localhost:5050 | PostgreSQL GUI (опционально) |
| Redis Commander | http://localhost:8081 | Redis GUI (опционально) |

**Для доступа к опциональным инструментам:**

```bash
docker compose --profile tools up -d
```

---

## Настройка окружения

### Ручная настройка (без Docker)

```bash
# Установить зависимости для каждого сервиса
cd api && pnpm install
cd ../frontend && pnpm install
cd ../admin && pnpm install

# Установить базы данных (macOS)
brew install postgresql@15 redis

# Или на Linux (Ubuntu/Debian)
sudo apt-get install postgresql-15 redis-server

# Запустить сервисы
brew services start postgresql@15  # macOS
brew services start redis

# Или на Linux
sudo systemctl start postgresql
sudo systemctl start redis-server
```

### Настройка базы данных PostgreSQL

```bash
# Создать пользователя и базу данных
psql postgres

CREATE USER hummii WITH PASSWORD 'your_password';
CREATE DATABASE hummii_dev OWNER hummii;
GRANT ALL PRIVILEGES ON DATABASE hummii_dev TO hummii;

# Включить PostGIS (для геолокации)
\c hummii_dev
CREATE EXTENSION postgis;

\q
```

### Настройка переменных окружения

Файл `.env.example` содержит **251 строку** конфигурации. Основные категории:

```bash
# General
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3001

# Database
DATABASE_URL="postgresql://hummii:password@localhost:5432/hummii_dev"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# OneSignal
ONESIGNAL_APP_ID=...
ONESIGNAL_API_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### Запуск миграций базы данных

```bash
cd api

# Запустить миграции
pnpm run migration:run

# Опционально: заполнить тестовыми данными
pnpm run seed
```

### Запуск development серверов

Откройте 3 терминала:

```bash
# Terminal 1 - API
cd api
pnpm run start:dev

# Terminal 2 - Frontend
cd frontend
pnpm run dev

# Terminal 3 - Admin
cd admin
pnpm run dev
```

---

## Доступные скрипты

### Общие скрипты (для всех сервисов)

```bash
pnpm run dev          # Запустить development сервер
pnpm run build        # Собрать для production
pnpm run start        # Запустить production сервер
pnpm run lint         # Проверить код с ESLint
pnpm run format       # Форматировать код с Prettier
pnpm run type-check   # Проверить типы TypeScript
pnpm run test         # Запустить unit тесты
pnpm run test:watch   # Запустить тесты в watch режиме
pnpm run test:cov     # Генерировать отчет о покрытии
```

### Backend (API) специфичные скрипты

```bash
cd api

# Development
pnpm run start:dev           # Start with hot-reload
pnpm run start:debug         # Start with debugger

# Testing
pnpm run test:e2e            # E2E тесты
pnpm run test:e2e:watch      # E2E в watch режиме

# Database
pnpm run migration:generate -- -n MigrationName
pnpm run migration:run
pnpm run migration:revert
pnpm run prisma:generate     # Генерировать Prisma client
pnpm run prisma:studio       # Открыть Prisma Studio GUI
pnpm run seed                # Заполнить БД тестовыми данными
```

### Frontend специфичные скрипты

```bash
cd frontend

# Development
pnpm run dev                 # Start Next.js dev server

# Build
pnpm run build               # Production build
pnpm run analyze             # Analyze bundle size

# Linting
pnpm run lint:fix            # Auto-fix ESLint errors
pnpm run format:write        # Auto-format with Prettier
```

---

## Команды базы данных

### Prisma миграции

```bash
cd api

# Создать новую миграцию
pnpm run migration:generate -- -n AddUserVerification

# Применить все миграции
pnpm run migration:run

# Откатить последнюю миграцию
pnpm run migration:revert

# Просмотреть статус миграций
pnpm run prisma migrate status

# Сбросить БД (ОСТОРОЖНО: удаляет все данные!)
pnpm run prisma migrate reset
```

### Prisma Studio (GUI для БД)

```bash
cd api
pnpm run prisma:studio

# Откроется в браузере: http://localhost:5555
```

### Заполнение тестовыми данными

```bash
cd api
pnpm run seed

# Создаст:
# - 5 пользователей (2 клиента, 3 подрядчика)
# - 10 категорий услуг
# - 5 заказов
# - 10 отзывов
```

---

## Общие задачи

### Добавление нового API модуля

```bash
cd api

# 1. Генерировать модуль, контроллер и сервис
nest g module users
nest g controller users
nest g service users

# 2. Создать DTOs
mkdir src/users/dto
touch src/users/dto/create-user.dto.ts
touch src/users/dto/update-user.dto.ts

# 3. Обновить Prisma schema
nano prisma/schema.prisma

# Добавить модель:
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}

# 4. Генерировать и применить миграцию
pnpm run migration:generate -- -n AddUserModel
pnpm run migration:run

# 5. Реализовать логику в service
# 6. Добавить тесты
# 7. Обновить Swagger документацию
```

### Добавление новой страницы Next.js

```bash
cd frontend

# 1. Создать файл страницы
mkdir -p app/(public)/about
touch app/(public)/about/page.tsx

# 2. Добавить базовую структуру
cat > app/(public)/about/page.tsx << 'EOF'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Hummii',
  description: 'Learn about Hummii',
};

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Hummii is a service marketplace platform...</p>
    </div>
  );
}
EOF

# 3. Добавить в навигацию
# Редактировать: components/layouts/header.tsx

# 4. Проверить маршрут
# Открыть: http://localhost:3001/about
```

### Запуск тестов

```bash
# Unit тесты для API
cd api
pnpm run test

# E2E тесты для API
pnpm run test:e2e

# Frontend тесты
cd frontend
pnpm run test

# Все тесты с покрытием
pnpm run test:cov

# Watch режим для разработки
pnpm run test:watch
```

---

## Проверка качества кода

### Запуск всех проверок

```bash
# Из корня проекта или директории сервиса
pnpm run lint          # ESLint
pnpm run format        # Prettier
pnpm run type-check    # TypeScript
pnpm run test          # Unit тесты
```

### Исправление проблем

```bash
# Автоматически исправить ESLint ошибки
pnpm run lint --fix

# Автоматически форматировать код
pnpm run format --write

# Проверить неиспользуемые зависимости
pnpm run depcheck
```

### Pre-commit хуки

Проект использует Husky для автоматических проверок перед коммитом:

```bash
# При git commit автоматически запускаются:
# - ESLint
# - Prettier
# - TypeScript type check
# - Unit тесты для измененных файлов
```

---

## Docker команды

### Базовые команды

```bash
# Запустить все сервисы
docker compose up -d

# Остановить все сервисы
docker compose down

# Перезапустить конкретный сервис
docker compose restart api

# Просмотреть логи
docker compose logs -f api
docker compose logs -f frontend
docker compose logs --tail=100 api

# Проверить статус
docker compose ps

# Выполнить команду в контейнере
docker compose exec api pnpm run migration:run
docker compose exec postgres psql -U hummii -d hummii_dev
```

### Пересборка контейнеров

```bash
# Пересобрать и запустить
docker compose up -d --build

# Пересобрать конкретный сервис
docker compose build api
docker compose up -d api

# Полная очистка и пересборка
docker compose down -v  # Удалить volumes
docker compose build --no-cache
docker compose up -d
```

### Очистка Docker

```bash
# Удалить все контейнеры и volumes (ОСТОРОЖНО!)
docker compose down -v

# Очистить неиспользуемые образы
docker image prune -a

# Очистить всё неиспользуемое
docker system prune -a --volumes
```

### Запуск опциональных инструментов

```bash
# Запустить с PgAdmin и Redis Commander
docker compose --profile tools up -d

# Доступ:
# PgAdmin: http://localhost:5050
#   Email: admin@hummii.ca
#   Password: admin

# Redis Commander: http://localhost:8081
```

---

## Troubleshooting

### Docker Issues

**Проблема: Контейнеры не запускаются**

```bash
# Решение 1: Удалить volumes и пересобрать
docker compose down -v
docker compose up --build

# Решение 2: Проверить логи
docker compose logs api
docker compose logs postgres

# Решение 3: Проверить доступные ресурсы
docker stats
```

**Проблема: Порт уже используется**

```bash
# Найти процесс на порту 3000
lsof -ti:3000

# Убить процесс
lsof -ti:3000 | xargs kill -9

# Или изменить порт в .env
API_PORT=3001
```

**Проблема: Ошибки подключения к БД**

```bash
# Проверить логи PostgreSQL
docker compose logs postgres

# Перезапустить PostgreSQL
docker compose restart postgres

# Проверить переменные окружения
docker compose exec api env | grep DATABASE
```

### Database Issues

**Проблема: Миграция не применяется**

```bash
cd api

# Откатить последнюю миграцию
pnpm run migration:revert

# Исправить файл миграции
# prisma/migrations/...

# Применить снова
pnpm run migration:run
```

**Проблема: Prisma schema не синхронизирована**

```bash
# Регенерировать Prisma client
pnpm run prisma:generate

# Применить миграции
pnpm run migration:run

# Если проблема сохраняется, сброс БД
pnpm run prisma migrate reset
```

### Next.js Issues

**Проблема: Build падает с ошибками типов**

```bash
cd frontend

# Очистить Next.js cache
rm -rf .next

# Очистить node_modules cache
rm -rf node_modules/.cache

# Проверить TypeScript ошибки
pnpm run type-check

# Пересобрать
pnpm run build
```

**Проблема: Hydration errors**

```typescript
// Проверить несоответствие HTML между server и client
// Убрать client-side only код из server components

// Плохо:
export default function Page() {
  const user = useUser(); // ❌ Hook в Server Component
  return <div>{user.name}</div>;
}

// Хорошо:
'use client';

export default function Page() {
  const user = useUser(); // ✅ Hook в Client Component
  return <div>{user.name}</div>;
}
```

**Проблема: Image optimization fails**

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['hummii-uploads.s3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
};
```

### API Issues

**Проблема: CORS errors**

```typescript
// api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

**Проблема: JWT token invalid**

```bash
# Проверить секреты в .env
echo $JWT_ACCESS_SECRET
echo $JWT_REFRESH_SECRET

# Сгенерировать новые секреты
openssl rand -base64 64

# Обновить .env
JWT_ACCESS_SECRET=новый-секрет
JWT_REFRESH_SECRET=новый-секрет

# Перезапустить API
docker compose restart api
```

**Проблема: Rate limiting слишком агрессивный**

```typescript
// api/src/app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,
  limit: 200, // Увеличить лимит
}),
```

### Performance Issues

**Проблема: Медленная сборка frontend**

```bash
cd frontend

# Анализировать размер bundle
pnpm run build
pnpm run analyze

# Проверить большие зависимости
npx webpack-bundle-analyzer .next/analyze/client.json
```

**Проблема: Медленные database запросы**

```bash
# Включить SQL логирование
# .env
DEBUG_SQL=true

# Проверить медленные запросы
docker compose exec postgres psql -U hummii -d hummii_dev

SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Добавить индексы
CREATE INDEX idx_users_email ON users(email);
```

---

## Быстрая справка

### Основные команды

```bash
# Development
docker compose up -d              # Запустить все сервисы
docker compose logs -f api        # Просмотреть логи API
docker compose down               # Остановить все сервисы

# Code quality
pnpm run lint                     # Проверить linting
pnpm run format                   # Форматировать код
pnpm run type-check               # Проверить типы
pnpm run test                     # Запустить тесты

# Git workflow
git checkout -b feature/my-feature
git add .
git commit -m "feat(api): add feature"
git push origin feature/my-feature

# Database (API)
pnpm run migration:generate -- -n Name
pnpm run migration:run
pnpm run seed
```

### Полезные команды

```bash
# Проверить все переменные окружения
cat .env | grep -v "^#" | grep -v "^$"

# Тестировать внешние сервисы
curl -X POST https://api.stripe.com/v1/customers \
  -u $STRIPE_SECRET_KEY:

# Проверить использование ресурсов Docker
docker stats

# Проверить размер БД
docker exec hummii-postgres psql -U hummii -d hummii_dev \
  -c "SELECT pg_size_pretty(pg_database_size('hummii_dev'));"

# Очистить логи Docker
docker system prune --volumes
```

### Git Commit Convention

```bash
# Format
<type>(<scope>): <subject>

# Types
feat      # Новая функция
fix       # Исправление бага
docs      # Документация
style     # Форматирование кода
refactor  # Рефакторинг
test      # Тесты
chore     # Обслуживание
perf      # Производительность
security  # Исправления безопасности
ci        # CI/CD изменения

# Scopes
api       # Backend API
frontend  # Frontend
admin     # Admin панель
docker    # Docker
docs      # Документация
deps      # Зависимости

# Примеры
feat(api): add user authentication endpoint
fix(frontend): resolve navigation bug on mobile
docs: update installation instructions
security(api): fix SQL injection vulnerability
```

---

## Связанные документы

- **[CLAUDE.md](/Volumes/FilinSky/PROJECTS/Hummii/CLAUDE.md)** - Полное руководство по проекту
- **[DEPLOYMENT.md](/Volumes/FilinSky/PROJECTS/Hummii/docs/DEPLOYMENT.md)** - Production deployment
- **[docs/Stack_EN.md](/Volumes/FilinSky/PROJECTS/Hummii/docs/Stack_EN.md)** - Технический стек

---

**Последнее обновление:** 27 октября 2025
