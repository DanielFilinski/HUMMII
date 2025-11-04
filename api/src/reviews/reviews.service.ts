import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { ReviewStatus, UserRole, OrderStatus } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerationService } from './services/moderation.service';
import { RatingCalculationService } from './services/rating-calculation.service';
import { calculateReviewDeadline, isReviewDeadlinePassed } from './constants/review-deadline';
import { ContractorRatingCriteria, ClientRatingCriteria } from './constants/rating-criteria';

/**
 * Reviews Service
 *
 * Handles review creation, management, moderation, and reporting
 */
@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly moderationService: ModerationService,
    private readonly ratingCalculationService: RatingCalculationService,
  ) {}

  /**
   * Create a new review
   * Validates order completion, 14-day deadline, and user participation
   */
  async createReview(userId: string, dto: CreateReviewDto) {
    // 1. Validate order exists and is completed
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        client: true,
        contractor: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed orders');
    }

    // 2. Check review deadline (14 days)
    if (!order.completedAt) {
      throw new BadRequestException('Order completion date not found');
    }

    const deadline = calculateReviewDeadline(order.completedAt);
    if (isReviewDeadlinePassed(deadline)) {
      throw new BadRequestException('Review deadline has passed (14 days)');
    }

    // 3. Validate user is part of the order
    const isClient = order.clientId === userId;
    const isContractor = order.contractorId === userId;

    if (!isClient && !isContractor) {
      throw new ForbiddenException('You are not authorized to review this order');
    }

    // 4. Prevent duplicate reviews
    const existingReview = await this.prisma.review.findFirst({
      where: {
        orderId: dto.orderId,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this order');
    }

    // 5. Check for spam (5+ reviews today)
    const isSpam = await this.moderationService.detectSpamReviews(userId);
    if (isSpam) {
      throw new BadRequestException('Too many reviews created today. Please try again tomorrow.');
    }

    // 6. Determine reviewee
    const revieweeId = isClient ? order.contractorId : order.clientId;
    if (!revieweeId) {
      throw new BadRequestException('Order participant not found');
    }

    // 7. Validate criteria based on user type
    const reviewerRole = isClient ? UserRole.CLIENT : UserRole.CONTRACTOR;
    this.validateCriteria(reviewerRole, dto.criteriaRatings);

    // 8. Calculate overall rating
    const rating = this.calculateOverallRating(dto.criteriaRatings);

    // 9. Moderate comment
    let moderationResult: { isModerated: boolean; flags: string[] } = {
      isModerated: false,
      flags: [],
    };
    if (dto.comment) {
      moderationResult = await this.moderationService.moderateReviewContent(
        dto.comment,
      );
    }

    // 10. Create review
    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment: dto.comment,
        criteriaRatings: dto.criteriaRatings as any,
        status: moderationResult.isModerated
          ? ReviewStatus.PENDING
          : ReviewStatus.APPROVED,
        moderationFlags: moderationResult.flags,
        isVisible: !moderationResult.isModerated,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 11. Update rating statistics (async - don't wait)
    this.ratingCalculationService.updateUserRatingStats(revieweeId).catch(
      (error) => {
        this.logger.error(
          `Failed to update rating stats for user ${revieweeId}: ${error.message}`,
        );
      },
    );

    // 12. Update user badges (async - don't wait)
    this.ratingCalculationService.updateUserBadges(revieweeId).catch(
      (error) => {
        this.logger.error(
          `Failed to update badges for user ${revieweeId}: ${error.message}`,
        );
      },
    );

    // 13. Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.REVIEW_CREATED,
      entity: AuditEntity.REVIEW,
      entityId: review.id,
      metadata: {
        orderId: dto.orderId,
        revieweeId,
        rating,
        status: review.status,
      },
    });

    this.logger.log(`Review created: ${review.id} by user ${userId} for order ${dto.orderId}`);

    return review;
  }

  /**
   * Get reviews for a user (contractor or client)
   */
  async getUserReviews(
    userId: string,
    page = 1,
    limit = 20,
    includeHidden = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      revieweeId: userId,
      status: ReviewStatus.APPROVED,
    };

    if (!includeHidden) {
      where.isVisible = true;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
              avatarUrl: true,
            },
          },
          response: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single review by ID
   */
  async getReviewById(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            avatarUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
          },
        },
        response: true,
        order: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Update review (only before moderation approval)
   */
  async updateReview(reviewId: string, userId: string, dto: CreateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot edit approved reviews. Please contact support.',
      );
    }

    // Recalculate rating
    const rating = this.calculateOverallRating(dto.criteriaRatings);

    // Moderate new content
    let moderationResult: { isModerated: boolean; flags: string[] } = {
      isModerated: false,
      flags: [],
    };
    if (dto.comment) {
      moderationResult = await this.moderationService.moderateReviewContent(
        dto.comment,
      );
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: dto.comment,
        criteriaRatings: dto.criteriaRatings as any,
        moderationFlags: moderationResult.flags,
        isEdited: true,
        editedAt: new Date(),
        status: moderationResult.isModerated
          ? ReviewStatus.PENDING
          : ReviewStatus.APPROVED,
        isVisible: !moderationResult.isModerated,
      },
    });

    // Update rating statistics if review was approved
    if (updatedReview.status === ReviewStatus.APPROVED) {
      this.ratingCalculationService.updateUserRatingStats(review.revieweeId).catch(
        (error) => {
          this.logger.error(
            `Failed to update rating stats: ${error.message}`,
          );
        },
      );
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.REVIEW_UPDATED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
    });

    return updatedReview;
  }

  /**
   * Delete review (soft delete)
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isVisible: false,
        status: ReviewStatus.REJECTED,
      },
    });

    // Update rating statistics (recalculate)
    this.ratingCalculationService.updateUserRatingStats(review.revieweeId).catch(
      (error) => {
        this.logger.error(`Failed to update rating stats: ${error.message}`);
      },
    );

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.REVIEW_DELETED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
    });

    return { message: 'Review deleted successfully' };
  }

  /**
   * Create review response (for reviewee)
   */
  async createResponse(reviewId: string, userId: string, content: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { response: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.revieweeId !== userId) {
      throw new ForbiddenException('You can only respond to your own reviews');
    }

    if (review.response) {
      throw new BadRequestException('Response already exists');
    }

    // Moderate response content
    const moderationResult = await this.moderationService.moderateReviewContent(
      content,
    );

    const response = await this.prisma.reviewResponse.create({
      data: {
        reviewId,
        content,
        status: moderationResult.isModerated
          ? ReviewStatus.PENDING
          : ReviewStatus.APPROVED,
        moderationFlags: moderationResult.flags,
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.REVIEW_RESPONSE_CREATED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
    });

    return response;
  }

  /**
   * Report a review
   */
  async reportReview(
    reviewId: string,
    reporterId: string,
    reason: string,
    description?: string,
  ) {
    // Check if already reported by this user
    const existingReport = await this.prisma.reviewReport.findUnique({
      where: {
        reviewId_reporterId: {
          reviewId,
          reporterId,
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this review');
    }

    const report = await this.prisma.reviewReport.create({
      data: {
        reviewId,
        reporterId,
        reason: reason as any,
        description,
      },
    });

    // Update report count
    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        reportCount: { increment: 1 },
      },
    });

    // Auto-suspend if 3+ reports
    if (review.reportCount >= 3) {
      await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          status: ReviewStatus.SUSPENDED,
          isVisible: false,
        },
      });

      this.logger.warn(
        `Review ${reviewId} auto-suspended after ${review.reportCount} reports`,
      );
    }

    // Audit log
    await this.auditService.log({
      userId: reporterId,
      action: AuditAction.REVIEW_REPORTED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
      metadata: {
        reason,
        reportCount: review.reportCount,
      },
    });

    return report;
  }

  /**
   * Get rating statistics for a user
   */
  async getUserRatingStats(userId: string) {
    const stats = await this.prisma.userRatingStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        badges: [],
        weightedScore: 0,
      };
    }

    return stats;
  }

  /**
   * Calculate overall rating from criteria
   */
  private calculateOverallRating(criteriaRatings: any): number {
    const values = Object.values(criteriaRatings) as number[];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    return Number(average.toFixed(2));
  }

  /**
   * Validate criteria based on user role
   */
  private validateCriteria(role: UserRole, criteriaRatings: any) {
    if (role === UserRole.CLIENT) {
      // Client rates contractor (4 criteria)
      const required = [
        ContractorRatingCriteria.QUALITY,
        ContractorRatingCriteria.PROFESSIONALISM,
        ContractorRatingCriteria.COMMUNICATION,
        ContractorRatingCriteria.VALUE,
      ];
      const provided = Object.keys(criteriaRatings);

      if (!required.every((key) => provided.includes(key))) {
        throw new BadRequestException(
          'Contractor review must include: quality, professionalism, communication, value',
        );
      }

      // Validate rating values are 1-5
      required.forEach((key) => {
        const value = criteriaRatings[key];
        if (value < 1 || value > 5 || !Number.isInteger(value)) {
          throw new BadRequestException(
            `Rating for ${key} must be an integer between 1 and 5`,
          );
        }
      });
    } else {
      // Contractor rates client (3 criteria)
      const required = [
        ClientRatingCriteria.COMMUNICATION,
        ClientRatingCriteria.PROFESSIONALISM,
        ClientRatingCriteria.PAYMENT,
      ];
      const provided = Object.keys(criteriaRatings);

      if (!required.every((key) => provided.includes(key))) {
        throw new BadRequestException(
          'Client review must include: communication, professionalism, payment',
        );
      }

      // Validate rating values are 1-5
      required.forEach((key) => {
        const value = criteriaRatings[key];
        if (value < 1 || value > 5 || !Number.isInteger(value)) {
          throw new BadRequestException(
            `Rating for ${key} must be an integer between 1 and 5`,
          );
        }
      });
    }
  }
}

