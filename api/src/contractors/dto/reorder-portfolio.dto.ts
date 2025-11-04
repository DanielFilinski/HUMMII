import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPortfolioDto {
  @ApiProperty({
    description: 'Array of portfolio item IDs in desired order',
    example: ['item-id-1', 'item-id-2', 'item-id-3'],
    type: [String],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one portfolio item ID required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 portfolio items' })
  itemIds: string[];
}

