import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
  forwardRef,
  Inject,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import {
  DisputeReason,
  DisputeStatus,
  DisputePriority,
  OrderStatus,
  UserRole,
  NotificationType,
} from '@prisma/client';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { DisputeQueryDto } from './dto/dispute-query.dto';
import { canTransition } from './constants/status-transitions';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Disputes Service
 *
 * Handles dispute creation, management, and status transitions
 */
@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Optional() @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService?: NotificationsService,
  ) {}

  private async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      if (this.notificationsService) {
        await this.notificationsService.create(userId, type, {
          title,
          body,
          actionUrl,
          metadata,
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Create a new dispute
   * Validates order exists, user is participant, and order status allows dispute
   */
  async createDispute(userId: string, dto: CreateDisputeDto) {
    // 1. Validate order exists and user is participant
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        client: true,
        contractor: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // 2. Validate user is participant (client or contractor)
    const isClient = order.clientId === userId;
    const isContractor = order.contractorId === userId;

    if (!isClient && !isContractor) {
      throw new ForbiddenException(
        'You are not authorized to create a dispute for this order. Only participants can create disputes.',
      );
    }

    // 3. Validate order status allows dispute (IN_PROGRESS, PENDING_REVIEW, COMPLETED)
    const allowedStatuses: OrderStatus[] = [
      OrderStatus.IN_PROGRESS,
      OrderStatus.PENDING_REVIEW,
      OrderStatus.COMPLETED,
    ];

    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot create dispute for order with status ${order.status}. Disputes can only be created for orders in progress, pending review, or completed.`,
      );
    }

    // 4. Prevent duplicate disputes per order
    const existingDispute = await this.prisma.dispute.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingDispute) {
      throw new ConflictException('A dispute already exists for this order');
    }

    // 5. Determine respondent (other participant)
    const respondentId = isClient ? order.contractorId : order.clientId;

    if (!respondentId) {
      throw new BadRequestException(
        'Order participant not found. Cannot create dispute without both parties.',
      );
    }

    // 6. Create dispute
    const dispute = await this.prisma.dispute.create({
      data: {
        orderId: dto.orderId,
        initiatedById: userId,
        respondentId,
        reason: dto.reason,
        description: dto.description,
        priority: DisputePriority.MEDIUM,
        status: DisputeStatus.OPENED,
        amountInDispute: dto.amountInDispute,
      },
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            contractor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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

    // 7. Update order status to DISPUTED
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: OrderStatus.DISPUTED },
    });

    // 8. Send notification to respondent
    await this.sendNotification(
      respondentId,
      NotificationType.DISPUTE_OPENED,
      `Dispute opened for order "${dispute.order.title || dto.orderId}"`,
      `A dispute has been opened for your order. Please respond within 48 hours.`,
      `/disputes/${dispute.id}`,
      {
        disputeId: dispute.id,
        orderId: dto.orderId,
        reason: dto.reason,
      },
    );

    // 9. Audit log
    await this.auditService.log({
      action: AuditAction.DISPUTE_CREATED,
      entity: AuditEntity.DISPUTE,
      entityId: dispute.id,
      userId,
      metadata: {
        orderId: dto.orderId,
        reason: dto.reason,
        status: dispute.status,
      },
    });

    this.logger.log(`Dispute created: ${dispute.id} for order: ${dto.orderId}`);

    return dispute;
  }

  /**
   * Get user's disputes with pagination and filtering
   * Returns disputes where user is either initiator or respondent
   */
  async getUserDisputes(userId: string, query: DisputeQueryDto) {
    const { page = 1, limit = 20, status, priority, orderId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { initiatedById: userId },
        { respondentId: userId },
      ],
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              title: true,
              status: true,
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
          _count: {
            select: {
              evidence: true,
              messages: true,
            },
          },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      disputes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get dispute by ID with full details
   * Checks access (participant or admin)
   */
  async getDisputeById(disputeId: string, userId: string, userRole?: UserRole) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            contractor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: true,
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
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evidence: {
          orderBy: { uploadedAt: 'desc' },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        messages: {
          where: {
            OR: [
              { isInternal: false }, // Public messages
              { isInternal: true, senderId: userId }, // User's own internal messages
              // Admin can see all internal messages (checked in guard)
            ],
          },
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            evidence: true,
            messages: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Check access (participant or admin)
    const isAdmin = userRole === UserRole.ADMIN;
    const isParticipant =
      dispute.initiatedById === userId || dispute.respondentId === userId;

    if (!isAdmin && !isParticipant) {
      throw new ForbiddenException(
        'You are not authorized to view this dispute. Only participants and admins can access disputes.',
      );
    }

    return dispute;
  }

  /**
   * Update dispute status (admin only)
   * Validates status transition using FSM pattern
   */
  async updateStatus(
    disputeId: string,
    dto: UpdateDisputeStatusDto,
    adminId: string,
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Validate status transition
    if (!canTransition(dispute.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${dispute.status} to ${dto.status}`,
      );
    }

    // Update dispute
    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: dto.status,
        priority: dto.priority ?? dispute.priority,
      },
      include: {
        order: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        initiatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        respondent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notifications to both parties
    const statusMessages: Record<DisputeStatus, string> = {
      [DisputeStatus.OPENED]: 'opened',
      [DisputeStatus.UNDER_REVIEW]: 'under review',
      [DisputeStatus.AWAITING_INFO]: 'awaiting information',
      [DisputeStatus.RESOLVED]: 'resolved',
      [DisputeStatus.CLOSED]: 'closed',
    };

    const statusMessage = statusMessages[dto.status] || dto.status.toLowerCase();

    // Notify initiator
    await this.sendNotification(
      updatedDispute.initiatedById,
      NotificationType.DISPUTE_STATUS_CHANGED,
      `Dispute status updated`,
      `Your dispute for order "${updatedDispute.order.title || dispute.orderId}" is now ${statusMessage}.`,
      `/disputes/${disputeId}`,
      {
        disputeId,
        orderId: dispute.orderId,
        oldStatus: dispute.status,
        newStatus: dto.status,
      },
    );

    // Notify respondent
    await this.sendNotification(
      updatedDispute.respondentId,
      NotificationType.DISPUTE_STATUS_CHANGED,
      `Dispute status updated`,
      `The dispute for order "${updatedDispute.order.title || dispute.orderId}" is now ${statusMessage}.`,
      `/disputes/${disputeId}`,
      {
        disputeId,
        orderId: dispute.orderId,
        oldStatus: dispute.status,
        newStatus: dto.status,
      },
    );

    // Audit log
    await this.auditService.log({
      action: AuditAction.DISPUTE_STATUS_CHANGED,
      entity: AuditEntity.DISPUTE,
      entityId: dispute.id,
      userId: adminId,
      metadata: {
        previousStatus: dispute.status,
        newStatus: dto.status,
        priority: dto.priority,
      },
    });

    this.logger.log(
      `Dispute status updated: ${dispute.id} from ${dispute.status} to ${dto.status}`,
    );

    return updatedDispute;
  }

  /**
   * Check if user has access to dispute (participant or admin)
   */
  async checkUserAccess(
    disputeId: string,
    userId: string,
    userRole?: UserRole,
  ): Promise<boolean> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      select: {
        initiatedById: true,
        respondentId: true,
      },
    });

    if (!dispute) {
      return false;
    }

    // Admin has full access
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Participant has access
    return dispute.initiatedById === userId || dispute.respondentId === userId;
  }
}

