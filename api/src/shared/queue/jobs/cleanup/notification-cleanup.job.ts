import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Notification Cleanup Job
 * PIPEDA Compliance: Delete read notifications older than 90 days
 * Schedule: Daily at 04:00 UTC
 */
@Injectable()
export class NotificationCleanupJob {
  private readonly logger = new Logger(NotificationCleanupJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    timeZone: 'UTC',
  })
  async cleanupOldNotifications(): Promise<void> {
    this.logger.log('Starting notification cleanup job');

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Delete read notifications older than 90 days
      // Keep unread notifications regardless of age (PIPEDA compliance)
      const result = await this.prisma.notification.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
          isRead: true, // Keep unread notifications
        },
      });

      this.logger.log(
        `Notification cleanup completed: ${result.count} notifications deleted (>90 days, read)`,
      );

      // Log cleanup action for audit trail
      await this.auditService.log({
        action: AuditAction.DATA_CLEANUP,
        entity: AuditEntity.NOTIFICATION,
        metadata: {
          deletedCount: result.count,
          retentionPeriod: '90 days',
          criteria: 'read notifications older than 90 days',
        },
      });
    } catch (error) {
      this.logger.error('Failed to cleanup notifications:', error);
      throw error;
    }
  }
}
