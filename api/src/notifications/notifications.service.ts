import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../shared/prisma/prisma.service';
import { NotificationType, NotificationPriority, NotificationChannel } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NOTIFICATION_CONFIG } from './types/notification-types';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationGateway: NotificationsGateway,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    data: CreateNotificationDto,
  ) {
    // 1. Get user preferences (or create default)
    const preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // 2. Get notification config
    const config = NOTIFICATION_CONFIG[type];
    const priority = data.priority || config.priority;

    // 3. Determine enabled channels based on preferences
    const enabledChannels: NotificationChannel[] = [];
    if (preferences?.inAppEnabled !== false) {
      enabledChannels.push(NotificationChannel.IN_APP);
    }
    if (preferences?.emailEnabled && this.isEmailEnabledForType(type, preferences)) {
      enabledChannels.push(NotificationChannel.EMAIL);
    }
    if (preferences?.pushEnabled && this.isPushEnabledForType(type, preferences)) {
      enabledChannels.push(NotificationChannel.PUSH);
    }

    // 4. Create notification in DB
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        priority,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        metadata: data.metadata || {},
        channels: enabledChannels,
      },
    });

    // 5. Send real-time via WebSocket if in-app enabled
    if (enabledChannels.includes(NotificationChannel.IN_APP)) {
      this.notificationGateway.sendToUser(userId, notification);
      
      // Update unread count
      const unreadCount = await this.getUnreadCount(userId);
      this.notificationGateway.updateUnreadCount(userId, unreadCount);
    }

    // 6. Queue for email/push
    if (enabledChannels.includes(NotificationChannel.EMAIL)) {
      await this.notificationQueue.add('send-email', {
        notificationId: notification.id,
        userId,
        type,
      });
    }

    if (enabledChannels.includes(NotificationChannel.PUSH)) {
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

    const where: any = {
      userId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

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
    const notification = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update unread count via WebSocket
    const unreadCount = await this.getUnreadCount(userId);
    this.notificationGateway.updateUnreadCount(userId, unreadCount);

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update unread count via WebSocket
    this.notificationGateway.updateUnreadCount(userId, 0);

    return result;
  }

  async getUnreadCount(userId: string): Promise<number> {
    // TODO: Add Redis caching for performance
    // For now, query directly from database
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async delete(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  async deleteAll(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    // Update unread count via WebSocket
    this.notificationGateway.updateUnreadCount(userId, 0);

    return result;
  }

  async cleanupExpired() {
    const result = await this.prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired notifications`);
    return result;
  }

  /**
   * Check if email is enabled for specific notification type
   */
  private isEmailEnabledForType(type: NotificationType, preferences: any): boolean {
    // Security alerts always enabled
    if (type === NotificationType.SECURITY_ALERT) {
      return true;
    }

    switch (type) {
      case NotificationType.ORDER_STATUS_CHANGED:
        return preferences.emailOrderUpdates !== false;
      case NotificationType.NEW_PROPOSAL:
      case NotificationType.PROPOSAL_ACCEPTED:
      case NotificationType.PROPOSAL_REJECTED:
        return preferences.emailNewProposals !== false;
      case NotificationType.MESSAGE_RECEIVED:
        return preferences.emailMessages !== false;
      case NotificationType.PAYMENT_RECEIVED:
      case NotificationType.PAYMENT_FAILED:
        return preferences.emailPayments !== false;
      case NotificationType.REVIEW_SUBMITTED:
      case NotificationType.REVIEW_RESPONSE:
        return preferences.emailReviews !== false;
      case NotificationType.DISPUTE_OPENED:
      case NotificationType.DISPUTE_STATUS_CHANGED:
      case NotificationType.DISPUTE_RESOLVED:
        return preferences.emailDisputes !== false;
      case NotificationType.VERIFICATION_STATUS:
        return preferences.emailSecurity !== false;
      default:
        return preferences.emailMarketing !== false;
    }
  }

  /**
   * Check if push is enabled for specific notification type
   */
  private isPushEnabledForType(type: NotificationType, preferences: any): boolean {
    // Security alerts always enabled
    if (type === NotificationType.SECURITY_ALERT) {
      return true;
    }

    switch (type) {
      case NotificationType.ORDER_STATUS_CHANGED:
        return preferences.pushOrderUpdates !== false;
      case NotificationType.NEW_PROPOSAL:
      case NotificationType.PROPOSAL_ACCEPTED:
      case NotificationType.PROPOSAL_REJECTED:
        return preferences.pushNewProposals !== false;
      case NotificationType.MESSAGE_RECEIVED:
        return preferences.pushMessages !== false;
      case NotificationType.PAYMENT_RECEIVED:
      case NotificationType.PAYMENT_FAILED:
        return preferences.pushPayments !== false;
      case NotificationType.REVIEW_SUBMITTED:
      case NotificationType.REVIEW_RESPONSE:
        return preferences.pushReviews !== false;
      case NotificationType.DISPUTE_OPENED:
      case NotificationType.DISPUTE_STATUS_CHANGED:
      case NotificationType.DISPUTE_RESOLVED:
        return preferences.pushDisputes !== false;
      default:
        return false;
    }
  }
}

