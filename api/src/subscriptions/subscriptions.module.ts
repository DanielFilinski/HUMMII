import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { FeatureGateService } from './services/feature-gate.service';
import { SubscriptionSyncService } from './services/subscription-sync.service';
import { SubscriptionGuard } from './guards/subscription.guard';
import { SubscriptionWebhookController } from './webhooks/subscription-webhook.controller';
import { SubscriptionWebhookService } from './webhooks/subscription-webhook.service';
import { CustomerPortalService } from './services/customer-portal.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';
import { stripeProvider, STRIPE_PROVIDER } from './providers/stripe.provider';

/**
 * Subscriptions Module
 * 
 * Provides subscription management functionality:
 * - Create, upgrade, downgrade, cancel subscriptions
 * - Stripe integration for billing
 * - Feature gating based on subscription tier
 * - Subscription lifecycle management
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuditModule,
  ],
  controllers: [SubscriptionsController, SubscriptionWebhookController],
  providers: [
    SubscriptionsService,
    FeatureGateService,
    SubscriptionSyncService,
    SubscriptionWebhookService,
    CustomerPortalService,
    SubscriptionGuard,
    stripeProvider,
  ],
  exports: [SubscriptionsService, FeatureGateService, SubscriptionGuard, STRIPE_PROVIDER],
})
export class SubscriptionsModule {}
