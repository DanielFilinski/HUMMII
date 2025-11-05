import { Injectable, OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';

/**
 * Prometheus Metrics Service
 * Provides custom business metrics for monitoring
 */
@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: promClient.Registry;

  // Custom metrics
  private readonly httpRequestsTotal: promClient.Counter<string>;
  private readonly httpRequestDuration: promClient.Histogram<string>;
  private readonly activeUsers: promClient.Gauge<string>;
  private readonly activeOrders: promClient.Gauge<string>;
  private readonly activeChats: promClient.Gauge<string>;
  private readonly databaseConnections: promClient.Gauge<string>;
  private readonly redisConnections: promClient.Gauge<string>;
  private readonly queueJobs: promClient.Gauge<string>;

  constructor() {
    this.register = new promClient.Registry();

    // Collect default Node.js metrics
    promClient.collectDefaultMetrics({ register: this.register });

    // HTTP metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // Business metrics
    this.activeUsers = new promClient.Gauge({
      name: 'active_users_total',
      help: 'Total number of active users',
      registers: [this.register],
    });

    this.activeOrders = new promClient.Gauge({
      name: 'active_orders_total',
      help: 'Total number of active orders',
      registers: [this.register],
    });

    this.activeChats = new promClient.Gauge({
      name: 'active_chats_total',
      help: 'Total number of active chats',
      registers: [this.register],
    });

    // Infrastructure metrics
    this.databaseConnections = new promClient.Gauge({
      name: 'database_connections_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    this.redisConnections = new promClient.Gauge({
      name: 'redis_connections_active',
      help: 'Number of active Redis connections',
      registers: [this.register],
    });

    this.queueJobs = new promClient.Gauge({
      name: 'queue_jobs_total',
      help: 'Total number of jobs in queue',
      labelNames: ['queue', 'status'],
      registers: [this.register],
    });
  }

  onModuleInit() {
    // Metrics are initialized in constructor
  }

  /**
   * Get metrics registry
   */
  getRegister(): promClient.Registry {
    return this.register;
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, route: string, status: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
    this.httpRequestDuration.observe({ method, route, status: status.toString() }, duration / 1000);
  }

  /**
   * Set active users count
   */
  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  /**
   * Set active orders count
   */
  setActiveOrders(count: number): void {
    this.activeOrders.set(count);
  }

  /**
   * Set active chats count
   */
  setActiveChats(count: number): void {
    this.activeChats.set(count);
  }

  /**
   * Set database connections count
   */
  setDatabaseConnections(count: number): void {
    this.databaseConnections.set(count);
  }

  /**
   * Set Redis connections count
   */
  setRedisConnections(count: number): void {
    this.redisConnections.set(count);
  }

  /**
   * Set queue jobs count
   */
  setQueueJobs(queue: string, status: 'waiting' | 'active' | 'completed' | 'failed', count: number): void {
    this.queueJobs.set({ queue, status }, count);
  }

  /**
   * Get metrics as Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}

