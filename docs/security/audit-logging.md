# Audit Logging - PIPEDA Compliance

> **Version:** 1.0  
> **Last Updated:** November 2, 2025  
> **Compliance:** PIPEDA (Personal Information Protection and Electronic Documents Act)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What to Log](#what-to-log)
3. [Database Schema](#database-schema)
4. [Audit Events](#audit-events)
5. [Implementation](#implementation)
6. [Retention Policies](#retention-policies)
7. [Query & Search](#query--search)
8. [Security](#security)
9. [PIPEDA Requirements](#pipeda-requirements)

---

## Overview

### Why Audit Logging?

**Legal Requirements (PIPEDA):**
- Track all access to personal information
- Document data modifications
- Prove compliance during audits
- Support user data access requests
- Incident investigation and forensics

**Business Benefits:**
- Detect unauthorized access
- Track admin actions
- Debug production issues
- User activity analytics
- Dispute resolution evidence

---

## What to Log

### HIGH PRIORITY (MUST log)

**Authentication & Authorization:**
- ✅ Login attempts (success and failures)
- ✅ Logout events
- ✅ Password changes
- ✅ Password reset requests
- ✅ Email changes
- ✅ 2FA enable/disable
- ✅ Account creation
- ✅ Account deletion

**Personal Data Access (PIPEDA Critical):**
- ✅ User profile viewed
- ✅ User data exported (Right to Access)
- ✅ User data modified (Right to Rectification)
- ✅ User data deleted (Right to Erasure)
- ✅ Admin viewing user data
- ✅ API key generation/revocation

**Financial Transactions:**
- ✅ Payment created
- ✅ Payment completed
- ✅ Payment refunded
- ✅ Payout initiated
- ✅ Payout completed
- ✅ Subscription created/updated/cancelled
- ✅ Admin refund/transfer

**Business Logic:**
- ✅ Order created
- ✅ Order status changed
- ✅ Order accepted/rejected
- ✅ Order cancelled
- ✅ Dispute opened
- ✅ Dispute resolved
- ✅ Review submitted
- ✅ Review moderated

**Admin Actions:**
- ✅ User verification approved/rejected
- ✅ Portfolio item moderated
- ✅ User suspended/banned
- ✅ Category created/updated/deleted
- ✅ Content moderated
- ✅ System settings changed

### MEDIUM PRIORITY (Should log)

- Chat message sent (without content, just metadata)
- File uploaded
- Email sent
- Push notification sent
- QR code generated
- Profile viewed

### LOW PRIORITY (Optional)

- API endpoint accessed (high volume, only for debugging)
- Search queries performed
- Filter selections

---

## Database Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  
  // Who performed the action
  userId      String?  @map("user_id")
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // What action was performed
  action      AuditAction
  
  // What resource was affected
  resource    String   // Table name: users, orders, payments, etc.
  resourceId  String   @map("resource_id") // ID of the affected record
  
  // Additional context
  description String?  // Human-readable description
  metadata    Json?    // Additional data (old values, new values, etc.)
  
  // Request context
  ipAddress   String   @map("ip_address")
  userAgent   String?  @map("user_agent")
  requestId   String?  @map("request_id") // Correlation ID
  
  // Result
  success     Boolean  @default(true)
  errorMessage String? @map("error_message")
  
  // Timestamp
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([userId])
  @@index([action])
  @@index([resource, resourceId])
  @@index([createdAt])
  @@index([ipAddress])
  @@map("audit_logs")
}

enum AuditAction {
  // Authentication
  LOGIN_SUCCESS
  LOGIN_FAILED
  LOGOUT
  PASSWORD_CHANGED
  PASSWORD_RESET_REQUESTED
  EMAIL_CHANGED
  TWO_FACTOR_ENABLED
  TWO_FACTOR_DISABLED
  
  // Account Management
  ACCOUNT_CREATED
  ACCOUNT_DELETED
  ACCOUNT_SUSPENDED
  ACCOUNT_UNSUSPENDED
  ACCOUNT_VERIFIED
  
  // Personal Data Access (PIPEDA)
  USER_DATA_ACCESSED
  USER_DATA_EXPORTED
  USER_DATA_MODIFIED
  USER_DATA_DELETED
  
  // Orders
  ORDER_CREATED
  ORDER_UPDATED
  ORDER_DELETED
  ORDER_PUBLISHED
  ORDER_ACCEPTED
  ORDER_REJECTED
  ORDER_CANCELLED
  ORDER_COMPLETED
  
  // Payments
  PAYMENT_CREATED
  PAYMENT_SUCCEEDED
  PAYMENT_FAILED
  PAYMENT_REFUNDED
  PAYOUT_INITIATED
  PAYOUT_COMPLETED
  
  // Reviews
  REVIEW_SUBMITTED
  REVIEW_REPLIED
  REVIEW_MODERATED
  
  // Disputes
  DISPUTE_OPENED
  DISPUTE_UPDATED
  DISPUTE_RESOLVED
  DISPUTE_CLOSED
  
  // Admin Actions
  USER_VERIFIED_BY_ADMIN
  USER_BANNED_BY_ADMIN
  CONTENT_MODERATED
  CATEGORY_CREATED
  CATEGORY_UPDATED
  CATEGORY_DELETED
  SETTINGS_CHANGED
  
  // Other
  FILE_UPLOADED
  CHAT_MESSAGE_SENT
  NOTIFICATION_SENT
  QR_CODE_GENERATED
}
```

---

## Audit Events

### 1. Authentication Events

#### LOGIN_SUCCESS

```typescript
await auditService.log({
  action: AuditAction.LOGIN_SUCCESS,
  userId: user.id,
  resource: 'users',
  resourceId: user.id,
  description: 'User logged in successfully',
  metadata: {
    loginMethod: 'email', // or 'google', 'apple'
    deviceType: 'web',    // or 'mobile'
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### LOGIN_FAILED

```typescript
await auditService.log({
  action: AuditAction.LOGIN_FAILED,
  userId: null, // Unknown user
  resource: 'users',
  resourceId: attemptedEmail,
  description: 'Login attempt failed',
  metadata: {
    email: maskEmail(attemptedEmail),
    reason: 'invalid_password', // or 'user_not_found', 'account_suspended'
  },
  success: false,
  errorMessage: 'Invalid credentials',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### 2. Personal Data Access (PIPEDA Critical)

#### USER_DATA_ACCESSED

```typescript
// When admin views user profile
await auditService.log({
  action: AuditAction.USER_DATA_ACCESSED,
  userId: admin.id,
  resource: 'users',
  resourceId: targetUser.id,
  description: `Admin ${admin.email} viewed user profile`,
  metadata: {
    viewedBy: 'admin',
    viewedFields: ['email', 'phone', 'address'],
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### USER_DATA_EXPORTED

```typescript
// Right to Access - User exports their data
await auditService.log({
  action: AuditAction.USER_DATA_EXPORTED,
  userId: user.id,
  resource: 'users',
  resourceId: user.id,
  description: 'User requested data export',
  metadata: {
    exportFormat: 'json', // or 'pdf'
    dataTypes: ['profile', 'orders', 'messages', 'payments'],
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### USER_DATA_MODIFIED

```typescript
// Track what changed
await auditService.log({
  action: AuditAction.USER_DATA_MODIFIED,
  userId: user.id,
  resource: 'users',
  resourceId: user.id,
  description: 'User updated profile',
  metadata: {
    changedFields: ['phone', 'address'],
    oldValues: {
      phone: maskPhone(oldPhone),
      address: 'Toronto, ON',
    },
    newValues: {
      phone: maskPhone(newPhone),
      address: 'Vancouver, BC',
    },
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### USER_DATA_DELETED

```typescript
// Right to Erasure - Account deletion
await auditService.log({
  action: AuditAction.USER_DATA_DELETED,
  userId: user.id,
  resource: 'users',
  resourceId: user.id,
  description: 'User requested account deletion',
  metadata: {
    deletionReason: user.deletionReason,
    dataRetained: ['order_history', 'payment_records'], // For tax law
    dataAnonymized: ['reviews', 'messages'],
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### 3. Payment Events

#### PAYMENT_CREATED

```typescript
await auditService.log({
  action: AuditAction.PAYMENT_CREATED,
  userId: client.id,
  resource: 'payments',
  resourceId: payment.id,
  description: 'Payment intent created',
  metadata: {
    orderId: order.id,
    amount: payment.amountTotal,
    currency: 'CAD',
    paymentIntentId: payment.paymentIntentId,
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### PAYMENT_SUCCEEDED

```typescript
await auditService.log({
  action: AuditAction.PAYMENT_SUCCEEDED,
  userId: client.id,
  resource: 'payments',
  resourceId: payment.id,
  description: 'Payment completed successfully',
  metadata: {
    orderId: order.id,
    amount: payment.amountTotal,
    paymentMethod: 'card',
    last4: '4242',
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

#### PAYMENT_REFUNDED

```typescript
await auditService.log({
  action: AuditAction.PAYMENT_REFUNDED,
  userId: admin.id, // Who initiated refund
  resource: 'payments',
  resourceId: payment.id,
  description: 'Payment refunded',
  metadata: {
    orderId: order.id,
    originalAmount: payment.amountTotal,
    refundAmount: refund.amount,
    refundReason: 'dispute_resolved',
    initiatedBy: admin.email,
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### 4. Admin Actions

#### USER_BANNED_BY_ADMIN

```typescript
await auditService.log({
  action: AuditAction.USER_BANNED_BY_ADMIN,
  userId: admin.id,
  resource: 'users',
  resourceId: bannedUser.id,
  description: `User banned by admin`,
  metadata: {
    adminEmail: admin.email,
    bannedUserEmail: maskEmail(bannedUser.email),
    reason: banReason,
    duration: 'permanent', // or '7_days'
    relatedDisputes: [disputeId1, disputeId2],
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

## Implementation

### Audit Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { Request } from 'express';

interface AuditLogInput {
  action: AuditAction;
  userId?: string;
  resource: string;
  resourceId: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log audit event
   */
  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: input.action,
          userId: input.userId,
          resource: input.resource,
          resourceId: input.resourceId,
          description: input.description,
          metadata: input.metadata as any,
          ipAddress: input.ipAddress || 'unknown',
          userAgent: input.userAgent,
          requestId: input.requestId,
          success: input.success ?? true,
          errorMessage: input.errorMessage,
        },
      });
    } catch (error) {
      // NEVER throw - audit logging should not break app flow
      console.error('Audit log failed:', error);
    }
  }

  /**
   * Log from Express request
   */
  async logFromRequest(
    req: Request,
    input: Omit<AuditLogInput, 'ipAddress' | 'userAgent' | 'requestId'>,
  ): Promise<void> {
    await this.log({
      ...input,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: (req as any).correlationId,
    });
  }

  /**
   * Query audit logs
   */
  async findLogs(filter: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50, ...where } = filter;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          userId: where.userId,
          action: where.action,
          resource: where.resource,
          resourceId: where.resourceId,
          createdAt: {
            gte: where.startDate,
            lte: where.endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user activity timeline
   */
  async getUserTimeline(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        resource: true,
        description: true,
        createdAt: true,
      },
    });
  }

  /**
   * Clean up old logs (scheduled job)
   */
  async cleanupOldLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}
```

### Audit Interceptor (Auto-logging)

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url } = request;

    // Only log state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const startTime = Date.now();

      return next.handle().pipe(
        tap({
          next: () => {
            // Log success
            this.auditService.logFromRequest(request, {
              action: this.getActionFromRoute(method, url),
              userId: user?.id,
              resource: this.getResourceFromRoute(url),
              resourceId: this.getResourceIdFromRoute(url),
              description: `${method} ${url}`,
              metadata: {
                duration: Date.now() - startTime,
              },
              success: true,
            });
          },
          error: (error) => {
            // Log failure
            this.auditService.logFromRequest(request, {
              action: this.getActionFromRoute(method, url),
              userId: user?.id,
              resource: this.getResourceFromRoute(url),
              resourceId: this.getResourceIdFromRoute(url),
              description: `${method} ${url}`,
              success: false,
              errorMessage: error.message,
            });
          },
        }),
      );
    }

    return next.handle();
  }

  private getActionFromRoute(method: string, url: string): AuditAction {
    // Map HTTP method + route to AuditAction
    // This is simplified - implement proper mapping
    return AuditAction.USER_DATA_MODIFIED;
  }

  private getResourceFromRoute(url: string): string {
    // Extract resource from URL: /api/v1/users/123 -> users
    const parts = url.split('/');
    return parts[3] || 'unknown';
  }

  private getResourceIdFromRoute(url: string): string {
    // Extract resource ID from URL: /api/v1/users/123 -> 123
    const parts = url.split('/');
    return parts[4] || 'unknown';
  }
}
```

---

## Retention Policies

| Log Type | Retention Period | Reason |
|----------|------------------|--------|
| **Authentication** | 1 year | Security & compliance |
| **Personal Data Access** | 7 years | PIPEDA requirement |
| **Payment Records** | 7 years | Canadian Tax Law (CRA) |
| **Admin Actions** | 7 years | Legal compliance |
| **Order History** | 5 years | Dispute resolution |
| **General Activity** | 1 year | Operational data |

### Scheduled Cleanup Job

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from './audit.service';

@Injectable()
export class AuditCleanupJob {
  constructor(private readonly auditService: AuditService) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleCleanup() {
    // Clean up logs older than retention period
    const deletedCount = await this.auditService.cleanupOldLogs(365); // 1 year
    console.log(`Cleaned up ${deletedCount} old audit logs`);
  }
}
```

---

## Query & Search

### Admin Dashboard - Audit Log Viewer

```typescript
@Get('admin/audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
async getAuditLogs(
  @Query() query: AuditLogQueryDto,
) {
  return this.auditService.findLogs({
    userId: query.userId,
    action: query.action,
    resource: query.resource,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    page: query.page,
    limit: query.limit,
  });
}
```

### User Data Access Request (PIPEDA)

```typescript
@Get('users/me/audit-logs')
@UseGuards(JwtAuthGuard)
async getMyAuditLogs(@User() user: UserEntity) {
  // User can see their own audit logs
  return this.auditService.findLogs({
    userId: user.id,
    page: 1,
    limit: 100,
  });
}
```

---

## Security

### 1. Never Log Sensitive Data

```typescript
// ❌ BAD
metadata: {
  password: user.password,      // NO!
  cardNumber: payment.card,     // NO!
  ssn: user.ssn,               // NO!
}

// ✅ GOOD
metadata: {
  email: maskEmail(user.email),
  phone: maskPhone(user.phone),
  last4: '4242',
}
```

### 2. Tamper-Proof Logs

```typescript
// Option 1: Use append-only database
// Option 2: Hash each log entry
interface AuditLog {
  hash: string; // SHA-256 of (previousHash + logData)
}

// Option 3: Store in immutable storage (S3 with versioning)
```

### 3. Access Control

```typescript
// Only admins can view audit logs
@UseGuards(JwtAuthGuard, AdminGuard)
async getAuditLogs() { ... }

// Users can only see their own logs
@UseGuards(JwtAuthGuard)
async getMyAuditLogs(@User() user) {
  return this.auditService.findLogs({ userId: user.id });
}
```

---

## PIPEDA Requirements

### Right to Access

User requests: "Show me all data you have about me"

```typescript
@Get('users/me/data')
@UseGuards(JwtAuthGuard)
async exportMyData(@User() user: UserEntity) {
  const data = {
    profile: await this.usersService.findOne(user.id),
    orders: await this.ordersService.findByUserId(user.id),
    payments: await this.paymentsService.findByUserId(user.id),
    reviews: await this.reviewsService.findByUserId(user.id),
    auditLogs: await this.auditService.getUserTimeline(user.id, 365),
  };

  // Log this access
  await this.auditService.log({
    action: AuditAction.USER_DATA_EXPORTED,
    userId: user.id,
    resource: 'users',
    resourceId: user.id,
    description: 'User exported their data',
  });

  return data;
}
```

### Right to Erasure

User requests: "Delete all my data"

```typescript
@Delete('users/me')
@UseGuards(JwtAuthGuard)
async deleteMyAccount(@User() user: UserEntity) {
  // 1. Anonymize reviews (keep for integrity)
  await this.reviewsService.anonymizeUserReviews(user.id);

  // 2. Delete personal data
  await this.usersService.deletePersonalData(user.id);

  // 3. Keep payment records (7 years - tax law)
  // (mark as deleted but don't actually delete)

  // 4. Log deletion
  await this.auditService.log({
    action: AuditAction.USER_DATA_DELETED,
    userId: user.id,
    resource: 'users',
    resourceId: user.id,
    description: 'User deleted their account',
    metadata: {
      dataRetained: ['payment_records'],
      dataAnonymized: ['reviews'],
    },
  });

  return { message: 'Account deleted successfully' };
}
```

---

## Performance Considerations

### 1. Async Logging

```typescript
// Don't block request with audit logging
async log(input: AuditLogInput): Promise<void> {
  // Fire and forget
  setImmediate(() => {
    this.prisma.auditLog.create({ data: input }).catch(console.error);
  });
}
```

### 2. Batch Inserts

```typescript
// For high-volume events
private logBuffer: AuditLogInput[] = [];

async batchLog(input: AuditLogInput): Promise<void> {
  this.logBuffer.push(input);

  if (this.logBuffer.length >= 100) {
    await this.flush();
  }
}

async flush(): Promise<void> {
  const logs = [...this.logBuffer];
  this.logBuffer = [];

  await this.prisma.auditLog.createMany({ data: logs });
}
```

### 3. Database Indexes

```sql
-- Already in Prisma schema
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
```

---

## Monitoring & Alerts

### Suspicious Activity Detection

```typescript
// Alert on too many failed login attempts
async detectBruteForce(userId: string): Promise<boolean> {
  const recentFailures = await this.prisma.auditLog.count({
    where: {
      userId,
      action: AuditAction.LOGIN_FAILED,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
      },
    },
  });

  if (recentFailures >= 5) {
    // Send alert to security team
    await this.alertService.send({
      type: 'BRUTE_FORCE_DETECTED',
      userId,
      failureCount: recentFailures,
    });
    return true;
  }

  return false;
}
```

---

**Last updated:** November 2, 2025  
**Status:** Ready for implementation  
**Priority:** CRITICAL (PIPEDA Compliance)

