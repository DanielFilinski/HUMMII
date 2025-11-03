import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailWebhookController } from './email-webhook.controller';
import { EmailWebhookService } from './email-webhook.service';
import { QueueModule } from '../queue/queue.module';

@Global()
@Module({
  imports: [QueueModule],
  controllers: [EmailWebhookController],
  providers: [EmailService, EmailProcessor, EmailWebhookService],
  exports: [EmailService],
})
export class EmailModule {}
