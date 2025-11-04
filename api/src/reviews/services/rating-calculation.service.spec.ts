import { Test, TestingModule } from '@nestjs/testing';
import { RatingCalculationService } from './rating-calculation.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UserRole, ReviewStatus } from '@prisma/client';

describe('RatingCalculationService', () => {
  let service: RatingCalculationService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
    },
    order: {
      count: jest.fn(),
    },
    userRatingStats: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingCalculationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RatingCalculationService>(RatingCalculationService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('updateUserRatingStats', () => {
    it('should initialize stats with zeros when no reviews', async () => {
      const userId = 'user-1';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        roles: [UserRole.CONTRACTOR],
      });
      mockPrismaService.review.findMany.mockResolvedValue([]);
      mockPrismaService.userRatingStats.upsert.mockResolvedValue({
        userId,
        averageRating: 0,
        totalReviews: 0,
      });

      await service.updateUserRatingStats(userId);

      expect(mockPrismaService.userRatingStats.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          update: expect.objectContaining({
            averageRating: 0,
            totalReviews: 0,
          }),
          create: expect.objectContaining({
            userType: UserRole.CONTRACTOR,
            averageRating: 0,
            totalReviews: 0,
          }),
        }),
      );
    });

    it('should calculate average rating from reviews', async () => {
      const userId = 'user-1';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        roles: [UserRole.CONTRACTOR],
      });
      mockPrismaService.review.findMany.mockResolvedValue([
        {
          id: 'review-1',
          rating: 5,
          criteriaRatings: { quality: 5, professionalism: 5, communication: 5, value: 5 },
        },
        {
          id: 'review-2',
          rating: 4,
          criteriaRatings: { quality: 4, professionalism: 4, communication: 4, value: 4 },
        },
      ]);
      mockPrismaService.userRatingStats.upsert.mockResolvedValue({
        userId,
        averageRating: 4.5,
        totalReviews: 2,
      });

      await service.updateUserRatingStats(userId);

      expect(mockPrismaService.userRatingStats.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          update: expect.objectContaining({
            averageRating: 4.5, // (5+4)/2 = 4.5
            totalReviews: 2,
          }),
        }),
      );
    });
  });

  describe('updateUserBadges', () => {
    it('should assign verified badge if user is verified', async () => {
      const userId = 'user-1';

      mockPrismaService.userRatingStats.findUnique.mockResolvedValue({
        userId,
        averageRating: 4.5,
        totalReviews: 10,
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        isVerified: true,
      });
      mockPrismaService.userRatingStats.update.mockResolvedValue({
        userId,
        badges: ['verified', 'top_pro'],
      });

      await service.updateUserBadges(userId);

      expect(mockPrismaService.userRatingStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          data: expect.objectContaining({
            badges: expect.arrayContaining(['verified']),
          }),
        }),
      );
    });

    it('should assign top_pro badge for high rating and sufficient reviews', async () => {
      const userId = 'user-1';

      mockPrismaService.userRatingStats.findUnique.mockResolvedValue({
        userId,
        averageRating: 4.5,
        totalReviews: 10,
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        isVerified: false,
      });
      mockPrismaService.userRatingStats.update.mockResolvedValue({
        userId,
        badges: ['top_pro'],
      });

      await service.updateUserBadges(userId);

      expect(mockPrismaService.userRatingStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          data: expect.objectContaining({
            badges: expect.arrayContaining(['top_pro']),
          }),
        }),
      );
    });

    it('should assign new badge for users with less than 5 reviews', async () => {
      const userId = 'user-1';

      mockPrismaService.userRatingStats.findUnique.mockResolvedValue({
        userId,
        averageRating: 4.0,
        totalReviews: 3,
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        isVerified: false,
      });
      mockPrismaService.userRatingStats.update.mockResolvedValue({
        userId,
        badges: ['new'],
      });

      await service.updateUserBadges(userId);

      expect(mockPrismaService.userRatingStats.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          data: expect.objectContaining({
            badges: expect.arrayContaining(['new']),
          }),
        }),
      );
    });
  });
});

