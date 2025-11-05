import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationPriority, NotificationChannel } from '@prisma/client';

export class NotificationEntity {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ description: 'Notification priority', enum: NotificationPriority })
  priority: NotificationPriority;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification body' })
  body: string;

  @ApiPropertyOptional({ description: 'Action URL' })
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Is notification read' })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Read timestamp' })
  readAt?: Date;

  @ApiProperty({ description: 'Channels through which notification was sent', enum: NotificationChannel, isArray: true })
  channels: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Sent timestamp' })
  sentAt?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Expiration timestamp' })
  expiresAt?: Date;
}

