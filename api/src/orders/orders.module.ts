import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { QueueModule } from '../shared/queue/queue.module';
import { AuditModule } from '../shared/audit/audit.module';
import { OrderOwnerGuard } from './guards/order-owner.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    AuditModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [OrdersController, ProposalsController],
  providers: [OrdersService, ProposalsService, OrderOwnerGuard],
  exports: [OrdersService, ProposalsService],
})
export class OrdersModule {}

