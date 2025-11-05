import { Module } from '@nestjs/common';
import { AnalyticsController, AnalyticsAdminController } from './analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { TrackingService } from './services/tracking.service';
import { BusinessIntelligenceService } from './services/business-intelligence.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AnalyticsController, AnalyticsAdminController],
  providers: [
    AnalyticsService,
    TrackingService,
    BusinessIntelligenceService,
  ],
  exports: [
    AnalyticsService,
    TrackingService,
    BusinessIntelligenceService,
  ],
})
export class AnalyticsModule {}

