import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction } from '../shared/audit/enums/audit-action.enum';
import { ContentModerationService } from './services/content-moderation.service';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ChatRoom, Message, User, Prisma } from '@prisma/client';

/**
 * Chat Service
 * 
 * Business logic for chat operations:
 * - Chat room management
 * - Message sending with automatic moderation
 * - Message editing (within 5 minutes)
 * - Message history with pagination
 * - Read receipts
 * - Unread count tracking
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly EDIT_WINDOW_MINUTES = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly contentModerationService: ContentModerationService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find or create chat room for an order
   * One chat room per order
   */
  async findOrCreateChatRoom(orderId: string): Promise<ChatRoom> {
    // Check if chat room already exists
    let chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
    });

    if (!chatRoom) {
      // Create new chat room
      chatRoom = await this.prisma.chatRoom.create({
        data: { orderId },
      });
      
      this.logger.log(`Created chat room for order: ${orderId}`);
    }

    return chatRoom;
  }

  /**
   * Get chat room by order ID
   */
  async getChatRoom(orderId: string): Promise<ChatRoom> {
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { orderId },
    });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found for this order');
    }

    return chatRoom;
  }

  /**
   * Close chat room (mark as closed)
   * Used when order is completed + N days
   */
  async closeChatRoom(orderId: string): Promise<void> {
    const chatRoom = await this.getChatRoom(orderId);

    await this.prisma.chatRoom.update({
      where: { id: chatRoom.id },
      data: { closedAt: new Date() },
    });

    this.logger.log(`Closed chat room for order: ${orderId}`);
  }

  /**
   * Send message with automatic moderation
   * 
   * Flow:
   * 1. Validate user access to order
   * 2. Find or create chat room
   * 3. Moderate message content
   * 4. Save to database (original + cleaned)
   * 5. Return message for WebSocket broadcast
   */
  async sendMessage(dto: SendMessageDto, userId: string): Promise<Message> {
    // Validate order exists and get participants
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      select: {
        id: true,
        clientId: true,
        contractorId: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify user is participant
    const isParticipant = order.clientId === userId || order.contractorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this order');
    }

    // Determine receiver
    const receiverId = order.clientId === userId ? order.contractorId : order.clientId;

    if (!receiverId) {
      throw new BadRequestException('Order does not have both participants');
    }

    // Find or create chat room
    const chatRoom = await this.findOrCreateChatRoom(dto.orderId);

    // Check if chat is closed
    if (chatRoom.closedAt) {
      throw new ForbiddenException('This chat has been closed');
    }

    // Moderate message content
    const moderationResult = this.contentModerationService.moderateMessage(dto.content);

    // Save message to database
    const message = await this.prisma.message.create({
      data: {
        roomId: chatRoom.id,
        orderId: dto.orderId,
        senderId: userId,
        receiverId,
        content: moderationResult.cleanedContent,
        isModerated: moderationResult.isModerated,
        moderationFlags: moderationResult.isModerated 
          ? moderationResult.flags 
          : Prisma.JsonNull,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(
      `Message sent in order ${dto.orderId} by user ${userId}${
        moderationResult.isModerated ? ' (moderated)' : ''
      }`,
    );

    // Audit log
    await this.auditService.log({
      action: AuditAction.CHAT_MESSAGE_SENT,
      userId,
      resourceType: 'message',
      resourceId: message.id,
      metadata: {
        orderId: dto.orderId,
        isModerated: moderationResult.isModerated,
        moderationFlags: moderationResult.flags,
      },
    });

    return message;
  }

  /**
   * Edit message (within 5 minutes)
   * 
   * @param messageId - Message ID to edit
   * @param content - New content
   * @param userId - User attempting to edit
   * @returns Updated message
   */
  async editMessage(messageId: string, content: string, userId: string): Promise<Message> {
    // Fetch message
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify sender
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Check if already edited
    if (message.isEdited) {
      throw new BadRequestException('Message has already been edited');
    }

    // Check edit window (5 minutes)
    const now = new Date();
    const messageAge = now.getTime() - message.createdAt.getTime();
    const editWindowMs = this.EDIT_WINDOW_MINUTES * 60 * 1000;

    if (messageAge > editWindowMs) {
      throw new ForbiddenException(
        `Message can only be edited within ${this.EDIT_WINDOW_MINUTES} minutes`,
      );
    }

    // Moderate new content
    const moderationResult = this.contentModerationService.moderateMessage(content);

    // Update message
    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: moderationResult.cleanedContent,
        isModerated: moderationResult.isModerated,
        moderationFlags: moderationResult.isModerated 
          ? moderationResult.flags 
          : Prisma.JsonNull,
        isEdited: true,
        editedAt: now,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(`Message ${messageId} edited by user ${userId}`);

    // Audit log
    await this.auditService.log({
      action: AuditAction.CHAT_MESSAGE_EDITED,
      userId,
      resourceType: 'message',
      resourceId: messageId,
      metadata: {
        orderId: updatedMessage.orderId,
        isModerated: moderationResult.isModerated,
        moderationFlags: moderationResult.flags,
      },
    });

    return updatedMessage;
  }

  /**
   * Get messages for an order (with pagination)
   * Supports cursor-based and offset-based pagination
   * 
   * @param orderId - Order ID
   * @param pagination - Pagination params
   * @param userId - Current user ID (for authorization check)
   * @returns Array of messages
   */
  async getMessages(
    orderId: string,
    pagination: PaginationDto,
    userId: string,
  ): Promise<Message[]> {
    // Verify user is participant
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        clientId: true,
        contractorId: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isParticipant = order.clientId === userId || order.contractorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this order');
    }

    const { page = 1, limit = 50, before } = pagination;
    const skip = (page - 1) * limit;

    // Build query
    const whereClause: any = { orderId };

    // Cursor-based pagination (if 'before' timestamp provided)
    if (before) {
      whereClause.createdAt = {
        lt: new Date(before),
      };
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: before ? 0 : skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Mark messages as read
   * Updates isRead and readAt for specified messages
   * 
   * @param orderId - Order ID
   * @param userId - User marking messages as read
   * @param messageIds - Array of message IDs to mark as read
   */
  async markAsRead(orderId: string, userId: string, messageIds: string[]): Promise<void> {
    // Verify user is participant
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        clientId: true,
        contractorId: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isParticipant = order.clientId === userId || order.contractorId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this order');
    }

    // Update messages where user is receiver
    await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        orderId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(`Marked ${messageIds.length} messages as read for user ${userId}`);
  }

  /**
   * Get unread message count for a user in an order
   * 
   * @param orderId - Order ID
   * @param userId - User ID
   * @returns Number of unread messages
   */
  async getUnreadCount(orderId: string, userId: string): Promise<number> {
    const count = await this.prisma.message.count({
      where: {
        orderId,
        receiverId: userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Get all active chats for a user
   * Returns list of chat rooms with last message and unread count
   * 
   * @param userId - User ID
   * @returns Array of chat rooms with metadata
   */
  async getUserChats(userId: string) {
    // Get all orders where user is participant
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [{ clientId: userId }, { contractorId: userId }],
        status: {
          in: ['PUBLISHED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED'],
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        clientId: true,
        contractorId: true,
        client: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Get chat data for each order
    const chats = await Promise.all(
      orders.map(async (order) => {
        // Get last message
        const lastMessage = await this.prisma.message.findFirst({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        });

        // Get unread count
        const unreadCount = await this.getUnreadCount(order.id, userId);

        // Determine other participant
        const otherParticipant =
          order.clientId === userId ? order.contractor : order.client;

        return {
          orderId: order.id,
          orderTitle: order.title,
          orderStatus: order.status,
          otherParticipant,
          lastMessage,
          unreadCount,
        };
      }),
    );

    // Filter out chats with no messages and sort by last message time
    return chats
      .filter((chat) => chat.lastMessage !== null)
      .sort((a, b) => {
        if (!a.lastMessage || !b.lastMessage) return 0;
        return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
      });
  }
}

