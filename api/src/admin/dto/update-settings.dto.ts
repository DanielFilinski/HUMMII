import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Settings key',
    example: 'maintenance_mode',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  key: string;

  @ApiProperty({
    description: 'Settings value',
    example: 'true',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  value: string;

  @ApiPropertyOptional({
    description: 'Settings type',
    enum: ['string', 'number', 'boolean', 'json'],
    example: 'boolean',
  })
  @IsOptional()
  @IsEnum(['string', 'number', 'boolean', 'json'])
  type?: 'string' | 'number' | 'boolean' | 'json';

  @ApiPropertyOptional({
    description: 'Settings category',
    example: 'general',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Settings description',
    example: 'Enable or disable maintenance mode',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({
    description: 'Array of settings to update',
    type: [UpdateSettingsDto],
  })
  settings: UpdateSettingsDto[];
}

