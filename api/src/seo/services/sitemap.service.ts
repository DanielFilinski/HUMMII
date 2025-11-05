import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

@Injectable()
export class SitemapService {
  private readonly baseUrl: string;
  private readonly cacheTTL = 24 * 60 * 60; // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://hummii.ca';
  }

  /**
   * Generate XML sitemap entry
   */
  private generateSitemapEntry(
    loc: string,
    lastmod?: Date,
    changefreq: string = 'weekly',
    priority: number = 0.5,
  ): string {
    const lastmodStr = lastmod ? lastmod.toISOString() : new Date().toISOString();
    return `  <url>
    <loc>${this.escapeXml(loc)}</loc>
    <lastmod>${lastmodStr}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate sitemap index
   */
  async generateSitemapIndex(): Promise<string> {
    const cacheKey = 'sitemap:index';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const sitemaps = [
      { loc: `${this.baseUrl}/sitemap-static.xml`, lastmod: new Date() },
      { loc: `${this.baseUrl}/sitemap-contractors.xml`, lastmod: new Date() },
      { loc: `${this.baseUrl}/sitemap-categories.xml`, lastmod: new Date() },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    sitemaps.forEach((sitemap) => {
      xml += `  <sitemap>
    <loc>${this.escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod.toISOString()}</lastmod>
  </sitemap>
`;
    });

    xml += '</sitemapindex>';

    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, xml);

    return xml;
  }

  /**
   * Generate static pages sitemap
   */
  async generateStaticSitemap(): Promise<string> {
    const cacheKey = 'sitemap:static';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const staticPages = [
      { loc: `${this.baseUrl}/`, priority: 1.0, changefreq: 'daily' },
      { loc: `${this.baseUrl}/about`, priority: 0.8, changefreq: 'monthly' },
      { loc: `${this.baseUrl}/terms`, priority: 0.5, changefreq: 'monthly' },
      { loc: `${this.baseUrl}/privacy`, priority: 0.5, changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    staticPages.forEach((page) => {
      xml += this.generateSitemapEntry(page.loc, new Date(), page.changefreq, page.priority);
      xml += '\n';
    });

    xml += '</urlset>';

    // Cache for 24 hours
    await this.redis.setex(cacheKey, this.cacheTTL, xml);

    return xml;
  }

  /**
   * Generate contractors sitemap (verified only)
   */
  async generateContractorsSitemap(): Promise<string> {
    const cacheKey = 'sitemap:contractors';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Get verified contractors with slugs
    const contractors = await this.prisma.contractor.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        slug: {
          isActive: true,
        },
      },
      include: {
        slug: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50000, // Max 50k URLs per sitemap
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    contractors.forEach((contractor) => {
      if (contractor.slug) {
        const loc = `${this.baseUrl}/performer/${contractor.slug.slug}`;
        xml += this.generateSitemapEntry(loc, contractor.updatedAt, 'weekly', 0.8);
        xml += '\n';
      }
    });

    xml += '</urlset>';

    // Cache for 24 hours
    await this.redis.setex(cacheKey, this.cacheTTL, xml);

    return xml;
  }

  /**
   * Generate categories sitemap
   */
  async generateCategoriesSitemap(): Promise<string> {
    const cacheKey = 'sitemap:categories';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Get active categories
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    categories.forEach((category) => {
      const loc = `${this.baseUrl}/categories/${category.slug}`;
      xml += this.generateSitemapEntry(loc, category.updatedAt, 'monthly', 0.7);
      xml += '\n';
    });

    xml += '</urlset>';

    // Cache for 24 hours
    await this.redis.setex(cacheKey, this.cacheTTL, xml);

    return xml;
  }

  /**
   * Compress sitemap with gzip
   */
  async compressSitemap(xml: string): Promise<Buffer> {
    return gzip(xml);
  }

  /**
   * Invalidate sitemap cache
   */
  async invalidateCache(): Promise<void> {
    const keys = ['sitemap:index', 'sitemap:static', 'sitemap:contractors', 'sitemap:categories'];
    await Promise.all(keys.map((key) => this.redis.del(key)));
  }
}

