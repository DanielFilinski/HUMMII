import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ModerateReviewDto {
  @ApiProperty({
    description: 'Review status after moderation',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED,
  })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Moderation notes (admin only)',
    example: 'Approved after manual review',
  })
  @IsOptional()
  @IsString()
  moderationNotes?: string;
}

