import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../subscriptions.service';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export const REQUIRES_TIER_KEY = 'requiresTier';

/**
 * Subscription Guard
 * Checks if user has required subscription tier to access the resource
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.get<SubscriptionTier>(
      REQUIRES_TIER_KEY,
      context.getHandler(),
    ) as SubscriptionTier | undefined;

    // If no tier required, allow access
    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Authentication required');
    }

    try {
      const subscription = await this.subscriptionsService.getSubscription(user.userId);

      // Check if subscription is active
      if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.TRIALING) {
        throw new HttpException(
          { message: 'Active subscription required. Please renew your subscription.', statusCode: HttpStatus.PAYMENT_REQUIRED },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      // Check tier level
      const tierOrder: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 0,
        [SubscriptionTier.STANDARD]: 1,
        [SubscriptionTier.PROFESSIONAL]: 2,
        [SubscriptionTier.ADVANCED]: 3,
      };

      const userTierLevel = tierOrder[subscription.tier as SubscriptionTier] || 0;
      const requiredTierLevel = tierOrder[requiredTier as SubscriptionTier] || 0;

      if (userTierLevel < requiredTierLevel) {
        throw new HttpException(
          { message: `This feature requires ${requiredTier} tier subscription. Please upgrade your subscription.`, statusCode: HttpStatus.PAYMENT_REQUIRED },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { message: 'Unable to verify subscription status', statusCode: HttpStatus.PAYMENT_REQUIRED },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }
}
