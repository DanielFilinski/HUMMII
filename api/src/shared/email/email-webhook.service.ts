import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_event_id: string;
  sg_message_id: string;
  reason?: string;
  status?: string;
  url?: string;
}

@Injectable()
export class EmailWebhookService {
  private readonly logger = new Logger(EmailWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processEvent(event: SendGridEvent): Promise<void> {
    this.logger.log(`Processing ${event.event} event for ${event.email}`);

    // Store important events in database
    switch (event.event) {
      case 'bounce':
      case 'dropped':
      case 'spam_report':
        await this.handleFailedDelivery(event);
        break;

      case 'delivered':
        this.logger.log(`Email delivered to ${event.email}`);
        break;

      case 'open':
        this.logger.debug(`Email opened by ${event.email}`);
        break;

      case 'click':
        this.logger.debug(`Link clicked by ${event.email}: ${event.url}`);
        break;

      default:
        this.logger.debug(`Event ${event.event} for ${event.email}`);
    }
  }

  private async handleFailedDelivery(event: SendGridEvent): Promise<void> {
    this.logger.warn(
      `Email ${event.event} for ${event.email}: ${event.reason || event.status}`,
    );

    // TODO: Mark user email as bounced in database
    // TODO: Trigger alert for admin if spam_report
    // TODO: Add to suppression list if permanent bounce
  }
}

