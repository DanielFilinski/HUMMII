import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './services/analytics.service';
import { TrackingService } from './services/tracking.service';
import { BusinessIntelligenceService } from './services/business-intelligence.service';
import { TrackViewDto } from './dto/track-view.dto';
import { TrackSearchDto } from './dto/track-search.dto';
import { TrackConversionDto } from './dto/track-conversion.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@Controller('v1/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly trackingService: TrackingService,
    private readonly businessIntelligenceService: BusinessIntelligenceService,
  ) {}

  @Post('track-view')
  @Throttle({ default: { limit: 100, ttl: 3600000 } }) // 100 events per hour per session
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track profile/order view (anonymous)' })
  @ApiResponse({ status: 204, description: 'Event tracked successfully' })
  async trackView(@Body() dto: TrackViewDto) {
    await this.trackingService.trackView(dto);
  }

  @Post('track-search')
  @Throttle({ default: { limit: 100, ttl: 3600000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track search query (anonymous)' })
  @ApiResponse({ status: 204, description: 'Search tracked successfully' })
  async trackSearch(@Body() dto: TrackSearchDto) {
    await this.trackingService.trackSearch(dto);
  }

  @Post('track-conversion')
  @Throttle({ default: { limit: 100, ttl: 3600000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track conversion event (anonymous)' })
  @ApiResponse({ status: 204, description: 'Conversion tracked successfully' })
  async trackConversion(@Body() dto: TrackConversionDto) {
    await this.trackingService.trackConversion(dto);
  }

}

@ApiTags('Analytics Admin')
@Controller('v1/admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AnalyticsAdminController {
  constructor(
    private readonly businessIntelligenceService: BusinessIntelligenceService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get general analytics statistics (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Analytics overview' })
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return this.businessIntelligenceService.getOverview(query);
  }

  @Get('contractors')
  @ApiOperation({ summary: 'Get contractor performance analytics (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Contractor performance data' })
  async getContractors(@Query() query: AnalyticsQueryDto) {
    return this.businessIntelligenceService.getContractorPerformance(query);
  }

  @Get('searches')
  @ApiOperation({ summary: 'Get search analytics (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search analytics data' })
  async getSearches(@Query() query: AnalyticsQueryDto) {
    return this.businessIntelligenceService.getSearchAnalytics(query);
  }

  @Get('conversions')
  @ApiOperation({ summary: 'Get conversion tracking data (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Conversion data' })
  async getConversions(@Query() query: AnalyticsQueryDto) {
    return this.businessIntelligenceService.getConversionAnalytics(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export analytics data (CSV/JSON) (admin only)' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'json'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Exported analytics data' })
  async exportData(@Query() query: AnalyticsQueryDto & { format?: 'csv' | 'json' }) {
    return this.businessIntelligenceService.exportData(query);
  }
}

