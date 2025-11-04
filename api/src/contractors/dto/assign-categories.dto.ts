import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCategoriesDto {
  @ApiProperty({
    description: 'Array of category IDs to assign (max 5)',
    example: ['category-id-1', 'category-id-2', 'category-id-3'],
    type: [String],
    minItems: 1,
    maxItems: 5,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one category ID required' })
  @ArrayMaxSize(5, { message: 'Maximum 5 categories allowed' })
  categoryIds: string[];
}

