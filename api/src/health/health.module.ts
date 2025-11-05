import { Module } from '@nestjs/common';
import { QueueModule } from '../shared/queue/queue.module';
import { QueueHealthController } from './queue.health';

/**
 * Health Check Module
 * Provides health check endpoints for monitoring
 */
@Module({
  imports: [QueueModule],
  controllers: [QueueHealthController],
})
export class HealthModule {}
