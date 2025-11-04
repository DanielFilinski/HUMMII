import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export class SubscriptionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contractorId: string;

  @ApiProperty()
  stripeCustomerId: string;

  @ApiPropertyOptional()
  stripeSubscriptionId?: string;

  @ApiProperty()
  stripePriceId: string;

  @ApiProperty({ enum: SubscriptionTier })
  tier: SubscriptionTier;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiPropertyOptional()
  currentPeriodStart?: Date;

  @ApiPropertyOptional()
  currentPeriodEnd?: Date;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional()
  canceledAt?: Date;

  @ApiPropertyOptional()
  trialStart?: Date;

  @ApiPropertyOptional()
  trialEnd?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
