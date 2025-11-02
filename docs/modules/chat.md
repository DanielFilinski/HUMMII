Отличное решение! Это **значительно упрощает** реализацию чата и **усиливает защиту бизнес-модели**. Давайте пересмотрим рекомендации.

## 📝 **Обновленные рекомендации: Чат БЕЗ файлов и медиа**

### ✅ **Что ВКЛЮЧИТЬ (минималистичный подход):**

#### 1. **Только текстовые сообщения**
- ✅ Обычные текстовые сообщения в реальном времени
- ✅ До 2000 символов на сообщение (защита от спама)
- ✅ Read receipts (прочитано/доставлено)
- ✅ Временные метки
- ✅ Индикатор "печатает..."

#### 2. **Автоматическая модерация**
- ✅ **Блокировка телефонов** - автозамена на `***`
- ✅ **Блокировка email** - автозамена на `***`
- ✅ **Блокировка ссылок на мессенджеры** (Telegram, WhatsApp, Viber)
- ✅ **Блокировка соцсетей** (@instagram, @facebook, etc.)
- ✅ **Фильтр нецензурной лексики**

#### 3. **Безопасность**
- ✅ Кнопка "Пожаловаться" на сообщение
- ✅ Шифрование в транзите (HTTPS + WSS)
- ✅ Привязка к конкретному заказу
- ✅ Чат закрывается через N дней после завершения заказа (только просмотр истории)

#### 4. **История и удаление**
- ✅ **История хранится вечно** (до удаления аккаунта)
- ✅ **Нельзя удалить отдельные сообщения** (защита в спорах)
- ✅ **Можно редактировать** в течение 5 минут (с отметкой "изменено")
- ✅ **Экспорт переписки** (PIPEDA compliance) - скачать в PDF/TXT

---

### ❌ **Что ИСКЛЮЧИТЬ:**

- ❌ Отправка изображений
- ❌ Отправка PDF/документов
- ❌ Отправка видео
- ❌ Аудио сообщения
- ❌ Отправка файлов любого типа
- ❌ Стикеры/эмодзи-реакции (опционально, можно оставить базовые эмодзи)
- ❌ Гифки
- ❌ Геолокация

---

### 💡 **Преимущества такого подхода:**

#### **Технические:**
1. ✅ **Простота реализации** - только WebSocket + текст
2. ✅ **Нет хранилища файлов** - не нужен S3/Cloudinary
3. ✅ **Быстрая работа** - минимальный трафик
4. ✅ **Легкая модерация** - только текст, без AI для распознавания изображений
5. ✅ **Дешевле** - нет расходов на хранение медиа

#### **Бизнес:**
1. ✅ **Сильнее защита** - без файлов сложнее обменяться контактами (нет скриншотов визиток)
2. ✅ **Меньше злоупотреблений** - нельзя отправить фото с телефоном
3. ✅ **Фокус на платформе** - пользователи вынуждены использовать профили для портфолио
4. ✅ **Проще модерировать** - текст легче автоматически фильтровать

#### **UX:**
1. ✅ **Быстрее загружается**
2. ✅ **Меньше отвлекает** - чат для координации, а не для общения
3. ✅ **Четкая цель** - обсудить детали заказа и договориться о встрече

---

### 🎯 **Альтернативы для обмена медиа:**

Раз чат без файлов, нужны альтернативы для валидных кейсов:

#### **1. Портфолио исполнителя**
```
Клиент: "Покажите примеры ваших работ"
Исполнитель: "Все мои работы в профиле → [ссылка на портфолио]"
```
- В чате можно отправить **внутреннюю ссылку** на свой профиль/портфолио

#### **2. Детали заказа**
```
Клиент: "Вот фото того, что нужно отремонтировать"
```
- **Решение:** При создании заказа клиент может загрузить до 5 фото
- Исполнитель видит их в карточке заказа, не в чате

#### **3. Документы (договор, смета)**
```
Исполнитель: "Вот смета на работы"
```
- **Решение:** Встроенная функция "Создать смету" прямо на платформе
- Смета отображается в карточке заказа, обе стороны видят и подтверждают

---

### 📊 **Обновленная архитектура чата:**

```typescript
// Максимально простая схема
interface ChatMessage {
  id: string;
  chatId: string;
  orderId: string;
  
  senderId: string;
  recipientId: string;
  
  // Только текст
  content: string; // отмодерированный текст
  originalContent: string; // для админлогов
  
  // Модерация
  isModerated: boolean;
  moderationFlags?: ('phone' | 'email' | 'link' | 'profanity')[];
  
  // Статус
  status: 'sent' | 'delivered' | 'read';
  
  // Редактирование
  isEdited: boolean;
  editedAt?: Date;
  
  createdAt: Date;
}

interface Chat {
  id: string;
  orderId: string;
  clientId: string;
  contractorId: string;
  
  // Статус
  isActive: boolean; // можно писать?
  closedAt?: Date; // закрыт через N дней после завершения
  
  // Метаданные
  lastMessageAt: Date;
  unreadCount: { [userId: string]: number };
  
  createdAt: Date;
}
```

---

### 🚀 **Упрощенный стек для чата:**

#### **Что нужно:**
- ✅ Socket.io (WebSocket)
- ✅ PostgreSQL (хранение сообщений)
- ✅ Redis (кэш онлайн-статусов, typing indicators)
- ✅ Простая библиотека для модерации текста

#### **Что НЕ нужно:**
- ❌ AWS S3 / Cloudinary (хранилище)
- ❌ CDN для медиа
- ❌ Image optimization
- ❌ Virus scanning для файлов
- ❌ Резервирование места под файлы

---

### ⚡ **Предложение для текстового чата:**

#### **Допустимые элементы в сообщениях:**

```typescript
// Что разрешено
✅ Обычный текст
✅ Базовые эмодзи (😊 👍 ✅)
✅ Переносы строк
✅ Внутренние ссылки на профили (автоматические)

// Что автоматически модерируется
⚠️ Телефоны → ***
⚠️ Email → ***
⚠️ Внешние ссылки → [ссылка удалена]
⚠️ @социальныесети → ***

// Что запрещено
❌ Спам (повтор одного сообщения 3+ раза)
❌ Нецензурная лексика
❌ Угрозы/оскорбления
```

---

### 📋 **Финальная таблица функций:**

| Функция | Включить? | Причина |
|---------|-----------|---------|
| Текстовые сообщения | ✅ | Основная функция |
| Изображения | ❌ | **Не нужны** - портфолио в профиле |
| PDF/Документы | ❌ | **Не нужны** - смета на платформе |
| Файлы любого типа | ❌ | **Не нужны** |
| Базовые эмодзи | ✅ | UX, эмоции |
| Стикеры/GIF | ❌ | Отвлекают от бизнеса |
| Read receipts | ✅ | Прозрачность |
| Онлайн-статус | ✅ | UX |
| "Печатает..." | ✅ | UX |
| История вечно | ✅ | Защита в спорах |
| Удаление сообщений | ❌ | Защита в спорах |
| Редактирование (5 мин) | ✅ | Исправить опечатки |
| Экспорт переписки | ✅ | PIPEDA |
| Автомодерация | ✅ | **Критично** |
| Внутренние ссылки | ✅ | На профили/заказы |
| Внешние ссылки | ❌ | Блокируются |

---

### 🎯 **MVP реализация (минимум для запуска):**

```typescript
// 1. WebSocket events
socket.on('send_message', { orderId, content })
socket.on('message_sent', { message })
socket.on('message_read', { messageId })
socket.on('typing', { orderId, userId })

// 2. REST API для истории
GET /chats/:orderId/messages
POST /chats/:orderId/messages
PATCH /chats/:orderId/messages/:id (в течение 5 мин)
POST /chats/:orderId/export (скачать PDF)

// 3. Модерация (middleware)
function moderateMessage(text: string): {
  content: string;
  isModerated: boolean;
  flags: string[];
}
```

---

### ✨ **Дополнительные фишки для текстового чата:**

1. **Шаблоны сообщений** (быстрые ответы):
   ```
   Для исполнителей:
   - "Спасибо за заказ! Когда удобно встретиться?"
   - "Я готов приступить завтра. Подходит?"
   - "Уточните, пожалуйста, адрес"
   
   Для клиентов:
   - "Спасибо за отклик! Давайте обсудим детали"
   - "Когда вы сможете приехать на осмотр?"
   - "Заказ завершен, спасибо!"
   ```

2. **Системные сообщения**:
   ```
   📋 "Заказ создан"
   ✅ "Исполнитель принял заказ"
   💰 "Оплата получена"
   ⭐ "Клиент оставил отзыв"
   ```

3. **Умные уведомления**:
   - Если нет ответа 24 часа → напомнить
   - Если заказ скоро начнется → напоминание

---

**Итого:** Текстовый чат без медиа - это **оптимальное решение** для вашей платформы:
- ✅ Проще реализовать
- ✅ Дешевле поддерживать
- ✅ Сильнее защита бизнес-модели
- ✅ Фокус на координации, а не на общении
- ✅ Легче модерировать

Это правильный выбор! 🎯

---

## 🔐 **WebSocket Security**

### Authentication

**JWT Authentication for WebSocket Connections:**

```typescript
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to socket
      client.data.user = user;

      // Join user's personal room
      client.join(`user:${user.id}`);

      // Set online status
      await this.setOnlineStatus(user.id, true);

      this.logger.log(`Client connected: ${user.id}`);
    } catch (error) {
      this.logger.error('WebSocket auth failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      await this.setOnlineStatus(user.id, false);
      this.logger.log(`Client disconnected: ${user.id}`);
    }
  }
}
```

### Rate Limiting

**Prevent message spam:**

```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

@WebSocketGateway()
export class ChatGateway {
  private rateLimiter = new RateLimiterMemory({
    points: 20, // 20 messages
    duration: 60, // per 60 seconds
  });

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const user = client.data.user;

    try {
      // Check rate limit
      await this.rateLimiter.consume(user.id);
    } catch (error) {
      throw new WsException('Rate limit exceeded. Please slow down.');
    }

    // Process message
    return this.chatService.sendMessage({ ...data, senderId: user.id });
  }
}
```

### Authorization (Order Access)

**Ensure user can only access chats for their orders:**

```typescript
@SubscribeMessage('join_order_chat')
async handleJoinChat(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { orderId: string },
) {
  const user = client.data.user;
  
  // Check if user is part of this order
  const order = await this.ordersService.findOne(data.orderId);
  
  if (order.clientId !== user.id && order.contractorId !== user.id) {
    throw new WsException('You do not have access to this chat');
  }
  
  // Join order-specific room
  client.join(`order:${data.orderId}`);
  
  return { success: true };
}
```

---

## 🔄 **Reconnection Logic**

### Client-Side Reconnection

```typescript
// Frontend: Socket.io client with automatic reconnection
import { io, Socket } from 'socket.io-client';

class ChatService {
  private socket: Socket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  connect(accessToken: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL + '/chat', {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    // Handle connection
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.reconnectAttempts = 0;
      this.onReconnect();
    });

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to reconnect manually
        this.socket.connect();
      }
    });

    // Handle reconnection attempts
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      this.reconnectAttempts = attempt;
    });

    // Handle reconnection error
    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    // Handle reconnection failed
    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      this.showReconnectionError();
    });
  }

  private async onReconnect() {
    // Re-join active chats
    const activeOrderIds = this.getActiveOrderIds();
    
    for (const orderId of activeOrderIds) {
      this.socket.emit('join_order_chat', { orderId });
    }
    
    // Sync missed messages
    await this.syncMissedMessages();
  }

  private async syncMissedMessages() {
    // Fetch messages missed during offline period
    const lastMessageTimestamp = this.getLastMessageTimestamp();
    
    for (const orderId of this.getActiveOrderIds()) {
      const missedMessages = await api.get(`/chat/${orderId}/messages`, {
        params: { since: lastMessageTimestamp },
      });
      
      if (missedMessages.data.length > 0) {
        this.addMissedMessages(orderId, missedMessages.data);
        this.showNewMessagesNotification(missedMessages.data.length);
      }
    }
  }
}
```

### Server-Side Session Management

**Store connection state in Redis:**

```typescript
@Injectable()
export class ChatSessionService {
  constructor(@InjectRedis() private redis: Redis) {}

  /**
   * Track user's active socket connections
   */
  async addConnection(userId: string, socketId: string): Promise<void> {
    await this.redis.sadd(`user:${userId}:sockets`, socketId);
    await this.redis.expire(`user:${userId}:sockets`, 86400); // 24 hours
  }

  async removeConnection(userId: string, socketId: string): Promise<void> {
    await this.redis.srem(`user:${userId}:sockets`, socketId);
  }

  async getUserConnections(userId: string): Promise<string[]> {
    return this.redis.smembers(`user:${userId}:sockets`);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const connections = await this.getUserConnections(userId);
    return connections.length > 0;
  }

  /**
   * Store last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<void> {
    await this.redis.set(
      `user:${userId}:last_seen`,
      Date.now().toString(),
      'EX',
      86400,
    );
  }

  async getLastSeen(userId: string): Promise<number | null> {
    const lastSeen = await this.redis.get(`user:${userId}:last_seen`);
    return lastSeen ? parseInt(lastSeen) : null;
  }
}
```

### Message Queue for Offline Users

**Store messages for offline users:**

```typescript
@Injectable()
export class ChatService {
  async sendMessage(data: SendMessageDto): Promise<ChatMessage> {
    // Moderate message
    const moderated = this.moderationService.moderateMessage(data.content);
    
    // Save to database
    const message = await this.prisma.chatMessage.create({
      data: {
        orderId: data.orderId,
        senderId: data.senderId,
        recipientId: data.recipientId,
        content: moderated.content,
        originalContent: data.content,
        isModerated: moderated.isModerated,
        moderationFlags: moderated.flags,
      },
    });
    
    // Check if recipient is online
    const isOnline = await this.chatSessionService.isUserOnline(data.recipientId);
    
    if (isOnline) {
      // Send via WebSocket
      this.chatGateway.sendMessageToUser(data.recipientId, message);
    } else {
      // Queue for delivery when user comes online
      await this.queueOfflineMessage(data.recipientId, message);
      
      // Send push notification
      await this.notificationsQueue.add('send-push', {
        userId: data.recipientId,
        title: 'New message',
        message: `${message.senderName}: ${moderated.content.slice(0, 50)}...`,
      });
    }
    
    return message;
  }

  private async queueOfflineMessage(userId: string, message: ChatMessage): Promise<void> {
    await this.redis.lpush(`user:${userId}:offline_messages`, JSON.stringify(message));
    await this.redis.expire(`user:${userId}:offline_messages`, 86400 * 7); // 7 days
  }

  async getOfflineMessages(userId: string): Promise<ChatMessage[]> {
    const messages = await this.redis.lrange(`user:${userId}:offline_messages`, 0, -1);
    await this.redis.del(`user:${userId}:offline_messages`);
    
    return messages.map((m) => JSON.parse(m));
  }
}
```

### Handling Multiple Device Connections

**Support user connected from multiple devices:**

```typescript
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage({
      ...data,
      senderId: client.data.user.id,
    });

    // Emit to sender's OTHER devices (sync across devices)
    const senderConnections = await this.chatSessionService.getUserConnections(client.data.user.id);
    
    for (const socketId of senderConnections) {
      if (socketId !== client.id) {
        this.server.to(socketId).emit('message_sent', message);
      }
    }

    // Emit to recipient's ALL devices
    const recipientConnections = await this.chatSessionService.getUserConnections(data.recipientId);
    
    for (const socketId of recipientConnections) {
      this.server.to(socketId).emit('new_message', message);
    }

    return message;
  }
}
```

---

## 📱 **Handling Network Changes (Mobile)**

### Detect Network Status

```typescript
// Frontend: Detect network status changes
class ChatService {
  private isOnline = true;

  constructor() {
    // Listen to network status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline() {
    console.log('Network back online');
    this.isOnline = true;
    
    // Reconnect socket
    if (!this.socket.connected) {
      this.socket.connect();
    }
    
    // Sync pending messages
    this.syncPendingMessages();
  }

  private handleOffline() {
    console.log('Network offline');
    this.isOnline = false;
    
    // Show offline indicator
    this.showOfflineIndicator();
  }

  private async syncPendingMessages() {
    // Send messages that were queued while offline
    const pendingMessages = this.getPendingMessages();
    
    for (const message of pendingMessages) {
      try {
        await this.sendMessage(message);
        this.removePendingMessage(message.id);
      } catch (error) {
        console.error('Failed to send pending message:', error);
      }
    }
  }
}
```

### Optimistic UI Updates

```typescript
// Show message immediately, then confirm
async sendMessage(content: string, orderId: string) {
  const tempMessage = {
    id: `temp-${Date.now()}`,
    content,
    orderId,
    senderId: currentUserId,
    createdAt: new Date(),
    status: 'sending',
  };
  
  // Add to UI immediately
  this.addMessageToUI(tempMessage);
  
  try {
    // Send to server
    const confirmedMessage = await this.chatService.sendMessage({ content, orderId });
    
    // Replace temp message with confirmed
    this.replaceMessage(tempMessage.id, confirmedMessage);
  } catch (error) {
    // Mark as failed
    this.markMessageAsFailed(tempMessage.id);
    
    // Allow retry
    this.showRetryButton(tempMessage.id);
  }
}
```

---

## 🔔 **Unread Message Count**

### Track Unread Messages

```typescript
@Injectable()
export class ChatService {
  async incrementUnreadCount(orderId: string, userId: string): Promise<void> {
    await this.prisma.chat.update({
      where: { orderId },
      data: {
        unreadCount: {
          increment: { [userId]: 1 },
        },
      },
    });
    
    // Update user's total unread count in Redis
    await this.redis.incr(`user:${userId}:unread_total`);
    
    // Emit unread count update
    this.chatGateway.emitUnreadCountUpdate(userId);
  }

  async markAsRead(orderId: string, userId: string): Promise<void> {
    const chat = await this.prisma.chat.findUnique({ where: { orderId } });
    const currentUnread = chat.unreadCount[userId] || 0;
    
    await this.prisma.chat.update({
      where: { orderId },
      data: {
        unreadCount: {
          set: { ...chat.unreadCount, [userId]: 0 },
        },
      },
    });
    
    // Update Redis
    await this.redis.decrby(`user:${userId}:unread_total`, currentUnread);
    
    // Mark messages as read
    await this.prisma.chatMessage.updateMany({
      where: {
        orderId,
        recipientId: userId,
        status: { in: ['sent', 'delivered'] },
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });
    
    // Emit read receipt
    this.chatGateway.emitReadReceipt(orderId, userId);
  }
}
```

---

**Last updated:** November 2, 2025  
**Status:** Complete with WebSocket security and reconnection logic  
**Priority:** HIGH