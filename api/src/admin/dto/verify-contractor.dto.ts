import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VerificationStatus } from '@prisma/client';

export class VerifyContractorDto {
  @ApiProperty({
    description: 'Verification status',
    enum: VerificationStatus,
    example: VerificationStatus.VERIFIED,
  })
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @ApiProperty({
    description: 'Optional notes for verification',
    required: false,
    example: 'Documents verified successfully',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
