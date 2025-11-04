import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
  @ApiProperty({
    description: 'Updated message content (text only, max 2000 characters)',
    example: 'Hello! When can you start the work? (Updated)',
    maxLength: 2000,
  })
  @IsString()
  @MaxLength(2000, {
    message: 'Message content must not exceed 2000 characters',
  })
  content: string;
}

