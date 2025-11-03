import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { EmailWebhookService } from './email-webhook.service';

interface SendGridEvent {
  email: string;
  timestamp: number;
  event:
    | 'processed'
    | 'delivered'
    | 'bounce'
    | 'dropped'
    | 'deferred'
    | 'open'
    | 'click'
    | 'spam_report'
    | 'unsubscribe';
  sg_event_id: string;
  sg_message_id: string;
  reason?: string;
  status?: string;
  url?: string;
}

@ApiTags('Webhooks')
@Controller('webhooks/sendgrid')
export class EmailWebhookController {
  private readonly logger = new Logger(EmailWebhookController.name);

  constructor(
    private readonly emailWebhookService: EmailWebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post('events')
  @ApiOperation({ summary: 'SendGrid webhook for email events' })
  @ApiResponse({ status: 200, description: 'Event processed' })
  async handleWebhook(
    @Body() events: SendGridEvent[],
    @Headers('x-twilio-email-event-webhook-signature') signature?: string,
    @Headers('x-twilio-email-event-webhook-timestamp') timestamp?: string,
  ) {
    this.logger.log(`Received ${events.length} SendGrid events`);

    // TODO: Verify webhook signature (optional but recommended)
    // See: https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features

    for (const event of events) {
      try {
        await this.emailWebhookService.processEvent(event);
      } catch (error) {
        this.logger.error(`Failed to process event ${event.sg_event_id}:`, error);
        // Don't throw - process other events
      }
    }

    return { received: true };
  }
}

