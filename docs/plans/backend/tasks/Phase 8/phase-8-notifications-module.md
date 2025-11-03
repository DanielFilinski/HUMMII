# Phase 8: Notifications Module - Детальный План

**Статус:** 🟡 HIGH  
**Продолжительность:** Week 18-19 (2 недели)  
**Зависимости:** Phase 1-7 (Auth, Users, Orders, Chat, Reviews, Payments, Disputes)

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [Архитектура](#архитектура)
3. [Задачи](#задачи)
4. [Безопасность](#безопасность)
5. [Тестирование](#тестирование)
6. [Критерии завершения](#критерии-завершения)

---

## 🎯 Обзор

### Цели Phase 8

Создать мультиканальную систему уведомлений для информирования пользователей о важных событиях платформы:
- ✉️ Email уведомления (через OneSignal)
- 📱 Push уведомления (через OneSignal)
- 🔔 In-app уведомления (через WebSocket)
- 📊 Управление настройками пользователя
- 📈 История уведомлений
- 📧 Email digest (ежедневные сводки)

### Основные компоненты

1. **Notification Module** - управление уведомлениями
2. **Notification Service** - бизнес-логика
3. **Notification Gateway** - WebSocket для real-time
4. **OneSignal Integration** - email + push
5. **Notification Templates** - шаблоны уведомлений
6. **User Preferences** - настройки пользователя
7. **Background Jobs** - отложенные уведомления

---

## 🏗️ Архитектура

### Database Schema

```prisma
// prisma/schema.prisma

enum NotificationType {
  ORDER_STATUS_CHANGED
  NEW_PROPOSAL
  MESSAGE_RECEIVED
  PAYMENT_RECEIVED
  REVIEW_SUBMITTED
  DISPUTE_OPENED
  VERIFICATION_STATUS
  SECURITY_ALERT
  SYSTEM_ANNOUNCEMENT
}

enum NotificationPriority {
  HIGH      // Критичные (security alerts, payments)
  MEDIUM    // Важные (order updates, messages)
  LOW       // Информационные (marketing, tips)
}

enum NotificationChannel {
  IN_APP
  EMAIL
  PUSH
}

model Notification {
  id          String               @id @default(cuid())
  userId      String
  type        NotificationType
  priority    NotificationPriority @default(MEDIUM)
  title       String               @db.VarChar(255)
  body        String               @db.Text
  actionUrl   String?              @db.VarChar(500) // Deep link для мобильных
  metadata    Json?                // Дополнительные данные
  
  isRead      Boolean              @default(false)
  readAt      DateTime?
  
  channels    NotificationChannel[] // Через какие каналы отправлено
  sentAt      DateTime?            // Когда отправлено
  
  createdAt   DateTime             @default(now())
  expiresAt   DateTime?            // Для time-sensitive уведомлений
  
  user        User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@index([type])
}

model NotificationPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  
  // Email настройки
  emailEnabled          Boolean  @default(true)
  emailOrderUpdates     Boolean  @default(true)
  emailNewProposals     Boolean  @default(true)
  emailMessages         Boolean  @default(true)
  emailPayments         Boolean  @default(true)
  emailReviews          Boolean  @default(true)
  emailDisputes         Boolean  @default(true)
  emailSecurity         Boolean  @default(true) // Всегда true для безопасности
  emailMarketing        Boolean  @default(false)
  emailDigest           Boolean  @default(true) // Ежедневная сводка
  emailDigestTime       String   @default("09:00") // Время отправки (HH:mm)
  
  // Push настройки
  pushEnabled           Boolean  @default(true)
  pushOrderUpdates      Boolean  @default(true)
  pushNewProposals      Boolean  @default(true)
  pushMessages          Boolean  @default(true)
  pushPayments          Boolean  @default(true)
  pushReviews           Boolean  @default(true)
  pushDisputes          Boolean  @default(true)
  pushSecurity          Boolean  @default(true) // Всегда true
  
  // In-app настройки
  inAppEnabled          Boolean  @default(true)
  inAppSound            Boolean  @default(true)
  inAppVibration        Boolean  @default(true)
  
  updatedAt             DateTime @updatedAt
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model EmailLog {
  id          String   @id @default(cuid())
  userId      String?
  email       String   @db.VarChar(255)
  subject     String   @db.VarChar(500)
  template    String   @db.VarChar(100)
  status      String   @db.VarChar(50) // sent, failed, bounced
  provider    String   @default("onesignal") // onesignal, sendgrid, etc.
  providerId  String?  @db.VarChar(255) // External provider message ID
  error       String?  @db.Text
  sentAt      DateTime @default(now())
  
  @@index([userId])
  @@index([email])
  @@index([sentAt])
}
```

### Notification Types Mapping

```typescript
// src/notifications/types/notification-types.ts

export const NOTIFICATION_CONFIG = {
  ORDER_STATUS_CHANGED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'order-status-changed',
    title: (status: string) => `Order status updated to ${status}`,
  },
  NEW_PROPOSAL: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    template: 'new-proposal',
    title: () => 'New proposal received',
  },
  MESSAGE_RECEIVED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
    template: 'message-received',
    title: (senderName: string) => `New message from ${senderName}`,
  },
  PAYMENT_RECEIVED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'payment-received',
    title: (amount: number) => `Payment received: $${amount}`,
  },
  REVIEW_SUBMITTED: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'review-submitted',
    title: () => 'New review received',
  },
  DISPUTE_OPENED: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'dispute-opened',
    title: () => 'Dispute opened for your order',
  },
  VERIFICATION_STATUS: {
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    template: 'verification-status',
    title: (status: string) => `Verification ${status}`,
  },
  SECURITY_ALERT: {
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    template: 'security-alert',
    title: () => 'Security Alert',
  },
} as const;
```

---

## 📝 Задачи

### Task 8.1: Database Schema & Migrations (День 1)

**Описание:** Создать Prisma схему для уведомлений и настроек пользователя.

**Подзадачи:**

- [ ] **8.1.1** Создать enum типы (NotificationType, NotificationPriority, NotificationChannel)
- [ ] **8.1.2** Создать модель Notification
- [ ] **8.1.3** Создать модель NotificationPreferences
- [ ] **8.1.4** Создать модель EmailLog
- [ ] **8.1.5** Добавить индексы для оптимизации запросов
- [ ] **8.1.6** Создать и применить миграцию

**Файлы:**
```
api/prisma/schema.prisma
api/prisma/migrations/YYYYMMDD_add_notifications/migration.sql
```

**Acceptance Criteria:**
- ✅ Все таблицы созданы
- ✅ Индексы добавлены (userId, createdAt, isRead)
- ✅ Foreign keys настроены с CASCADE delete
- ✅ Миграция применена успешно

---

### Task 8.2: Notification Module Setup (День 1-2)

**Описание:** Создать базовую структуру Notification Module.

**Подзадачи:**

- [ ] **8.2.1** Создать NotificationModule
- [ ] **8.2.2** Создать NotificationController (REST endpoints)
- [ ] **8.2.3** Создать NotificationService (бизнес-логика)
- [ ] **8.2.4** Создать NotificationGateway (WebSocket для real-time)
- [ ] **8.2.5** Создать DTOs (CreateNotificationDto, UpdateNotificationDto)
- [ ] **8.2.6** Настроить зависимости (PrismaModule, BullModule)

**Файлы:**
```
api/src/notifications/
├── notifications.module.ts
├── notifications.controller.ts
├── notifications.service.ts
├── notifications.gateway.ts
├── dto/
│   ├── create-notification.dto.ts
│   ├── update-notification-preferences.dto.ts
│   └── notification-query.dto.ts
├── entities/
│   ├── notification.entity.ts
│   └── notification-preferences.entity.ts
└── types/
    └── notification-types.ts
```

**Acceptance Criteria:**
- ✅ Module зарегистрирован в AppModule
- ✅ Controller имеет базовые endpoints
- ✅ Service внедрен в Controller
- ✅ Gateway настроен для WebSocket
- ✅ DTOs валидируются через class-validator

---

### Task 8.3: Notification Service - Core Logic (День 2-3)

**Описание:** Реализовать основную логику создания и управления уведомлениями.

**Подзадачи:**

- [ ] **8.3.1** Метод `create()` - создание уведомления
- [ ] **8.3.2** Метод `findAll()` - получение списка уведомлений пользователя
- [ ] **8.3.3** Метод `markAsRead()` - пометка как прочитанное
- [ ] **8.3.4** Метод `markAllAsRead()` - пометить все как прочитанные
- [ ] **8.3.5** Метод `getUnreadCount()` - количество непрочитанных
- [ ] **8.3.6** Метод `delete()` - удаление уведомления
- [ ] **8.3.7** Метод `deleteAll()` - удалить все уведомления
- [ ] **8.3.8** Метод `cleanupExpired()` - удаление просроченных уведомлений

**Пример:**
```typescript
// api/src/notifications/notifications.service.ts

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationsGateway,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    data: CreateNotificationDto,
  ): Promise<Notification> {
    // 1. Проверить настройки пользователя
    const preferences = await this.getUserPreferences(userId);
    
    // 2. Создать уведомление в БД
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        priority: data.priority || NotificationPriority.MEDIUM,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        channels: this.getEnabledChannels(type, preferences),
      },
    });

    // 3. Отправить real-time через WebSocket
    if (notification.channels.includes(NotificationChannel.IN_APP)) {
      this.notificationGateway.sendToUser(userId, notification);
    }

    // 4. Добавить в очередь для email/push
    if (notification.channels.includes(NotificationChannel.EMAIL)) {
      await this.notificationQueue.add('send-email', {
        notificationId: notification.id,
        userId,
        type,
      });
    }

    if (notification.channels.includes(NotificationChannel.PUSH)) {
      await this.notificationQueue.add('send-push', {
        notificationId: notification.id,
        userId,
        type,
      });
    }

    return notification;
  }

  async findAll(userId: string, query: NotificationQueryDto) {
    const { page = 1, limit = 20, isRead, type } = query;
    
    const where = {
      userId,
      ...(isRead !== undefined && { isRead }),
      ...(type && { type }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
```

**Acceptance Criteria:**
- ✅ Все методы реализованы
- ✅ Проверяются настройки пользователя перед отправкой
- ✅ Pagination работает корректно
- ✅ Unread count кэшируется в Redis (опционально)
- ✅ Unit tests написаны

---

### Task 8.4: Notification Preferences Management (День 3)

**Описание:** Реализовать управление настройками уведомлений пользователя.

**Подзадачи:**

- [ ] **8.4.1** Создать PreferencesController
- [ ] **8.4.2** Создать PreferencesService
- [ ] **8.4.3** Endpoint `GET /notifications/preferences` - получить настройки
- [ ] **8.4.4** Endpoint `PATCH /notifications/preferences` - обновить настройки
- [ ] **8.4.5** Endpoint `POST /notifications/preferences/reset` - сбросить к дефолту
- [ ] **8.4.6** Создать default preferences при регистрации пользователя
- [ ] **8.4.7** Валидация: security alerts всегда включены (нельзя отключить)

**Пример:**
```typescript
// api/src/notifications/preferences/preferences.controller.ts

@Controller('notifications/preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  async getPreferences(@CurrentUser() user: User) {
    return this.preferencesService.findOrCreate(user.id);
  }

  @Patch()
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    // Валидация: security alerts нельзя отключить
    if (dto.emailSecurity === false || dto.pushSecurity === false) {
      throw new BadRequestException('Security alerts cannot be disabled');
    }

    return this.preferencesService.update(user.id, dto);
  }

  @Post('reset')
  async resetPreferences(@CurrentUser() user: User) {
    return this.preferencesService.reset(user.id);
  }
}
```

**Acceptance Criteria:**
- ✅ Preferences создаются автоматически при регистрации
- ✅ Security alerts нельзя отключить
- ✅ Reset восстанавливает дефолтные значения
- ✅ Unit tests написаны

---

### Task 8.5: WebSocket Gateway - Real-time Notifications (День 4)

**Описание:** Реализовать WebSocket gateway для real-time уведомлений.

**Подзадачи:**

- [ ] **8.5.1** Настроить Socket.io в NotificationsGateway
- [ ] **8.5.2** Аутентификация WebSocket соединений (JWT)
- [ ] **8.5.3** Event `notification:new` - новое уведомление
- [ ] **8.5.4** Event `notification:read` - пометить как прочитанное
- [ ] **8.5.5** Event `notification:unread-count` - обновление счетчика
- [ ] **8.5.6** Комната для каждого пользователя (`user:${userId}`)
- [ ] **8.5.7** Rate limiting: 100 events/min per user

**Пример:**
```typescript
// api/src/notifications/notifications.gateway.ts

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class NotificationsGateway 
  implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Извлечь JWT из handshake
      const token = client.handshake.auth?.token || 
                    client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Верифицировать JWT
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Сохранить userId в socket data
      client.data.userId = userId;

      // Присоединить к комнате пользователя
      client.join(`user:${userId}`);

      // Отправить текущий unread count
      const unreadCount = await this.prisma.notification.count({
        where: { userId, isRead: false },
      });

      client.emit('notification:unread-count', { count: unreadCount });

      console.log(`User ${userId} connected to notifications`);
    } catch (error) {
      console.error('WebSocket auth failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      console.log(`User ${userId} disconnected from notifications`);
    }
  }

  // Отправить уведомление конкретному пользователю
  sendToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  // Обновить unread count
  updateUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('notification:unread-count', { count });
  }

  @SubscribeMessage('notification:mark-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = client.data.userId;
    
    // Пометить как прочитанное
    await this.prisma.notification.updateMany({
      where: { id: data.notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });

    // Обновить unread count
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    this.updateUnreadCount(userId, unreadCount);
  }
}
```

**Acceptance Criteria:**
- ✅ JWT аутентификация работает
- ✅ Пользователи получают уведомления в real-time
- ✅ Unread count обновляется автоматически
- ✅ Соединение разрывается при неверном токене
- ✅ Rate limiting настроен

---

### Task 8.5.5: OneSignal Configuration & Initial Setup (День 5)

**Описание:** Детальная настройка OneSignal для email и push уведомлений.

**⚠️ ВАЖНО:** OneSignal требует регистрацию и настройку на [onesignal.com](https://onesignal.com) до начала интеграции.

**Подзадачи:**

- [ ] **8.5.5.1** Создать OneSignal аккаунт и приложение
  - Зарегистрироваться на https://onesignal.com
  - Создать приложение "Hummii Platform"
  - Выбрать платформы: Web Push + Email

- [ ] **8.5.5.2** Настроить Email channel в OneSignal dashboard
  - Включить Email messaging
  - Sender Email: `noreply@hummii.ca`
  - Sender Name: `Hummii Platform`
  - Reply-To: `support@hummii.ca`
  - Verify domain ownership

- [ ] **8.5.5.3** Настроить DNS records для email deliverability
  ```dns
  # SPF Record
  hummii.ca. IN TXT "v=spf1 include:onesignal.com ~all"
  
  # DKIM Record (получить от OneSignal)
  onesignal._domainkey.hummii.ca. IN TXT "v=DKIM1; k=rsa; p=<public-key>"
  
  # DMARC Record
  _dmarc.hummii.ca. IN TXT "v=DMARC1; p=quarantine; rua=mailto:postmaster@hummii.ca"
  ```

- [ ] **8.5.5.4** Получить API credentials из OneSignal
  - REST API Key (Settings → Keys & IDs)
  - App ID (Settings → Keys & IDs)
  - User Auth Key (optional, для расширенных операций)

- [ ] **8.5.5.5** Добавить environment variables
  ```env
  # .env
  ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  ONESIGNAL_API_KEY=your-rest-api-key-here
  ONESIGNAL_USER_AUTH_KEY=optional-user-auth-key
  ONESIGNAL_EMAIL_ENABLED=true
  ONESIGNAL_PUSH_ENABLED=true
  ONESIGNAL_SENDER_EMAIL=noreply@hummii.ca
  ONESIGNAL_SENDER_NAME=Hummii Platform
  ```

- [ ] **8.5.5.6** Установить OneSignal Node.js SDK
  ```bash
  pnpm add @onesignal/node-onesignal
  ```

- [ ] **8.5.5.7** Создать OneSignal configuration file
  **Файл:** `api/src/notifications/integrations/onesignal.config.ts`
  ```typescript
  import { registerAs } from '@nestjs/config';
  
  export default registerAs('onesignal', () => ({
    appId: process.env.ONESIGNAL_APP_ID,
    apiKey: process.env.ONESIGNAL_API_KEY,
    userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY,
    emailEnabled: process.env.ONESIGNAL_EMAIL_ENABLED === 'true',
    pushEnabled: process.env.ONESIGNAL_PUSH_ENABLED === 'true',
    senderEmail: process.env.ONESIGNAL_SENDER_EMAIL || 'noreply@hummii.ca',
    senderName: process.env.ONESIGNAL_SENDER_NAME || 'Hummii Platform',
  }));
  ```

- [ ] **8.5.5.8** Добавить валидацию в env schema
  **Файл:** `api/src/config/validation.schema.ts`
  ```typescript
  ONESIGNAL_APP_ID: Joi.string().required(),
  ONESIGNAL_API_KEY: Joi.string().required(),
  ONESIGNAL_EMAIL_ENABLED: Joi.boolean().default(true),
  ONESIGNAL_PUSH_ENABLED: Joi.boolean().default(true),
  ```

- [ ] **8.5.5.9** Создать OneSignal Module
  **Файл:** `api/src/notifications/integrations/onesignal.module.ts`
  ```typescript
  import { Module } from '@nestjs/common';
  import { ConfigModule } from '@nestjs/config';
  import { OneSignalService } from './onesignal.service';
  import oneSignalConfig from './onesignal.config';
  
  @Module({
    imports: [ConfigModule.forFeature(oneSignalConfig)],
    providers: [OneSignalService],
    exports: [OneSignalService],
  })
  export class OneSignalModule {}
  ```

- [ ] **8.5.5.10** Настроить User Segments в OneSignal
  - All Users (все пользователи)
  - Clients Only (только клиенты)
  - Contractors Only (только подрядчики)
  - Verified Contractors (верифицированные подрядчики)
  - Premium Subscribers (платные подписки)

**OneSignal Dashboard Settings:**
- Delivery Settings: Smart Delivery enabled
- Frequency Capping: Max 20 push per day per user
- Quiet Hours: 22:00 - 08:00 (no notifications at night)
- Default Icon: Upload Hummii logo (256x256 px)
- Timezone: America/Toronto (Eastern Time)

**Security Requirements:**
- ✅ API keys only in environment variables (NEVER in code)
- ✅ Use separate App IDs for dev/staging/prod
- ✅ Rate limiting: 100 API calls per minute
- ✅ User data encrypted in transit (HTTPS)

**Testing:**
- [ ] Send test email через OneSignal dashboard
- [ ] Verify email delivery (check spam folder)
- [ ] Check DNS records with `dig` or `nslookup`
- [ ] Test unsubscribe link functionality
- [ ] Email deliverability score (mail-tester.com)

**Acceptance Criteria:**
- ✅ OneSignal account created
- ✅ Email channel configured
- ✅ DNS records set up correctly
- ✅ API credentials obtained
- ✅ Environment variables configured
- ✅ Test email sent successfully
- ✅ OneSignalModule created

---

### Task 8.6: OneSignal Integration - Email & Push (День 5-6)

**Описание:** Интегрировать OneSignal для отправки email и push уведомлений.

**Подзадачи:**

- [ ] **8.6.1** Установить `@onesignal/node-onesignal` SDK
- [ ] **8.6.2** Создать OneSignalService
- [ ] **8.6.3** Метод `sendEmail()` - отправка email
- [ ] **8.6.4** Метод `sendPush()` - отправка push
- [ ] **8.6.5** Настроить API ключи в .env (ONESIGNAL_APP_ID, ONESIGNAL_API_KEY)
- [ ] **8.6.6** Обработка ошибок (bounce, invalid email, etc.)
- [ ] **8.6.7** Логирование отправленных email в EmailLog

**Пример:**
```typescript
// api/src/notifications/integrations/onesignal.service.ts

import * as OneSignal from '@onesignal/node-onesignal';

@Injectable()
export class OneSignalService {
  private client: OneSignal.DefaultApi;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const configuration = OneSignal.createConfiguration({
      appKey: config.get('ONESIGNAL_API_KEY'),
    });
    this.client = new OneSignal.DefaultApi(configuration);
  }

  async sendEmail(
    email: string,
    subject: string,
    template: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      const notification = new OneSignal.Notification();
      notification.app_id = this.config.get('ONESIGNAL_APP_ID');
      notification.include_email_tokens = [email];
      notification.email_subject = subject;
      notification.email_body = this.renderTemplate(template, data);

      const response = await this.client.createNotification(notification);

      // Логирование
      await this.prisma.emailLog.create({
        data: {
          userId: data.userId,
          email,
          subject,
          template,
          status: 'sent',
          provider: 'onesignal',
          providerId: response.id,
        },
      });
    } catch (error) {
      // Логирование ошибки
      await this.prisma.emailLog.create({
        data: {
          userId: data.userId,
          email,
          subject,
          template,
          status: 'failed',
          provider: 'onesignal',
          error: error.message,
        },
      });

      throw error;
    }
  }

  async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    // Получить external_user_id (userId) из OneSignal
    const notification = new OneSignal.Notification();
    notification.app_id = this.config.get('ONESIGNAL_APP_ID');
    notification.include_external_user_ids = [userId];
    notification.headings = { en: title };
    notification.contents = { en: body };
    notification.data = data;

    await this.client.createNotification(notification);
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    // Простой template engine или использовать Handlebars
    // TODO: Реализовать рендеринг шаблонов
    return template;
  }
}
```

**Environment Variables:**
```env
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_API_KEY=your-api-key
```

**Acceptance Criteria:**
- ✅ OneSignal SDK интегрирован
- ✅ Email отправляются успешно
- ✅ Push уведомления работают
- ✅ Ошибки обрабатываются и логируются
- ✅ EmailLog сохраняет все отправки

---

### Task 8.7: Notification Templates (День 6)

**Описание:** Создать систему шаблонов для email и push уведомлений.

**Подзадачи:**

- [ ] **8.7.1** Создать папку `templates/` для HTML шаблонов
- [ ] **8.7.2** Шаблон `order-status-changed.hbs`
- [ ] **8.7.3** Шаблон `new-proposal.hbs`
- [ ] **8.7.4** Шаблон `message-received.hbs`
- [ ] **8.7.5** Шаблон `payment-received.hbs`
- [ ] **8.7.6** Шаблон `review-submitted.hbs`
- [ ] **8.7.7** Шаблон `dispute-opened.hbs`
- [ ] **8.7.8** Шаблон `verification-status.hbs`
- [ ] **8.7.9** Шаблон `security-alert.hbs`
- [ ] **8.7.10** Шаблон `email-digest.hbs` (ежедневная сводка)
- [ ] **8.7.11** Установить Handlebars для рендеринга
- [ ] **8.7.12** Создать TemplateService для рендеринга

**Пример:**
```html
<!-- api/src/notifications/templates/order-status-changed.hbs -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
    <h2>Order Status Updated</h2>
    <p>Hi {{userName}},</p>
    <p>Your order <strong>#{{orderId}}</strong> status has been updated to <strong>{{newStatus}}</strong>.</p>
    
    {{#if actionUrl}}
      <a href="{{actionUrl}}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
        View Order
      </a>
    {{/if}}
    
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #dee2e6;">
    
    <p style="font-size: 12px; color: #6c757d;">
      If you have any questions, please contact us at support@hummii.ca
    </p>
    
    <p style="font-size: 12px; color: #6c757d;">
      <a href="{{unsubscribeUrl}}">Unsubscribe</a> from these notifications
    </p>
  </div>
</body>
</html>
```

```typescript
// api/src/notifications/services/template.service.ts

import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates');
    const files = fs.readdirSync(templatesDir);

    files.forEach((file) => {
      if (file.endsWith('.hbs')) {
        const templateName = file.replace('.hbs', '');
        const templatePath = path.join(templatesDir, file);
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(templateContent);
        this.templates.set(templateName, template);
      }
    });
  }

  render(templateName: string, data: Record<string, any>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    return template({
      ...data,
      baseUrl: process.env.FRONTEND_URL,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/settings/notifications`,
    });
  }
}
```

**Acceptance Criteria:**
- ✅ Все основные шаблоны созданы
- ✅ Handlebars рендерит шаблоны корректно
- ✅ Unsubscribe ссылка добавлена в каждый email
- ✅ Responsive дизайн (mobile-friendly)
- ✅ Branding (лого Hummii) добавлен

---

### Task 8.8: Background Jobs - Delayed Notifications (День 7)

**Описание:** Реализовать фоновые задачи для отправки email и push через очередь.

**Подзадачи:**

- [ ] **8.8.1** Создать NotificationsProcessor (Bull queue processor)
- [ ] **8.8.2** Job `send-email` - отправка email
- [ ] **8.8.3** Job `send-push` - отправка push
- [ ] **8.8.4** Job `send-digest` - ежедневная сводка (cron: 9:00 AM)
- [ ] **8.8.5** Job `cleanup-expired` - удаление просроченных уведомлений (cron: daily)
- [ ] **8.8.6** Retry strategy (3 попытки с exponential backoff)
- [ ] **8.8.7** Dead letter queue для failed jobs

**Пример:**
```typescript
// api/src/notifications/processors/notifications.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('notifications')
export class NotificationsProcessor {
  constructor(
    private readonly oneSignalService: OneSignalService,
    private readonly templateService: TemplateService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { notificationId, userId, type } = job.data;

    // Получить уведомление
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // Проверить preferences
    const preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    const preferenceKey = `email${type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, '')}`;
    if (!preferences?.[preferenceKey]) {
      console.log(`Email disabled for ${type} by user ${userId}`);
      return;
    }

    // Рендерить template
    const template = NOTIFICATION_CONFIG[type].template;
    const html = this.templateService.render(template, {
      userName: notification.user.name,
      ...notification.metadata,
    });

    // Отправить email
    await this.oneSignalService.sendEmail(
      notification.user.email,
      notification.title,
      template,
      {
        userId,
        html,
      },
    );

    // Обновить статус
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { sentAt: new Date() },
    });
  }

  @Process('send-push')
  async handleSendPush(job: Job) {
    const { notificationId, userId, type } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // Проверить preferences
    const preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    const preferenceKey = `push${type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, '')}`;
    if (!preferences?.[preferenceKey]) {
      console.log(`Push disabled for ${type} by user ${userId}`);
      return;
    }

    // Отправить push
    await this.oneSignalService.sendPush(
      userId,
      notification.title,
      notification.body,
      {
        actionUrl: notification.actionUrl,
        notificationId: notification.id,
      },
    );
  }

  @Process({ name: 'send-digest', concurrency: 5 })
  async handleSendDigest(job: Job) {
    const { userId } = job.data;

    // Получить все непрочитанные уведомления за последние 24 часа
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (notifications.length === 0) {
      return; // Нет уведомлений - не отправляем
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Рендерить digest template
    const html = this.templateService.render('email-digest', {
      userName: user.name,
      notifications,
      count: notifications.length,
    });

    await this.oneSignalService.sendEmail(
      user.email,
      `Daily Summary: ${notifications.length} new notifications`,
      'email-digest',
      { userId, html },
    );
  }

  @Process('cleanup-expired')
  async handleCleanupExpired() {
    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`Deleted ${result.count} expired notifications`);
  }
}
```

**Cron Jobs Setup:**
```typescript
// api/src/notifications/notifications.module.ts

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    ScheduleModule.forRoot(), // Для cron jobs
  ],
  // ...
})
export class NotificationsModule implements OnModuleInit {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async onModuleInit() {
    // Ежедневная отправка digest в 9:00 AM
    await this.notificationQueue.add(
      'schedule-digest',
      {},
      {
        repeat: {
          cron: '0 9 * * *', // 9:00 AM каждый день
        },
      },
    );

    // Ежедневная очистка просроченных уведомлений в 2:00 AM
    await this.notificationQueue.add(
      'cleanup-expired',
      {},
      {
        repeat: {
          cron: '0 2 * * *', // 2:00 AM каждый день
        },
      },
    );
  }
}
```

**Acceptance Criteria:**
- ✅ Email queue обрабатывает задачи
- ✅ Push queue обрабатывает задачи
- ✅ Digest отправляется в 9:00 AM
- ✅ Expired notifications удаляются автоматически
- ✅ Retry strategy работает (3 попытки)
- ✅ Failed jobs попадают в DLQ

---

### Task 8.9: REST API Endpoints (День 8)

**Описание:** Создать REST API endpoints для управления уведомлениями.

**Подзадачи:**

- [ ] **8.9.1** `GET /notifications` - список уведомлений (pagination)
- [ ] **8.9.2** `GET /notifications/unread-count` - количество непрочитанных
- [ ] **8.9.3** `PATCH /notifications/:id/read` - пометить как прочитанное
- [ ] **8.9.4** `POST /notifications/mark-all-read` - пометить все
- [ ] **8.9.5** `DELETE /notifications/:id` - удалить уведомление
- [ ] **8.9.6** `DELETE /notifications` - удалить все
- [ ] **8.9.7** Rate limiting: 60 req/min per user
- [ ] **8.9.8** Swagger documentation

**Пример:**
```typescript
// api/src/notifications/notifications.controller.ts

@Controller('notifications')
@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findAll(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.notificationsService.delete(user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  async deleteAll(@CurrentUser() user: User) {
    return this.notificationsService.deleteAll(user.id);
  }
}
```

**Rate Limiting:**
```typescript
// Применить throttler guard
@UseGuards(ThrottlerGuard)
@Throttle(60, 60) // 60 requests per 60 seconds
```

**Acceptance Criteria:**
- ✅ Все endpoints работают
- ✅ Pagination корректная
- ✅ Rate limiting настроен
- ✅ Swagger документация полная
- ✅ Error handling корректный

---

### Task 8.10: Integration with Other Modules (День 9)

**Описание:** Интегрировать систему уведомлений с другими модулями.

**Подзадачи:**

- [ ] **8.10.1** Orders Module - уведомления о статусах заказов
- [ ] **8.10.2** Orders Module - уведомления о новых proposals
- [ ] **8.10.3** Chat Module - уведомления о новых сообщениях
- [ ] **8.10.4** Payments Module - уведомления о платежах
- [ ] **8.10.5** Reviews Module - уведомления о новых отзывах
- [ ] **8.10.6** Disputes Module - уведомления об открытых спорах
- [ ] **8.10.7** Users Module - уведомления о верификации
- [ ] **8.10.8** Auth Module - уведомления о security alerts (login, password change)

**Пример интеграции в Orders Module:**
```typescript
// api/src/orders/orders.service.ts

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService, // Inject
  ) {}

  async updateStatus(orderId: string, newStatus: OrderStatus, userId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { client: true, contractor: true },
    });

    // Отправить уведомление клиенту
    await this.notificationsService.create(
      order.clientId,
      NotificationType.ORDER_STATUS_CHANGED,
      {
        title: `Order #${order.id} status updated`,
        body: `Your order status has been updated to ${newStatus}`,
        priority: NotificationPriority.MEDIUM,
        actionUrl: `/orders/${order.id}`,
        metadata: {
          orderId: order.id,
          newStatus,
          oldStatus: order.status,
        },
      },
    );

    // Если есть contractor, уведомить его тоже
    if (order.contractorId) {
      await this.notificationsService.create(
        order.contractorId,
        NotificationType.ORDER_STATUS_CHANGED,
        {
          title: `Order #${order.id} status updated`,
          body: `Order status has been updated to ${newStatus}`,
          priority: NotificationPriority.MEDIUM,
          actionUrl: `/orders/${order.id}`,
          metadata: {
            orderId: order.id,
            newStatus,
          },
        },
      );
    }

    return order;
  }
}
```

**Acceptance Criteria:**
- ✅ Все модули отправляют уведомления
- ✅ Notifications создаются для нужных событий
- ✅ Metadata корректная
- ✅ ActionUrl ведет на правильные страницы

---

## 🔒 Безопасность

### Security Requirements

#### 1. Never Send Sensitive Data in Notifications

**Запрещено отправлять:**
- ❌ Полные номера кредитных карт
- ❌ Пароли или токены
- ❌ SIN numbers
- ❌ Полные адреса (только город/район)
- ❌ Личные данные третьих лиц

**Разрешено:**
- ✅ Последние 4 цифры карты (`****1234`)
- ✅ Замаскированный email (`u***@example.com`)
- ✅ Сумма платежа
- ✅ ID заказа
- ✅ Статус заказа

**Пример:**
```typescript
// ❌ ПЛОХО
{
  title: 'Payment received',
  body: `Payment of $50 from card 4242424242424242`
}

// ✅ ХОРОШО
{
  title: 'Payment received',
  body: `Payment of $50 from card ending in ****4242`
}
```

---

#### 2. Email Verification Before Sending

**Требования:**
- Отправлять email только на verified emails
- Проверять `user.emailVerified === true`
- Блокировать отправку на disposable emails

**Пример:**
```typescript
async sendEmail(userId: string, template: string, data: any) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  
  if (!user.emailVerified) {
    throw new BadRequestException('Email not verified');
  }
  
  // Проверка на disposable email
  if (await this.isDisposableEmail(user.email)) {
    throw new BadRequestException('Disposable emails not allowed');
  }
  
  await this.oneSignalService.sendEmail(user.email, template, data);
}
```

---

#### 3. Rate Limiting for Email Sending

**Лимиты:**
- **Per user:** 50 emails/day
- **Per IP:** 100 emails/day
- **Global:** 10,000 emails/hour (для защиты от DDoS)

**Реализация:**
```typescript
@Injectable()
export class EmailRateLimiter {
  constructor(private readonly redis: Redis) {}

  async checkLimit(userId: string): Promise<boolean> {
    const key = `email-limit:${userId}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 86400); // 24 hours
    }
    
    return count <= 50; // Max 50 emails per day
  }
}
```

---

#### 4. Unsubscribe Functionality

**Требования:**
- Каждый email должен содержать unsubscribe ссылку
- One-click unsubscribe (без дополнительных подтверждений)
- Unsubscribe применяется немедленно
- Security alerts **нельзя** отключить

**Пример:**
```html
<p style="font-size: 12px; color: #6c757d;">
  Don't want to receive these emails? 
  <a href="{{baseUrl}}/settings/notifications?unsubscribe={{token}}">
    Unsubscribe
  </a>
</p>
```

**Backend:**
```typescript
@Get('unsubscribe')
async unsubscribe(@Query('token') token: string) {
  // Verify token
  const payload = await this.jwtService.verifyAsync(token);
  const { userId, type } = payload;
  
  // Update preferences
  await this.prisma.notificationPreferences.update({
    where: { userId },
    data: {
      [`email${type}`]: false,
    },
  });
  
  return { message: 'Successfully unsubscribed' };
}
```

---

#### 5. Audit Logging for Notifications

**Логировать:**
- Все отправленные email (EmailLog table)
- Failed email attempts
- Push notification delivery
- User preference changes
- Unsubscribe events

**Пример:**
```typescript
await this.prisma.emailLog.create({
  data: {
    userId,
    email: user.email,
    subject: 'Order Status Updated',
    template: 'order-status-changed',
    status: 'sent',
    provider: 'onesignal',
    providerId: response.id,
  },
});
```

---

#### 6. Content Validation

**Валидация:**
- Escape HTML в notification body
- Sanitize actionUrl (только внутренние ссылки)
- Validate metadata (max 5KB)
- Block external links в email

**Пример:**
```typescript
import { sanitize } from 'class-sanitizer';

@IsString()
@MaxLength(2000)
@sanitize()
body: string;

@IsUrl({ protocols: ['https'], require_protocol: true })
@Matches(/^https:\/\/(www\.)?hummii\.ca\/.*$/, {
  message: 'Only internal links allowed',
})
actionUrl?: string;
```

---

## 🧪 Тестирование

### Unit Tests

**Файлы для тестирования:**
```typescript
// notifications.service.spec.ts
describe('NotificationsService', () => {
  it('should create notification', async () => {
    const notification = await service.create(userId, type, dto);
    expect(notification).toBeDefined();
    expect(notification.userId).toBe(userId);
  });

  it('should respect user preferences', async () => {
    // Disable email notifications
    await preferencesService.update(userId, { emailOrderUpdates: false });
    
    const notification = await service.create(userId, NotificationType.ORDER_STATUS_CHANGED, dto);
    
    expect(notification.channels).not.toContain(NotificationChannel.EMAIL);
  });

  it('should not disable security alerts', async () => {
    await expect(
      preferencesService.update(userId, { emailSecurity: false })
    ).rejects.toThrow('Security alerts cannot be disabled');
  });
});
```

### E2E Tests

**Тесты:**
- [ ] Создание уведомления через API
- [ ] Получение списка уведомлений с pagination
- [ ] Mark as read
- [ ] WebSocket connection и получение real-time уведомления
- [ ] Email отправка (mock OneSignal)
- [ ] Push отправка (mock OneSignal)
- [ ] Unsubscribe flow

**Пример:**
```typescript
// notifications.e2e-spec.ts
describe('Notifications E2E', () => {
  it('should send notification via WebSocket', async () => {
    const socket = io(`http://localhost:3000/notifications`, {
      auth: { token: jwtToken },
    });

    await new Promise<void>((resolve) => {
      socket.on('notification:new', (notification) => {
        expect(notification.type).toBe('ORDER_STATUS_CHANGED');
        resolve();
      });

      // Trigger notification
      ordersService.updateStatus(orderId, 'completed', userId);
    });

    socket.disconnect();
  });

  it('should respect rate limits', async () => {
    // Send 61 requests (limit is 60/min)
    for (let i = 0; i < 61; i++) {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${jwtToken}`);
      
      if (i < 60) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429); // Too Many Requests
      }
    }
  });
});
```

### Integration Tests

**Тесты:**
- [ ] OneSignal email integration (использовать sandbox)
- [ ] OneSignal push integration
- [ ] Bull queue processing
- [ ] Cron jobs (email digest, cleanup)
- [ ] Template rendering
- [ ] WebSocket authentication

---

## ✅ Критерии завершения

### Must-Have (Обязательно для завершения Phase 8)

- [ ] **Database:**
  - [ ] Prisma schema создана и migration применена
  - [ ] Индексы настроены для оптимизации

- [ ] **Core Features:**
  - [ ] NotificationsService реализован полностью
  - [ ] PreferencesService реализован
  - [ ] WebSocket gateway работает
  - [ ] OneSignal интегрирован (email + push)
  - [ ] Background jobs настроены

- [ ] **API:**
  - [ ] Все REST endpoints работают
  - [ ] Rate limiting настроен
  - [ ] Swagger документация полная

- [ ] **Templates:**
  - [ ] Все email шаблоны созданы
  - [ ] Template rendering работает
  - [ ] Unsubscribe ссылка в каждом email

- [ ] **Integration:**
  - [ ] Orders Module отправляет уведомления
  - [ ] Chat Module отправляет уведомления
  - [ ] Payments Module отправляет уведомления
  - [ ] Disputes Module отправляет уведомления

- [ ] **Security:**
  - [ ] Sensitive data никогда не отправляется
  - [ ] Email verification перед отправкой
  - [ ] Rate limiting для email
  - [ ] Unsubscribe работает
  - [ ] Audit logging настроено

- [ ] **Testing:**
  - [ ] Unit tests (coverage 80%+)
  - [ ] E2E tests для critical paths
  - [ ] WebSocket connection tests
  - [ ] Rate limiting tests

### Nice-to-Have (Опционально)

- [ ] SMS notifications (Twilio)
- [ ] In-app notification sound/vibration customization
- [ ] Rich notifications (images, actions)
- [ ] Notification grouping (multiple messages → 1 notification)
- [ ] Priority inbox (HIGH priority first)
- [ ] Notification snooze
- [ ] Advanced analytics (open rate, click rate)

---

## 📊 Прогресс

### Checklist

**День 1:**
- [ ] Task 8.1: Database Schema
- [ ] Task 8.2: Module Setup

**День 2-3:**
- [ ] Task 8.3: Notification Service
- [ ] Task 8.4: Preferences Management

**День 4:**
- [ ] Task 8.5: WebSocket Gateway

**День 5-6:**
- [ ] Task 8.6: OneSignal Integration
- [ ] Task 8.7: Templates

**День 7:**
- [ ] Task 8.8: Background Jobs

**День 8:**
- [ ] Task 8.9: REST API

**День 9:**
- [ ] Task 8.10: Integration with Modules

**День 10 (Buffer):**
- [ ] Testing
- [ ] Bug fixes
- [ ] Documentation

---

## 🔗 Связанные документы

- **[roadmap.md](./roadmap.md)** - Общий roadmap backend
- **[security-checklist.md](./security-checklist.md)** - Security requirements
- **[phase-4-chat-module.md](./phase-4-chat-module.md)** - Chat integration
- **[phase-6-payments-module.md](./phase-6-payments-module.md)** - Payment notifications
- **[phase-7-disputes-module.md](./phase-7-disputes-module.md)** - Dispute notifications

---

## 📝 Примечания

- **OneSignal Free Tier:** 10,000 subscribers, unlimited notifications
- **Email Deliverability:** Настроить SPF, DKIM, DMARC records для hummii.ca
- **Push Notifications:** Требуют HTTPS и Service Worker на frontend
- **Rate Limiting:** Может быть увеличен для premium пользователей
- **PIPEDA Compliance:** Unsubscribe обязателен, хранить email logs минимум 90 дней

---

**Последнее обновление:** 29 октября 2025  
**Статус:** Ready for Implementation  
**Следующий этап:** Phase 9 - Categories Module
