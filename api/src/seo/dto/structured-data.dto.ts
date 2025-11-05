import { ApiProperty } from '@nestjs/swagger';

export class StructuredDataDto {
  @ApiProperty({ description: 'JSON-LD structured data', example: { '@context': 'https://schema.org', '@type': 'Person' } })
  '@context': string;

  @ApiProperty({ description: 'Schema type', example: 'Person' })
  '@type': string;

  [key: string]: unknown;
}


