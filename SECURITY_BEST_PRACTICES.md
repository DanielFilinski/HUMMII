# Security Best Practices & Critical Implementation Guidelines

> **⚠️ ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ ПЕРЕД НАЧАЛОМ РАЗРАБОТКИ**
>
> Этот документ содержит критически важные меры безопасности и лучшие практики, которые ДОЛЖНЫ быть реализованы в проекте Hummii. Несоблюдение этих правил может привести к серьезным уязвимостям и нарушению законов Канады (PIPEDA).

**Last Updated:** October 27, 2025

---

## Table of Contents

1. [Critical Security Rules](#critical-security-rules)
2. [Backend Security Deep Dive](#backend-security-deep-dive)
3. [Frontend Security Deep Dive](#frontend-security-deep-dive)
4. [Database Security](#database-security)
5. [API Security](#api-security)
6. [Payment Security (Stripe)](#payment-security-stripe)
7. [File Upload Security](#file-upload-security)
8. [Authentication & Authorization](#authentication--authorization)
9. [PIPEDA Compliance Implementation](#pipeda-compliance-implementation)
10. [Secrets Management](#secrets-management)
11. [Monitoring & Incident Response](#monitoring--incident-response)
12. [Security Testing](#security-testing)
13. [Production Deployment Checklist](#production-deployment-checklist)
14. [Emergency Procedures](#emergency-procedures)

---

## Critical Security Rules

### ❌ NEVER DO THIS (Security Anti-Patterns)

```typescript
// ❌ 1. NEVER store tokens in localStorage/sessionStorage
localStorage.setItem('token', token);
sessionStorage.setItem('refreshToken', token);

// ❌ 2. NEVER expose API keys in frontend
const API_KEY = 'sk_live_xyz123';
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_SECRET; // Public env vars!

// ❌ 3. NEVER trust user input without validation
app.get('/user/:id', (req, res) => {
  db.query(`SELECT * FROM users WHERE id = ${req.params.id}`); // SQL injection!
});

// ❌ 4. NEVER send detailed error messages to client
catch (error) {
  res.status(500).json({ error: error.message }); // Exposes internal details!
}

// ❌ 5. NEVER use weak password hashing
const hash = crypto.createHash('md5').update(password).digest('hex'); // MD5 is broken!

// ❌ 6. NEVER disable security features
app.use(cors({ origin: '*' })); // Allows any domain!
app.disable('x-powered-by'); // Good, but should also use helmet

// ❌ 7. NEVER store sensitive data in JWT payload
const token = jwt.sign({
  userId,
  password, // NEVER!
  creditCard, // NEVER!
  ssn // NEVER!
}, secret);

// ❌ 8. NEVER use GET for state-changing operations
app.get('/user/delete/:id', deleteUser); // Use DELETE method!

// ❌ 9. NEVER trust file extensions
if (filename.endsWith('.jpg')) { // Can be bypassed with .jpg.php
  saveFile(filename);
}

// ❌ 10. NEVER log sensitive data
console.log('User logged in:', { email, password }); // NEVER log passwords!
logger.info('Payment processed:', paymentDetails); // May contain card data!
```

### ✅ ALWAYS DO THIS (Security Best Practices)

```typescript
// ✅ 1. ALWAYS use HTTP-only cookies for tokens
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// ✅ 2. ALWAYS use environment variables for secrets (server-side only)
const stripeSecret = process.env.STRIPE_SECRET_KEY; // Server-side only!

// ✅ 3. ALWAYS use parameterized queries
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ✅ 4. ALWAYS send generic error messages to client
catch (error) {
  logger.error('Error processing payment:', error); // Log details server-side
  res.status(500).json({ error: 'An error occurred. Please try again.' });
}

// ✅ 5. ALWAYS use strong password hashing
const hash = await bcrypt.hash(password, 12); // bcrypt with cost factor 12+
// or
const hash = await argon2.hash(password); // Argon2 is even better

// ✅ 6. ALWAYS use security middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: process.env.FRONTEND_URL })); // Whitelist only

// ✅ 7. ALWAYS minimize JWT payload
const token = jwt.sign({ userId, role }, secret, { expiresIn: '15m' });

// ✅ 8. ALWAYS use correct HTTP methods
app.delete('/user/:id', deleteUser); // DELETE for deletion
app.patch('/user/:id', updateUser); // PATCH/PUT for updates
app.post('/orders', createOrder); // POST for creation

// ✅ 9. ALWAYS validate MIME types
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedMimes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// ✅ 10. ALWAYS mask sensitive data in logs
logger.info('User logged in:', {
  email: maskEmail(email), // u***@example.com
  userId: generateCorrelationId() // Use correlation ID instead
});
```

---

## Backend Security Deep Dive

### 1. Input Validation (CRITICAL)

**Все входные данные ДОЛЖНЫ быть валидированы!**

```typescript
// DTO Validation with class-validator
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character'
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @Matches(/^\+1\d{10}$/, { message: 'Invalid Canadian phone number format' })
  phone?: string;
}

// Global Validation Pipe Configuration
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // Strip properties not in DTO
  forbidNonWhitelisted: true, // Throw error on unknown properties
  transform: true, // Auto type conversion
  disableErrorMessages: false, // Keep error messages in development
  validationError: {
    target: false, // Don't expose target object
    value: false // Don't expose value in production
  },
}));
```

**Дополнительная валидация для специфичных случаев:**

```typescript
// Custom validators for business logic
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// Валидация канадского почтового индекса
export function IsCanadianPostalCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCanadianPostalCode',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid Canadian postal code format (e.g., K1A 0B1)';
        }
      }
    });
  };
}

// Валидация SIN (Social Insurance Number) - но НЕ хранить в открытом виде!
export function IsValidSIN(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSIN',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Luhn algorithm for SIN validation
          if (!/^\d{9}$/.test(value)) return false;

          const digits = value.split('').map(Number);
          let sum = 0;

          for (let i = 0; i < 9; i++) {
            let digit = digits[i];
            if (i % 2 === 1) { // Every second digit
              digit *= 2;
              if (digit > 9) digit -= 9;
            }
            sum += digit;
          }

          return sum % 10 === 0;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid SIN number';
        }
      }
    });
  };
}

// Usage
export class ContractorVerificationDto {
  @IsCanadianPostalCode()
  postalCode: string;

  @IsValidSIN()
  @Transform(({ value }) => encrypt(value)) // Encrypt immediately!
  sin: string;
}
```

### 2. SQL Injection Prevention

**ВСЕГДА используйте ORM или параметризованные запросы!**

```typescript
// ✅ GOOD - Using Prisma (ORM)
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// ✅ GOOD - Using TypeORM
const user = await userRepository.findOne({
  where: { id: userId }
});

// ✅ GOOD - Raw query with parameters (if ORM not available)
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND status = $2',
  [email, 'active']
);

// ❌ BAD - String concatenation (SQL INJECTION!)
const result = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ❌ BAD - Template literals (SQL INJECTION!)
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

**Dynamic WHERE clauses:**

```typescript
// ✅ GOOD - Safe dynamic queries with Prisma
const filters: any = {};
if (name) filters.name = { contains: name };
if (city) filters.city = city;
if (minRating) filters.rating = { gte: minRating };

const contractors = await prisma.contractor.findMany({
  where: filters
});

// ✅ GOOD - Query builder pattern
const query = userRepository.createQueryBuilder('user');

if (email) {
  query.andWhere('user.email = :email', { email });
}
if (status) {
  query.andWhere('user.status = :status', { status });
}

const users = await query.getMany();
```

### 3. NoSQL Injection Prevention (если используется MongoDB)

```typescript
// ❌ BAD - NoSQL injection vulnerable
const user = await User.findOne({
  username: req.body.username,
  password: req.body.password // Can be manipulated with $ne, $gt, etc.
});

// ✅ GOOD - Validate and sanitize input
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// Then use in controller
async login(@Body() loginDto: LoginDto) {
  // Input is already validated by ValidationPipe
  const user = await User.findOne({ username: loginDto.username });
  // Then compare password hashes
}

// ✅ GOOD - Explicitly cast to string
const user = await User.findOne({
  username: String(req.body.username)
});
```

### 4. XSS Prevention

```typescript
// Backend: Sanitize HTML input
import * as sanitizeHtml from 'sanitize-html';

@Post('review')
async createReview(@Body() dto: CreateReviewDto) {
  // Sanitize HTML content
  const cleanContent = sanitizeHtml(dto.content, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}
  });

  return this.reviewsService.create({
    ...dto,
    content: cleanContent
  });
}

// For rich text (if needed in future)
const cleanRichText = sanitizeHtml(dto.content, {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes: {
    'a': ['href']
  },
  allowedSchemes: ['http', 'https', 'mailto']
});
```

### 5. CSRF Protection

```typescript
// Install: npm install csurf cookie-parser

import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';

// Enable CSRF protection
app.use(cookieParser());

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply to all state-changing routes
app.use('/api', csrfProtection);

// Endpoint to get CSRF token
@Get('csrf-token')
getCsrfToken(@Req() req) {
  return { csrfToken: req.csrfToken() };
}

// Frontend must include token in requests
// axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

### 6. Rate Limiting (Detailed Configuration)

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Module configuration
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 100, // Max requests per window
      ignoreUserAgents: [/bot/i], // Ignore bots
    }),
  ],
})
export class AppModule {}

// Apply globally
app.useGlobalGuards(new ThrottlerGuard());

// Custom rate limits per endpoint
@Controller('auth')
export class AuthController {
  @Post('register')
  @Throttle(5, 3600) // 5 requests per hour
  async register(@Body() dto: RegisterDto) {
    // ...
  }

  @Post('login')
  @Throttle(5, 60) // 5 requests per minute
  async login(@Body() dto: LoginDto) {
    // ...
  }

  @Post('forgot-password')
  @Throttle(3, 3600) // 3 requests per hour
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    // ...
  }
}

// Custom rate limiter by user ID (not just IP)
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiterByUser = new RateLimiterMemory({
  points: 20, // Number of points
  duration: 60, // Per 60 seconds
});

async sendMessage(userId: string, message: string) {
  try {
    await rateLimiterByUser.consume(userId, 1);
    // Process message
  } catch (error) {
    throw new TooManyRequestsException('Too many messages. Please slow down.');
  }
}
```

### 7. Helmet Configuration (Security Headers)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'https://cdn.hummii.ca'],
      scriptSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://maps.googleapis.com'
      ],
      connectSrc: [
        "'self'",
        'https://api.stripe.com',
        'https://api.hummii.ca'
      ],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny' // Prevent clickjacking
  },
  noSniff: true, // Prevent MIME sniffing
  xssFilter: true, // Enable XSS filter
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));
```

---

## Frontend Security Deep Dive

### 1. Environment Variables (CRITICAL)

```typescript
// ❌ NEVER expose secrets in NEXT_PUBLIC_ variables
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_xyz // EXPOSED TO CLIENT!
NEXT_PUBLIC_DATABASE_URL=postgresql://... // EXPOSED TO CLIENT!
NEXT_PUBLIC_JWT_SECRET=secret123 // EXPOSED TO CLIENT!

// ✅ Server-side only (no NEXT_PUBLIC prefix)
STRIPE_SECRET_KEY=sk_live_xyz // Server-only
DATABASE_URL=postgresql://... // Server-only
JWT_SECRET=secret123 // Server-only

// ✅ Public keys OK (they're meant to be public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xyz // OK - public key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza... // OK if restricted by domain
NEXT_PUBLIC_API_URL=https://api.hummii.ca // OK - public URL
```

**Проверка конфигурации:**

```typescript
// lib/config.ts - Server-side only
export const serverConfig = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
};

// Validate on startup
Object.entries(serverConfig).forEach(([key, value]) => {
  if (typeof value === 'object') {
    Object.entries(value).forEach(([subKey, subValue]) => {
      if (!subValue) {
        throw new Error(`Missing environment variable: ${key}.${subKey}`);
      }
    });
  }
});

// lib/public-config.ts - Client-safe
export const publicConfig = {
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL!,
  },
  maps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  },
};
```

### 2. API Route Protection (Next.js API Routes)

```typescript
// app/api/secret/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  // Verify authentication
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const decoded = verify(token, process.env.JWT_ACCESS_SECRET!);

    // Use server-side secret
    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Server-only!

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
    );

    const data = await response.json();

    // Sanitize response before sending to client
    return NextResponse.json({
      lat: data.results[0]?.geometry.location.lat,
      lng: data.results[0]?.geometry.location.lng,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

### 3. Content Security Policy (CSP)

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.stripe.com https://api.hummii.ca wss://api.hummii.ca;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self)'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 4. Secure Cookie Configuration

```typescript
// lib/cookies.ts
import { serialize, CookieSerializeOptions } from 'cookie';

export const COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true, // Prevent JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  path: '/',
  maxAge: 60 * 15, // 15 minutes for access token
};

export const REFRESH_COOKIE_OPTIONS: CookieSerializeOptions = {
  ...COOKIE_OPTIONS,
  maxAge: 60 * 60 * 24 * 7, // 7 days for refresh token
};

// Usage in API route
export async function POST(request: NextRequest) {
  // ... authentication logic ...

  const response = NextResponse.json({ success: true });

  // Set access token
  response.cookies.set('accessToken', accessToken, COOKIE_OPTIONS);

  // Set refresh token
  response.cookies.set('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  return response;
}

// Clear cookies on logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}
```

### 5. Client-Side Input Sanitization

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize rich text (if needed)
 */
export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^(?:https?:\/\/|mailto:)/i
  });
}

/**
 * Escape special characters for display
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Usage in component
'use client';

import { useState } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

export function CommentForm() {
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize before sending to API
    const cleanComment = sanitizeHtml(comment);

    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: cleanComment }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={2000} // Client-side limit
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 6. Preventing Clickjacking

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## Database Security

### 1. Connection Security

```typescript
// Prisma configuration (prisma/schema.prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Use connection pooling
  relationMode = "prisma"
}

// Environment variable format
DATABASE_URL="postgresql://username:password@localhost:5432/hummii_dev?schema=public&sslmode=require&connection_limit=10"

// For production with SSL
DATABASE_URL="postgresql://username:password@host:5432/dbname?sslmode=require&sslcert=/path/to/cert.pem&sslkey=/path/to/key.pem&sslrootcert=/path/to/ca.pem"
```

### 2. Field-Level Encryption

```typescript
// lib/encryption.ts
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (SIN, credit card, etc.)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Return iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage in service
@Injectable()
export class UsersService {
  async createContractor(dto: CreateContractorDto) {
    const encryptedSin = encrypt(dto.sin);

    return this.prisma.contractor.create({
      data: {
        ...dto,
        sin: encryptedSin, // Store encrypted
      },
    });
  }

  async getContractor(id: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
    });

    if (contractor.sin) {
      contractor.sin = decrypt(contractor.sin); // Decrypt when needed
    }

    return contractor;
  }
}
```

### 3. Database Backups & Disaster Recovery

```bash
# Automated daily backups
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="hummii_prod"

# Create backup
pg_dump -h localhost -U postgres -d $DB_NAME -F c -f "$BACKUP_DIR/backup_$DATE.dump"

# Encrypt backup
gpg --encrypt --recipient admin@hummii.ca "$BACKUP_DIR/backup_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/backup_$DATE.dump.gpg" s3://hummii-backups/postgres/

# Keep only last 30 days locally
find $BACKUP_DIR -name "*.dump*" -mtime +30 -delete

# Verify backup integrity
pg_restore --list "$BACKUP_DIR/backup_$DATE.dump" > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "Backup verified successfully"
else
  echo "Backup verification failed!" | mail -s "CRITICAL: Backup Failed" admin@hummii.ca
fi
```

### 4. Row-Level Security (RLS) in PostgreSQL

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_isolation_policy ON users
  FOR ALL
  USING (id = current_setting('app.current_user_id')::uuid);

-- Contractors can see their own orders
CREATE POLICY contractor_orders_policy ON orders
  FOR SELECT
  USING (contractor_id = current_setting('app.current_user_id')::uuid);

-- Clients can see their own orders
CREATE POLICY client_orders_policy ON orders
  FOR SELECT
  USING (client_id = current_setting('app.current_user_id')::uuid);

-- Admins can see everything
CREATE POLICY admin_all_access ON orders
  FOR ALL
  USING (current_setting('app.user_role') = 'ADMIN');
```

### 5. Sensitive Data Masking in Logs

```typescript
// lib/logger.ts
import * as winston from 'winston';

// Mask sensitive data
function maskSensitiveData(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  const masked = { ...obj };
  const sensitiveKeys = [
    'password', 'token', 'secret', 'apiKey', 'creditCard',
    'cvv', 'sin', 'ssn', 'accessToken', 'refreshToken'
  ];

  Object.keys(masked).forEach(key => {
    const lowerKey = key.toLowerCase();

    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      masked[key] = '***REDACTED***';
    } else if (key === 'email' && typeof masked[key] === 'string') {
      masked[key] = maskEmail(masked[key]);
    } else if (key === 'phone' && typeof masked[key] === 'string') {
      masked[key] = maskPhone(masked[key]);
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });

  return masked;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const maskedLocal = local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, '*');
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(info => {
      const masked = maskSensitiveData(info);
      return JSON.stringify(masked);
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Usage
logger.info('User logged in', {
  userId: user.id,
  email: user.email, // Will be masked
  password: user.password // Will be redacted
});
// Output: { userId: '123', email: 'u***r@example.com', password: '***REDACTED***' }

export default logger;
```

---

## API Security

### 1. API Versioning Strategy

```typescript
// main.ts
app.setGlobalPrefix('api/v1');

// Версионирование через URL
@Controller('api/v1/users')
export class UsersV1Controller {}

@Controller('api/v2/users')
export class UsersV2Controller {}

// Версионирование через заголовки
@Controller('users')
@Version('1')
export class UsersV1Controller {}

@Controller('users')
@Version('2')
export class UsersV2Controller {}

// Client sends: Accept: application/vnd.hummii.v1+json
```

### 2. API Response Wrapper (Consistent Format)

```typescript
// lib/response-wrapper.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Interceptor for success responses
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
          version: 'v1',
        },
      })),
    );
  }
}

// Exception filter for error responses
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Don't expose internal error details in production
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: process.env.NODE_ENV === 'production'
          ? 'An error occurred'
          : message,
        details: process.env.NODE_ENV === 'development' ? exception : undefined,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        version: 'v1',
      },
    };

    // Log error server-side
    logger.error('API Error:', {
      requestId: request.id,
      method: request.method,
      url: request.url,
      status,
      error: exception,
    });

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'error' in response) {
        return response.error as string;
      }
    }
    return 'INTERNAL_ERROR';
  }
}
```

### 3. Request ID Tracking (Correlation IDs)

```typescript
// middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get request ID from header or generate new
    const requestId = req.headers['x-request-id'] as string || uuidv4();

    // Attach to request object
    req['id'] = requestId;

    // Add to response headers
    res.setHeader('X-Request-ID', requestId);

    // Add to logger context
    logger.defaultMeta = { requestId };

    next();
  }
}

// Apply globally
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');
  }
}

// Usage in logging
logger.info('Processing order', {
  orderId: order.id,
  // requestId automatically included from defaultMeta
});

// Client can track requests
// axios.defaults.headers.common['X-Request-ID'] = generateRequestId();
```

### 4. API Documentation with Swagger Security

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Hummii API')
  .setDescription('Service marketplace API for Canada')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .addCookieAuth('accessToken', {
    type: 'apiKey',
    in: 'cookie',
    name: 'accessToken',
  })
  .addTag('Authentication')
  .addTag('Users')
  .addTag('Orders')
  .build();

const document = SwaggerModule.createDocument(app, config);

// Only enable Swagger in development
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('api/docs', app, document);
} else {
  // In production, require authentication for Swagger
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      security: [{ JWT-auth: [] }],
    },
  });
}
```

---

## Payment Security (Stripe)

### 1. Stripe Webhook Security

```typescript
// controllers/stripe-webhook.controller.ts
import { Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  @Post()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // CRITICAL: Verify webhook signature
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!, // Must be raw body, not parsed JSON!
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return { error: 'Webhook signature verification failed' };
    }

    // Handle event idempotently
    const idempotencyKey = event.id;
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { stripeEventId: idempotencyKey },
    });

    if (existingEvent) {
      logger.info('Webhook event already processed:', idempotencyKey);
      return { received: true };
    }

    // Process event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.warn('Unhandled webhook event type:', event.type);
      }

      // Record webhook event
      await this.prisma.webhookEvent.create({
        data: {
          stripeEventId: idempotencyKey,
          type: event.type,
          processedAt: new Date(),
        },
      });

      return { received: true };
    } catch (error) {
      logger.error('Error processing webhook:', error);
      throw error; // Stripe will retry
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Send notification to contractor and client
    await this.notificationsService.sendPaymentConfirmation(orderId);
  }
}
```

**Настройка raw body для Stripe webhook:**

```typescript
// main.ts
import { raw } from 'body-parser';

app.use('/webhooks/stripe', raw({ type: 'application/json' }));
```

### 2. Idempotency Keys for Payments

```typescript
// services/payments.service.ts
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createPaymentIntent(orderId: string, amount: number) {
    // Generate idempotency key
    const idempotencyKey = `order_${orderId}_${Date.now()}`;

    try {
      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount: amount * 100, // Convert to cents
          currency: 'cad',
          metadata: {
            orderId,
            platform: 'hummii',
          },
          automatic_payment_methods: {
            enabled: true,
          },
        },
        {
          idempotencyKey, // Prevent duplicate charges
        },
      );

      // Store idempotency key
      await this.prisma.payment.create({
        data: {
          orderId,
          stripePaymentIntentId: paymentIntent.id,
          idempotencyKey,
          amount,
          status: 'PENDING',
        },
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Payment intent creation failed:', { orderId, error });
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
          return_url: `${process.env.FRONTEND_URL}/orders/payment/complete`,
        },
      );

      return paymentIntent;
    } catch (error) {
      logger.error('Payment confirmation failed:', { paymentIntentId, error });

      // Handle specific Stripe errors
      if (error.code === 'card_declined') {
        throw new BadRequestException('Your card was declined. Please try another card.');
      } else if (error.code === 'insufficient_funds') {
        throw new BadRequestException('Insufficient funds. Please try another card.');
      }

      throw error;
    }
  }
}
```

### 3. PCI Compliance (Using Stripe Elements)

```typescript
// Frontend: components/checkout-form.tsx
'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutFormInner({ orderId, amount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on server
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe Elements
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: 'Customer Name', // Get from form
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        window.location.href = `/orders/${orderId}/success`;
      } else if (paymentIntent.status === 'requires_action') {
        // 3D Secure required
        // Stripe automatically handles this
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${amount} CAD`}
      </button>
    </form>
  );
}

export function CheckoutForm(props: Props) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner {...props} />
    </Elements>
  );
}
```

**Важно:**
- ❌ NEVER store card numbers, CVV, or full card data
- ✅ Always use Stripe Elements or Checkout
- ✅ Card data never touches your servers
- ✅ Stripe handles PCI compliance

---

## File Upload Security

### 1. Complete File Upload Security Implementation

```typescript
// services/file-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as sharp from 'sharp';
import * as fileType from 'file-type';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

  async uploadImage(file: Express.Multer.File, userId: string): Promise<string> {
    // 1. Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 2. Validate MIME type from buffer (not from filename!)
    const detectedType = await fileType.fromBuffer(file.buffer);
    if (!detectedType || !this.ALLOWED_IMAGE_TYPES.includes(detectedType.mime)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images allowed.');
    }

    // 3. Strip EXIF metadata and resize
    const processedImage = await sharp(file.buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // 4. Scan for malware (optional - requires ClamAV)
    // await this.scanForVirus(processedImage);

    // 5. Generate secure filename
    const fileHash = crypto.createHash('sha256').update(processedImage).digest('hex');
    const filename = `${userId}/${Date.now()}-${fileHash.substring(0, 16)}.jpg`;

    // 6. Upload to S3 with private ACL
    await this.s3.upload({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: filename,
      Body: processedImage,
      ContentType: 'image/jpeg',
      ACL: 'private', // Not public!
      ServerSideEncryption: 'AES256',
      Metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    }).promise();

    // 7. Return signed URL (expires in 1 hour)
    const signedUrl = await this.getSignedUrl(filename);

    return signedUrl;
  }

  async getSignedUrl(key: string): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Expires: 3600, // 1 hour
    });
  }

  private async scanForVirus(buffer: Buffer): Promise<void> {
    // Implementation with ClamAV or cloud service (VirusTotal, etc.)
    // If virus detected, throw exception
  }
}

// Controller
@Controller('upload')
export class UploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, callback) => {
      // Basic check (will be verified again in service)
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only images allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const userId = req.user.id;
    const imageUrl = await this.fileUploadService.uploadImage(file, userId);
    return { imageUrl };
  }
}
```

### 2. File Type Validation (Client-Side)

```typescript
// components/file-upload.tsx
'use client';

import { useState, useRef } from 'react';

export function FileUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP allowed.');
      return false;
    }

    // Check size
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return false;
    }

    // Additional check: verify file signature (magic numbers)
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.message || 'Upload failed');
        return;
      }

      const { imageUrl } = await response.json();
      console.log('Uploaded:', imageUrl);
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {preview && (
        <div>
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 rounded-md"
          />
          <button
            onClick={handleUpload}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Upload Image
          </button>
        </div>
      )}
    </div>
  );
}
```

---

**(Документ продолжается с разделами: Authentication & Authorization, PIPEDA Compliance, Secrets Management, Monitoring, Security Testing, Production Checklist, Emergency Procedures)**

---

## Production Deployment Checklist

### Security Checklist (CRITICAL - Must Complete Before Production)

```markdown
## Pre-Production Security Audit

### 1. Environment Variables
- [ ] All secrets in `.env` file (never in code)
- [ ] `.env` file in `.gitignore`
- [ ] Verified no secrets in git history (`git log -p | grep -i secret`)
- [ ] Production secrets different from development
- [ ] Secrets stored in secure vault (AWS Secrets Manager / 1Password)

### 2. Authentication & Authorization
- [ ] JWT tokens use strong secrets (256-bit minimum)
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens expire in 7 days
- [ ] HTTP-only cookies for tokens
- [ ] Secure flag enabled for cookies (HTTPS only)
- [ ] SameSite=Strict for CSRF protection
- [ ] Password hashing uses bcrypt (cost 12+) or Argon2
- [ ] Password complexity requirements enforced
- [ ] Email verification mandatory
- [ ] 2FA/MFA available (optional)

### 3. API Security
- [ ] Rate limiting enabled globally (100 req/min)
- [ ] Strict rate limits on auth endpoints (5 req/min)
- [ ] CORS configured with whitelist (no wildcard)
- [ ] Helmet middleware enabled
- [ ] All security headers configured
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints (DTOs)
- [ ] SQL injection prevention (ORM only)
- [ ] XSS prevention (sanitization)
- [ ] Request size limits (10MB max)

### 4. Database Security
- [ ] PostgreSQL connection over SSL/TLS
- [ ] Database user has minimal permissions
- [ ] Connection pooling configured
- [ ] Field-level encryption for PII
- [ ] Row-level security (RLS) enabled
- [ ] Automated backups configured
- [ ] Backup encryption enabled
- [ ] Backup restoration tested

### 5. File Upload Security
- [ ] MIME type validation (server-side)
- [ ] File size limits enforced
- [ ] EXIF metadata stripped
- [ ] Files stored privately on S3
- [ ] Signed URLs with expiration
- [ ] Virus scanning enabled (optional)

### 6. Payment Security (Stripe)
- [ ] Using Stripe Elements (no card data touches servers)
- [ ] Webhook signature verification
- [ ] Idempotency keys for all payment operations
- [ ] 3D Secure (SCA) enabled
- [ ] Payment error handling implemented
- [ ] Refund processing tested

### 7. PIPEDA Compliance
- [ ] Privacy policy published (EN + FR)
- [ ] Terms of service published
- [ ] Data export endpoint (`GET /api/users/me/data`)
- [ ] Account deletion endpoint (`DELETE /api/users/me`)
- [ ] Data retention policies documented
- [ ] Audit logging enabled
- [ ] PII masking in logs
- [ ] Breach notification procedure documented

### 8. Monitoring & Logging
- [ ] Sentry configured for error tracking
- [ ] Structured logging (Winston/Pino)
- [ ] Log rotation configured
- [ ] Sensitive data masked in logs
- [ ] Request ID tracking (correlation IDs)
- [ ] Health check endpoints working
- [ ] Uptime monitoring configured
- [ ] Alert thresholds configured

### 9. SSL/TLS
- [ ] SSL certificate installed
- [ ] Certificate auto-renewal configured (Let's Encrypt)
- [ ] HTTPS redirect from HTTP
- [ ] TLS 1.3 enabled
- [ ] HSTS header configured (1 year)
- [ ] SSL Labs rating A+ verified

### 10. Docker & Infrastructure
- [ ] Running as non-root user
- [ ] Resource limits configured
- [ ] No secrets in Dockerfile
- [ ] Multi-stage builds for optimization
- [ ] Security scanning passed (Trivy)
- [ ] Minimal Alpine base images

### 11. CI/CD Pipeline
- [ ] All tests passing
- [ ] Code coverage ≥80% for critical paths
- [ ] ESLint checks passing
- [ ] TypeScript checks passing
- [ ] Dependency scanning passing (Snyk)
- [ ] Secret scanning passing (TruffleHog)
- [ ] Container scanning passing (Trivy)

### 12. Frontend Security
- [ ] No NEXT_PUBLIC_ secrets
- [ ] CSP headers configured
- [ ] XSS prevention (DOMPurify)
- [ ] Clickjacking prevention (X-Frame-Options: DENY)
- [ ] Client-side input validation (Zod)
- [ ] Server-side validation (always)
- [ ] API keys hidden in API routes

### 13. Additional Checks
- [ ] Admin panel behind authentication
- [ ] Swagger docs behind auth in production
- [ ] Debug mode disabled
- [ ] Stack traces hidden from users
- [ ] Error messages generic to users
- [ ] Detailed errors logged server-side
- [ ] robots.txt configured
- [ ] sitemap.xml generated
```

---

## Emergency Procedures

### Data Breach Response Plan

```markdown
## Data Breach Response (PIPEDA Compliance - 72 Hour Notification)

### Immediate Actions (Within 1 Hour)

1. **Contain the breach**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IP addresses
   - Disable compromised accounts

2. **Assess the damage**
   - Identify what data was accessed
   - Determine number of users affected
   - Document timeline of events
   - Preserve evidence (logs, backups)

3. **Notify core team**
   - Project lead: Daniel Filinski
   - Security team
   - Legal counsel (if available)

### Within 24 Hours

4. **Investigation**
   - Review access logs
   - Identify attack vector
   - Determine if ongoing
   - Estimate full scope

5. **Remediation**
   - Patch vulnerability
   - Reset all affected credentials
   - Update security measures
   - Verify containment

### Within 72 Hours (PIPEDA Requirement)

6. **Notify affected users**
   - Email notification (EN + FR)
   - In-app notification
   - Website banner
   - Include:
     - What data was breached
     - When it occurred
     - What we're doing about it
     - What users should do
     - Contact information

7. **Notify Privacy Commissioner of Canada**
   - If serious breach with real risk of significant harm
   - Report to: https://www.priv.gc.ca/en/
   - Include:
     - Nature of breach
     - Personal information involved
     - Number of individuals affected
     - Steps taken to mitigate risk
     - Steps taken to notify individuals

### Post-Incident

8. **Post-mortem**
   - Document lessons learned
   - Update security procedures
   - Implement additional safeguards
   - Train team on new procedures

9. **Ongoing monitoring**
   - Monitor for similar attacks
   - Watch for suspicious activity
   - Update detection rules
```

### Emergency Contacts

```
Project Lead: admin@hummii.ca
Security Issues: security@hummii.ca
Privacy Issues: privacy@hummii.ca

Office of the Privacy Commissioner of Canada:
https://www.priv.gc.ca/en/report-a-concern/
Phone: 1-800-282-1376
```

---

**End of Security Best Practices Document**

> ⚠️ This document should be reviewed and updated quarterly or after any security incident.
>
> Last Review: October 27, 2025
> Next Review Due: January 27, 2026
