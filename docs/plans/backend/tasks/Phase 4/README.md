# Phase 4: Chat Module

**Статус:** 📋 Готово к реализации
**Приоритет:** 🟡 HIGH
**Длительность:** 2 недели (Week 9-10)
**Зависимости:** Phase 0 ✅, Phase 1 ✅, Phase 2 ✅, Phase 3 ✅

---

## 📄 Документы

### Основной файл задач
- **[phase-4-tasks.md](./phase-4-tasks.md)** - Полный список задач с примерами кода

---

## 🎯 Ключевые deliverables

### 1. Real-time Communication
- WebSocket gateway setup (Socket.io)
- Chat room creation per order
- Message sending/receiving
- Typing indicators
- Read receipts
- Online status indicators
- Message history persistence
- Chat auto-close (30 days after order completion)

### 2. Content Moderation
- Automatic phone number blocking (regex)
- Email address blocking (regex)
- External link blocking (except platform URLs)
- Social media handle blocking (@instagram, etc.)
- Profanity filter (English + French)
- Spam detection (repeated identical messages)
- Message editing (within 5 minutes)
- Flag/report system for abusive messages

### 3. Message Management
- Message history (permanent, until account deletion)
- Message export (PIPEDA compliance)
- Message search within chat
- Unread message counter
- Chat list management

---

## 📊 Структура модуля

```
api/src/chat/
├── chat.module.ts
├── chat.gateway.ts
├── chat.service.ts
├── chat.controller.ts
├── dto/
│   ├── create-message.dto.ts
│   ├── update-message.dto.ts
│   └── create-chat-room.dto.ts
├── entities/
│   ├── message.entity.ts
│   └── chat-room.entity.ts
└── guards/
    └── chat-room-participant.guard.ts
```

---

## 🔒 Security Highlights

- ✅ Rate limiting: 20 messages/min per user
- ✅ Message encryption in transit (WSS)
- ✅ Content moderation on every message
- ✅ Spam detection and blocking
- ✅ PII protection (phone, email blocking)
- ✅ Contact information blocking

---

## 📈 Testing Requirements

### Unit Tests (80%+ coverage)
- ChatService tests
- ContentModerationService tests
- Message validation tests

### E2E Tests
- WebSocket connection tests
- Message sending/receiving flow
- Content moderation accuracy
- Rate limiting verification
- Chat room creation

---

## 🚀 Quick Start

```bash
# Start Docker services
docker compose up -d

# Generate Prisma Client
pnpm run prisma:generate

# Run migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

---

## 📚 Related Documentation

- [Stack_EN.md](../../../../Stack_EN.md) - Tech stack overview
- [roadmap.md](../../roadmap.md) - Full backend roadmap
- [.claude/backend/nestjs-guide.md](../../../../../.claude/backend/nestjs-guide.md) - NestJS patterns

---

## ✅ Definition of Done

Phase 4 считается завершенным когда:

- [ ] WebSocket gateway работает
- [ ] Chat room creation per order функционирует
- [ ] Message sending/receiving работает
- [ ] Content moderation активно
- [ ] Message history persistence реализована
- [ ] Rate limiting active (20 msg/min)
- [ ] PIPEDA compliance (message export)
- [ ] Unit tests pass (80%+ coverage)
- [ ] E2E tests pass
- [ ] Security audit пройден
- [ ] Documentation обновлена
- [ ] Code review completed

---

**Previous Phase:** [Phase 3: Orders Module](../Phase%203/)
**Next Phase:** [Phase 5: Reviews & Ratings Module](../Phase%205/)

---

**Created:** January 2025
**Status:** Ready for implementation

