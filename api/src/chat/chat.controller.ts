import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderParticipantGuard } from './guards/order-participant.guard';
import { ChatService } from './chat.service';
import { ChatExportService } from './services/chat-export.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction } from '../shared/audit/enums/audit-action.enum';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ExportChatDto } from './dto/export-chat.dto';
import { Throttle } from '@nestjs/throttler';

/**
 * Chat Controller
 * 
 * REST API endpoints for chat functionality (fallback + history):
 * - Get message history
 * - Send message (REST fallback)
 * - Edit message
 * - Mark messages as read
 * - Get unread count
 * - Export chat (PDF/TXT)
 * - List user's active chats
 * 
 * All endpoints require JWT authentication.
 * Order-specific endpoints require user to be participant of the order.
 */
@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatExportService: ChatExportService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get message history for an order
   * Supports pagination and cursor-based loading
   */
  @Get(':orderId/messages')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  @ApiOperation({ summary: 'Get message history for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Messages per page (default 50, max 100)', type: Number })
  @ApiQuery({ name: 'before', required: false, description: 'Get messages before this timestamp', type: String })
  @ApiResponse({ status: 200, description: 'Message history retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not a participant of this order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getMessages(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Query() pagination: PaginationDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const messages = await this.chatService.getMessages(orderId, pagination, userId);
    
    return {
      success: true,
      data: messages,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 50,
        hasMore: messages.length === (pagination.limit || 50),
      },
    };
  }

  /**
   * Send message (REST fallback)
   * Prefer WebSocket for real-time messaging
   */
  @Post(':orderId/messages')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message (REST fallback, prefer WebSocket)' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Not a participant of this order' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async sendMessage(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: SendMessageDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    
    // Override orderId from path
    dto.orderId = orderId;
    
    const message = await this.chatService.sendMessage(dto, userId);
    
    return {
      success: true,
      data: message,
      message: 'Message sent successfully',
    };
  }

  /**
   * Edit message (within 5 minutes)
   */
  @Patch(':orderId/messages/:messageId')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({ summary: 'Edit message (within 5 minutes)' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: String })
  @ApiResponse({ status: 200, description: 'Message edited successfully' })
  @ApiResponse({ status: 400, description: 'Message already edited or edit window expired' })
  @ApiResponse({ status: 403, description: 'Can only edit own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async editMessage(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: EditMessageDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const message = await this.chatService.editMessage(messageId, dto.content, userId);
    
    return {
      success: true,
      data: message,
      message: 'Message edited successfully',
    };
  }

  /**
   * Mark messages as read
   */
  @Post(':orderId/mark-read')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  @ApiResponse({ status: 403, description: 'Not a participant of this order' })
  async markAsRead(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: MarkAsReadDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    await this.chatService.markAsRead(orderId, userId, dto.messageIds);
    
    return {
      success: true,
      message: 'Messages marked as read',
    };
  }

  /**
   * Get unread message count for an order
   */
  @Get(':orderId/unread-count')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  @ApiResponse({ status: 403, description: 'Not a participant of this order' })
  async getUnreadCount(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const count = await this.chatService.getUnreadCount(orderId, userId);
    
    return {
      success: true,
      data: { unreadCount: count },
    };
  }

  /**
   * Get all active chats for current user
   * Returns list of chats with last message and unread count
   */
  @Get('my-chats')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute
  @ApiOperation({ summary: 'Get all active chats for current user' })
  @ApiResponse({ status: 200, description: 'User chats retrieved successfully' })
  async getUserChats(@Req() req: any) {
    const userId = req.user.id;
    const chats = await this.chatService.getUserChats(userId);
    
    return {
      success: true,
      data: chats,
      count: chats.length,
    };
  }

  /**
   * Export chat messages (PIPEDA compliance)
   * Supports PDF and TXT formats
   */
  @Get(':orderId/export')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute (stricter)
  @ApiOperation({ summary: 'Export chat messages (PIPEDA compliance)' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiQuery({ name: 'format', required: false, enum: ['pdf', 'txt'], description: 'Export format (default: pdf)' })
  @ApiResponse({ status: 200, description: 'Chat exported successfully' })
  @ApiResponse({ status: 403, description: 'Not a participant of this order' })
  async exportChat(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Query() dto: ExportChatDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const format = dto.format || 'pdf';
    
    // Audit log
    await this.auditService.log({
      action: AuditAction.CHAT_EXPORTED,
      userId,
      resourceType: 'chat',
      resourceId: orderId,
      metadata: { format },
    });
    
    if (format === 'pdf') {
      const pdfBuffer = await this.chatExportService.exportToPdf(orderId, userId);
      return {
        success: true,
        data: pdfBuffer.toString('base64'),
        format: 'pdf',
        filename: `chat-${orderId.slice(0, 8)}.pdf`,
      };
    } else {
      const txtContent = await this.chatExportService.exportToTxt(orderId, userId);
      return {
        success: true,
        data: txtContent,
        format: 'txt',
        filename: `chat-${orderId.slice(0, 8)}.txt`,
      };
    }
  }

  /**
   * Report abusive message
   * Creates moderation ticket for admin review
   */
  @Post(':orderId/report')
  @UseGuards(OrderParticipantGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute (strict)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report abusive message' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 200, description: 'Message reported successfully' })
  @ApiResponse({ status: 403, description: 'Not a participant of this order' })
  async reportMessage(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() body: { messageId: string; reason: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    
    // Audit log
    await this.auditService.log({
      action: AuditAction.CHAT_MESSAGE_REPORTED,
      userId,
      resourceType: 'message',
      resourceId: body.messageId,
      metadata: {
        orderId,
        reason: body.reason,
      },
    });
    
    return {
      success: true,
      message: 'Message reported. Our team will review it shortly.',
    };
  }
}

