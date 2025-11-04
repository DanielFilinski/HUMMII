import { SubscriptionTier } from '@prisma/client';

/**
 * Feature limits per subscription tier
 * Used for feature gating throughout the application
 */
export interface TierLimits {
  maxCategories: number;
  maxPortfolioItems: number;
  canUsePriorityListing: boolean;
  canUseAnalytics: boolean;
  canUseFeaturedBadge: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    maxCategories: 3,
    maxPortfolioItems: 5,
    canUsePriorityListing: false,
    canUseAnalytics: false,
    canUseFeaturedBadge: false,
  },
  STANDARD: {
    maxCategories: 5,
    maxPortfolioItems: 10,
    canUsePriorityListing: false,
    canUseAnalytics: false,
    canUseFeaturedBadge: false,
  },
  PROFESSIONAL: {
    maxCategories: 10,
    maxPortfolioItems: 20,
    canUsePriorityListing: true,
    canUseAnalytics: true,
    canUseFeaturedBadge: true,
  },
  ADVANCED: {
    maxCategories: 9999, // Unlimited
    maxPortfolioItems: 9999, // Unlimited
    canUsePriorityListing: true,
    canUseAnalytics: true,
    canUseFeaturedBadge: true,
  },
};

/**
 * Get tier limits for a given subscription tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a tier allows unlimited categories
 */
export function hasUnlimitedCategories(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].maxCategories >= 9999;
}

/**
 * Check if a tier allows unlimited portfolio items
 */
export function hasUnlimitedPortfolio(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].maxPortfolioItems >= 9999;
}
