import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { CookiePreferencesDto } from './dto/cookie-preferences.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Find user by ID (excluding password)
   * PIPEDA: Right to Access
   */
  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        avatarId: true,
        avatarUrl: true,
        roles: true,
        isVerified: true,
        lastLoginAt: true,
        cookiePreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Audit log: Profile viewed (PIPEDA compliance)
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_VIEWED,
      entity: AuditEntity.USER,
      entityId: userId,
    });

    return user;
  }

  /**
   * Update user profile
   * PIPEDA: Right to Rectification
   */
  async update(userId: string, updateDto: UpdateUserDto) {
    // Get current user data for audit log
    const beforeUpdate = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        phone: true,
        avatar: true,
      },
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateDto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        roles: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Audit log: Profile updated (PIPEDA compliance)
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      entity: AuditEntity.USER,
      entityId: userId,
      changes: {
        before: beforeUpdate,
        after: {
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
      metadata: {
        fieldsUpdated: Object.keys(updateDto),
      },
    });

    return user;
  }

  /**
   * Delete user account (PIPEDA: Right to Erasure)
   * Soft delete to maintain financial records compliance
   */
  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete: anonymize personal data but keep record for compliance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.local`,
        name: 'Deleted User',
        phone: null,
        avatar: null,
        password: '',
        isVerified: false,
        verificationToken: null,
        verificationTokenExpiry: null,
        resetToken: null,
        resetTokenExpiry: null,
        deletedAt: new Date(),
      },
    });

    // Delete sessions
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    // Anonymize reviews (soft delete - keep for statistics)
    await this.prisma.review.updateMany({
      where: {
        OR: [
          { reviewerId: userId },
          { revieweeId: userId },
        ],
      },
      data: {
        isVisible: false,
        comment: null, // Remove PII from comments
      },
    });

    // Anonymize review responses (find reviews first, then update responses)
    const userReviews = await this.prisma.review.findMany({
      where: {
        OR: [
          { reviewerId: userId },
          { revieweeId: userId },
        ],
      },
      select: { id: true },
    });

    if (userReviews.length > 0) {
      const reviewIds = userReviews.map((r) => r.id);
      await this.prisma.reviewResponse.updateMany({
        where: {
          reviewId: {
            in: reviewIds,
          },
        },
        data: {
          content: '[Content removed - account deleted]',
        },
      });
    }

    // Audit log: Account deleted (PIPEDA compliance)
    await this.auditService.log({
      userId,
      action: AuditAction.ACCOUNT_DELETED,
      entity: AuditEntity.USER,
      entityId: userId,
      metadata: {
        softDelete: true,
        anonymized: true,
        originalEmail: user.email, // Store for audit trail
        deletionDate: new Date(),
      },
    });

    // Note: Orders and reviews are kept for financial/legal compliance
    // but are anonymized through the soft delete
  }

  /**
   * Export all user data (PIPEDA: Right to Data Portability)
   */
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientOrders: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        contractorOrders: {
          select: {
            id: true,
            title: true,
            status: true,
            agreedPrice: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sentMessages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
        reviewsGiven: {
          select: {
            id: true,
            orderId: true,
            revieweeId: true,
            rating: true,
            comment: true,
            criteriaRatings: true,
            status: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reviewsReceived: {
          select: {
            id: true,
            orderId: true,
            reviewerId: true,
            rating: true,
            comment: true,
            criteriaRatings: true,
            status: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ratingStats: true,
        contractor: {
          select: {
            bio: true,
            hourlyRate: true,
            city: true,
            province: true,
            rating: true,
            totalOrders: true,
            completedOrders: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from export
    const { password, ...userWithoutPassword } = user;

    // Audit log: Data exported (PIPEDA compliance)
    await this.auditService.log({
      userId,
      action: AuditAction.DATA_EXPORTED,
      entity: AuditEntity.USER,
      entityId: userId,
      metadata: {
        exportDate: new Date(),
        dataIncluded: {
          profile: true,
          orders: true,
          messages: true,
          reviews: true,
          contractor: !!user.contractor,
        },
      },
    });

    return {
      exportDate: new Date().toISOString(),
      userData: userWithoutPassword,
      notice:
        'This export contains all your personal data stored in our system as per PIPEDA requirements.',
    };
  }

  /**
   * Update cookie preferences (PIPEDA: Right to Withdraw Consent)
   */
  async updateCookiePreferences(userId: string, preferences: CookiePreferencesDto) {
    // Ensure essential cookies are always enabled (cannot be disabled)
    const cookiePreferences = {
      essential: true, // Always required
      functional: preferences.functional ?? true,
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
    };

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        cookiePreferences: cookiePreferences as any,
      },
      select: {
        id: true,
        email: true,
        cookiePreferences: true,
        updatedAt: true,
      },
    });

    // Audit log: Cookie preferences updated (PIPEDA compliance)
    await this.auditService.log({
      userId,
      action: AuditAction.COOKIE_PREFERENCES_UPDATED,
      entity: AuditEntity.USER,
      entityId: userId,
      metadata: {
        preferences: cookiePreferences,
      },
    });

    return {
      message: 'Cookie preferences updated successfully',
      preferences: user.cookiePreferences,
    };
  }

  /**
   * Update user avatar
   * Sets Cloudflare Images ID and URL
   * 
   * @param userId - User ID
   * @param avatarId - Cloudflare Images ID
   * @param avatarUrl - Full avatar URL with variant
   */
  async updateAvatar(userId: string, avatarId: string, avatarUrl: string) {
    // Get current avatar for audit log
    const beforeUpdate = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        avatarId: true,
        avatarUrl: true,
        avatar: true, // Legacy field
      },
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarId,
        avatarUrl,
        avatar: avatarUrl, // Update legacy field for backward compatibility
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarId: true,
        avatarUrl: true,
        avatar: true,
        updatedAt: true,
      },
    });

    // Audit log: Avatar updated
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      entity: AuditEntity.USER,
      entityId: userId,
      changes: {
        before: {
          avatarId: beforeUpdate?.avatarId || null,
          avatarUrl: beforeUpdate?.avatarUrl || null,
        },
        after: {
          avatarId,
          avatarUrl,
        },
      },
      metadata: {
        action: 'avatar_upload',
        cloudflareImageId: avatarId,
      },
    });

    return user;
  }

  /**
   * Switch user to CONTRACTOR role
   * Creates contractor profile if not exists
   */
  async switchToContractor(userId: string) {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { contractor: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already has CONTRACTOR role
    if (user.roles.includes(UserRole.CONTRACTOR)) {
      throw new BadRequestException('User already has CONTRACTOR role');
    }

    // Add CONTRACTOR role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          push: UserRole.CONTRACTOR,
        },
      },
    });

    // Create contractor profile if not exists
    if (!user.contractor) {
      await this.prisma.contractor.create({
        data: {
          userId,
        },
      });
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.ROLE_SWITCHED,
      entity: AuditEntity.USER,
      entityId: userId,
      metadata: {
        from: user.roles,
        to: updatedUser.roles,
        action: 'add_contractor_role',
      },
    });

    return {
      message: 'Successfully switched to CONTRACTOR role',
      roles: updatedUser.roles,
    };
  }

  /**
   * Switch user to CLIENT role
   * Keeps contractor profile if exists
   */
  async switchToClient(userId: string) {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already has CLIENT role
    if (user.roles.includes(UserRole.CLIENT)) {
      throw new BadRequestException('User already has CLIENT role');
    }

    // Add CLIENT role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          push: UserRole.CLIENT,
        },
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.ROLE_SWITCHED,
      entity: AuditEntity.USER,
      entityId: userId,
      metadata: {
        from: user.roles,
        to: updatedUser.roles,
        action: 'add_client_role',
      },
    });

    return {
      message: 'Successfully switched to CLIENT role',
      roles: updatedUser.roles,
    };
  }
}
