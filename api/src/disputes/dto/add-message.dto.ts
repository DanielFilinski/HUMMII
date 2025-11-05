import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'I would like to provide additional context about the issue.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1, { message: 'Message must not be empty' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  message: string;

  @ApiPropertyOptional({
    description: 'Internal message (admin only, not visible to other party)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}

