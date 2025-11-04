import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

/**
 * Notification Processor (Stub Implementation)
 * Phase 3: Basic job processing with console logging
 * Phase 8: Full implementation with OneSignal, Email, Socket.io
 *
 * Jobs:
 * - order-published: Notify contractors in category/radius
 * - order-direct-created: Notify specific contractor (direct order)
 * - order-status-changed: Notify client and contractor
 * - new-proposal: Notify client about new proposal
 * - proposal-accepted: Notify contractor
 * - proposal-rejected: Notify contractor
 */
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('order-published')
  async handleOrderPublished(job: Job) {
    this.logger.log(`[Notification] Order published: ${JSON.stringify(job.data)}`);
    // TODO Phase 8: Find contractors in radius with matching category
    // TODO Phase 8: Send in-app notification via Socket.io
    // TODO Phase 8: Send email notification via OneSignal
    return { processed: true };
  }

  @Process('order-direct-created')
  async handleOrderDirectCreated(job: Job) {
    this.logger.log(
      `[Notification] Direct order created: ${JSON.stringify(job.data)}`,
    );
    // TODO Phase 8: Notify specific contractor
    return { processed: true };
  }

  @Process('order-status-changed')
  async handleOrderStatusChanged(job: Job) {
    this.logger.log(
      `[Notification] Order status changed: ${JSON.stringify(job.data)}`,
    );
    // TODO Phase 8: Notify client and contractor based on status
    return { processed: true };
  }

  @Process('new-proposal')
  async handleNewProposal(job: Job) {
    this.logger.log(`[Notification] New proposal: ${JSON.stringify(job.data)}`);
    // TODO Phase 8: Notify order client about new proposal
    return { processed: true };
  }

  @Process('proposal-accepted')
  async handleProposalAccepted(job: Job) {
    this.logger.log(
      `[Notification] Proposal accepted: ${JSON.stringify(job.data)}`,
    );
    // TODO Phase 8: Notify contractor about acceptance
    return { processed: true };
  }

  @Process('proposal-rejected')
  async handleProposalRejected(job: Job) {
    this.logger.log(
      `[Notification] Proposal rejected: ${JSON.stringify(job.data)}`,
    );
    // TODO Phase 8: Notify contractor about rejection
    return { processed: true };
  }
}

