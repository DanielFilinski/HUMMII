import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { PreferencesController } from './preferences/preferences.controller';
import { PreferencesService } from './preferences/preferences.service';
import { TemplateService } from './services/template.service';
import { OneSignalModule } from './integrations/onesignal.module';
import { OneSignalService } from './integrations/onesignal.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { QueueModule } from '../shared/queue/queue.module';

/**
 * Notifications Module
 *
 * Provides multi-channel notification system:
 * - In-app notifications (WebSocket/Socket.io)
 * - Email notifications (OneSignal)
 * - Push notifications (OneSignal)
 * - User preferences management
 * - Notification history (90 days retention)
 * - Multi-language templates (EN/FR)
 */
@Module({
  imports: [
    PrismaModule,
    QueueModule,
    OneSignalModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController, PreferencesController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    PreferencesService,
    TemplateService,
    OneSignalService,
  ],
  exports: [NotificationsService, NotificationsGateway, PreferencesService],
})
export class NotificationsModule {}

