import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

/**
 * Queue Health Monitoring Service
 * Monitors queue connections, worker status, and job health
 */
@Injectable()
export class QueueHealthService {
  private readonly logger = new Logger(QueueHealthService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * Check queue health status
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    queues: Record<string, {
      status: 'healthy' | 'degraded' | 'unhealthy';
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    }>;
    redis: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
  }> {
    try {
      // Check Redis connection
      const redisStart = Date.now();
      await this.redis.ping();
      const redisLatency = Date.now() - redisStart;
      const redisStatus: 'connected' | 'disconnected' = redisLatency < 1000 ? 'connected' : 'disconnected';

      // Check queue health
      const queues: Record<string, any> = {};
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      // Email queue
      const emailHealth = await this.checkQueueHealth(this.emailQueue, 'email');
      queues.email = emailHealth;
      if (emailHealth.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (emailHealth.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }

      // Notifications queue
      const notificationsHealth = await this.checkQueueHealth(
        this.notificationsQueue,
        'notifications',
      );
      queues.notifications = notificationsHealth;
      if (notificationsHealth.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (notificationsHealth.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }

      return {
        status: overallStatus,
        queues,
        redis: {
          status: redisStatus,
          latency: redisLatency,
        },
      };
    } catch (error) {
      this.logger.error('Failed to check queue health:', error);
      return {
        status: 'unhealthy',
        queues: {},
        redis: {
          status: 'disconnected',
        },
      };
    }
  }

  /**
   * Check individual queue health
   */
  private async checkQueueHealth(
    queue: Queue,
    name: string,
  ): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      // Determine health status
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      // Unhealthy if too many failed jobs
      if (failed > 100) {
        status = 'unhealthy';
      }
      // Degraded if many waiting or delayed jobs
      else if (waiting > 1000 || delayed > 100) {
        status = 'degraded';
      }

      return {
        status,
        waiting,
        active,
        completed,
        failed,
        delayed,
      };
    } catch (error) {
      this.logger.error(`Failed to check ${name} queue health:`, error);
      return {
        status: 'unhealthy',
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }
  }
}
