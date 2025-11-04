import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import {
  RATING_WEIGHTS,
  MIN_REVIEWS_FOR_BADGE,
  TOP_PRO_MIN_RATING,
} from '../constants/rating-criteria';

/**
 * Rating Calculation Service
 *
 * Handles rating aggregation, weighted score calculation, and badge assignment
 */
@Injectable()
export class RatingCalculationService {
  private readonly logger = new Logger(RatingCalculationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Update user rating statistics
   * Recalculates all rating metrics for a user
   */
  async updateUserRatingStats(userId: string): Promise<void> {
    // Get user type
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (!user) {
      this.logger.warn(`User not found: ${userId}`);
      return;
    }

    // Determine user type (CLIENT or CONTRACTOR)
    const userType = user.roles.includes(UserRole.CONTRACTOR)
      ? UserRole.CONTRACTOR
      : UserRole.CLIENT;

    // Get all approved, visible reviews for this user
    const reviews = await this.prisma.review.findMany({
      where: {
        revieweeId: userId,
        status: 'APPROVED',
        isVisible: true,
      },
    });

    if (reviews.length === 0) {
      // No reviews yet - initialize with zeros
      await this.prisma.userRatingStats.upsert({
        where: { userId },
        update: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
          weightedScore: 0,
        },
        create: {
          userId,
          userType,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
          weightedScore: 0,
        },
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    const averageRating = Number((totalRating / reviews.length).toFixed(2));

    // Calculate criteria averages
    const criteriaAverages = this.calculateCriteriaAverages(reviews, userType);

    // Calculate rating distribution
    const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    reviews.forEach((review) => {
      const rounded = Math.round(Number(review.rating));
      if (rounded >= 1 && rounded <= 5) {
        distribution[rounded.toString() as keyof typeof distribution] =
          (distribution[rounded.toString() as keyof typeof distribution] || 0) + 1;
      }
    });

    // Calculate weighted score
    const weightedScore = await this.calculateWeightedScore(userId, averageRating);

    // Update or create stats
    await this.prisma.userRatingStats.upsert({
      where: { userId },
      update: {
        averageRating,
        totalReviews: reviews.length,
        ...criteriaAverages,
        ratingDistribution: distribution,
        weightedScore,
      },
      create: {
        userId,
        userType,
        averageRating,
        totalReviews: reviews.length,
        ...criteriaAverages,
        ratingDistribution: distribution,
        weightedScore,
      },
    });

    this.logger.log(
      `Updated rating stats for user ${userId}: ${averageRating}⭐ (${reviews.length} reviews)`,
    );
  }

  /**
   * Calculate criteria averages
   */
  private calculateCriteriaAverages(reviews: any[], userType: UserRole): any {
    const criteriaSum: any = {};
    const criteriaCounts: any = {};

    reviews.forEach((review) => {
      const criteria = review.criteriaRatings as any;
      if (criteria) {
        Object.entries(criteria).forEach(([key, value]) => {
          criteriaSum[key] = (criteriaSum[key] || 0) + (value as number);
          criteriaCounts[key] = (criteriaCounts[key] || 0) + 1;
        });
      }
    });

    const averages: any = {};
    Object.entries(criteriaSum).forEach(([key, sum]) => {
      const avgKey = `avg${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      averages[avgKey] = Number(
        ((sum as number) / criteriaCounts[key]).toFixed(2),
      );
    });

    return averages;
  }

  /**
   * Calculate weighted score
   * Formula: 70% rating + 20% experience + 10% verification
   */
  private async calculateWeightedScore(
    userId: string,
    averageRating: number,
  ): Promise<number> {
    // Get completed orders count (experience)
    const completedOrders = await this.prisma.order.count({
      where: {
        contractorId: userId,
        status: 'COMPLETED',
      },
    });

    // Get verification status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    // Normalize experience (cap at 100 orders = 5.0 score)
    // 100 orders / 20 = 5.0 max
    const experienceScore = Math.min(completedOrders / 20, 5.0);

    // Verification score (5.0 if verified, 0 if not)
    const verificationScore = user?.isVerified ? 5.0 : 0.0;

    // Calculate weighted score
    const weightedScore =
      averageRating * RATING_WEIGHTS.RATING_SCORE +
      experienceScore * RATING_WEIGHTS.EXPERIENCE +
      verificationScore * RATING_WEIGHTS.VERIFICATION;

    return Number(weightedScore.toFixed(2));
  }

  /**
   * Update user badges
   */
  async updateUserBadges(userId: string): Promise<void> {
    const stats = await this.prisma.userRatingStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      return;
    }

    const badges: string[] = [];

    // Verified badge (Stripe Identity)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    if (user?.isVerified) {
      badges.push('verified');
    }

    // Top Pro badge (4.5+ rating, 5+ reviews)
    if (
      Number(stats.averageRating) >= TOP_PRO_MIN_RATING &&
      stats.totalReviews >= MIN_REVIEWS_FOR_BADGE
    ) {
      badges.push('top_pro');
    }

    // New badge (less than 5 reviews)
    if (stats.totalReviews < 5) {
      badges.push('new');
    }

    await this.prisma.userRatingStats.update({
      where: { userId },
      data: { badges },
    });

    this.logger.log(`Updated badges for user ${userId}: ${badges.join(', ')}`);
  }

  /**
   * Get rating distribution for a user
   */
  async getRatingDistribution(userId: string): Promise<{
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  }> {
    const stats = await this.prisma.userRatingStats.findUnique({
      where: { userId },
    });

    return (
      (stats?.ratingDistribution as {
        '5': number;
        '4': number;
        '3': number;
        '2': number;
        '1': number;
      }) || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
    );
  }
}

