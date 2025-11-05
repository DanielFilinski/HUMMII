import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum CategorySortBy {
  NAME = 'name',
  NAME_EN = 'nameEn',
  NAME_FR = 'nameFr',
  CREATED_AT = 'createdAt',
  SORT_ORDER = 'sortOrder',
  LEVEL = 'level',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class CategoryQueryDto {
  @ApiProperty({
    description: 'Parent category ID filter',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Category level filter (0 = root, 1+ = subcategory)',
    example: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  level?: number;

  @ApiProperty({
    description: 'Search term (searches in nameEn and nameFr)',
    example: 'electrical',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Include inactive categories',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeInactive?: boolean;

  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Sort by field',
    example: CategorySortBy.SORT_ORDER,
    enum: CategorySortBy,
    required: false,
    default: CategorySortBy.SORT_ORDER,
  })
  @IsEnum(CategorySortBy)
  @IsOptional()
  sortBy?: CategorySortBy;

  @ApiProperty({
    description: 'Sort order',
    example: SortOrder.ASC,
    enum: SortOrder,
    required: false,
    default: SortOrder.ASC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder;
}

