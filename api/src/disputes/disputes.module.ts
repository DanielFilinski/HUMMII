import { Module, forwardRef } from '@nestjs/common';
import { DisputesController, AdminDisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { EvidenceService } from './services/evidence.service';
import { DisputeMessagesService } from './services/dispute-messages.service';
import { ResolutionService } from './services/resolution.service';
import { DisputeAccessGuard } from './guards/dispute-access.guard';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';
import { AdminModule } from '../admin/admin.module';
import { UploadModule } from '../shared/upload/upload.module';
import { ChatModule } from '../chat/chat.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AdminModule,
    UploadModule,
    ChatModule, // For ContentModerationService (optional)
    forwardRef(() => NotificationsModule),
  ],
  controllers: [DisputesController, AdminDisputesController],
  providers: [
    DisputesService,
    EvidenceService,
    DisputeMessagesService,
    ResolutionService,
    DisputeAccessGuard,
  ],
  exports: [DisputesService, ResolutionService],
})
export class DisputesModule {}

