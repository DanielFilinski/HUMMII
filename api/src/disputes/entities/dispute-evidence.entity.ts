import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvidenceType } from '@prisma/client';

export class DisputeEvidenceEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  disputeId: string;

  @ApiProperty()
  uploadedById: string;

  @ApiProperty()
  fileKey: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  fileHash: string;

  @ApiProperty({ enum: EvidenceType })
  evidenceType: EvidenceType;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  virusScanStatus?: string;

  @ApiPropertyOptional()
  virusScanResult?: string;

  @ApiProperty()
  uploadedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

