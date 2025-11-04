import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { ProposalEntity } from './entities/proposal.entity';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';

interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

@ApiTags('Proposals')
@Controller()
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('orders/:orderId/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 proposals per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit proposal for order',
    description:
      'Contractor submits proposal for public order. Only one proposal per order allowed.',
  })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({
    status: 201,
    description: 'Proposal submitted successfully',
    type: ProposalEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Order not accepting proposals or not public',
  })
  @ApiResponse({ status: 409, description: 'Proposal already submitted' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createProposal(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
    @Body() createDto: CreateProposalDto,
  ) {
    return this.proposalsService.create(orderId, user.userId, createDto);
  }

  @Get('orders/:orderId/proposals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get proposals for order',
    description: 'Get all proposals for an order. Only order owner (client) can view.',
  })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Proposals retrieved successfully',
    type: [ProposalEntity],
  })
  @ApiResponse({ status: 403, description: 'Not authorized (not order owner)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderProposals(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ) {
    // Verify user is order owner
    const order = await this.ordersService.findOne(orderId, user.userId);

    if (order.clientId !== user.userId) {
      throw new ForbiddenException('Only the order owner can view proposals');
    }

    return this.proposalsService.findByOrder(orderId);
  }

  @Post('proposals/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept proposal',
    description:
      'Accept proposal and assign contractor to order. Rejects all other proposals. Only order client can accept.',
  })
  @ApiParam({ name: 'id', description: 'Proposal UUID' })
  @ApiResponse({
    status: 200,
    description: 'Proposal accepted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Order not accepting proposals',
  })
  @ApiResponse({ status: 403, description: 'Not authorized (not order client)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async acceptProposal(
    @CurrentUser() user: JwtPayload,
    @Param('id') proposalId: string,
  ) {
    return this.proposalsService.accept(proposalId, user.userId);
  }

  @Post('proposals/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject proposal',
    description: 'Reject proposal. Only order client can reject.',
  })
  @ApiParam({ name: 'id', description: 'Proposal UUID' })
  @ApiResponse({
    status: 200,
    description: 'Proposal rejected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Proposal already processed',
  })
  @ApiResponse({ status: 403, description: 'Not authorized (not order client)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async rejectProposal(
    @CurrentUser() user: JwtPayload,
    @Param('id') proposalId: string,
  ) {
    return this.proposalsService.reject(proposalId, user.userId);
  }

  @Get('proposals/my-proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my proposals',
    description: 'Get all proposals submitted by current contractor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Proposals retrieved successfully',
    type: [ProposalEntity],
  })
  async getMyProposals(@CurrentUser() user: JwtPayload) {
    return this.proposalsService.getMyProposals(user.userId);
  }

  @Patch('proposals/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 updates per hour
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update proposal',
    description:
      'Update proposal details. Only pending proposals can be updated. Only proposal owner can update.',
  })
  @ApiParam({ name: 'id', description: 'Proposal UUID' })
  @ApiResponse({
    status: 200,
    description: 'Proposal updated successfully',
    type: ProposalEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Only pending proposals can be updated',
  })
  @ApiResponse({ status: 403, description: 'Not authorized (not proposal owner)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async updateProposal(
    @CurrentUser() user: JwtPayload,
    @Param('id') proposalId: string,
    @Body() updateDto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(proposalId, user.userId, updateDto);
  }
}


