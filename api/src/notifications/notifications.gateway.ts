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
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Notifications Gateway
 *
 * WebSocket gateway for real-time notifications using Socket.io:
 * - JWT authentication on connection
 * - Real-time notification delivery
 * - Unread count updates
 * - Rate limiting (100 events/min)
 *
 * Events:
 * Client → Server: notification:mark-read
 * Server → Client: notification:new, notification:unread-count
 */
@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly rateLimiter: RateLimiterMemory;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    // Rate limiter: 100 events per minute per user
    this.rateLimiter = new RateLimiterMemory({
      points: 100,
      duration: 60,
    });
  }

  async handleConnection(client: Socket) {
    try {
      // Extract JWT from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const userId = payload.sub;

      // Save userId in socket data
      client.data.userId = userId;

      // Join user room
      client.join(`user:${userId}`);

      // Send current unread count
      const unreadCount = await this.prisma.notification.count({
        where: { userId, isRead: false },
      });

      client.emit('notification:unread-count', { count: unreadCount });

      this.logger.log(`User ${userId} connected to notifications`);
    } catch (error) {
      this.logger.error('WebSocket auth failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.logger.log(`User ${userId} disconnected from notifications`);
    }
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /**
   * Update unread count for user
   */
  updateUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('notification:unread-count', { count });
  }

  @SubscribeMessage('notification:mark-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    try {
      // Check rate limit
      await this.rateLimiter.consume(userId);
    } catch (error) {
      throw new WsException('Rate limit exceeded');
    }

    // Mark as read
    await this.prisma.notification.updateMany({
      where: { id: data.notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });

    // Update unread count
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    this.updateUnreadCount(userId, unreadCount);
  }
}

