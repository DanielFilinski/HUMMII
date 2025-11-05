import { IsArray, IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class BulkModerateReviewsDto {
  @ApiProperty({
    description: 'Array of review IDs to moderate',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsArray()
  reviewIds: string[];

  @ApiProperty({
    description: 'New status for all reviews',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Moderation notes (applied to all reviews)',
    example: 'Bulk approved after manual review',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderationNotes?: string;
}


