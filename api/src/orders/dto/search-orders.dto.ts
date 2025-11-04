import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class SearchOrdersDto {
  @ApiPropertyOptional({
    description: 'Search text in title and description',
    example: 'plumber',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Category UUID filter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Minimum budget in CAD',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBudget?: number;

  @ApiPropertyOptional({
    description: 'Maximum budget in CAD',
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBudget?: number;

  @ApiPropertyOptional({
    description: 'Latitude for radius search',
    example: 43.6532,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for radius search',
    example: -79.3832,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Radius in kilometers',
    example: 50,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  radius?: number;

  @ApiPropertyOptional({
    description: 'Order status filter',
    enum: OrderStatus,
    example: OrderStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['date', 'budget', 'distance'],
    example: 'date',
  })
  @IsOptional()
  @IsEnum(['date', 'budget', 'distance'])
  sortBy?: 'date' | 'budget' | 'distance';

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

