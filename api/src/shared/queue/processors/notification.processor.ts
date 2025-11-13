import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Notification Processor
 * Phase 8: Full implementation with OneSignal, Email, Socket.io
 *
 * Jobs:
 * - send-email: Send email notification via OneSignal
 * - send-push: Send push notification via OneSignal
 * - send-digest: Send daily email digest
 * - cleanup-expired: Clean up expired notifications
 * - order-published: Notify contractors in category/radius (legacy)
 * - order-direct-created: Notify specific contractor (legacy)
 * - order-status-changed: Notify client and contractor (legacy)
 * - new-proposal: Notify client about new proposal (legacy)
 * - proposal-accepted: Notify contractor (legacy)
 * - proposal-rejected: Notify contractor (legacy)
 */
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private oneSignalService: any;
  private templateService: any;
  private notificationsService: any;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    // Lazy load services to avoid circular dependency
    this.loadServices();
  }

  private async loadServices() {
    try {
      const { OneSignalService } = await import('../../../notifications/integrations/onesignal.service');
      const { TemplateService } = await import('../../../notifications/services/template.service');
      const { NotificationsService } = await import('../../../notifications/notifications.service');
      
      // These will be injected via QueueModule or we'll use Prisma directly
      this.oneSignalService = OneSignalService;
      this.templateService = TemplateService;
      this.notificationsService = NotificationsService;
    } catch (error) {
      this.logger.warn('Failed to load notification services:', error);
    }
  }

  /**
   * Safely convert Prisma Json type to Record<string, any>
   */
  private safeMetadataToObject(metadata: Prisma.JsonValue | null): Record<string, any> {
    if (metadata === null || metadata === undefined) {
      return {};
    }
    if (typeof metadata === 'object' && !Array.isArray(metadata)) {
      return metadata as Record<string, any>;
    }
    return {};
  }

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { notificationId, userId, type } = job.data;

    try {
      // Get notification from database
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true },
      });

      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      // Get notification config
      const { NOTIFICATION_CONFIG } = await import('../../../notifications/types/notification-types');
      const config = NOTIFICATION_CONFIG[type as keyof typeof NOTIFICATION_CONFIG];
      const template = config?.template || 'order-status-changed';

      // Load template service if not loaded
      if (!this.templateService) {
        const { TemplateService } = await import('../../../notifications/services/template.service');
        const { ConfigService } = await import('@nestjs/config');
        this.templateService = new TemplateService(new ConfigService());
      }

      // Render template
      const metadata = this.safeMetadataToObject(notification.metadata);
      const html = this.templateService.render(template, {
        title: notification.title,
        body: notification.body,
        actionUrl: notification.actionUrl || '',
        ...metadata,
      });

      // Load OneSignal service if not loaded
      if (!this.oneSignalService) {
        const { OneSignalService } = await import('../../../notifications/integrations/onesignal.service');
        const { ConfigService } = await import('@nestjs/config');
        this.oneSignalService = new OneSignalService(
          new ConfigService(),
          this.prisma,
          this.templateService,
        );
      }

      // Send email via OneSignal
      await this.oneSignalService.sendEmail(
        notification.user.email,
        notification.title,
        template,
        {
          userId,
          html,
          ...metadata,
        },
      );

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { sentAt: new Date() },
      });

      this.logger.log(`Email sent for notification ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to send email for notification ${notificationId}:`, error);
      throw error;
    }
  }

  @Process('send-push')
  async handleSendPush(job: Job) {
    const { notificationId, userId, type } = job.data;

    try {
      // Get notification from database
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      // Load OneSignal service if not loaded
      if (!this.oneSignalService) {
        const { OneSignalService } = await import('../../../notifications/integrations/onesignal.service');
        const { TemplateService } = await import('../../../notifications/services/template.service');
        const { ConfigService } = await import('@nestjs/config');
        const templateService = new TemplateService(new ConfigService());
        this.oneSignalService = new OneSignalService(
          new ConfigService(),
          this.prisma,
          templateService,
        );
      }

      // Send push via OneSignal
      const metadata = this.safeMetadataToObject(notification.metadata);
      await this.oneSignalService.sendPush(
        userId,
        notification.title,
        notification.body,
        {
          actionUrl: notification.actionUrl || '',
          notificationId: notification.id,
          ...metadata,
        },
      );

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { sentAt: new Date() },
      });

      this.logger.log(`Push sent for notification ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to send push for notification ${notificationId}:`, error);
      throw error;
    }
  }

  @Process('send-digest')
  async handleSendDigest(job: Job) {
    const { userId } = job.data;

    try {
      // Get unread notifications from last 24 hours
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
        this.logger.log(`No notifications for user ${userId} in last 24 hours, skipping digest`);
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Load template service if not loaded
      if (!this.templateService) {
        const { TemplateService } = await import('../../../notifications/services/template.service');
        const { ConfigService } = await import('@nestjs/config');
        this.templateService = new TemplateService(new ConfigService());
      }

      // Render digest template
      const html = this.templateService.render('email-digest', {
        userName: user.name,
        notifications,
        count: notifications.length,
      });

      // Load OneSignal service if not loaded
      if (!this.oneSignalService) {
        const { OneSignalService } = await import('../../../notifications/integrations/onesignal.service');
        const { ConfigService } = await import('@nestjs/config');
        this.oneSignalService = new OneSignalService(
          new ConfigService(),
          this.prisma,
          this.templateService,
        );
      }

      // Send digest email
      await this.oneSignalService.sendEmail(
        user.email,
        `Daily Summary: ${notifications.length} new notifications`,
        'email-digest',
        {
          userId,
          html,
          notifications,
        },
      );

      this.logger.log(`Digest sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send digest to user ${userId}:`, error);
      throw error;
    }
  }

  @Process('cleanup-expired')
  async handleCleanupExpired() {
    try {
      const result = await this.prisma.notification.deleteMany({
        where: {
          AND: [
            { expiresAt: { not: null } },
            { expiresAt: { lt: new Date() } },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired notifications`);
      return result;
    } catch (error) {
      this.logger.error('Failed to cleanup expired notifications:', error);
      throw error;
    }
  }

  // Legacy handlers for backward compatibility
  @Process('order-published')
  async handleOrderPublished(job: Job) {
    this.logger.log(`[Legacy] Order published: ${JSON.stringify(job.data)}`);
    // TODO: Implement via NotificationsService.create()
    return { processed: true };
  }

  @Process('order-direct-created')
  async handleOrderDirectCreated(job: Job) {
    this.logger.log(`[Legacy] Direct order created: ${JSON.stringify(job.data)}`);
    // TODO: Implement via NotificationsService.create()
    return { processed: true };
  }

  @Process('order-status-changed')
  async handleOrderStatusChanged(job: Job) {
    this.logger.log(`[Legacy] Order status changed: ${JSON.stringify(job.data)}`);
    // TODO: Implement via NotificationsService.create()
    return { processed: true };
  }

  @Process('new-proposal')
  async handleNewProposal(job: Job) {
    this.logger.log(`[Legacy] New proposal: ${JSON.stringify(job.data)}`);
    // TODO: Implement via NotificationsService.create()
    return { processed: true };
  }

  @Process('proposal-accepted')
  async handleProposalAccepted(job: Job) {
    this.logger.log(`[Legacy] Proposal accepted: ${JSON.stringify(job.data)}`);
    // TODO: Implement via NotificationsService.create()
    return { processed: true };
  }

  @Process('proposal-rejected')
  async handleProposalRejected(job: Job) {
    this.logger.log(`[Legacy] Proposal rejected: ${JSON.stringify(job.data)}`);
    // TODO: Implement via NotificationsService.create()
    return { processed: true };
  }
}

