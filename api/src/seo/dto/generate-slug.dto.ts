import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateSlugDto {
  @ApiPropertyOptional({
    description: 'Custom slug (optional, will be auto-generated if not provided)',
    example: 'john-doe-plumber-toronto',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Business name for slug generation',
    example: 'John Doe Plumbing',
  })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({
    description: 'City for slug generation',
    example: 'Toronto',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Province for slug generation',
    example: 'ON',
  })
  @IsOptional()
  @IsString()
  province?: string;
}


