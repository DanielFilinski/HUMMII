import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewOwnerGuard } from './guards/review-owner.guard';
import { OrderParticipantGuard } from '../chat/guards/order-participant.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { CreateReviewResponseDto } from './dto/create-review-response.dto';
import { ReviewQueryDto } from './dto/review-query.dto';

interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * POST /reviews - Create a new review
   */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 reviews per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create review',
    description:
      'Create a new review for a completed order. Only participants can review. 14-day deadline applies.',
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Order not completed, deadline passed, or duplicate review',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to review this order',
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createReview(
    @Request() req: { user: JwtPayload },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.userId, dto);
  }

  /**
   * GET /reviews/user/:userId - Get reviews for a user
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user reviews',
    description: 'Get all reviews for a user (contractor or client) with pagination',
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  async getUserReviews(
    @Param('userId') userId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewsService.getUserReviews(
      userId,
      query.page,
      query.limit,
      query.includeHidden,
    );
  }

  /**
   * GET /reviews/:id - Get single review
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get review by ID',
    description: 'Get a single review with all details',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async getReview(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  /**
   * PATCH /reviews/:id - Update review
   */
  @Patch(':id')
  @UseGuards(ReviewOwnerGuard)
  @ApiOperation({
    summary: 'Update review',
    description: 'Update review before moderation approval. Cannot edit approved reviews.',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot edit approved reviews',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to edit this review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async updateReview(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, req.user.userId, dto as CreateReviewDto);
  }

  /**
   * DELETE /reviews/:id - Delete review
   */
  @Delete(':id')
  @UseGuards(ReviewOwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete review',
    description: 'Soft delete a review (sets isVisible to false)',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to delete this review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async deleteReview(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.reviewsService.deleteReview(id, req.user.userId);
  }

  /**
   * POST /reviews/:id/response - Create response to review
   */
  @Post(':id/response')
  @ApiOperation({
    summary: 'Respond to review',
    description: 'Create a response to a review (for reviewee only)',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({
    status: 201,
    description: 'Response created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Response already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to respond to this review',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async createResponse(
    @Request() req: { user: JwtPayload },
    @Param('id') reviewId: string,
    @Body() dto: CreateReviewResponseDto,
  ) {
    return this.reviewsService.createResponse(
      reviewId,
      req.user.userId,
      dto.content,
    );
  }

  /**
   * POST /reviews/:id/report - Report a review
   */
  @Post(':id/report')
  @Throttle({ default: { limit: 10, ttl: 86400000 } }) // 10 reports per day
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Report review',
    description: 'Report inappropriate review. Auto-suspends after 3 reports.',
  })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({
    status: 201,
    description: 'Review reported successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Already reported this review',
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async reportReview(
    @Request() req: { user: JwtPayload },
    @Param('id') reviewId: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(
      reviewId,
      req.user.userId,
      dto.reason,
      dto.description,
    );
  }

  /**
   * GET /reviews/stats/:userId - Get rating statistics for a user
   */
  @Get('stats/:userId')
  @ApiOperation({
    summary: 'Get rating statistics',
    description: 'Get rating statistics including average, distribution, badges, and weighted score',
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Rating statistics retrieved successfully',
  })
  async getUserStats(@Param('userId') userId: string) {
    return this.reviewsService.getUserRatingStats(userId);
  }
}
