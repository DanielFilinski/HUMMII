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
  /**
   * Skip rate limiting for OPTIONS requests (CORS preflight)
   * OPTIONS requests should always be allowed for CORS to work properly
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Call parent implementation for other skip logic
    return super.shouldSkip(context);
  }
}
