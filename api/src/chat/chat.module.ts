import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ContentModerationService } from './services/content-moderation.service';
import { ChatSessionService } from './services/chat-session.service';
import { ChatExportService } from './services/chat-export.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';
import { OrderParticipantGuard } from './guards/order-participant.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * Chat Module
 * 
 * Provides real-time chat functionality for order communication:
 * - WebSocket gateway for real-time messaging
 * - REST API for history and fallback
 * - Content moderation (automatic filtering)
 * - Session management with Redis
 * - Rate limiting and security
 */
@Module({
  imports: [
    PrismaModule,
    AuditModule,
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
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ContentModerationService,
    ChatSessionService,
    ChatExportService,
    OrderParticipantGuard,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    ChatService,
    ChatGateway,
    ChatSessionService,
    ChatExportService,
    ContentModerationService,
  ],
})
export class ChatModule {}

