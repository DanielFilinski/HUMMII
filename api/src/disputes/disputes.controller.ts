import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DisputesService } from './disputes.service';
import { EvidenceService } from './services/evidence.service';
import { DisputeMessagesService } from './services/dispute-messages.service';
import { ResolutionService } from './services/resolution.service';
import { DisputeAccessGuard } from './guards/dispute-access.guard';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { DisputeQueryDto } from './dto/dispute-query.dto';
import { DisputeEntity } from './entities/dispute.entity';
import { DisputeEvidenceEntity } from './entities/dispute-evidence.entity';
import { DisputeMessageEntity } from './entities/dispute-message.entity';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly evidenceService: EvidenceService,
    private readonly messagesService: DisputeMessagesService,
    private readonly resolutionService: ResolutionService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== USER ENDPOINTS ====================

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 86400000 } }) // 5 disputes per day (86400000 ms = 24 hours)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create dispute',
    description: 'Create a new dispute for an order. Only participants can create disputes.',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispute created successfully',
    type: DisputeEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or order status' })
  @ApiResponse({ status: 403, description: 'Not authorized to create dispute' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Dispute already exists for this order' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createDispute(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateDisputeDto,
  ) {
    return this.disputesService.createDispute(user.userId, createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user disputes',
    description: 'Get disputes where user is either initiator or respondent. Supports pagination and filtering.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['OPENED', 'UNDER_REVIEW', 'AWAITING_INFO', 'RESOLVED', 'CLOSED'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @ApiQuery({ name: 'orderId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Disputes retrieved successfully',
  })
  async getUserDisputes(
    @CurrentUser() user: JwtPayload,
    @Query() query: DisputeQueryDto,
  ) {
    return this.disputesService.getUserDisputes(user.userId, query);
  }

  @Get(':id')
  @UseGuards(DisputeAccessGuard)
  @ApiOperation({
    summary: 'Get dispute details',
    description: 'Get full dispute details with evidence and messages. Only participants and admins can access.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiResponse({
    status: 200,
    description: 'Dispute retrieved successfully',
    type: DisputeEntity,
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view dispute' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getDisputeById(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
  ) {
    const userRole = user.roles?.includes(UserRole.ADMIN) ? UserRole.ADMIN : undefined;
    return this.disputesService.getDisputeById(disputeId, user.userId, userRole);
  }

  @Post(':id/evidence')
  @UseGuards(DisputeAccessGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 files per hour (3600000 ms = 1 hour)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload evidence',
    description: 'Upload evidence file for dispute. Max 20MB per file, max 10 files per dispute.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        evidenceType: {
          type: 'string',
          enum: ['PHOTO', 'SCREENSHOT', 'DOCUMENT', 'CONTRACT', 'COMMUNICATION', 'RECEIPT', 'OTHER'],
        },
        description: {
          type: 'string',
          maxLength: 500,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Evidence uploaded successfully',
    type: DisputeEvidenceEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file size exceeded' })
  @ApiResponse({ status: 403, description: 'Not authorized to upload evidence' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async uploadEvidence(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AddEvidenceDto,
  ) {
    if (!file) {
      throw new Error('File is required');
    }

    const userRole = user.roles?.includes(UserRole.ADMIN) ? UserRole.ADMIN : undefined;
    return this.evidenceService.uploadEvidence(
      disputeId,
      file,
      dto,
      user.userId,
      userRole,
    );
  }

  @Get(':id/evidence')
  @UseGuards(DisputeAccessGuard)
  @ApiOperation({
    summary: 'Get evidence list',
    description: 'Get all evidence files for dispute. Only participants and admins can access.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiResponse({
    status: 200,
    description: 'Evidence list retrieved successfully',
    type: [DisputeEvidenceEntity],
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view evidence' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getEvidence(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
  ) {
    const userRole = user.roles?.includes(UserRole.ADMIN) ? UserRole.ADMIN : undefined;
    return this.evidenceService.getEvidence(disputeId, user.userId, userRole);
  }

  @Delete(':id/evidence/:evidenceId')
  @UseGuards(DisputeAccessGuard)
  @ApiOperation({
    summary: 'Delete evidence',
    description: 'Delete evidence file. Only the uploader can delete their own evidence.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiParam({ name: 'evidenceId', description: 'Evidence UUID' })
  @ApiResponse({
    status: 200,
    description: 'Evidence deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized to delete evidence' })
  @ApiResponse({ status: 404, description: 'Evidence not found' })
  async deleteEvidence(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
  ) {
    return this.evidenceService.deleteEvidence(evidenceId, user.userId);
  }

  @Post(':id/messages')
  @UseGuards(DisputeAccessGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 messages per hour (3600000 ms = 1 hour)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add message to dispute',
    description: 'Add a message to dispute. Internal messages are admin-only.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiResponse({
    status: 201,
    description: 'Message added successfully',
    type: DisputeMessageEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid message' })
  @ApiResponse({ status: 403, description: 'Not authorized to add message' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async addMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
    @Body() dto: AddMessageDto,
  ) {
    const userRole = user.roles?.includes(UserRole.ADMIN) ? UserRole.ADMIN : undefined;
    return this.messagesService.addMessage(disputeId, dto, user.userId, userRole);
  }

  @Get(':id/messages')
  @UseGuards(DisputeAccessGuard)
  @ApiOperation({
    summary: 'Get dispute messages',
    description: 'Get messages for dispute with pagination. Internal messages are admin-only.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view messages' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
    @Query() query: DisputeQueryDto,
  ) {
    const userRole = user.roles?.includes(UserRole.ADMIN) ? UserRole.ADMIN : undefined;
    return this.messagesService.getMessages(disputeId, user.userId, userRole, query);
  }

  // ==================== ADMIN ENDPOINTS ====================
  // Note: Admin endpoints should be in AdminController, not here
  // These are kept here for MVP, but should be moved to AdminController in Phase 10
}

/**
 * Admin Disputes Controller
 * Separate controller for admin dispute management endpoints
 * Should be merged with AdminController in Phase 10
 */
@ApiTags('Admin')
@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminDisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly resolutionService: ResolutionService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get disputes queue (Admin only)',
    description: 'Get all disputes for admin review with filtering and pagination.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['OPENED', 'UNDER_REVIEW', 'AWAITING_INFO', 'RESOLVED', 'CLOSED'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @ApiResponse({
    status: 200,
    description: 'Disputes queue retrieved successfully',
  })
  async getAdminDisputesQueue(@Query() query: DisputeQueryDto) {
    // Get all disputes for admin (no user filter)
    const { page = 1, limit = 20, status, priority } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get dispute details (Admin view)',
    description: 'Get full dispute details with all evidence and messages (including internal).',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiResponse({
    status: 200,
    description: 'Dispute retrieved successfully',
    type: DisputeEntity,
  })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getAdminDisputeDetails(
    @Param('id', ParseUUIDPipe) disputeId: string,
  ) {
    return this.disputesService.getDisputeById(disputeId, '', UserRole.ADMIN);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resolve dispute (Admin only)',
    description: 'Resolve dispute with resolution action (block user, suspend account, close order, warn user, no action).',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiResponse({
    status: 200,
    description: 'Dispute resolved successfully',
    type: DisputeEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid resolution or dispute status' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async resolveDispute(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.resolutionService.resolveDispute(disputeId, dto, admin.userId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update dispute status (Admin only)',
    description: 'Update dispute status and priority. Admin can move to any valid status.',
  })
  @ApiParam({ name: 'id', description: 'Dispute UUID' })
  @ApiResponse({
    status: 200,
    description: 'Dispute status updated successfully',
    type: DisputeEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async updateDisputeStatus(
    @CurrentUser() admin: JwtPayload,
    @Param('id', ParseUUIDPipe) disputeId: string,
    @Body() dto: UpdateDisputeStatusDto,
  ) {
    return this.disputesService.updateStatus(disputeId, dto, admin.userId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get dispute statistics (Admin only)',
    description: 'Get dispute statistics for admin dashboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getDisputeStats() {
    const [total, byStatus, byPriority] = await Promise.all([
      this.prisma.dispute.count(),
      this.prisma.dispute.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.dispute.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

