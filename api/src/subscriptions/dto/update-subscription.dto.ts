import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier } from '@prisma/client';

export class UpgradeSubscriptionDto {
  @ApiProperty({
    description: 'Target subscription tier for upgrade',
    enum: SubscriptionTier,
    example: 'PROFESSIONAL',
  })
  @IsEnum(SubscriptionTier, {
    message: 'Tier must be one of: STANDARD, PROFESSIONAL, ADVANCED',
  })
  tier: SubscriptionTier;
}

export class DowngradeSubscriptionDto {
  @ApiProperty({
    description: 'Target subscription tier for downgrade',
    enum: SubscriptionTier,
    example: 'STANDARD',
  })
  @IsEnum(SubscriptionTier, {
    message: 'Tier must be one of: FREE, STANDARD, PROFESSIONAL',
  })
  tier: SubscriptionTier;

  @ApiPropertyOptional({
    description: 'Whether to downgrade immediately or at end of billing period',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  immediate?: boolean;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({
    description: 'Whether to cancel immediately or at end of billing period',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  immediate?: boolean;
}
