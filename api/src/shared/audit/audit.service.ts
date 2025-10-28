import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './interfaces/audit-log.interface';

/**
 * AuditService - Handles audit logging for PIPEDA compliance
 *
 * PIPEDA Requirements:
 * - Log all access to personal information
 * - Log all modifications to personal information
 * - Log all deletions and exports of personal data
 * - Maintain logs for minimum 1 year
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an audit log entry
   */
  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          changes: data.changes as any,
          metadata: data.metadata as any,
          success: data.success ?? true,
          errorMessage: data.errorMessage,
        },
      });
    } catch (error) {
      // Never throw errors from audit logging - log and continue
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Get audit logs for a specific user
   * Used for PIPEDA compliance reporting
   */
  async getUserAuditLogs(userId: string, limit: number = 100) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get audit logs by action type
   */
  async getAuditLogsByAction(action: string, limit: number = 100) {
    return this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get audit logs for specific entity
   */
  async getEntityAuditLogs(entity: string, entityId: string, limit: number = 100) {
    return this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get recent failed login attempts for security monitoring
   */
  async getFailedLogins(hours: number = 24, limit: number = 100) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.prisma.auditLog.findMany({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: {
          gte: since,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Clean up old audit logs (retention policy)
   * PIPEDA requires minimum 1 year retention
   */
  async cleanupOldLogs(retentionDays: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} audit logs older than ${retentionDays} days`);
    return result;
  }
}
