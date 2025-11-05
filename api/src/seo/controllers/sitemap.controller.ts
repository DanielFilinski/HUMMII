import { Controller, Get, Header, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { SitemapService } from '../services/sitemap.service';

@ApiTags('Sitemap')
@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests per hour per IP
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get sitemap index' })
  @ApiResponse({ status: 200, description: 'Sitemap index XML' })
  async getSitemapIndex(@Res() res: Response) {
    const xml = await this.sitemapService.generateSitemapIndex();
    res.send(xml);
  }

  @Get('sitemap-static.xml')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get static pages sitemap' })
  @ApiResponse({ status: 200, description: 'Static pages sitemap XML' })
  async getStaticSitemap(@Res() res: Response) {
    const xml = await this.sitemapService.generateStaticSitemap();
    res.send(xml);
  }

  @Get('sitemap-contractors.xml')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get contractors sitemap (verified only)' })
  @ApiResponse({ status: 200, description: 'Contractors sitemap XML' })
  async getContractorsSitemap(@Res() res: Response) {
    const xml = await this.sitemapService.generateContractorsSitemap();
    res.send(xml);
  }

  @Get('sitemap-categories.xml')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get categories sitemap' })
  @ApiResponse({ status: 200, description: 'Categories sitemap XML' })
  async getCategoriesSitemap(@Res() res: Response) {
    const xml = await this.sitemapService.generateCategoriesSitemap();
    res.send(xml);
  }
}

