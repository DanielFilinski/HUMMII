/**
 * Database configuration for PostgreSQL with SSL support
 * PIPEDA Compliance: Requires SSL in production for data encryption in transit
 *
 * @see https://www.prisma.io/docs/concepts/database-connectors/postgresql
 */
export class DatabaseConfig {
  /**
   * Get PostgreSQL connection URL with SSL parameters
   * Production: Enforces SSL connection
   * Development: Allows non-SSL for local development
   */
  static getConnectionUrl(): string {
    const baseUrl = process.env.DATABASE_URL;

    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Production: Enforce SSL
      // If URL already has query params, append SSL params; otherwise add new params
      const hasQueryParams = baseUrl.includes('?');
      const sslParams = hasQueryParams
        ? '&sslmode=require&sslcert=/etc/ssl/certs/postgres-client.crt&sslkey=/etc/ssl/private/postgres-client.key'
        : '?sslmode=require';

      return `${baseUrl}${sslParams}`;
    }

    // Development: Use URL as-is (typically no SSL for local docker)
    return baseUrl;
  }

  /**
   * Prisma connection pool configuration
   * Optimized for production workload
   */
  static getConnectionPoolConfig() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      connection_limit: isProduction ? 20 : 5, // Max connections to DB
      pool_timeout: 20, // Seconds to wait for connection
      connect_timeout: 10, // Seconds to wait for initial connection
    };
  }

  /**
   * Get complete Prisma datasource configuration
   */
  static getPrismaConfig() {
    return {
      url: this.getConnectionUrl(),
      ...this.getConnectionPoolConfig(),
    };
  }
}

