# Критичные правила проекта Hummii

> **⚠️ ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ ПЕРЕД ЛЮБОЙ РАБОТОЙ**
> **Приоритет:** МАКСИМАЛЬНЫЙ | **Версия:** 1.0

---

## 📋 Оглавление

1. [Языковые правила](#языковые-правила)
2. [Безопасность и комплаенс](#безопасность-и-комплаенс)
3. [Стандарты качества кода](#стандарты-качества-кода)
4. [TypeScript строгие правила](#typescript-строгие-правила)
5. [Правила коммуникации](#правила-коммуникации)
6. [Правила документации](#правила-документации)

---

## 🌍 Языковые правила

> **Источник:** `.cursor/rules/config.mdc` (alwaysApply: true)

### Обязательные правила языка

| Контекст | Язык | Примеры |
|----------|------|---------|
| **Код** | Английский | Переменные, функции, классы, комментарии в коде |
| **Документация** | Русский | `.md`, `.txt`, планы, спецификации |
| **Чат/общение** | Русский | Все сообщения с пользователем, вопросы, ответы |
| **Интернет-поиск** | Актуальные данные 2025 | Всегда искать свежую информацию |

### Примеры применения

```typescript
// ✅ ПРАВИЛЬНО - код на английском
export class UserService {
  /**
   * Creates a new user with validated data
   */
  async createUser(data: CreateUserDto): Promise<User> {
    // Implementation
  }
}

// ❌ НЕПРАВИЛЬНО - код на русском
export class СервисПользователей {
  async создатьПользователя(данные: any) {
    // Реализация
  }
}
```

```markdown
<!-- ✅ ПРАВИЛЬНО - документация на русском -->
# Руководство по разработке

Этот документ описывает процесс разработки...

<!-- ❌ НЕПРАВИЛЬНО - документация на английском -->
# Development Guide

This document describes the development process...
```

### Перед каждой командой

**ОБЯЗАТЕЛЬНО:**
- Опишите что команда сделает
- Укажите что будет затронуто/изменено
- Предупредите о потенциальных рисках

**Пример:**
```bash
# ❌ ПЛОХО
docker compose down -v

# ✅ ХОРОШО
# Команда остановит все Docker контейнеры и УДАЛИТ все volumes (включая базу данных)
# Затронуто: PostgreSQL, Redis, все данные будут потеряны
# Используйте только если уверены!
docker compose down -v
```

---

## 🔒 Безопасность и комплаенс

> **Источник:** `.cursor/rules/mamory.mdc` (alwaysApply: true)

### КРИТИЧНО: Канадское законодательство

**⚠️ Проект работает в Канаде со строгими законами:**
- **PIPEDA** - Personal Information Protection and Electronic Documents Act
- **Защита персональных данных** - обязательна
- **Требования к безопасности данных** - максимальные
- **Хранение и обработка данных** - строго регламентированы

### Приоритеты безопасности

**ВСЕГДА соблюдайте:**

1. **Никогда не храните в открытом виде:**
   - Пароли
   - API ключи
   - Токены
   - Номера кредитных карт
   - Social Insurance Numbers (SIN)

2. **Всегда валидируйте:**
   - Пользовательский ввод (клиент И сервер)
   - Загружаемые файлы
   - URL параметры
   - Query strings

3. **Используйте:**
   - Параметризованные запросы (защита от SQL injection)
   - HTTP-only cookies для токенов
   - HTTPS для всех коммуникаций
   - Хеширование паролей (bcrypt с cost 12+ или Argon2)

4. **Следуйте:**
   - OWASP Top 10 guidelines
   - PIPEDA требованиям для Канады
   - PCI DSS (через Stripe)

### Запрещенные практики

```typescript
// ❌ НИКОГДА НЕ ДЕЛАЙТЕ ТАК
localStorage.setItem('token', accessToken); // Уязвимо к XSS
const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL injection
const password = user.password; // Plain text password
process.env.STRIPE_SECRET_KEY = 'sk_test_...'; // Hardcoded secret

// ✅ ПРАВИЛЬНО
// Tokens в HTTP-only cookies (устанавливаются сервером)
const user = await prisma.user.findUnique({ where: { id: userId } }); // Prisma ORM
const hashedPassword = await bcrypt.hash(password, 12); // Hashed password
// Secrets в .env файле (не коммитятся в Git)
```

### Чеклист перед коммитом

- [ ] Нет хардкоженных секретов в коде
- [ ] Все пользовательские вводы валидируются
- [ ] Пароли хешируются (bcrypt/Argon2)
- [ ] Токены в HTTP-only cookies
- [ ] Параметризованные запросы (Prisma ORM)
- [ ] HTTPS для всех API запросов
- [ ] PII данные зашифрованы или замаскированы в логах
- [ ] Rate limiting применен к эндпоинтам

**📖 Подробнее:** [`.claude/core/security-compliance.md`](security-compliance.md)

---

## 💎 Стандарты качества кода

> **Источники:** `.cursor/rules/nest.mdc`, `.cursor/rules/next.mdc`

### Базовые принципы

#### 1. Security First
- **Приоритет №1** - безопасность
- Проект обрабатывает платежи и персональные данные
- PIPEDA compliance обязателен
- Все решения принимаются с учетом безопасности

#### 2. Performance Matters
- Оптимизируйте database queries (indexes, no N+1)
- Используйте кеширование (Redis)
- Lazy loading и code splitting (frontend)
- Минимизируйте bundle sizes
- Async/await правильно

#### 3. Code Quality
- **DRY** (Don't Repeat Yourself)
- **SOLID** principles
- Чистый, читаемый, поддерживаемый код
- Значимые имена переменных и функций
- Обработка ошибок и логирование
- Модульные, переиспользуемые компоненты

### Именование

```typescript
// Классы: PascalCase
class UserService {}
class OrderController {}

// Переменные/функции: camelCase
const userName = 'John';
function getUserById(id: string) {}

// Константы: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const API_BASE_URL = 'https://api.hummii.ca';

// Boolean: начинается с глагола
const isLoading = true;
const hasError = false;
const canDelete = user.role === 'admin';

// Файлы/директории: kebab-case
user-profile.tsx
order-service.ts
auth-controller.ts

// Интерфейсы: IPascalCase или PascalCase
interface IUser {}
interface UserProfile {}
```

### Функции

```typescript
// ✅ ХОРОШО - короткие функции с одной ответственностью
async function getUserById(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}

// ✅ ХОРОШО - early returns для избежания вложенности
function processOrder(order: Order): ProcessResult {
  if (!order.isValid) {
    return { success: false, error: 'Invalid order' };
  }

  if (order.isPaid) {
    return { success: false, error: 'Already paid' };
  }

  // Process order
  return { success: true };
}

// ❌ ПЛОХО - длинная функция, множественная ответственность
async function processUserOrderAndSendEmail(userData: any, orderData: any) {
  // 100+ lines of code doing multiple things
}
```

### Размеры

- **Функции:** < 20-30 строк (одна ответственность)
- **Классы:** < 200-300 строк, < 10 методов
- **Файлы:** < 500 строк (разбивайте на модули)

---

## 🔷 TypeScript строгие правила

### ЗАПРЕЩЕНО использовать `any`

```typescript
// ❌ НИКОГДА
function processData(data: any): any {
  return data;
}

// ✅ ПРАВИЛЬНО - используйте конкретные типы
function processData(data: UserData): ProcessedUserData {
  return {
    id: data.id,
    name: data.name,
    // ...
  };
}

// ✅ ПРАВИЛЬНО - используйте unknown для неизвестных типов
function processUnknownData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid data type');
}

// ✅ ПРАВИЛЬНО - используйте generics
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0];
}
```

### Всегда объявляйте типы

```typescript
// ❌ ПЛОХО - неявные типы
const users = await fetchUsers(); // Тип unknown
let count; // Тип any

// ✅ ХОРОШО - явные типы
const users: User[] = await fetchUsers();
let count: number = 0;

// ✅ ХОРОШО - inference где очевидно
const userName = 'John'; // Тип string (inference)
const userAge = 25; // Тип number (inference)
```

### DTOs и валидация

```typescript
// ✅ Backend - class-validator
import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;
}

// ✅ Frontend - Zod
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string()
    .min(12)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
```

### Immutability

```typescript
// ✅ ПРЕДПОЧИТАЙТЕ immutability
interface User {
  readonly id: string;
  readonly email: string;
  name: string; // Can be updated
}

const config = {
  apiUrl: 'https://api.hummii.ca',
  timeout: 5000,
} as const; // All properties readonly

// ✅ Используйте spread для обновлений
const updatedUser = { ...user, name: 'New Name' };

// ❌ Избегайте мутаций
user.name = 'New Name'; // Mutation (избегайте когда возможно)
```

---

## 💬 Правила коммуникации

### Документация

```typescript
// ✅ ХОРОШО - JSDoc для публичных методов
/**
 * Creates a new user with validated data.
 * Sends welcome email upon successful creation.
 *
 * @param data - User creation data (validated DTO)
 * @returns Created user without password field
 * @throws BadRequestException if email already exists
 * @throws InternalServerException if email sending fails
 */
async createUser(data: CreateUserDto): Promise<User> {
  // Implementation
}

// ❌ ПЛОХО - нет документации для сложной логики
async complexBusinessLogic(data: any) {
  // 50 lines of undocumented complex code
}
```

### Комментарии

```typescript
// ✅ ХОРОШО - объясняют "ПОЧЕМУ", а не "ЧТО"
// We use bcrypt with cost 12 (not 10) for PIPEDA compliance
const hashedPassword = await bcrypt.hash(password, 12);

// Calculate weighted rating to prioritize verified contractors
const weightedRating = (rating * 0.4) + (reviewCount * 0.3) + (isVerified * 0.2);

// ❌ ПЛОХО - описывают очевидное
// Assign user name to variable
const userName = user.name;

// Loop through users
for (const user of users) {
  // ...
}
```

### Ошибки и логирование

```typescript
// ✅ ХОРОШО - информативные сообщения об ошибках
throw new NotFoundException(`User with ID ${userId} not found`);
throw new BadRequestException('Invalid email format');

// ✅ ХОРОШО - структурированное логирование
logger.info('User created', {
  userId: user.id,
  email: user.email, // Можно логировать
  correlationId: req.correlationId,
});

// ❌ ПЛОХО - логирование sensitive данных
logger.info('User login', {
  password: user.password, // НИКОГДА!
  token: accessToken, // НИКОГДА!
  creditCard: user.creditCard, // НИКОГДА!
});

// ✅ ХОРОШО - маскирование PII в логах
logger.info('User login', {
  email: maskEmail(user.email), // u***@example.com
  phone: maskPhone(user.phone), // ***-***-1234
});
```

---

## 📝 Правила документации

### ⛔ НИКОГДА не создавай отдельные файлы документации для рутинных задач

**Вместо этого обновляй существующие tracking файлы:**

#### Для Backend задач:
- **`docs/plans/backend/tasks/COMPLETED.md`** - Добавь запись о выполненной задаче с кратким описанием
- **`docs/plans/backend/tasks/TASKS_ANALYSIS.md`** - Обнови процент выполнения фазы (если нужно)

#### Создавай новую документацию ТОЛЬКО для:
1. **Крупных изменений архитектуры** (новые микросервисы, значительный рефакторинг)
2. **Новых major фич** (полностью новые модули типа Payment, Chat и т.д.)
3. **API документации** (OpenAPI/Swagger спецификации)
4. **Deployment guides** (новые инструкции по развертыванию)

#### Формат завершения задачи:
При завершении каждой задачи предоставь:
1. **Commit message** (conventional commits format, на английском)
2. **Краткую запись для COMPLETED.md**

**Формат commit message (ДОЛЖЕН БЫТЬ КРАТКИМ):**
```
type(scope): краткое описание (max 72 символа)

- Ключевое изменение 1
- Ключевое изменение 2
- Ключевое изменение 3 (максимум 5-7 пунктов)
```

**Правила commit message:**
- **Заголовок:** Максимум 72 символа
- **Тело:** Максимум 5-7 пунктов (только КЛЮЧЕВЫЕ изменения)
- **Фокус:** ЧТО изменилось, а не детали реализации
- **Опускай:** Списки файлов, зависимости, детали тестирования
- **Общая длина:** 10-15 строк МАКСИМУМ

**Пример записи в COMPLETED.md:**
```markdown
✅ File upload система (S3 интеграция для аватаров)
  - Implemented multipart/form-data upload endpoint
  - S3 bucket configuration with proper IAM permissions
  - Image optimization (resize to max 1024x1024, compress)
  - Added MIME type validation and virus scanning
```

**Хороший пример commit message (краткий):**
```
feat(auth): implement JWT token refresh mechanism

- Add refresh token endpoint with rotation strategy
- Store tokens in HTTP-only cookies
- Add rate limiting (3 req/min) to refresh endpoint
- Update AuthGuard to handle token expiration
- Add audit logging for refresh events
```

**Плохой пример (слишком подробный - 200+ строк):**
```
feat(auth): implement comprehensive JWT refresh with security

## Summary
Implemented complete token refresh system...

## Files Created (15)
- api/src/auth/refresh.controller.ts
...

## Testing
All components tested...
```

---

## 🎯 Чеклист перед началом работы

### Каждый раз перед написанием кода

- [ ] Прочитал critical rules (этот файл)
- [ ] Понимаю контекст проекта ([`project-context.md`](project-context.md))
- [ ] Знаю какой модуль затрагиваю (Backend/Frontend/Ops)
- [ ] Проверил security requirements для моей задачи
- [ ] Понимаю PIPEDA compliance требования (если работаю с PII)
- [ ] Готов писать код на английском, документацию на русском
- [ ] Знаю как тестировать мои изменения

### Перед коммитом

- [ ] `pnpm run lint` - без ошибок
- [ ] `pnpm run format` - код отформатирован
- [ ] `pnpm run type-check` - TypeScript без ошибок
- [ ] `pnpm run test` - тесты проходят
- [ ] Нет `console.log` statements
- [ ] Нет закомментированного кода
- [ ] Нет `any` типов
- [ ] Нет хардкоженных секретов
- [ ] Security checklist пройден
- [ ] **COMPLETED.md обновлен** с записью о выполненной задаче (для feature work)
- [ ] Commit message подготовлен (conventional commits format)

---

## 📚 Дополнительные ресурсы

### Связанные документы

- [**Project Context**](project-context.md) - Статус проекта, архитектура
- [**Security & Compliance**](security-compliance.md) - Детальные требования безопасности
- [**Backend Guide**](../backend/nestjs-guide.md) - NestJS паттерны
- [**Frontend Guide**](../frontend/nextjs-guide.md) - Next.js паттерны
- [`SECURITY_BEST_PRACTICES.md`](../../SECURITY_BEST_PRACTICES.md) - Comprehensive security guide

### Cursor AI Rules (всегда применяются)

- [`.cursor/rules/config.mdc`](../../.cursor/rules/config.mdc) - Языковые правила
- [`.cursor/rules/mamory.mdc`](../../.cursor/rules/mamory.mdc) - Контекст проекта
- [`.cursor/rules/nest.mdc`](../../.cursor/rules/nest.mdc) - NestJS standards
- [`.cursor/rules/next.mdc`](../../.cursor/rules/next.mdc) - Next.js standards

---

## ⚠️ В случае нарушения правил

**Если код нарушает эти правила:**
1. CI/CD pipeline будет провален
2. Code review не пройдет
3. Security issues будут зарегистрированы
4. Необходимо будет переписать код

**Это не рекомендации - это обязательные требования.**

---

**Последнее обновление:** 2 ноября 2025
**Приоритет:** КРИТИЧЕСКИЙ
**Статус:** ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ
