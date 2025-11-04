import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RedisModule } from '@nestjs-modules/ioredis';
import { APP_GUARD } from '@nestjs/core';
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
