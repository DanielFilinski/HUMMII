import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

/**
 * Template Service
 *
 * Handles rendering of notification templates using Handlebars.
 * Supports i18n (EN/FR) for email templates.
 */
@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    this.loadTemplates();
  }

  /**
   * Load all Handlebars templates from templates directory
   */
  private loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates');
    
    if (!fs.existsSync(templatesDir)) {
      this.logger.warn(`Templates directory not found: ${templatesDir}`);
      return;
    }

    const files = fs.readdirSync(templatesDir);
    
    files.forEach((file) => {
      if (file.endsWith('.hbs')) {
        const templateName = file.replace('.hbs', '');
        const templatePath = path.join(templatesDir, file);
        
        try {
          const templateContent = fs.readFileSync(templatePath, 'utf-8');
          const template = Handlebars.compile(templateContent);
          this.templates.set(templateName, template);
          this.logger.log(`Loaded template: ${templateName}`);
        } catch (error) {
          this.logger.error(`Failed to load template ${templateName}:`, error);
        }
      }
    });
  }

  /**
   * Render template with data
   * @param templateName - Template name (without .hbs extension)
   * @param data - Template data
   * @param lang - Language (en or fr)
   */
  render(templateName: string, data: Record<string, any>, lang: string = 'en'): string {
    const template = this.templates.get(templateName);
    
    if (!template) {
      this.logger.warn(`Template ${templateName} not found, using fallback`);
      return this.getFallbackTemplate(templateName, data);
    }

    return template({
      ...data,
      lang,
      baseUrl: this.baseUrl,
      unsubscribeUrl: `${this.baseUrl}/settings/notifications?unsubscribe=true`,
      supportEmail: 'support@hummii.ca',
      currentYear: new Date().getFullYear(),
    });
  }

  /**
   * Get fallback template if template file not found
   */
  private getFallbackTemplate(templateName: string, data: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.title || 'Notification'}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2>${data.title || 'Notification'}</h2>
          <p>${data.body || 'You have a new notification.'}</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">View Details</a>` : ''}
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="font-size: 12px; color: #6c757d;">
            If you have any questions, please contact us at support@hummii.ca
          </p>
          <p style="font-size: 12px; color: #6c757d;">
            <a href="${this.baseUrl}/settings/notifications?unsubscribe=true">Unsubscribe</a> from these notifications
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

