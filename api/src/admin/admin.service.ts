import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { UserRole, VerificationStatus, ReviewStatus, ReportStatus, OrderStatus } from '@prisma/client';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { VerifyContractorDto } from './dto/verify-contractor.dto';
import { ModerateReviewDto } from '../reviews/dto/moderate-review.dto';
import { RatingCalculationService } from '../reviews/services/rating-calculation.service';
import { AdminOrderQueryDto } from './dto/order-query.dto';
import { AdminUpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { canTransition } from '../orders/constants/status-transitions';
import { AdminSubscriptionQueryDto } from './dto/subscription-query.dto';
import { ChangeSubscriptionTierDto, ExtendSubscriptionDto } from './dto/manage-subscription.dto';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import { BulkModerateReviewsDto } from './dto/bulk-moderate-reviews.dto';
import { CreatePlatformResponseDto } from './dto/create-platform-response.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { ModerationService } from '../reviews/services/moderation.service';
import { SendBulkNotificationDto } from './dto/send-bulk-notification.dto';
import { NotificationStatsQueryDto } from './dto/notification-stats.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationPriority, NotificationChannel } from '@prisma/client';
import { UpdateSettingsDto, BulkUpdateSettingsDto } from './dto/update-settings.dto';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './dto/feature-flags.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { DisputesService } from '../disputes/disputes.service';
import { ResolutionService } from '../disputes/services/resolution.service';
import { DisputeQueryDto } from '../disputes/dto/dispute-query.dto';
import { ResolveDisputeDto } from '../disputes/dto/resolve-dispute.dto';
import { UpdateDisputeStatusDto } from '../disputes/dto/update-dispute-status.dto';
import { CategoriesService } from '../categories/categories.service';
import { SitemapService } from '../seo/services/sitemap.service';
import { IsrService } from '../seo/services/isr.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly ratingCalculationService: RatingCalculationService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly reviewsService: ReviewsService,
    private readonly moderationService: ModerationService,
    private readonly notificationsService: NotificationsService,
    private readonly disputesService: DisputesService,
    private readonly resolutionService: ResolutionService,
    private readonly categoriesService: CategoriesService,
    private readonly sitemapService: SitemapService,
    private readonly isrService: IsrService,
  ) {}

  // ==================== USER MANAGEMENT ====================

  async getAllUsers(filters: { page: number; limit: number; role?: UserRole; search?: string }) {
    const { page, limit, role, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Exclude soft-deleted users
    };

    if (role) {
      where.roles = {
        has: role, // Check if roles array contains this role
      };
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          roles: true, // Return roles array
          isVerified: true,
          lockedUntil: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          contractor: {
            select: {
              id: true,
              verificationStatus: true,
              rating: true,
              reviewCount: true,
              totalOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        contractor: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            portfolio: true,
            services: true,
          },
        },
        sessions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc', // Fixed: use createdAt instead of lastUsedAt
          },
          take: 10,
        },
        auditLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { password, resetToken, verificationToken, ...safeUser } = user;

    return safeUser;
  }

  /**
   * Add a role to user
   * Security: ADMIN only, with audit logging
   */
  async addUserRole(userId: string, roleToAdd: UserRole, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Security: Don't allow modifying your own roles
    if (user.id === adminId) {
      throw new BadRequestException('Cannot change your own roles');
    }

    // Check if user already has this role
    if (user.roles.includes(roleToAdd)) {
      throw new BadRequestException(`User already has ${roleToAdd} role`);
    }

    // Add role to array
    const updatedRoles = [...user.roles, roleToAdd];

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roles: updatedRoles },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
      },
    });

    // Audit log: Role added
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        operation: 'add_role',
        roleAdded: roleToAdd,
        previousRoles: user.roles,
        newRoles: updatedRoles,
        targetUser: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });

    return {
      message: `Role ${roleToAdd} added successfully`,
      user: updatedUser,
    };
  }

  /**
   * Remove a role from user
   * Security: ADMIN only, ensures user has at least one role
   */
  async removeUserRole(userId: string, roleToRemove: UserRole, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Security: Don't allow modifying your own roles
    if (user.id === adminId) {
      throw new BadRequestException('Cannot change your own roles');
    }

    // Check if user has this role
    if (!user.roles.includes(roleToRemove)) {
      throw new BadRequestException(`User doesn't have ${roleToRemove} role`);
    }

    // Security: User must have at least one role
    if (user.roles.length === 1) {
      throw new BadRequestException('User must have at least one role');
    }

    // Remove role from array
    const updatedRoles = user.roles.filter((r) => r !== roleToRemove);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roles: updatedRoles },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
      },
    });

    // Audit log: Role removed
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        operation: 'remove_role',
        roleRemoved: roleToRemove,
        previousRoles: user.roles,
        newRoles: updatedRoles,
        targetUser: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });

    return {
      message: `Role ${roleToRemove} removed successfully`,
      user: updatedUser,
    };
  }

  /**
   * Set user roles (replace all)
   * @deprecated Use addUserRole and removeUserRole instead
   * Security: ADMIN only, with validation
   */
  async updateUserRole(userId: string, newRoles: UserRole[], adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Security: Don't allow modifying your own roles
    if (user.id === adminId) {
      throw new BadRequestException('Cannot change your own roles');
    }

    // Security: Validate roles array
    if (!newRoles || newRoles.length === 0) {
      throw new BadRequestException('User must have at least one role');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roles: newRoles },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
      },
    });

    // Audit log: Roles replaced
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        operation: 'replace_roles',
        previousRoles: user.roles,
        newRoles: newRoles,
        targetUser: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });

    return {
      message: 'User roles updated successfully',
      user: updatedUser,
    };
  }

  async lockUser(userId: string, adminId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === adminId) {
      throw new BadRequestException('Cannot lock your own account');
    }

    // Security: Cannot lock admin accounts
    if (user.roles.includes(UserRole.ADMIN)) {
      throw new BadRequestException('Cannot lock admin accounts');
    }

    // Lock for 30 days
    const lockedUntil = new Date();
    lockedUntil.setDate(lockedUntil.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: { lockedUntil },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        action: 'lock_account',
        reason,
        lockedUntil,
      },
    });

    return {
      message: 'User account locked successfully',
      lockedUntil,
    };
  }

  async unlockUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        action: 'unlock_account',
      },
    });

    return {
      message: 'User account unlocked successfully',
    };
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === adminId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    if (user.roles.includes(UserRole.ADMIN)) {
      throw new BadRequestException('Cannot delete admin accounts');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${user.id}@deleted.local`,
        // Anonymize PII for PIPEDA compliance
        name: 'Deleted User',
        phone: null,
        avatar: null,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.DELETE,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        reason: 'Admin deletion',
      },
    });
  }

  // ==================== CONTRACTOR VERIFICATION ====================

  async getPendingContractors(filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const [contractors, total] = await Promise.all([
      this.prisma.contractor.findMany({
        where: {
          verificationStatus: VerificationStatus.PENDING,
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              createdAt: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.contractor.count({
        where: {
          verificationStatus: VerificationStatus.PENDING,
        },
      }),
    ]);

    return {
      data: contractors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyContractor(contractorId: string, dto: VerifyContractorDto, adminId: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: { user: true },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    const updatedContractor = await this.prisma.contractor.update({
      where: { id: contractorId },
      data: {
        verificationStatus: dto.status,
        verificationDate: dto.status === VerificationStatus.VERIFIED ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'contractor',
      resourceId: contractorId,
      metadata: {
        action: 'verify_contractor',
        status: dto.status,
        notes: dto.notes,
      },
    });

    return {
      message: 'Contractor verification status updated successfully',
      contractor: updatedContractor,
    };
  }

  async rejectContractor(contractorId: string, adminId: string, reason?: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    await this.prisma.contractor.update({
      where: { id: contractorId },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
        verificationDate: null,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'contractor',
      resourceId: contractorId,
      metadata: {
        action: 'reject_contractor',
        reason,
      },
    });

    return {
      message: 'Contractor verification rejected',
      reason,
    };
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(filters: {
    page: number;
    limit: number;
    userId?: string;
    action?: string;
    resourceType?: string;
  }) {
    const { page, limit, userId, action, resourceType } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              roles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogById(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            roles: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  // ==================== PLATFORM STATISTICS ====================

  async getPlatformStats() {
    const [
      totalUsers,
      totalClients,
      totalContractors,
      totalAdmins,
      verifiedContractors,
      totalOrders,
      activeOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { roles: { has: UserRole.CLIENT }, deletedAt: null },
      }),
      this.prisma.user.count({
        where: { roles: { has: UserRole.CONTRACTOR }, deletedAt: null },
      }),
      this.prisma.user.count({
        where: { roles: { has: UserRole.ADMIN }, deletedAt: null },
      }),
      this.prisma.contractor.count({
        where: { verificationStatus: VerificationStatus.VERIFIED },
      }),
      this.prisma.order.count(),
      this.prisma.order.count({
        where: {
          status: {
            in: ['PUBLISHED', 'IN_PROGRESS'],
          },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        clients: totalClients,
        contractors: totalContractors,
        admins: totalAdmins,
      },
      contractors: {
        total: totalContractors,
        verified: verifiedContractors,
        verificationRate:
          totalContractors > 0
            ? ((verifiedContractors / totalContractors) * 100).toFixed(2)
            : '0.00',
      },
      orders: {
        total: totalOrders,
        active: activeOrders,
      },
    };
  }

  async getUserStats(period: string) {
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to 1 month
    }

    const [newUsers, deletedUsers, activeUsers] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          deletedAt: {
            gte: startDate,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    return {
      period,
      startDate,
      endDate: now,
      newUsers,
      deletedUsers,
      activeUsers,
    };
  }

  // ==================== PORTFOLIO MODERATION ====================

  async getPendingPortfolio(filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    // Note: This assumes PortfolioItem has a 'status' field for moderation
    // If not implemented yet, this will need to be added to the schema
    const [items, total] = await Promise.all([
      this.prisma.portfolioItem.findMany({
        where: {
          // Add status filter when implemented
          // status: 'PENDING',
        },
        skip,
        take: limit,
        include: {
          contractor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.portfolioItem.count({
        where: {
          // status: 'PENDING',
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approvePortfolioItem(itemId: string, adminId: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    // Update status when field is added
    // await this.prisma.portfolioItem.update({
    //   where: { id: itemId },
    //   data: { status: 'APPROVED' },
    // });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'portfolio_item',
      resourceId: itemId,
      metadata: {
        action: 'approve',
      },
    });

    return {
      message: 'Portfolio item approved successfully',
    };
  }

  async rejectPortfolioItem(itemId: string, adminId: string, reason?: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    // Update status when field is added
    // await this.prisma.portfolioItem.update({
    //   where: { id: itemId },
    //   data: { status: 'REJECTED' },
    // });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'portfolio_item',
      resourceId: itemId,
      metadata: {
        action: 'reject',
        reason,
      },
    });

    return {
      message: 'Portfolio item rejected',
      reason,
    };
  }

  // ==================== REVIEW MODERATION ====================

  /**
   * Get pending reviews queue
   */
  async getPendingReviews(filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: ReviewStatus.PENDING,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get flagged reviews
   */
  async getFlaggedReviews(filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { status: ReviewStatus.FLAGGED },
        { status: ReviewStatus.SUSPENDED },
        { reportCount: { gte: 1 } },
      ],
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
              title: true,
            },
          },
          reports: {
            include: {
              reporter: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { reportCount: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Moderate review (approve/reject)
   */
  async moderateReview(
    reviewId: string,
    dto: ModerateReviewDto,
    adminId: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updateData: any = {
      status: dto.status,
      moderatedAt: new Date(),
      moderatedBy: adminId,
      moderationNotes: dto.moderationNotes,
    };

    // If approved, make visible
    if (dto.status === ReviewStatus.APPROVED) {
      updateData.isVisible = true;
    }

    // If rejected, hide
    if (dto.status === ReviewStatus.REJECTED) {
      updateData.isVisible = false;
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If approved, update rating statistics
    if (dto.status === ReviewStatus.APPROVED) {
      this.ratingCalculationService.updateUserRatingStats(review.revieweeId).catch(
        (error) => {
          // Log error but don't fail the request
          console.error(`Failed to update rating stats: ${error.message}`);
        },
      );

      this.ratingCalculationService.updateUserBadges(review.revieweeId).catch(
        (error) => {
          console.error(`Failed to update badges: ${error.message}`);
        },
      );
    }

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REVIEW_UPDATED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
      metadata: {
        status: dto.status,
        moderationNotes: dto.moderationNotes,
      },
    });

    return updatedReview;
  }

  /**
   * Get review reports queue
   */
  async getReviewReports(filters: { page: number; limit: number }) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      status: ReportStatus.PENDING,
    };

    const [reports, total] = await Promise.all([
      this.prisma.reviewReport.findMany({
        where,
        include: {
          review: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                },
              },
              reviewee: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reviewReport.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Resolve review report
   */
  async resolveReviewReport(
    reportId: string,
    adminId: string,
    resolution: string,
    status: ReportStatus,
  ) {
    const report = await this.prisma.reviewReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Review report not found');
    }

    const updatedReport = await this.prisma.reviewReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        resolution,
      },
    });

    // If actioned, update review status
    if (status === ReportStatus.ACTIONED) {
      await this.prisma.review.update({
        where: { id: report.reviewId },
        data: {
          status: ReviewStatus.SUSPENDED,
          isVisible: false,
        },
      });
    }

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REVIEW_REPORTED,
      entity: AuditEntity.REVIEW,
      entityId: report.reviewId,
      metadata: {
        reportId,
        status,
        resolution,
      },
    });

    return updatedReport;
  }

  /**
   * Delete review (admin override, soft delete)
   */
  async deleteReview(reviewId: string, adminId: string, reason?: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Admin can delete any review
    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isVisible: false,
        status: ReviewStatus.REJECTED,
      },
    });

    // Update rating statistics (recalculate)
    this.ratingCalculationService.updateUserRatingStats(review.revieweeId).catch(
      (error) => {
        this.logger.error(`Failed to update rating stats: ${error.message}`);
      },
    );

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REVIEW_DELETED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
      metadata: {
        action: 'admin_delete',
        reason,
      },
    });

    return { message: 'Review deleted successfully' };
  }

  /**
   * Create platform response to review (admin can respond on behalf of platform)
   */
  async createPlatformResponse(
    reviewId: string,
    dto: CreatePlatformResponseDto,
    adminId: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { response: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if response already exists
    if (review.response) {
      throw new BadRequestException('Response already exists');
    }

    // Moderate response content
    const moderationResult = await this.moderationService.moderateReviewContent(dto.content);

    const response = await this.prisma.reviewResponse.create({
      data: {
        reviewId,
        content: dto.content,
        status: moderationResult.isModerated
          ? ReviewStatus.PENDING
          : ReviewStatus.APPROVED,
        moderationFlags: moderationResult.flags,
        // Note: isPlatformResponse field doesn't exist in schema, but we track it in metadata
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REVIEW_RESPONSE_CREATED,
      entity: AuditEntity.REVIEW,
      entityId: reviewId,
      metadata: {
        action: 'admin_platform_response',
        responseId: response.id,
      },
    });

    return response;
  }

  /**
   * Bulk moderate reviews (approve/reject multiple reviews)
   */
  async bulkModerateReviews(dto: BulkModerateReviewsDto, adminId: string) {
    const { reviewIds, status, moderationNotes } = dto;

    if (reviewIds.length === 0) {
      throw new BadRequestException('No review IDs provided');
    }

    if (reviewIds.length > 100) {
      throw new BadRequestException('Cannot moderate more than 100 reviews at once');
    }

    // Get all reviews
    const reviews = await this.prisma.review.findMany({
      where: { id: { in: reviewIds } },
    });

    if (reviews.length !== reviewIds.length) {
      throw new BadRequestException('Some reviews not found');
    }

    // Update all reviews
    const updateData: any = {
      status,
      moderatedAt: new Date(),
      moderatedBy: adminId,
      moderationNotes,
    };

    if (status === ReviewStatus.APPROVED) {
      updateData.isVisible = true;
    }

    if (status === ReviewStatus.REJECTED) {
      updateData.isVisible = false;
    }

    await this.prisma.review.updateMany({
      where: { id: { in: reviewIds } },
      data: updateData,
    });

    // Update rating statistics for all affected users
    const revieweeIds = [...new Set(reviews.map((r) => r.revieweeId))];
    for (const revieweeId of revieweeIds) {
      this.ratingCalculationService.updateUserRatingStats(revieweeId).catch(
        (error) => {
          this.logger.error(`Failed to update rating stats for user ${revieweeId}: ${error.message}`);
        },
      );
    }

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.REVIEW_UPDATED,
      entity: AuditEntity.REVIEW,
      entityId: reviewIds[0], // Use first ID as representative
      metadata: {
        action: 'bulk_moderate',
        reviewIds,
        status,
        moderationNotes,
        count: reviewIds.length,
      },
    });

    return {
      message: `Successfully moderated ${reviewIds.length} reviews`,
      count: reviewIds.length,
      status,
    };
  }

  // ==================== ORDER MANAGEMENT ====================

  /**
   * Get all orders with filtering (admin view with full PII)
   */
  async getAllOrders(filters: AdminOrderQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      categoryId,
      clientId,
      contractorId,
      minBudget,
      maxBudget,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter (can be multiple, comma-separated)
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()) as OrderStatus[];
      where.status = { in: statuses };
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Client filter
    if (clientId) {
      where.clientId = clientId;
    }

    // Contractor filter
    if (contractorId) {
      where.contractorId = contractorId;
    }

    // Budget filter
    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) {
        where.budget.gte = minBudget;
      }
      if (maxBudget !== undefined) {
        where.budget.lte = maxBudget;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          contractor: {
            include: {
              contractor: {
                select: {
                  id: true,
                  userId: true,
                  businessName: true,
                  city: true,
                  province: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              nameFr: true,
            },
          },
          proposals: {
            select: {
              id: true,
              status: true,
              proposedPrice: true,
              createdAt: true,
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order details (admin view with full PII)
   */
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        contractor: {
          include: {
            contractor: {
              select: {
                id: true,
                userId: true,
                businessName: true,
                city: true,
                province: true,
                address: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameFr: true,
            slug: true,
          },
        },
        proposals: {
          include: {
            contractor: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        review: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        dispute: {
          include: {
            initiatedBy: {
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

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Update order status (admin override, bypass FSM for DISPUTED → COMPLETED/CANCELLED)
   */
  async updateOrderStatus(
    orderId: string,
    dto: AdminUpdateOrderStatusDto,
    adminId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Admin override: allow DISPUTED → COMPLETED/CANCELLED
    const isAdminOverride =
      order.status === OrderStatus.DISPUTED &&
      (dto.status === OrderStatus.COMPLETED || dto.status === OrderStatus.CANCELLED);

    // Validate status transition (unless admin override)
    if (!isAdminOverride && !canTransition(order.status, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${dto.status}`,
      );
    }

    // Update status with timestamps
    const updateData: any = {
      status: dto.status,
    };

    if (dto.status === OrderStatus.IN_PROGRESS && !order.startedAt) {
      updateData.startedAt = new Date();
    }

    if (dto.status === OrderStatus.COMPLETED) {
      const completedAt = new Date();
      updateData.completedAt = completedAt;
      updateData.isReviewEligible = true;
      const reviewDeadline = new Date(completedAt);
      reviewDeadline.setDate(reviewDeadline.getDate() + 14);
      updateData.reviewDeadline = reviewDeadline;
    }

    if (dto.status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        contractor: {
          include: {
            contractor: {
              select: {
                id: true,
                userId: true,
                businessName: true,
              },
            },
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'order',
      resourceId: orderId,
      metadata: {
        action: 'admin_status_update',
        previousStatus: order.status,
        newStatus: dto.status,
        reason: dto.reason,
        isAdminOverride,
      },
    });

    return updatedOrder;
  }

  /**
   * Cancel order (admin override, any status)
   */
  async cancelOrder(orderId: string, dto: CancelOrderDto, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Admin can cancel any order regardless of status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        completedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        contractor: {
          include: {
            contractor: {
              select: {
                id: true,
                userId: true,
                businessName: true,
                city: true,
                province: true,
              },
            },
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'order',
      resourceId: orderId,
      metadata: {
        action: 'admin_cancel',
        previousStatus: order.status,
        reason: dto.reason,
      },
    });

    return updatedOrder;
  }

  /**
   * Get order statistics (by status, category, date range)
   */
  async getOrderStats(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }) {
    const { startDate, endDate, categoryId } = filters || {};

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [
      total,
      byStatus,
      byCategory,
      recentOrders,
      averageBudget,
      totalBudget,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['categoryId'],
        where,
        _count: true,
        _avg: {
          budget: true,
        },
      }),
      this.prisma.order.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      this.prisma.order.aggregate({
        where,
        _avg: {
          budget: true,
        },
      }),
      this.prisma.order.aggregate({
        where,
        _sum: {
          budget: true,
        },
      }),
    ]);

    // Get category names for byCategory stats
    const categoryIds = byCategory.map((c) => c.categoryId).filter(Boolean);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: {
        id: true,
        name: true,
        nameEn: true,
        nameFr: true,
      },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      total,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      byCategory: byCategory.map((c) => ({
        categoryId: c.categoryId,
        category: c.categoryId ? categoryMap.get(c.categoryId) : null,
        count: c._count,
        averageBudget: c._avg.budget,
      })),
      recentOrders,
      averageBudget: averageBudget._avg.budget || 0,
      totalBudget: totalBudget._sum.budget || 0,
    };
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Get all subscriptions with filtering (admin view)
   */
  async getAllSubscriptions(filters: AdminSubscriptionQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      tier,
      status,
      contractorId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Tier filter (can be multiple, comma-separated)
    if (tier) {
      const tiers = tier.split(',').map((t) => t.trim()) as SubscriptionTier[];
      where.tier = { in: tiers };
    }

    // Status filter (can be multiple, comma-separated)
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()) as SubscriptionStatus[];
      where.status = { in: statuses };
    }

    // Contractor filter
    if (contractorId) {
      where.contractorId = contractorId;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Search filter (by contractor name or email)
    if (search) {
      where.contractor = {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    // Sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          contractor: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  phone: true,
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get subscription details (admin view)
   */
  async getSubscriptionById(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        contractor: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * Change subscription tier (admin override)
   */
  async changeSubscriptionTier(
    subscriptionId: string,
    dto: ChangeSubscriptionTierDto,
    adminId: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        contractor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Admin can change tier regardless of current tier
    const previousTier = subscription.tier;

    // If changing to FREE, cancel subscription
    if (dto.tier === SubscriptionTier.FREE) {
      // Cancel subscription (if has Stripe subscription)
      if (subscription.stripeSubscriptionId) {
        try {
          // Use SubscriptionsService to cancel (handles Stripe)
          await this.subscriptionsService.cancelSubscription(
            subscription.contractor.userId,
            { immediate: false },
          );
        } catch (error) {
          // If Stripe not configured, just update DB
          this.logger.warn(`Stripe not configured, updating DB only: ${error.message}`);
        }
      }

      // Update to FREE tier
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          tier: SubscriptionTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          cancelAtPeriodEnd: false,
        },
      });

      // Audit log
      await this.auditService.log({
        userId: adminId,
        action: AuditAction.UPDATE,
        resourceType: 'subscription',
        resourceId: subscriptionId,
        metadata: {
          action: 'admin_change_tier',
          previousTier,
          newTier: dto.tier,
          reason: 'Admin override',
        },
      });

      return updatedSubscription;
    }

    // For paid tiers, use SubscriptionsService (handles Stripe)
    try {
      // If subscription doesn't exist in Stripe, create it
      if (!subscription.stripeSubscriptionId) {
        // Create new subscription via SubscriptionsService
        await this.subscriptionsService.createSubscription(
          subscription.contractor.userId,
          { tier: dto.tier },
        );
      } else {
        // Upgrade/downgrade existing subscription
        if (this.isUpgrade(previousTier, dto.tier)) {
          await this.subscriptionsService.upgradeSubscription(
            subscription.contractor.userId,
            { tier: dto.tier },
          );
        } else {
          await this.subscriptionsService.downgradeSubscription(
            subscription.contractor.userId,
            { tier: dto.tier },
          );
        }
      }

      // Get updated subscription
      const updatedSubscription = await this.getSubscriptionById(subscriptionId);

      // Audit log
      await this.auditService.log({
        userId: adminId,
        action: AuditAction.UPDATE,
        resourceType: 'subscription',
        resourceId: subscriptionId,
        metadata: {
          action: 'admin_change_tier',
          previousTier,
          newTier: dto.tier,
          reason: 'Admin override',
        },
      });

      return updatedSubscription;
    } catch (error) {
      // If Stripe not configured, update DB only
      this.logger.warn(`Stripe not configured, updating DB only: ${error.message}`);

      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          tier: dto.tier,
        },
      });

      // Audit log
      await this.auditService.log({
        userId: adminId,
        action: AuditAction.UPDATE,
        resourceType: 'subscription',
        resourceId: subscriptionId,
        metadata: {
          action: 'admin_change_tier',
          previousTier,
          newTier: dto.tier,
          reason: 'Admin override (Stripe not configured)',
        },
      });

      return updatedSubscription;
    }
  }

  /**
   * Extend subscription period (admin override)
   */
  async extendSubscription(
    subscriptionId: string,
    dto: ExtendSubscriptionDto,
    adminId: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        contractor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.currentPeriodEnd) {
      throw new BadRequestException('Subscription has no period end date');
    }

    // Extend period end date
    const newPeriodEnd = new Date(subscription.currentPeriodEnd);
    newPeriodEnd.setDate(newPeriodEnd.getDate() + dto.days);

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodEnd: newPeriodEnd,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'subscription',
      resourceId: subscriptionId,
      metadata: {
        action: 'admin_extend',
        days: dto.days,
        previousPeriodEnd: subscription.currentPeriodEnd,
        newPeriodEnd,
        reason: dto.reason,
      },
    });

    return updatedSubscription;
  }

  /**
   * Cancel subscription (admin override)
   */
  async cancelSubscription(subscriptionId: string, adminId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        contractor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Use SubscriptionsService to cancel (handles Stripe)
    try {
      await this.subscriptionsService.cancelSubscription(
        subscription.contractor.userId,
        { immediate: false },
      );
    } catch (error) {
      // If Stripe not configured, update DB only
      this.logger.warn(`Stripe not configured, updating DB only: ${error.message}`);

      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: true,
        },
      });
    }

    // Get updated subscription
    const updatedSubscription = await this.getSubscriptionById(subscriptionId);

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'subscription',
      resourceId: subscriptionId,
      metadata: {
        action: 'admin_cancel',
        reason,
      },
    });

    return updatedSubscription;
  }

  /**
   * Get subscription statistics (MRR, churn, tier distribution)
   */
  async getSubscriptionStats(filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = filters || {};

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [
      total,
      byTier,
      byStatus,
      activeSubscriptions,
      canceledSubscriptions,
    ] = await Promise.all([
      this.prisma.subscription.count({ where }),
      this.prisma.subscription.groupBy({
        by: ['tier'],
        where,
        _count: true,
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.subscription.count({
        where: {
          ...where,
          status: SubscriptionStatus.ACTIVE,
        },
      }),
      this.prisma.subscription.count({
        where: {
          ...where,
          status: SubscriptionStatus.CANCELED,
        },
      }),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    // Note: This is a simplified calculation. In production, you'd want to use actual Stripe data
    const tierPrices: Record<SubscriptionTier, number> = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.STANDARD]: 29.99, // Example price
      [SubscriptionTier.PROFESSIONAL]: 59.99,
      [SubscriptionTier.ADVANCED]: 99.99,
    };

    const mrr = byTier.reduce((sum, tier) => {
      return sum + (tierPrices[tier.tier] || 0) * tier._count;
    }, 0);

    // Calculate churn rate (canceled / total)
    const churnRate = total > 0 ? (canceledSubscriptions / total) * 100 : 0;

    return {
      total,
      active: activeSubscriptions,
      canceled: canceledSubscriptions,
      byTier: byTier.map((t) => ({
        tier: t.tier,
        count: t._count,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      mrr: Math.round(mrr * 100) / 100,
      churnRate: Math.round(churnRate * 100) / 100,
    };
  }

  /**
   * Helper: Check if tier change is an upgrade
   */
  private isUpgrade(from: SubscriptionTier, to: SubscriptionTier): boolean {
    const tierOrder = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.STANDARD]: 1,
      [SubscriptionTier.PROFESSIONAL]: 2,
      [SubscriptionTier.ADVANCED]: 3,
    };

    return tierOrder[from] < tierOrder[to];
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  /**
   * Send bulk notifications (to multiple users, by role, by criteria)
   */
  async sendBulkNotification(dto: SendBulkNotificationDto, adminId: string) {
    const {
      type,
      title,
      body,
      actionUrl,
      priority = NotificationPriority.MEDIUM,
      metadata,
      userIds,
      role,
      categoryId,
    } = dto;

    // Validate: must provide userIds OR role/categoryId
    if (!userIds && !role && !categoryId) {
      throw new BadRequestException(
        'Must provide userIds, role, or categoryId to send bulk notification',
      );
    }

    // Get target user IDs
    let targetUserIds: string[] = [];

    if (userIds) {
      // Use provided user IDs
      targetUserIds = userIds;
    } else {
      // Build query based on criteria
      const where: any = {
        deletedAt: null,
      };

      if (role) {
        where.roles = {
          has: role,
        };
      }

      if (categoryId) {
        // Get contractors in this category
        const contractors = await this.prisma.contractor.findMany({
          where: {
            categories: {
              some: {
                categoryId,
              },
            },
          },
          select: {
            userId: true,
          },
        });

        const contractorUserIds = contractors.map((c) => c.userId);

        if (role) {
          // Filter by role AND category
          const users = await this.prisma.user.findMany({
            where: {
              ...where,
              id: { in: contractorUserIds },
            },
            select: {
              id: true,
            },
          });

          targetUserIds = users.map((u) => u.id);
        } else {
          // Just category
          targetUserIds = contractorUserIds;
        }
      } else {
        // Just role
        const users = await this.prisma.user.findMany({
          where,
          select: {
            id: true,
          },
        });

        targetUserIds = users.map((u) => u.id);
      }
    }

    // Limit to 1000 users
    if (targetUserIds.length > 1000) {
      throw new BadRequestException(
        `Cannot send to more than 1000 users. Found ${targetUserIds.length} users.`,
      );
    }

    if (targetUserIds.length === 0) {
      throw new BadRequestException('No users found matching criteria');
    }

    // Send notifications to all users
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const userId of targetUserIds) {
      try {
        await this.notificationsService.create(userId, type, {
          title,
          body,
          actionUrl,
          priority,
          metadata,
        });

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push(`User ${userId}: ${error.message}`);
      }
    }

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'notification',
      resourceId: undefined,
      metadata: {
        action: 'bulk_send',
        type,
        title,
        targetCount: targetUserIds.length,
        sent: results.sent,
        failed: results.failed,
        criteria: {
          userIds: userIds?.length || 0,
          role,
          categoryId,
        },
      },
    });

    return {
      message: `Bulk notification sent to ${results.sent} users`,
      total: targetUserIds.length,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 10), // Return first 10 errors
    };
  }

  /**
   * Get notification delivery statistics (by type, channel, date range)
   */
  async getNotificationStats(filters: NotificationStatsQueryDto) {
    const { startDate, endDate, type, channel } = filters;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (type) {
      where.type = type;
    }

    if (channel) {
      where.channels = {
        has: channel,
      };
    }

    const [
      total,
      byType,
      byChannel,
      byPriority,
      readCount,
      unreadCount,
      recentNotifications,
    ] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      this.prisma.notification.groupBy({
        by: ['channels'],
        where,
        _count: true,
      }),
      this.prisma.notification.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      this.prisma.notification.count({
        where: {
          ...where,
          isRead: true,
        },
      }),
      this.prisma.notification.count({
        where: {
          ...where,
          isRead: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Process byChannel (channels is an array, so we need to flatten)
    const channelMap = new Map<NotificationChannel, number>();
    byChannel.forEach((item) => {
      const channels = item.channels as NotificationChannel[];
      channels.forEach((ch) => {
        channelMap.set(ch, (channelMap.get(ch) || 0) + item._count);
      });
    });

    return {
      total,
      read: readCount,
      unread: unreadCount,
      recent: recentNotifications,
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count,
      })),
      byChannel: Array.from(channelMap.entries()).map(([channel, count]) => ({
        channel,
        count,
      })),
      byPriority: byPriority.map((p) => ({
        priority: p.priority,
        count: p._count,
      })),
    };
  }

  /**
   * Get notification details (admin view)
   */
  async getNotificationById(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  /**
   * Get user notification history (admin view)
   */
  async getUserNotifications(userId: string, filters?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * List notification templates (from NOTIFICATION_CONFIG)
   */
  async getNotificationTemplates() {
    // Import NOTIFICATION_CONFIG from notifications module
    const { NOTIFICATION_CONFIG } = await import('../notifications/types/notification-types');

    const templates = Object.entries(NOTIFICATION_CONFIG).map(([type, config]) => ({
      type,
      priority: config.priority,
      channels: config.channels,
      template: config.template,
      title: config.title,
    }));

    return {
      templates,
      count: templates.length,
    };
  }

  // ==================== SYSTEM SETTINGS ====================

  /**
   * Get all system settings
   */
  async getSystemSettings() {
    const settings = await this.prisma.systemSettings.findMany({
      orderBy: { category: 'asc' },
    });

    // Group by category
    const grouped = settings.reduce((acc, setting) => {
      const category = setting.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    }, {} as Record<string, typeof settings>);

    return {
      settings,
      grouped,
      count: settings.length,
    };
  }

  /**
   * Update system settings (create or update)
   */
  async updateSystemSettings(dto: UpdateSettingsDto, adminId: string) {
    const { key, value, type = 'string', category = 'general', description } = dto;

    // Validate value based on type
    if (type === 'boolean' && !['true', 'false'].includes(value.toLowerCase())) {
      throw new BadRequestException('Boolean value must be "true" or "false"');
    }

    if (type === 'number' && isNaN(Number(value))) {
      throw new BadRequestException('Number value must be a valid number');
    }

    if (type === 'json') {
      try {
        JSON.parse(value);
      } catch (error) {
        throw new BadRequestException('JSON value must be valid JSON');
      }
    }

    const setting = await this.prisma.systemSettings.upsert({
      where: { key },
      update: {
        value,
        type,
        category,
        description,
        updatedBy: adminId,
      },
      create: {
        key,
        value,
        type,
        category,
        description,
        updatedBy: adminId,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'system',
      resourceId: key,
      metadata: {
        action: 'update_setting',
        key,
        value,
        type,
        category,
      },
    });

    return setting;
  }

  /**
   * Bulk update system settings
   */
  async bulkUpdateSystemSettings(dto: BulkUpdateSettingsDto, adminId: string) {
    const { settings } = dto;

    if (settings.length === 0) {
      throw new BadRequestException('No settings provided');
    }

    if (settings.length > 50) {
      throw new BadRequestException('Cannot update more than 50 settings at once');
    }

    const results = await Promise.allSettled(
      settings.map((setting) => this.updateSystemSettings(setting, adminId)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      message: `Updated ${successful} settings`,
      total: settings.length,
      successful,
      failed,
    };
  }

  /**
   * Get system setting by key
   */
  async getSystemSetting(key: string) {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return setting;
  }

  /**
   * Delete system setting
   */
  async deleteSystemSetting(key: string, adminId: string) {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    await this.prisma.systemSettings.delete({
      where: { key },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.DELETE,
      resourceType: 'system',
      resourceId: key,
      metadata: {
        action: 'delete_setting',
        key,
      },
    });

    return { message: `Setting "${key}" deleted successfully` };
  }

  // ==================== FEATURE FLAGS ====================

  /**
   * Get all feature flags
   */
  async getFeatureFlags() {
    const flags = await this.prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      flags,
      count: flags.length,
    };
  }

  /**
   * Get feature flag by name
   */
  async getFeatureFlag(name: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag "${name}" not found`);
    }

    return flag;
  }

  /**
   * Create feature flag
   */
  async createFeatureFlag(dto: CreateFeatureFlagDto, adminId: string) {
    const { name, enabled = false, rolloutPercentage = 0, description } = dto;

    // Check if flag already exists
    const existing = await this.prisma.featureFlag.findUnique({
      where: { name },
    });

    if (existing) {
      throw new BadRequestException(`Feature flag "${name}" already exists`);
    }

    const flag = await this.prisma.featureFlag.create({
      data: {
        name,
        enabled,
        rolloutPercentage,
        description,
        updatedBy: adminId,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.CREATE,
      resourceType: 'system',
      resourceId: name,
      metadata: {
        action: 'create_feature_flag',
        name,
        enabled,
        rolloutPercentage,
      },
    });

    return flag;
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(name: string, dto: UpdateFeatureFlagDto, adminId: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag "${name}" not found`);
    }

    const updatedFlag = await this.prisma.featureFlag.update({
      where: { name },
      data: {
        ...dto,
        updatedBy: adminId,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.UPDATE,
      resourceType: 'system',
      resourceId: name,
      metadata: {
        action: 'update_feature_flag',
        name,
        previousEnabled: flag.enabled,
        newEnabled: updatedFlag.enabled,
        previousRollout: flag.rolloutPercentage,
        newRollout: updatedFlag.rolloutPercentage,
      },
    });

    return updatedFlag;
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(name: string, adminId: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name },
    });

    if (!flag) {
      throw new NotFoundException(`Feature flag "${name}" not found`);
    }

    await this.prisma.featureFlag.delete({
      where: { name },
    });

    // Audit log
    await this.auditService.log({
      userId: adminId,
      action: AuditAction.DELETE,
      resourceType: 'system',
      resourceId: name,
      metadata: {
        action: 'delete_feature_flag',
        name,
      },
    });

    return { message: `Feature flag "${name}" deleted successfully` };
  }

  /**
   * Check if maintenance mode is enabled
   */
  async isMaintenanceMode(): Promise<boolean> {
    const setting = await this.prisma.systemSettings.findUnique({
      where: { key: 'maintenance_mode' },
    });

    if (!setting) {
      return false;
    }

    return setting.value.toLowerCase() === 'true';
  }

  // ==================== DISPUTE MANAGEMENT ====================

  /**
   * Get disputes queue (admin view with filtering and pagination)
   */
  async getDisputesQueue(query: DisputeQueryDto) {
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

  /**
   * Get dispute details (admin view with full access)
   */
  async getDisputeById(disputeId: string) {
    return this.disputesService.getDisputeById(disputeId, '', UserRole.ADMIN);
  }

  /**
   * Resolve dispute (admin only)
   */
  async resolveDispute(disputeId: string, dto: ResolveDisputeDto, adminId: string) {
    return this.resolutionService.resolveDispute(disputeId, dto, adminId);
  }

  /**
   * Update dispute status (admin override)
   */
  async updateDisputeStatus(disputeId: string, dto: UpdateDisputeStatusDto, adminId: string) {
    return this.disputesService.updateStatus(disputeId, dto, adminId);
  }

  /**
   * Get dispute statistics
   */
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

  // ==================== CATEGORY MANAGEMENT ====================

  /**
   * Get category analytics (admin only)
   */
  async getCategoryAnalytics() {
    return this.categoriesService.getCategoryAnalytics();
  }

  // ==================== SEO MANAGEMENT ====================

  /**
   * Refresh sitemap cache (admin only)
   */
  async refreshSitemap() {
    await this.sitemapService.invalidateCache();
    return { message: 'Sitemap cache invalidated. Will be regenerated on next request.' };
  }

  /**
   * Revalidate contractor cache (admin only)
   */
  async revalidateContractor(contractorId: string) {
    await this.isrService.revalidateContractor(contractorId);
    return { message: 'Contractor cache revalidated successfully' };
  }

  /**
   * Warm cache for popular profiles (admin only)
   */
  async warmCache() {
    await this.isrService.warmCache(100);
    return { message: 'Cache warmed for top 100 contractors' };
  }
}
