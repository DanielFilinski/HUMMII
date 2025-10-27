import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    // Mask sensitive data
    const sanitizedBody = this.maskSensitiveData(body);

    this.logger.log(`➡️ ${method} ${url} - Body: ${JSON.stringify(sanitizedBody)}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`✅ ${method} ${url} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `❌ ${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * Mask sensitive data in logs (PIPEDA compliance)
   */
  private maskSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const masked = { ...data } as Record<string, unknown>;

    // Mask password
    if ('password' in masked) {
      masked.password = '***';
    }

    // Mask email (show first char only)
    if ('email' in masked && typeof masked.email === 'string') {
      const [user, domain] = (masked.email as string).split('@');
      masked.email = `${user[0]}***@${domain}`;
    }

    // Mask phone
    if ('phone' in masked && typeof masked.phone === 'string') {
      masked.phone = `***-***-${(masked.phone as string).slice(-4)}`;
    }

    // Mask credit card
    if ('creditCard' in masked) {
      masked.creditCard = '***';
    }

    // Mask SIN (Social Insurance Number)
    if ('sin' in masked) {
      masked.sin = '***';
    }

    // Mask tokens
    if ('accessToken' in masked || 'refreshToken' in masked) {
      if ('accessToken' in masked) masked.accessToken = '***';
      if ('refreshToken' in masked) masked.refreshToken = '***';
    }

    return masked;
  }
}
