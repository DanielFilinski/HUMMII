import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AddUserRoleDto } from './dto/add-user-role.dto';
import { RemoveUserRoleDto } from './dto/remove-user-role.dto';
import { VerifyContractorDto } from './dto/verify-contractor.dto';
import { ModerateReviewDto } from '../reviews/dto/moderate-review.dto';
import { ReportStatus, NotificationType, NotificationChannel } from '@prisma/client';
import { ChangeSubscriptionTierDto, ExtendSubscriptionDto } from './dto/manage-subscription.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AdminOrderQueryDto } from './dto/order-query.dto';
import { AdminUpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { AdminSubscriptionQueryDto } from './dto/subscription-query.dto';
import { CreatePlatformResponseDto } from './dto/create-platform-response.dto';
import { BulkModerateReviewsDto } from './dto/bulk-moderate-reviews.dto';
import { SendBulkNotificationDto } from './dto/send-bulk-notification.dto';
import { NotificationStatsQueryDto } from './dto/notification-stats.dto';
import { UpdateSettingsDto, BulkUpdateSettingsDto } from './dto/update-settings.dto';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './dto/feature-flags.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // All routes require ADMIN role
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      role,
      search,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users/:id/roles')
  @ApiOperation({ summary: 'Add role to user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role added successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async addUserRole(
    @Param('id') id: string,
    @Body() dto: AddUserRoleDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.addUserRole(id, dto.role, admin.userId);
  }

  @Delete('users/:id/roles')
  @ApiOperation({ summary: 'Remove role from user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async removeUserRole(
    @Param('id') id: string,
    @Body() dto: RemoveUserRoleDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.removeUserRole(id, dto.role, admin.userId);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user roles (replace all) - DEPRECATED (Admin only)' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateUserRole(id, dto.roles, admin.userId);
  }

  @Patch('users/:id/lock')
  @ApiOperation({ summary: 'Lock user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User account locked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async lockUser(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.lockUser(id, admin.userId, reason);
  }

  @Patch('users/:id/unlock')
  @ApiOperation({ summary: 'Unlock user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User account unlocked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async unlockUser(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.unlockUser(id, admin.userId);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (soft delete) (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @CurrentUser() admin: any) {
    await this.adminService.deleteUser(id, admin.userId);
  }

  // ==================== CONTRACTOR VERIFICATION ====================

  @Get('contractors/pending')
  @ApiOperation({ summary: 'Get contractors pending verification (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pending contractors retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingContractors(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getPendingContractors({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Patch('contractors/:id/verify')
  @ApiOperation({ summary: 'Verify contractor (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contractor verified successfully',
  })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  @ApiParam({ name: 'id', description: 'Contractor ID' })
  async verifyContractor(
    @Param('id') id: string,
    @Body() dto: VerifyContractorDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.verifyContractor(id, dto, admin.userId);
  }

  @Patch('contractors/:id/reject')
  @ApiOperation({ summary: 'Reject contractor verification (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contractor verification rejected',
  })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  @ApiParam({ name: 'id', description: 'Contractor ID' })
  async rejectContractor(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectContractor(id, admin.userId, reason);
  }

  // ==================== AUDIT LOGS ====================

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'resourceType', required: false, type: String })
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '50', 10),
      userId,
      action,
      resourceType,
    });
  }

  @Get('audit-logs/:id')
  @ApiOperation({ summary: 'Get audit log details (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Audit log details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  async getAuditLogById(@Param('id') id: string) {
    return this.adminService.getAuditLogById(id);
  }

  // ==================== PLATFORM STATISTICS ====================

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Platform statistics retrieved successfully',
  })
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('stats/users')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  async getUserStats(@Query('period') period?: string) {
    return this.adminService.getUserStats(period || 'month');
  }

  // ==================== PORTFOLIO MODERATION ====================

  @Get('portfolio/pending')
  @ApiOperation({ summary: 'Get portfolio items pending moderation (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pending portfolio items retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingPortfolio(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getPendingPortfolio({
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Patch('portfolio/:id/approve')
  @ApiOperation({ summary: 'Approve portfolio item (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio item approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  async approvePortfolioItem(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.adminService.approvePortfolioItem(id, admin.userId);
  }

  @Patch('portfolio/:id/reject')
  @ApiOperation({ summary: 'Reject portfolio item (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio item rejected',
  })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  @ApiParam({ name: 'id', description: 'Portfolio item ID' })
  async rejectPortfolioItem(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectPortfolioItem(id, admin.userId, reason);
  }

  // ==================== REVIEW MODERATION ====================

  @Get('reviews/pending')
  @ApiOperation({ summary: 'Get pending reviews queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pending reviews retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPendingReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getPendingReviews({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get('reviews/flagged')
  @ApiOperation({ summary: 'Get flagged reviews (Admin only)' })
  @ApiResponse({ status: 200, description: 'Flagged reviews retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFlaggedReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getFlaggedReviews({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Patch('reviews/:id/moderate')
  @ApiOperation({ summary: 'Moderate review (approve/reject) (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review moderated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  async moderateReview(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.moderateReview(id, dto, admin.userId);
  }

  @Get('reviews/reports')
  @ApiOperation({ summary: 'Get review reports queue (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review reports retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReviewReports(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getReviewReports({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Patch('reviews/reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve review report (Admin only)' })
  @ApiResponse({ status: 200, description: 'Review report resolved successfully' })
  @ApiResponse({ status: 404, description: 'Review report not found' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async resolveReviewReport(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('resolution') resolution: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.adminService.resolveReviewReport(id, admin.userId, resolution, status);
  }

  @Delete('reviews/:id')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: 'Delete review (Admin override)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.deleteReview(id, admin.userId, reason);
  }

  @Post('reviews/:id/response')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({
    summary: 'Create platform response to review (Admin only)',
    description: 'Admin can respond to review on behalf of platform.',
  })
  @ApiResponse({ status: 201, description: 'Platform response created successfully' })
  @ApiResponse({ status: 400, description: 'Response already exists' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  async createPlatformResponse(
    @Param('id') id: string,
    @Body() dto: CreatePlatformResponseDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.createPlatformResponse(id, dto, admin.userId);
  }

  @Post('reviews/bulk-moderate')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Bulk moderate reviews (Admin only)',
    description: 'Approve or reject multiple reviews at once (max 100 reviews).',
  })
  @ApiResponse({ status: 200, description: 'Reviews moderated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @HttpCode(HttpStatus.OK)
  async bulkModerateReviews(
    @Body() dto: BulkModerateReviewsDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.bulkModerateReviews(dto, admin.userId);
  }

  // ==================== ORDER MANAGEMENT ====================

  @Get('orders')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get all orders with filtering (Admin only)' })
  @ApiResponse({ status: 200, description: 'Orders list retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiQuery({ name: 'contractorId', required: false, type: String })
  @ApiQuery({ name: 'minBudget', required: false, type: Number })
  @ApiQuery({ name: 'maxBudget', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'budget', 'status'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getAllOrders(@Query() query: AdminOrderQueryDto) {
    return this.adminService.getAllOrders(query);
  }

  @Get('orders/:id')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get order details (Admin only, full PII)' })
  @ApiResponse({ status: 200, description: 'Order details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Patch('orders/:id/status')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({
    summary: 'Update order status (Admin override)',
    description: 'Update order status with admin override. Allows DISPUTED → COMPLETED/CANCELLED.',
  })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateOrderStatusDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateOrderStatus(id, dto, admin.userId);
  }

  @Patch('orders/:id/cancel')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({
    summary: 'Cancel order (Admin override)',
    description: 'Cancel order with admin override. Can cancel any order regardless of status.',
  })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.cancelOrder(id, dto, admin.userId);
  }

  @Get('orders/stats')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get order statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  async getOrderStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.adminService.getOrderStats({ startDate, endDate, categoryId });
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  @Get('subscriptions')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get all subscriptions with filtering (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscriptions list retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tier', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'contractorId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'tier', 'status', 'currentPeriodEnd'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getAllSubscriptions(@Query() query: AdminSubscriptionQueryDto) {
    return this.adminService.getAllSubscriptions(query);
  }

  @Get('subscriptions/:id')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get subscription details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  async getSubscriptionById(@Param('id') id: string) {
    return this.adminService.getSubscriptionById(id);
  }

  @Patch('subscriptions/:id/tier')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Change subscription tier (Admin override)',
    description: 'Change subscription tier with admin override. Can change to any tier regardless of current tier.',
  })
  @ApiResponse({ status: 200, description: 'Subscription tier changed successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  async changeSubscriptionTier(
    @Param('id') id: string,
    @Body() dto: ChangeSubscriptionTierDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.changeSubscriptionTier(id, dto, admin.userId);
  }

  @Patch('subscriptions/:id/extend')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Extend subscription period (Admin override)',
    description: 'Extend subscription period by specified number of days.',
  })
  @ApiResponse({ status: 200, description: 'Subscription extended successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  async extendSubscription(
    @Param('id') id: string,
    @Body() dto: ExtendSubscriptionDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.extendSubscription(id, dto, admin.userId);
  }

  @Patch('subscriptions/:id/cancel')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Cancel subscription (Admin override)',
    description: 'Cancel subscription with admin override.',
  })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  async cancelSubscription(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.cancelSubscription(id, admin.userId, reason);
  }

  @Get('subscriptions/stats')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get subscription statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscription statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getSubscriptionStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getSubscriptionStats({ startDate, endDate });
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  @Post('notifications/bulk')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Send bulk notifications (Admin only)',
    description: 'Send notifications to multiple users, by role, or by category (max 1000 users).',
  })
  @ApiResponse({ status: 200, description: 'Bulk notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or no users found' })
  @HttpCode(HttpStatus.OK)
  async sendBulkNotification(
    @Body() dto: SendBulkNotificationDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.sendBulkNotification(dto, admin.userId);
  }

  @Get('notifications/stats')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get notification delivery statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'channel', required: false, enum: NotificationChannel })
  async getNotificationStats(@Query() query: NotificationStatsQueryDto) {
    return this.adminService.getNotificationStats(query);
  }

  @Get('notifications/templates')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'List notification templates (Admin only)' })
  @ApiResponse({ status: 200, description: 'Notification templates retrieved successfully' })
  async getNotificationTemplates() {
    return this.adminService.getNotificationTemplates();
  }

  @Get('notifications/:id')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get notification details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Notification details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async getNotificationById(@Param('id') id: string) {
    return this.adminService.getNotificationById(id);
  }

  @Get('notifications/user/:userId')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get user notification history (Admin only)' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUserNotifications(userId, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  // ==================== SYSTEM SETTINGS ====================

  @Get('settings')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get all system settings (Admin only)' })
  @ApiResponse({ status: 200, description: 'System settings retrieved successfully' })
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Get('settings/:key')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get system setting by key (Admin only)' })
  @ApiResponse({ status: 200, description: 'System setting retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  async getSystemSetting(@Param('key') key: string) {
    return this.adminService.getSystemSetting(key);
  }

  @Patch('settings')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({
    summary: 'Update system setting (Admin only)',
    description: 'Create or update a system setting. Creates if key doesn\'t exist, updates if it does.',
  })
  @ApiResponse({ status: 200, description: 'System setting updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid setting value' })
  async updateSystemSetting(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateSystemSettings(dto, admin.userId);
  }

  @Patch('settings/bulk')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Bulk update system settings (Admin only)',
    description: 'Update multiple system settings at once (max 50 settings).',
  })
  @ApiResponse({ status: 200, description: 'System settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @HttpCode(HttpStatus.OK)
  async bulkUpdateSystemSettings(
    @Body() dto: BulkUpdateSettingsDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.bulkUpdateSystemSettings(dto, admin.userId);
  }

  @Delete('settings/:key')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: 'Delete system setting (Admin only)' })
  @ApiResponse({ status: 200, description: 'System setting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  async deleteSystemSetting(
    @Param('key') key: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.deleteSystemSetting(key, admin.userId);
  }

  // ==================== FEATURE FLAGS ====================

  @Get('feature-flags')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get all feature flags (Admin only)' })
  @ApiResponse({ status: 200, description: 'Feature flags retrieved successfully' })
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Get('feature-flags/:name')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({ summary: 'Get feature flag by name (Admin only)' })
  @ApiResponse({ status: 200, description: 'Feature flag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  @ApiParam({ name: 'name', description: 'Feature flag name' })
  async getFeatureFlag(@Param('name') name: string) {
    return this.adminService.getFeatureFlag(name);
  }

  @Post('feature-flags')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: 'Create feature flag (Admin only)' })
  @ApiResponse({ status: 201, description: 'Feature flag created successfully' })
  @ApiResponse({ status: 400, description: 'Feature flag already exists' })
  @HttpCode(HttpStatus.CREATED)
  async createFeatureFlag(
    @Body() dto: CreateFeatureFlagDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.createFeatureFlag(dto, admin.userId);
  }

  @Patch('feature-flags/:name')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: 'Update feature flag (Admin only)' })
  @ApiResponse({ status: 200, description: 'Feature flag updated successfully' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  @ApiParam({ name: 'name', description: 'Feature flag name' })
  async updateFeatureFlag(
    @Param('name') name: string,
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.updateFeatureFlag(name, dto, admin.userId);
  }

  @Delete('feature-flags/:name')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min
  @ApiOperation({ summary: 'Delete feature flag (Admin only)' })
  @ApiResponse({ status: 200, description: 'Feature flag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  @ApiParam({ name: 'name', description: 'Feature flag name' })
  async deleteFeatureFlag(
    @Param('name') name: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminService.deleteFeatureFlag(name, admin.userId);
  }
}
