import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

/**
 * Session Cleanup Job
 * Security Requirement: Delete expired sessions (>7 days old)
 * Schedule: Daily at 03:00 UTC
 */
@Injectable()
export class SessionCleanupJob {
  private readonly logger = new Logger(SessionCleanupJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: 'UTC',
  })
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.log('Starting session cleanup job');

    try {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Delete expired sessions from database
      const result = await this.prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } }, // Expired sessions
            { createdAt: { lt: sevenDaysAgo } }, // Sessions older than 7 days
          ],
        },
      });

      this.logger.log(
        `Session cleanup completed: ${result.count} sessions deleted`,
      );

      // Clean Redis session cache (remove expired keys)
      // Pattern: hummii:session:* or similar
      const keys = await this.redis.keys('hummii:session:*');
      if (keys.length > 0) {
        const expiredKeys: string[] = [];
        for (const key of keys) {
          const ttl = await this.redis.ttl(key);
          if (ttl === -1 || ttl === -2) {
            // Key has no expiration or doesn't exist
            expiredKeys.push(key);
          }
        }
        if (expiredKeys.length > 0) {
          await this.redis.del(...expiredKeys);
          this.logger.log(`Cleaned ${expiredKeys.length} expired Redis session keys`);
        }
      }

      // Log cleanup action for audit trail
      await this.auditService.log({
        action: AuditAction.DATA_CLEANUP,
        entity: AuditEntity.SESSION,
        metadata: {
          deletedCount: result.count,
          retentionPeriod: '7 days',
          criteria: 'expired sessions or sessions older than 7 days',
        },
      });
    } catch (error) {
      this.logger.error('Failed to cleanup sessions:', error);
      throw error;
    }
  }
}
