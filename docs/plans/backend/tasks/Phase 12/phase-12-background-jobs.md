# Phase 12: Background Jobs & Queues - Detailed Implementation Plan

**Status:** 🟡 HIGH Priority  
**Duration:** Week 25-26 (2 weeks)  
**Dependencies:** Phase 8 (Notifications), Phase 6 (Payments), Phase 5 (Reviews)

---

## 📋 Overview

Phase 12 focuses on implementing a robust background job processing system using Bull/BullMQ with Redis. This system will handle asynchronous tasks, email delivery, data cleanup, and scheduled operations to improve application performance and user experience.

### Success Criteria
- ✅ All background jobs processing reliably
- ✅ Email delivery queue with retry logic
- ✅ Scheduled tasks running automatically
- ✅ Job monitoring and failure handling
- ✅ Performance optimization (offload heavy tasks)
- ✅ PIPEDA compliance (data cleanup automation)

---

## 🎯 Task Decomposition

### Week 25: Queue Infrastructure & Core Jobs

#### Task 12.1: Queue Infrastructure Setup
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] **12.1.1** Install and configure Bull/BullMQ dependencies
  - Install `@nestjs/bull`, `bull`, `ioredis`
  - Configure Redis connection for queues
  - Setup queue module structure
  - **Files:** `src/queues/queue.module.ts`, `src/queues/queue.config.ts`

- [ ] **12.1.2** Create base queue infrastructure
  - Abstract queue service class
  - Queue configuration interface
  - Error handling patterns
  - Retry logic configuration
  - **Files:** `src/queues/base-queue.service.ts`, `src/queues/interfaces/`

- [ ] **12.1.3** Setup queue monitoring and metrics
  - Queue health checks
  - Job completion metrics
  - Failed job tracking
  - Performance monitoring integration
  - **Files:** `src/queues/monitoring/`, `src/health/queue.health.ts`

**Security Requirements:**
- Redis authentication configured
- Queue data encryption in transit
- Rate limiting for job creation
- Access control for queue management

**Testing:**
- Queue connection tests
- Job creation/processing tests
- Failure handling tests
- Redis connection recovery tests

---

#### Task 12.2: Email Notification Queue
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 12 hours

**Subtasks:**
- [ ] **12.2.1** Email queue processor setup
  - High priority email queue
  - OneSignal integration for email delivery
  - Template rendering system
  - Email validation and sanitization
  - **Files:** `src/queues/processors/email.processor.ts`

- [ ] **12.2.2** Email queue job types implementation
  - Welcome email (registration)
  - Email verification
  - Password reset
  - Order status updates
  - Payment confirmation
  - Review reminders
  - **Files:** `src/queues/jobs/email/`, `src/templates/email/`

- [ ] **12.2.3** Email delivery retry logic
  - Exponential backoff strategy
  - Maximum retry attempts (5)
  - Dead letter queue for failed emails
  - Email bounce handling
  - **Files:** `src/queues/strategies/email-retry.strategy.ts`

- [ ] **12.2.4** Email template system
  - HTML email templates
  - Dynamic content injection
  - Multi-language support (EN/FR)
  - Template validation
  - **Files:** `src/templates/`, `src/services/template.service.ts`

**Security Requirements:**
- Email content sanitization
- Rate limiting: 50 emails/hour per user
- Email blacklist functionality
- PIPEDA compliance (unsubscribe links)
- No sensitive data in email logs

**Testing:**
- Email queue processing tests
- Template rendering tests
- Retry mechanism tests
- Multi-language template tests
- Delivery failure handling tests

---

#### Task 12.3: Push Notification Queue
**Priority:** 🟡 HIGH  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] **12.3.1** Push notification processor
  - Medium priority push queue
  - OneSignal push notification integration
  - Device token management
  - Notification personalization
  - **Files:** `src/queues/processors/push.processor.ts`

- [ ] **12.3.2** Push notification job types
  - Order status updates
  - New message notifications
  - Payment confirmations
  - Review requests
  - Promotional notifications (with consent)
  - **Files:** `src/queues/jobs/push/`

- [ ] **12.3.3** Push notification targeting
  - User preference filtering
  - Device type targeting (iOS/Android)
  - Timezone-aware delivery
  - Batch notification optimization
  - **Files:** `src/services/push-targeting.service.ts`

**Security Requirements:**
- User consent verification
- Notification content validation
- Device token encryption
- Opt-out functionality
- Rate limiting: 20 push/hour per user

**Testing:**
- Push delivery tests
- Targeting accuracy tests
- Consent verification tests
- Device token handling tests

---

#### Task 12.4: Image Processing Queue
**Priority:** 🟡 HIGH  
**Estimated Time:** 10 hours

**Subtasks:**
- [ ] **12.4.1** Image processing pipeline
  - Sharp.js integration for image optimization
  - Multiple size generation (thumbnail, medium, large)
  - Format conversion (JPEG, WebP)
  - EXIF metadata stripping
  - **Files:** `src/queues/processors/image.processor.ts`

- [ ] **12.4.2** Portfolio image optimization
  - Contractor portfolio images
  - Profile photo processing
  - Watermark application (optional)
  - Image quality optimization
  - **Files:** `src/queues/jobs/image/portfolio.job.ts`

- [ ] **12.4.3** Virus scanning integration
  - ClamAV or cloud-based scanning
  - Malware detection
  - Quarantine system for infected files
  - Scan result logging
  - **Files:** `src/queues/jobs/image/virus-scan.job.ts`

- [ ] **12.4.4** Image storage optimization
  - S3 upload after processing
  - CDN distribution
  - Old image cleanup
  - Storage cost optimization
  - **Files:** `src/services/image-storage.service.ts`

**Security Requirements:**
- File type validation
- Size limits enforcement (5MB per image)
- Malware scanning mandatory
- EXIF data removal
- Secure file handling

**Testing:**
- Image processing accuracy tests
- Virus scanning tests
- Storage integration tests
- Performance benchmarks

---

### Week 26: Advanced Jobs & Scheduling

#### Task 12.5: Payment Processing Queue
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 10 hours

**Subtasks:**
- [ ] **12.5.1** Stripe webhook retry queue
  - Failed webhook processing
  - Idempotency key management
  - Payment status synchronization
  - Dispute handling automation
  - **Files:** `src/queues/processors/payment.processor.ts`

- [ ] **12.5.2** Payment confirmation jobs
  - Payment success notifications
  - Receipt generation and delivery
  - Accounting system integration
  - Tax calculation (Canadian HST/GST)
  - **Files:** `src/queues/jobs/payment/`

- [ ] **12.5.3** Subscription management jobs
  - Recurring billing processing
  - Subscription renewal notifications
  - Failed payment handling
  - Subscription cancellation cleanup
  - **Files:** `src/queues/jobs/subscription/`

**Security Requirements:**
- Payment data encryption
- PCI DSS compliance
- Webhook signature verification
- Audit logging for all transactions
- Rate limiting for payment operations

**Testing:**
- Webhook processing tests
- Payment flow integration tests
- Subscription lifecycle tests
- Error handling tests

---

#### Task 12.6: Data Cleanup & Maintenance Jobs
**Priority:** 🟡 HIGH (PIPEDA Compliance)  
**Estimated Time:** 12 hours

**Subtasks:**
- [ ] **12.6.1** Chat message cleanup (PIPEDA requirement)
  - Delete messages older than 90 days
  - Keep unread messages regardless of age
  - Archive important messages before deletion
  - Update message count statistics
  - Schedule: Daily at 02:00 UTC
  - **Files:** `src/queues/jobs/cleanup/chat-cleanup.job.ts`

- [ ] **12.6.2** Session data cleanup (Security requirement)
  - Delete expired sessions (>7 days old)
  - Remove invalid refresh tokens
  - Clean Redis session cache
  - Update active session statistics
  - Schedule: Daily at 03:00 UTC
  - **Files:** `src/queues/jobs/cleanup/session-cleanup.job.ts`

- [ ] **12.6.3** Audit logs cleanup (PIPEDA requirement)
  - Keep audit logs for minimum 1 year
  - Delete logs older than 1 year
  - Archive critical logs before deletion
  - Maintain compliance trail
  - Schedule: Weekly on Sunday at 01:00 UTC
  - **Files:** `src/queues/jobs/cleanup/audit-cleanup.job.ts`

- [ ] **12.6.4** Notification history cleanup (PIPEDA requirement)
  - Delete read notifications older than 90 days
  - Keep unread notifications regardless of age
  - Archive important notifications
  - Update notification statistics
  - Schedule: Daily at 04:00 UTC
  - **Files:** `src/queues/jobs/cleanup/notification-cleanup.job.ts`

- [ ] **12.6.5** Payment records retention (Legal requirement)
  - NEVER auto-delete payment records (7 years retention by law)
  - Archive old payment records (>2 years) to cold storage
  - Verify backup integrity
  - Canadian tax law (CRA) compliance
  - Schedule: Manual only (no auto-deletion)
  - **Files:** `src/queues/jobs/maintenance/payment-archive.job.ts`

- [ ] **12.6.6** Inactive user account handling
  - Identify inactive accounts (>2 years no activity)
  - Send notification to users (30 days before deletion)
  - Auto-delete after notification period
  - Anonymize data in orders (preserve history)
  - Schedule: Monthly on 1st at 00:00 UTC
  - **Files:** `src/queues/jobs/cleanup/inactive-users.job.ts`

- [ ] **12.6.7** Temporary files cleanup
  - Delete temp upload files (>24 hours)
  - Remove failed upload files
  - Clean image processing cache
  - S3 multipart upload cleanup
  - Schedule: Daily at 05:00 UTC
  - **Files:** `src/queues/jobs/cleanup/temp-files.job.ts`

- [ ] **12.6.8** Database maintenance
  - Old session cleanup (Redis)
  - Expired token removal
  - Vacuum and analyze PostgreSQL tables
  - Update database statistics
  - Schedule: Weekly on Sunday at 02:00 UTC
  - **Files:** `src/queues/jobs/maintenance/db-maintenance.job.ts`

**Data Retention Policy Summary (PIPEDA Compliance):**

| Data Type | Retention Period | Auto-Delete | Cleanup Schedule | Legal Basis |
|-----------|------------------|-------------|------------------|-------------|
| **Chat messages** | 90 days | ✅ Yes (keep unread) | Daily 02:00 UTC | Business requirement |
| **Payment records** | 7 years | ❌ NO (manual only) | Archive after 2 years | Canadian Tax Law (CRA) |
| **Audit logs** | 1 year minimum | ✅ Yes | Weekly (Sunday 01:00 UTC) | PIPEDA requirement |
| **Session data** | 7 days | ✅ Yes | Daily 03:00 UTC | Security requirement |
| **Notification history** | 90 days | ✅ Yes (keep unread) | Daily 04:00 UTC | Business requirement |
| **Inactive accounts** | 2 years | ✅ Yes (with notice) | Monthly (1st 00:00 UTC) | PIPEDA + Business |
| **Temp files** | 24 hours | ✅ Yes | Daily 05:00 UTC | Technical requirement |
| **User accounts** | Until deleted | ❌ NO (user choice) | On user request | PIPEDA requirement |

**Implementation Example:**

```typescript
// src/queues/jobs/cleanup/chat-cleanup.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class ChatCleanupJob {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldMessages() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete read messages older than 90 days
    const deleted = await this.prisma.message.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
        isRead: true, // Only delete read messages
      },
    });

    console.log(`Cleaned up ${deleted.count} chat messages (>90 days, read)`);
  }
}
```

```typescript
// src/queues/jobs/cleanup/notification-cleanup.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationCleanupJob {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cleanupOldNotifications() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete read notifications older than 90 days
    const deleted = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
        isRead: true, // Keep unread notifications
      },
    });

    console.log(`Cleaned up ${deleted.count} notifications (>90 days, read)`);
  }
}
```

```typescript
// src/queues/jobs/cleanup/audit-cleanup.job.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AuditCleanupJob {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  @Cron('0 1 * * 0') // Every Sunday at 01:00 UTC
  async cleanupOldAuditLogs() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Archive critical logs before deletion
    await this.auditService.archiveCriticalLogs(oneYearAgo);

    // Delete audit logs older than 1 year
    const deleted = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo },
      },
    });

    console.log(`Cleaned up ${deleted.count} audit logs (>1 year)`);
    
    // Log the cleanup action itself (meta!)
    await this.auditService.log({
      action: 'AUDIT_LOG_CLEANUP',
      resource: 'AUDIT_LOG',
      metadata: { deletedCount: deleted.count },
    });
  }
}
```

```typescript
// src/queues/jobs/cleanup/session-cleanup.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SessionCleanupJob {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredSessions() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete expired sessions from database
    const deleted = await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        OR: [
          { lastActivityAt: { lt: sevenDaysAgo } },
          { isActive: false },
        ],
      },
    });

    // Clean Redis session cache
    await this.redis.cleanupExpiredSessions();

    console.log(`Cleaned up ${deleted.count} expired sessions`);
  }
}
```

**Security Requirements:**
- Secure data deletion (overwrite)
- Audit trail for deletions
- PIPEDA compliance verification
- Data retention policy enforcement
- Backup verification before cleanup

**Testing:**
- Data retention policy tests
- Cleanup accuracy tests
- PIPEDA compliance verification
- Backup integrity tests

---

#### Task 12.7: Analytics & Statistics Jobs
**Priority:** 🟢 MEDIUM  
**Estimated Time:** 8 hours

**Subtasks:**
- [ ] **12.7.1** Daily statistics calculation
  - User engagement metrics
  - Order completion rates
  - Revenue analytics
  - Performance metrics aggregation
  - **Files:** `src/queues/jobs/analytics/daily-stats.job.ts`

- [ ] **12.7.2** Rating recalculation jobs
  - Contractor rating updates
  - Client rating updates
  - Badge system updates
  - Profile visibility recalculation
  - **Files:** `src/queues/jobs/analytics/rating-calc.job.ts`

- [ ] **12.7.3** Search index updates
  - Elasticsearch index refresh
  - Profile search optimization
  - Category popularity updates
  - Geographic data indexing
  - **Files:** `src/queues/jobs/search/index-update.job.ts`

**Security Requirements:**
- Anonymized data for analytics
- No PII in analytics logs
- Secure data aggregation
- Access control for statistics

**Testing:**
- Calculation accuracy tests
- Performance optimization tests
- Data anonymization verification

---

#### Task 12.8: Scheduled Tasks System
**Priority:** 🟡 HIGH  
**Estimated Time:** 10 hours

**Subtasks:**
- [ ] **12.8.1** Cron job scheduler setup
  - Bull cron job integration
  - Timezone-aware scheduling
  - Job conflict prevention
  - Failure recovery mechanisms
  - **Files:** `src/queues/scheduler/cron.service.ts`

- [ ] **12.8.2** Daily scheduled tasks
  - Daily statistics generation (00:30 EST)
  - Backup verification (01:00 EST)
  - Log cleanup (02:00 EST)
  - Email digest preparation (06:00 EST)
  - **Files:** `src/queues/schedulers/daily.scheduler.ts`

- [ ] **12.8.3** Weekly scheduled tasks
  - Database maintenance (Sunday 03:00 EST)
  - Inactive account review (Sunday 04:00 EST)
  - Performance report generation (Sunday 05:00 EST)
  - Security audit tasks (Sunday 06:00 EST)
  - **Files:** `src/queues/schedulers/weekly.scheduler.ts`

- [ ] **12.8.4** Monthly scheduled tasks
  - Comprehensive data cleanup (1st of month, 02:00 EST)
  - Subscription renewal processing (1st of month, 06:00 EST)
  - Analytics report generation (1st of month, 08:00 EST)
  - Security certificate renewal check (1st of month, 10:00 EST)
  - **Files:** `src/queues/schedulers/monthly.scheduler.ts`

**Security Requirements:**
- Scheduled task authentication
- Task execution logging
- Failure notification system
- Resource usage monitoring

**Testing:**
- Schedule accuracy tests
- Task execution tests
- Failure recovery tests
- Resource usage validation

---

## 🔒 Security Implementation

### Queue Security Requirements

#### Access Control
- [ ] Redis authentication enabled
- [ ] Queue dashboard authentication (admin only)
- [ ] Job creation rate limiting
- [ ] Queue monitoring access control

#### Data Protection
- [ ] Sensitive data encryption in job payloads
- [ ] No PII in job names or metadata
- [ ] Secure job parameter handling
- [ ] Redis data encryption in transit

#### Monitoring & Auditing
- [ ] All job executions logged
- [ ] Failed job analysis and alerting
- [ ] Queue performance monitoring
- [ ] Security incident detection

### PIPEDA Compliance
- [ ] Data retention automation
- [ ] User consent verification in jobs
- [ ] Automated deletion workflows
- [ ] Audit trail for all data operations

---

## 🧪 Testing Strategy

### Unit Tests (Target: 85% coverage)
- Queue processor logic
- Job creation and scheduling
- Error handling mechanisms
- Security validation

### Integration Tests
- Redis connection and recovery
- Email delivery end-to-end
- Image processing pipeline
- Payment webhook processing

### Performance Tests
- Queue throughput testing
- Memory usage optimization
- Concurrent job processing
- Redis performance under load

### Security Tests
- Queue access control
- Data encryption verification
- Rate limiting effectiveness
- Audit logging accuracy

---

## 📊 Performance Metrics

### Queue Performance Targets
- **Email Queue:** Process 1000 emails/minute
- **Push Queue:** Process 500 notifications/minute
- **Image Queue:** Process 50 images/minute
- **Payment Queue:** Process 100 transactions/minute

### Reliability Targets
- **Job Success Rate:** 99.5%
- **Queue Uptime:** 99.9%
- **Processing Latency:** <30 seconds for high priority
- **Error Recovery:** <5 minutes

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Redis cluster configured for production
- [ ] Queue monitoring dashboard setup
- [ ] Error alerting configured
- [ ] Performance baselines established
- [ ] Backup and recovery procedures tested

### Production Configuration
- [ ] Environment-specific queue settings
- [ ] Production Redis connection
- [ ] Monitoring tools integration
- [ ] Log aggregation setup
- [ ] Security hardening applied

### Post-Deployment Monitoring
- [ ] Queue health monitoring active
- [ ] Performance metrics collection
- [ ] Error rate monitoring
- [ ] Resource usage tracking
- [ ] User experience impact assessment

---

## 📝 Documentation Requirements

### Technical Documentation
- [ ] Queue architecture overview
- [ ] Job type specifications
- [ ] Error handling procedures
- [ ] Performance tuning guide
- [ ] Troubleshooting runbook

### Operational Documentation
- [ ] Queue monitoring guide
- [ ] Incident response procedures
- [ ] Maintenance schedules
- [ ] Backup and recovery procedures
- [ ] Scaling guidelines

---

## 🎯 Success Metrics

### Functional Success
- All background jobs processing without manual intervention
- Email delivery rate >99%
- Image processing completing within SLA
- Data cleanup automation working correctly
- Payment processing queue handling all scenarios

### Performance Success
- Queue latency within targets
- Redis memory usage optimized
- CPU usage for job processing <70%
- No queue backlogs during peak hours
- Error rates <0.5%

### Security Success
- All security requirements implemented
- PIPEDA compliance automation working
- No data leaks in job processing
- Access control functioning correctly
- Audit logging comprehensive

---

**Estimated Total Effort:** 88 hours (2 weeks with 2 developers)  
**Critical Path:** Tasks 12.1 → 12.2 → 12.5 → 12.8  
**Risk Factors:** Redis performance under load, email delivery reliability  
**Mitigation:** Thorough testing, Redis clustering, email provider fallback

---

**Last Updated:** 29 октября 2025  
**Next Review:** After Phase 11 completion  
**Dependencies:** Completed Phase 8 (Notifications), Phase 6 (Payments)