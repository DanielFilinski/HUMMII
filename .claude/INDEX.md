# Hummii Project - Quick Navigator

> **📌 Главный навигатор по документации проекта**
> **Версия:** 1.0 | **Дата:** 27 октября 2025

---

## 🚨 КРИТИЧНЫЕ ПРАВИЛА (ЧИТАТЬ ПЕРВЫМ!)

### Языковые правила
- **Код и комментарии:** Английский
- **Документация (txt, md, планы):** Русский
- **Чат/общение:** Русский
- **Интернет-поиск:** Всегда искать данные 2025 года

### Безопасность (MANDATORY)
- Проект работает в Канаде: **PIPEDA compliance обязателен**
- Обработка платежей через Stripe: **PCI DSS compliance**
- Персональные данные: **максимальная защита**
- Никогда не использовать `any` в TypeScript (strict mode)

### Перед каждой командой
- Опишите что команда сделает
- Укажите что будет затронуто/изменено

**📖 Детали:** [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md)

---

## 📁 КОГДА ЧИТАТЬ КАКОЙ ФАЙЛ

### 🆕 Начинаете новую фичу?
1. **Сначала прочитайте:**
   - [`.claude/core/project-context.md`](.claude/core/project-context.md) - Статус проекта, архитектура
   - [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md) - Обязательные правила

2. **Затем выберите:**
   - Backend? → [`.claude/backend/nestjs-guide.md`](.claude/backend/nestjs-guide.md)
   - Frontend? → [`.claude/frontend/nextjs-guide.md`](.claude/frontend/nextjs-guide.md)

### 🔧 Работаете над Backend (NestJS)?
**Читать:**
- [`.claude/backend/nestjs-guide.md`](.claude/backend/nestjs-guide.md) - Паттерны, модули, архитектура
- [`.cursor/rules/nest.mdc`](.cursor/rules/nest.mdc) - Coding standards

**Дополнительно:**
- Безопасность? → [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md)
- API документация? → [`docs/Stack_EN.md`](docs/Stack_EN.md)

### 🎨 Работаете над Frontend (Next.js)?
**Читать:**
- [`.claude/frontend/nextjs-guide.md`](.claude/frontend/nextjs-guide.md) - React паттерны, hooks, компоненты
- [`.cursor/rules/next.mdc`](.cursor/rules/next.mdc) - Coding standards

**Дополнительно:**
- Формы и валидация? → [`.claude/frontend/nextjs-guide.md#forms--validation`](.claude/frontend/nextjs-guide.md)
- Безопасность клиента? → [`.claude/core/security-compliance.md#frontend-security`](.claude/core/security-compliance.md)

### 🔒 Вопросы по безопасности и комплаенсу?
**Читать:**
- [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md) - PIPEDA, GDPR, шифрование
- [`SECURITY_BEST_PRACTICES.md`](SECURITY_BEST_PRACTICES.md) - Детальный гайд (2800+ строк)
- [`docs/security.md`](docs/security.md) - Безопасность и PIPEDA (471 строка)

### 🐳 Docker, Setup, Deployment?
**Читать:**
- [`.claude/ops/development.md`](.claude/ops/development.md) - Setup, Docker, команды
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Production deployment (433 строки)
- [`start.sh`](start.sh) - Quick start helper script

### 🧪 Тестирование?
**Читать:**
- [`.claude/ops/testing.md`](.claude/ops/testing.md) - Unit, E2E, интеграционные тесты
- Примеры тестов в модулях Backend/Frontend guides

### 📊 Нужна полная картина?
**Читать:**
- [`docs/Stack_EN.md`](docs/Stack_EN.md) - **ГЛАВНЫЙ РЕФЕРЕНС** (537 строк)
- [`docs/TS.md`](docs/TS.md) - Техническое задание (русский)
- [`CLAUDE.md`](CLAUDE.md) - Оригинальный гайд (теперь ссылается на эту структуру)

---

## 🗂️ СТРУКТУРА ДОКУМЕНТАЦИИ

### Core (Ядро проекта)
| Файл | Размер | Описание |
|------|--------|----------|
| [`critical-rules.md`](.claude/core/critical-rules.md) | ~8kb | Обязательные правила: языки, безопасность, качество кода |
| [`project-context.md`](.claude/core/project-context.md) | ~8kb | Статус проекта, архитектура, tech stack |
| [`security-compliance.md`](.claude/core/security-compliance.md) | ~12kb | PIPEDA, GDPR, шифрование, аудит |

### Backend
| Файл | Размер | Описание |
|------|--------|----------|
| [`nestjs-guide.md`](.claude/backend/nestjs-guide.md) | ~18kb | NestJS паттерны, модули, API, WebSocket, Prisma |

### Frontend
| Файл | Размер | Описание |
|------|--------|----------|
| [`nextjs-guide.md`](.claude/frontend/nextjs-guide.md) | ~18kb | Next.js, React, hooks, формы, performance, SEO |

### Operations
| Файл | Размер | Описание |
|------|--------|----------|
| [`development.md`](.claude/ops/development.md) | ~10kb | Setup, Docker, команды, troubleshooting |
| [`testing.md`](.claude/ops/testing.md) | ~8kb | Unit, E2E, интеграционные тесты |

---

## ⚡ БЫСТРЫЙ СТАРТ

### Новый разработчик
1. Прочитайте: [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md)
2. Прочитайте: [`.claude/core/project-context.md`](.claude/core/project-context.md)
3. Настройте окружение: [`.claude/ops/development.md#quick-start`](.claude/ops/development.md)
4. Выберите свою область (Backend/Frontend) и читайте соответствующий guide

### Claude Code начинает работу
1. **ВСЕГДА** начинайте с: [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md)
2. Проверьте статус проекта: [`.claude/core/project-context.md`](.claude/core/project-context.md)
3. Загрузите контекст для нужной области (Backend/Frontend/Ops)

### Быстрые команды
```bash
# Запуск проекта
docker compose up -d

# Проверка качества кода
pnpm run lint && pnpm run type-check && pnpm run test

# Логи
docker compose logs -f api

# База данных (migrations)
cd api && pnpm run migration:run
```

**📖 Все команды:** [`.claude/ops/development.md#quick-reference-commands`](.claude/ops/development.md)

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### Официальная документация проекта
- [`docs/Stack_EN.md`](docs/Stack_EN.md) - Полный tech stack (PRIMARY reference)
- [`docs/TS.md`](docs/TS.md) - Техническое задание (Russian)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Production deployment
- [`docs/security.md`](docs/security.md) - Security & PIPEDA
- [`SECURITY_BEST_PRACTICES.md`](SECURITY_BEST_PRACTICES.md) - Comprehensive security guide

### Cursor AI Rules
- [`.cursor/rules/config.mdc`](.cursor/rules/config.mdc) - Конфигурация (alwaysApply)
- [`.cursor/rules/mamory.mdc`](.cursor/rules/mamory.mdc) - Память проекта (alwaysApply)
- [`.cursor/rules/nest.mdc`](.cursor/rules/nest.mdc) - NestJS coding standards
- [`.cursor/rules/next.mdc`](.cursor/rules/next.mdc) - Next.js coding standards

### Модули и фичи
- [`docs/modules/chat.md`](docs/modules/chat.md) - Real-time chat system
- [`docs/modules/rating.md`](docs/modules/rating.md) - Rating algorithm
- [`docs/modules/Partner Portal.md`](docs/modules/Partner%20Portal.md) - Partner integration

### API интеграции
- [`docs/api/geolocation.md`](docs/api/geolocation.md) - Google Maps integration
- [`docs/api/onesignal.md`](docs/api/onesignal.md) - Notification setup
- [`docs/api/verification.md`](docs/api/verification.md) - Stripe Identity

---

## 🎯 ЧЕКЛИСТ ДЛЯ БЕЗОПАСНОСТИ

Перед написанием кода, который работает с:

- [ ] **User input** → Validate: class-validator (backend) + Zod (frontend)
- [ ] **Passwords** → Hash: bcrypt (cost 12+) or Argon2
- [ ] **Tokens** → HTTP-only cookies, NEVER localStorage
- [ ] **API keys** → Server-side only, NO `NEXT_PUBLIC_` prefix
- [ ] **Database queries** → Prisma ORM, NEVER string concatenation
- [ ] **File uploads** → Validate MIME type, strip EXIF, scan malware
- [ ] **Payments** → Stripe Elements, verify webhook signatures
- [ ] **PII** → Encrypt AES-256, mask in logs
- [ ] **Errors** → Generic message to client, detailed server-side log
- [ ] **Rate limiting** → Apply to ALL endpoints (especially auth)

**📖 Детали:** [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md)

---

## 🆘 ПОМОЩЬ И ПОДДЕРЖКА

### Troubleshooting
- Docker issues? → [`.claude/ops/development.md#troubleshooting`](.claude/ops/development.md)
- Database issues? → [`.claude/ops/development.md#database-issues`](.claude/ops/development.md)
- Build errors? → Check respective Backend/Frontend guide

### Контакты
- **Documentation:** `/docs/` directory
- **Issues:** GitHub Issues
- **Email:** admin@hummii.ca

---

## 📝 ПРИМЕЧАНИЯ

- **Размер файлов:** Каждый файл < 20kb для оптимальной производительности
- **Обновления:** При изменении структуры проекта обновляйте соответствующие guides
- **Приоритет:** При конфликтах между документами приоритет имеет `.claude/core/critical-rules.md`

---

**Последнее обновление:** 27 октября 2025
**Мейнтейнер:** Daniel Filinski
**Лицензия:** MIT
