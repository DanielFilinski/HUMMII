import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({
    description: 'Proposed price in CAD',
    example: 300.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  proposedPrice: number;

  @ApiProperty({
    description: 'Proposal message explaining your approach and qualifications',
    example: 'I have 10 years of plumbing experience and can fix this issue within 2 hours.',
    minLength: 20,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in days',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDays?: number;
}

