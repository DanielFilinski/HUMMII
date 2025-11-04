import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const STRIPE_PROVIDER = 'STRIPE_CLIENT';

/**
 * Stripe client provider
 * Initializes Stripe with secret key from environment
 * Returns null in development if STRIPE_SECRET_KEY is not configured
 * Throws error in production if STRIPE_SECRET_KEY is missing
 */
export const stripeProvider: Provider = {
  provide: STRIPE_PROVIDER,
  useFactory: (configService: ConfigService): Stripe | null => {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    if (!secretKey) {
      // In production, Stripe is required
      if (nodeEnv === 'production') {
        throw new Error('STRIPE_SECRET_KEY is not configured. Stripe is required in production.');
      }
      // In development, return null to allow app to start without Stripe
      return null;
    }

    return new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  },
  inject: [ConfigService],
};
