Давайте проанализирую текущую архитектуру и определю, что нужно настроить для безопасности и требований проекта.

[11 tools called]

Отлично! Проанализировав текущую архитектуру сервера и требования безопасности для вашего проекта, вижу что у вас уже реализовано несколько базовых вещей, но есть **критически важные** элементы безопасности, которые **ОБЯЗАТЕЛЬНО** нужно настроить перед продакшеном. Вот приоритетный список:

## 🚨 КРИТИЧЕСКИЕ ЗАДАЧИ (Сделать в первую очередь)

### 1. **HTTP-Only Cookies для JWT токенов** ⚠️ ПРИОРИТЕТ #1

**Проблема:** Сейчас токены возвращаются в JSON ответе, что делает их уязвимыми к XSS-атакам.

**Что есть сейчас:**
```typescript
// api/src/auth/auth.controller.ts - возвращает токены в JSON
return {
  user: this.excludePassword(user),
  ...tokens, // accessToken, refreshToken в JSON ❌
};
```

**Что нужно:**
```typescript
// Возвращать токены в HTTP-only cookies
@Post('login')
async login(
  @Body() loginDto: LoginDto,
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response, // ✅ Добавить Response
) {
  const result = await this.authService.login(loginDto, userAgent, ipAddress);
  
  // ✅ Установить HTTP-only cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,        // Не доступен через JavaScript
    secure: true,          // Только HTTPS (в продакшене)
    sameSite: 'strict',    // CSRF защита
    maxAge: 15 * 60 * 1000, // 15 минут
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  });

  return { user: result.user }; // Токены НЕ в JSON
}
```

**Также нужно обновить:**
- `JwtStrategy` - читать токен из cookies, а не из `Authorization` header
- Frontend - не хранить токены в localStorage/sessionStorage

---

### 2. **Настройка Helmet.js с правильными CSP** ⚠️ ПРИОРИТЕТ #2

**Что есть сейчас:**
```typescript
// api/src/main.ts
app.use(helmet()); // ✅ Базовый helmet есть, но без CSP
```

**Что нужно:**
```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Для Tailwind
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 год
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    noSniff: true, // X-Content-Type-Options: nosniff
    xssFilter: true, // X-XSS-Protection
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
```

---

### 3. **CORS с Whitelist (не wildcard)** ⚠️ ПРИОРИТЕТ #3

**Что есть сейчас:**
```typescript
// api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', // ❌ Только 1 домен
  credentials: true,
});
```

**Что нужно:**
```typescript
// api/src/config/cors.config.ts (создать)
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const getCorsConfig = (): CorsOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const whitelist = isProduction
    ? [
        'https://hummii.ca',
        'https://www.hummii.ca',
        'https://admin.hummii.ca',
      ]
    : [
        'http://localhost:3001', // Frontend dev
        'http://localhost:3002', // Admin dev
      ];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining'],
    maxAge: 3600, // 1 hour preflight cache
  };
};

// В main.ts
app.enableCors(getCorsConfig());
```

---

### 4. **Rate Limiting на endpoint-уровне** ⚠️ ПРИОРИТЕТ #4

**Что есть сейчас:**
```typescript
// api/src/app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60000, // ✅ Global rate limiting есть
  limit: 100,
}]),
```

**Проблема:** Rate limiting есть, но **ThrottlerGuard не применен глобально** и не настроен на endpoint-уровне.

**Что нужно:**

```typescript
// api/src/main.ts
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// В app.module.ts добавить глобальный guard
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // ✅ Применить ко всем endpoints
    },
  ],
})
```

**Также добавить специфичные лимиты:**
```typescript
// api/src/auth/auth.controller.ts
@Post('login')
@Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 попыток в минуту
async login() {}

@Post('register')
@Throttle({ default: { ttl: 3600000, limit: 3 } }) // 3 регистрации в час
async register() {}

@Post('forgot-password')
@Throttle({ default: { ttl: 3600000, limit: 3 } }) // 3 запроса в час
async forgotPassword() {}
```

---

### 5. **PostgreSQL SSL Connection** 🔒 PIPEDA Compliance

**Что есть сейчас:**
```typescript
// docker-compose.yml
DATABASE_URL: postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}
// ❌ Нет SSL
```

**Что нужно:**
```typescript
// Для продакшена в .env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslcert=path/to/cert"

// В Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // PostgreSQL SSL уже поддерживается через query params в URL
}
```

**Также добавить в docker-compose.prod.yml:**
```yaml
postgres:
  command: >
    postgres
    -c ssl=on
    -c ssl_cert_file=/var/lib/postgresql/server.crt
    -c ssl_key_file=/var/lib/postgresql/server.key
```

---

### 6. **Nginx Production Configuration** 🚀

**Что есть сейчас:**
```nginx
# docker/nginx/nginx.conf
ssl_protocols TLSv1.2 TLSv1.3; // ✅ Хорошо
ssl_ciphers HIGH:!aNULL:!MD5; // ⚠️ Можно улучшить
```

**Что нужно улучшить:**

```nginx
# docker/nginx/nginx.conf

# SSL Configuration (улучшенная)
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# Security Headers (дополнительные)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self), payment=(self)" always;

# Скрыть версию Nginx
server_tokens off;

# DDoS Protection
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
limit_conn conn_limit_per_ip 20; # Макс 20 соединений на IP
```

---

### 7. **Environment Variables Validation** ✅

**Что есть сейчас:**
```typescript
// api/src/config/env.validation.ts - ✅ Есть, но проверить все ли секреты валидируются
```

**Что нужно добавить:**
```typescript
// api/src/config/env.validation.ts
import { IsString, IsNotEmpty, MinLength, IsUrl, IsIn } from 'class-validator';

export class EnvironmentVariables {
  // JWT Secrets (обязательно 256-bit minimum)
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  // Database
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  // Production URLs
  @IsUrl({ require_tld: false })
  FRONTEND_URL: string;

  @IsUrl({ require_tld: false })
  API_URL: string;

  // Node Environment
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;
}

// В app.module.ts уже есть:
ConfigModule.forRoot({
  validate, // ✅ Проверка при старте
})
```

---

### 8. **File Upload Security** 📂

**Что нужно создать:**

```typescript
// api/src/shared/upload/upload.service.ts
import * as sharp from 'sharp';
import { createHash } from 'crypto';

@Injectable()
export class UploadService {
  async validateAndProcessImage(file: Express.Multer.File) {
    // 1. Validate MIME type (whitelist)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // 2. Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 5MB)');
    }

    // 3. Validate file signature (magic numbers)
    const buffer = file.buffer;
    const isValidJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isValidPng = buffer[0] === 0x89 && buffer[1] === 0x50;
    if (!isValidJpeg && !isValidPng) {
      throw new BadRequestException('Invalid file signature');
    }

    // 4. Strip EXIF metadata (location, camera info)
    // 5. Resize and optimize
    const processed = await sharp(buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .removeMetadata() // ✅ Strip EXIF
      .jpeg({ quality: 80 })
      .toBuffer();

    // 6. Generate file hash (для дедупликации)
    const hash = createHash('sha256').update(processed).digest('hex');

    return { buffer: processed, hash };
  }
}
```

---

### 9. **Logging с PII Masking** 📝

**Что нужно добавить:**

```typescript
// api/src/shared/logging/masking.util.ts
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.charAt(0)}${'*'.repeat(user.length - 1)}@${domain}`;
}

export function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, '*');
}

// В winston.config.ts
import { maskEmail, maskPhone } from './masking.util';

// Custom formatter
format.combine(
  format((info) => {
    // Mask PII in logs
    if (info.email) {
      info.email = maskEmail(info.email);
    }
    if (info.phone) {
      info.phone = maskPhone(info.phone);
    }
    // NEVER log: password, token, accessToken, refreshToken
    delete info.password;
    delete info.token;
    delete info.accessToken;
    delete info.refreshToken;
    return info;
  })(),
  format.json(),
);
```

---

### 10. **Redis Session Storage** (вместо PostgreSQL)

**Проблема:** Сейчас refresh tokens хранятся в PostgreSQL таблице `Session`, что создает нагрузку на DB.

**Что нужно:**

```typescript
// api/src/auth/session.service.ts (создать)
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class SessionService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async createSession(userId: string, refreshToken: string, metadata: any) {
    const sessionKey = `session:${userId}:${refreshToken}`;
    await this.redis.setex(
      sessionKey,
      7 * 24 * 60 * 60, // 7 days
      JSON.stringify({ userId, ...metadata }),
    );
  }

  async getSession(userId: string, refreshToken: string) {
    const sessionKey = `session:${userId}:${refreshToken}`;
    const data = await this.redis.get(sessionKey);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(userId: string, refreshToken: string) {
    const sessionKey = `session:${userId}:${refreshToken}`;
    await this.redis.del(sessionKey);
  }

  async deleteAllSessions(userId: string) {
    const keys = await this.redis.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

---

## 📋 Checklist: Что нужно сделать ПЕРЕД продакшеном

```markdown
### Authentication & Authorization
- [x] HTTP-only cookies для JWT токенов (КРИТИЧНО) ✅ РЕАЛИЗОВАНО
- [ ] Token rotation при refresh
- [ ] Failed login tracking (max 5 attempts)
- [ ] Account lockout (15 minutes after 5 failed attempts)
- [ ] Password complexity validation (12+ chars, upper+lower+digit+special)

### API Security
- [ ] Rate limiting на всех endpoints (глобально через APP_GUARD)
- [ ] Специфичные rate limits для auth (5 req/min login)
- [ ] CORS whitelist (production domains only)
- [ ] Helmet.js с CSP настройками
- [ ] Request size limits (10MB)

### Data Protection
- [ ] PostgreSQL SSL connection
- [ ] Redis AUTH password
- [ ] Environment variables validation при старте
- [ ] PII masking в логах (email, phone)
- [ ] Никогда не логировать: passwords, tokens, credit cards

### File Upload Security
- [ ] MIME type validation (whitelist)
- [ ] File size limits (5MB per image)
- [ ] File signature validation (magic numbers)
- [ ] EXIF metadata stripping
- [ ] Image optimization (Sharp)

### Infrastructure
- [ ] Nginx SSL/TLS 1.3 only
- [ ] Security headers в Nginx
- [ ] Hide server tokens (server_tokens off)
- [ ] DDoS protection (connection limits)
- [ ] Firewall rules (только 22, 80, 443)

### PIPEDA Compliance
- [ ] Right to Access endpoint (GET /users/me/export)
- [ ] Right to Erasure endpoint (DELETE /users/me)
- [ ] Audit logging для всех data access
- [ ] Privacy Policy (English + French)
- [ ] Cookie consent banner
```

---

## ✅ Реализовано

### 1. HTTP-Only Cookies для JWT токенов (Приоритет #1) ✅

**Что сделано:**
- ✅ Создан `/api/src/config/cookie.config.ts` с конфигурацией cookies
- ✅ Обновлен `JwtStrategy` для чтения токенов из cookies (с fallback на Authorization header)
- ✅ Обновлен `auth.controller.ts`:
  - Login endpoint устанавливает токены в HTTP-only cookies
  - Refresh endpoint обновляет токены в cookies (token rotation)
  - Logout endpoint очищает cookies
  - Logout-all endpoint очищает cookies текущей сессии
  - Google OAuth callback устанавливает токены в cookies
- ✅ Установлен `cookie-parser` и добавлен в `main.ts`
- ✅ Backward compatibility: API клиенты (Postman, mobile) могут использовать Authorization header
- ✅ Сервер успешно запущен в Docker и работает корректно

**Безопасность:**
- ✅ `httpOnly: true` - защита от XSS атак
- ✅ `secure: true` - только HTTPS в production
- ✅ `sameSite: 'strict'` - защита от CSRF атак
- ✅ Access token: 15 минут
- ✅ Refresh token: 7 дней

**Файлы изменены:**
- `/api/src/config/cookie.config.ts` (создан)
- `/api/src/auth/strategies/jwt.strategy.ts` (обновлен)
- `/api/src/auth/auth.controller.ts` (обновлен)
- `/api/src/main.ts` (обновлен)
- `/api/package.json` (добавлены зависимости)
- `/docs/security/HTTP_ONLY_COOKIES_IMPLEMENTATION.md` (документация)

**Тестирование:**
```bash
# Сервер запущен успешно
✅ Application is running on: http://localhost:3000
✅ Swagger documentation: http://localhost:3000/api/docs

# Для тестирования login с cookies:
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt -v

# Проверить Set-Cookie заголовки:
# Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict
# Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

**Commit message:** Подготовлен в `/COMMIT_MESSAGE.txt`

---

## 🎯 Рекомендуемый порядок реализации:

1. **День 1-2:** HTTP-only cookies + CORS whitelist
2. **День 3:** Rate limiting на endpoints + Helmet CSP
3. **День 4:** File upload security + PII masking
4. **День 5:** PostgreSQL SSL + Redis AUTH
5. **День 6:** Nginx production config + Security headers
6. **День 7:** Testing + Security audit

Хочешь, чтобы я показал реализацию какого-то конкретного пункта более подробно?