import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier } from '@prisma/client';

export class ChangeSubscriptionTierDto {
  @ApiProperty({
    description: 'New subscription tier',
    enum: SubscriptionTier,
  })
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;
}

export class ExtendSubscriptionDto {
  @ApiProperty({
    description: 'Number of days to extend subscription',
    example: 30,
  })
  @IsNumber()
  days: number;

  @ApiPropertyOptional({
    description: 'Reason for extension',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
