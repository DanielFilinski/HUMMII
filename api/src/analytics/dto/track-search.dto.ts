import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackSearchDto {
  @ApiProperty({ description: 'Anonymous session ID', example: 'session_abc123' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Search query (will be anonymized if PII detected)', example: 'plumber toronto' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Category filter', example: 'plumbing' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Location filter (city only)', example: 'Toronto' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Number of results', example: 25 })
  @IsNumber()
  @Min(0)
  results: number;

  @ApiPropertyOptional({ description: 'IP address (will be hashed)', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent', example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}


