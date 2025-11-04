import {
  Controller,
  Post,
  Headers,
  Body,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SubscriptionWebhookService } from './subscription-webhook.service';
import { StripeConfig } from '../config/stripe.config';
import Stripe from 'stripe';
import { STRIPE_PROVIDER } from '../providers/stripe.provider';
import { Inject } from '@nestjs/common';

@ApiTags('Webhooks')
@Controller('webhooks/stripe')
export class SubscriptionWebhookController {
  private readonly logger = new Logger(SubscriptionWebhookController.name);

  constructor(
    private readonly webhookService: SubscriptionWebhookService,
    private readonly configService: ConfigService,
    @Inject(STRIPE_PROVIDER) private readonly stripe: Stripe | null,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  @ApiResponse({ status: 501, description: 'Stripe is not configured' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured. Please configure Stripe environment variables to use webhook features.');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const webhookSecret = StripeConfig.getWebhookSecret(this.configService);
    if (!webhookSecret) {
      throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET is not configured. Please set it in environment variables.');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature - CRITICAL for security
      event = this.stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    this.logger.log(`Received Stripe webhook event: ${event.type} (${event.id})`);

    try {
      // Process webhook event
      await this.webhookService.handleEvent(event);
      
      return { received: true, eventId: event.id };
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event.id}: ${error.message}`, error.stack);
      // Return 200 to Stripe even if processing fails (prevents retries)
      // We'll retry manually or handle errors in the service
      return { received: true, error: error.message };
    }
  }
}
