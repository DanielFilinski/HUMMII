import { IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Order ID for the chat',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Message content (text only, max 2000 characters)',
    example: 'Hello! When can you start the work?',
    maxLength: 2000,
  })
  @IsString()
  @MaxLength(2000, {
    message: 'Message content must not exceed 2000 characters',
  })
  content: string;
}

