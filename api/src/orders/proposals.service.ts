import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { OrderStatus, OrderType, ProposalStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { forwardRef, Inject, Optional } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
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
      } else {
        await this.notificationQueue.add('new-proposal', {
          userId,
          type,
          title,
          body,
          actionUrl,
          metadata,
        });
      }
    } catch (error) {
      await this.notificationQueue.add('new-proposal', {
        userId,
        type,
        title,
        body,
        actionUrl,
        metadata,
      });
    }
  }

  /**
   * Create proposal for an order
   * Security: Only contractors, rate limited (20/hour)
   */
  async create(
    orderId: string,
    contractorId: string,
    createDto: CreateProposalDto,
  ) {
    // Validate order exists and is published
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PUBLISHED) {
      throw new BadRequestException('Order is not accepting proposals');
    }

    // Only public orders accept proposals
    if (order.type !== OrderType.PUBLIC) {
      throw new BadRequestException(
        'Cannot submit proposal to direct order',
      );
    }

    // Check if contractor already submitted proposal
    const existing = await this.prisma.proposal.findUnique({
      where: {
        orderId_contractorId: {
          orderId,
          contractorId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Proposal already submitted for this order');
    }

    // Create proposal
    const proposal = await this.prisma.proposal.create({
      data: {
        orderId,
        contractorId,
        proposedPrice: createDto.proposedPrice,
        message: createDto.message,
        estimatedDays: createDto.estimatedDays,
        status: ProposalStatus.PENDING,
      },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            categories: {
              include: { category: true },
            },
          },
        },
        order: {
          select: {
            id: true,
            title: true,
            clientId: true,
          },
        },
      },
    });

    // Send notification to client about new proposal
    await this.sendNotification(
      order.clientId,
      NotificationType.NEW_PROPOSAL,
      `New proposal for order "${order.title}"`,
      `A contractor has submitted a proposal for your order "${order.title}".`,
      `/orders/${order.id}`,
      {
        orderId: order.id,
        proposalId: proposal.id,
        contractorId,
      },
    );

    // Audit log
    await this.auditService.log({
      action: AuditAction.PROPOSAL_CREATE,
      entity: AuditEntity.PROPOSAL,
      entityId: proposal.id,
      userId: contractorId,
      metadata: {
        orderId,
        proposedPrice: createDto.proposedPrice,
      },
    });

    return proposal;
  }

  /**
   * Get all proposals for an order
   * Security: Only order owner (client) can view
   */
  async findByOrder(orderId: string) {
    return this.prisma.proposal.findMany({
      where: { orderId },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                createdAt: true,
              },
            },
            categories: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get contractor's own proposals
   * Security: Returns only proposals by the authenticated contractor
   */
  async getMyProposals(contractorId: string) {
    return this.prisma.proposal.findMany({
      where: { contractorId },
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Accept proposal
   * Security: Only order client can accept
   * Transaction: Accept one, reject all others, assign contractor to order
   */
  async accept(proposalId: string, clientId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        order: true,
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.order.clientId !== clientId) {
      throw new ForbiddenException('Not authorized to accept this proposal');
    }

    if (proposal.order.status !== OrderStatus.PUBLISHED) {
      throw new BadRequestException('Order is not accepting proposals');
    }

    // Transaction: accept proposal, reject others, update order
    const result = await this.prisma.$transaction(async (prisma) => {
      // Accept this proposal
      const accepted = await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.ACCEPTED },
      });

      // Reject all other proposals for this order
      await prisma.proposal.updateMany({
        where: {
          orderId: proposal.orderId,
          id: { not: proposalId },
          status: ProposalStatus.PENDING,
        },
        data: { status: ProposalStatus.REJECTED },
      });

      // Update order: assign contractor, set status to IN_PROGRESS
      const updatedOrder = await prisma.order.update({
        where: { id: proposal.orderId },
        data: {
          contractorId: proposal.contractorId,
          status: OrderStatus.IN_PROGRESS,
          startedAt: new Date(),
          agreedPrice: proposal.proposedPrice,
        },
      });

      return { accepted, updatedOrder };
    });

    // Send notification to accepted contractor
    await this.sendNotification(
      proposal.contractor.user.id,
      NotificationType.PROPOSAL_ACCEPTED,
      `Your proposal was accepted`,
      `Your proposal for order "${proposal.order.title}" has been accepted!`,
      `/orders/${proposal.orderId}`,
      {
        proposalId: proposal.id,
        orderId: proposal.orderId,
      },
    );

    // Notify rejected contractors
    const rejectedProposals = await this.prisma.proposal.findMany({
      where: {
        orderId: proposal.orderId,
        id: { not: proposalId },
        status: ProposalStatus.REJECTED,
      },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    for (const rejected of rejectedProposals) {
      await this.sendNotification(
        rejected.contractor.user.id,
        NotificationType.PROPOSAL_REJECTED,
        `Your proposal was rejected`,
        `Your proposal for order "${proposal.order.title}" has been rejected.`,
        `/orders/${proposal.orderId}`,
        {
          proposalId: rejected.id,
          orderId: proposal.orderId,
        },
      );
    }

    // Audit log
    await this.auditService.log({
      action: AuditAction.PROPOSAL_ACCEPT,
      entity: AuditEntity.PROPOSAL,
      entityId: proposal.id,
      userId: clientId,
      metadata: {
        orderId: proposal.orderId,
        contractorId: proposal.contractorId,
        proposedPrice: proposal.proposedPrice,
      },
    });

    return {
      message: 'Proposal accepted successfully',
      proposal: result.accepted,
      order: result.updatedOrder,
    };
  }

  /**
   * Reject proposal
   * Security: Only order client can reject
   */
  async reject(proposalId: string, clientId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        order: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.order.clientId !== clientId) {
      throw new ForbiddenException('Not authorized to reject this proposal');
    }

    if (proposal.status !== ProposalStatus.PENDING) {
      throw new BadRequestException('Proposal has already been processed');
    }

    // Reject proposal
    const rejected = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: ProposalStatus.REJECTED },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Send notification to contractor
    await this.sendNotification(
      rejected.contractor.user.id,
      NotificationType.PROPOSAL_REJECTED,
      `Your proposal was rejected`,
      `Your proposal for order "${proposal.order.title}" has been rejected.`,
      `/orders/${proposal.orderId}`,
      {
        proposalId: proposal.id,
        orderId: proposal.orderId,
      },
    );

    // Audit log
    await this.auditService.log({
      action: AuditAction.PROPOSAL_REJECT,
      entity: AuditEntity.PROPOSAL,
      entityId: proposal.id,
      userId: clientId,
      metadata: {
        orderId: proposal.orderId,
        contractorId: proposal.contractorId,
      },
    });

    return {
      message: 'Proposal rejected successfully',
      proposal: rejected,
    };
  }

  /**
   * Update proposal (pending only)
   * Security: Only proposal owner (contractor) can update
   */
  async update(
    proposalId: string,
    contractorId: string,
    updateDto: UpdateProposalDto,
  ) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.contractorId !== contractorId) {
      throw new ForbiddenException('Not authorized to update this proposal');
    }

    // Only pending proposals can be updated
    if (proposal.status !== ProposalStatus.PENDING) {
      throw new BadRequestException('Only pending proposals can be updated');
    }

    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        proposedPrice: updateDto.proposedPrice,
        message: updateDto.message,
        estimatedDays: updateDto.estimatedDays,
      },
      include: {
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      action: AuditAction.PROPOSAL_UPDATE,
      entity: AuditEntity.PROPOSAL,
      entityId: proposal.id,
      userId: contractorId,
      metadata: { fields: Object.keys(updateDto) },
    });

    return updated;
  }

  /**
   * Get proposal by ID
   * Security: Only order client or proposal contractor can view
   */
  async findOne(proposalId: string, userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        order: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        contractor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            categories: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Authorization: only order client or proposal contractor can view
    const isAuthorized =
      proposal.order.clientId === userId ||
      proposal.contractorId === userId;

    if (!isAuthorized) {
      throw new ForbiddenException('Not authorized to view this proposal');
    }

    return proposal;
  }
}
