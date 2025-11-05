import { ApiProperty } from '@nestjs/swagger';

export class OpengraphDto {
  @ApiProperty({ description: 'OG title', example: 'John Doe - Professional Plumber in Toronto' })
  'og:title': string;

  @ApiProperty({ description: 'OG description', example: 'Expert plumber with 10+ years of experience in Toronto' })
  'og:description': string;

  @ApiProperty({ description: 'OG image URL', example: 'https://cdn.hummii.ca/profiles/john-doe.jpg' })
  'og:image': string;

  @ApiProperty({ description: 'OG URL', example: 'https://hummii.ca/performer/john-doe-plumber-toronto' })
  'og:url': string;

  @ApiProperty({ description: 'OG type', example: 'profile' })
  'og:type': string;

  @ApiProperty({ description: 'Twitter card type', example: 'summary_large_image' })
  'twitter:card': string;

  @ApiProperty({ description: 'Twitter title', example: 'John Doe - Professional Plumber' })
  'twitter:title': string;

  @ApiProperty({ description: 'Twitter description', example: 'Expert plumber in Toronto' })
  'twitter:description': string;

  @ApiProperty({ description: 'Twitter image URL', example: 'https://cdn.hummii.ca/profiles/john-doe.jpg' })
  'twitter:image': string;
}


