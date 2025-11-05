import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DisputeReason,
  DisputeStatus,
  DisputeResolution,
  DisputePriority,
} from '@prisma/client';

export class DisputeEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  initiatedById: string;

  @ApiProperty()
  respondentId: string;

  @ApiProperty({ enum: DisputeReason })
  reason: DisputeReason;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: DisputePriority, default: DisputePriority.MEDIUM })
  priority: DisputePriority;

  @ApiProperty({ enum: DisputeStatus, default: DisputeStatus.OPENED })
  status: DisputeStatus;

  @ApiPropertyOptional({ enum: DisputeResolution })
  resolutionType?: DisputeResolution;

  @ApiPropertyOptional()
  resolutionReason?: string;

  @ApiPropertyOptional()
  resolvedById?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiPropertyOptional()
  adminNotes?: string;

  @ApiPropertyOptional()
  amountInDispute?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

