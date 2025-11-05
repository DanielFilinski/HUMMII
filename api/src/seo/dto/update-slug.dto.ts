import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlugDto {
  @ApiProperty({
    description: 'New slug for contractor profile',
    example: 'john-doe-plumber-toronto',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug: string;
}


