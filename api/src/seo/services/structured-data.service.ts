import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StructuredDataDto } from '../dto/structured-data.dto';
import { SlugService } from './slug.service';
import { ReviewsService } from '../../reviews/reviews.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StructuredDataService {
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly reviewsService: ReviewsService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://hummii.ca';
  }

  /**
   * Get profile image URL
   */
  private async getProfileImage(contractorId: string): Promise<string> {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        user: {
          select: {
            avatarUrl: true,
          },
        },
        portfolio: {
          select: {
            images: true,
          },
          take: 1,
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!contractor) {
      return `${this.baseUrl}/images/default-avatar.png`;
    }

    if (contractor.user.avatarUrl) {
      return contractor.user.avatarUrl;
    }

    if (contractor.portfolio.length > 0 && contractor.portfolio[0].images.length > 0) {
      return contractor.portfolio[0].images[0];
    }

    return `${this.baseUrl}/images/default-avatar.png`;
  }

  /**
   * Get JSON-LD structured data for contractor (Person schema)
   */
  async getStructuredData(contractorId: string): Promise<StructuredDataDto> {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                nameEn: true,
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
    const url = slug ? `${this.baseUrl}/performer/${slug}` : `${this.baseUrl}/contractor/${contractorId}`;

    // Get rating stats
    const ratingStats = await this.reviewsService.getUserRatingStats(contractor.userId);

    // Get image
    const image = await this.getProfileImage(contractorId);

    // Build Person schema
    const personSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: contractor.businessName || contractor.user.name,
      description: contractor.bio || undefined,
      image: image,
      url: url,
    };

    // Add job title (from primary category)
    const primaryCategory = contractor.categories.find((c) => c.isPrimary) || contractor.categories[0];
    if (primaryCategory) {
      personSchema.jobTitle = primaryCategory.category.nameEn;
    }

    // Add address (PostalAddress schema)
    if (contractor.city || contractor.province) {
      personSchema.address = {
        '@type': 'PostalAddress',
        addressLocality: contractor.city || undefined,
        addressRegion: contractor.province || undefined,
        addressCountry: 'CA',
      };
    }

    // Add aggregate rating (from reviews)
    if (ratingStats.totalReviews > 0) {
      personSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: ratingStats.averageRating.toString(),
        reviewCount: ratingStats.totalReviews.toString(),
        bestRating: '5',
        worstRating: '1',
      };
    }

    // Add service area (from serviceRadius)
    if (contractor.serviceRadius && contractor.city) {
      personSchema.serviceArea = {
        '@type': 'City',
        name: contractor.city,
        containedIn: {
          '@type': 'State',
          name: contractor.province || 'Canada',
        },
      };
    }

    // Add service types (from categories)
    if (contractor.categories.length > 0) {
      personSchema.knowsAbout = contractor.categories.map((c) => c.category.nameEn);
    }

    // Add price range (from hourly rate)
    if (contractor.hourlyRate) {
      personSchema.priceRange = `$${Number(contractor.hourlyRate).toFixed(2)}/hour`;
    }

    return personSchema;
  }
}


