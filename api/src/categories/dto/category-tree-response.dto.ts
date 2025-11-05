import { ApiProperty } from '@nestjs/swagger';

export class CategoryTreeResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name (legacy)',
    example: 'Electrical',
  })
  name: string;

  @ApiProperty({
    description: 'Category name in English',
    example: 'Electrical',
  })
  nameEn: string;

  @ApiProperty({
    description: 'Category name in French',
    example: 'Électrique',
  })
  nameFr: string;

  @ApiProperty({
    description: 'Category slug',
    example: 'electrical',
  })
  slug: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electrical services',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Category icon',
    example: 'lightning-bolt',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: 'Parent category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    description: 'Category level (0 = root, 1+ = subcategory)',
    example: 0,
  })
  level: number;

  @ApiProperty({
    description: 'Sort order',
    example: 0,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Is category active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Number of contractors using this category',
    example: 15,
  })
  contractorCount: number;

  @ApiProperty({
    description: 'Number of orders in this category',
    example: 42,
  })
  orderCount: number;

  @ApiProperty({
    description: 'Child categories',
    type: [CategoryTreeResponseDto],
    required: false,
  })
  children?: CategoryTreeResponseDto[];

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

