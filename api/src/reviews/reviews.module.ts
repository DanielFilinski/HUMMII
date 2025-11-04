import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { RatingCalculationService } from './services/rating-calculation.service';
import { ModerationService } from './services/moderation.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';
import { ChatModule } from '../chat/chat.module';
import { ReviewOwnerGuard } from './guards/review-owner.guard';

/**
 * Reviews Module
 *
 * Provides review and rating functionality:
 * - Two-way rating system (client ↔ contractor)
 * - Multi-criteria ratings
 * - Content moderation
 * - Badge system
 * - Report/flag system
 */
@Module({
  imports: [
    PrismaModule,
    AuditModule,
    ChatModule, // For ContentModerationService
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    RatingCalculationService,
    ModerationService,
    ReviewOwnerGuard,
  ],
  exports: [ReviewsService, RatingCalculationService],
})
export class ReviewsModule {}

