import {
  RedisModuleOptions,
  RedisSingleOptions,
} from '@nestjs-modules/ioredis';
import { RedisOptions } from 'ioredis';

/**
 * Redis configuration for caching and session storage
 * PIPEDA Compliance: Requires password authentication in production
 *
 * @see https://github.com/nestjs-modules/ioredis
 */
export class RedisConfig {
  /**
   * Get Redis connection options
   * Production: Requires password authentication
   * Development: Optional password for local Redis
   */
  static getConnectionOptions(): RedisModuleOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;

    // In production, password is REQUIRED (validated by env.validation.ts)
    if (isProduction && !password) {
      throw new Error(
        'REDIS_PASSWORD is required in production environment for security',
      );
    }

    const options: RedisOptions = {
      host,
      port,
      password,
      db: 0, // Database index (0-15)

      // Connection options
      connectTimeout: 10000, // 10 seconds
      retryStrategy(times: number) {
        // Exponential backoff with max delay of 3 seconds
        const delay = Math.min(times * 50, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,

      // TLS/SSL for production
      ...(isProduction && {
        tls: {
          // Enable TLS for production Redis (e.g., AWS ElastiCache, Redis Cloud)
          rejectUnauthorized: true,
        },
      }),

      // Performance tuning
      enableReadyCheck: true,
      enableOfflineQueue: true,
      lazyConnect: false, // Connect immediately on startup

      // Key prefix for namespacing
      keyPrefix: 'hummii:', // All keys will be prefixed with "hummii:"
    };

    return {
      type: 'single',
      options,
    };
  }

  /**
   * Get Redis configuration for session storage
   * Sessions are stored separately from cache data
   */
  static getSessionOptions(): RedisModuleOptions {
    const baseOptions = this.getConnectionOptions() as RedisSingleOptions;
    return {
      type: 'single',
      options: {
        ...baseOptions.options,
        db: 1, // Use different database for sessions
        keyPrefix: 'hummii:session:',
      },
    };
  }

  /**
   * Get Redis configuration for cache storage
   * Cache data is stored separately from sessions
   */
  static getCacheOptions(): RedisModuleOptions {
    const baseOptions = this.getConnectionOptions() as RedisSingleOptions;
    return {
      type: 'single',
      options: {
        ...baseOptions.options,
        db: 0, // Use database 0 for cache
        keyPrefix: 'hummii:cache:',
      },
    };
  }
}

