import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Daily Statistics Calculation Job
 * Calculate daily user engagement metrics, order completion rates, etc.
 * Schedule: Daily at 00:30 UTC
 */
@Injectable()
export class DailyStatsJob {
  private readonly logger = new Logger(DailyStatsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron('30 0 * * *', {
    timeZone: 'UTC',
  })
  async calculateDailyStats(): Promise<void> {
    this.logger.log('Starting daily statistics calculation job');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. User engagement metrics
      const newUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      const activeUsers = await this.prisma.user.count({
        where: {
          updatedAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      // 2. Order completion rates
      const ordersCreated = await this.prisma.order.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      const ordersCompleted = await this.prisma.order.count({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      const completionRate =
        ordersCreated > 0 ? (ordersCompleted / ordersCreated) * 100 : 0;

      // 3. Revenue analytics (if payment records exist)
      // Note: Payment records are not used in MVP, but we can track order values
      const totalOrderValue = await this.prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: yesterday,
            lt: today,
          },
          agreedPrice: {
            not: null,
          },
        },
        _sum: {
          agreedPrice: true,
        },
      });

      // 4. Performance metrics aggregation (anonymized, no PII)
      const stats = {
        date: yesterday.toISOString().split('T')[0],
        newUsers,
        activeUsers,
        ordersCreated,
        ordersCompleted,
        completionRate: Number(completionRate.toFixed(2)),
        totalOrderValue: totalOrderValue._sum.agreedPrice || 0,
      };

      this.logger.log(`Daily stats calculated: ${JSON.stringify(stats)}`);

      // Log daily stats for audit trail (anonymized, no PII)
      await this.auditService.log({
        action: AuditAction.SYSTEM_ACTION,
        entity: AuditEntity.SYSTEM,
        metadata: {
          statsType: 'daily',
          ...stats,
        },
      });
    } catch (error) {
      this.logger.error('Failed to calculate daily statistics:', error);
      throw error;
    }
  }
}
