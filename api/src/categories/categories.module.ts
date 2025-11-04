import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuditModule } from '../shared/audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

