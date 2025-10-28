import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiProperty({
    example: '+11234567890',
    description: 'Canadian phone number',
    required: false,
  })
  @IsOptional()
  @Matches(/^\+1\d{10}$/, {
    message: 'Phone must be a valid Canadian number (+1XXXXXXXXXX)',
  })
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
