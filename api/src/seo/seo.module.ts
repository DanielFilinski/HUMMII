import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SlugService } from './services/slug.service';
import { MetadataService } from './services/metadata.service';
import { RedirectService } from './services/redirect.service';
import { OpengraphService } from './services/opengraph.service';
import { StructuredDataService } from './services/structured-data.service';
import { SitemapService } from './services/sitemap.service';
import { IsrService } from './services/isr.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';
import { ContractorsModule } from '../contractors/contractors.module';
import { CategoriesModule } from '../categories/categories.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SitemapController } from './controllers/sitemap.controller';
import { RedirectMiddleware } from './middleware/redirect.middleware';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    forwardRef(() => ContractorsModule),
    CategoriesModule,
    ReviewsModule,
  ],
  controllers: [SeoController, SitemapController],
  providers: [
    SlugService,
    MetadataService,
    RedirectService,
    OpengraphService,
    StructuredDataService,
    SitemapService,
    IsrService,
    RedirectMiddleware,
  ],
  exports: [
    SlugService,
    MetadataService,
    RedirectService,
    OpengraphService,
    StructuredDataService,
    SitemapService,
    IsrService,
  ],
})
export class SeoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RedirectMiddleware).forRoutes('*');
  }
}

