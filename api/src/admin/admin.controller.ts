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
import { ReportStatus } from '@prisma/client';
import { ChangeSubscriptionTierDto, ExtendSubscriptionDto } from './dto/manage-subscription.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

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
}
