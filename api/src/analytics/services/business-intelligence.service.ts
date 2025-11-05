import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

@Injectable()
export class BusinessIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get date range from query
   */
  private getDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const endDate = query.endDate ? new Date(query.endDate) : new Date(); // Default: now

    return { startDate, endDate };
  }

  /**
   * Get general analytics overview
   */
  async getOverview(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    // Total events
    const totalEvents = await this.prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Events by type
    const eventsByType = await this.prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        eventType: true,
      },
    });

    // Unique sessions
    const uniqueSessions = await this.prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Total searches
    const totalSearches = await this.prisma.searchAnalytics.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      period: {
        startDate,
        endDate,
      },
      metrics: {
        totalEvents,
        uniqueSessions: uniqueSessions.length,
        totalSearches,
        eventsByType: eventsByType.map((e) => ({
          type: e.eventType,
          count: e._count.eventType,
        })),
      },
    };
  }

  /**
   * Get contractor performance analytics
   */
  async getContractorPerformance(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    // Profile views by contractor
    const profileViews = await this.prisma.analyticsEvent.groupBy({
      by: ['entityId'],
      where: {
        eventType: 'profile_view_profile',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        entityId: {
          not: null,
        },
      },
      _count: {
        entityId: true,
      },
      orderBy: {
        _count: {
          entityId: 'desc',
        },
      },
      take: 100,
    });

    return {
      period: {
        startDate,
        endDate,
      },
      topContractors: profileViews.map((view) => ({
        contractorId: view.entityId,
        viewCount: view._count.entityId,
      })),
    };
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    // Popular search terms
    const popularSearches = await this.prisma.searchAnalytics.groupBy({
      by: ['query'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        query: true,
      },
      _avg: {
        results: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 50,
    });

    // Searches by category
    const searchesByCategory = await this.prisma.searchAnalytics.groupBy({
      by: ['category'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        category: {
          not: null,
        },
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    // Searches by location
    const searchesByLocation = await this.prisma.searchAnalytics.groupBy({
      by: ['location'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        location: {
          not: null,
        },
      },
      _count: {
        location: true,
      },
      orderBy: {
        _count: {
          location: 'desc',
        },
      },
      take: 20,
    });

    return {
      period: {
        startDate,
        endDate,
      },
      popularSearches: popularSearches.map((search) => ({
        query: search.query,
        count: search._count.query,
        averageResults: search._avg.results,
      })),
      searchesByCategory: searchesByCategory.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
      searchesByLocation: searchesByLocation.map((loc) => ({
        location: loc.location,
        count: loc._count.location,
      })),
    };
  }

  /**
   * Get conversion analytics
   */
  async getConversionAnalytics(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    // Conversions by type
    const conversionsByType = await this.prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        eventType: {
          startsWith: 'conversion_',
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        eventType: true,
      },
    });

    // Conversion rate (approximate)
    const totalProfileViews = await this.prisma.analyticsEvent.count({
      where: {
        eventType: 'profile_view_profile',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalConversions = await this.prisma.analyticsEvent.count({
      where: {
        eventType: {
          startsWith: 'conversion_',
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const conversionRate = totalProfileViews > 0 ? (totalConversions / totalProfileViews) * 100 : 0;

    return {
      period: {
        startDate,
        endDate,
      },
      conversionsByType: conversionsByType.map((conv) => ({
        type: conv.eventType.replace('conversion_', ''),
        count: conv._count.eventType,
      })),
      totalConversions,
      totalProfileViews,
      conversionRate: Number(conversionRate.toFixed(2)),
    };
  }

  /**
   * Export analytics data
   */
  async exportData(query: AnalyticsQueryDto & { format?: 'csv' | 'json' }) {
    const { startDate, endDate } = this.getDateRange(query);
    const format = query.format || 'json';

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10000, // Limit export to 10k records
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = ['eventType', 'sessionId', 'entityId', 'createdAt'];
      const rows = events.map((event) => [
        event.eventType,
        event.sessionId,
        event.entityId || '',
        event.createdAt.toISOString(),
      ]);

      return {
        format: 'csv',
        data: [headers, ...rows].map((row) => row.join(',')).join('\n'),
      };
    }

    // JSON format
    return {
      format: 'json',
      data: events.map((event) => ({
        eventType: event.eventType,
        sessionId: event.sessionId,
        entityId: event.entityId,
        createdAt: event.createdAt.toISOString(),
        // Note: metadata, ipHash, userAgent excluded for privacy
      })),
    };
  }
}


