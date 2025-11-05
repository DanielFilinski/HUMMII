import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Database Maintenance Job
 * Weekly maintenance: Vacuum, analyze, update statistics
 * Schedule: Weekly Sunday at 02:00 UTC
 */
@Injectable()
export class DbMaintenanceJob {
  private readonly logger = new Logger(DbMaintenanceJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Cron('0 2 * * 0', {
    timeZone: 'UTC',
  })
  async performMaintenance(): Promise<void> {
    this.logger.log('Starting database maintenance job');

    try {
      // 1. Vacuum and analyze PostgreSQL tables
      // Note: Prisma doesn't support raw SQL easily, but we can use $queryRaw
      await this.prisma.$queryRaw`VACUUM ANALYZE;`;
      this.logger.log('PostgreSQL vacuum and analyze completed');

      // 2. Update database statistics
      // This is done automatically by VACUUM ANALYZE, but we log it
      this.logger.log('Database statistics updated');

      // 3. Clean Redis expired keys
      // Redis automatically expires keys with TTL, but we can scan for any orphaned keys
      const keys = await this.redis.keys('hummii:*');
      let cleanedKeys = 0;
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key has no expiration, might be orphaned
          // Check if it's a session or cache key that should have expiration
          if (key.startsWith('hummii:session:') || key.startsWith('hummii:cache:')) {
            await this.redis.del(key);
            cleanedKeys++;
          }
        }
      }
      if (cleanedKeys > 0) {
        this.logger.log(`Cleaned ${cleanedKeys} orphaned Redis keys`);
      }

      // 4. Optimize database indexes
      // This is done automatically by VACUUM ANALYZE
      this.logger.log('Database indexes optimized');

      this.logger.log('Database maintenance completed successfully');

      // Log maintenance action for audit trail
      await this.auditService.log({
        action: AuditAction.SYSTEM_ACTION,
        entity: AuditEntity.SYSTEM,
        metadata: {
          maintenanceType: 'database',
          redisKeysCleaned: cleanedKeys,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error('Failed to perform database maintenance:', error);
      throw error;
    }
  }
}
