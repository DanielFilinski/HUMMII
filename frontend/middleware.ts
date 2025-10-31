import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export function middleware(request: NextRequest) {
  // Apply i18n middleware
  const response = intlMiddleware(request);

  // Security headers (complement to next.config.js)
  const securityHeaders = {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      process.env.NODE_ENV === 'development'
        ? "connect-src 'self' http://localhost:3000 https://api.stripe.com"
        : "connect-src 'self' https://api.hummii.ca https://api.stripe.com wss://api.hummii.ca",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - static files
    // - favicon.ico
    '/((?!api|_next|.*\\..*|favicon.ico).*)',
  ],
};

