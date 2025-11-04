import { ConfigService } from '@nestjs/config';

/**
 * Stripe Configuration
 * Maps subscription tiers to Stripe Price IDs
 * Provides graceful fallback in development mode
 */
export class StripeConfig {
  /**
   * Check if Stripe is fully configured
   * Returns true if all required Stripe keys are present
   */
  static isConfigured(configService: ConfigService): boolean {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');

    // In production, require secret key
    if (nodeEnv === 'production') {
      return !!secretKey;
    }

    // In development, Stripe is optional
    return !!secretKey;
  }

  static getPriceId(tier: 'STANDARD' | 'PROFESSIONAL' | 'ADVANCED', configService: ConfigService): string | null {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const priceIdMap = {
      STANDARD: configService.get<string>('STRIPE_PRICE_STANDARD'),
      PROFESSIONAL: configService.get<string>('STRIPE_PRICE_PROFESSIONAL'),
      ADVANCED: configService.get<string>('STRIPE_PRICE_ADVANCED'),
    };

    const priceId = priceIdMap[tier];

    if (!priceId) {
      if (nodeEnv === 'production') {
        throw new Error(`Stripe Price ID not configured for tier: ${tier}. Please set STRIPE_PRICE_${tier} environment variable.`);
      }
      // In development, return null
      return null;
    }

    return priceId;
  }

  /**
   * Get Stripe secret key
   * Returns null in development if not configured
   * Throws error in production if not configured
   */
  static getSecretKey(configService: ConfigService): string | null {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      if (nodeEnv === 'production') {
        throw new Error('STRIPE_SECRET_KEY is not configured. Please set it in environment variables.');
      }
      // In development, return null
      return null;
    }

    return secretKey;
  }

  /**
   * Get Stripe webhook secret
   * Returns null in development if not configured
   * Throws error in production if not configured
   */
  static getWebhookSecret(configService: ConfigService): string | null {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const webhookSecret = configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      if (nodeEnv === 'production') {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured. Please set it in environment variables.');
      }
      // In development, return null
      return null;
    }

    return webhookSecret;
  }

  /**
   * Get Stripe publishable key
   * Returns null in development if not configured
   * Throws error in production if not configured
   */
  static getPublishableKey(configService: ConfigService): string | null {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const publishableKey = configService.get<string>('STRIPE_PUBLISHABLE_KEY');

    if (!publishableKey) {
      if (nodeEnv === 'production') {
        throw new Error('STRIPE_PUBLISHABLE_KEY is not configured. Please set it in environment variables.');
      }
      // In development, return null
      return null;
    }

    return publishableKey;
  }
}
