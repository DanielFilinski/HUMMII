import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Chat Cleanup Job
 * PIPEDA Compliance: Delete read messages older than 90 days
 * Schedule: Daily at 02:00 UTC
 */
@Injectable()
export class ChatCleanupJob {
  private readonly logger = new Logger(ChatCleanupJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: 'UTC',
  })
  async cleanupOldMessages(): Promise<void> {
    this.logger.log('Starting chat messages cleanup job');

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Delete read messages older than 90 days
      // Keep unread messages regardless of age (PIPEDA compliance)
      const result = await this.prisma.message.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
          isRead: true, // Only delete read messages
        },
      });

      this.logger.log(
        `Chat cleanup completed: ${result.count} messages deleted (>90 days, read)`,
      );

      // Log cleanup action for audit trail
      await this.auditService.log({
        action: AuditAction.DATA_CLEANUP,
        entity: AuditEntity.MESSAGE,
        metadata: {
          deletedCount: result.count,
          retentionPeriod: '90 days',
          criteria: 'read messages older than 90 days',
        },
      });
    } catch (error) {
      this.logger.error('Failed to cleanup chat messages:', error);
      throw error;
    }
  }
}
