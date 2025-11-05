import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation (admin override)',
    example: 'Order cancelled due to policy violation',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}


