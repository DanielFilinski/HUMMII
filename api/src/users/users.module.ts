import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UploadModule } from '../shared/upload/upload.module';
import { AuditModule } from '../shared/audit/audit.module';

@Module({
  imports: [
    UploadModule,
    AuditModule,
    MulterModule.register({
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB for avatars
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
