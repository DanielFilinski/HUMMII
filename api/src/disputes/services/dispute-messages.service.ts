import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../shared/audit/enums/audit-action.enum';
import { DisputesService } from '../disputes.service';
import { AddMessageDto } from '../dto/add-message.dto';
import { DisputeQueryDto } from '../dto/dispute-query.dto';
import { UserRole } from '@prisma/client';
import { ContentModerationService } from '../../chat/services/content-moderation.service';

/**
 * Dispute Messages Service
 *
 * Handles message creation and retrieval for disputes
 */
@Injectable()
export class DisputeMessagesService {
  private readonly logger = new Logger(DisputeMessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly disputesService: DisputesService,
    private readonly contentModerationService: ContentModerationService,
  ) {}

  /**
   * Add message to dispute
   * Checks access, validates message, optionally moderates content
   */
  async addMessage(
    disputeId: string,
    dto: AddMessageDto,
    userId: string,
    userRole?: UserRole,
  ) {
    // 1. Check access (participant or admin)
    const hasAccess = await this.disputesService.checkUserAccess(
      disputeId,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not authorized to add messages to this dispute',
      );
    }

    // 2. Validate dispute exists
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // 3. Validate internal messages (admin only)
    if (dto.isInternal && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only admins can create internal messages',
      );
    }

    // 4. Optional: Moderate content for spam/profanity (reuse Chat moderation)
    // Note: ContentModerationService is available but not required for dispute messages
    // For now, we'll just validate length and save

    // 5. Create message
    const message = await this.prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId: userId,
        message: dto.message,
        isInternal: dto.isInternal ?? false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 6. Audit log
    await this.auditService.log({
      action: AuditAction.DISPUTE_MESSAGE_ADDED,
      entity: AuditEntity.DISPUTE_MESSAGE,
      entityId: message.id,
      userId,
      metadata: {
        disputeId,
        isInternal: message.isInternal,
      },
    });

    this.logger.log(`Message added to dispute: ${disputeId} by user: ${userId}`);

    return message;
  }

  /**
   * Get messages for dispute with pagination
   * Filters internal messages (admin can see all, participants see only public)
   */
  async getMessages(
    disputeId: string,
    userId: string,
    userRole: UserRole | undefined,
    query: DisputeQueryDto,
  ) {
    // Check access
    const hasAccess = await this.disputesService.checkUserAccess(
      disputeId,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not authorized to view messages for this dispute',
      );
    }

    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Build where clause for message filtering
    const where: any = {
      disputeId,
    };

    // Admin can see all messages, participants see only public
    if (userRole !== UserRole.ADMIN) {
      where.OR = [
        { isInternal: false }, // Public messages
        { isInternal: true, senderId: userId }, // User's own internal messages
      ];
    }

    const [messages, total] = await Promise.all([
      this.prisma.disputeMessage.findMany({
        where,
        skip,
        take: limit,
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
      }),
      this.prisma.disputeMessage.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

