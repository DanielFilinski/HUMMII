import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemplateService } from './template.service';

/**
 * Template Module
 *
 * Provides template rendering service for notifications.
 * Exports TemplateService for use in other modules.
 */
@Module({
  imports: [ConfigModule],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}

