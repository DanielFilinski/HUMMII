import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { MetadataDto } from '../dto/metadata.dto';
import { SlugService } from './slug.service';

@Injectable()
export class MetadataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
  ) {}

  /**
   * Truncate string to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (!text) {
      return '';
    }

    if (text.length <= maxLength) {
      return text;
    }

    // Truncate at word boundary if possible
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Generate SEO title (max 60 chars)
   */
  private generateTitle(
    businessName: string | null,
    name: string | null,
    city: string | null,
    province: string | null,
  ): string {
    const displayName = businessName || name || 'Contractor';
    const location = city && province ? `${city}, ${province}` : city || province || '';

    if (location) {
      const title = `${displayName} - ${location} | Hummii`;
      return this.truncate(title, 60);
    }

    return this.truncate(`${displayName} | Hummii`, 60);
  }

  /**
   * Generate SEO description (max 160 chars)
   */
  private generateDescription(
    bio: string | null,
    categories: Array<{ category: { nameEn: string } }>,
    city: string | null,
    province: string | null,
  ): string {
    const parts: string[] = [];

    if (bio) {
      parts.push(bio);
    }

    if (categories.length > 0) {
      const categoryNames = categories.map((c) => c.category.nameEn).join(', ');
      parts.push(`Services: ${categoryNames}`);
    }

    if (city && province) {
      parts.push(`Serving ${city}, ${province}`);
    } else if (city) {
      parts.push(`Serving ${city}`);
    }

    const description = parts.join('. ');

    if (!description) {
      return 'Professional contractor on Hummii. Find trusted service providers in your area.';
    }

    return this.truncate(description, 160);
  }

  /**
   * Extract keywords from profile data
   */
  private extractKeywords(
    categories: Array<{ category: { nameEn: string; nameFr?: string } }>,
    city: string | null,
    province: string | null,
    businessName: string | null,
  ): string[] {
    const keywords: Set<string> = new Set();

    // Add categories
    categories.forEach((c) => {
      if (c.category.nameEn) {
        keywords.add(c.category.nameEn.toLowerCase());
      }
      if (c.category.nameFr) {
        keywords.add(c.category.nameFr.toLowerCase());
      }
    });

    // Add location
    if (city) {
      keywords.add(city.toLowerCase());
    }
    if (province) {
      keywords.add(province.toLowerCase());
    }

    // Add business name words
    if (businessName) {
      businessName
        .split(/\s+/)
        .filter((word) => word.length > 2)
        .forEach((word) => keywords.add(word.toLowerCase()));
    }

    return Array.from(keywords).slice(0, 10); // Max 10 keywords
  }

  /**
   * Get SEO metadata for contractor
   */
  async getMetadata(contractorId: string): Promise<MetadataDto> {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                nameEn: true,
                nameFr: true,
              },
            },
          },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    // Get slug
    const slug = await this.slugService.getSlugByContractorId(contractorId);
    const baseUrl = process.env.FRONTEND_URL || 'https://hummii.ca';
    const canonicalUrl = slug ? `${baseUrl}/performer/${slug}` : `${baseUrl}/contractor/${contractorId}`;

    // Generate metadata
    const title = this.generateTitle(
      contractor.businessName,
      contractor.user.name,
      contractor.city,
      contractor.province,
    );

    const description = this.generateDescription(
      contractor.bio,
      contractor.categories,
      contractor.city,
      contractor.province,
    );

    const keywords = this.extractKeywords(
      contractor.categories,
      contractor.city,
      contractor.province,
      contractor.businessName,
    );

    return {
      title,
      description,
      keywords,
      canonicalUrl,
    };
  }
}


