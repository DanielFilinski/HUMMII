import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../shared/prisma/prisma.service';
import { StripeConfig } from './config/stripe.config';
import { getTierLimits } from './config/tier-limits.config';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpgradeSubscriptionDto, DowngradeSubscriptionDto, CancelSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { STRIPE_PROVIDER } from './providers/stripe.provider';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(STRIPE_PROVIDER) private readonly stripe: Stripe | null,
  ) {}

  /**
   * Get contractor by user ID
   */
  async getContractorByUserId(userId: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    return contractor;
  }

  /**
   * Get subscription for a contractor (by user ID)
   */
  async getSubscription(userId: string) {
    const contractor = await this.getContractorByUserId(userId);
    return this.getSubscriptionByContractorId(contractor.id);
  }

  /**
   * Get subscription for a contractor (by contractor ID)
   */
  async getSubscriptionByContractorId(contractorId: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: { subscription: true },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    // If no subscription exists, return FREE tier subscription placeholder
    if (!contractor.subscription) {
      // Return a subscription-like object for FREE tier
      // Note: This doesn't have stripeSubscriptionId, so operations requiring Stripe will fail gracefully
      return {
        id: null,
        contractorId: contractor.id,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
      } as any;
    }

    return contractor.subscription;
  }

  /**
   * Create a new subscription
   * Creates Stripe Customer and Subscription, then saves to DB
   */
  /**
   * Create a new subscription
   * Requires Stripe to be configured
   */
  async createSubscription(userId: string, createDto: CreateSubscriptionDto) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use subscription features.');
    }

    if (createDto.tier === SubscriptionTier.FREE) {
      throw new BadRequestException('Cannot create FREE tier subscription. FREE tier is default.');
    }

    // Validate contractor exists
    const contractor = await this.getContractorByUserId(userId);
    
    // Get subscription if exists
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { contractorId: contractor.id },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    // Check if contractor already has an active subscription
    if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
      throw new ConflictException('Contractor already has an active subscription');
    }

    // Get user email for Stripe Customer
    const user = await this.prisma.user.findUnique({
      where: { id: contractor.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Get Stripe Price ID for the tier
      const priceId = StripeConfig.getPriceId(createDto.tier, this.configService);
      if (!priceId) {
        throw new ServiceUnavailableException(`Stripe Price ID not configured for tier: ${createDto.tier}. Please set STRIPE_PRICE_${createDto.tier} environment variable.`);
      }

      // Create or retrieve Stripe Customer
      let stripeCustomer: Stripe.Customer;
      if (existingSubscription?.stripeCustomerId) {
        stripeCustomer = await this.stripe.customers.retrieve(
          existingSubscription.stripeCustomerId,
        ) as Stripe.Customer;
      } else {
        stripeCustomer = await this.stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            contractorId: contractor.id,
            userId: contractor.userId,
          },
        });
      }

      // Create Stripe Subscription
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          contractorId: contractor.id,
          tier: createDto.tier,
        },
      };

      if (createDto.paymentMethodId) {
        subscriptionData.default_payment_method = createDto.paymentMethodId;
      }

      const stripeSubscription = await this.stripe.subscriptions.create(subscriptionData);

      // Get client secret from payment intent
      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;
      const clientSecret = paymentIntent?.client_secret;

      // Create or update subscription in database
      const subscription = await this.prisma.subscription.upsert({
        where: { contractorId: contractor.id },
        create: {
          contractorId: contractor.id,
          stripeCustomerId: stripeCustomer.id,
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: priceId,
          tier: createDto.tier,
          status: this.mapStripeStatusToDbStatus(stripeSubscription.status),
          currentPeriodStart: stripeSubscription.current_period_start
            ? new Date(stripeSubscription.current_period_start * 1000)
            : null,
          currentPeriodEnd: stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          metadata: {
            createdVia: 'api',
            paymentMethodProvided: !!createDto.paymentMethodId,
          },
        },
        update: {
          stripeSubscriptionId: stripeSubscription.id,
          stripePriceId: priceId,
          tier: createDto.tier,
          status: this.mapStripeStatusToDbStatus(stripeSubscription.status),
          currentPeriodStart: stripeSubscription.current_period_start
            ? new Date(stripeSubscription.current_period_start * 1000)
            : null,
          currentPeriodEnd: stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        },
      });

      // Log to history
      await this.prisma.subscriptionHistory.create({
        data: {
          contractorId: contractor.id,
          subscriptionId: subscription.id,
          action: 'CREATED',
          toTier: createDto.tier,
          metadata: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        },
      });

      this.logger.log(`Subscription created for contractor ${contractor.id}, tier: ${createDto.tier}`);

      return {
        subscription,
        clientSecret,
        requiresAction: stripeSubscription.status === 'incomplete',
      };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Upgrade subscription tier
   * Requires Stripe to be configured
   */
  async upgradeSubscription(userId: string, upgradeDto: UpgradeSubscriptionDto) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use subscription features.');
    }

    const contractor = await this.getContractorByUserId(userId);
    const subscription = await this.getSubscriptionByContractorId(contractor.id);

    if (subscription.tier === upgradeDto.tier) {
      throw new BadRequestException(`Already on ${upgradeDto.tier} tier`);
    }

    // Validate upgrade path
    const tierOrder = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.STANDARD]: 1,
      [SubscriptionTier.PROFESSIONAL]: 2,
      [SubscriptionTier.ADVANCED]: 3,
    };

    if (tierOrder[subscription.tier as SubscriptionTier] >= tierOrder[upgradeDto.tier]) {
      throw new BadRequestException('Can only upgrade to a higher tier');
    }

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No Stripe subscription found. Please create a subscription first.');
    }

    try {
      // Validate that tier is not FREE (can't upgrade to FREE)
      if (upgradeDto.tier === SubscriptionTier.FREE) {
        throw new BadRequestException('Cannot upgrade to FREE tier. Use downgrade or cancel instead.');
      }
      
      const priceId = StripeConfig.getPriceId(upgradeDto.tier as 'STANDARD' | 'PROFESSIONAL' | 'ADVANCED', this.configService);
      if (!priceId) {
        throw new ServiceUnavailableException(`Stripe Price ID not configured for tier: ${upgradeDto.tier}. Please set STRIPE_PRICE_${upgradeDto.tier} environment variable.`);
      }

      // Update Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{
            id: (await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
            price: priceId,
          }],
          proration_behavior: 'create_prorations', // Prorate billing
          metadata: {
            ...subscription.metadata as Record<string, string>,
            tier: upgradeDto.tier,
            upgradedAt: new Date().toISOString(),
          },
        },
      );

      // Update database
      const fromTier = subscription.tier;
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          tier: upgradeDto.tier,
          stripePriceId: priceId,
          status: this.mapStripeStatusToDbStatus(stripeSubscription.status),
          currentPeriodStart: stripeSubscription.current_period_start
            ? new Date(stripeSubscription.current_period_start * 1000)
            : null,
          currentPeriodEnd: stripeSubscription.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : null,
        },
      });

      // Log to history
      await this.prisma.subscriptionHistory.create({
        data: {
          contractorId: subscription.contractorId,
          subscriptionId: subscription.id,
          action: 'UPGRADED',
          fromTier,
          toTier: upgradeDto.tier,
          metadata: {
            stripeSubscriptionId: stripeSubscription.id,
          },
        },
      });

      this.logger.log(`Subscription upgraded for contractor ${subscription.contractorId}: ${fromTier} → ${upgradeDto.tier}`);

      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Failed to upgrade subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upgrade subscription: ${error.message}`);
    }
  }

  /**
   * Downgrade subscription tier
   * Requires Stripe to be configured
   */
  async downgradeSubscription(userId: string, downgradeDto: DowngradeSubscriptionDto) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use subscription features.');
    }

    const contractor = await this.getContractorByUserId(userId);
    const subscription = await this.getSubscriptionByContractorId(contractor.id);

    if (subscription.tier === downgradeDto.tier) {
      throw new BadRequestException(`Already on ${downgradeDto.tier} tier`);
    }

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No Stripe subscription found');
    }

    // Check feature limits after downgrade
    const newLimits = getTierLimits(downgradeDto.tier);
    const contractorWithRelations = await this.prisma.contractor.findUnique({
      where: { id: subscription.contractorId },
      include: {
        categories: true,
        portfolio: true,
      },
    });

    const warnings: string[] = [];
    if (contractorWithRelations && contractorWithRelations.categories.length > newLimits.maxCategories) {
      warnings.push(`You have ${contractorWithRelations.categories.length} categories, but ${downgradeDto.tier} tier allows only ${newLimits.maxCategories}. Some categories will be hidden.`);
    }
    if (contractorWithRelations && contractorWithRelations.portfolio.length > newLimits.maxPortfolioItems) {
      warnings.push(`You have ${contractorWithRelations.portfolio.length} portfolio items, but ${downgradeDto.tier} tier allows only ${newLimits.maxPortfolioItems}. Some items will be hidden.`);
    }

    try {
      const priceId = downgradeDto.tier === SubscriptionTier.FREE
        ? null // FREE tier doesn't have a Stripe price
        : StripeConfig.getPriceId(downgradeDto.tier, this.configService);

      // If downgrading to paid tier but price ID is not configured
      if (downgradeDto.tier !== SubscriptionTier.FREE && !priceId) {
        throw new ServiceUnavailableException(`Stripe Price ID not configured for tier: ${downgradeDto.tier}. Please set STRIPE_PRICE_${downgradeDto.tier} environment variable.`);
      }

      const fromTier = subscription.tier;

      if (downgradeDto.tier === SubscriptionTier.FREE || downgradeDto.immediate) {
        // Cancel subscription immediately
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        
        const updatedSubscription = await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: downgradeDto.tier,
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
            cancelAtPeriodEnd: false,
          },
        });

        await this.prisma.subscriptionHistory.create({
          data: {
            contractorId: subscription.contractorId,
            subscriptionId: subscription.id,
            action: 'DOWNGRADED',
            fromTier,
            toTier: downgradeDto.tier,
            reason: 'Immediate downgrade',
          },
        });

        return { subscription: updatedSubscription, warnings };
      } else {
        // Schedule downgrade at end of period
        const stripeSubscription = await this.stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            items: [{
              id: (await this.stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
              price: priceId!,
            }],
            proration_behavior: 'none', // No proration for downgrades
            metadata: {
              ...subscription.metadata as Record<string, string>,
              tier: downgradeDto.tier,
              downgradeScheduled: new Date().toISOString(),
            },
          },
        );

        const updatedSubscription = await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: downgradeDto.tier,
            stripePriceId: priceId!,
            status: this.mapStripeStatusToDbStatus(stripeSubscription.status),
            currentPeriodStart: stripeSubscription.current_period_start
              ? new Date(stripeSubscription.current_period_start * 1000)
              : null,
            currentPeriodEnd: stripeSubscription.current_period_end
              ? new Date(stripeSubscription.current_period_end * 1000)
              : null,
          },
        });

        await this.prisma.subscriptionHistory.create({
          data: {
            contractorId: subscription.contractorId,
            subscriptionId: subscription.id,
            action: 'DOWNGRADED',
            fromTier,
            toTier: downgradeDto.tier,
            reason: 'Scheduled downgrade',
          },
        });

        return { subscription: updatedSubscription, warnings };
      }
    } catch (error) {
      this.logger.error(`Failed to downgrade subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to downgrade subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   * Requires Stripe to be configured
   */
  async cancelSubscription(userId: string, cancelDto: CancelSubscriptionDto) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use subscription features.');
    }

    const contractor = await this.getContractorByUserId(userId);
    const subscription = await this.getSubscriptionByContractorId(contractor.id);

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No Stripe subscription found');
    }

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Subscription is already canceled');
    }

    try {
      if (cancelDto.immediate) {
        // Cancel immediately and downgrade to FREE
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

        const updatedSubscription = await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: SubscriptionTier.FREE,
            status: SubscriptionStatus.CANCELED,
            canceledAt: new Date(),
            cancelAtPeriodEnd: false,
          },
        });

        await this.prisma.subscriptionHistory.create({
          data: {
            contractorId: subscription.contractorId,
            subscriptionId: subscription.id,
            action: 'CANCELED',
            fromTier: subscription.tier,
            toTier: SubscriptionTier.FREE,
            reason: 'Immediate cancellation',
          },
        });

        return updatedSubscription;
      } else {
        // Cancel at end of period
        const stripeSubscription = await this.stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            cancel_at_period_end: true,
          },
        );

        const updatedSubscription = await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            cancelAtPeriodEnd: true,
          },
        });

        await this.prisma.subscriptionHistory.create({
          data: {
            contractorId: subscription.contractorId,
            subscriptionId: subscription.id,
            action: 'CANCELED',
            fromTier: subscription.tier,
            reason: 'Scheduled cancellation',
          },
        });

        return updatedSubscription;
      }
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Reactivate canceled subscription
   * Requires Stripe to be configured
   */
  async reactivateSubscription(userId: string) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use subscription features.');
    }

    const contractor = await this.getContractorByUserId(userId);
    const subscription = await this.getSubscriptionByContractorId(contractor.id);

    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No Stripe subscription found');
    }

    if (subscription.status !== SubscriptionStatus.CANCELED && !subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not canceled');
    }

    try {
      // Remove cancel_at_period_end
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      });

      await this.prisma.subscriptionHistory.create({
        data: {
          contractorId: subscription.contractorId,
          subscriptionId: subscription.id,
          action: 'RENEWED',
          metadata: {
            reactivated: true,
          },
        },
      });

      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Failed to reactivate subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to reactivate subscription: ${error.message}`);
    }
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
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.UNPAID,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.INCOMPLETE;
  }
}
