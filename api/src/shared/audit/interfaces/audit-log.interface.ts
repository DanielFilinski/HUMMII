import { AuditAction, AuditEntity } from '../enums/audit-action.enum';

/**
 * Interface for creating audit log entries
 */
export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  resourceType?: string; // NEW: For flexible resource type logging
  resourceId?: string;   // NEW: Alternative to entityId
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Context data for audit logging
 */
export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}
