import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier } from '@prisma/client';

export class SubscriptionHistoryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contractorId: string;

  @ApiPropertyOptional()
  subscriptionId?: string;

  @ApiProperty()
  action: string;

  @ApiPropertyOptional({ enum: SubscriptionTier })
  fromTier?: SubscriptionTier;

  @ApiPropertyOptional({ enum: SubscriptionTier })
  toTier?: SubscriptionTier;

  @ApiPropertyOptional()
  stripeEventId?: string;

  @ApiPropertyOptional()
  reason?: string;

  @ApiProperty()
  createdAt: Date;
}
