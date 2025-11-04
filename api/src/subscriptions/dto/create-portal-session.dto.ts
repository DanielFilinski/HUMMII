import { IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortalSessionDto {
  @ApiPropertyOptional({
    description: 'Return URL after portal session ends',
    example: 'https://hummii.ca/contractor/subscription',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Return URL must be a valid URL with protocol' })
  returnUrl?: string;
}
