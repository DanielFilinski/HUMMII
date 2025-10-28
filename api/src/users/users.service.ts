import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find user by ID (excluding password)
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

    return user;
  }

  /**
   * Update user profile
   */
  async update(userId: string, updateDto: UpdateUserDto) {
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

    return {
      exportDate: new Date().toISOString(),
      userData: userWithoutPassword,
      notice:
        'This export contains all your personal data stored in our system as per PIPEDA requirements.',
    };
  }
}
