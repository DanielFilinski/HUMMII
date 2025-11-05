import {
  IsArray,
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
  MaxLength,
  MinLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationPriority, UserRole } from '@prisma/client';

export class SendBulkNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.SYSTEM_ANNOUNCEMENT,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Platform Maintenance',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'The platform will be under maintenance on January 15, 2025 from 2:00 AM to 4:00 AM EST.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  body: string;

  @ApiPropertyOptional({
    description: 'Action URL (optional)',
    example: '/maintenance',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Notification priority',
    enum: NotificationPriority,
    example: NotificationPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Metadata (optional)',
    example: { maintenanceDate: '2025-01-15', duration: '2 hours' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Array of user IDs to send to (max 1000). If not provided, uses criteria.',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    maxItems: 1000,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(1000)
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'User role filter (send to all users with this role)',
    enum: UserRole,
    example: UserRole.CONTRACTOR,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Category ID filter (send to all contractors in this category)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

