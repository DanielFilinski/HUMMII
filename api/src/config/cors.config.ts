import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS (Cross-Origin Resource Sharing) configuration for Hummii API
 * Uses whitelist approach for maximum security (no wildcards)
 * PIPEDA compliant - only allow trusted domains
 *
 * @see https://docs.nestjs.com/security/cors
 */
export const getCorsConfig = (): CorsOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  /**
   * Whitelist of allowed origins
   * Production: only production domains
   * Development: localhost with different ports
   */
  const whitelist: string[] = isProduction
    ? [
        'https://hummii.ca', // Main production domain
        'https://www.hummii.ca', // WWW subdomain
        'https://admin.hummii.ca', // Admin panel
        // Add more production domains as needed:
        // 'https://api.hummii.ca',
        // 'https://staging.hummii.ca',
      ]
    : [
        'http://localhost:3001', // Frontend dev server
        'http://localhost:3002', // Admin dev server (if separate)
        'http://localhost:5173', // Vite dev server (alternative)
        'http://127.0.0.1:3001', // Alternative localhost
        'http://127.0.0.1:3002',
      ];

  return {
    /**
     * Dynamic origin validation
     * - Allows requests with no origin (mobile apps, Postman, curl)
     * - Checks origin against whitelist
     * - Rejects non-whitelisted origins with error
     */
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in whitelist
      if (whitelist.includes(origin)) {
        callback(null, true);
      } else {
        // Log rejected origin for security monitoring
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(
          new Error(
            `CORS policy: Origin ${origin} is not allowed. Expected one of: ${whitelist.join(', ')}`,
          ),
        );
      }
    },

    /**
     * Allow credentials (cookies, authorization headers)
     * REQUIRED for HTTP-only cookies with JWT tokens
     */
    credentials: true,

    /**
     * Allowed HTTP methods
     * Only include methods actually used by the API
     */
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /**
     * Allowed request headers
     * Client can send these headers
     */
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Correlation-ID', // For request tracing
    ],

    /**
     * Exposed response headers
     * Client can read these headers from response
     */
    exposedHeaders: [
      'X-Total-Count', // For pagination
      'X-RateLimit-Limit', // Rate limit info
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Correlation-ID', // Request tracing
    ],

    /**
     * Preflight request cache duration (in seconds)
     * Browser caches preflight OPTIONS request for this duration
     * 1 hour = 3600 seconds
     */
    maxAge: 3600,

    /**
     * Allow preflight to pass status code 204 (No Content)
     * Default is 204, can set to 200 if needed
     */
    optionsSuccessStatus: 204,
  };
};
