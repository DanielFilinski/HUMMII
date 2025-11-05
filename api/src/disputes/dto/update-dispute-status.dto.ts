import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus, DisputePriority } from '@prisma/client';

export class UpdateDisputeStatusDto {
  @ApiProperty({
    description: 'New dispute status',
    enum: DisputeStatus,
    example: DisputeStatus.UNDER_REVIEW,
  })
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Priority level',
    enum: DisputePriority,
    example: DisputePriority.HIGH,
  })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;
}

