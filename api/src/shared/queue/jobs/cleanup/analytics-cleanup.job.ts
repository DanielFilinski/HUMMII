import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Analytics Cleanup Job
 * PIPEDA Compliance: Delete analytics data older than 90 days
 * Schedule: Daily at 06:00 UTC
 */
@Injectable()
export class AnalyticsCleanupJob {
  private readonly logger = new Logger(AnalyticsCleanupJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, {
    timeZone: 'UTC',
  })
  async cleanupOldAnalytics(): Promise<void> {
    this.logger.log('Starting analytics cleanup job');

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Delete analytics events older than 90 days
      const eventsResult = await this.prisma.analyticsEvent.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      // Delete search analytics older than 90 days
      const searchResult = await this.prisma.searchAnalytics.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      const totalDeleted = eventsResult.count + searchResult.count;

      this.logger.log(
        `Analytics cleanup completed: ${eventsResult.count} events and ${searchResult.count} searches deleted (>90 days)`,
      );

      // Log cleanup action for audit trail
      await this.auditService.log({
        action: AuditAction.DATA_CLEANUP,
        entity: AuditEntity.USER,
        metadata: {
          deletedEventsCount: eventsResult.count,
          deletedSearchesCount: searchResult.count,
          totalDeleted,
          retentionPeriod: '90 days',
          criteria: 'analytics data older than 90 days',
        },
      });
    } catch (error) {
      this.logger.error('Failed to cleanup analytics data:', error);
      throw error;
    }
  }
}


