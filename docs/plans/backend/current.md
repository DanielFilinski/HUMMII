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
- [x] Token rotation при refresh ✅ РЕАЛИЗОВАНО (старый токен удаляется при refresh)
- [x] Failed login tracking (max 5 attempts) ✅ РЕАЛИЗОВАНО
- [x] Account lockout (15 minutes after 5 failed attempts) ✅ РЕАЛИЗОВАНО
- [x] Password complexity validation (12+ chars, upper+lower+digit+special) ✅ РЕАЛИЗОВАНО

### API Security
- [x] Helmet.js с CSP настройками ✅ РЕАЛИЗОВАНО
- [x] CORS whitelist (production domains only) ✅ РЕАЛИЗОВАНО
- [x] Rate limiting на всех endpoints (глобально через APP_GUARD) ✅ РЕАЛИЗОВАНО
- [x] Специфичные rate limits для auth (5 req/min login, 3/hour register) ✅ РЕАЛИЗОВАНО
- [x] Специфичные rate limits для profile (5/hour updates, 2/day deletion) ✅ РЕАЛИЗОВАНО
- [x] Request size limits (10MB) ✅ УЖЕ НАСТРОЕНО

### Data Protection
- [x] PostgreSQL SSL connection ✅ РЕАЛИЗОВАНО
- [x] Redis AUTH password ✅ РЕАЛИЗОВАНО
- [x] Environment variables validation при старте ✅ РЕАЛИЗОВАНО (улучшено)
- [x] PII masking в логах (email, phone) ✅ РЕАЛИЗОВАНО
- [x] Никогда не логировать: passwords, tokens, credit cards ✅ РЕАЛИЗОВАНО

### File Upload Security
- [x] MIME type validation (whitelist) ✅ РЕАЛИЗОВАНО
- [x] File size limits (5MB per image) ✅ РЕАЛИЗОВАНО
- [x] File signature validation (magic numbers) ✅ РЕАЛИЗОВАНО
- [x] EXIF metadata stripping ✅ РЕАЛИЗОВАНО
- [ ] Image optimization (Sharp) ✅ УЖЕ НАСТРОЕНО

### Infrastructure
- [ ] Nginx SSL/TLS 1.3 only
- [ ] Security headers в Nginx
- [ ] Hide server tokens (server_tokens off)
- [ ] DDoS protection (connection limits)
- [ ] Firewall rules (только 22, 80, 443)

### PIPEDA Compliance
- [x] Right to Access endpoint (GET /users/me/export) ✅ РЕАЛИЗОВАНО
- [x] Right to Erasure endpoint (DELETE /users/me) ✅ РЕАЛИЗОВАНО
- [x] Audit logging для всех data access ✅ РЕАЛИЗОВАНО
- [x] Privacy Policy (English + French) ✅ РЕАЛИЗОВАНО
- [x] Cookie consent backend support ✅ РЕАЛИЗОВАНО (endpoint POST /users/me/cookie-preferences)
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

---

### 2. Helmet.js с правильными CSP (Приоритет #2) ✅

**Что сделано:**
- ✅ Создан `/api/src/config/helmet.config.ts` с полной конфигурацией
- ✅ Настроен Content Security Policy (CSP):
  - `defaultSrc: ["'self']` - только ресурсы с того же origin
  - `styleSrc` разрешает `'unsafe-inline'` для Tailwind CSS
  - `scriptSrc` только с того же origin (защита от XSS)
  - `frameSrc: ["'none']` - защита от clickjacking
  - `objectSrc: ["'none']` - запрет опасных элементов
- ✅ HTTP Strict Transport Security (HSTS):
  - `maxAge: 31536000` (1 год)
  - `includeSubDomains: true`
  - `preload: true` - для HSTS preload list
- ✅ Дополнительные security headers:
  - `X-Frame-Options: DENY` - защита от clickjacking
  - `X-Content-Type-Options: nosniff` - защита от MIME sniffing
  - `X-XSS-Protection` - для старых браузеров
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-DNS-Prefetch-Control: off` - для приватности
- ✅ `hidePoweredBy: true` - скрыть информацию о Express/NestJS
- ✅ Обновлен `main.ts` для использования новой конфигурации

**Файлы созданы/изменены:**
- `/api/src/config/helmet.config.ts` (создан)
- `/api/src/main.ts` (обновлен)

---

### 3. CORS с Whitelist (Приоритет #3) ✅

**Что сделано:**
- ✅ Создан `/api/src/config/cors.config.ts` с whitelist подходом
- ✅ Настроены разные whitelist для production и development:
  - **Production:** `hummii.ca`, `www.hummii.ca`, `admin.hummii.ca`
  - **Development:** `localhost:3001`, `localhost:3002`, `localhost:5173`
- ✅ Динамическая валидация origin:
  - Разрешены запросы без origin (mobile apps, Postman)
  - Проверка origin против whitelist
  - Логирование заблокированных origins для мониторинга
- ✅ `credentials: true` - поддержка HTTP-only cookies
- ✅ Ограниченный список HTTP методов (только используемые)
- ✅ Настроены `allowedHeaders` и `exposedHeaders`
- ✅ `maxAge: 3600` - кеширование preflight запросов (1 час)
- ✅ Обновлен `main.ts` для использования новой конфигурации

**Безопасность:**
- ✅ Никаких wildcards (`*`) - только конкретные домены
- ✅ Логирование заблокированных origins
- ✅ Разные whitelist для prod/dev окружений
- ✅ Минимальный набор разрешенных методов и headers

**Файлы созданы/изменены:**
- `/api/src/config/cors.config.ts` (создан)
- `/api/src/main.ts` (обновлен)

---

### 4. Environment Variables Validation (улучшено) ✅

**Что сделано:**
- ✅ Расширена валидация environment переменных
- ✅ JWT secrets: минимум 32 символа (256-bit) с проверкой
- ✅ Redis password: минимум 16 символов (обязательно в production)
- ✅ JWT expiration: валидация формата (15m, 1h, 7d)
- ✅ Stripe keys: валидация формата (`sk_test_`, `sk_live_`, `whsec_`)
- ✅ URLs: обязательно HTTPS в production
- ✅ AWS credentials: валидация длины ключей
- ✅ Conditional validation: разные требования для dev/prod
- ✅ Helpful error messages: подсказки как исправить ошибки

**Безопасность:**
- ✅ Application не запустится с невалидными секретами
- ✅ Validation errors с конкретными инструкциями по исправлению
- ✅ Production-only validation для критичных переменных
- ✅ Format validation для API keys (Stripe, AWS)

**Файлы созданы/изменены:**
- `/api/src/config/env.validation.ts` (расширен)
- `/api/src/config/database.config.ts` (создан)
- `/api/src/config/redis.config.ts` (создан)

---

### 5. PostgreSQL SSL Connection ✅

**Что сделано:**
- ✅ Создан `DatabaseConfig` класс для управления SSL подключениями
- ✅ Production: автоматически добавляет `?sslmode=require` к DATABASE_URL
- ✅ Development: разрешает non-SSL для локального docker
- ✅ Connection pool configuration: оптимизировано для production
- ✅ docker-compose.prod.yml: PostgreSQL с SSL сертификатами
- ✅ SSL certificates mounting: volumes для server.crt и server.key
- ✅ PostgreSQL SSL options: TLSv1.2+ только
- ✅ Performance tuning: оптимизированная конфигурация для production

**Файлы созданы/изменены:**
- `/api/src/config/database.config.ts` (создан)
- `/docker-compose.prod.yml` (создан)

---

### 6. Redis AUTH Password ✅

**Что сделано:**
- ✅ Создан `RedisConfig` класс для управления Redis подключениями
- ✅ Password authentication: обязательно в production (min 16 chars)
- ✅ Validation: Redis password проверяется через env.validation.ts
- ✅ Separate databases: sessions (db 1) и cache (db 0)
- ✅ Key prefixing: `hummii:session:` и `hummii:cache:`
- ✅ Connection options: retry strategy, timeouts, TLS support
- ✅ docker-compose.prod.yml: Redis с `--requirepass` командой
- ✅ Production-ready: TLS для Redis (AWS ElastiCache, Redis Cloud)

**Безопасность:**
- ✅ Password required в production (validated at startup)
- ✅ TLS support для encrypted connections
- ✅ Separate databases для изоляции данных
- ✅ Connection timeout и retry strategy

**Файлы созданы/изменены:**
- `/api/src/config/redis.config.ts` (создан)
- `/docker-compose.prod.yml` (обновлен)

---

### 7. Production Docker Compose Configuration ✅

**Что сделано:**
- ✅ Создан `docker-compose.prod.yml` для production deployment
- ✅ PostgreSQL: SSL enabled, performance tuning, no exposed ports
- ✅ Redis: password auth, memory limits, no exposed ports
- ✅ API: SSL certificates mounted, health checks, production build
- ✅ Nginx: reverse proxy, SSL/TLS, security headers
- ✅ Health checks: для всех сервисов (30s interval)
- ✅ Logging: JSON logs с rotation (max-size, max-file)
- ✅ Networks: isolated bridge network (172.20.0.0/16)
- ✅ Volumes: persistent storage для PostgreSQL и Redis
- ✅ Security: no port exposure для внутренних сервисов

**Файлы созданы:**
- `/docker-compose.prod.yml` (создан)
- `/docs/deployment/production-env-setup.md` (создан)

---

### 8. Production Environment Setup Guide ✅

**Что сделано:**
- ✅ Создан comprehensive guide для production deployment
- ✅ Security checklist: все критичные пункты безопасности
- ✅ Secret generation: команды для генерации всех секретов
- ✅ SSL setup guide: Let's Encrypt и custom certificates
- ✅ Deployment steps: пошаговая инструкция
- ✅ Verification steps: как проверить что всё работает
- ✅ Secret rotation policy: когда и как ротировать секреты
- ✅ Troubleshooting: common issues и решения

**Документация включает:**
- Complete `.env.production` example
- Commands для генерации секретов
- SSL certificate setup
- Docker Compose deployment
- Database migration steps
- Health check verification
- Secret rotation procedures

**Файлы созданы:**
- `/docs/deployment/production-env-setup.md` (создан)

---

### 9. PII Masking в логах ✅

**Что сделано:**
- ✅ Создан `pii-masking.util.ts` с функциями маскирования
- ✅ Email masking: `john.doe@example.com` → `j*******@example.com`
- ✅ Phone masking: `+1234567890` → `******7890`
- ✅ Credit card masking: `4532015112830366` → `************0366`
- ✅ Token removal: автоматическое удаление `password`, `accessToken`, `refreshToken`
- ✅ IP address masking: `192.168.1.100` → `192.168.1.***`
- ✅ JWT token masking: `eyJhbGciOi...` → `eyJ***`
- ✅ SIN masking: `123-456-789` → `***-***-789`
- ✅ Automatic pattern detection: автоматически находит и маскирует PII в строках

**Winston Configuration:**
- ✅ Custom format с PII masking для всех логов
- ✅ Separate transports: console, error, combined, audit
- ✅ Log rotation: 10MB max size, multiple files
- ✅ Audit logs: 30 days retention для PIPEDA compliance
- ✅ Stack traces: включены для errors
- ✅ Structured JSON: для production

**Безопасность:**
- ✅ НИКОГДА не логирует passwords, tokens, credit cards
- ✅ Автоматически маскирует email, phone перед записью в logs
- ✅ Pattern-based sanitization: находит и маскирует даже в сообщениях
- ✅ PIPEDA compliant: минимизация PII в логах

**Файлы созданы:**
- `/api/src/shared/logging/pii-masking.util.ts` (создан)
- `/api/src/config/winston.config.ts` (обновлен)

---

### 10. File Upload Security ✅

**Что сделано:**
- ✅ Создан `UploadSecurityService` для безопасной загрузки файлов
- ✅ MIME type validation: whitelist approach (только разрешенные типы)
- ✅ File signature validation: проверка magic numbers (JPEG, PNG, WebP, GIF, PDF, DOCX)
- ✅ File size limits: 5MB для images, 10MB для documents, 2MB для avatars
- ✅ EXIF metadata stripping: удаление location, camera info через Sharp
- ✅ Image optimization: resize, compress, format conversion
- ✅ Content hash generation: SHA-256 для deduplication
- ✅ Filename sanitization: защита от path traversal
- ✅ Thumbnail generation: automatic thumbnails для images

**Image Processing:**
- ✅ Max dimensions: 4096x4096 validation
- ✅ Avatar processing: 512x512 square, auto-crop
- ✅ Thumbnail: 256x256 для previews
- ✅ Format conversion: JPEG, PNG, WebP support
- ✅ Quality optimization: 80% quality, mozjpeg compression
- ✅ Metadata removal: removeMetadata() для EXIF stripping

**Document Validation:**
- ✅ PDF signature validation: `%PDF` magic number
- ✅ DOCX signature validation: ZIP-based format detection
- ✅ DOC (old) signature validation: OLE2 format detection
- ✅ Hash generation: для integrity verification

**Безопасность:**
- ✅ File extension spoofing prevention: signature validation
- ✅ Path traversal protection: filename sanitization
- ✅ Location data removal: EXIF stripping (PIPEDA compliance)
- ✅ Malicious file detection: magic number validation
- ✅ Virus scanning ready: integration point для ClamAV

**Файлы созданы:**
- `/api/src/shared/upload/upload-security.service.ts` (создан)
- `/api/src/shared/upload/upload.module.ts` (создан)

---

### 11. Failed Login Tracking ✅

**Что сделано:**
- ✅ Создан `FailedLoginService` с Redis-based tracking
- ✅ User-level tracking: max 5 attempts, 15 min lockout
- ✅ IP-level tracking: max 10 attempts, 30 min lockout (stricter)
- ✅ Automatic unlock: после timeout
- ✅ Attempt counter: с 1-hour rolling window
- ✅ Manual unlock: admin endpoints для разблокировки
- ✅ Lockout status: API для проверки статуса
- ✅ Audit logging: все security events логируются

**Brute-force Protection:**
- ✅ User account lockout: 15 минут после 5 попыток
- ✅ IP address lockout: 30 минут после 10 попыток (защита от IP rotation)
- ✅ Attempt window: 1 час для подсчета попыток
- ✅ Auto-expiration: счетчики автоматически истекают
- ✅ Redis-based: fast, scalable, не нагружает PostgreSQL

**Интеграция в AuthService:**
- ✅ Pre-login checks: проверка lockout перед аутентификацией
- ✅ Failed attempt recording: инкрементирует счетчики при неудаче
- ✅ Successful login: очищает счетчики при успехе
- ✅ User enumeration prevention: records attempt для несуществующих users
- ✅ Audit integration: логирует все security events

**Безопасность:**
- ✅ OWASP compliant: следует best practices для login throttling
- ✅ Prevents brute-force attacks: multi-level защита (user + IP)
- ✅ User enumeration protection: одинаковый response для invalid users
- ✅ Audit trail: полный лог для security monitoring
- ✅ PIPEDA compliant: минимизация PII в Redis keys

**Файлы созданы/изменены:**
- `/api/src/auth/services/failed-login.service.ts` (создан)
- `/api/src/auth/auth.service.ts` (обновлен - интеграция)
- `/api/src/auth/auth.module.ts` (обновлен - добавлен provider)

---

### 12. Rate Limiting на Endpoint-уровне (Приоритет #4) ✅

**Что сделано:**
- ✅ Глобальный `ThrottlerGuard` применен через `APP_GUARD` provider
- ✅ Базовый лимит: 100 req/min per IP для всех endpoints
- ✅ **Auth endpoints** - специфичные лимиты:
  - `POST /auth/register` → 3 registrations per hour
  - `POST /auth/login` → 5 attempts per minute
  - `POST /auth/refresh` → 10 refreshes per minute
  - `POST /auth/password-reset/request` → 3 requests per minute (already configured)
  - `POST /auth/password-reset/confirm` → 3 attempts per minute (already configured)
- ✅ **User profile endpoints** - специфичные лимиты:
  - `PATCH /users/me` → 5 updates per hour
  - `DELETE /users/me` → 2 deletions per day (prevent accidental)
  - `GET /users/me/export` → 3 exports per hour
- ✅ HTTP 429 responses с proper headers (`X-RateLimit-*`, `Retry-After`)
- ✅ Comprehensive documentation: `/docs/security/rate-limiting.md`

**Multi-Layer Protection:**
```
Layer 1: Nginx (200 req/sec)
  ↓
Layer 2: Global Throttle (100 req/min)
  ↓
Layer 3: Endpoint-Specific (3-10 req/min auth, 2-5 req/hour profile)
  ↓
Layer 4: Failed Login Tracking (5 attempts → 15 min lockout)
```

**Security Benefits:**
- ✅ Brute-force attack prevention (login, password reset)
- ✅ Account enumeration protection
- ✅ API abuse prevention
- ✅ DDoS mitigation
- ✅ Spam registration prevention (3/hour limit)
- ✅ Accidental deletion protection (2/day limit)

**Файлы изменены:**
- `/api/src/app.module.ts` (global guard already configured)
- `/api/src/auth/auth.controller.ts` (updated throttle limits)
- `/api/src/users/users.controller.ts` (added throttle decorators)
- `/docs/security/rate-limiting.md` (created comprehensive guide)

---

## 🎯 Рекомендуемый порядок реализации:

1. **День 1-2:** HTTP-only cookies + CORS whitelist
2. **День 3:** Rate limiting на endpoints + Helmet CSP
3. **День 4:** File upload security + PII masking
4. **День 5:** PostgreSQL SSL + Redis AUTH
5. **День 6:** Nginx production config + Security headers
6. **День 7:** Testing + Security audit

Хочешь, чтобы я показал реализацию какого-то конкретного пункта более подробно?