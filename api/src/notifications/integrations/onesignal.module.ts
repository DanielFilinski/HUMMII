import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OneSignalService } from './onesignal.service';
import oneSignalConfig from './onesignal.config';

@Module({
  imports: [ConfigModule.forFeature(oneSignalConfig)],
  providers: [OneSignalService],
  exports: [OneSignalService],
})
export class OneSignalModule {}

