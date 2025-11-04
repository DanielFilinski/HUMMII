import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StripeConfig } from '../config/stripe.config';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';

@Injectable()
export class SubscriptionSyncService {
  private readonly logger = new Logger(SubscriptionSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sync subscription data from Stripe to database
   */
  async syncSubscriptionFromStripe(stripeSubscription: Stripe.Subscription, contractorId: string) {
    // Determine tier from price ID
    const tier = this.getTierFromPriceId(stripeSubscription.items.data[0]?.price.id);
    
    // Map Stripe status to DB status
    const status = this.mapStripeStatusToDbStatus(stripeSubscription.status);

    // Update or create subscription in database
    const subscription = await this.prisma.subscription.upsert({
      where: { contractorId },
      create: {
        contractorId,
        stripeCustomerId: stripeSubscription.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price.id || '',
        tier,
        status,
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : null,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
        metadata: stripeSubscription.metadata,
      },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price.id || '',
        tier,
        status,
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : null,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
        metadata: stripeSubscription.metadata,
      },
    });

    this.logger.log(`Synced subscription ${subscription.id} for contractor ${contractorId}`);
    return subscription;
  }

  /**
   * Determine subscription tier from Stripe price ID
   * Returns FREE if price IDs are not configured or price ID doesn't match
   */
  private getTierFromPriceId(priceId: string): SubscriptionTier {
    const standardPriceId = StripeConfig.getPriceId('STANDARD', this.configService);
    const professionalPriceId = StripeConfig.getPriceId('PROFESSIONAL', this.configService);
    const advancedPriceId = StripeConfig.getPriceId('ADVANCED', this.configService);

    // Compare only with configured price IDs
    if (standardPriceId && priceId === standardPriceId) {
      return SubscriptionTier.STANDARD;
    } else if (professionalPriceId && priceId === professionalPriceId) {
      return SubscriptionTier.PROFESSIONAL;
    } else if (advancedPriceId && priceId === advancedPriceId) {
      return SubscriptionTier.ADVANCED;
    }

    // Default to FREE if price ID doesn't match or not configured
    this.logger.warn(`Unknown price ID: ${priceId}, defaulting to FREE tier`);
    return SubscriptionTier.FREE;
  }

  /**
   * Map Stripe subscription status to database status
   */
  private mapStripeStatusToDbStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE,
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.UNPAID,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.INCOMPLETE;
  }
}
