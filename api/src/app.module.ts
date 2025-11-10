import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@nestjs-modules/ioredis';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './core/guards/custom-throttler.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { QueueModule } from './shared/queue/queue.module';
import { EmailModule } from './shared/email/email.module';
import { AuditModule } from './shared/audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ContractorsModule } from './contractors/contractors.module';
import { CategoriesModule } from './categories/categories.module';
import { VerificationModule } from './verification/verification.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DisputesModule } from './disputes/disputes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SeoModule } from './seo/seo.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './monitoring/metrics.module';
import { validate } from './config/env.validation';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Redis (global for sessions and caching)
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: 0,
          keyPrefix: 'hummii:',
        },
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduled tasks (cron jobs)
    ScheduleModule.forRoot(),

    // Shared modules
    PrismaModule,
    QueueModule, // Background jobs and email queue
    EmailModule,
    AuditModule, // Global audit logging for PIPEDA compliance

    // Feature modules
    AuthModule,
    UsersModule,
    AdminModule, // Admin panel API
    ContractorsModule, // Contractor profiles and portfolio
    CategoriesModule, // Categories for contractors
    VerificationModule, // Verification stub (Stripe Identity placeholder)
    OrdersModule, // Orders and proposals management (Phase 3)
    ChatModule, // Real-time chat for order communication (Phase 4)
    ReviewsModule, // Reviews and ratings system (Phase 5)
    SubscriptionsModule, // Subscription management (Phase 6)
    DisputesModule, // Dispute resolution system (Phase 7)
    NotificationsModule, // Notifications system (Phase 8)
    SeoModule, // SEO optimization and sitemap (Phase 13)
    AnalyticsModule, // Privacy-compliant analytics (Phase 13)
    HealthModule, // Health check endpoints
    MetricsModule, // Prometheus metrics for monitoring (Phase 15)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
