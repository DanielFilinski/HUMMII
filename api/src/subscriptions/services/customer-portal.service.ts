import { Injectable, BadRequestException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import Stripe from 'stripe';
import { STRIPE_PROVIDER } from '../providers/stripe.provider';
import { Inject } from '@nestjs/common';

@Injectable()
export class CustomerPortalService {
  private readonly logger = new Logger(CustomerPortalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(STRIPE_PROVIDER) private readonly stripe: Stripe | null,
  ) {}

  /**
   * Create Stripe Customer Portal session
   * Allows contractors to manage their subscription, payment methods, and invoices
   * Requires Stripe to be configured
   */
  async createPortalSession(contractorId: string, returnUrl?: string): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use subscription features.');
    }

    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: { 
        subscription: {
          select: {
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!contractor) {
      throw new BadRequestException('Contractor not found');
    }

    if (!contractor.subscription?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found. Please create a subscription first.');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: contractor.subscription.stripeCustomerId,
        return_url: returnUrl || `${frontendUrl}/contractor/subscription`,
      });

      this.logger.log(`Created Customer Portal session for contractor ${contractorId}`);

      return { url: session.url };
    } catch (error) {
      this.logger.error(`Failed to create portal session: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create portal session: ${error.message}`);
    }
  }
}
