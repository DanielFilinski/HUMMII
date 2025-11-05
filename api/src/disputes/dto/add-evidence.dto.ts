import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvidenceType } from '@prisma/client';

export class AddEvidenceDto {
  @ApiProperty({
    description: 'Type of evidence being uploaded',
    enum: EvidenceType,
    example: EvidenceType.PHOTO,
  })
  @IsEnum(EvidenceType)
  evidenceType: EvidenceType;

  @ApiPropertyOptional({
    description: 'Optional description of the evidence',
    example: 'Photo showing incomplete work',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}

