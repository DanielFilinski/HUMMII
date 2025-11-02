import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../shared/audit/audit.service';
import { AuditAction } from '../../shared/audit/enums/audit-action.enum';

/**
 * AuditInterceptor - Automatically logs all operations for PIPEDA compliance
 *
 * Usage:
 * - Can be applied globally or to specific controllers
 * - Logs all HTTP requests with user info, action, and metadata
 *
 * Features:
 * - Automatically determines action type from HTTP method
 * - Extracts resource type and ID from URL
 * - Logs IP address and user agent
 * - Only logs authenticated requests
 * - Skips auth endpoints to avoid duplicate logging
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip, headers } = request;

    return next.handle().pipe(
      tap(async () => {
        // Only log if user is authenticated
        if (!user) {
          return;
        }

        // Skip logging for certain endpoints to avoid duplication
        if (this.shouldSkipAudit(url)) {
          return;
        }

        // Determine if this is a sensitive operation that should be logged
        if (this.shouldAudit(method, url)) {
          try {
            await this.auditService.log({
              userId: user.userId,
              action: this.mapMethodToAction(method),
              resourceType: this.extractResourceType(url),
              resourceId: this.extractResourceId(url),
              ipAddress: ip,
              userAgent: headers['user-agent'],
              metadata: {
                method,
                url,
                timestamp: new Date().toISOString(),
              },
            });
          } catch (error) {
            // Log error but don't fail the request
            console.error('Failed to create audit log:', error);
          }
        }
      }),
    );
  }

  /**
   * Determine if URL should be skipped from auditing
   */
  private shouldSkipAudit(url: string): boolean {
    const skipPatterns = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/verify-email',
      '/auth/sessions', // Already logged in AuthService
      '/health',
      '/api/docs',
    ];

    return skipPatterns.some((pattern) => url.includes(pattern));
  }

  /**
   * Determine if this operation should be audited based on method and URL
   */
  private shouldAudit(method: string, url: string): boolean {
    // Audit all CREATE, UPDATE, DELETE operations
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return true;
    }

    // Audit GET requests for sensitive data
    const sensitivePatterns = [
      '/users/me/export', // PIPEDA: Data portability
      '/admin/', // All admin operations
      '/audit-logs', // Viewing audit logs
    ];

    return sensitivePatterns.some((pattern) => url.includes(pattern));
  }

  /**
   * Map HTTP method to AuditAction enum
   */
  private mapMethodToAction(method: string): AuditAction {
    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      PATCH: AuditAction.UPDATE,
      PUT: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
      GET: AuditAction.READ,
    };

    return actionMap[method] || AuditAction.READ;
  }

  /**
   * Extract resource type from URL
   * Examples:
   * /api/v1/users/123 -> 'user'
   * /users/me -> 'user'
   * /admin/contractors/456 -> 'contractor'
   */
  private extractResourceType(url: string): string {
    // Remove query parameters
    const cleanUrl = url.split('?')[0];

    // Split by / and filter empty strings
    const segments = cleanUrl.split('/').filter(Boolean);

    // Common patterns
    if (segments.includes('users')) return 'user';
    if (segments.includes('contractors')) return 'contractor';
    if (segments.includes('orders')) return 'order';
    if (segments.includes('reviews')) return 'review';
    if (segments.includes('portfolio')) return 'portfolio';
    if (segments.includes('services')) return 'service';
    if (segments.includes('categories')) return 'category';
    if (segments.includes('audit-logs')) return 'audit_log';
    if (segments.includes('admin')) return 'admin';

    // Default: use first non-api/v1 segment
    const filtered = segments.filter(
      (s) => !['api', 'v1', 'me'].includes(s) && !s.match(/^[0-9a-f-]{36}$/i),
    );

    return filtered[0] || 'unknown';
  }

  /**
   * Extract resource ID from URL
   * Examples:
   * /users/123abc -> '123abc'
   * /admin/users/456def -> '456def'
   */
  private extractResourceId(url: string): string | undefined {
    // Remove query parameters
    const cleanUrl = url.split('?')[0];

    // Split by / and find UUID-like segments
    const segments = cleanUrl.split('/').filter(Boolean);

    // Look for UUID pattern (8-4-4-4-12 format)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const resourceId = segments.find((segment) => uuidPattern.test(segment));

    return resourceId;
  }
}
