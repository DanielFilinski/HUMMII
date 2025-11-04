import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContractorRatingsDto {
  @ApiProperty({ description: 'Quality rating (1-5)', example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  quality: number;

  @ApiProperty({ description: 'Professionalism rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism: number;

  @ApiProperty({ description: 'Communication rating (1-5)', example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  communication: number;

  @ApiProperty({ description: 'Value rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;
}

export class ClientRatingsDto {
  @ApiProperty({ description: 'Communication rating (1-5)', example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  communication: number;

  @ApiProperty({ description: 'Professionalism rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism: number;

  @ApiProperty({ description: 'Payment rating (1-5)', example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  payment: number;
}

export class CreateReviewDto {
  @ApiProperty({ description: 'Order ID to review', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Criteria ratings (contractor: quality, professionalism, communication, value; client: communication, professionalism, payment)',
    example: { quality: 5, professionalism: 4, communication: 5, value: 4 },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Object) // Will be validated based on user type
  criteriaRatings: ContractorRatingsDto | ClientRatingsDto;

  @ApiPropertyOptional({
    description: 'Review comment (max 1000 characters)',
    example: 'Great work! Very professional and on time.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Review comment cannot exceed 1000 characters' })
  comment?: string;
}

