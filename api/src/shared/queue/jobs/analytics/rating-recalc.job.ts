import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { RatingCalculationService } from '../../../../reviews/services/rating-calculation.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Rating Recalculation Job
 * Recalculate ratings for all users with reviews
 * Schedule: Daily at 01:00 UTC
 */
@Injectable()
export class RatingRecalcJob {
  private readonly logger = new Logger(RatingRecalcJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ratingCalculationService: RatingCalculationService,
    private readonly auditService: AuditService,
  ) {}

  @Cron('0 1 * * *', {
    timeZone: 'UTC',
  })
  async recalculateRatings(): Promise<void> {
    this.logger.log('Starting rating recalculation job');

    try {
      // Get all users with reviews
      const usersWithReviews = await this.prisma.review.findMany({
        select: {
          revieweeId: true,
        },
        distinct: ['revieweeId'],
      });

      const userIds = [...new Set(usersWithReviews.map((r) => r.revieweeId))];
      this.logger.log(`Recalculating ratings for ${userIds.length} users`);

      let successCount = 0;
      let errorCount = 0;

      // Recalculate ratings for each user
      for (const userId of userIds) {
        try {
          await this.ratingCalculationService.updateUserRatingStats(userId);
          await this.ratingCalculationService.updateUserBadges(userId);
          successCount++;
        } catch (error) {
          this.logger.error(
            `Failed to recalculate rating for user ${userId}:`,
            error,
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Rating recalculation completed: ${successCount} successful, ${errorCount} errors`,
      );

      // Log recalculation for audit trail
      await this.auditService.log({
        action: AuditAction.SYSTEM_ACTION,
        entity: AuditEntity.SYSTEM,
        metadata: {
          actionType: 'rating_recalculation',
          totalUsers: userIds.length,
          successCount,
          errorCount,
        },
      });
    } catch (error) {
      this.logger.error('Failed to recalculate ratings:', error);
      throw error;
    }
  }
}
