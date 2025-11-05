import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OpengraphDto } from '../dto/opengraph.dto';
import { SlugService } from './slug.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpengraphService {
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://hummii.ca';
  }

  /**
   * Truncate text to max length
   */
  private truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text || '';
    }
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get profile image URL (avatar or first portfolio image)
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

    // Use avatar if available
    if (contractor.user.avatarUrl) {
      return contractor.user.avatarUrl;
    }

    // Use first portfolio image if available
    if (contractor.portfolio.length > 0 && contractor.portfolio[0].images.length > 0) {
      return contractor.portfolio[0].images[0];
    }

    return `${this.baseUrl}/images/default-avatar.png`;
  }

  /**
   * Get OpenGraph metadata for contractor
   */
  async getOpengraph(contractorId: string): Promise<OpengraphDto> {
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
          take: 3,
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    // Get slug
    const slug = await this.slugService.getSlugByContractorId(contractorId);
    const url = slug ? `${this.baseUrl}/performer/${slug}` : `${this.baseUrl}/contractor/${contractorId}`;

    // Generate title
    const displayName = contractor.businessName || contractor.user.name;
    const location = contractor.city && contractor.province
      ? ` in ${contractor.city}, ${contractor.province}`
      : contractor.city ? ` in ${contractor.city}` : '';
    const title = `${displayName}${location} | Hummii`;

    // Generate description
    let description = contractor.bio || '';
    if (contractor.categories.length > 0) {
      const categoryNames = contractor.categories.map((c) => c.category.nameEn).join(', ');
      description = description
        ? `${description} Services: ${categoryNames}.`
        : `Services: ${categoryNames}.`;
    }
    if (!description) {
      description = 'Professional contractor on Hummii. Find trusted service providers in your area.';
    }
    description = this.truncate(description, 200);

    // Get image
    const image = await this.getProfileImage(contractorId);

    return {
      'og:title': this.truncate(title, 60),
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': 'profile',
      'twitter:card': 'summary_large_image',
      'twitter:title': this.truncate(title, 70),
      'twitter:description': description,
      'twitter:image': image,
    };
  }
}

