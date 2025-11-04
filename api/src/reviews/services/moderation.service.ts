import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ContentModerationService } from '../../chat/services/content-moderation.service';
import { ModerationResult } from '../../chat/interfaces/moderation-result.interface';

/**
 * Moderation Service for Reviews
 *
 * Reuses content moderation patterns from chat module
 * Detects profanity, contact info, URLs, social media handles
 */
@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly contentModerationService: ContentModerationService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Moderate review content
   * Returns moderation result with flags
   */
  async moderateReviewContent(content: string): Promise<{
    isModerated: boolean;
    flags: string[];
  }> {
    if (!content || content.trim().length === 0) {
      return { isModerated: false, flags: [] };
    }

    const result: ModerationResult = this.contentModerationService.moderateMessage(content);

    // Convert ModerationFlag enum to string array
    const flags = result.flags.map((flag) => flag.toString());

    return {
      isModerated: result.isModerated,
      flags,
    };
  }

  /**
   * Detect spam reviews (multiple reviews same day)
   * Returns true if user has created 5+ reviews today
   */
  async detectSpamReviews(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reviewsToday = await this.prisma.review.count({
      where: {
        reviewerId: userId,
        createdAt: {
          gte: today,
        },
      },
    });

    const isSpam = reviewsToday >= 5;

    if (isSpam) {
      this.logger.warn(`Spam detected: User ${userId} created ${reviewsToday} reviews today`);
    }

    return isSpam;
  }
}

