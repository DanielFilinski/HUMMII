import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)', example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)', example: '2025-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

