import { IsString, Length, IsOptional, MaxLength, IsArray, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioItemDto {
  @ApiProperty({
    description: 'Portfolio item title',
    example: 'Modern Kitchen Renovation',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Portfolio item description',
    example: 'Complete kitchen renovation including cabinets, countertops, and new appliances',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must be at most 1000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Array of image IDs from Cloudflare Images (max 5)',
    example: ['image-id-1', 'image-id-2', 'image-id-3'],
    type: [String],
    maxItems: 5,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5, { message: 'Maximum 5 images per portfolio item' })
  images: string[];
}

