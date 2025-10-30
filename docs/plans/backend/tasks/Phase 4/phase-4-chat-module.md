# Phase 4: Chat Module - Detailed Implementation Plan

**Timeline:** Week 9-10 (2 weeks)  
**Priority:** 🟡 HIGH  
**Dependencies:** Phase 2 (User Management), Phase 3 (Orders Module)  
**Status:** Not Started

---

## 📋 Overview

Phase 4 implements a real-time chat system with WebSocket support, allowing clients and contractors to communicate within the context of orders. The module includes comprehensive content moderation to prevent contact information sharing and maintain platform integrity, ensuring all transactions happen through Hummii.

### Business Requirements

- Real-time bidirectional communication between users
- Chat context tied to specific orders
- Automatic content moderation to prevent off-platform transactions
- Message persistence and history
- PIPEDA-compliant data handling
- Chat lifecycle management

### Technical Stack

- **WebSocket:** Socket.io for real-time communication
- **Storage:** PostgreSQL for message persistence, Redis for real-time state
- **Moderation:** Regex-based filters + profanity detection
- **Transport:** WSS (WebSocket Secure) for encrypted communication

### Security & Compliance

- WSS encryption for all messages in transit
- Content moderation on every message
- Rate limiting: 20 messages/min per user
- Permanent message history (audit trail)
- Chat auto-close 30 days after order completion
- PIPEDA data export support

---

## 🎯 Main Tasks

### Task 1: WebSocket Gateway Setup
- [ ] **1.1** Install and configure Socket.io dependencies
- [ ] **1.2** Create WebSocket gateway module
- [ ] **1.3** Implement JWT authentication for WebSocket connections
- [ ] **1.4** Configure connection/disconnection handlers
- [ ] **1.5** Implement heartbeat/ping-pong for connection health
- [ ] **1.6** Setup Redis adapter for horizontal scaling
- [ ] **1.7** Create error handling for WebSocket events
- [ ] **1.8** Write unit tests for gateway

### Task 2: Chat Room Management
- [ ] **2.1** Design Prisma schema for Chat and Message entities
- [ ] **2.2** Create chat service with room creation logic
- [ ] **2.3** Implement automatic chat room creation for orders
- [ ] **2.4** Build participant validation (only order parties)
- [ ] **2.5** Create chat list endpoint (GET /chats)
- [ ] **2.6** Implement chat room status management
- [ ] **2.7** Build chat auto-close logic (30 days after order completion)
- [ ] **2.8** Create chat metadata endpoints
- [ ] **2.9** Write integration tests for chat rooms

### Task 3: Message Sending & Receiving
- [ ] **3.1** Create message DTO with validation
- [ ] **3.2** Implement WebSocket message handler
- [ ] **3.3** Build message persistence service
- [ ] **3.4** Create real-time message delivery
- [ ] **3.5** Implement message acknowledgment system
- [ ] **3.6** Build message history endpoint (GET /chats/:id/messages)
- [ ] **3.7** Implement pagination for message history
- [ ] **3.8** Create typing indicator feature
- [ ] **3.9** Build read receipts system
- [ ] **3.10** Implement online status tracking
- [ ] **3.11** Write E2E tests for messaging

### Task 4: Content Moderation System
- [ ] **4.1** Create moderation service architecture
- [ ] **4.2** Implement phone number detection (Canadian +1 format)
- [ ] **4.3** Implement email address detection
- [ ] **4.4** Build external link blocking (whitelist platform URLs)
- [ ] **4.5** Create social media handle detection
- [ ] **4.6** Implement profanity filter (English + French)
- [ ] **4.7** Build spam detection (repeated messages)
- [ ] **4.8** Create moderation flag response system
- [ ] **4.9** Implement automatic message blocking/replacement
- [ ] **4.10** Build moderation logging service
- [ ] **4.11** Write comprehensive moderation tests

### Task 5: Message Management Features
- [ ] **5.1** Implement message editing (5-minute window)
- [ ] **5.2** Create message deletion (soft delete)
- [ ] **5.3** Build message search within chat
- [ ] **5.4** Implement unread message counter
- [ ] **5.5** Create message export for PIPEDA compliance
- [ ] **5.6** Build flag/report system for abusive messages
- [ ] **5.7** Implement auto-suspend logic (3 reports threshold)
- [ ] **5.8** Create admin moderation queue
- [ ] **5.9** Write tests for message management

### Task 6: Rate Limiting & Security
- [ ] **6.1** Implement message rate limiting (20/min per user)
- [ ] **6.2** Create connection rate limiting
- [ ] **6.3** Build IP-based abuse prevention
- [ ] **6.4** Implement message length validation (2000 chars max)
- [ ] **6.5** Create suspicious activity detection
- [ ] **6.6** Build rate limit headers in responses
- [ ] **6.7** Write security tests for rate limiting
- [ ] **6.8** Implement CSRF protection for WebSocket handshake

---

## 📊 Database Schema

### Prisma Models

```prisma
// prisma/schema.prisma

model Chat {
  id        String   @id @default(uuid())
  orderId   String   @unique
  status    ChatStatus @default(ACTIVE)
  
  // Relationships
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  messages  Message[]
  participants ChatParticipant[]
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  closedAt  DateTime?
  
  @@index([orderId])
  @@index([status])
}

enum ChatStatus {
  ACTIVE
  CLOSED
  SUSPENDED
}

model ChatParticipant {
  id        String   @id @default(uuid())
  chatId    String
  userId    String
  
  // Relationships
  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Participant state
  lastReadAt DateTime?
  joinedAt   DateTime @default(now())
  leftAt     DateTime?
  
  @@unique([chatId, userId])
  @@index([userId])
  @@index([chatId])
}

model Message {
  id        String   @id @default(uuid())
  chatId    String
  senderId  String
  
  // Content
  content   String   @db.Text
  originalContent String? @db.Text // Before moderation
  
  // Moderation flags
  isModerated Boolean @default(false)
  moderationFlags String[] // ['phone', 'email', 'link', etc.]
  
  // Relationships
  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  reports   MessageReport[]
  
  // State
  isEdited  Boolean  @default(false)
  isDeleted Boolean  @default(false)
  deletedAt DateTime?
  
  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  editedAt  DateTime?
  
  @@index([chatId, createdAt])
  @@index([senderId])
  @@index([isDeleted])
}

model MessageReport {
  id        String   @id @default(uuid())
  messageId String
  reporterId String
  reason    ReportReason
  description String? @db.Text
  
  // Relationships
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  reporter  User     @relation(fields: [reporterId], references: [id])
  
  // Status
  status    ReportStatus @default(PENDING)
  reviewedBy String?
  reviewedAt DateTime?
  
  createdAt DateTime @default(now())
  
  @@unique([messageId, reporterId])
  @@index([status])
  @@index([messageId])
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE
  CONTACT_INFO
  FRAUD
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  ACTIONED
  DISMISSED
}

model UserPresence {
  userId    String   @id
  status    PresenceStatus @default(OFFLINE)
  
  // Relationships
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Metadata
  lastSeenAt DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([status])
}

enum PresenceStatus {
  ONLINE
  OFFLINE
  AWAY
}
```

---

## 🔧 Implementation Details

### 1. WebSocket Gateway Setup

#### 1.1 Install Dependencies

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
npm install ioredis socket.io-redis
```

#### 1.2 Chat Gateway Module

```typescript
// src/chat/chat.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  transports: ['websocket'], // Force WebSocket only
})
@UseGuards(JwtAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly presenceService: PresenceService,
    private readonly moderationService: ModerationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract user from JWT token
      const user = client.handshake.auth.user;
      
      if (!user) {
        client.disconnect();
        return;
      }

      // Set user online
      await this.presenceService.setOnline(user.id);
      
      // Join user to their personal room
      client.join(`user:${user.id}`);
      
      // Join user to all their active chats
      const userChats = await this.chatService.getUserChats(user.id);
      userChats.forEach(chat => {
        client.join(`chat:${chat.id}`);
      });

      console.log(`Client connected: ${client.id}, user: ${user.id}`);
      
      // Notify others about online status
      this.server.emit('user:online', { userId: user.id });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = client.handshake.auth.user;
      
      if (user) {
        await this.presenceService.setOffline(user.id);
        this.server.emit('user:offline', { userId: user.id });
        console.log(`Client disconnected: ${client.id}, user: ${user.id}`);
      }
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const user = client.handshake.auth.user;

    try {
      // Validate chat access
      const hasAccess = await this.chatService.validateChatAccess(
        data.chatId,
        user.id,
      );

      if (!hasAccess) {
        return { error: 'Unauthorized' };
      }

      // Moderate message content
      const moderationResult = await this.moderationService.moderateMessage(
        data.content,
      );

      // Save message to database
      const message = await this.chatService.createMessage({
        chatId: data.chatId,
        senderId: user.id,
        content: moderationResult.content,
        originalContent: moderationResult.isModerated ? data.content : null,
        isModerated: moderationResult.isModerated,
        moderationFlags: moderationResult.flags,
      });

      // Emit message to chat room
      this.server.to(`chat:${data.chatId}`).emit('message:new', {
        ...message,
        sender: {
          id: user.id,
          firstName: user.firstName,
          avatar: user.avatar,
        },
      });

      // Send acknowledgment
      return { success: true, messageId: message.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = client.handshake.auth.user;
    
    this.server.to(`chat:${data.chatId}`).emit('typing:start', {
      userId: user.id,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const user = client.handshake.auth.user;
    
    this.server.to(`chat:${data.chatId}`).emit('typing:stop', {
      userId: user.id,
      chatId: data.chatId,
    });
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; messageId: string },
  ) {
    const user = client.handshake.auth.user;

    await this.chatService.markAsRead(data.chatId, user.id);

    this.server.to(`chat:${data.chatId}`).emit('message:read', {
      userId: user.id,
      chatId: data.chatId,
      messageId: data.messageId,
    });
  }
}
```

#### 1.3 JWT Authentication for WebSocket

```typescript
// src/auth/guards/ws-jwt.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user to socket handshake
      client.handshake.auth.user = payload;
      
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: any): string | null {
    // Try to get token from auth header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get token from query params (for browser WebSocket)
    const token = client.handshake.auth.token;
    if (token) {
      return token;
    }

    return null;
  }
}
```

#### 1.4 Redis Adapter for Scaling

```typescript
// src/chat/chat.module.ts

import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    ModerationService,
    PresenceService,
  ],
})
export class ChatModule {}
```

```typescript
// src/chat/adapters/redis-io.adapter.ts

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ 
      url: process.env.REDIS_URL,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

---

### 2. Chat Service

```typescript
// src/chat/chat.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ChatStatus } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new chat room for an order
   */
  async createChatForOrder(orderId: string, clientId: string, contractorId: string) {
    // Check if chat already exists
    const existingChat = await this.prisma.chat.findUnique({
      where: { orderId },
    });

    if (existingChat) {
      return existingChat;
    }

    // Create chat with participants
    const chat = await this.prisma.chat.create({
      data: {
        orderId,
        status: ChatStatus.ACTIVE,
        participants: {
          create: [
            { userId: clientId },
            { userId: contractorId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return chat;
  }

  /**
   * Get all chats for a user
   */
  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
        status: ChatStatus.ACTIVE,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                createdAt: {
                  gt: this.prisma.chatParticipant.fields.lastReadAt,
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chats.map(chat => ({
      ...chat,
      lastMessage: chat.messages[0] || null,
      unreadCount: chat._count.messages,
    }));
  }

  /**
   * Validate if user has access to chat
   */
  async validateChatAccess(chatId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId,
      },
    });

    return !!participant;
  }

  /**
   * Create a new message
   */
  async createMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    originalContent?: string;
    isModerated: boolean;
    moderationFlags: string[];
  }) {
    const message = await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
        originalContent: data.originalContent,
        isModerated: data.isModerated,
        moderationFlags: data.moderationFlags,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat updatedAt timestamp
    await this.prisma.chat.update({
      where: { id: data.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Get message history with pagination
   */
  async getMessages(chatId: string, userId: string, page = 1, limit = 50) {
    // Validate access
    const hasAccess = await this.validateChatAccess(chatId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          chatId,
          isDeleted: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: {
          chatId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      data: messages.reverse(), // Oldest first
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: string, userId: string) {
    await this.prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }

  /**
   * Edit message (within 5 minutes)
   */
  async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if message is within 5-minute edit window
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      throw new ForbiddenException('Message edit window has expired');
    }

    // Moderate new content
    const moderationResult = await this.moderationService.moderateMessage(newContent);

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: moderationResult.content,
        isEdited: true,
        editedAt: new Date(),
        isModerated: moderationResult.isModerated,
        moderationFlags: moderationResult.flags,
      },
    });

    return updatedMessage;
  }

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: '[Message deleted]',
      },
    });
  }

  /**
   * Auto-close chats after order completion
   */
  async autoCloseChats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await this.prisma.chat.updateMany({
      where: {
        status: ChatStatus.ACTIVE,
        order: {
          status: 'COMPLETED',
          completedAt: {
            lt: thirtyDaysAgo,
          },
        },
      },
      data: {
        status: ChatStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  /**
   * Search messages within a chat
   */
  async searchMessages(chatId: string, userId: string, query: string) {
    // Validate access
    const hasAccess = await this.validateChatAccess(chatId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
        isDeleted: false,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return messages;
  }
}
```

---

### 3. Content Moderation Service

```typescript
// src/chat/moderation.service.ts

import { Injectable } from '@nestjs/common';

interface ModerationResult {
  content: string;
  isModerated: boolean;
  flags: string[];
}

@Injectable()
export class ModerationService {
  // Regex patterns for detection
  private readonly patterns = {
    // Canadian phone numbers: +1XXXXXXXXXX, 1-XXX-XXX-XXXX, (XXX) XXX-XXXX, etc.
    phone: /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
    
    // Email addresses
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    
    // External URLs (not hummii.ca)
    externalUrl: /https?:\/\/(?!.*hummii\.ca)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/g,
    
    // Social media handles
    socialMedia: /@(instagram|facebook|twitter|telegram|whatsapp|snapchat|tiktok|linkedin)[^\s]*/gi,
    
    // Direct social usernames
    socialUsername: /@[a-zA-Z0-9_]{3,}/g,
  };

  // Profanity list (basic - use external library for production)
  private readonly profanityList = [
    'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard',
    // French profanity
    'merde', 'putain', 'connard', 'salope',
    // Add more comprehensive list
  ];

  /**
   * Moderate message content
   */
  async moderateMessage(content: string): Promise<ModerationResult> {
    let moderatedContent = content;
    const flags: string[] = [];

    // 1. Check for phone numbers
    if (this.patterns.phone.test(content)) {
      flags.push('phone');
      moderatedContent = moderatedContent.replace(this.patterns.phone, '***-***-****');
    }

    // 2. Check for email addresses
    if (this.patterns.email.test(content)) {
      flags.push('email');
      moderatedContent = moderatedContent.replace(this.patterns.email, '***@***.***');
    }

    // 3. Check for external URLs
    if (this.patterns.externalUrl.test(content)) {
      flags.push('external_link');
      moderatedContent = moderatedContent.replace(this.patterns.externalUrl, '[link removed]');
    }

    // 4. Check for social media handles
    if (this.patterns.socialMedia.test(content)) {
      flags.push('social_media');
      moderatedContent = moderatedContent.replace(this.patterns.socialMedia, '@***');
    }

    // 5. Check for generic social usernames (if not already flagged)
    if (!flags.includes('social_media') && this.patterns.socialUsername.test(content)) {
      // Be cautious - might be legitimate mentions
      const matches = content.match(this.patterns.socialUsername);
      if (matches && matches.length > 0) {
        // Only flag if there are multiple @ mentions (likely social)
        if (matches.length >= 2) {
          flags.push('social_username');
        }
      }
    }

    // 6. Check for profanity
    const lowerContent = content.toLowerCase();
    const hasProfanity = this.profanityList.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(lowerContent)
    );
    
    if (hasProfanity) {
      flags.push('profanity');
      // Optionally censor profanity
      this.profanityList.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        moderatedContent = moderatedContent.replace(regex, '*'.repeat(word.length));
      });
    }

    const isModerated = flags.length > 0;

    return {
      content: moderatedContent,
      isModerated,
      flags,
    };
  }

  /**
   * Detect spam (repeated messages)
   */
  async detectSpam(userId: string, chatId: string, content: string): Promise<boolean> {
    // Get last 5 messages from this user in this chat
    const recentMessages = await this.prisma.message.findMany({
      where: {
        chatId,
        senderId: userId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Check if same message appears 3+ times
    const duplicateCount = recentMessages.filter(
      msg => msg.content === content
    ).length;

    return duplicateCount >= 3;
  }

  /**
   * Log moderation event
   */
  async logModerationEvent(data: {
    messageId: string;
    userId: string;
    chatId: string;
    flags: string[];
    originalContent: string;
    moderatedContent: string;
  }) {
    // Log to analytics or moderation queue
    console.log('[MODERATION]', {
      messageId: data.messageId,
      userId: data.userId,
      chatId: data.chatId,
      flags: data.flags,
      timestamp: new Date().toISOString(),
    });

    // In production, send to analytics service
    // await this.analyticsService.track('message.moderated', data);
  }
}
```

---

### 4. Presence Service

```typescript
// src/chat/presence.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { PresenceStatus } from '@prisma/client';

@Injectable()
export class PresenceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Set user status to online
   */
  async setOnline(userId: string) {
    await this.prisma.userPresence.upsert({
      where: { userId },
      update: {
        status: PresenceStatus.ONLINE,
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        status: PresenceStatus.ONLINE,
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * Set user status to offline
   */
  async setOffline(userId: string) {
    await this.prisma.userPresence.update({
      where: { userId },
      data: {
        status: PresenceStatus.OFFLINE,
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * Get online users
   */
  async getOnlineUsers(userIds: string[]) {
    const presences = await this.prisma.userPresence.findMany({
      where: {
        userId: { in: userIds },
        status: PresenceStatus.ONLINE,
      },
    });

    return presences.map(p => p.userId);
  }

  /**
   * Check if user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    const presence = await this.prisma.userPresence.findUnique({
      where: { userId },
    });

    return presence?.status === PresenceStatus.ONLINE;
  }
}
```

---

### 5. DTOs

```typescript
// src/chat/dto/send-message.dto.ts

import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  content: string;
}
```

```typescript
// src/chat/dto/create-chat.dto.ts

import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}
```

```typescript
// src/chat/dto/report-message.dto.ts

import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportReason } from '@prisma/client';

export class ReportMessageDto {
  @IsUUID()
  messageId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

---

### 6. REST API Endpoints

```typescript
// src/chat/chat.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ReportMessageDto } from './dto/report-message.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /chats - Get all user chats
   */
  @Get()
  async getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.id);
  }

  /**
   * POST /chats - Create a new chat for an order
   */
  @Post()
  async createChat(@Request() req, @Body() dto: CreateChatDto) {
    // Get order details to determine participants
    const order = await this.orderService.findOne(dto.orderId);
    
    return this.chatService.createChatForOrder(
      dto.orderId,
      order.clientId,
      order.contractorId,
    );
  }

  /**
   * GET /chats/:id/messages - Get chat message history
   */
  @Get(':id/messages')
  async getMessages(
    @Request() req,
    @Param('id') chatId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(chatId, req.user.id, +page, +limit);
  }

  /**
   * GET /chats/:id/messages/search - Search messages in chat
   */
  @Get(':id/messages/search')
  async searchMessages(
    @Request() req,
    @Param('id') chatId: string,
    @Query('q') query: string,
  ) {
    return this.chatService.searchMessages(chatId, req.user.id, query);
  }

  /**
   * PATCH /chats/:chatId/messages/:messageId - Edit a message
   */
  @Patch(':chatId/messages/:messageId')
  async editMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body('content') content: string,
  ) {
    return this.chatService.editMessage(messageId, req.user.id, content);
  }

  /**
   * DELETE /chats/:chatId/messages/:messageId - Delete a message
   */
  @Delete(':chatId/messages/:messageId')
  async deleteMessage(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    return this.chatService.deleteMessage(messageId, req.user.id);
  }

  /**
   * POST /chats/:chatId/messages/:messageId/report - Report a message
   */
  @Post(':chatId/messages/:messageId/report')
  async reportMessage(
    @Request() req,
    @Param('messageId') messageId: string,
    @Body() dto: ReportMessageDto,
  ) {
    return this.chatService.reportMessage(messageId, req.user.id, dto);
  }

  /**
   * GET /chats/:id/export - Export chat for PIPEDA compliance
   */
  @Get(':id/export')
  async exportChat(@Request() req, @Param('id') chatId: string) {
    return this.chatService.exportChat(chatId, req.user.id);
  }
}
```

---

## 🔒 Security Requirements

### Rate Limiting

```typescript
// src/chat/decorators/rate-limit.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  points: number;  // Number of requests
  duration: number; // Duration in seconds
}

export const RateLimit = (options: RateLimitOptions) => 
  SetMetadata(RATE_LIMIT_KEY, options);
```

```typescript
// src/chat/guards/rate-limit.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private rateLimiter: RateLimiterRedis;

  constructor(
    private reflector: Reflector,
    private redis: Redis,
  ) {
    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      points: 20, // Default: 20 requests
      duration: 60, // per 60 seconds
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get(RATE_LIMIT_KEY, context.getHandler());
    
    if (options) {
      this.rateLimiter = new RateLimiterRedis({
        storeClient: this.redis,
        points: options.points,
        duration: options.duration,
      });
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return true; // Let auth guard handle this
    }

    try {
      await this.rateLimiter.consume(userId);
      return true;
    } catch (error) {
      throw new TooManyRequestsException('Rate limit exceeded');
    }
  }
}
```

Usage:

```typescript
@RateLimit({ points: 20, duration: 60 }) // 20 messages per minute
@SubscribeMessage('message:send')
async handleMessage(...) {
  // ...
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/chat/chat.service.spec.ts

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createChatForOrder', () => {
    it('should create a new chat room', async () => {
      const orderId = 'order-123';
      const clientId = 'user-1';
      const contractorId = 'user-2';

      const result = await service.createChatForOrder(orderId, clientId, contractorId);

      expect(result).toBeDefined();
      expect(result.orderId).toBe(orderId);
      expect(result.participants).toHaveLength(2);
    });

    it('should return existing chat if already exists', async () => {
      // Test implementation
    });
  });

  describe('createMessage', () => {
    it('should create and save a message', async () => {
      // Test implementation
    });

    it('should update chat updatedAt timestamp', async () => {
      // Test implementation
    });
  });

  describe('validateChatAccess', () => {
    it('should return true for chat participants', async () => {
      // Test implementation
    });

    it('should return false for non-participants', async () => {
      // Test implementation
    });
  });
});
```

### Moderation Tests

```typescript
// src/chat/moderation.service.spec.ts

describe('ModerationService', () => {
  let service: ModerationService;

  beforeEach(() => {
    service = new ModerationService();
  });

  describe('moderateMessage', () => {
    it('should detect and mask phone numbers', async () => {
      const content = 'Call me at 514-555-1234';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain('phone');
      expect(result.content).toContain('***-***-****');
    });

    it('should detect and mask email addresses', async () => {
      const content = 'Email me at test@example.com';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain('email');
      expect(result.content).toContain('***@***.***');
    });

    it('should block external links', async () => {
      const content = 'Check out https://external-site.com';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain('external_link');
      expect(result.content).toContain('[link removed]');
    });

    it('should allow platform URLs', async () => {
      const content = 'See https://hummii.ca/profile/123';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(false);
      expect(result.content).toBe(content);
    });

    it('should detect social media handles', async () => {
      const content = 'Add me @instagram username123';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain('social_media');
    });

    it('should detect profanity', async () => {
      const content = 'This is fucking great';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain('profanity');
    });

    it('should handle clean messages', async () => {
      const content = 'Hello, how are you?';
      const result = await service.moderateMessage(content);

      expect(result.isModerated).toBe(false);
      expect(result.flags).toHaveLength(0);
      expect(result.content).toBe(content);
    });
  });
});
```

### E2E Tests

```typescript
// test/chat.e2e-spec.ts

describe('Chat E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let chatId: string;

  beforeAll(async () => {
    // Setup test app and authenticate
  });

  describe('WebSocket Connection', () => {
    it('should connect with valid JWT token', async () => {
      const socket = io('ws://localhost:3000/chat', {
        auth: { token: accessToken },
      });

      await new Promise<void>(resolve => {
        socket.on('connect', () => {
          expect(socket.connected).toBe(true);
          resolve();
        });
      });

      socket.disconnect();
    });

    it('should reject connection without token', async () => {
      const socket = io('ws://localhost:3000/chat');

      await new Promise<void>(resolve => {
        socket.on('connect_error', (error) => {
          expect(error.message).toContain('Unauthorized');
          resolve();
        });
      });
    });
  });

  describe('Message Sending', () => {
    it('should send and receive messages', async () => {
      const socket = io('ws://localhost:3000/chat', {
        auth: { token: accessToken },
      });

      await new Promise<void>(resolve => {
        socket.on('connect', () => {
          socket.emit('message:send', {
            chatId,
            content: 'Hello, world!',
          });

          socket.on('message:new', (message) => {
            expect(message.content).toBe('Hello, world!');
            resolve();
          });
        });
      });

      socket.disconnect();
    });

    it('should moderate messages with phone numbers', async () => {
      // Test implementation
    });
  });

  describe('Rate Limiting', () => {
    it('should block after 20 messages per minute', async () => {
      // Test implementation
    });
  });
});
```

---

## 📊 Performance Optimization

### Message Caching

```typescript
// Cache recent messages in Redis
async getCachedMessages(chatId: string): Promise<Message[]> {
  const cached = await this.redis.get(`chat:${chatId}:messages`);
  
  if (cached) {
    return JSON.parse(cached);
  }

  const messages = await this.prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  await this.redis.setex(
    `chat:${chatId}:messages`,
    300, // 5 minutes
    JSON.stringify(messages),
  );

  return messages;
}
```

### Presence Optimization

```typescript
// Use Redis for real-time presence tracking
async trackPresence(userId: string) {
  await this.redis.setex(
    `presence:${userId}`,
    60, // Expire in 60 seconds
    'online',
  );
}

async getPresence(userId: string): Promise<boolean> {
  const presence = await this.redis.get(`presence:${userId}`);
  return presence === 'online';
}
```

---

## 📝 Deliverables

### Code Deliverables
- [ ] Chat gateway with WebSocket support
- [ ] Chat service with full CRUD operations
- [ ] Content moderation service with comprehensive filtering
- [ ] Presence service for online status
- [ ] REST API endpoints for chat management
- [ ] Message report system
- [ ] Rate limiting implementation

### Database Deliverables
- [ ] Chat, Message, ChatParticipant models
- [ ] MessageReport model
- [ ] UserPresence model
- [ ] Database migrations

### Testing Deliverables
- [ ] Unit tests for all services (80%+ coverage)
- [ ] Integration tests for WebSocket gateway
- [ ] E2E tests for real-time messaging
- [ ] Moderation accuracy tests
- [ ] Rate limiting verification tests

### Documentation Deliverables
- [ ] WebSocket API documentation
- [ ] REST API documentation (Swagger)
- [ ] Moderation rules documentation
- [ ] Client integration guide
- [ ] Security best practices document

### Security Deliverables
- [ ] WSS encryption configured
- [ ] Rate limiting on all endpoints
- [ ] Content moderation active
- [ ] Audit logging for all messages
- [ ] PIPEDA compliance (data export)

---

## 🔗 Integration Points

### With Orders Module
- Chat creation triggered by order acceptance
- Chat access restricted to order participants
- Chat lifecycle tied to order status
- Chat auto-close 30 days after order completion

### With User Management
- User online status displayed in chat
- User profile data shown in chat interface
- User blocking affects chat access
- Account deletion removes all messages

### With Admin Panel
- Moderation queue for reported messages
- Message history access for dispute resolution
- User suspension based on reports
- Content moderation configuration

---

## 📈 Success Metrics

- WebSocket connection stability: 99%+ uptime
- Message delivery latency: <100ms
- Moderation accuracy: 95%+ for contact info
- Zero off-platform transaction leaks
- Chat history export: 100% PIPEDA compliant
- Rate limiting effectiveness: Block 100% of spam

---

## 🚀 Next Steps

After completing Phase 4, proceed to:
- **Phase 5:** Reviews & Ratings Module
- **Phase 6:** Payments Module (Stripe Integration)

---

**End of Phase 4 Detailed Plan**
