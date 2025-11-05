import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProcessor } from './processors/notification.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { UploadModule } from '../upload/upload.module';
import { ReviewsModule } from '../../reviews/reviews.module';
import { ChatCleanupJob } from './jobs/cleanup/chat-cleanup.job';
import { SessionCleanupJob } from './jobs/cleanup/session-cleanup.job';
import { NotificationCleanupJob } from './jobs/cleanup/notification-cleanup.job';
import { AuditCleanupJob } from './jobs/cleanup/audit-cleanup.job';
import { TempFilesCleanupJob } from './jobs/cleanup/temp-files-cleanup.job';
import { AnalyticsCleanupJob } from './jobs/cleanup/analytics-cleanup.job';
import { DbMaintenanceJob } from './jobs/maintenance/db-maintenance.job';
import { DailyStatsJob } from './jobs/analytics/daily-stats.job';
import { RatingRecalcJob } from './jobs/analytics/rating-recalc.job';
import { QueueHealthService } from './monitoring/queue-health.service';
import { QueueMetricsService } from './monitoring/queue-metrics.service';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    UploadModule,
    ReviewsModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'notifications', // Queue for order/proposal notifications
      },
    ),
  ],
  providers: [
    NotificationProcessor,
    // Cleanup jobs (PIPEDA compliance)
    ChatCleanupJob,
    SessionCleanupJob,
    NotificationCleanupJob,
    AuditCleanupJob,
    TempFilesCleanupJob,
    AnalyticsCleanupJob,
    // Maintenance jobs
    DbMaintenanceJob,
    // Analytics jobs
    DailyStatsJob,
    RatingRecalcJob,
    // Monitoring services
    QueueHealthService,
    QueueMetricsService,
  ],
  exports: [BullModule, QueueHealthService, QueueMetricsService],
})
export class QueueModule {}

