# Rate Limiting Configuration

> **Security feature for brute-force protection and API abuse prevention**
> **Version:** 1.0 | **Updated:** November 2, 2025

## Overview

The Hummii API implements **multi-level rate limiting** using `@nestjs/throttler` to protect against:
- Brute-force attacks
- API abuse
- DDoS attacks
- Spam/bot activity

## Global Rate Limits

**Applied to ALL endpoints by default:**

```typescript
// api/src/app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60000,    // 60 seconds window
  limit: 100,    // 100 requests per minute per IP
}])

// Global guard (applied automatically)
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
}
```

**Default behavior:**
- ✅ 100 requests per minute per IP address
- ✅ HTTP 429 (Too Many Requests) on limit exceeded
- ✅ Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Endpoint-Specific Limits

### Authentication Endpoints

#### 1. Registration
```typescript
POST /api/v1/auth/register
@Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
```

**Why:** Prevents mass account creation (spam, bot registration)

---

#### 2. Login
```typescript
POST /api/v1/auth/login
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute
```

**Why:** Brute-force protection for credential stuffing attacks

**Note:** Combines with `FailedLoginService` for account lockout (5 failed attempts → 15 min lockout)

---

#### 3. Token Refresh
```typescript
POST /api/v1/auth/refresh
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per minute
```

**Why:** Prevents token abuse while allowing legitimate refresh requests

---

#### 4. Password Reset (Request)
```typescript
POST /api/v1/auth/password-reset/request
@Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 per minute
```

**Why:** Prevents email flooding and account enumeration

---

#### 5. Password Reset (Confirm)
```typescript
POST /api/v1/auth/password-reset/confirm
@Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 per minute
```

**Why:** Prevents brute-force token guessing

---

### User Profile Endpoints

#### 6. Update Profile
```typescript
PATCH /api/v1/users/me
@Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
```

**Why:** Prevents spam profile updates and API abuse

---

#### 7. Delete Account
```typescript
DELETE /api/v1/users/me
@Throttle({ default: { limit: 2, ttl: 86400000 } }) // 2 per day
```

**Why:** Prevents accidental deletions and malicious account deletion attacks

---

#### 8. Export Data (PIPEDA)
```typescript
GET /api/v1/users/me/export
@Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
```

**Why:** Prevents abuse of data export functionality (large data exports)

---

## Rate Limiting Strategy

### Multi-Layer Protection

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Nginx Rate Limiting (IP-based)        │
│ - 200 req/sec per IP                           │
│ - Connection limits: 20 per IP                 │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Layer 2: Global NestJS Throttle (IP-based)     │
│ - 100 req/min per IP                           │
│ - All endpoints by default                     │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Layer 3: Endpoint-Specific Throttle            │
│ - Custom limits per endpoint                   │
│ - Auth: 3-10 req/min                          │
│ - Profile: 2-5 req/hour                       │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ Layer 4: Failed Login Tracking (Redis)         │
│ - User lockout: 5 attempts → 15 min           │
│ - IP lockout: 10 attempts → 30 min            │
└─────────────────────────────────────────────────┘
```

---

## Response Headers

When rate limited, the API returns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698872400
Retry-After: 60

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

**Headers explanation:**
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds to wait before retrying

---

## Frontend Integration

### Handling Rate Limits

```typescript
// Frontend: HTTP Client Interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const resetTime = error.response.headers['x-ratelimit-reset'];
      
      // Show user-friendly message
      showNotification({
        type: 'warning',
        title: 'Too Many Requests',
        message: `Please wait ${retryAfter} seconds before trying again.`,
      });
      
      // Optional: Auto-retry after delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(axios(error.config));
        }, retryAfter * 1000);
      });
    }
    return Promise.reject(error);
  }
);
```

---

## Testing Rate Limits

### Manual Testing (Postman/cURL)

```bash
# Test login rate limit (5 per minute)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -v
  echo "Request $i completed"
done

# Expected: First 5 succeed (401), 6th returns 429
```

### Automated Testing

```typescript
// api/src/auth/auth.controller.spec.ts
describe('Rate Limiting', () => {
  it('should block after 5 login attempts', async () => {
    // First 5 attempts should return 401 (unauthorized)
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });
      expect(response.status).toBe(401);
    }

    // 6th attempt should return 429 (rate limited)
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(response.status).toBe(429);
    expect(response.headers['x-ratelimit-limit']).toBe('5');
    expect(response.headers['x-ratelimit-remaining']).toBe('0');
  });
});
```

---

## Whitelisting IPs (Admin/Internal Services)

To bypass rate limiting for trusted IPs:

```typescript
// api/src/auth/guards/throttler.guard.ts (custom guard)
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    // Whitelist for internal services
    const whitelistedIPs = [
      '127.0.0.1',
      '::1',
      process.env.ADMIN_IP,
    ];

    return whitelistedIPs.includes(ip);
  }
}
```

---

## Monitoring Rate Limits

### Logs to Watch

```typescript
// Winston logs
logger.warn('Rate limit exceeded', {
  endpoint: '/api/v1/auth/login',
  ip: '192.168.1.100',
  userId: 'user-123',
  remainingAttempts: 0,
  resetTime: '2025-11-02T10:00:00Z',
});
```

### Metrics to Track

1. **Rate Limit Hit Rate** - % of requests that get rate limited
2. **Top Rate-Limited IPs** - Identify potential attackers
3. **Endpoint-Specific Trends** - Which endpoints get rate limited most
4. **Failed Login Attempts** - Combined with rate limiting

---

## Configuration Options

### Customizing Limits per Environment

```typescript
// api/src/config/throttler.config.ts
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

export const getThrottlerConfig = (
  configService: ConfigService,
): ThrottlerModuleOptions => {
  const isDevelopment = configService.get('NODE_ENV') === 'development';

  return [
    {
      ttl: 60000, // 60 seconds
      limit: isDevelopment ? 1000 : 100, // Higher limit in dev
    },
  ];
};
```

---

## Security Best Practices

### ✅ DO

- **Use IP-based rate limiting** for public endpoints
- **Combine with user-based rate limiting** for authenticated endpoints
- **Log rate limit violations** for security monitoring
- **Return proper HTTP 429 status** with Retry-After header
- **Use exponential backoff** for repeated violations

### ❌ DON'T

- **Don't disable rate limiting** in production
- **Don't use the same limit for all endpoints** (use endpoint-specific)
- **Don't expose internal error details** in rate limit responses
- **Don't rely solely on rate limiting** for security (defense in depth)

---

## Troubleshooting

### Issue: Legitimate users getting rate limited

**Solution:** Adjust limits based on usage patterns. Monitor logs to identify legitimate use cases.

```typescript
// Increase limit for specific endpoints
@Throttle({ default: { limit: 20, ttl: 60000 } }) // Increased from 10
```

---

### Issue: Bot traffic bypassing rate limits

**Solution:** Implement additional protection layers:
1. CAPTCHA for registration/login after N failed attempts
2. IP reputation checking (blocklists)
3. Behavioral analysis (user-agent, timing patterns)
4. Device fingerprinting

---

### Issue: Cloudflare/Proxy showing single IP

**Solution:** Configure Express to trust proxy headers:

```typescript
// api/src/main.ts
app.set('trust proxy', 1); // Trust first proxy
```

Then use `req.ip` which will read `X-Forwarded-For` header.

---

## Future Enhancements

- [ ] **Redis-based rate limiting** (for distributed systems)
- [ ] **User-based rate limiting** (per user ID, not just IP)
- [ ] **Dynamic rate limiting** (adjust based on server load)
- [ ] **Rate limit analytics dashboard** (Grafana)
- [ ] **CAPTCHA integration** (reCAPTCHA v3) after rate limit hit

---

**Last updated:** November 2, 2025
**Priority:** CRITICAL
**Compliance:** OWASP API Security Top 10

