import { IsString, IsOptional, MaxLength, IsInt, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractorProfileDto {
  @ApiProperty({
    description: 'Contractor bio/description',
    example: 'Experienced electrician with 10+ years in residential and commercial projects',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Bio must be at most 500 characters' })
  bio?: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 10,
    required: false,
    minimum: 0,
    maximum: 50,
  })
  @IsInt()
  @Min(0, { message: 'Experience must be at least 0 years' })
  @Max(50, { message: 'Experience must be at most 50 years' })
  @IsOptional()
  experience?: number;

  @ApiProperty({
    description: 'Hourly rate in CAD',
    example: 75.50,
    required: false,
    minimum: 10,
    maximum: 500,
  })
  @IsNumber()
  @Min(10, { message: 'Hourly rate must be at least $10 CAD' })
  @Max(500, { message: 'Hourly rate must be at most $500 CAD' })
  @IsOptional()
  hourlyRate?: number;

  @ApiProperty({
    description: 'Business name (optional)',
    example: 'ABC Electrical Services Ltd.',
    required: false,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Business name must be at most 200 characters' })
  businessName?: string;
}

