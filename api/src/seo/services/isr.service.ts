import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SitemapService } from './sitemap.service';

@Injectable()
export class IsrService {
  private readonly cachePrefix = 'isr:';

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly sitemapService: SitemapService,
  ) {}

  /**
   * Revalidate ISR cache for contractor profile
   */
  async revalidateContractor(contractorId: string): Promise<void> {
    // Invalidate sitemap cache
    await this.sitemapService.invalidateCache();

    // Invalidate ISR cache for this contractor
    const cacheKey = `${this.cachePrefix}contractor:${contractorId}`;
    await this.redis.del(cacheKey);
  }

  /**
   * Warm cache for popular contractors
   */
  async warmCache(topN: number = 100): Promise<void> {
    // Get top contractors by rating and review count
    const contractors = await this.prisma.contractor.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        slug: {
          isActive: true,
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: topN,
      select: {
        id: true,
      },
    });

    // Pre-generate sitemap to warm cache
    await this.sitemapService.generateContractorsSitemap();

    // Mark contractors as cached
    for (const contractor of contractors) {
      const cacheKey = `${this.cachePrefix}contractor:${contractor.id}`;
      await this.redis.setex(cacheKey, 3600, '1'); // 1 hour TTL
    }
  }

  /**
   * Check if contractor is cached
   */
  async isCached(contractorId: string): Promise<boolean> {
    const cacheKey = `${this.cachePrefix}contractor:${contractorId}`;
    const cached = await this.redis.get(cacheKey);
    return cached !== null;
  }
}

