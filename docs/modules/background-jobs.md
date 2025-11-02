# Background Jobs & Queue Management

> **Version:** 1.0  
> **Last Updated:** November 2, 2025  
> **Technology:** Bull/BullMQ + Redis

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Queue Configuration](#queue-configuration)
3. [Job Types](#job-types)
4. [Retry Policies](#retry-policies)
5. [Job Priorities](#job-priorities)
6. [Concurrency & Rate Limiting](#concurrency--rate-limiting)
7. [Error Handling](#error-handling)
8. [Monitoring](#monitoring)

---

## Overview

### Why Bull/BullMQ?

- **Async processing** - Don't block HTTP requests
- **Reliability** - Redis-backed persistence
- **Retry logic** - Automatic retry with exponential backoff
- **Job scheduling** - Delayed and recurring jobs
- **Horizontal scaling** - Multiple workers
- **Monitoring** - Bull Board for UI

### Architecture

```
HTTP Request → Controller → Queue → Worker → External Service
                ↓
            Response (immediate)
```

---

## Queue Configuration

### Setup

```typescript
// queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [ConfigService],
    }),
    
    // Register queues
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'push' },
      { name: 'image-processing' },
      { name: 'webhook-retry' },
      { name: 'data-cleanup' },
    ),
  ],
})
export class QueueModule {}
```

---

## Job Types

### 1. Email Queue (High Priority)

**Purpose:** Send transactional emails (welcome, password reset, notifications)

```typescript
interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  lang: 'en' | 'fr';
}

// Producer
@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(job: EmailJob): Promise<void> {
    await this.emailQueue.add('send-email', job, {
      priority: 1, // High priority
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    });
  }
}

// Consumer
@Processor('email')
export class EmailProcessor {
  constructor(private emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>) {
    const { to, subject, template, data, lang } = job.data;
    
    try {
      await this.emailService.send({
        to,
        subject,
        html: await this.emailService.renderTemplate(template, data, lang),
      });
      
      return { success: true, sentAt: new Date() };
    } catch (error) {
      // Will retry automatically
      throw error;
    }
  }
}
```

**Configuration:**
- **Attempts:** 5
- **Backoff:** Exponential, 3s initial delay
- **Priority:** 1 (highest)
- **Concurrency:** 10 jobs in parallel
- **Timeout:** 30 seconds

---

### 2. Push Notifications Queue (Medium Priority)

**Purpose:** Send push notifications via OneSignal

```typescript
interface PushJob {
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Processor('push')
export class PushProcessor {
  constructor(private oneSignalService: OneSignalService) {}

  @Process('send-push')
  async handleSendPush(job: Job<PushJob>) {
    const { userId, title, message, data } = job.data;
    
    const user = await this.usersService.findOne(userId);
    
    if (!user.pushEnabled) {
      return { skipped: true, reason: 'Push notifications disabled' };
    }
    
    await this.oneSignalService.send({
      playerIds: [user.oneSignalPlayerId],
      headings: { en: title },
      contents: { en: message },
      data,
    });
    
    return { success: true };
  }
}
```

**Configuration:**
- **Attempts:** 3
- **Backoff:** Exponential, 2s initial delay
- **Priority:** 2 (medium)
- **Concurrency:** 20 jobs in parallel
- **Timeout:** 10 seconds

---

### 3. Image Processing Queue (Low Priority)

**Purpose:** Resize, optimize, and upload images to S3

```typescript
interface ImageProcessingJob {
  userId: string;
  originalPath: string;
  targetPath: string;
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

@Processor('image-processing')
export class ImageProcessingProcessor {
  constructor(
    private s3Service: S3Service,
    private imageService: ImageService,
  ) {}

  @Process('process-image')
  async handleProcessImage(job: Job<ImageProcessingJob>) {
    const { originalPath, targetPath, maxWidth, maxHeight, quality } = job.data;
    
    // Update progress
    job.progress(10);
    
    // Resize
    const resized = await this.imageService.resize(originalPath, maxWidth, maxHeight);
    job.progress(50);
    
    // Optimize
    const optimized = await this.imageService.optimize(resized, quality);
    job.progress(70);
    
    // Upload to S3
    await this.s3Service.upload(optimized, targetPath);
    job.progress(90);
    
    // Delete temp files
    await this.imageService.cleanup([originalPath, resized]);
    job.progress(100);
    
    return { success: true, url: targetPath };
  }
}
```

**Configuration:**
- **Attempts:** 2
- **Backoff:** Fixed, 5s delay
- **Priority:** 5 (low)
- **Concurrency:** 5 jobs in parallel
- **Timeout:** 60 seconds

---

### 4. Webhook Retry Queue

**Purpose:** Retry failed Stripe webhooks

```typescript
interface WebhookRetryJob {
  eventId: string;
  eventType: string;
  eventData: any;
  attemptNumber: number;
}

@Processor('webhook-retry')
export class WebhookRetryProcessor {
  @Process('retry-webhook')
  async handleRetryWebhook(job: Job<WebhookRetryJob>) {
    const { eventId, eventType, eventData } = job.data;
    
    // Process webhook event
    await this.stripeWebhookService.handleEvent(eventType, eventData);
    
    return { success: true, processedAt: new Date() };
  }
}
```

**Configuration:**
- **Attempts:** 10
- **Backoff:** Exponential, 5s initial delay (max 1 hour)
- **Priority:** 3
- **Concurrency:** 3 jobs in parallel
- **Timeout:** 30 seconds

---

### 5. Data Cleanup Queue (Scheduled)

**Purpose:** Periodic cleanup of old data (cron job)

```typescript
@Processor('data-cleanup')
export class DataCleanupProcessor {
  @Process('cleanup-audit-logs')
  async handleCleanupAuditLogs(job: Job) {
    const deletedCount = await this.auditService.cleanupOldLogs(365);
    return { deletedCount };
  }

  @Process('cleanup-notifications')
  async handleCleanupNotifications(job: Job) {
    const deletedCount = await this.notificationsService.cleanupOld(90);
    return { deletedCount };
  }

  @Process('cleanup-temp-files')
  async handleCleanupTempFiles(job: Job) {
    const deletedCount = await this.filesService.cleanupTempFiles();
    return { deletedCount };
  }
}

// Schedule jobs
@Injectable()
export class DataCleanupScheduler {
  constructor(@InjectQueue('data-cleanup') private queue: Queue) {}

  @Cron('0 2 * * *') // 2 AM daily
  async scheduleCleanup() {
    await this.queue.add('cleanup-audit-logs', {}, { priority: 10 });
    await this.queue.add('cleanup-notifications', {}, { priority: 10 });
    await this.queue.add('cleanup-temp-files', {}, { priority: 10 });
  }
}
```

**Configuration:**
- **Attempts:** 1 (no retry for cleanup jobs)
- **Priority:** 10 (lowest)
- **Concurrency:** 1 job at a time
- **Timeout:** 300 seconds (5 minutes)

---

## Retry Policies

### Standard Retry Policy

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // 2s, 4s, 8s
  }
}
```

### Aggressive Retry Policy (Critical Jobs)

```typescript
{
  attempts: 10,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s, 10s, 20s, 40s, 80s, ...
  }
}
```

### No Retry Policy (Idempotent Jobs)

```typescript
{
  attempts: 1, // No retry
}
```

---

## Job Priorities

| Priority | Use Case | Examples |
|----------|----------|----------|
| **1 (Highest)** | Critical user-facing operations | Password reset emails, payment confirmations |
| **2** | Important notifications | New order, new message |
| **3** | Background processing | Image processing, webhook retries |
| **5** | Low priority tasks | Analytics, data aggregation |
| **10 (Lowest)** | Scheduled maintenance | Data cleanup, log rotation |

---

## Concurrency & Rate Limiting

### Queue-Level Concurrency

```typescript
@Processor('email', {
  concurrency: 10, // Process 10 jobs simultaneously
})
```

### Job-Level Rate Limiting

```typescript
await queue.add('send-email', job, {
  limiter: {
    max: 100,      // Max 100 jobs
    duration: 1000, // Per second
  },
});
```

### Global Rate Limiting (OneSignal)

```typescript
// Max 30 push notifications per second (OneSignal limit)
@Processor('push', {
  limiter: {
    max: 30,
    duration: 1000,
  },
})
```

---

## Error Handling

### On Job Failure

```typescript
@Processor('email')
export class EmailProcessor {
  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>) {
    try {
      await this.emailService.send(job.data);
    } catch (error) {
      // Log error
      this.logger.error(`Email job ${job.id} failed:`, error);
      
      // Will retry automatically based on attempts
      throw error;
    }
  }

  @OnQueueError()
  async onError(error: Error) {
    this.logger.error('Queue error:', error);
    
    // Alert admin
    await this.alertService.send({
      type: 'QUEUE_ERROR',
      message: error.message,
    });
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed permanently:`, error);
    
    // Save to dead letter queue
    await this.deadLetterQueue.add('failed-email', {
      originalJob: job.data,
      error: error.message,
      failedAt: new Date(),
    });
  }
}
```

### Dead Letter Queue

```typescript
// Store permanently failed jobs for manual review
@Processor('dead-letter')
export class DeadLetterProcessor {
  @Process('*')
  async handleDeadLetter(job: Job) {
    // Store in database for admin review
    await this.prisma.failedJob.create({
      data: {
        queueName: job.queue.name,
        jobType: job.name,
        jobData: job.data,
        error: job.failedReason,
        failedAt: new Date(),
      },
    });
  }
}
```

---

## Monitoring

### Bull Board (UI Dashboard)

```typescript
// Install: npm install @bull-board/express @bull-board/api
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(emailQueue),
    new BullAdapter(pushQueue),
    new BullAdapter(imageProcessingQueue),
  ],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

**Access:** `http://localhost:3000/admin/queues`

### Metrics to Track

```typescript
interface QueueMetrics {
  waiting: number;       // Jobs waiting to be processed
  active: number;        // Jobs currently processing
  completed: number;     // Completed jobs (last hour)
  failed: number;        // Failed jobs (last hour)
  delayed: number;       // Scheduled jobs
  avgProcessingTime: number; // Average processing time (ms)
}

@Injectable()
export class QueueMetricsService {
  async getMetrics(queueName: string): Promise<QueueMetrics> {
    const queue = this.getQueue(queueName);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      avgProcessingTime: await this.calculateAvgProcessingTime(queue),
    };
  }
}
```

### Alerts

```typescript
// Alert when queue is backed up
@Cron('*/5 * * * *') // Every 5 minutes
async checkQueueHealth() {
  const metrics = await this.queueMetricsService.getMetrics('email');
  
  if (metrics.waiting > 1000) {
    await this.alertService.send({
      type: 'QUEUE_BACKLOG',
      queue: 'email',
      waitingCount: metrics.waiting,
    });
  }
  
  if (metrics.failed > 100) {
    await this.alertService.send({
      type: 'HIGH_FAILURE_RATE',
      queue: 'email',
      failedCount: metrics.failed,
    });
  }
}
```

---

## Best Practices

### 1. Keep Jobs Small and Fast

```typescript
// ❌ BAD - processing 1000 images in one job
await queue.add('process-images', { imageIds: [1...1000] });

// ✅ GOOD - one image per job
for (const imageId of imageIds) {
  await queue.add('process-image', { imageId });
}
```

### 2. Make Jobs Idempotent

```typescript
// Job can be safely retried without side effects
@Process('send-welcome-email')
async handleSendWelcomeEmail(job: Job<{ userId: string }>) {
  // Check if email already sent
  const sent = await this.emailLog.findOne({
    userId: job.data.userId,
    type: 'WELCOME_EMAIL',
  });
  
  if (sent) {
    return { skipped: true };
  }
  
  await this.emailService.send({ ... });
  
  // Record that email was sent
  await this.emailLog.create({ userId: job.data.userId, type: 'WELCOME_EMAIL' });
}
```

### 3. Use Job Progress

```typescript
@Process('generate-report')
async handleGenerateReport(job: Job<ReportJob>) {
  job.progress(0);
  
  const data = await this.fetchData();
  job.progress(30);
  
  const processed = await this.processData(data);
  job.progress(60);
  
  const report = await this.generatePDF(processed);
  job.progress(90);
  
  await this.uploadToS3(report);
  job.progress(100);
  
  return { reportUrl: report.url };
}
```

### 4. Clean Up Completed Jobs

```typescript
// Auto-remove completed jobs to save memory
{
  removeOnComplete: {
    age: 3600, // Keep for 1 hour
    count: 1000, // Keep last 1000
  },
  removeOnFail: false, // Keep failed jobs for debugging
}
```

---

## Queue Summary

| Queue Name | Priority | Attempts | Concurrency | Use Case |
|------------|----------|----------|-------------|----------|
| **email** | 1 | 5 | 10 | Transactional emails |
| **push** | 2 | 3 | 20 | Push notifications |
| **image-processing** | 5 | 2 | 5 | Image optimization |
| **webhook-retry** | 3 | 10 | 3 | Failed webhooks |
| **data-cleanup** | 10 | 1 | 1 | Scheduled cleanup |

---

**Last updated:** November 2, 2025  
**Status:** Ready for implementation  
**Priority:** HIGH

