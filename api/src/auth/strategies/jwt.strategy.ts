import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { CookieConfig } from '../../config/cookie.config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * JWT Strategy - reads tokens from HTTP-only cookies
 * Security: Prevents XSS attacks by not exposing tokens to JavaScript
 * PIPEDA Compliance: Secure authentication mechanism
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      // Extract JWT from cookies (HTTP-only) OR Authorization header (backward compatibility)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // First, try to extract from HTTP-only cookie
          return request?.cookies?.[CookieConfig.ACCESS_TOKEN_COOKIE];
        },
        // Fallback to Authorization header for API clients (Postman, mobile apps)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
