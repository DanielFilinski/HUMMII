# Технологический стек - Платформа Hummii

> ⚠️ **Внимание:** Данный файл содержит устаревшую информацию на русском языке.
> 
> **Пожалуйста, используйте актуальную версию:** [`Stack_EN.md`](./Stack_EN.md)
> 
> Новая версия содержит:
> - ✅ Полное соответствие правилам nest.mdc и next.mdc
> - ✅ Детальную информацию о модульной структуре
> - ✅ Подробную конфигурацию безопасности и PIPEDA compliance
> - ✅ Стратегию тестирования
> - ✅ Документацию на английском языке

---

**Последнее обновление:** 24 октября 2025

Для технической документации на русском языке см. [`TS.md`](./TS.md) - техническая спецификация проекта.

## Быстрый обзор

### Frontend
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Zustand + React Query
- Tailwind CSS + Shadcn/ui
- next-intl (English + French)

### Backend
- NestJS + TypeScript
- PostgreSQL + PostGIS
- Prisma ORM
- Redis
- Bull/BullMQ

### External Services
- Stripe (платежи + верификация)
- Google Maps API
- OneSignal (уведомления)
- AWS S3 + CloudFront
- OpenAI API

### Infrastructure
- Docker + Docker Compose
- GitHub Actions
- Nginx

---

## Подробная документация

| Файл | Описание | Язык |
|------|----------|------|
| [`Stack_EN.md`](./Stack_EN.md) | ✅ **Актуальная** полная техническая документация стека | English |
| [`TS.md`](./TS.md) | Техническая спецификация проекта | Русский |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Инструкции по развёртыванию | English |
| [`security.md`](./security.md) | Документация по безопасности | English |
| [`CHANGELOG_TS.md`](./CHANGELOG_TS.md) | История изменений документации | English |

---

## Основные ссылки

- [Правила Next.js](./../.cursor/rules/next.mdc)
- [Правила NestJS](./../.cursor/rules/nest.mdc)
- [GitHub Repository Setup](./GITHUB_SETUP.md)

---

*Этот файл сохранён для совместимости. Используйте Stack_EN.md для актуальной информации.*
