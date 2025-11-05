import {
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeResolution } from '@prisma/client';

class ActionDetailsDto {
  @ApiPropertyOptional({
    description: 'User ID for block_user or suspend_account actions',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Order ID for close_order action',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Warning message for warn_user action',
    example: 'Please ensure quality standards are met in future orders.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  warningMessage?: string;
}

export class ResolveDisputeDto {
  @ApiProperty({
    description: 'Type of resolution action',
    enum: DisputeResolution,
    example: DisputeResolution.BLOCK_USER,
  })
  @IsEnum(DisputeResolution)
  resolutionType: DisputeResolution;

  @ApiProperty({
    description: 'Reason for resolution',
    example: 'User violated terms of service by providing substandard work.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10, { message: 'Resolution reason must be at least 10 characters' })
  @MaxLength(1000, { message: 'Resolution reason must not exceed 1000 characters' })
  resolutionReason: string;

  @ApiPropertyOptional({
    description: 'Internal admin notes (not visible to users)',
    example: 'Reviewed evidence and found multiple violations. User has been warned previously.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Admin notes must not exceed 2000 characters' })
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Action details for specific resolution types',
    type: ActionDetailsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ActionDetailsDto)
  actionDetails?: ActionDetailsDto;
}

