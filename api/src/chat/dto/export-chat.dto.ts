import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ExportFormat {
  PDF = 'pdf',
  TXT = 'txt',
}

export class ExportChatDto {
  @ApiPropertyOptional({
    description: 'Export format',
    enum: ExportFormat,
    default: ExportFormat.PDF,
    example: ExportFormat.PDF,
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.PDF;
}



