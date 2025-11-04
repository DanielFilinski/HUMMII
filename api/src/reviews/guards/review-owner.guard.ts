import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

/**
 * ReviewOwnerGuard
 *
 * Ensures that the authenticated user is the owner (reviewer) of the review.
 * Used for update and delete operations.
 */
@Injectable()
export class ReviewOwnerGuard implements CanActivate {
  private readonly logger = new Logger(ReviewOwnerGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const reviewId = request.params.id;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    if (!reviewId) {
      this.logger.warn('No reviewId found in request params');
      throw new ForbiddenException('Review ID is required');
    }

    // Fetch review with minimal fields
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        reviewerId: true,
      },
    });

    if (!review) {
      this.logger.warn(`Review not found: ${reviewId}`);
      throw new NotFoundException('Review not found');
    }

    // Check if user is the reviewer
    if (review.reviewerId !== user.id) {
      this.logger.warn(
        `User ${user.id} attempted to access review ${reviewId} without authorization`,
      );
      throw new ForbiddenException('You can only access your own reviews');
    }

    // Attach review to request for potential use in controller
    request.review = review;

    return true;
  }
}

