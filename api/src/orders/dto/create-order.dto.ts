import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order title',
    example: 'Need plumber to fix kitchen sink',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Detailed order description',
    example: 'Kitchen sink is leaking and needs to be fixed. Located in downtown Toronto.',
    minLength: 20,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    description: 'Order type - public (receives proposals) or direct (to specific contractor)',
    enum: OrderType,
    example: OrderType.PUBLIC,
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Contractor UUID for direct orders (required if type is DIRECT)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @ApiPropertyOptional({
    description: 'Budget in CAD',
    example: 250.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({
    description: 'Desired completion deadline (ISO 8601 date string)',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: 'Latitude (-90 to 90)',
    example: 43.6532,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude (-180 to 180)',
    example: -79.3832,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Full address',
    example: '123 Main St',
  })
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Toronto',
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Province/State',
    example: 'ON',
  })
  @IsString()
  @MaxLength(50)
  province: string;

  @ApiProperty({
    description: 'Postal code',
    example: 'M5H 2N2',
  })
  @IsString()
  @MaxLength(20)
  postalCode: string;
}

