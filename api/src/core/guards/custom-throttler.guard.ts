import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/**
 * Custom ThrottlerGuard that skips rate limiting for OPTIONS requests
 * This is necessary to allow CORS preflight requests to pass through
 * without being counted against the rate limit
 *
 * @see https://docs.nestjs.com/security/rate-limiting
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // Trusted IP whitelist - these IPs bypass rate limiting
  private readonly trustedIps = [
    '10.111.222.0',
    '192.168.0.152',
    '127.0.0.1',
    '::1', // IPv6 localhost
  ];

  /**
   * Skip rate limiting for OPTIONS requests (CORS preflight) and trusted IPs
   * OPTIONS requests should always be allowed for CORS to work properly
   * Trusted IPs bypass rate limiting for testing and internal services
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Skip for trusted IPs
    const clientIp = this.getClientIp(request);
    if (this.trustedIps.includes(clientIp)) {
      return true;
    }

    // Call parent implementation for other skip logic
    return super.shouldSkip(context);
  }

  /**
   * Extract client IP address from request
   * Handles proxy headers and direct connections
   */
  private getClientIp(request: Request): string {
    // Check X-Forwarded-For header (for proxied requests)
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(',')[0].trim();
    }

    // Check X-Real-IP header (nginx, etc.)
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to socket address
    return request.ip || request.socket.remoteAddress || '';
  }
}
