import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class RedirectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create URL redirect
   */
  async createRedirect(fromPath: string, toPath: string, statusCode: number = 301): Promise<void> {
    // Check if redirect already exists
    const existing = await this.prisma.urlRedirect.findUnique({
      where: { fromPath },
    });

    if (existing) {
      // Update existing redirect
      await this.prisma.urlRedirect.update({
        where: { fromPath },
        data: {
          toPath,
          statusCode,
        },
      });
      return;
    }

    // Create new redirect
    await this.prisma.urlRedirect.create({
      data: {
        fromPath,
        toPath,
        statusCode,
      },
    });
  }

  /**
   * Get redirect by fromPath
   */
  async getRedirect(fromPath: string): Promise<{ toPath: string; statusCode: number } | null> {
    const redirect = await this.prisma.urlRedirect.findUnique({
      where: { fromPath },
      select: {
        toPath: true,
        statusCode: true,
      },
    });

    return redirect || null;
  }

  /**
   * Get redirects for contractor
   */
  async getRedirectsForContractor(userId: string) {
    // Get contractor slug
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
      include: {
        slug: true,
      },
    });

    if (!contractor || !contractor.slug) {
      return [];
    }

    // Find all redirects that point to this contractor's slug
    const redirects = await this.prisma.urlRedirect.findMany({
      where: {
        toPath: {
          contains: contractor.slug.slug,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return redirects;
  }
}

