import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionTier } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription tier to create',
    enum: SubscriptionTier,
    example: 'STANDARD',
  })
  @IsEnum(SubscriptionTier, {
    message: 'Tier must be one of: STANDARD, PROFESSIONAL, ADVANCED',
  })
  tier: SubscriptionTier;

  @ApiProperty({
    description: 'Payment method ID from Stripe (optional, can be set later)',
    required: false,
    example: 'pm_1234567890abcdef',
  })
  @IsOptional()
  paymentMethodId?: string;
}
