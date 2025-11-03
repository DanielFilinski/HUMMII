import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as sgMail from '@sendgrid/mail';
import { EmailJob } from '../queue/interfaces/email-job.interface';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  context?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly appName: string;
  private readonly emailProvider: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.fromEmail = this.configService.get('EMAIL_FROM', 'noreply@hummii.ca');
    this.appName = this.configService.get('APP_NAME', 'Hummii');
    this.emailProvider = this.configService.get('EMAIL_PROVIDER', 'console');

    // Initialize SendGrid if configured
    if (this.emailProvider === 'sendgrid') {
      const apiKey = this.configService.get('SENDGRID_API_KEY');
      if (apiKey) {
        sgMail.setApiKey(apiKey);
        this.logger.log('✅ SendGrid initialized');
      } else {
        this.logger.warn('⚠️  SENDGRID_API_KEY not set, email will fail');
      }
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const html = this.getEmailVerificationTemplate(verificationUrl);

    await this.sendEmail({
      to: email,
      subject: `Verify your ${this.appName} account`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const html = this.getPasswordResetTemplate(resetUrl);

    await this.sendEmail({
      to: email,
      subject: `Reset your ${this.appName} password`,
      html,
    });
  }

  /**
   * Send password reset confirmation
   */
  async sendPasswordResetConfirmation(email: string): Promise<void> {
    const html = this.getPasswordResetConfirmationTemplate();

    await this.sendEmail({
      to: email,
      subject: `Your ${this.appName} password has been reset`,
      html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = this.getWelcomeTemplate(name);

    await this.sendEmail({
      to: email,
      subject: `Welcome to ${this.appName}!`,
      html,
    });
  }

  /**
   * Generic send email method
   * Queue email for async processing (production) or log to console (development)
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    const jobData: EmailJob = {
      to: options.to,
      subject: options.subject,
      html: options.html || options.text || '',
      text: options.text,
    };

    if (this.emailProvider === 'console') {
      // Development: immediate console logging
      this.logToConsole(jobData);
    } else {
      // Production/Staging: queue for async processing
      await this.emailQueue.add('send-email', jobData, {
        priority: 1,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      });

      this.logger.log(`Email queued for ${jobData.to}: ${jobData.subject}`);
    }
  }

  /**
   * Send email directly (called by processor)
   * @internal - Only used by EmailProcessor
   */
  async sendEmailDirect(emailJob: EmailJob): Promise<void> {
    if (this.emailProvider === 'sendgrid') {
      await this.sendViaSendGrid(emailJob);
    } else {
      this.logToConsole(emailJob);
    }
  }

  /**
   * Send via SendGrid API
   */
  private async sendViaSendGrid(emailJob: EmailJob): Promise<void> {
    try {
      const msg = {
        to: emailJob.to,
        from: this.fromEmail,
        subject: emailJob.subject,
        html: emailJob.html,
        text: emailJob.text,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      };

      await sgMail.send(msg);
      this.logger.log(`✅ Email sent via SendGrid to ${emailJob.to}`);
    } catch (error) {
      this.logger.error('❌ SendGrid error:', error.response?.body || error);
      throw error;
    }
  }

  /**
   * Log email to console (development)
   */
  private logToConsole(emailJob: EmailJob): void {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL (${this.emailProvider.toUpperCase()} MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${emailJob.to}
Subject: ${emailJob.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${emailJob.html}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    this.logger.log(`📧 Email logged to console: ${emailJob.to}`);
  }

  /**
   * Email verification template
   */
  private getEmailVerificationTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Verify Your Email Address</h1>
          <p>Thank you for registering with ${this.appName}!</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4CAF50; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="margin-top: 40px; color: #999; font-size: 12px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Password reset template
   */
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Reset Your Password</h1>
          <p>We received a request to reset your password for your ${this.appName} account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #FF5722; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 40px; color: #999; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Password reset confirmation template
   */
  private getPasswordResetConfirmationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Password Reset Successful</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Password Reset Successful</h1>
          <p>Your password has been successfully reset.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p style="margin-top: 40px;">
            <a href="${this.configService.get('FRONTEND_URL')}/login">Login to your account</a>
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Welcome email template
   */
  private getWelcomeTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to ${this.appName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Welcome to ${this.appName}, ${name}!</h1>
          <p>Your email has been verified and your account is now active.</p>
          <p>You can now start using ${this.appName} to connect with service providers or offer your services.</p>
          <div style="margin: 30px 0;">
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard"
               style="background-color: #2196F3; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
        </body>
      </html>
    `;
  }
}
