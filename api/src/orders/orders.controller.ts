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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderOwnerGuard } from './guards/order-owner.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { SearchOrdersDto } from './dto/search-orders.dto';
import { OrderEntity } from './entities/order.entity';

interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 orders per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create order (draft)',
    description:
      'Create new order with draft status. Client can edit before publishing.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or category/contractor not found',
  })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.userId, createDto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, OrderOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish order',
    description: 'Publish draft order to make it visible to contractors.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order published successfully',
    type: OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'Only draft orders can be published' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async publishOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.publishOrder(orderId, user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Update order status. Only client or assigned contractor can update.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(orderId, user.userId, updateDto.status);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search and filter orders',
    description:
      'Public endpoint to search orders. Supports text search, category filter, budget range, and geospatial radius search.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders found successfully',
    type: [OrderEntity],
  })
  async searchOrders(@Query() searchDto: SearchOrdersDto) {
    return this.ordersService.search(searchDto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my orders',
    description:
      'Get orders for current user (as client or contractor). Filter by role if specified.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['client', 'contractor'],
    description: 'Filter by role',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [OrderEntity],
  })
  async getMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query('role') role?: 'client' | 'contractor',
  ) {
    return this.ordersService.getMyOrders(user.userId, role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Get order details. Full details for authorized users (client/contractor), limited info for others.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderEntity,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(
    @Param('id') orderId: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.ordersService.findOne(orderId, user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OrderOwnerGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 updates per hour
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update order',
    description: 'Update order details. Only draft orders can be edited.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Only draft orders can be edited',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async updateOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(orderId, user.userId, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OrderOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete order',
    description: 'Delete order. Only draft orders can be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Only draft orders can be deleted',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
  ) {
    await this.ordersService.delete(orderId, user.userId);
  }
}


