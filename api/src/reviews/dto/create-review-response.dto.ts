import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewResponseDto {
  @ApiProperty({
    description: 'Response content (max 500 characters)',
    example: 'Thank you for your feedback! We appreciate your review.',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: 'Response cannot exceed 500 characters' })
  content: string;
}

