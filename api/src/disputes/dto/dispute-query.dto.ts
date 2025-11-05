import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus, DisputePriority } from '@prisma/client';

export class DisputeQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: DisputeStatus,
    example: DisputeStatus.OPENED,
  })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: DisputePriority,
    example: DisputePriority.HIGH,
  })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;

  @ApiPropertyOptional({
    description: 'Filter by order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;
}

