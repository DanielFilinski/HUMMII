# Phase 5: Reviews & Ratings Module - Detailed Implementation Plan

**Timeline:** Week 11-12 (2 weeks)  
**Priority:** 🔴 CRITICAL  
**Dependencies:** Phase 3 (Orders Module), Phase 2 (User Management)  
**Status:** Not Started

---

## 📋 Overview

Phase 5 implements a comprehensive two-way review and rating system that allows clients and contractors to evaluate each other after order completion. The module includes multi-criteria ratings, weighted scoring algorithms, automatic and manual moderation, and analytics to maintain platform quality and trust.

### Business Requirements

- Two-way rating system (client ↔ contractor)
- Multi-criteria evaluation for quality assessment
- 14-day window for review submission
- Verified review badges for completed orders
- Review moderation to prevent abuse
- Rating-based visibility and ranking
- Badge system for top performers

### Technical Stack

- **Storage:** PostgreSQL for reviews and ratings
- **Moderation:** Regex filters + profanity detection
- **Analytics:** Aggregation queries for rating statistics
- **Caching:** Redis for rating calculations

### Security & Compliance

- Review authenticity verification (only after order completion)
- Content moderation (profanity, contact info)
- Spam detection (multiple reviews same day)
- Report/flag system for inappropriate reviews
- PIPEDA compliance for review data export
- Audit logging for all moderation actions

---

## 🎯 Main Tasks

### Task 1: Reviews Module Setup
- [ ] **1.1** Design Prisma schema for Review and Rating entities
- [ ] **1.2** Create reviews module structure
- [ ] **1.3** Setup review DTOs with validation
- [ ] **1.4** Create review service with business logic
- [ ] **1.5** Implement review controller with REST endpoints
- [ ] **1.6** Add review guards and permissions
- [ ] **1.7** Write unit tests for review module
- [ ] **1.8** Create database migration for reviews

### Task 2: Rating System Implementation
- [ ] **2.1** Create multi-criteria rating structure
- [ ] **2.2** Implement contractor rating (4 criteria)
- [ ] **2.3** Implement client rating (3 criteria)
- [ ] **2.4** Build weighted rating calculation algorithm
- [ ] **2.5** Create overall rating aggregation service
- [ ] **2.6** Implement rating distribution calculation
- [ ] **2.7** Build rating history tracking
- [ ] **2.8** Create rating statistics endpoints
- [ ] **2.9** Write tests for rating calculations

### Task 3: Review Creation & Management
- [ ] **3.1** Implement review creation endpoint
- [ ] **3.2** Validate order completion status
- [ ] **3.3** Enforce 14-day submission window
- [ ] **3.4** Prevent duplicate reviews
- [ ] **3.5** Create review update endpoint (before moderation)
- [ ] **3.6** Build review deletion (soft delete)
- [ ] **3.7** Implement review response functionality
- [ ] **3.8** Create review visibility rules
- [ ] **3.9** Write E2E tests for review flow

### Task 4: Review Moderation System
- [ ] **4.1** Create moderation service architecture
- [ ] **4.2** Implement profanity filter (EN + FR)
- [ ] **4.3** Build contact information detection
- [ ] **4.4** Create spam detection logic
- [ ] **4.5** Implement automatic moderation rules
- [ ] **4.6** Build manual moderation queue
- [ ] **4.7** Create admin moderation endpoints
- [ ] **4.8** Implement review approval/rejection workflow
- [ ] **4.9** Build moderation logging and analytics
- [ ] **4.10** Write moderation accuracy tests

### Task 5: Review Reporting & Flagging
- [ ] **5.1** Create report/flag system
- [ ] **5.2** Implement report reasons (spam, inappropriate, etc.)
- [ ] **5.3** Build report aggregation logic
- [ ] **5.4** Create auto-suspend threshold (3 reports)
- [ ] **5.5** Implement admin review queue for reports
- [ ] **5.6** Build report resolution workflow
- [ ] **5.7** Create notification system for reports
- [ ] **5.8** Write tests for reporting system

### Task 6: Badge System & Visibility
- [ ] **6.1** Design badge types (Verified, Top Pro, New)
- [ ] **6.2** Implement badge calculation logic
- [ ] **6.3** Create badge assignment service
- [ ] **6.4** Build profile visibility algorithm (min 3.0⭐)
- [ ] **6.5** Implement ranking system based on ratings
- [ ] **6.6** Create badge display endpoints
- [ ] **6.7** Build badge analytics
- [ ] **6.8** Write tests for badge system

### Task 7: Analytics & Reporting
- [ ] **7.1** Create rating distribution charts
- [ ] **7.2** Build rating trends over time
- [ ] **7.3** Implement review statistics dashboard
- [ ] **7.4** Create contractor performance analytics
- [ ] **7.5** Build review moderation metrics
- [ ] **7.6** Implement PIPEDA data export for reviews
- [ ] **7.7** Write analytics query tests

---

## 📊 Database Schema

### Prisma Models

```prisma
// prisma/schema.prisma

model Review {
  id        String   @id @default(uuid())
  orderId   String   @unique
  
  // Participants
  reviewerId String  // User who leaves review
  revieweeId String  // User being reviewed
  
  // Content
  rating    Decimal  @db.Decimal(3, 2) // Overall rating (1.00 - 5.00)
  comment   String?  @db.Text
  
  // Criteria ratings (stored separately for flexibility)
  criteriaRatings Json // { quality: 5, professionalism: 4, ... }
  
  // Moderation
  status    ReviewStatus @default(PENDING)
  moderationFlags String[] // ['profanity', 'contact_info', etc.]
  moderatedAt DateTime?
  moderatedBy String?
  moderationNotes String? @db.Text
  
  // Metadata
  isEdited  Boolean  @default(false)
  editedAt  DateTime?
  isVisible Boolean  @default(true)
  
  // Response
  response  ReviewResponse?
  
  // Reports
  reports   ReviewReport[]
  reportCount Int @default(0)
  
  // Relationships
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  reviewer  User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewee  User     @relation("ReviewsReceived", fields: [revieweeId], references: [id])
  moderator User?    @relation("ReviewsModerated", fields: [moderatedBy], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([revieweeId, status])
  @@index([reviewerId])
  @@index([orderId])
  @@index([status])
  @@index([createdAt])
}

enum ReviewStatus {
  PENDING       // Awaiting moderation
  APPROVED      // Passed moderation, visible
  REJECTED      // Failed moderation, hidden
  FLAGGED       // Reported by users
  SUSPENDED     // Auto-suspended (3+ reports)
}

model ReviewResponse {
  id        String   @id @default(uuid())
  reviewId  String   @unique
  
  // Content
  content   String   @db.Text
  
  // Moderation
  status    ReviewStatus @default(PENDING)
  moderationFlags String[]
  moderatedAt DateTime?
  
  // Relationships
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([reviewId])
}

model ReviewReport {
  id        String   @id @default(uuid())
  reviewId  String
  reporterId String
  
  // Report details
  reason    ReportReason
  description String? @db.Text
  
  // Status
  status    ReportStatus @default(PENDING)
  reviewedBy String?
  reviewedAt DateTime?
  resolution String? @db.Text
  
  // Relationships
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reporter  User     @relation("ReportsGiven", fields: [reporterId], references: [id])
  reviewer  User?    @relation("ReportsReviewed", fields: [reviewedBy], references: [id])
  
  createdAt DateTime @default(now())
  
  @@unique([reviewId, reporterId])
  @@index([status])
  @@index([reviewId])
}

enum ReportReason {
  SPAM
  INAPPROPRIATE
  FAKE
  OFFENSIVE
  CONTACT_INFO
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  ACTIONED
  DISMISSED
}

model UserRatingStats {
  id        String   @id @default(uuid())
  userId    String   @unique
  userType  UserRole // CLIENT or CONTRACTOR
  
  // Overall statistics
  averageRating Decimal @db.Decimal(3, 2) @default(0.00)
  totalReviews  Int     @default(0)
  
  // Contractor-specific criteria averages
  avgQuality         Decimal? @db.Decimal(3, 2)
  avgProfessionalism Decimal? @db.Decimal(3, 2)
  avgCommunication   Decimal? @db.Decimal(3, 2)
  avgValue           Decimal? @db.Decimal(3, 2)
  
  // Client-specific criteria averages
  avgPayment         Decimal? @db.Decimal(3, 2)
  
  // Rating distribution (count of 1-5 star reviews)
  ratingDistribution Json // { "5": 10, "4": 5, "3": 2, "2": 0, "1": 0 }
  
  // Badges
  badges    String[] // ['verified', 'top_pro', 'new']
  
  // Weighted score (for ranking)
  weightedScore Decimal @db.Decimal(5, 2) @default(0.00)
  
  // Relationships
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  updatedAt DateTime @updatedAt
  
  @@index([averageRating])
  @@index([weightedScore])
  @@index([userId])
}

// Add to existing Order model
model Order {
  // ... existing fields
  
  // Review relationship
  review    Review?
  
  // Review eligibility
  isReviewEligible Boolean @default(false)
  reviewDeadline   DateTime?
}

// Add to existing User model
model User {
  // ... existing fields
  
  // Reviews
  reviewsGiven     Review[] @relation("ReviewsGiven")
  reviewsReceived  Review[] @relation("ReviewsReceived")
  reviewsModerated Review[] @relation("ReviewsModerated")
  
  // Reports
  reportsGiven     ReviewReport[] @relation("ReportsGiven")
  reportsReviewed  ReviewReport[] @relation("ReportsReviewed")
  
  // Rating statistics
  ratingStats      UserRatingStats?
}
```

---

## 🔧 Implementation Details

### 1. Rating Criteria Definition

```typescript
// src/reviews/constants/rating-criteria.ts

export const ContractorRatingCriteria = {
  QUALITY: 'quality',
  PROFESSIONALISM: 'professionalism',
  COMMUNICATION: 'communication',
  VALUE: 'value',
} as const;

export const ClientRatingCriteria = {
  COMMUNICATION: 'communication',
  PROFESSIONALISM: 'professionalism',
  PAYMENT: 'payment',
} as const;

export interface ContractorRatings {
  quality: number;         // 1-5
  professionalism: number; // 1-5
  communication: number;   // 1-5
  value: number;          // 1-5
}

export interface ClientRatings {
  communication: number;   // 1-5
  professionalism: number; // 1-5
  payment: number;        // 1-5
}

// Weighted formula constants
export const RATING_WEIGHTS = {
  RATING_SCORE: 0.70,      // 70%
  EXPERIENCE: 0.20,        // 20% (based on completed orders)
  VERIFICATION: 0.10,      // 10% (Stripe verified, etc.)
};

// Minimum thresholds
export const MIN_VISIBLE_RATING = 3.0;  // Profiles below 3.0⭐ hidden
export const MIN_REVIEWS_FOR_BADGE = 5; // Minimum reviews for Top Pro badge
export const TOP_PRO_MIN_RATING = 4.5;  // Minimum rating for Top Pro badge
```

---

### 2. DTOs

```typescript
// src/reviews/dto/create-review.dto.ts

import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContractorRatingsDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  quality: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  communication: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;
}

export class ClientRatingsDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  communication: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  payment: number;
}

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object) // Will be validated based on user type
  criteriaRatings: ContractorRatingsDto | ClientRatingsDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Review comment cannot exceed 1000 characters' })
  comment?: string;
}
```

```typescript
// src/reviews/dto/update-review.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

// For admin moderation
export class ModerateReviewDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @IsOptional()
  @IsString()
  moderationNotes?: string;
}
```

```typescript
// src/reviews/dto/report-review.dto.ts

import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ReportReason } from '@prisma/client';

export class ReportReviewDto {
  @IsUUID()
  reviewId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

```typescript
// src/reviews/dto/review-response.dto.ts

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReviewResponseDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: 'Response cannot exceed 500 characters' })
  content: string;
}
```

---

### 3. Review Service

```typescript
// src/reviews/reviews.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { ReviewStatus, UserRole } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';
import { ModerationService } from './moderation.service';
import { RatingCalculationService } from './rating-calculation.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService,
    private ratingCalculationService: RatingCalculationService,
  ) {}

  /**
   * Create a new review
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

    if (order.status !== 'COMPLETED') {
      throw new BadRequestException('Can only review completed orders');
    }

    // 2. Check review deadline (14 days)
    const completedDate = order.completedAt;
    const deadline = new Date(completedDate);
    deadline.setDate(deadline.getDate() + 14);

    if (new Date() > deadline) {
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

    // 5. Determine reviewee
    const revieweeId = isClient ? order.contractorId : order.clientId;

    // 6. Validate criteria based on user type
    const reviewerRole = isClient ? UserRole.CLIENT : UserRole.CONTRACTOR;
    this.validateCriteria(reviewerRole, dto.criteriaRatings);

    // 7. Calculate overall rating
    const rating = this.calculateOverallRating(dto.criteriaRatings);

    // 8. Moderate comment
    let moderationResult = { isModerated: false, flags: [] };
    if (dto.comment) {
      moderationResult = await this.moderationService.moderateReviewContent(
        dto.comment,
      );
    }

    // 9. Create review
    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment: dto.comment,
        criteriaRatings: dto.criteriaRatings,
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
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // 10. Update rating statistics
    await this.ratingCalculationService.updateUserRatingStats(revieweeId);

    // 11. Update user badges
    await this.ratingCalculationService.updateUserBadges(revieweeId);

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
              firstName: true,
              lastName: true,
              avatar: true,
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
    let moderationResult = { isModerated: false, flags: [] };
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
        criteriaRatings: dto.criteriaRatings,
        moderationFlags: moderationResult.flags,
        isEdited: true,
        editedAt: new Date(),
      },
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

    // Update rating statistics
    await this.ratingCalculationService.updateUserRatingStats(review.revieweeId);
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

      // TODO: Notify admins
    }

    return report;
  }

  /**
   * Calculate overall rating from criteria
   */
  private calculateOverallRating(criteriaRatings: any): number {
    const values = Object.values(criteriaRatings) as number[];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    return Math.round(average * 100) / 100; // Round to 2 decimals
  }

  /**
   * Validate criteria based on user role
   */
  private validateCriteria(role: UserRole, criteriaRatings: any) {
    if (role === UserRole.CLIENT) {
      // Client rates contractor (4 criteria)
      const required = ['quality', 'professionalism', 'communication', 'value'];
      const provided = Object.keys(criteriaRatings);

      if (!required.every(key => provided.includes(key))) {
        throw new BadRequestException(
          'Contractor review must include: quality, professionalism, communication, value',
        );
      }
    } else {
      // Contractor rates client (3 criteria)
      const required = ['communication', 'professionalism', 'payment'];
      const provided = Object.keys(criteriaRatings);

      if (!required.every(key => provided.includes(key))) {
        throw new BadRequestException(
          'Client review must include: communication, professionalism, payment',
        );
      }
    }
  }
}
```

---

### 4. Rating Calculation Service

```typescript
// src/reviews/rating-calculation.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import {
  RATING_WEIGHTS,
  MIN_REVIEWS_FOR_BADGE,
  TOP_PRO_MIN_RATING,
} from './constants/rating-criteria';

@Injectable()
export class RatingCalculationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update user rating statistics
   */
  async updateUserRatingStats(userId: string) {
    // Get user type
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    // Get all approved reviews for this user
    const reviews = await this.prisma.review.findMany({
      where: {
        revieweeId: userId,
        status: 'APPROVED',
        isVisible: true,
      },
    });

    if (reviews.length === 0) {
      // No reviews yet
      await this.prisma.userRatingStats.upsert({
        where: { userId },
        update: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
        },
        create: {
          userId,
          userType: user.role,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
        },
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    const averageRating = totalRating / reviews.length;

    // Calculate criteria averages
    const criteriaAverages = this.calculateCriteriaAverages(reviews);

    // Calculate rating distribution
    const distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
    reviews.forEach(review => {
      const rounded = Math.round(Number(review.rating));
      distribution[rounded] = (distribution[rounded] || 0) + 1;
    });

    // Calculate weighted score
    const weightedScore = await this.calculateWeightedScore(
      userId,
      averageRating,
    );

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
        userType: user.role,
        averageRating,
        totalReviews: reviews.length,
        ...criteriaAverages,
        ratingDistribution: distribution,
        weightedScore,
      },
    });
  }

  /**
   * Calculate criteria averages
   */
  private calculateCriteriaAverages(reviews: any[]) {
    const criteriaSum: any = {};
    const criteriaCounts: any = {};

    reviews.forEach(review => {
      const criteria = review.criteriaRatings as any;
      Object.entries(criteria).forEach(([key, value]) => {
        criteriaSum[key] = (criteriaSum[key] || 0) + (value as number);
        criteriaCounts[key] = (criteriaCounts[key] || 0) + 1;
      });
    });

    const averages: any = {};
    Object.entries(criteriaSum).forEach(([key, sum]) => {
      averages[`avg${key.charAt(0).toUpperCase()}${key.slice(1)}`] =
        (sum as number) / criteriaCounts[key];
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
    const experienceScore = Math.min(completedOrders / 20, 5.0);

    // Verification score (5.0 if verified, 0 if not)
    const verificationScore = user.isVerified ? 5.0 : 0;

    // Calculate weighted score
    const weightedScore =
      averageRating * RATING_WEIGHTS.RATING_SCORE +
      experienceScore * RATING_WEIGHTS.EXPERIENCE +
      verificationScore * RATING_WEIGHTS.VERIFICATION;

    return Math.round(weightedScore * 100) / 100;
  }

  /**
   * Update user badges
   */
  async updateUserBadges(userId: string) {
    const stats = await this.prisma.userRatingStats.findUnique({
      where: { userId },
    });

    if (!stats) return;

    const badges: string[] = [];

    // Verified badge (Stripe Identity)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    if (user.isVerified) {
      badges.push('verified');
    }

    // Top Pro badge (4.5+ rating, 5+ reviews)
    if (
      stats.averageRating >= TOP_PRO_MIN_RATING &&
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
  }

  /**
   * Get rating distribution for a user
   */
  async getRatingDistribution(userId: string) {
    const stats = await this.prisma.userRatingStats.findUnique({
      where: { userId },
    });

    return stats?.ratingDistribution || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  }
}
```

---

### 5. Moderation Service

```typescript
// src/reviews/moderation.service.ts

import { Injectable } from '@nestjs/common';

interface ModerationResult {
  isModerated: boolean;
  flags: string[];
}

@Injectable()
export class ModerationService {
  // Profanity lists (basic - use external library for production)
  private readonly profanityList = [
    'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard',
    // French profanity
    'merde', 'putain', 'connard', 'salope',
    // Add comprehensive list
  ];

  // Contact patterns
  private readonly patterns = {
    phone: /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    url: /https?:\/\/[^\s]+/g,
    socialMedia: /@(instagram|facebook|twitter|telegram|whatsapp|snapchat|tiktok|linkedin)[^\s]*/gi,
  };

  /**
   * Moderate review content
   */
  async moderateReviewContent(content: string): Promise<ModerationResult> {
    const flags: string[] = [];

    // 1. Check for profanity
    const hasProfanity = this.profanityList.some(word =>
      new RegExp(`\\b${word}\\b`, 'i').test(content.toLowerCase())
    );

    if (hasProfanity) {
      flags.push('profanity');
    }

    // 2. Check for phone numbers
    if (this.patterns.phone.test(content)) {
      flags.push('phone');
    }

    // 3. Check for email addresses
    if (this.patterns.email.test(content)) {
      flags.push('email');
    }

    // 4. Check for URLs
    if (this.patterns.url.test(content)) {
      flags.push('url');
    }

    // 5. Check for social media
    if (this.patterns.socialMedia.test(content)) {
      flags.push('social_media');
    }

    const isModerated = flags.length > 0;

    return { isModerated, flags };
  }

  /**
   * Detect spam reviews (multiple reviews same day)
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

    return reviewsToday >= 5; // Flag if 5+ reviews in one day
  }
}
```

---

### 6. Reviews Controller

```typescript
// src/reviews/reviews.controller.ts

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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { CreateReviewResponseDto } from './dto/review-response.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * POST /reviews - Create a new review
   */
  @Post()
  async createReview(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

  /**
   * GET /reviews/user/:userId - Get reviews for a user
   */
  @Get('user/:userId')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.reviewsService.getUserReviews(userId, +page, +limit);
  }

  /**
   * GET /reviews/:id - Get single review
   */
  @Get(':id')
  async getReview(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  /**
   * PATCH /reviews/:id - Update review
   */
  @Patch(':id')
  async updateReview(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, req.user.id, dto);
  }

  /**
   * DELETE /reviews/:id - Delete review
   */
  @Delete(':id')
  async deleteReview(@Request() req, @Param('id') id: string) {
    return this.reviewsService.deleteReview(id, req.user.id);
  }

  /**
   * POST /reviews/:id/response - Create response to review
   */
  @Post(':id/response')
  async createResponse(
    @Request() req,
    @Param('id') reviewId: string,
    @Body() dto: CreateReviewResponseDto,
  ) {
    return this.reviewsService.createResponse(
      reviewId,
      req.user.id,
      dto.content,
    );
  }

  /**
   * POST /reviews/:id/report - Report a review
   */
  @Post(':id/report')
  async reportReview(
    @Request() req,
    @Param('id') reviewId: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(
      reviewId,
      req.user.id,
      dto.reason,
      dto.description,
    );
  }

  /**
   * GET /reviews/stats/:userId - Get rating statistics for a user
   */
  @Get('stats/:userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.reviewsService.getUserRatingStats(userId);
  }
}
```

---

## 🔒 Security Requirements

### Review Authenticity
- Only allow reviews after order completion
- Enforce 14-day submission window
- Prevent duplicate reviews
- Verify user participation in order

### Content Moderation
- Automatic profanity detection
- Contact information blocking
- URL filtering
- Spam detection (5+ reviews/day)

### Rate Limiting
```typescript
@RateLimit({ points: 5, duration: 3600 }) // 5 reviews per hour
@Post()
async createReview(...) {
  // ...
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/reviews/reviews.service.spec.ts

describe('ReviewsService', () => {
  describe('createReview', () => {
    it('should create review for completed order', async () => {
      // Test implementation
    });

    it('should reject review for non-completed order', async () => {
      // Test implementation
    });

    it('should reject duplicate reviews', async () => {
      // Test implementation
    });

    it('should enforce 14-day deadline', async () => {
      // Test implementation
    });

    it('should moderate inappropriate content', async () => {
      // Test implementation
    });
  });

  describe('calculateOverallRating', () => {
    it('should calculate average correctly', () => {
      const ratings = { quality: 5, professionalism: 4, communication: 5, value: 4 };
      const result = service['calculateOverallRating'](ratings);
      expect(result).toBe(4.5);
    });
  });
});
```

### E2E Tests

```typescript
// test/reviews.e2e-spec.ts

describe('Reviews E2E', () => {
  it('should create review after order completion', async () => {
    // Complete an order
    // Submit review
    // Verify review created
    // Verify rating stats updated
  });

  it('should prevent review before order completion', async () => {
    // Attempt to review active order
    // Expect 400 error
  });

  it('should auto-suspend review after 3 reports', async () => {
    // Create review
    // Report 3 times
    // Verify status = SUSPENDED
  });
});
```

---

## 📝 Deliverables

### Code Deliverables
- [ ] Reviews module with full CRUD
- [ ] Rating calculation service
- [ ] Moderation service
- [ ] Badge system
- [ ] Report/flag system
- [ ] REST API endpoints
- [ ] Admin moderation queue

### Database Deliverables
- [ ] Review, ReviewResponse models
- [ ] ReviewReport model
- [ ] UserRatingStats model
- [ ] Database migrations

### Testing Deliverables
- [ ] Unit tests (80%+ coverage)
- [ ] E2E tests for review flow
- [ ] Moderation accuracy tests
- [ ] Rating calculation tests

### Documentation Deliverables
- [ ] API documentation (Swagger)
- [ ] Rating algorithm documentation
- [ ] Moderation rules guide
- [ ] Badge criteria documentation

---

## 🔗 Integration Points

### With Orders Module
- Review eligibility set on order completion
- 14-day deadline calculated from `completedAt`
- Review access restricted to order participants

### With User Management
- Rating stats displayed on profiles
- Badges shown on contractor cards
- Profile visibility based on rating (min 3.0⭐)

### With Admin Panel
- Moderation queue for flagged reviews
- Report management interface
- Rating analytics dashboard

---

## 📈 Success Metrics

- Review submission rate: 40%+ of completed orders
- Moderation accuracy: 95%+ for inappropriate content
- Average response time to reviews: <24 hours
- Badge accuracy: 100% calculation correctness
- Zero fake reviews in production

---

## 🚀 Next Steps

After completing Phase 5, proceed to:
- **Phase 6:** Payments Module (Stripe Integration)
- **Phase 7:** Disputes Module

---

**End of Phase 5 Detailed Plan**
