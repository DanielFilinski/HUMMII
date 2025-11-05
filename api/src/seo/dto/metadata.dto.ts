import { ApiProperty } from '@nestjs/swagger';

export class MetadataDto {
  @ApiProperty({ description: 'SEO title (max 60 chars)', example: 'John Doe - Plumber in Toronto, ON | Hummii' })
  title: string;

  @ApiProperty({ description: 'SEO description (max 160 chars)', example: 'Professional plumber in Toronto with 10+ years of experience. Expert in residential and commercial plumbing services.' })
  description: string;

  @ApiProperty({ description: 'SEO keywords', example: ['plumber', 'toronto', 'plumbing', 'residential', 'commercial'] })
  keywords: string[];

  @ApiProperty({ description: 'Canonical URL', example: 'https://hummii.ca/performer/john-doe-plumber-toronto' })
  canonicalUrl: string;
}

