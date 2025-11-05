import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity';

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find or create user preferences
   * Creates default preferences if they don't exist
   */
  async findOrCreate(userId: string): Promise<NotificationPreferencesEntity> {
    let preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.createDefault(userId);
    }

    return preferences as NotificationPreferencesEntity;
  }

  /**
   * Create default preferences for user
   */
  async createDefault(userId: string) {
    return this.prisma.notificationPreferences.create({
      data: {
        userId,
        // All defaults are set in schema
      },
    });
  }

  /**
   * Update user preferences
   * Security alerts cannot be disabled
   */
  async update(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesEntity> {
    // Validate: security alerts cannot be disabled
    if (dto.emailSecurity === false || dto.pushSecurity === false) {
      throw new BadRequestException('Security alerts cannot be disabled');
    }

    // Ensure preferences exist
    await this.findOrCreate(userId);

    // Update preferences
    const preferences = await this.prisma.notificationPreferences.update({
      where: { userId },
      data: {
        // Email settings
        emailEnabled: dto.emailEnabled,
        emailOrderUpdates: dto.emailOrderUpdates,
        emailNewProposals: dto.emailNewProposals,
        emailMessages: dto.emailMessages,
        emailPayments: dto.emailPayments,
        emailReviews: dto.emailReviews,
        emailDisputes: dto.emailDisputes,
        emailSecurity: true, // Always true - cannot be disabled
        emailMarketing: dto.emailMarketing,
        emailDigest: dto.emailDigest,
        emailDigestTime: dto.emailDigestTime,

        // Push settings
        pushEnabled: dto.pushEnabled,
        pushOrderUpdates: dto.pushOrderUpdates,
        pushNewProposals: dto.pushNewProposals,
        pushMessages: dto.pushMessages,
        pushPayments: dto.pushPayments,
        pushReviews: dto.pushReviews,
        pushDisputes: dto.pushDisputes,
        pushSecurity: true, // Always true - cannot be disabled

        // In-app settings
        inAppEnabled: dto.inAppEnabled,
        inAppSound: dto.inAppSound,
        inAppVibration: dto.inAppVibration,
      },
    });

    return preferences as NotificationPreferencesEntity;
  }

  /**
   * Reset preferences to defaults
   */
  async reset(userId: string): Promise<NotificationPreferencesEntity> {
    const preferences = await this.prisma.notificationPreferences.update({
      where: { userId },
      data: {
        // Email settings - all defaults
        emailEnabled: true,
        emailOrderUpdates: true,
        emailNewProposals: true,
        emailMessages: true,
        emailPayments: true,
        emailReviews: true,
        emailDisputes: true,
        emailSecurity: true, // Always true
        emailMarketing: false,
        emailDigest: true,
        emailDigestTime: '09:00',

        // Push settings - all defaults
        pushEnabled: true,
        pushOrderUpdates: true,
        pushNewProposals: true,
        pushMessages: true,
        pushPayments: true,
        pushReviews: true,
        pushDisputes: true,
        pushSecurity: true, // Always true

        // In-app settings - all defaults
        inAppEnabled: true,
        inAppSound: true,
        inAppVibration: true,
      },
    });

    return preferences as NotificationPreferencesEntity;
  }
}

