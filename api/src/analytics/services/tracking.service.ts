import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AnalyticsService } from './analytics.service';
import { TrackViewDto } from '../dto/track-view.dto';
import { TrackSearchDto } from '../dto/track-search.dto';
import { TrackConversionDto } from '../dto/track-conversion.dto';

@Injectable()
export class TrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Track profile/order view
   */
  async trackView(dto: TrackViewDto): Promise<void> {
    // Create analytics event
    await this.analyticsService.createEvent(
      `profile_view_${dto.viewType}`,
      dto.sessionId,
      dto.entityId,
      {
        viewType: dto.viewType,
      },
      dto.ipAddress,
      dto.userAgent,
    );
  }

  /**
   * Track search query
   */
  async trackSearch(dto: TrackSearchDto): Promise<void> {
    // Anonymize query
    const anonymizedQuery = this.analyticsService.anonymizeQuery(dto.query);

    // Create search analytics record
    await this.prisma.searchAnalytics.create({
      data: {
        query: anonymizedQuery,
        category: dto.category || null,
        location: dto.location || null,
        results: dto.results,
        sessionId: dto.sessionId,
      },
    });

    // Also create analytics event
    await this.analyticsService.createEvent(
      'search',
      dto.sessionId,
      undefined,
      {
        query: anonymizedQuery,
        category: dto.category,
        location: dto.location,
        results: dto.results,
      },
      dto.ipAddress,
      dto.userAgent,
    );
  }

  /**
   * Track conversion event
   */
  async trackConversion(dto: TrackConversionDto): Promise<void> {
    // Create analytics event
    await this.analyticsService.createEvent(
      `conversion_${dto.conversionType}`,
      dto.sessionId,
      dto.entityId,
      {
        conversionType: dto.conversionType,
      },
      dto.ipAddress,
      dto.userAgent,
    );
  }
}

