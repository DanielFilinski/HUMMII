import { IsString, IsOptional, IsEnum, IsUrl, Matches, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Order status updated',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Notification body',
    example: 'Your order #12345 status has been updated to COMPLETED',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    description: 'Action URL (deep link)',
    example: '/orders/12345',
  })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @Matches(/^https?:\/\/(www\.)?hummii\.ca\/.*$/, {
    message: 'Only internal links allowed',
  })
  @MaxLength(500)
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Notification priority',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Additional metadata (max 5KB)',
    example: { orderId: '12345', status: 'COMPLETED' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

