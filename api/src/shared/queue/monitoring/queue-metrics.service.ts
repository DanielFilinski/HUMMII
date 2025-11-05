import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Queue Metrics Collection Service
 * Collects and aggregates queue performance metrics
 */
@Injectable()
export class QueueMetricsService {
  private readonly logger = new Logger(QueueMetricsService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  /**
   * Get queue metrics
   */
  async getMetrics(): Promise<{
    queues: Record<string, {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      successRate: number;
      avgProcessingTime?: number;
    }>;
    summary: {
      totalWaiting: number;
      totalActive: number;
      totalCompleted: number;
      totalFailed: number;
      overallSuccessRate: number;
    };
  }> {
    try {
      const queues: Record<string, any> = {};

      // Email queue metrics
      const emailMetrics = await this.getQueueMetrics(this.emailQueue);
      queues.email = emailMetrics;

      // Notifications queue metrics
      const notificationsMetrics = await this.getQueueMetrics(this.notificationsQueue);
      queues.notifications = notificationsMetrics;

      // Summary
      const summary = {
        totalWaiting: emailMetrics.waiting + notificationsMetrics.waiting,
        totalActive: emailMetrics.active + notificationsMetrics.active,
        totalCompleted: emailMetrics.completed + notificationsMetrics.completed,
        totalFailed: emailMetrics.failed + notificationsMetrics.failed,
        overallSuccessRate:
          emailMetrics.completed + notificationsMetrics.completed > 0
            ? ((emailMetrics.completed + notificationsMetrics.completed) /
                (emailMetrics.completed +
                  notificationsMetrics.completed +
                  emailMetrics.failed +
                  notificationsMetrics.failed)) *
              100
            : 100,
      };

      return {
        queues,
        summary,
      };
    } catch (error) {
      this.logger.error('Failed to get queue metrics:', error);
      throw error;
    }
  }

  /**
   * Get individual queue metrics
   */
  private async getQueueMetrics(queue: Queue): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    successRate: number;
    avgProcessingTime?: number;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      const total = completed + failed;
      const successRate = total > 0 ? (completed / total) * 100 : 100;

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        successRate: Number(successRate.toFixed(2)),
      };
    } catch (error) {
      this.logger.error(`Failed to get queue metrics for ${queue.name}:`, error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        successRate: 0,
      };
    }
  }
}
