import { IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Cookie preferences structure
 * PIPEDA Compliance: User consent management for cookies
 */
export class CookiePreferencesDto {
  @ApiProperty({
    example: true,
    description: 'Essential cookies (always required, cannot be disabled)',
    default: true,
  })
  @IsBoolean()
  essential: boolean;

  @ApiProperty({
    example: true,
    description: 'Functional cookies (remember preferences, settings)',
    default: true,
  })
  @IsBoolean()
  functional: boolean;

  @ApiProperty({
    example: false,
    description: 'Analytics cookies (Google Analytics, usage tracking)',
    default: false,
  })
  @IsBoolean()
  analytics: boolean;

  @ApiProperty({
    example: false,
    description: 'Marketing cookies (advertising, campaign tracking)',
    default: false,
  })
  @IsBoolean()
  marketing: boolean;
}

export class UpdateCookiePreferencesDto {
  @ApiProperty({
    type: CookiePreferencesDto,
    description: 'Cookie preferences',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CookiePreferencesDto)
  preferences: CookiePreferencesDto;
}

