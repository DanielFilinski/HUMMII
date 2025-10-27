# CLAUDE.md - Hummii Project Guide for Claude Code

> **⚠️ ОБНОВЛЕНО:** Этот файл теперь является навигатором к модульной документации
> **Дата обновления:** 27 октября 2025
> **Версия:** 2.0 (Modular Structure)

---

## 🚀 Быстрый старт

Этот файл больше не содержит полную документацию. Все разделы разбиты на модульные файлы для улучшения производительности и удобства использования.

### 📌 Главный навигатор
**→ Начните отсюда:** [`.claude/INDEX.md`](.claude/INDEX.md)

---

## 📂 Новая модульная структура

### Core (Основные правила)

| Файл | Описание | Размер |
|------|----------|--------|
| [**critical-rules.md**](.claude/core/critical-rules.md) | ⚠️ **ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ** - Языки, безопасность, стандарты кода | ~8KB |
| [**project-context.md**](.claude/core/project-context.md) | О проекте, статус, архитектура, tech stack | ~8KB |
| [**security-compliance.md**](.claude/core/security-compliance.md) | PIPEDA compliance, шифрование, аудит логов | ~12KB |

### Backend (NestJS)

| Файл | Описание | Размер |
|------|----------|--------|
| [**nestjs-guide.md**](.claude/backend/nestjs-guide.md) | Модули, контроллеры, сервисы, Prisma, WebSocket, платежи | ~18KB |

**Дополнительно:**
- [`.cursor/rules/nest.mdc`](.cursor/rules/nest.mdc) - Coding standards (582 строки)

### Frontend (Next.js)

| Файл | Описание | Размер |
|------|----------|--------|
| [**nextjs-guide.md**](.claude/frontend/nextjs-guide.md) | App Router, React patterns, формы, оптимизация | ~17KB |

**Дополнительно:**
- [`.cursor/rules/next.mdc`](.cursor/rules/next.mdc) - Coding standards (1035 строк)

### Operations (DevOps)

| Файл | Описание | Размер |
|------|----------|--------|
| [**development.md**](.claude/ops/development.md) | Setup, Docker, команды, troubleshooting | ~12KB |
| [**testing.md**](.claude/ops/testing.md) | Unit, E2E, интеграционные тесты | ~10KB |

---

## 🎯 Когда читать какой файл?

### 🚨 Всегда начинайте с этого:
1. [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md) - **ОБЯЗАТЕЛЬНО!**

### 🆕 Начинаете новую фичу?
1. [`.claude/core/project-context.md`](.claude/core/project-context.md) - Контекст проекта
2. Затем выберите:
   - Backend? → [`.claude/backend/nestjs-guide.md`](.claude/backend/nestjs-guide.md)
   - Frontend? → [`.claude/frontend/nextjs-guide.md`](.claude/frontend/nextjs-guide.md)

### 🔧 Работаете над Backend?
- [`.claude/backend/nestjs-guide.md`](.claude/backend/nestjs-guide.md) - Паттерны и примеры
- [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md) - Безопасность
- [`.cursor/rules/nest.mdc`](.cursor/rules/nest.mdc) - Coding standards

### 🎨 Работаете над Frontend?
- [`.claude/frontend/nextjs-guide.md`](.claude/frontend/nextjs-guide.md) - Паттерны и примеры
- [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md) - Client security
- [`.cursor/rules/next.mdc`](.cursor/rules/next.mdc) - Coding standards

### 🔒 Вопросы по безопасности?
- [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md) - PIPEDA, шифрование
- [`SECURITY_BEST_PRACTICES.md`](SECURITY_BEST_PRACTICES.md) - Детальный гайд (2800+ строк)
- [`docs/security.md`](docs/security.md) - Security measures (471 строка)

### 🐳 Docker, Setup, Deployment?
- [`.claude/ops/development.md`](.claude/ops/development.md) - Development setup
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Production deployment (433 строки)

### 🧪 Тестирование?
- [`.claude/ops/testing.md`](.claude/ops/testing.md) - Testing strategy

### 📊 Нужна полная картина?
- [`docs/Stack_EN.md`](docs/Stack_EN.md) - **ГЛАВНЫЙ РЕФЕРЕНС** (537 строк)
- [`docs/TS.md`](docs/TS.md) - Техническое задание (Russian)

---

## 🚨 Критичные правила (Quick Reference)

### Языковые правила
- **Код и комментарии:** Английский
- **Документация (md, txt):** Русский
- **Чат/общение:** Русский
- **Интернет-поиск:** 2025 год (актуальные данные)

### Безопасность
- ⚠️ **MANDATORY:** PIPEDA compliance (Canada)
- Никогда не использовать `any` в TypeScript
- Всегда валидировать user input (client + server)
- HTTP-only cookies для tokens (NEVER localStorage)
- Хешировать пароли (bcrypt cost 12+ или Argon2)

**📖 Полные правила:** [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md)

---

## 📋 Быстрая справка

### Структура проекта

```
Hummii/
├── .claude/                   # Модульная документация (НОВОЕ) ✅
│   ├── INDEX.md               # Главный навигатор
│   ├── core/                  # Критичные правила и контекст
│   ├── backend/               # NestJS guides
│   ├── frontend/              # Next.js guides
│   └── ops/                   # Development & Testing guides
│
├── .cursor/rules/             # Cursor AI coding standards ✅
├── api/                       # Backend (NestJS) ⏳ ПУСТО
├── frontend/                  # Frontend (Next.js) ⏳ ПУСТО
├── admin/                     # Admin panel (Refine) ⏳ ПУСТО
├── docker/                    # Docker configs ✅
└── docs/                      # Comprehensive docs ✅
```

### Статус проекта
- ✅ Docker infrastructure
- ✅ CI/CD pipelines
- ✅ Модульная документация
- ⏳ API, Frontend, Admin - в разработке

**📖 Детали:** [`.claude/core/project-context.md`](.claude/core/project-context.md)

### Команды (Quick Reference)

```bash
# Development
docker compose up -d              # Start all services
docker compose logs -f api        # View logs
docker compose down               # Stop services

# Code quality
pnpm run lint                     # Check linting
pnpm run format                   # Format code
pnpm run type-check               # TypeScript check
pnpm run test                     # Run tests

# Database (API)
pnpm run migration:generate -- -n Name
pnpm run migration:run
pnpm run prisma:studio            # GUI for database
```

**📖 Все команды:** [`.claude/ops/development.md`](.claude/ops/development.md)

---

## 🔗 Дополнительные ресурсы

### Официальная документация

| Документ | Назначение | Строк |
|----------|-----------|-------|
| [`docs/Stack_EN.md`](docs/Stack_EN.md) | **PRIMARY** tech stack reference | 537 |
| [`docs/TS.md`](docs/TS.md) | Техническое задание (Russian) | Большой |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Production deployment guide | 433 |
| [`docs/security.md`](docs/security.md) | Security & PIPEDA compliance | 471 |
| [`SECURITY_BEST_PRACTICES.md`](SECURITY_BEST_PRACTICES.md) | Comprehensive security guide | 2800+ |

### Cursor AI Rules (всегда применяются)

| Файл | Назначение | Строк |
|------|-----------|-------|
| [`.cursor/rules/config.mdc`](.cursor/rules/config.mdc) | Языковые правила (alwaysApply) | ~50 |
| [`.cursor/rules/mamory.mdc`](.cursor/rules/mamory.mdc) | Контекст проекта (alwaysApply) | ~100 |
| [`.cursor/rules/nest.mdc`](.cursor/rules/nest.mdc) | NestJS coding standards | 582 |
| [`.cursor/rules/next.mdc`](.cursor/rules/next.mdc) | Next.js coding standards | 1035 |

### Модули и фичи

| Документ | Назначение |
|----------|-----------|
| [`docs/modules/chat.md`](docs/modules/chat.md) | Real-time chat system design |
| [`docs/modules/rating.md`](docs/modules/rating.md) | Rating algorithm specification |
| [`docs/modules/Partner Portal.md`](docs/modules/Partner%20Portal.md) | Partner integration guide |

### API интеграции

| Документ | Назначение |
|----------|-----------|
| [`docs/api/geolocation.md`](docs/api/geolocation.md) | Google Maps integration |
| [`docs/api/onesignal.md`](docs/api/onesignal.md) | Notification setup |
| [`docs/api/verification.md`](docs/api/verification.md) | Stripe Identity verification |

---

## ✅ Security Checklist (Quick)

Перед написанием кода, который работает с:

- [ ] **User input** → Validate: class-validator + Zod
- [ ] **Passwords** → Hash: bcrypt (cost 12+) or Argon2
- [ ] **Tokens** → HTTP-only cookies, NEVER localStorage
- [ ] **API keys** → Server-side only, NO `NEXT_PUBLIC_`
- [ ] **Database** → Prisma ORM, NEVER string concatenation
- [ ] **Files** → Validate MIME, strip EXIF, scan malware
- [ ] **Payments** → Stripe Elements, verify webhooks
- [ ] **PII** → Encrypt AES-256, mask in logs
- [ ] **Errors** → Generic to client, detailed server log
- [ ] **Rate limiting** → Apply to ALL endpoints

**📖 Полный checklist:** [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md)

---

## 📞 Помощь и поддержка

### Для Claude Code

**Workflow:**
1. Всегда начинайте с [`.claude/INDEX.md`](.claude/INDEX.md)
2. Читайте [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md) - ОБЯЗАТЕЛЬНО
3. Загружайте нужный guide (Backend/Frontend/Ops) по задаче
4. Проверяйте security requirements перед кодированием

### Для разработчиков

**Quick start:**
1. Прочитайте [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md)
2. Прочитайте [`.claude/core/project-context.md`](.claude/core/project-context.md)
3. Настройте окружение: [`.claude/ops/development.md`](.claude/ops/development.md)
4. Выберите область (Backend/Frontend) и читайте guide

### Troubleshooting

**Если что-то не работает:**
- Docker issues? → [`.claude/ops/development.md#troubleshooting`](.claude/ops/development.md)
- Build errors? → Проверьте соответствующий guide (Backend/Frontend)
- Security вопросы? → [`.claude/core/security-compliance.md`](.claude/core/security-compliance.md)

### Контакты

- **Documentation:** `/docs/` directory
- **Issues:** GitHub Issues
- **Email:** admin@hummii.ca

---

## 🎉 Преимущества новой структуры

### Почему модульная структура лучше?

1. **⚡ Производительность** - Каждый файл < 20KB (vs 79.6KB оригинал)
2. **🎯 Фокус** - Загружайте только нужную информацию
3. **📚 Поддерживаемость** - Легче обновлять отдельные разделы
4. **🔍 Навигация** - Быстрый поиск нужного контекста
5. **🚀 Быстрый старт** - Четкие указания куда смотреть

### Размеры файлов (до и после)

| Файл | Старый размер | Новый размер | Улучшение |
|------|---------------|--------------|-----------|
| **CLAUDE.md** | 79.6KB | 6KB (навигатор) | **92% ↓** |
| **Модули** | N/A | 8-18KB каждый | Оптимально ✅ |

---

## 📝 История версий

### Version 2.0 (27 октября 2025)
- ✅ Разбит на модульную структуру (`.claude/` directory)
- ✅ Создан навигатор (INDEX.md)
- ✅ Размер каждого модуля < 20KB
- ✅ Улучшена навигация и производительность
- ✅ CLAUDE.md теперь quick reference

### Version 1.0 (Оригинальная)
- Монолитный файл 79.6KB
- Все разделы в одном документе

---

## 🚀 Начать работу

**→ Главный навигатор:** [`.claude/INDEX.md`](.claude/INDEX.md)

**→ Обязательные правила:** [`.claude/core/critical-rules.md`](.claude/core/critical-rules.md)

---

**Последнее обновление:** 27 октября 2025
**Версия:** 2.0 (Modular Structure)
**Мейнтейнер:** Daniel Filinski
**Лицензия:** MIT
