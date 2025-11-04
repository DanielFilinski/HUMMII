import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SubscriptionSyncService } from '../services/subscription-sync.service';
import Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionWebhookService {
  private readonly logger = new Logger(SubscriptionWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: SubscriptionSyncService,
  ) {}

  /**
   * Handle Stripe webhook event
   * Implements idempotency by checking stripeEventId in history
   */
  async handleEvent(event: Stripe.Event) {
    // Check if event already processed (idempotency)
    const existingHistory = await this.prisma.subscriptionHistory.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existingHistory) {
      this.logger.log(`Event ${event.id} already processed, skipping`);
      return { processed: false, reason: 'already_processed' };
    }

    // Route to appropriate handler based on event type
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        this.logger.warn(`Unhandled webhook event type: ${event.type}`);
    }

    // Log event to history (contractorId will be set in individual handlers if available)
    // Some events might not have contractorId, so we'll skip history logging for those
    // and let individual handlers create history entries with proper contractorId

    return { processed: true };
  }

  /**
   * Handle subscription.created event
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log(`Processing subscription.created: ${subscription.id}`);

    const contractorId = subscription.metadata?.contractorId;

    if (!contractorId) {
      this.logger.warn(`Subscription ${subscription.id} missing contractorId in metadata`);
      return;
    }

    await this.syncService.syncSubscriptionFromStripe(subscription, contractorId);
  }

  /**
   * Handle subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Processing subscription.updated: ${subscription.id}`);

    let contractorId = subscription.metadata?.contractorId;

    if (!contractorId) {
      // Try to find by stripeSubscriptionId
      const existing = await this.prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!existing) {
        this.logger.warn(`Subscription ${subscription.id} not found in database`);
        return;
      }

      contractorId = existing.contractorId;
    }

    await this.syncService.syncSubscriptionFromStripe(subscription, contractorId);
  }

  /**
   * Handle subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Processing subscription.deleted: ${subscription.id}`);

    const dbSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      this.logger.warn(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription to CANCELED and downgrade to FREE
    await this.prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        tier: 'FREE' as any, // Will be properly typed after migration
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    // Log to history
    await this.prisma.subscriptionHistory.create({
      data: {
        contractorId: dbSubscription.contractorId,
        subscriptionId: dbSubscription.id,
        action: 'CANCELED',
        fromTier: dbSubscription.tier,
        toTier: 'FREE' as any,
        reason: 'Subscription expired',
        metadata: {
          stripeSubscriptionId: subscription.id,
        },
      },
    });
  }

  /**
   * Handle invoice.payment_succeeded event
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`Processing invoice.payment_succeeded: ${invoice.id}`);

    if (!invoice.subscription || typeof invoice.subscription !== 'string') {
      return;
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (!subscription) {
      this.logger.warn(`Subscription ${invoice.subscription} not found for invoice ${invoice.id}`);
      return;
    }

    // Update subscription status to ACTIVE if it was past_due
    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
        },
      });

      // Log to history
      await this.prisma.subscriptionHistory.create({
        data: {
          contractorId: subscription.contractorId,
          subscriptionId: subscription.id,
          action: 'RENEWED',
          metadata: {
            invoiceId: invoice.id,
            amount: invoice.amount_paid,
          },
        },
      });
    }
  }

  /**
   * Handle invoice.payment_failed event
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log(`Processing invoice.payment_failed: ${invoice.id}`);

    if (!invoice.subscription || typeof invoice.subscription !== 'string') {
      return;
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (!subscription) {
      this.logger.warn(`Subscription ${invoice.subscription} not found for invoice ${invoice.id}`);
      return;
    }

    // Update subscription status to PAST_DUE
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    // Log to history
    await this.prisma.subscriptionHistory.create({
      data: {
        contractorId: subscription.contractorId,
        subscriptionId: subscription.id,
        action: 'PAYMENT_FAILED',
        metadata: {
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count,
        },
      },
    });

    // TODO: Send notification to contractor (Phase 8)
  }

  /**
   * Handle subscription.trial_will_end event
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    this.logger.log(`Processing subscription.trial_will_end: ${subscription.id}`);

    const dbSubscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!dbSubscription) {
      return;
    }

    // Log to history for tracking
    await this.prisma.subscriptionHistory.create({
      data: {
        contractorId: dbSubscription.contractorId,
        subscriptionId: dbSubscription.id,
        action: 'TRIAL_WILL_END',
        metadata: {
          trialEnd: subscription.trial_end,
        },
      },
    });

    // TODO: Send notification to contractor (Phase 8)
  }
}
