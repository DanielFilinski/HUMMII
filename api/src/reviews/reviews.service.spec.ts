import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { ModerationService } from './services/moderation.service';
import { RatingCalculationService } from './services/rating-calculation.service';
import { OrderStatus, ReviewStatus, UserRole } from '@prisma/client';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;
  let auditService: AuditService;
  let moderationService: ModerationService;
  let ratingCalculationService: RatingCalculationService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
    },
    review: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockModerationService = {
    moderateReviewContent: jest.fn(),
    detectSpamReviews: jest.fn(),
  };

  const mockRatingCalculationService = {
    updateUserRatingStats: jest.fn(),
    updateUserBadges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: ModerationService,
          useValue: mockModerationService,
        },
        {
          provide: RatingCalculationService,
          useValue: mockRatingCalculationService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
    moderationService = module.get<ModerationService>(ModerationService);
    ratingCalculationService = module.get<RatingCalculationService>(
      RatingCalculationService,
    );

    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const userId = 'user-1';
    const orderId = 'order-1';
    const contractorId = 'contractor-1';
    const clientId = 'client-1';

    const createReviewDto = {
      orderId,
      criteriaRatings: {
        quality: 5,
        professionalism: 4,
        communication: 5,
        value: 4,
      },
      comment: 'Great work!',
    };

    const mockOrder = {
      id: orderId,
      status: OrderStatus.COMPLETED,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      clientId,
      contractorId,
      client: { id: clientId },
      contractor: { id: contractorId },
    };

    it('should create review for completed order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.review.findFirst.mockResolvedValue(null);
      mockModerationService.detectSpamReviews.mockResolvedValue(false);
      mockModerationService.moderateReviewContent.mockResolvedValue({
        isModerated: false,
        flags: [],
      });
      mockPrismaService.review.create.mockResolvedValue({
        id: 'review-1',
        orderId,
        reviewerId: userId,
        revieweeId: contractorId,
        rating: 4.5,
        comment: createReviewDto.comment,
        status: ReviewStatus.APPROVED,
        isVisible: true,
      });

      const result = await service.createReview(userId, createReviewDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.review.create).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should reject review for non-completed order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.IN_PROGRESS,
      });

      await expect(service.createReview(userId, createReviewDto)).rejects.toThrow(
        'Can only review completed orders',
      );
    });

    it('should reject duplicate reviews', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.review.findFirst.mockResolvedValue({
        id: 'existing-review',
      });

      await expect(service.createReview(userId, createReviewDto)).rejects.toThrow(
        'You have already reviewed this order',
      );
    });

    it('should enforce 14-day deadline', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      });

      await expect(service.createReview(userId, createReviewDto)).rejects.toThrow(
        'Review deadline has passed',
      );
    });
  });

  describe('calculateOverallRating', () => {
    it('should calculate average correctly', () => {
      const criteriaRatings = {
        quality: 5,
        professionalism: 4,
        communication: 5,
        value: 4,
      };

      // Access private method for testing
      const result = (service as any).calculateOverallRating(criteriaRatings);

      expect(result).toBe(4.5); // (5+4+5+4)/4 = 4.5
    });
  });

  describe('getUserReviews', () => {
    it('should return paginated reviews', async () => {
      const userId = 'user-1';
      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Great!',
          reviewer: { id: 'reviewer-1', name: 'John' },
        },
      ];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);
      mockPrismaService.review.count.mockResolvedValue(1);

      const result = await service.getUserReviews(userId, 1, 20);

      expect(result.data).toEqual(mockReviews);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });
});

