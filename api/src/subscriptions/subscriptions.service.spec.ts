import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { STRIPE_PROVIDER } from './providers/stripe.provider';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;
  let configService: ConfigService;
  let stripe: Stripe | null;

  const mockPrismaService = {
    contractor: {
      findUnique: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        STRIPE_PRICE_STANDARD: 'price_standard',
        STRIPE_PRICE_PROFESSIONAL: 'price_professional',
        STRIPE_PRICE_ADVANCED: 'price_advanced',
      };
      return config[key];
    }),
  };

  const mockStripe = {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      retrieve: jest.fn(),
    },
  };

  const mockContractor = {
    id: 'contractor-1',
    userId: 'user-1',
    bio: 'Test contractor',
  };

  const mockSubscription = {
    id: 'subscription-1',
    contractorId: 'contractor-1',
    tier: SubscriptionTier.STANDARD,
    status: SubscriptionStatus.ACTIVE,
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: STRIPE_PROVIDER, useValue: mockStripe },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    stripe = module.get<Stripe | null>(STRIPE_PROVIDER);

    jest.clearAllMocks();
  });

  describe('getSubscription', () => {
    it('should return subscription for contractor', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        subscription: mockSubscription,
      });

      const result = await service.getSubscription('user-1');

      expect(result).toEqual(mockSubscription);
      expect(mockPrismaService.contractor.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return FREE tier placeholder if no subscription exists', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        subscription: null,
      });

      const result = await service.getSubscription('user-1');

      expect(result.tier).toBe(SubscriptionTier.FREE);
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.stripeSubscriptionId).toBeNull();
    });

    it('should throw NotFoundException if contractor not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(service.getSubscription('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSubscription', () => {
    it('should throw ServiceUnavailableException if Stripe not configured', async () => {
      const moduleWithoutStripe: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: ConfigService, useValue: mockConfigService },
          { provide: STRIPE_PROVIDER, useValue: null },
        ],
      }).compile();

      const serviceWithoutStripe = moduleWithoutStripe.get<SubscriptionsService>(
        SubscriptionsService,
      );

      await expect(
        serviceWithoutStripe.createSubscription('user-1', {
          tier: SubscriptionTier.STANDARD,
        }),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw BadRequestException if trying to create FREE tier', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.createSubscription('user-1', {
          tier: SubscriptionTier.FREE,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if active subscription already exists', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

      await expect(
        service.createSubscription('user-1', {
          tier: SubscriptionTier.STANDARD,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('upgradeSubscription', () => {
    it('should throw ServiceUnavailableException if Stripe not configured', async () => {
      const moduleWithoutStripe: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: ConfigService, useValue: mockConfigService },
          { provide: STRIPE_PROVIDER, useValue: null },
        ],
      }).compile();

      const serviceWithoutStripe = moduleWithoutStripe.get<SubscriptionsService>(
        SubscriptionsService,
      );

      await expect(
        serviceWithoutStripe.upgradeSubscription('user-1', {
          tier: SubscriptionTier.PROFESSIONAL,
        }),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw NotFoundException if subscription not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        subscription: null,
      });

      await expect(
        service.upgradeSubscription('user-1', {
          tier: SubscriptionTier.PROFESSIONAL,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('downgradeSubscription', () => {
    it('should throw ServiceUnavailableException if Stripe not configured', async () => {
      const moduleWithoutStripe: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: ConfigService, useValue: mockConfigService },
          { provide: STRIPE_PROVIDER, useValue: null },
        ],
      }).compile();

      const serviceWithoutStripe = moduleWithoutStripe.get<SubscriptionsService>(
        SubscriptionsService,
      );

      await expect(
        serviceWithoutStripe.downgradeSubscription('user-1', {
          tier: SubscriptionTier.STANDARD,
          immediate: false,
        }),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('cancelSubscription', () => {
    it('should throw ServiceUnavailableException if Stripe not configured', async () => {
      const moduleWithoutStripe: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: ConfigService, useValue: mockConfigService },
          { provide: STRIPE_PROVIDER, useValue: null },
        ],
      }).compile();

      const serviceWithoutStripe = moduleWithoutStripe.get<SubscriptionsService>(
        SubscriptionsService,
      );

      await expect(
        serviceWithoutStripe.cancelSubscription('user-1', {
          immediate: false,
        }),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('reactivateSubscription', () => {
    it('should throw ServiceUnavailableException if Stripe not configured', async () => {
      const moduleWithoutStripe: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: mockPrismaService },
          { provide: ConfigService, useValue: mockConfigService },
          { provide: STRIPE_PROVIDER, useValue: null },
        ],
      }).compile();

      const serviceWithoutStripe = moduleWithoutStripe.get<SubscriptionsService>(
        SubscriptionsService,
      );

      await expect(serviceWithoutStripe.reactivateSubscription('user-1')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});

