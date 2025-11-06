import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DisputesModule } from '../disputes/disputes.module';
import { CategoriesModule } from '../categories/categories.module';
import { SeoModule } from '../seo/seo.module';
import { MaintenanceModeMiddleware } from './middleware/maintenance-mode.middleware';
import { FeatureFlagsService } from './services/feature-flags.service';

@Module({
  imports: [PrismaModule, AuditModule, ReviewsModule, SubscriptionsModule, OrdersModule, NotificationsModule, forwardRef(() => DisputesModule), CategoriesModule, SeoModule],
  controllers: [AdminController],
  providers: [AdminService, FeatureFlagsService],
  exports: [AdminService, FeatureFlagsService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply maintenance mode middleware to all routes except admin routes
    consumer.apply(MaintenanceModeMiddleware).exclude('/api/admin/(.*)').forRoutes('*');
  }
}
