import type { HelmetOptions } from 'helmet';

/**
 * Helmet security headers configuration for Hummii API
 * Configured for PIPEDA compliance and maximum security
 *
 * @see https://helmetjs.github.io/
 */
export const getHelmetConfig = (): HelmetOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  return {
    // Content Security Policy (CSP)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Only allow resources from same origin by default
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind CSS requires unsafe-inline
        scriptSrc: ["'self'"], // Only scripts from same origin
        imgSrc: ["'self'", 'data:', 'https:'], // Allow images from same origin, data URIs, and HTTPS
        connectSrc: ["'self'", frontendUrl], // Allow API calls to frontend
        fontSrc: ["'self'", 'data:'], // Allow fonts from same origin and data URIs
        objectSrc: ["'none'"], // Disallow <object>, <embed>, <applet>
        mediaSrc: ["'self'"], // Only media from same origin
        frameSrc: ["'none'"], // Disallow iframes (prevent clickjacking)
        baseUri: ["'self'"], // Restrict <base> tag
        formAction: ["'self'"], // Restrict form submissions to same origin
        ...(isProduction && { upgradeInsecureRequests: [] }), // Force HTTPS in production
      },
    },

    // HTTP Strict Transport Security (HSTS)
    // Tells browsers to only access the site via HTTPS
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true, // Apply to all subdomains
      preload: true, // Eligible for HSTS preload list
    },

    // X-Frame-Options: Prevent clickjacking attacks
    frameguard: {
      action: 'deny', // Completely deny iframe embedding
    },

    // X-Content-Type-Options: Prevent MIME type sniffing
    noSniff: true,

    // X-XSS-Protection: Enable browser XSS filter (legacy browsers)
    xssFilter: true,

    // Referrer-Policy: Control referrer information
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // X-DNS-Prefetch-Control: Control DNS prefetching
    dnsPrefetchControl: {
      allow: false, // Disable for privacy
    },

    // X-Download-Options: Prevent IE from executing downloads in site context
    ieNoOpen: true,

    // X-Permitted-Cross-Domain-Policies: Restrict Adobe Flash/PDF cross-domain access
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },

    // Hide X-Powered-By header (don't reveal we're using Express/NestJS)
    hidePoweredBy: true,

    // Cross-Origin-Embedder-Policy: Control resource loading
    crossOriginEmbedderPolicy: false, // Disabled to allow cookies

    // Cross-Origin-Resource-Policy: Control resource sharing
    crossOriginResourcePolicy: {
      policy: 'cross-origin', // Allow CORS (controlled by CORS middleware)
    },

    // Cross-Origin-Opener-Policy: Isolate browsing context
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },
  };
};

