import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { getTierLimits, TIER_LIMITS } from '../config/tier-limits.config';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class FeatureGateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get subscription tier for a contractor
   * Returns FREE if no subscription exists
   */
  async getContractorTier(contractorId: string): Promise<SubscriptionTier> {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: { subscription: true },
    });

    if (!contractor) {
      throw new Error('Contractor not found');
    }

    return contractor.subscription?.tier || SubscriptionTier.FREE;
  }

  /**
   * Check if contractor can add more categories
   */
  async canAddCategory(contractorId: string): Promise<{ allowed: boolean; current: number; max: number }> {
    const tier = await this.getContractorTier(contractorId);
    const limits = getTierLimits(tier);

    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        categories: true,
      },
    });

    if (!contractor) {
      throw new Error('Contractor not found');
    }

    const currentCount = contractor.categories.length;

    return {
      allowed: currentCount < limits.maxCategories,
      current: currentCount,
      max: limits.maxCategories,
    };
  }

  /**
   * Check if contractor can add more portfolio items
   */
  async canAddPortfolioItem(contractorId: string): Promise<{ allowed: boolean; current: number; max: number }> {
    const tier = await this.getContractorTier(contractorId);
    const limits = getTierLimits(tier);

    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        portfolio: true,
      },
    });

    if (!contractor) {
      throw new Error('Contractor not found');
    }

    const currentCount = contractor.portfolio.length;

    return {
      allowed: currentCount < limits.maxPortfolioItems,
      current: currentCount,
      max: limits.maxPortfolioItems,
    };
  }

  /**
   * Check if contractor can use priority listing
   */
  async canUsePriorityListing(contractorId: string): Promise<boolean> {
    const tier = await this.getContractorTier(contractorId);
    const limits = getTierLimits(tier);
    return limits.canUsePriorityListing;
  }

  /**
   * Check if contractor can use analytics
   */
  async canUseAnalytics(contractorId: string): Promise<boolean> {
    const tier = await this.getContractorTier(contractorId);
    const limits = getTierLimits(tier);
    return limits.canUseAnalytics;
  }

  /**
   * Check if contractor can use featured badge
   */
  async canUseFeaturedBadge(contractorId: string): Promise<boolean> {
    const tier = await this.getContractorTier(contractorId);
    const limits = getTierLimits(tier);
    return limits.canUseFeaturedBadge;
  }

  /**
   * Get all feature limits for a contractor
   */
  async getFeatureLimits(contractorId: string) {
    const tier = await this.getContractorTier(contractorId);
    return {
      tier,
      ...getTierLimits(tier),
    };
  }
}
