import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { UpdateUserDto } from './dto/update-user.dto';

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
        role: true,
        isVerified: true,
        lastLoginAt: true,
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
        role: true,
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
        givenReviews: {
          select: {
            id: true,
            overallRating: true,
            comment: true,
            createdAt: true,
          },
        },
        receivedReviews: {
          select: {
            id: true,
            overallRating: true,
            comment: true,
            createdAt: true,
          },
        },
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
}
