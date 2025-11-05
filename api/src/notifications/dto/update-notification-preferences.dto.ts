import { IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  // Email settings
  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for order updates' })
  @IsOptional()
  @IsBoolean()
  emailOrderUpdates?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for new proposals' })
  @IsOptional()
  @IsBoolean()
  emailNewProposals?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for messages' })
  @IsOptional()
  @IsBoolean()
  emailMessages?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for payments' })
  @IsOptional()
  @IsBoolean()
  emailPayments?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for reviews' })
  @IsOptional()
  @IsBoolean()
  emailReviews?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for disputes' })
  @IsOptional()
  @IsBoolean()
  emailDisputes?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for security alerts (always enabled)' })
  @IsOptional()
  @IsBoolean()
  emailSecurity?: boolean;

  @ApiPropertyOptional({ description: 'Email notifications for marketing' })
  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;

  @ApiPropertyOptional({ description: 'Enable daily email digest' })
  @IsOptional()
  @IsBoolean()
  emailDigest?: boolean;

  @ApiPropertyOptional({
    description: 'Daily digest time (HH:mm format)',
    example: '09:00',
  })
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format',
  })
  emailDigestTime?: string;

  // Push settings
  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for order updates' })
  @IsOptional()
  @IsBoolean()
  pushOrderUpdates?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for new proposals' })
  @IsOptional()
  @IsBoolean()
  pushNewProposals?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for messages' })
  @IsOptional()
  @IsBoolean()
  pushMessages?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for payments' })
  @IsOptional()
  @IsBoolean()
  pushPayments?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for reviews' })
  @IsOptional()
  @IsBoolean()
  pushReviews?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for disputes' })
  @IsOptional()
  @IsBoolean()
  pushDisputes?: boolean;

  @ApiPropertyOptional({ description: 'Push notifications for security alerts (always enabled)' })
  @IsOptional()
  @IsBoolean()
  pushSecurity?: boolean;

  // In-app settings
  @ApiPropertyOptional({ description: 'Enable in-app notifications' })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable in-app notification sound' })
  @IsOptional()
  @IsBoolean()
  inAppSound?: boolean;

  @ApiPropertyOptional({ description: 'Enable in-app notification vibration' })
  @IsOptional()
  @IsBoolean()
  inAppVibration?: boolean;
}

