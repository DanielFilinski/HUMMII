import { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Cookie configuration for JWT tokens
 * Security: HTTP-only cookies prevent XSS attacks
 * PIPEDA Compliance: Secure token storage
 */
export class CookieConfig {
  private static isProduction(configService: ConfigService): boolean {
    return configService.get('NODE_ENV') === 'production';
  }

  /**
   * Access token cookie options (15 minutes)
   */
  static getAccessTokenOptions(configService: ConfigService): CookieOptions {
    return {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: this.isProduction(configService), // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    };
  }

  /**
   * Refresh token cookie options (7 days)
   */
  static getRefreshTokenOptions(configService: ConfigService): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction(configService),
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  /**
   * Cookie options for clearing/logout
   */
  static getClearCookieOptions(configService: ConfigService): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction(configService),
      sameSite: 'strict',
      path: '/',
    };
  }

  /**
   * Cookie names
   */
  static readonly ACCESS_TOKEN_COOKIE = 'accessToken';
  static readonly REFRESH_TOKEN_COOKIE = 'refreshToken';
}

