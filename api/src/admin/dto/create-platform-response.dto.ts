import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatformResponseDto {
  @ApiProperty({
    description: 'Response content (platform response on behalf of platform)',
    example: 'Thank you for your feedback. We have reviewed this case and taken appropriate action.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  content: string;
}

