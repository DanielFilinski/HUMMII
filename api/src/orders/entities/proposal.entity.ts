import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalStatus } from '@prisma/client';

export class ProposalEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  contractorId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  proposedPrice: number;

  @ApiPropertyOptional()
  estimatedDays?: number;

  @ApiProperty({ enum: ProposalStatus })
  status: ProposalStatus;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

