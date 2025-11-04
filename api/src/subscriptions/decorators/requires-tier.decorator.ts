import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '@prisma/client';
import { REQUIRES_TIER_KEY } from '../guards/subscription.guard';

/**
 * Decorator to require a specific subscription tier for an endpoint
 * 
 * @example
 * @RequiresTier(SubscriptionTier.PROFESSIONAL)
 * @Post('analytics')
 * async getAnalytics() {
 *   // Only Professional and Advanced tiers can access
 * }
 */
export const RequiresTier = (tier: SubscriptionTier) => SetMetadata(REQUIRES_TIER_KEY, tier);
