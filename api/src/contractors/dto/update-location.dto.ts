import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 45.421530,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -75.697193,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude: number;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Address must be at most 200 characters' })
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'Ottawa',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'City must be at most 100 characters' })
  city?: string;

  @ApiProperty({
    description: 'Province/Territory code',
    example: 'ON',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2, { message: 'Province must be a 2-letter code' })
  province?: string;

  @ApiProperty({
    description: 'Postal code',
    example: 'K1A 0A9',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Postal code must be at most 10 characters' })
  postalCode?: string;

  @ApiProperty({
    description: 'Service radius in kilometers',
    example: 50,
    required: false,
    minimum: 5,
    maximum: 100,
  })
  @IsInt()
  @Min(5, { message: 'Service radius must be at least 5 km' })
  @Max(100, { message: 'Service radius must be at most 100 km' })
  @IsOptional()
  serviceRadius?: number;
}

