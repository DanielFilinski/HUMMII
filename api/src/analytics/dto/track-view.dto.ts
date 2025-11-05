import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ViewType {
  PROFILE = 'profile',
  ORDER = 'order',
}

export class TrackViewDto {
  @ApiProperty({ description: 'Anonymous session ID', example: 'session_abc123' })
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: ViewType, description: 'Type of view' })
  @IsEnum(ViewType)
  viewType: ViewType;

  @ApiProperty({ description: 'Entity ID (contractor ID or order ID)', example: 'contractor_123' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'IP address (will be hashed)', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent', example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}


