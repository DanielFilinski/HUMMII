import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryTreeService } from './services/category-tree.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryTreeService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

