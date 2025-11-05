import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TemplateService } from '../services/template.service';

/**
 * OneSignal Service
 *
 * Handles email and push notifications via OneSignal API.
 * TODO: Full implementation requires OneSignal account setup and API credentials.
 */
@Injectable()
export class OneSignalService {
  private readonly logger = new Logger(OneSignalService.name);
  private readonly appId: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly emailEnabled: boolean;
  private readonly pushEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly templateService: TemplateService,
  ) {
    this.appId = this.configService.get<string>('ONESIGNAL_APP_ID');
    this.apiKey = this.configService.get<string>('ONESIGNAL_API_KEY');
    this.emailEnabled = this.configService.get<boolean>('ONESIGNAL_EMAIL_ENABLED', false);
    this.pushEnabled = this.configService.get<boolean>('ONESIGNAL_PUSH_ENABLED', false);

    if (!this.appId || !this.apiKey) {
      this.logger.warn('OneSignal credentials not configured. Email and push notifications will be disabled.');
    }
  }

  /**
   * Send email notification via OneSignal
   * TODO: Implement actual OneSignal API call
   */
  async sendEmail(
    email: string,
    subject: string,
    template: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!this.emailEnabled || !this.appId || !this.apiKey) {
      this.logger.warn(`Email sending disabled or not configured. Skipping email to ${email}`);
      return;
    }

    try {
      // Render template
      const html = this.templateService.render(template, data);

      // TODO: Implement actual OneSignal API call
      // const notification = new OneSignal.Notification();
      // notification.app_id = this.appId;
      // notification.include_email_tokens = [email];
      // notification.email_subject = subject;
      // notification.email_body = html;
      // await this.client.createNotification(notification);

      // Log to EmailLog
      await this.prisma.emailLog.create({
        data: {
          email,
          subject,
          template,
          status: 'sent',
          provider: 'onesignal',
          // providerId: response.id,
        },
      });

      this.logger.log(`Email sent to ${email} via OneSignal (stub)`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);

      // Log error to EmailLog
      await this.prisma.emailLog.create({
        data: {
          email,
          subject,
          template,
          status: 'failed',
          provider: 'onesignal',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Send push notification via OneSignal
   * TODO: Implement actual OneSignal API call
   */
  async sendPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!this.pushEnabled || !this.appId || !this.apiKey) {
      this.logger.warn(`Push notifications disabled or not configured. Skipping push to user ${userId}`);
      return;
    }

    try {
      // TODO: Implement actual OneSignal API call
      // const notification = new OneSignal.Notification();
      // notification.app_id = this.appId;
      // notification.include_external_user_ids = [userId];
      // notification.headings = { en: title };
      // notification.contents = { en: body };
      // notification.data = data;
      // await this.client.createNotification(notification);

      this.logger.log(`Push notification sent to user ${userId} via OneSignal (stub)`);
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}:`, error);
      throw error;
    }
  }
}

