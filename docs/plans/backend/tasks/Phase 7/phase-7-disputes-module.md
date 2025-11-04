# Phase 7: Disputes Module - Детальный План Реализации

**Статус:** 🟡 HIGH Priority  
**Продолжительность:** Week 16-17 (2 недели)  
**Зависимости:** Phase 3 (Orders), Phase 1 (Auth), Phase 10 (Admin Panel)  
**Последнее обновление:** January 2025

> **📝 MVP Scope:** В MVP версии платформы споры касаются качества работы и проблем с заказами, а не платежных споров. Клиенты и подрядчики решают финансовые вопросы самостоятельно, поэтому споры фокусируются на качестве сервиса, завершении работы и поведении сторон.

---

## 📋 Обзор Phase 7

Модуль disputes обеспечивает справедливое разрешение конфликтов между клиентами и подрядчиками с соблюдением всех требований безопасности и PIPEDA.

### Основные компоненты
- **Система создания споров** - Инициация споров с доказательствами
- **Управление статусами** - Жизненный цикл спора от создания до разрешения
- **Загрузка доказательств** - Безопасная загрузка файлов с валидацией
- **Админ-панель** - Инструменты для разрешения споров
- **Уведомления** - Информирование сторон о статусе спора

---

## 🎯 Цели и Критерии Успеха

### Бизнес-цели
- Обеспечить справедливое разрешение конфликтов
- Повысить доверие пользователей к платформе
- Обеспечить соблюдение PIPEDA при обработке споров
- Улучшить качество сервиса через систему разрешения споров

### Критерии успеха
- ✅ 100% споров проходят через систему
- ✅ Среднее время разрешения спора < 3 рабочих дня
- ✅ Все доказательства проходят валидацию безопасности
- ✅ Уведомления доставляются в реальном времени
- ✅ Админы могут эффективно разрешать споры

---

## 📊 Архитектура Модуля

### Database Schema

```sql
-- Disputes table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    initiated_by UUID NOT NULL REFERENCES users(id),
    respondent_id UUID NOT NULL REFERENCES users(id),
    
    -- Dispute details
    reason dispute_reason_enum NOT NULL,
    description TEXT NOT NULL,
    amount_in_dispute INTEGER, -- Optional: for reference only (not used for payments in MVP)
    
    -- Status tracking
    status dispute_status_enum DEFAULT 'open',
    priority dispute_priority_enum DEFAULT 'medium',
    
    -- Resolution
    resolution_type dispute_resolution_enum,
    resolution_reason TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_parties CHECK (initiated_by != respondent_id)
);

-- Evidence table
CREATE TABLE dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    
    -- File details
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256
    
    -- Evidence details
    evidence_type evidence_type_enum NOT NULL,
    description TEXT,
    
    -- Security
    virus_scan_status VARCHAR(20) DEFAULT 'pending',
    virus_scan_result VARCHAR(100),
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 20971520), -- 20MB
    CONSTRAINT valid_mime_type CHECK (
        mime_type IN (
            'image/jpeg', 'image/png', 'image/webp',
            'application/pdf', 'text/plain'
        )
    )
);

-- Dispute messages/comments
CREATE TABLE dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- admin-only messages
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT message_length CHECK (LENGTH(message) >= 1 AND LENGTH(message) <= 2000)
);

-- Enums
CREATE TYPE dispute_reason_enum AS ENUM (
    'work_not_completed',
    'work_quality_issues',
    'late_completion',
    'different_from_description',
    'contractor_unresponsive',
    'client_changed_requirements',
    'safety_concerns',
    'fraudulent_activity',
    'inappropriate_behavior',
    'other'
);

CREATE TYPE dispute_status_enum AS ENUM (
    'open',           -- Спор создан, ожидает рассмотрения
    'under_review',   -- Админ рассматривает доказательства
    'awaiting_info',  -- Нужна дополнительная информация
    'resolved',       -- Спор разрешен
    'closed'          -- Спор закрыт (таймаут/отозван)
);

CREATE TYPE dispute_resolution_enum AS ENUM (
    'block_user',            -- Блокировка пользователя
    'suspend_account',       -- Временная блокировка аккаунта
    'close_order',           -- Закрытие заказа
    'warn_user',             -- Предупреждение пользователю
    'no_action'              -- Спор закрыт без действий
);

CREATE TYPE dispute_priority_enum AS ENUM (
    'low',
    'medium', 
    'high',
    'urgent'
);

CREATE TYPE evidence_type_enum AS ENUM (
    'photo',
    'screenshot',
    'document',
    'contract',
    'communication',
    'receipt',
    'other'
);

-- Indexes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);
CREATE INDEX idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
```

### Module Structure

```
src/disputes/
├── disputes.module.ts
├── disputes.controller.ts
├── disputes.service.ts
├── disputes.gateway.ts          # WebSocket для real-time updates
├── dto/
│   ├── create-dispute.dto.ts
│   ├── update-dispute.dto.ts
│   ├── add-evidence.dto.ts
│   ├── resolve-dispute.dto.ts
│   └── dispute-message.dto.ts
├── entities/
│   ├── dispute.entity.ts
│   ├── dispute-evidence.entity.ts
│   └── dispute-message.entity.ts
├── enums/
│   ├── dispute-reason.enum.ts
│   ├── dispute-status.enum.ts
│   ├── dispute-resolution.enum.ts
│   └── evidence-type.enum.ts
├── guards/
│   ├── dispute-access.guard.ts  # Проверка доступа к спору
│   └── admin-dispute.guard.ts   # Админ доступ
├── services/
│   ├── evidence.service.ts      # Обработка файлов
│   ├── resolution.service.ts    # Разрешение споров
│   └── notification.service.ts  # Уведомления о спорах
└── tests/
    ├── disputes.controller.spec.ts
    ├── disputes.service.spec.ts
    └── disputes.e2e-spec.ts
```

---

## 📋 Детальные Задачи

### 🔧 Task 7.1: Database Setup & Entities (2 дня)

#### 7.1.1: Создание миграций базы данных
**Приоритет:** 🔴 CRITICAL  
**Время:** 4 часа  

**Подзадачи:**
- [ ] Создать миграцию для таблицы `disputes`
- [ ] Создать миграцию для таблицы `dispute_evidence`
- [ ] Создать миграцию для таблицы `dispute_messages`
- [ ] Создать все необходимые enums
- [ ] Настроить индексы для оптимизации запросов
- [ ] Добавить constraints для валидации данных

**Критерии приемки:**
- Миграции выполняются без ошибок
- Все constraints работают корректно
- Индексы создаются правильно
- Rollback миграций работает

**Security Requirements:**
- Row-level security для доступа к спорам
- Шифрование sensitive полей
- Audit trail для всех изменений

#### 7.1.2: Создание Prisma entities
**Приоритет:** 🔴 CRITICAL  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Создать модель `Dispute` в schema.prisma
- [ ] Создать модель `DisputeEvidence` с файловыми полями
- [ ] Создать модель `DisputeMessage` для переписки
- [ ] Настроить relations между моделями
- [ ] Добавить валидацию на уровне схемы

**Критерии приемки:**
- Prisma generate работает без ошибок
- Relations настроены правильно
- Типы TypeScript генерируются корректно

#### 7.1.3: Создание TypeScript entities и enums
**Приоритет:** 🔴 CRITICAL  
**Время:** 2 часа  

**Подзадачи:**
- [ ] Создать `dispute.entity.ts` с декораторами
- [ ] Создать `dispute-evidence.entity.ts`
- [ ] Создать `dispute-message.entity.ts`
- [ ] Создать enums для всех типов
- [ ] Добавить валидацию class-validator

**Критерии приемки:**
- Все entities работают с ORM
- Валидация срабатывает корректно
- Типы соответствуют схеме БД

---

### 🏗️ Task 7.2: Core Dispute Service (2 дня)

#### 7.2.1: Базовый DisputesService
**Приоритет:** 🔴 CRITICAL  
**Время:** 4 часа  

**Подзадачи:**
- [ ] Создать `disputes.service.ts`
- [ ] Реализовать создание спора (`createDispute`)
- [ ] Реализовать получение споров пользователя (`getUserDisputes`)
- [ ] Реализовать получение деталей спора (`getDisputeById`)
- [ ] Реализовать обновление статуса спора (`updateStatus`)
- [ ] Добавить валидацию бизнес-логики

**Критерии приемки:**
- Все CRUD операции работают
- Бизнес-логика валидируется
- Ошибки обрабатываются корректно

**Security Requirements:**
- Проверка доступа к спору (только участники + админ)
- Валидация всех входных данных
- Rate limiting: 5 споров/день на пользователя

#### 7.2.2: Система статусов и жизненный цикл
**Приоритет:** 🟡 HIGH  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Реализовать state machine для статусов спора
- [ ] Добавить валидацию переходов между статусами
- [ ] Создать методы для изменения статуса с аудитом
- [ ] Реализовать автоматические переходы (таймауты)

**Критерии приемки:**
- State machine работает корректно
- Недопустимые переходы блокируются
- Audit log ведется для всех изменений

#### 7.2.3: Интеграция с Orders
**Приоритет:** 🔴 CRITICAL  
**Время:** 2 часа  

**Подзадачи:**
- [ ] Проверка существования и статуса заказа
- [ ] Проверка права создания спора (участники заказа)
- [ ] Валидация статуса заказа (только для completed/in_progress заказов)

**Критерии приемки:**
- Споры создаются только для валидных заказов
- Доступ к спорам ограничен участниками заказа
- Интеграция с Orders module работает

---

### 📁 Task 7.3: Evidence Management System (2 дня)

#### 7.3.1: EvidenceService для загрузки файлов
**Приоритет:** 🔴 CRITICAL  
**Время:** 4 часа  

**Подзадачи:**
- [ ] Создать `evidence.service.ts`
- [ ] Реализовать безопасную загрузку файлов
- [ ] Добавить валидацию MIME типов
- [ ] Реализовать проверку размера файлов (20MB max)
- [ ] Добавить генерацию и проверку хешей файлов
- [ ] Интегрировать с S3 для хранения

**Критерии приемки:**
- Файлы загружаются безопасно
- Валидация MIME типов работает
- Хеши файлов проверяются
- S3 интеграция функциональна

**Security Requirements:**
```typescript
// Допустимые MIME типы
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'application/pdf',
  'text/plain'
];

// Максимальные размеры
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES_PER_DISPUTE = 10;
```

#### 7.3.2: Вирусное сканирование и безопасность файлов
**Приоритет:** 🟡 HIGH  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Интегрировать ClamAV или облачное решение
- [ ] Реализовать асинхронное сканирование файлов
- [ ] Добавить очистку EXIF данных из изображений
- [ ] Создать карантин для подозрительных файлов
- [ ] Логирование результатов сканирования

**Критерии приемки:**
- Вирусное сканирование работает
- EXIF данные удаляются
- Подозрительные файлы помещаются в карантин
- Результаты логируются

#### 7.3.3: API endpoints для evidence
**Приоритет:** 🔴 CRITICAL  
**Время:** 2 часа  

**Подзадачи:**
- [ ] POST `/disputes/:id/evidence` - загрузка доказательств
- [ ] GET `/disputes/:id/evidence` - список доказательств
- [ ] DELETE `/disputes/:id/evidence/:evidenceId` - удаление
- [ ] GET `/disputes/evidence/:id/download` - скачивание с проверкой доступа

**Критерии приемки:**
- Все endpoints работают корректно
- Авторизация проверяется
- Rate limiting применяется

---

### 🎮 Task 7.4: API Controllers (1.5 дня)

#### 7.4.1: DisputesController - основные endpoints
**Приоритет:** 🔴 CRITICAL  
**Время:** 4 часа  

**Подзадачи:**
- [ ] POST `/api/v1/disputes` - создание спора
- [ ] GET `/api/v1/disputes` - список споров пользователя
- [ ] GET `/api/v1/disputes/:id` - детали спора
- [ ] PATCH `/api/v1/disputes/:id` - обновление (ограниченное)
- [ ] POST `/api/v1/disputes/:id/messages` - добавить сообщение

**API Specification:**

```typescript
// POST /api/v1/disputes
interface CreateDisputeDto {
  orderId: string;
  reason: DisputeReason;
  description: string; // min 50, max 2000 characters
  amountInDispute?: number; // Optional: for reference only (not used for payments in MVP)
}

// Response
interface DisputeResponse {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  description: string;
  amountInDispute: number;
  initiatedBy: string;
  respondentId: string;
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceResponse[];
  messages: DisputeMessageResponse[];
}
```

**Критерии приемки:**
- Все endpoints работают
- Валидация входных данных
- Правильные HTTP статусы
- OpenAPI документация

#### 7.4.2: Валидация и DTO
**Приоритет:** 🔴 CRITICAL  
**Время:** 2 часа  

**Подзадачи:**
- [ ] Создать `CreateDisputeDto` с валидацией
- [ ] Создать `UpdateDisputeDto`
- [ ] Создать `AddEvidenceDto`
- [ ] Создать `DisputeMessageDto`
- [ ] Добавить custom validators для бизнес-логики

**Критерии приемки:**
- Вся валидация работает
- Ошибки возвращаются в правильном формате
- Custom validators функциональны

---

### 🔐 Task 7.5: Security & Access Control (1 день)

#### 7.5.1: Guards для контроля доступа
**Приоритет:** 🔴 CRITICAL  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Создать `DisputeAccessGuard`
- [ ] Проверка доступа: только участники спора + админы
- [ ] Создать `AdminDisputeGuard` для админских функций
- [ ] Добавить role-based permissions

```typescript
@Injectable()
export class DisputeAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const disputeId = request.params.id;
    
    // Проверяем доступ к спору
    const hasAccess = await this.disputesService.checkUserAccess(
      disputeId, 
      user.id, 
      user.role
    );
    
    return hasAccess;
  }
}
```

**Критерии приемки:**
- Guards работают корректно
- Несанкционированный доступ блокируется
- Админы имеют полный доступ

#### 7.5.2: Rate Limiting и защита от спама
**Приоритет:** 🟡 HIGH  
**Время:** 2 часа  

**Подзадачи:**
- [ ] Rate limiting: 5 споров в день на пользователя
- [ ] Rate limiting: 20 сообщений/час в споре
- [ ] Rate limiting: 10 файлов/час на спор
- [ ] Защита от дублирования споров на один заказ

**Rate Limiting Configuration:**
```typescript
@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 86400) // 5 запросов в день
  async createDispute() { ... }
  
  @Post(':id/evidence')
  @Throttle(10, 3600) // 10 файлов в час
  async uploadEvidence() { ... }
}
```

**Критерии приемки:**
- Rate limiting работает
- Лимиты корректно применяются
- Ошибки правильно обрабатываются

---

### 👑 Task 7.6: Admin Resolution System (2 дня)

#### 7.6.1: ResolutionService для админов
**Приоритет:** 🟡 HIGH  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Создать `resolution.service.ts`
- [ ] Реализовать методы разрешения споров
- [ ] Применение решений (блокировка пользователя, закрытие заказа и т.д.)
- [ ] Создание audit trail для решений
- [ ] Интеграция с Admin Panel для применения решений

```typescript
interface ResolveDisputeDto {
  resolutionType: DisputeResolution;
  reason: string;
  adminNotes?: string;
  actionDetails?: {
    userId?: string; // Для block_user или suspend_account
    orderId?: string; // Для close_order
    warningMessage?: string; // Для warn_user
  };
}

@Injectable()
export class ResolutionService {
  async resolveDispute(
    disputeId: string,
    resolution: ResolveDisputeDto,
    adminId: string
  ) {
    // 1. Валидация разрешения
    // 2. Применение решения (блокировка, закрытие заказа и т.д.)
    // 3. Обновление статуса спора
    // 4. Отправка уведомлений
    // 5. Audit logging
  }
}
```

**Критерии приемки:**
- Споры разрешаются корректно
- Решения применяются (блокировка пользователя, закрытие заказа)
- Audit trail ведется
- Уведомления отправляются

#### 7.6.2: Admin API endpoints
**Приоритет:** 🟡 HIGH  
**Время:** 3 часа  

**Подзадачи:**
- [ ] GET `/api/v1/admin/disputes` - очередь споров для админов
- [ ] POST `/api/v1/admin/disputes/:id/resolve` - разрешение спора
- [ ] PATCH `/api/v1/admin/disputes/:id/priority` - изменение приоритета
- [ ] GET `/api/v1/admin/disputes/stats` - статистика споров

**Admin Queue API:**
```typescript
// GET /api/v1/admin/disputes
interface AdminDisputeQueueResponse {
  disputes: AdminDisputeItem[];
  pagination: PaginationMeta;
  filters: {
    status: DisputeStatus[];
    priority: DisputePriority[];
    ageInDays: number[];
  };
}

interface AdminDisputeItem {
  id: string;
  orderTitle: string;
  reason: DisputeReason;
  status: DisputeStatus;
  priority: DisputePriority;
  amountInDispute: number;
  ageInDays: number;
  evidenceCount: number;
  messageCount: number;
  lastActivity: string;
}
```

**Критерии приемки:**
- Admin endpoints работают
- Только админы имеют доступ
- Фильтрация и пагинация функциональны

---

### 🔔 Task 7.7: Real-time Notifications (1.5 дня)

#### 7.7.1: DisputesGateway для WebSocket
**Приоритет:** 🟡 HIGH  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Создать `disputes.gateway.ts`
- [ ] Real-time уведомления о статусе споров
- [ ] Уведомления о новых сообщениях
- [ ] Уведомления о загруженных доказательствах
- [ ] Room management для каждого спора

```typescript
@WebSocketGateway({
  namespace: 'disputes',
  cors: { origin: process.env.FRONTEND_URL }
})
export class DisputesGateway {
  @SubscribeMessage('join_dispute')
  async joinDispute(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { disputeId: string }
  ) {
    // Проверка доступа к спору
    // Добавление в room
  }
  
  // Отправка уведомлений участникам спора
  async notifyStatusChange(disputeId: string, status: DisputeStatus) {
    this.server.to(`dispute-${disputeId}`).emit('status_changed', {
      disputeId,
      status,
      timestamp: new Date()
    });
  }
}
```

**Критерии приемки:**
- WebSocket соединения работают
- Real-time уведомления доставляются
- Room management функционирует

#### 7.7.2: Email уведомления
**Приоритет:** 🟡 HIGH  
**Время:** 2 часа  

**Подзадачи:**
- [ ] Email при создании спора
- [ ] Email при изменении статуса
- [ ] Email при разрешении спора
- [ ] Email digest для админов (ежедневно)

**Email Templates:**
- `dispute-created` - Спор создан
- `dispute-status-changed` - Статус изменен
- `dispute-resolved` - Спор разрешен
- `admin-daily-digest` - Дневной отчет для админов

**Критерии приемки:**
- Email шаблоны работают
- Уведомления доставляются
- Unsubscribe ссылки работают

---

### 🧪 Task 7.8: Testing & Quality Assurance (2 дня)

#### 7.8.1: Unit Tests
**Приоритет:** 🔴 CRITICAL  
**Время:** 4 часа  

**Подзадачи:**
- [ ] Тесты для `DisputesService`
- [ ] Тесты для `EvidenceService` 
- [ ] Тесты для `ResolutionService`
- [ ] Тесты для Guards и валидации
- [ ] Покрытие > 80% для critical paths

**Test Cases:**
```typescript
describe('DisputesService', () => {
  it('should create dispute for valid order', async () => {
    // Тест создания спора
  });
  
  it('should reject dispute for invalid order', async () => {
    // Тест валидации заказа
  });
  
  it('should block unauthorized access', async () => {
    // Тест доступа к спору
  });
  
  it('should handle file upload security', async () => {
    // Тест безопасности файлов
  });
});
```

**Критерии приемки:**
- Все unit тесты проходят
- Покрытие кода > 80%
- Edge cases покрыты

#### 7.8.2: Integration Tests
**Приоритет:** 🔴 CRITICAL  
**Время:** 4 часа  

**Подзадачи:**
- [ ] E2E тесты создания и разрешения спора
- [ ] Тесты загрузки файлов с валидацией
- [ ] Тесты интеграции со Stripe
- [ ] Тесты WebSocket уведомлений
- [ ] Тесты security и rate limiting

**E2E Test Scenarios:**
```typescript
describe('Disputes E2E', () => {
  it('should complete full dispute lifecycle', async () => {
    // 1. Создание заказа
    // 2. Создание спора
    // 3. Загрузка доказательств
    // 4. Админ разрешает спор
    // 5. Выплата средств
    // 6. Проверка уведомлений
  });
  
  it('should handle file upload security', async () => {
    // Тест загрузки вредоносных файлов
  });
});
```

**Критерии приемки:**
- E2E тесты проходят полностью
- Интеграции работают стабильно
- Security тесты пройдены

---

### 📚 Task 7.9: Documentation & API Specs (1 день)

#### 7.9.1: OpenAPI документация
**Приоритет:** 🟢 MEDIUM  
**Время:** 3 часа  

**Подзадачи:**
- [ ] Swagger декораторы для всех endpoints
- [ ] Примеры request/response
- [ ] Документация error codes
- [ ] Rate limiting документация

#### 7.9.2: Техническая документация
**Приоритет:** 🟢 MEDIUM  
**Время:** 2 часа  

**Подзадачи:**
- [ ] README для модуля disputes
- [ ] Документация бизнес-логики
- [ ] Диаграммы процессов
- [ ] Troubleshooting guide

---

## 🔒 Security Requirements Checklist

### Authentication & Authorization ✅
- [ ] JWT токены проверяются на всех endpoints
- [ ] Доступ к спорам только для участников + админ
- [ ] Role-based permissions для админских функций
- [ ] Session tracking для audit trail

### Input Validation ✅  
- [ ] DTO validation на всех endpoints
- [ ] File upload validation (MIME, size, hash)
- [ ] Sanitization описаний и сообщений
- [ ] Business logic validation (статусы, суммы)

### Rate Limiting ✅
- [ ] 5 споров в день на пользователя
- [ ] 20 сообщений в час в споре  
- [ ] 10 файлов в час на спор
- [ ] Защита от дублирования споров

### File Security ✅
- [ ] MIME type validation (whitelist)
- [ ] File size limits (20MB max)
- [ ] Virus scanning (ClamAV/cloud)
- [ ] EXIF data stripping
- [ ] Hash verification
- [ ] Secure S3 storage

### Data Protection ✅
- [ ] Шифрование sensitive данных
- [ ] PII masking в логах
- [ ] Secure file storage (S3 private)
- [ ] Access logs для audit

### PIPEDA Compliance ✅
- [ ] Право доступа к данным споров
- [ ] Право удаления данных споров
- [ ] Логирование обработки данных
- [ ] Согласие на обработку доказательств

---

## 📊 Performance Requirements

### Response Times
- Создание спора: < 500ms
- Загрузка списка споров: < 300ms  
- Загрузка файла (5MB): < 10s
- Real-time уведомления: < 100ms

### Scalability
- Поддержка до 1000 активных споров
- 100 GB файлового хранилища
- 50 concurrent WebSocket connections
- Database query optimization

### Monitoring
- Error tracking (Sentry)
- Performance monitoring  
- File storage monitoring
- WebSocket connection monitoring

---

## 🧪 Testing Strategy

### Unit Tests (80%+ Coverage)
```bash
# Запуск unit тестов
npm run test src/disputes

# Coverage report
npm run test:cov src/disputes
```

### E2E Tests
```bash
# Запуск E2E тестов
npm run test:e2e disputes

# Specific test suites
npm run test:e2e disputes-lifecycle
npm run test:e2e disputes-security  
npm run test:e2e disputes-files
```

### Security Tests
```bash
# File upload security
npm run test:security file-upload

# Access control tests
npm run test:security disputes-access

# Rate limiting tests  
npm run test:security rate-limiting
```

---

## 📋 Deployment Checklist

### Pre-Production
- [ ] Все тесты проходят
- [ ] Security audit пройден
- [ ] Performance tests выполнены
- [ ] Database migrations протестированы
- [ ] File storage настроен (S3)
- [ ] Virus scanning настроен

### Production Setup
- [ ] Environment variables настроены
- [ ] SSL certificates установлены
- [ ] Rate limiting активирован  
- [ ] Monitoring настроен
- [ ] Log aggregation работает
- [ ] Backup strategy реализована

### Post-Deployment
- [ ] Health checks проходят
- [ ] Метрики собираются
- [ ] Alerts настроены
- [ ] Documentation обновлена

---

## 📞 Dependencies & Integration Points

### Internal Dependencies
- **Phase 1 (Auth)** - JWT tokens, user roles
- **Phase 3 (Orders)** - Order validation, participants
- **Phase 10 (Admin Panel)** - Admin dispute resolution dashboard
- **Phase 8 (Notifications)** - Email/push notifications (future)

> **📝 MVP Scope:** В MVP нет зависимости от Phase 6 (Payments), так как споры касаются качества работы и проблем с заказами, а не платежных споров.

### External Services
- **AWS S3** - File storage для доказательств  
- **ClamAV/VirusTotal** - Virus scanning
- **OneSignal** - Push notifications (future)
- **SendGrid** - Email notifications (future)

### API Dependencies
```typescript
// Orders service integration
await this.ordersService.validateOrderForDispute(orderId, userId);

// Admin service integration (for user blocking, order closing)
await this.adminService.blockUser(userId, reason);
await this.ordersService.closeOrder(orderId, reason);

// Notifications service integration (future)
await this.notificationsService.sendDisputeCreated(disputeId);
```

---

## 🚀 Success Metrics

### Business Metrics
- **Dispute Resolution Time:** < 3 business days average
- **User Satisfaction:** > 85% satisfaction with dispute process
- **Dispute Resolution Rate:** > 90% disputes resolved successfully
- **Admin Efficiency:** < 1 hour average time to resolve dispute

### Technical Metrics
- **API Response Time:** < 500ms for all endpoints
- **File Upload Success:** > 99% upload success rate  
- **Real-time Delivery:** < 100ms WebSocket latency
- **System Uptime:** 99.9% availability

### Security Metrics
- **Vulnerability Scans:** 0 critical vulnerabilities
- **File Security:** 100% files scanned for malware
- **Access Control:** 0 unauthorized access incidents
- **Data Breaches:** 0 incidents

---

## 📝 Notes & Considerations

### Technical Debt
- Рассмотреть end-to-end encryption для сообщений споров
- Добавить ML для автоматической категоризации споров
- Оптимизация хранения больших файлов (video поддержка)
- Advanced fraud detection patterns

### Future Enhancements
- AI-powered dispute resolution suggestions
- Video evidence support
- Multi-language support для международного рынка
- Integration with legal services
- Blockchain proof-of-evidence (optional)

### Operational Considerations  
- 24/7 monitoring для critical disputes
- Escalation procedures для urgent cases
- Admin training materials
- Customer support integration
- Legal compliance reviews

---

**Статус:** Ready for Implementation  
**Начало:** Week 16  
**Завершение:** Week 17  
**Следующий этап:** Phase 8 - Notifications Module

**Последнее обновление:** 29 октября 2025  
**Автор:** GitHub Copilot  
**Ревьюер:** Daniel Filinski