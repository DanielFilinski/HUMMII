import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeReason } from '@prisma/client';

export class CreateDisputeDto {
  @ApiProperty({
    description: 'Order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Reason for dispute',
    enum: DisputeReason,
    example: DisputeReason.WORK_QUALITY_ISSUES,
  })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @ApiProperty({
    description: 'Detailed description of the dispute',
    example: 'The work completed does not meet the agreed quality standards. Multiple issues were found...',
    minLength: 50,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(50, { message: 'Description must be at least 50 characters' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description: string;

  @ApiPropertyOptional({
    description: 'Amount in dispute (for reference only, not used for payments in MVP)',
    example: 500.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountInDispute?: number;
}

