import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update review DTO (same as create, but all fields optional)
 */
export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

