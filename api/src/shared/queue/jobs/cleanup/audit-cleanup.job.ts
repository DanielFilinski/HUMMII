import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AuditService } from '../../../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../../../shared/audit/enums/audit-action.enum';

/**
 * Audit Logs Cleanup Job
 * PIPEDA Compliance: Keep audit logs for minimum 1 year, delete logs older than 1 year
 * Schedule: Weekly Sunday at 01:00 UTC
 */
@Injectable()
export class AuditCleanupJob {
  private readonly logger = new Logger(AuditCleanupJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron('0 1 * * 0', {
    timeZone: 'UTC',
  })
  async cleanupOldAuditLogs(): Promise<void> {
    this.logger.log('Starting audit logs cleanup job');

    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Delete audit logs older than 1 year
      // Keep minimum 1 year per PIPEDA requirement
      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: oneYearAgo },
        },
      });

      this.logger.log(
        `Audit logs cleanup completed: ${result.count} logs deleted (>1 year)`,
      );

      // Log the cleanup action itself for audit trail (meta!)
      await this.auditService.log({
        action: AuditAction.DATA_CLEANUP,
        entity: AuditEntity.AUDIT_LOG,
        metadata: {
          deletedCount: result.count,
          retentionPeriod: '1 year minimum',
          criteria: 'audit logs older than 1 year',
        },
      });
    } catch (error) {
      this.logger.error('Failed to cleanup audit logs:', error);
      throw error;
    }
  }
}
