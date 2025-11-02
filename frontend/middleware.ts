import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

// Define protected routes and required roles
const protectedRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/contractor/dashboard': ['CONTRACTOR', 'ADMIN'],
  '/contractor/services': ['CONTRACTOR', 'ADMIN'],
  '/orders/create': ['CLIENT', 'ADMIN'],
};

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/verify-email-sent',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    pathname.includes(route)
  );

  if (isProtectedRoute) {
    // Get auth data from cookie storage
    const authStorageCookie = request.cookies.get('auth-storage');

    if (!authStorageCookie) {
      // No authentication - redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const authData = JSON.parse(authStorageCookie.value);
      const user = authData?.state?.user;

      if (!user) {
        // User not in store - redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check role access for the route
      for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
        if (pathname.includes(route)) {
          if (!allowedRoles.includes(user.role)) {
            // User doesn't have required role - redirect to home with error
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('error', 'access_denied');
            return NextResponse.redirect(homeUrl);
          }
        }
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      // Invalid auth data - redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

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

