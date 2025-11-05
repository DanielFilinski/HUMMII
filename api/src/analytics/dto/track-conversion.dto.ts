import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConversionType {
  ORDER_CREATED = 'order_created',
  PROPOSAL_SUBMITTED = 'proposal_submitted',
  PROFILE_VIEWED = 'profile_viewed',
}

export class TrackConversionDto {
  @ApiProperty({ description: 'Anonymous session ID', example: 'session_abc123' })
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: ConversionType, description: 'Type of conversion' })
  @IsEnum(ConversionType)
  conversionType: ConversionType;

  @ApiPropertyOptional({ description: 'Entity ID (order ID, contractor ID, etc.)', example: 'order_123' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'IP address (will be hashed)', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent', example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

