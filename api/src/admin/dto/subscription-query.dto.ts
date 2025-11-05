import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export class AdminSubscriptionQueryDto {
  @ApiPropertyOptional({
    description: 'Search text in contractor name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Subscription tier filter (can be multiple, comma-separated)',
    example: 'STANDARD,PROFESSIONAL',
  })
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional({
    description: 'Subscription status filter (can be multiple, comma-separated)',
    example: 'ACTIVE,CANCELED',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Contractor UUID filter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @ApiPropertyOptional({
    description: 'Start date for date range filter (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for date range filter (ISO 8601)',
    example: '2025-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt', 'tier', 'status', 'currentPeriodEnd'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'tier', 'status', 'currentPeriodEnd'])
  sortBy?: 'createdAt' | 'updatedAt' | 'tier' | 'status' | 'currentPeriodEnd';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}


