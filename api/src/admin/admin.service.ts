import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { UserRole, VerificationStatus, ReviewStatus, ReportStatus } from '@prisma/client';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { VerifyContractorDto } from './dto/verify-contractor.dto';
import { ModerateReviewDto } from '../reviews/dto/moderate-review.dto';
import { RatingCalculationService } from '../reviews/services/rating-calculation.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly ratingCalculationService: RatingCalculationService,
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
}
