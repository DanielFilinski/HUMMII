import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

/**
 * Metrics Controller
 * Exposes Prometheus metrics endpoint
 */
@ApiTags('monitoring')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ status: 200, description: 'Prometheus metrics in text format' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}

