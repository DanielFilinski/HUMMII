import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueueHealthService } from '../shared/queue/monitoring/queue-health.service';
import { QueueMetricsService } from '../shared/queue/monitoring/queue-metrics.service';

/**
 * Queue Health Check Controller
 * Provides health check and metrics endpoints for queue monitoring
 */
@ApiTags('health')
@Controller('health/queue')
export class QueueHealthController {
  constructor(
    private readonly queueHealthService: QueueHealthService,
    private readonly queueMetricsService: QueueMetricsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Queue health check' })
  @ApiResponse({ status: 200, description: 'Queue health status' })
  async checkHealth() {
    return this.queueHealthService.checkHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Queue metrics' })
  @ApiResponse({ status: 200, description: 'Queue performance metrics' })
  async getMetrics() {
    return this.queueMetricsService.getMetrics();
  }
}
