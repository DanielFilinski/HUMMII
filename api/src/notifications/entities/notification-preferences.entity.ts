import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesEntity {
  @ApiProperty({ description: 'Preferences ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  // Email settings
  @ApiProperty({ description: 'Enable email notifications' })
  emailEnabled: boolean;

  @ApiProperty({ description: 'Email notifications for order updates' })
  emailOrderUpdates: boolean;

  @ApiProperty({ description: 'Email notifications for new proposals' })
  emailNewProposals: boolean;

  @ApiProperty({ description: 'Email notifications for messages' })
  emailMessages: boolean;

  @ApiProperty({ description: 'Email notifications for payments' })
  emailPayments: boolean;

  @ApiProperty({ description: 'Email notifications for reviews' })
  emailReviews: boolean;

  @ApiProperty({ description: 'Email notifications for disputes' })
  emailDisputes: boolean;

  @ApiProperty({ description: 'Email notifications for security alerts (always enabled)' })
  emailSecurity: boolean;

  @ApiProperty({ description: 'Email notifications for marketing' })
  emailMarketing: boolean;

  @ApiProperty({ description: 'Enable daily email digest' })
  emailDigest: boolean;

  @ApiProperty({ description: 'Daily digest time (HH:mm format)' })
  emailDigestTime: string;

  // Push settings
  @ApiProperty({ description: 'Enable push notifications' })
  pushEnabled: boolean;

  @ApiProperty({ description: 'Push notifications for order updates' })
  pushOrderUpdates: boolean;

  @ApiProperty({ description: 'Push notifications for new proposals' })
  pushNewProposals: boolean;

  @ApiProperty({ description: 'Push notifications for messages' })
  pushMessages: boolean;

  @ApiProperty({ description: 'Push notifications for payments' })
  pushPayments: boolean;

  @ApiProperty({ description: 'Push notifications for reviews' })
  pushReviews: boolean;

  @ApiProperty({ description: 'Push notifications for disputes' })
  pushDisputes: boolean;

  @ApiProperty({ description: 'Push notifications for security alerts (always enabled)' })
  pushSecurity: boolean;

  // In-app settings
  @ApiProperty({ description: 'Enable in-app notifications' })
  inAppEnabled: boolean;

  @ApiProperty({ description: 'Enable in-app notification sound' })
  inAppSound: boolean;

  @ApiProperty({ description: 'Enable in-app notification vibration' })
  inAppVibration: boolean;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}

