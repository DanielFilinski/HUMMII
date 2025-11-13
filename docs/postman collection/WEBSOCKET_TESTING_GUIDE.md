# 🔌 WebSocket Testing Guide

**Дата:** 13 ноября 2025  
**Версия:** 1.0  
**API Версия:** v1

---

## 📋 Содержание

1. [Обзор](#обзор)
2. [WebSocket Endpoints](#websocket-endpoints)
3. [Методы Тестирования](#методы-тестирования)
4. [Postman WebSocket](#postman-websocket)
5. [Browser Console](#browser-console)
6. [Командная Строка (wscat)](#командная-строка-wscat)
7. [Автоматизированные Тесты](#автоматизированные-тесты)
8. [Тестовые Сценарии](#тестовые-сценарии)
9. [Troubleshooting](#troubleshooting)

---

## Обзор

### Что такое WebSocket в Hummii?

Hummii API использует **Socket.IO** для real-time коммуникации:

- 💬 **Chat** - Мгновенные сообщения между клиентами и подрядчиками
- 🔔 **Notifications** - Real-time уведомления о событиях системы

### Технологии

- **Socket.IO v4.5+** - WebSocket библиотека
- **NestJS WebSocket Gateway** - Server-side
- **JWT Authentication** - Защита соединений
- **Rate Limiting** - Защита от спама
- **Redis Adapter** - Горизонтальное масштабирование

---

## WebSocket Endpoints

### 💬 Chat WebSocket

**URL:** `ws://localhost:3000/chat`  
**Namespace:** `/chat`  
**Transport:** WebSocket (fallback to polling)

#### Аутентификация

```javascript
// Вариант 1: Query параметр
ws://localhost:3000/chat?token=YOUR_JWT_TOKEN

// Вариант 2: Auth при подключении
io('http://localhost:3000/chat', {
  auth: { token: 'YOUR_JWT_TOKEN' }
})
```

#### События: Client → Server

| Event | Payload | Описание |
|-------|---------|----------|
| `join_order_chat` | `{ orderId: string }` | Присоединиться к чату заказа |
| `send_message` | `{ orderId: string, content: string, type: 'TEXT'\|'IMAGE'\|'FILE' }` | Отправить сообщение |
| `typing` | `{ orderId: string }` | Начать печатать |
| `stop_typing` | `{ orderId: string }` | Перестать печатать |
| `mark_as_read` | `{ orderId: string, messageIds: string[] }` | Отметить как прочитанное |
| `edit_message` | `{ messageId: string, content: string }` | Редактировать сообщение |

#### События: Server → Client

| Event | Payload | Описание |
|-------|---------|----------|
| `message_sent` | `Message` | Подтверждение отправки |
| `new_message` | `Message` | Новое сообщение |
| `user_typing` | `{ orderId, user }` | Пользователь печатает |
| `user_stopped_typing` | `{ orderId, userId }` | Перестал печатать |
| `messages_read` | `{ messageIds, reader, readAt }` | Сообщения прочитаны |
| `message_edited` | `{ id, content, editedAt }` | Сообщение отредактировано |
| `user_online` | `{ userId, orderId }` | Пользователь в сети |
| `user_offline` | `{ userId, orderId }` | Пользователь оффлайн |
| `error` | `{ message, code }` | Ошибка |

#### Лимиты

- **Rate Limit:** 20 сообщений/минута
- **Edit Window:** 15 минут
- **Max Content Length:** 10,000 символов

---

### 🔔 Notifications WebSocket

**URL:** `ws://localhost:3000/notifications`  
**Namespace:** `/notifications`  
**Transport:** WebSocket (fallback to polling)

#### Аутентификация

```javascript
// Query параметр
ws://localhost:3000/notifications?token=YOUR_JWT_TOKEN

// Auth при подключении
io('http://localhost:3000/notifications', {
  auth: { token: 'YOUR_JWT_TOKEN' }
})
```

#### События: Client → Server

| Event | Payload | Описание |
|-------|---------|----------|
| `notification:mark-read` | `{ notificationId: string }` | Отметить уведомление как прочитанное |

#### События: Server → Client

| Event | Payload | Описание |
|-------|---------|----------|
| `notification:new` | `Notification` | Новое уведомление |
| `notification:unread-count` | `{ count: number }` | Количество непрочитанных |
| `notification:marked-read` | `{ notificationId, readAt }` | Отмечено как прочитанное |
| `error` | `{ message, code }` | Ошибка |

#### Типы Уведомлений

- `ORDER_STATUS_CHANGED` - Статус заказа изменен
- `NEW_PROPOSAL` - Новое предложение
- `PROPOSAL_ACCEPTED` - Предложение принято
- `PROPOSAL_REJECTED` - Предложение отклонено
- `NEW_MESSAGE` - Новое сообщение
- `REVIEW_RECEIVED` - Получен отзыв
- `DISPUTE_CREATED` - Создан спор
- `DISPUTE_RESOLVED` - Спор решен
- `PAYMENT_RECEIVED` - Платеж получен
- `SUBSCRIPTION_EXPIRING` - Подписка истекает
- `SUBSCRIPTION_EXPIRED` - Подписка истекла

#### Лимиты

- **Rate Limit:** 100 событий/минута

---

## Методы Тестирования

### Сравнение Методов

| Метод | Сложность | Удобство | Автоматизация | Рекомендация |
|-------|-----------|----------|---------------|--------------|
| **Postman Desktop** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Для ручного тестирования |
| **Browser Console** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | Для разработки |
| **wscat CLI** | ⭐ | ⭐⭐ | ⭐⭐⭐ | Для быстрых тестов |
| **Jest Tests** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Для CI/CD |

---

## Postman WebSocket

### Требования

- **Postman Desktop** v10.18 или новее
- WebSocket поддержка (не работает в Web версии)

### Шаг 1: Импорт Коллекции

```bash
1. Откройте Postman Desktop
2. File → Import
3. Выберите: Hummii-WebSocket.postman_collection.json
4. Импортируйте также: Hummii-API-Environment.postman_environment.json
5. Выберите Environment: "Hummii API - Local"
```

### Шаг 2: Получение JWT Token

Сначала получите токен через HTTP endpoints:

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Токен автоматически сохранится в `{{access_token}}`.

### Шаг 3: Подключение к WebSocket

#### Chat WebSocket

```
1. Откройте "Connect to Chat" request
2. URL: ws://localhost:3000/chat?token={{access_token}}
3. Нажмите "Connect"
4. Дождитесь "Connected" статуса
```

#### Notifications WebSocket

```
1. Откройте "Connect to Notifications" request
2. URL: ws://localhost:3000/notifications?token={{access_token}}
3. Нажмите "Connect"
4. Дождитесь "Connected" статуса
```

### Шаг 4: Отправка Событий

В Postman WebSocket request вы отправляете JSON:

#### Пример: Отправка Сообщения

```json
{
  "event": "send_message",
  "data": {
    "orderId": "your-order-uuid-here",
    "content": "Hello from Postman!",
    "type": "TEXT"
  }
}
```

#### Пример: Начать Печатать

```json
{
  "event": "typing",
  "data": {
    "orderId": "your-order-uuid-here"
  }
}
```

### Шаг 5: Получение Событий

Все входящие события отображаются в панели "Messages":

```json
{
  "event": "message_sent",
  "data": {
    "id": "msg-uuid",
    "orderId": "order-uuid",
    "content": "Hello from Postman!",
    "createdAt": "2025-11-13T12:00:00Z"
  }
}
```

### Советы по Postman WebSocket

✅ **DO:**
- Держите соединение открытым для получения событий
- Используйте переменные для ID (`{{order_id}}`)
- Проверяйте Console для ошибок

❌ **DON'T:**
- Не закрывайте соединение между событиями
- Не отправляйте слишком много сообщений (rate limit)
- Не забывайте обновлять токен если он expired

---

## Browser Console

### Преимущества

- ✅ Полный контроль над Socket.IO
- ✅ Легко отлаживать
- ✅ Можно использовать вместе с фронтендом
- ✅ Видно все события в консоли

### Шаг 1: Подключение Socket.IO Client

Откройте браузер и вставьте в консоль (F12):

```html
<!-- Загрузить Socket.IO библиотеку -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

Или через CDN в консоли:

```javascript
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
document.head.appendChild(script);
```

### Шаг 2: Подключение к Chat

```javascript
// Ваш JWT токен
const token = 'YOUR_JWT_TOKEN_HERE';

// Подключение
const chatSocket = io('http://localhost:3000/chat', {
  auth: { token },
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// События подключения
chatSocket.on('connect', () => {
  console.log('✅ Connected to chat:', chatSocket.id);
});

chatSocket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

chatSocket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Обработка сообщений
chatSocket.on('message_sent', (data) => {
  console.log('📤 Message sent:', data);
});

chatSocket.on('new_message', (data) => {
  console.log('📥 New message:', data);
});

chatSocket.on('user_typing', (data) => {
  console.log('⌨️ User typing:', data.user);
});

chatSocket.on('user_stopped_typing', (data) => {
  console.log('⌨️ User stopped typing:', data.userId);
});

chatSocket.on('messages_read', (data) => {
  console.log('✅ Messages read by:', data.reader);
});

chatSocket.on('error', (error) => {
  console.error('❌ Error:', error);
});
```

### Шаг 3: Отправка Событий

```javascript
// Присоединиться к чату заказа
chatSocket.emit('join_order_chat', {
  orderId: 'your-order-uuid'
});

// Отправить сообщение
chatSocket.emit('send_message', {
  orderId: 'your-order-uuid',
  content: 'Hello from browser!',
  type: 'TEXT'
});

// Начать печатать
chatSocket.emit('typing', {
  orderId: 'your-order-uuid'
});

// Остановить печатать
chatSocket.emit('stop_typing', {
  orderId: 'your-order-uuid'
});

// Отметить как прочитанное
chatSocket.emit('mark_as_read', {
  orderId: 'your-order-uuid',
  messageIds: ['msg-id-1', 'msg-id-2']
});

// Редактировать сообщение
chatSocket.emit('edit_message', {
  messageId: 'msg-uuid',
  content: 'Updated content'
});
```

### Шаг 4: Подключение к Notifications

```javascript
const notificationSocket = io('http://localhost:3000/notifications', {
  auth: { token },
  transports: ['websocket']
});

notificationSocket.on('connect', () => {
  console.log('✅ Connected to notifications:', notificationSocket.id);
});

// Автоматически получаете уведомления
notificationSocket.on('notification:new', (notification) => {
  console.log('🔔 New notification:', notification);
  
  // Показать notification в браузере
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/notification-icon.png'
    });
  }
});

notificationSocket.on('notification:unread-count', (data) => {
  console.log('🔢 Unread count:', data.count);
  // Обновить badge в UI
});

// Отметить как прочитанное
notificationSocket.emit('notification:mark-read', {
  notificationId: 'notif-uuid'
});
```

### Полезные Команды

```javascript
// Проверить статус подключения
console.log('Chat connected:', chatSocket.connected);
console.log('Notifications connected:', notificationSocket.connected);

// Переподключиться
chatSocket.connect();

// Отключиться
chatSocket.disconnect();

// Посмотреть все слушатели событий
console.log(chatSocket.eventNames());

// Удалить все слушатели
chatSocket.removeAllListeners();
```

---

## Командная Строка (wscat)

### Установка

```bash
npm install -g wscat
```

### Подключение к Chat

```bash
wscat -c "ws://localhost:3000/chat?token=YOUR_JWT_TOKEN"
```

### Отправка События

После подключения, отправьте JSON (одна строка):

```json
{"event":"join_order_chat","data":{"orderId":"order-uuid"}}
```

```json
{"event":"send_message","data":{"orderId":"order-uuid","content":"Hello!","type":"TEXT"}}
```

```json
{"event":"typing","data":{"orderId":"order-uuid"}}
```

### Советы

- Используйте `jq` для форматирования: `wscat ... | jq`
- Ctrl+C для выхода
- Каждое событие на новой строке

---

## Автоматизированные Тесты

### Jest + Socket.IO Client

Создайте тестовый файл:

```typescript
// filepath: api/test/websocket/chat.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../src/app.module';

describe('Chat WebSocket (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3001); // Тестовый порт

    // Получить токен через API
    const authResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const authData = await authResponse.json();
    token = authData.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    socket = io('http://localhost:3001/chat', {
      auth: { token },
      transports: ['websocket']
    });
  });

  afterEach(() => {
    socket.disconnect();
  });

  it('should connect successfully', (done) => {
    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });
  });

  it('should join order chat', (done) => {
    socket.on('connect', () => {
      socket.emit('join_order_chat', {
        orderId: 'test-order-id'
      });

      socket.on('joined', (data) => {
        expect(data.room).toContain('order:');
        done();
      });
    });
  });

  it('should send message', (done) => {
    const testMessage = 'Test message ' + Date.now();
    
    socket.on('connect', () => {
      socket.emit('send_message', {
        orderId: 'test-order-id',
        content: testMessage,
        type: 'TEXT'
      });

      socket.on('message_sent', (data) => {
        expect(data.content).toBe(testMessage);
        expect(data.type).toBe('TEXT');
        done();
      });
    });
  });

  it('should emit typing indicator', (done) => {
    socket.on('connect', () => {
      socket.emit('typing', {
        orderId: 'test-order-id'
      });

      socket.on('user_typing', (data) => {
        expect(data.orderId).toBe('test-order-id');
        done();
      });
    });
  });

  it('should mark messages as read', (done) => {
    const messageIds = ['msg-1', 'msg-2'];

    socket.on('connect', () => {
      socket.emit('mark_as_read', {
        orderId: 'test-order-id',
        messageIds
      });

      socket.on('messages_read', (data) => {
        expect(data.messageIds).toEqual(messageIds);
        done();
      });
    });
  });

  it('should handle rate limiting', (done) => {
    socket.on('connect', () => {
      // Отправить 25 сообщений (лимит 20/мин)
      for (let i = 0; i < 25; i++) {
        socket.emit('send_message', {
          orderId: 'test-order-id',
          content: `Message ${i}`,
          type: 'TEXT'
        });
      }

      socket.on('error', (error) => {
        expect(error.code).toBe(429);
        expect(error.message).toContain('rate limit');
        done();
      });
    });
  });

  it('should reject unauthorized connection', (done) => {
    const unauthorizedSocket = io('http://localhost:3001/chat', {
      auth: { token: 'invalid-token' },
      transports: ['websocket']
    });

    unauthorizedSocket.on('connect_error', (error) => {
      expect(error.message).toContain('Unauthorized');
      unauthorizedSocket.disconnect();
      done();
    });
  });
});
```

### Запуск Тестов

```bash
# Один файл
npm test -- test/websocket/chat.e2e-spec.ts

# Все WebSocket тесты
npm test -- test/websocket/

# С coverage
npm test -- --coverage test/websocket/
```

---

## Тестовые Сценарии

### Сценарий 1: Полный Chat Flow (Один Пользователь)

#### Цель
Протестировать основные функции чата от имени одного пользователя.

#### Шаги

**1. Подключение**
```javascript
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'YOUR_TOKEN' }
});

socket.on('connect', () => {
  console.log('✅ Step 1: Connected');
});
```

**2. Присоединиться к чату**
```javascript
socket.emit('join_order_chat', {
  orderId: 'test-order-uuid'
});

socket.on('joined', (data) => {
  console.log('✅ Step 2: Joined room:', data.room);
});
```

**3. Начать печатать**
```javascript
socket.emit('typing', {
  orderId: 'test-order-uuid'
});
console.log('✅ Step 3: Typing indicator sent');
```

**4. Отправить сообщение**
```javascript
socket.emit('send_message', {
  orderId: 'test-order-uuid',
  content: 'Hello! Testing complete flow.',
  type: 'TEXT'
});

socket.on('message_sent', (data) => {
  console.log('✅ Step 4: Message sent:', data.id);
});
```

**5. Остановить печатать (авто)**
```javascript
socket.emit('stop_typing', {
  orderId: 'test-order-uuid'
});
console.log('✅ Step 5: Stopped typing');
```

#### Ожидаемые Результаты

- ✅ Подключение успешно
- ✅ Присоединился к комнате
- ✅ Typing indicator отправлен
- ✅ Сообщение отправлено и получено подтверждение
- ✅ Нет ошибок

---

### Сценарий 2: Два Пользователя Общаются

#### Цель
Протестировать real-time коммуникацию между двумя пользователями.

#### Настройка

Откройте две консоли браузера или два Postman окна:

**Пользователь A (Клиент):**
```javascript
const tokenA = 'CLIENT_JWT_TOKEN';
const socketA = io('http://localhost:3000/chat', {
  auth: { token: tokenA }
});
```

**Пользователь B (Подрядчик):**
```javascript
const tokenB = 'CONTRACTOR_JWT_TOKEN';
const socketB = io('http://localhost:3000/chat', {
  auth: { token: tokenB }
});
```

#### Шаги

**1. Оба присоединяются к одному заказу**
```javascript
// User A
socketA.emit('join_order_chat', { orderId: 'same-order-uuid' });

// User B
socketB.emit('join_order_chat', { orderId: 'same-order-uuid' });
```

**2. User A начинает печатать**
```javascript
// User A
socketA.emit('typing', { orderId: 'same-order-uuid' });

// User B должен получить
socketB.on('user_typing', (data) => {
  console.log('✅ User B sees: User A is typing');
});
```

**3. User A отправляет сообщение**
```javascript
// User A
socketA.emit('send_message', {
  orderId: 'same-order-uuid',
  content: 'Hi! How is the project going?',
  type: 'TEXT'
});

// User A получает подтверждение
socketA.on('message_sent', (data) => {
  console.log('✅ User A: Message sent:', data.id);
});

// User B получает сообщение
socketB.on('new_message', (data) => {
  console.log('✅ User B: New message received:', data.content);
});
```

**4. User B отмечает как прочитанное**
```javascript
// User B
socketB.emit('mark_as_read', {
  orderId: 'same-order-uuid',
  messageIds: [messageId]
});

// User A видит что прочитали
socketA.on('messages_read', (data) => {
  console.log('✅ User A: Message read by:', data.reader.name);
});
```

**5. User B отвечает**
```javascript
// User B
socketB.emit('send_message', {
  orderId: 'same-order-uuid',
  content: 'Great! Almost done with the design.',
  type: 'TEXT'
});

// User A получает ответ
socketA.on('new_message', (data) => {
  console.log('✅ User A: Received reply:', data.content);
});
```

#### Ожидаемые Результаты

- ✅ Оба пользователя подключены
- ✅ Оба в одной комнате
- ✅ Typing indicators видны другому пользователю
- ✅ Сообщения доставляются в реальном времени
- ✅ Read receipts работают
- ✅ Двусторонняя коммуникация

---

### Сценарий 3: Real-time Notifications

#### Цель
Протестировать систему уведомлений.

#### Шаги

**1. Подключиться к Notifications**
```javascript
const socket = io('http://localhost:3000/notifications', {
  auth: { token: 'YOUR_TOKEN' }
});

socket.on('connect', () => {
  console.log('✅ Step 1: Connected to notifications');
});

socket.on('notification:unread-count', (data) => {
  console.log('✅ Initial unread count:', data.count);
});
```

**2. Триггер уведомления**

В другой вкладке, создайте действие которое генерирует уведомление:

```http
# Пример: Изменить статус заказа
PATCH http://localhost:3000/api/v1/orders/:id/status
Authorization: Bearer CONTRACTOR_TOKEN
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**3. Получить уведомление в реальном времени**
```javascript
socket.on('notification:new', (notification) => {
  console.log('✅ Step 2: New notification received:', notification);
  console.log('   Type:', notification.type);
  console.log('   Title:', notification.title);
  console.log('   Message:', notification.message);
});

socket.on('notification:unread-count', (data) => {
  console.log('✅ Updated unread count:', data.count);
});
```

**4. Отметить как прочитанное**
```javascript
socket.emit('notification:mark-read', {
  notificationId: notification.id
});

socket.on('notification:marked-read', (data) => {
  console.log('✅ Step 3: Marked as read:', data.notificationId);
});

socket.on('notification:unread-count', (data) => {
  console.log('✅ Updated count after read:', data.count);
});
```

#### Ожидаемые Результаты

- ✅ Подключение успешно
- ✅ Получен начальный unread count
- ✅ Уведомление доставлено мгновенно (<200ms)
- ✅ Unread count обновился (+1)
- ✅ Mark as read сработал
- ✅ Unread count обновился (-1)

---

### Сценарий 4: Обработка Ошибок

#### Цель
Протестировать обработку ошибок и граничные случаи.

#### Тесты

**1. Невалидный токен**
```javascript
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'invalid-token' }
});

socket.on('connect_error', (error) => {
  console.log('✅ Test 1: Rejected invalid token:', error.message);
  // Expected: "Unauthorized"
});
```

**2. Expired токен**
```javascript
const expiredToken = 'EXPIRED_JWT_TOKEN';
const socket = io('http://localhost:3000/chat', {
  auth: { token: expiredToken }
});

socket.on('connect_error', (error) => {
  console.log('✅ Test 2: Rejected expired token:', error.message);
});
```

**3. Rate limiting**
```javascript
socket.on('connect', () => {
  // Отправить 25 сообщений (лимит 20/мин)
  for (let i = 0; i < 25; i++) {
    socket.emit('send_message', {
      orderId: 'test-order',
      content: `Message ${i}`,
      type: 'TEXT'
    });
  }
});

socket.on('error', (error) => {
  console.log('✅ Test 3: Rate limit triggered:', error);
  // Expected: 429 Too Many Requests
});
```

**4. Невалидный orderId**
```javascript
socket.emit('join_order_chat', {
  orderId: 'non-existent-order'
});

socket.on('error', (error) => {
  console.log('✅ Test 4: Invalid order rejected:', error);
  // Expected: 404 Not Found
});
```

**5. Нет доступа к заказу**
```javascript
socket.emit('join_order_chat', {
  orderId: 'someone-elses-order'
});

socket.on('error', (error) => {
  console.log('✅ Test 5: Unauthorized access blocked:', error);
  // Expected: 403 Forbidden
});
```

---

## Troubleshooting

### Проблема: Cannot Connect

**Симптомы:**
- `connect_error` события
- `Connection refused`
- Timeout при подключении

**Решения:**

```bash
# 1. Проверьте что API запущен
curl http://localhost:3000/api/v1/health

# 2. Проверьте WebSocket endpoint
wscat -c ws://localhost:3000/chat

# 3. Проверьте логи API
docker compose logs api

# 4. Проверьте CORS настройки
# filepath: api/src/chat/chat.gateway.ts
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }
})
```

---

### Проблема: Unauthorized (401)

**Симптомы:**
- `connect_error: Unauthorized`
- Connection rejected immediately

**Решения:**

```javascript
// 1. Проверьте токен
console.log('Token:', token);

// 2. Проверьте срок действия
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));

// 3. Получите новый токен
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: '...', password: '...' })
});
const { access_token } = await response.json();

// 4. Используйте новый токен
const socket = io('http://localhost:3000/chat', {
  auth: { token: access_token }
});
```

---

### Проблема: Events Not Received

**Симптомы:**
- Подключение успешно, но события не приходят
- `emit` работает, но `on` не срабатывает

**Решения:**

```javascript
// 1. Проверьте что вы подписаны на события
socket.on('connect', () => {
  console.log('Connected');
  
  // 2. Проверьте все слушатели
  console.log('Listeners:', socket.eventNames());
});

// 3. Убедитесь что название события правильное
socket.on('new_message', (data) => {  // ✅ Правильно
  console.log(data);
});

socket.on('newMessage', (data) => {  // ❌ Неправильно (camelCase)
  console.log(data);
});

// 4. Проверьте что вы в правильной комнате
socket.emit('join_order_chat', { orderId: 'order-uuid' });

// 5. Логируйте ВСЕ события
socket.onAny((eventName, ...args) => {
  console.log('Event:', eventName, args);
});
```

---

### Проблема: Rate Limiting

**Симптомы:**
- `429 Too Many Requests`
- События перестают обрабатываться

**Решения:**

```javascript
// 1. Уменьшите частоту отправки
// ❌ Плохо
socket.emit('typing', { orderId });  // Каждый keystroke

// ✅ Хорошо
let typingTimeout;
function handleTyping() {
  clearTimeout(typingTimeout);
  socket.emit('typing', { orderId });
  
  typingTimeout = setTimeout(() => {
    socket.emit('stop_typing', { orderId });
  }, 3000);
}

// 2. Debounce отправку
import { debounce } from 'lodash';
const sendTyping = debounce(() => {
  socket.emit('typing', { orderId });
}, 500);

// 3. Проверяйте лимиты
const RATE_LIMIT = {
  chat: 20,     // 20 msg/min
  notifications: 100  // 100 events/min
};
```

---

### Проблема: Disconnects Frequently

**Симптомы:**
- Частые `disconnect` события
- Нестабильное соединение

**Решения:**

```javascript
// 1. Включите reconnection
const socket = io('http://localhost:3000/chat', {
  auth: { token },
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10
});

// 2. Обработайте reconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Сервер отключил (unauthorized, rate limit, etc.)
    // Не пытайтесь переподключиться автоматически
  } else {
    // Сетевая проблема - Socket.IO переподключится автоматически
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  
  // Восстановите состояние
  socket.emit('join_order_chat', { orderId: lastOrderId });
});

// 3. Heartbeat для поддержания соединения
setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
  }
}, 25000);  // Каждые 25 секунд
```

---

### Проблема: Messages Not Delivered

**Симптомы:**
- `emit` не вызывает ответа
- Другие пользователи не получают сообщения

**Решения:**

```javascript
// 1. Проверьте что вы в комнате
socket.emit('join_order_chat', { orderId });

socket.on('joined', (data) => {
  console.log('✅ Joined room:', data.room);
  
  // ТЕПЕРЬ можно отправлять
  socket.emit('send_message', {
    orderId,
    content: 'Hello',
    type: 'TEXT'
  });
});

// 2. Проверьте payload
socket.emit('send_message', {
  orderId: 'uuid',           // ✅ Обязательно
  content: 'Message',        // ✅ Обязательно
  type: 'TEXT'               // ✅ Обязательно (TEXT|IMAGE|FILE)
});

// 3. Проверьте ошибки
socket.on('error', (error) => {
  console.error('Error:', error);
  // Может быть: invalid payload, unauthorized, rate limit
});

// 4. Используйте acknowledgments
socket.emit('send_message', payload, (response) => {
  if (response.error) {
    console.error('Failed to send:', response.error);
  } else {
    console.log('Sent successfully:', response.messageId);
  }
});
```

---

## Чек-лист Тестирования

### Chat WebSocket

#### Подключение
- [ ] Подключение с валидным токеном успешно
- [ ] Подключение с невалидным токеном отклоняется (401)
- [ ] Подключение с expired токеном отклоняется (401)
- [ ] Reconnection работает после разрыва
- [ ] Disconnect обрабатывается корректно

#### Присоединение к Комнатам
- [ ] Join order chat с валидным orderId
- [ ] Join отклоняется если нет доступа к заказу (403)
- [ ] Join отклоняется если заказ не существует (404)
- [ ] Пользователь получает список участников
- [ ] Пользователь может покинуть комнату

#### Отправка Сообщений
- [ ] Отправка текстового сообщения
- [ ] Отправка изображения (IMAGE)
- [ ] Отправка файла (FILE)
- [ ] Получение подтверждения (message_sent)
- [ ] Другие участники получают сообщение (new_message)
- [ ] Content moderation работает
- [ ] Rate limiting (20 msg/min)

#### Typing Indicators
- [ ] Отправка typing
- [ ] Отправка stop_typing
- [ ] Другие пользователи видят индикатор
- [ ] Auto-stop после таймаута

#### Read Receipts
- [ ] Mark as read одного сообщения
- [ ] Mark as read нескольких сообщений
- [ ] Отправитель получает уведомление (messages_read)
- [ ] Unread count обновляется

#### Редактирование
- [ ] Edit message в течение 15 минут
- [ ] Edit отклоняется после 15 минут
- [ ] Нельзя редактировать чужие сообщения
- [ ] History сохраняется

#### Обработка Ошибок
- [ ] Invalid payload возвращает ошибку
- [ ] Rate limit возвращает 429
- [ ] Unauthorized actions возвращают 403
- [ ] Not found возвращает 404

---

### Notifications WebSocket

#### Подключение
- [ ] Подключение с валидным токеном
- [ ] Подключение с невалидным токеном отклоняется
- [ ] Auto-subscription при подключении
- [ ] Получение initial unread count
- [ ] Reconnection работает

#### Получение Уведомлений
- [ ] New notification доставляется в реальном времени
- [ ] Все типы уведомлений работают
- [ ] Unread count обновляется при новом уведомлении
- [ ] Уведомления содержат правильные данные

#### Mark as Read
- [ ] Mark as read работает
- [ ] Unread count уменьшается
- [ ] Подтверждение получено (notification:marked-read)

#### Performance
- [ ] Уведомления доставляются < 200ms
- [ ] Rate limiting (100 events/min)
- [ ] Нет потери уведомлений

---

## Performance Benchmarks

### Целевые Метрики

| Метрика | Цель | Критический |
|---------|------|-------------|
| **Connection Time** | < 500ms | < 2s |
| **Message Delivery** | < 100ms | < 500ms |
| **Typing Indicator** | < 50ms | < 200ms |
| **Notification Delivery** | < 200ms | < 1s |
| **Reconnection Time** | < 2s | < 5s |

### Мониторинг

```javascript
// Измерение latency
const startTime = Date.now();
socket.emit('send_message', payload);

socket.on('message_sent', (data) => {
  const latency = Date.now() - startTime;
  console.log('Message latency:', latency, 'ms');
  
  if (latency > 500) {
    console.warn('⚠️ High latency detected!');
  }
});

// Tracking connection stats
socket.on('connect', () => {
  console.log('RTT:', socket.io.engine.transport.pingTimeout);
});
```

---

## Полезные Ссылки

### Документация
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Socket.IO Events](https://socket.io/docs/v4/listening-to-events/)
- [NestJS WebSocket](https://docs.nestjs.com/websockets/gateways)

### Инструменты
- [Postman WebSocket](https://learning.postman.com/docs/sending-requests/websocket/)
- [wscat](https://github.com/websockets/wscat)
- [Socket.IO Admin UI](https://socket.io/docs/v4/admin-ui/)

### Наши Документы
- [POSTMAN_SCENARIOS_GUIDE.md](./POSTMAN_SCENARIOS_GUIDE.md) - HTTP тестовые сценарии
- [TESTING_STRATEGY.md](../../TESTING_STRATEGY.md) - Общая стратегия тестирования
- API Swagger: http://localhost:3000/api/docs

---

**Создано:** 13 ноября 2025  
**Версия:** 1.0  
**Автор:** Hummii Development Team

**Файлы:**
- `Hummii-WebSocket.postman_collection.json` - Postman коллекция
- `WEBSOCKET_TESTING_GUIDE.md` - Это руководство
- `README.md` - Обзор всех коллекций
