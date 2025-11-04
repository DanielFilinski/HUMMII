import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatSessionService } from './services/chat-session.service';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { PrismaService } from '../shared/prisma/prisma.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Chat Gateway
 * 
 * WebSocket gateway for real-time chat functionality using Socket.io:
 * - JWT authentication on connection
 * - Real-time message sending/receiving
 * - Typing indicators
 * - Read receipts
 * - Online status
 * - Rate limiting (20 messages/min)
 * 
 * Events:
 * Client → Server: join_order_chat, send_message, typing, stop_typing, mark_as_read, edit_message
 * Server → Client: message_sent, new_message, user_typing, user_stopped_typing, messages_read, message_edited, user_online, user_offline, error
 */
@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly rateLimiter: RateLimiterMemory;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly chatSessionService: ChatSessionService,
    private readonly prisma: PrismaService,
  ) {
    // Rate limiter: 20 messages per minute per user
    this.rateLimiter = new RateLimiterMemory({
      points: 20, // 20 messages
      duration: 60, // per 60 seconds
    });
  }

  /**
   * Handle new WebSocket connection
   * Authenticate user with JWT and set up session
   */
  async handleConnection(client: Socket) {
    try {
      // Extract JWT from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Fetch user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          roles: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to socket
      client.data.user = user;

      // Track connection in Redis
      await this.chatSessionService.addConnection(user.id, client.id);

      // Join user's personal room
      client.join(`user:${user.id}`);

      // Update last seen
      await this.chatSessionService.updateLastSeen(user.id);

      // Send offline messages if any
      const offlineMessages = await this.chatSessionService.getOfflineMessages(user.id);
      if (offlineMessages.length > 0) {
        client.emit('offline_messages', offlineMessages);
      }

      this.logger.log(`Client connected: ${user.id} (${client.id})`);
    } catch (error) {
      this.logger.error(`WebSocket auth failed: ${error.message}`);
      client.emit('error', { message: 'Authentication failed', code: 'AUTH_FAILED' });
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   * Clean up session and update online status
   */
  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    
    if (user) {
      try {
        // Remove connection from Redis
        await this.chatSessionService.removeConnection(user.id, client.id);

        // Update last seen
        await this.chatSessionService.updateLastSeen(user.id);

        // Check if user has other connections
        const isStillOnline = await this.chatSessionService.isUserOnline(user.id);

        // If no more connections, notify other users
        if (!isStillOnline) {
          // Broadcast offline status to relevant users
          this.server.emit('user_offline', { userId: user.id });
        }

        this.logger.log(`Client disconnected: ${user.id} (${client.id})`);
      } catch (error) {
        this.logger.error(`Error during disconnect: ${error.message}`);
      }
    }
  }

  /**
   * Join order chat room
   * User must be participant of the order
   */
  @SubscribeMessage('join_order_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const user = client.data.user;

    try {
      // Verify user is participant of the order
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
        select: {
          id: true,
          clientId: true,
          contractorId: true,
        },
      });

      if (!order) {
        throw new WsException('Order not found');
      }

      const isParticipant = order.clientId === user.id || order.contractorId === user.id;
      if (!isParticipant) {
        throw new WsException('You are not a participant of this order');
      }

      // Join order-specific room
      client.join(`order:${data.orderId}`);

      this.logger.log(`User ${user.id} joined chat for order ${data.orderId}`);

      return { success: true, orderId: data.orderId };
    } catch (error) {
      this.logger.error(`Failed to join chat: ${error.message}`);
      throw new WsException(error.message || 'Failed to join chat');
    }
  }

  /**
   * Send message
   * Rate limited to 20 messages/min per user
   */
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

    try {
      // Send message (will be moderated automatically)
      const message = await this.chatService.sendMessage(data, user.id);

      // Emit to sender (confirmation)
      client.emit('message_sent', message);

      // Emit to recipient
      const recipientId = message.receiverId;
      this.server.to(`user:${recipientId}`).emit('new_message', message);

      // If recipient is offline, queue message
      const isOnline = await this.chatSessionService.isUserOnline(recipientId);
      if (!isOnline) {
        await this.chatSessionService.queueOfflineMessage(recipientId, message);
        
        // TODO: Queue push notification (Phase 8)
        this.logger.log(`Queued message for offline user ${recipientId}`);
      }

      // Increment unread count
      await this.chatSessionService.incrementUnreadCount(data.orderId, recipientId);

      // Stop typing indicator for sender
      await this.chatSessionService.removeTyping(data.orderId, user.id);
      this.server.to(`order:${data.orderId}`).emit('user_stopped_typing', {
        userId: user.id,
        orderId: data.orderId,
      });

      return message;
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw new WsException(error.message || 'Failed to send message');
    }
  }

  /**
   * User started typing
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const user = client.data.user;

    try {
      // Set typing indicator in Redis (expires after 5 seconds)
      await this.chatSessionService.setTyping(data.orderId, user.id);

      // Broadcast to other participants in the order room
      client.to(`order:${data.orderId}`).emit('user_typing', {
        userId: user.id,
        orderId: data.orderId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to set typing: ${error.message}`);
      throw new WsException('Failed to set typing status');
    }
  }

  /**
   * User stopped typing
   */
  @SubscribeMessage('stop_typing')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const user = client.data.user;

    try {
      // Remove typing indicator from Redis
      await this.chatSessionService.removeTyping(data.orderId, user.id);

      // Broadcast to other participants
      client.to(`order:${data.orderId}`).emit('user_stopped_typing', {
        userId: user.id,
        orderId: data.orderId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to remove typing: ${error.message}`);
      throw new WsException('Failed to update typing status');
    }
  }

  /**
   * Mark messages as read
   */
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; messageIds: string[] },
  ) {
    const user = client.data.user;

    try {
      // Mark messages as read
      await this.chatService.markAsRead(data.orderId, user.id, data.messageIds);

      // Clear unread count in Redis
      await this.chatSessionService.clearUnreadCount(data.orderId, user.id);

      // Notify sender (for read receipts)
      this.server.to(`order:${data.orderId}`).emit('messages_read', {
        userId: user.id,
        messageIds: data.messageIds,
        orderId: data.orderId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to mark as read: ${error.message}`);
      throw new WsException('Failed to mark messages as read');
    }
  }

  /**
   * Edit message (within 5 minutes)
   */
  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const user = client.data.user;

    try {
      // Edit message
      const updatedMessage = await this.chatService.editMessage(
        data.messageId,
        data.content,
        user.id,
      );

      // Broadcast to both participants
      this.server.to(`order:${updatedMessage.orderId}`).emit('message_edited', updatedMessage);
      this.server.to(`user:${updatedMessage.receiverId}`).emit('message_edited', updatedMessage);

      return updatedMessage;
    } catch (error) {
      this.logger.error(`Failed to edit message: ${error.message}`);
      throw new WsException(error.message || 'Failed to edit message');
    }
  }

  /**
   * Send message to specific user (utility method for other services)
   */
  sendMessageToUser(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('new_message', message);
  }

  /**
   * Broadcast online status to specific users
   */
  broadcastOnlineStatus(userId: string) {
    this.server.emit('user_online', { userId });
  }

  /**
   * Broadcast offline status to specific users
   */
  broadcastOfflineStatus(userId: string) {
    this.server.emit('user_offline', { userId });
  }
}


