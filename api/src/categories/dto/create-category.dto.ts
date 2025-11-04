import { IsString, Length, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electrical',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @ApiProperty({
    description: 'Category slug (URL-friendly)',
    example: 'electrical',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50, { message: 'Slug must be between 2 and 50 characters' })
  slug: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Electrical services including wiring, panel upgrades, and installations',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be at most 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Category icon (name or URL)',
    example: 'lightning-bolt',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Icon must be at most 200 characters' })
  icon?: string;

  @ApiProperty({
    description: 'Is category active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

