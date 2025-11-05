import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OneSignalService } from './onesignal.service';
import oneSignalConfig from './onesignal.config';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { TemplateModule } from '../services/template.module';

@Module({
  imports: [
    ConfigModule.forFeature(oneSignalConfig),
    PrismaModule,
    TemplateModule,
  ],
  providers: [OneSignalService],
  exports: [OneSignalService],
})
export class OneSignalModule {}

