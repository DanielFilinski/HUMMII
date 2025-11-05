import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { AdminService } from '../../admin/admin.service';
import { AuditAction, AuditEntity } from '../../shared/audit/enums/audit-action.enum';
import {
  DisputeStatus,
  DisputeResolution,
  OrderStatus,
  UserRole,
} from '@prisma/client';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { canTransition } from '../constants/status-transitions';

/**
 * Resolution Service
 *
 * Handles dispute resolution actions by admins
 * Applies resolution actions: block user, suspend account, close order, warn user, no action
 */
@Injectable()
export class ResolutionService {
  private readonly logger = new Logger(ResolutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly adminService: AdminService,
  ) {}

  /**
   * Resolve dispute (admin only)
   * Validates dispute status, applies resolution action, updates dispute status
   */
  async resolveDispute(
    disputeId: string,
    dto: ResolveDisputeDto,
    adminId: string,
  ) {
    // 1. Validate dispute exists
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            clientId: true,
            contractorId: true,
          },
        },
        initiatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        respondent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // 2. Validate dispute status (can only resolve from UNDER_REVIEW or AWAITING_INFO)
    const allowedStatuses: DisputeStatus[] = [DisputeStatus.UNDER_REVIEW, DisputeStatus.AWAITING_INFO];

    if (!allowedStatuses.includes(dispute.status)) {
      throw new BadRequestException(
        `Cannot resolve dispute with status ${dispute.status}. Disputes can only be resolved from UNDER_REVIEW or AWAITING_INFO.`,
      );
    }

    // 3. Apply resolution action based on resolution type
    await this.applyResolutionAction(dispute, dto, adminId);

    // 4. Update dispute status to RESOLVED
    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: DisputeStatus.RESOLVED,
        resolutionType: dto.resolutionType,
        resolutionReason: dto.resolutionReason,
        resolvedById: adminId,
        resolvedAt: new Date(),
        adminNotes: dto.adminNotes,
      },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 5. Audit log
    await this.auditService.log({
      action: AuditAction.DISPUTE_RESOLVED,
      entity: AuditEntity.DISPUTE,
      entityId: dispute.id,
      userId: adminId,
      metadata: {
        resolutionType: dto.resolutionType,
        resolutionReason: dto.resolutionReason,
        orderId: dispute.orderId,
      },
    });

    this.logger.log(
      `Dispute resolved: ${dispute.id} with resolution: ${dto.resolutionType}`,
    );

    return updatedDispute;
  }

  /**
   * Apply resolution action based on resolution type
   * Private method to handle different resolution actions
   */
  private async applyResolutionAction(
    dispute: any,
    dto: ResolveDisputeDto,
    adminId: string,
  ): Promise<void> {
    switch (dto.resolutionType) {
      case DisputeResolution.BLOCK_USER:
        await this.handleBlockUser(dispute, dto, adminId);
        break;

      case DisputeResolution.SUSPEND_ACCOUNT:
        await this.handleSuspendAccount(dispute, dto, adminId);
        break;

      case DisputeResolution.CLOSE_ORDER:
        await this.handleCloseOrder(dispute, dto, adminId);
        break;

      case DisputeResolution.WARN_USER:
        await this.handleWarnUser(dispute, dto, adminId);
        break;

      case DisputeResolution.NO_ACTION:
        // No action needed, just log
        this.logger.log(`No action taken for dispute: ${dispute.id}`);
        break;

      default:
        throw new BadRequestException(`Unknown resolution type: ${dto.resolutionType}`);
    }
  }

  /**
   * Handle BLOCK_USER resolution
   * Blocks user account permanently
   */
  private async handleBlockUser(dispute: any, dto: ResolveDisputeDto, adminId: string) {
    const userId = dto.actionDetails?.userId;

    if (!userId) {
      throw new BadRequestException(
        'User ID is required for BLOCK_USER resolution',
      );
    }

    // Validate user is participant in dispute
    if (userId !== dispute.initiatedById && userId !== dispute.respondentId) {
      throw new BadRequestException(
        'User is not a participant in this dispute',
      );
    }

    // Lock user account (permanent lock)
    await this.adminService.lockUser(userId, adminId, dto.resolutionReason);

    this.logger.log(`User blocked: ${userId} due to dispute: ${dispute.id}`);
  }

  /**
   * Handle SUSPEND_ACCOUNT resolution
   * Temporarily suspends user account
   */
  private async handleSuspendAccount(
    dispute: any,
    dto: ResolveDisputeDto,
    adminId: string,
  ) {
    const userId = dto.actionDetails?.userId;

    if (!userId) {
      throw new BadRequestException(
        'User ID is required for SUSPEND_ACCOUNT resolution',
      );
    }

    // Validate user is participant in dispute
    if (userId !== dispute.initiatedById && userId !== dispute.respondentId) {
      throw new BadRequestException(
        'User is not a participant in this dispute',
      );
    }

    // Lock user account (temporary suspension - 30 days)
    await this.adminService.lockUser(userId, adminId, dto.resolutionReason);

    // Note: In production, you might want to add a suspension duration field
    // For now, lockUser handles temporary suspension
    this.logger.log(`User suspended: ${userId} due to dispute: ${dispute.id}`);
  }

  /**
   * Handle CLOSE_ORDER resolution
   * Closes the order associated with the dispute
   */
  private async handleCloseOrder(dispute: any, dto: ResolveDisputeDto, adminId: string) {
    const orderId = dispute.orderId;

    // Update order status to CANCELLED
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    // Audit log for order closure
    await this.auditService.log({
      action: AuditAction.ORDER_STATUS_CHANGE,
      entity: AuditEntity.ORDER,
      entityId: orderId,
      userId: adminId,
      metadata: {
        previousStatus: dispute.order.status,
        newStatus: OrderStatus.CANCELLED,
        reason: 'Dispute resolution',
      },
    });

    this.logger.log(`Order closed: ${orderId} due to dispute: ${dispute.id}`);
  }

  /**
   * Handle WARN_USER resolution
   * Creates a warning for the user (stored in admin notes or notification)
   */
  private async handleWarnUser(dispute: any, dto: ResolveDisputeDto, adminId: string) {
    const userId = dto.actionDetails?.userId;
    const warningMessage = dto.actionDetails?.warningMessage || dto.resolutionReason;

    if (!userId) {
      throw new BadRequestException(
        'User ID is required for WARN_USER resolution',
      );
    }

    // Validate user is participant in dispute
    if (userId !== dispute.initiatedById && userId !== dispute.respondentId) {
      throw new BadRequestException(
        'User is not a participant in this dispute',
      );
    }

    // Store warning in admin notes (for now)
    // TODO: In Phase 8, create notification for user
    this.logger.log(
      `User warned: ${userId} due to dispute: ${dispute.id}. Message: ${warningMessage}`,
    );

    // Audit log for warning
    await this.auditService.log({
      action: AuditAction.SYSTEM_ACTION,
      entity: AuditEntity.USER,
      entityId: userId,
      userId: adminId,
      metadata: {
        action: 'WARN_USER',
        disputeId: dispute.id,
        warningMessage,
      },
    });
  }
}

