# Security & Compliance Guide

> **Безопасность и соответствие PIPEDA для канадского рынка**
> **Версия:** 1.0 | **Обновлено:** 27 октября 2025

---

## 📋 Оглавление

1. [PIPEDA Compliance](#pipeda-compliance)
2. [Authentication Security](#authentication-security)
3. [Data Encryption](#data-encryption)
4. [Input Validation](#input-validation)
5. [Payment Security](#payment-security)
6. [Content Moderation](#content-moderation)
7. [Logging & Monitoring](#logging--monitoring)
8. [Security Checklist](#security-checklist)

---

## 🇨🇦 PIPEDA Compliance

### Что такое PIPEDA?

**PIPEDA** (Personal Information Protection and Electronic Documents Act) - канадский закон о защите персональных данных, аналог GDPR для Канады.

### Обязательные права пользователей

#### 1. Right to Access (Право на доступ)
```typescript
// GET /api/v1/users/me/data
// Экспорт всех данных пользователя в JSON
{
  "profile": { /* user data */ },
  "orders": [ /* order history */ ],
  "messages": [ /* chat history (90 days) */ ],
  "reviews": [ /* ratings */ ],
  "payments": [ /* transaction history */ ]
}
```

#### 2. Right to Rectification (Право на исправление)
```typescript
// PATCH /api/v1/users/me
// Пользователь может обновить свои данные
{
  "name": "New Name",
  "phone": "+1234567890",
  "address": "New Address"
}
```

#### 3. Right to Erasure (Право на удаление)
```typescript
// DELETE /api/v1/users/me
// Удаление аккаунта с:
// - Анонимизацией данных в заказах (для истории)
// - Удалением PII
// - Сохранением transaction records (7 лет - tax law)
```

#### 4. Right to Data Portability (Право на перенос)
```typescript
// GET /api/v1/users/me/export
// Экспорт в machine-readable формате (JSON)
// Включает все данные пользователя
```

### Data Minimization (Минимизация данных)

**Собирайте только необходимые данные:**

```typescript
// ✅ ХОРОШО - только нужные поля
interface UserProfile {
  name: string;
  email: string;
  phone?: string; // Optional
}

// ❌ ПЛОХО - избыточные данные
interface UserProfile {
  name: string;
  email: string;
  age: number; // Not needed
  gender: string; // Not needed
  ssn: string; // NEVER collect unless absolutely required
}
```

### PII Masking in Logs (Маскирование PII в логах)

```typescript
// ❌ НИКОГДА не логируйте:
// - Passwords
// - Tokens (access/refresh)
// - Credit cards
// - SIN (Social Insurance Number)
// - Full email/phone without masking

// ✅ ПРАВИЛЬНО - маскирование
function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.charAt(0)}${'*'.repeat(user.length - 1)}@${domain}`;
  // john.doe@example.com → j*******@example.com
}

function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, '*');
  // +1234567890 → ******7890
}

// Логирование
logger.info('User login', {
  userId: user.id, // OK
  email: maskEmail(user.email), // Masked
  phone: maskPhone(user.phone), // Masked
  correlationId: req.correlationId, // OK
});
```

### Data Retention Policies

| Тип данных | Период хранения | Обоснование |
|------------|-----------------|-------------|
| **Chat messages** | 90 дней | Business requirement |
| **Payment records** | 7 лет | Canadian Tax Law (CRA requirement) |
| **User accounts** | До удаления пользователем | User choice |
| **Audit logs** | 1 год минимум | Security & compliance |
| **Session data** | 7 дней (refresh token) | Security |

**Реализация:**
```typescript
// Автоматическое удаление через cron job
@Cron('0 2 * * *') // Каждый день в 2 AM
async cleanupOldData() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  await this.prisma.message.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } },
  });

  logger.info('Old messages cleaned up');
}
```

### Breach Response Plan

**Если произошла утечка данных:**

1. **В течение 72 часов:**
   - Уведомить затронутых пользователей (email из `PRIVACY_EMAIL` в .env)
   - Уведомить Office of the Privacy Commissioner of Canada (если серьезная утечка)
   - Задокументировать инцидент

2. **Шаблон уведомления:**
```typescript
const breachNotificationTemplate = {
  subject: 'Important Security Notice - Hummii',
  body: `
    Dear [User Name],

    We are writing to inform you of a security incident that may have affected your personal information.

    What happened: [Brief description]
    What data was affected: [List of data types]
    What we are doing: [Actions taken]
    What you should do: [Recommendations]

    For questions, contact: privacy@hummii.ca

    Sincerely,
    Hummii Security Team
  `,
};
```

**📖 Подробнее:** [`docs/security.md`](../../docs/security.md)

---

## 🔐 Authentication Security

### JWT Configuration

```typescript
// .env
JWT_ACCESS_SECRET=<256-bit random string>  // openssl rand -base64 64
JWT_REFRESH_SECRET=<256-bit random string>
JWT_ACCESS_EXPIRATION=15m    // Short-lived
JWT_REFRESH_EXPIRATION=7d    // Long-lived
```

### Token Storage

```typescript
// ✅ ПРАВИЛЬНО - HTTP-only cookies (backend sets)
@Post('login')
async login(@Res({ passthrough: true }) res: Response) {
  const { accessToken, refreshToken } = await this.authService.login(dto);

  // Set HTTP-only cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,        // Not accessible via JavaScript
    secure: true,          // HTTPS only
    sameSite: 'strict',    // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return { message: 'Login successful' };
}

// ❌ НИКОГДА - localStorage/sessionStorage
// localStorage.setItem('token', accessToken); // Vulnerable to XSS!
```

### Password Security

```typescript
import * as bcrypt from 'bcrypt';

// ✅ Hashing with bcrypt (cost factor 12+)
const BCRYPT_ROUNDS = 12; // Higher = more secure but slower

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password policy (validation)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
// Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
```

### Rate Limiting

```typescript
// Global rate limiting (@nestjs/throttler)
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,      // Time window (seconds)
  limit: 100,   // Max requests per IP per window
}),

// Endpoint-specific limits
@Throttle(5, 60) // 5 requests per minute
@Post('login')
async login() { /* ... */ }

@Throttle(3, 60) // 3 requests per minute (stricter)
@Post('forgot-password')
async forgotPassword() { /* ... */ }

@Throttle(20, 60) // 20 messages per minute
@SubscribeMessage('sendMessage')
async handleMessage() { /* ... */ }
```

---

## 🔒 Data Encryption

### Encryption at Rest

```typescript
// PostgreSQL - Transparent Data Encryption (TDE)
// Настройка на уровне базы данных (production)

// Field-level encryption для sensitive данных
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 256-bit key
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text: string): string {
  const [iv, encrypted] = text.split(':');
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Использование
@Column({ type: 'text', transformer: {
  to: (value: string) => encrypt(value),
  from: (value: string) => decrypt(value),
}})
creditCardLast4: string; // Зашифровано в БД
```

### Encryption in Transit

```typescript
// HTTPS only - Nginx configuration
server {
  listen 443 ssl http2;
  ssl_certificate /etc/letsencrypt/live/hummii.ca/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/hummii.ca/privkey.pem;

  ssl_protocols TLSv1.3 TLSv1.2;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # HSTS
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

// Redirect HTTP to HTTPS
server {
  listen 80;
  return 301 https://$host$request_uri;
}
```

---

## ✅ Input Validation

### Backend Validation (class-validator)

```typescript
import { IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password too weak',
  })
  password: string;

  @IsOptional()
  @Matches(/^\+1\d{10}$/, { message: 'Invalid Canadian phone number' })
  phone?: string;
}

// Global validation pipe (main.ts)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Strip unknown properties
  forbidNonWhitelisted: true,   // Throw error on unknown properties
  transform: true,              // Auto type conversion
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

### Frontend Validation (Zod)

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[@$!%*?&]/, 'Must contain special character'),
  phone: z.string()
    .regex(/^\+1\d{10}$/, 'Invalid Canadian phone number')
    .optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
```

### SQL Injection Prevention

```typescript
// ✅ ПРАВИЛЬНО - Prisma ORM (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userEmail },
});

// ✅ ПРАВИЛЬНО - TypeORM (parameterized)
const user = await this.userRepository.findOne({
  where: { email: userEmail },
});

// ❌ НИКОГДА - String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`; // SQL INJECTION!
```

---

## 💳 Payment Security (Stripe)

### Never Store Card Data

```typescript
// ❌ НИКОГДА не храните:
// - Card numbers
// - CVV
// - Expiration dates

// ✅ ПРАВИЛЬНО - используйте Stripe tokens
// Frontend: Stripe.js tokenizes card → backend receives token
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: { token: req.body.stripeToken }, // Token from Stripe.js
});

// Store only: Stripe customer ID, payment method ID
```

### Webhook Security

```typescript
@Post('webhook')
async handleStripeWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('stripe-signature') signature: string,
) {
  // ✅ ВСЕГДА проверяйте signature
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new BadRequestException('Invalid signature');
  }

  // Handle event idempotently
  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.failed':
      await this.handlePaymentFailure(event.data.object);
      break;
  }

  return { received: true };
}
```

### 3D Secure (SCA)

```typescript
// Используйте PaymentIntents API (SCA compliant)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5000, // $50.00 CAD
  currency: 'cad',
  payment_method_types: ['card'],
  metadata: { orderId: order.id },
});

// Frontend confirmCardPayment() автоматически обрабатывает 3DS
```

**📖 Подробнее:** [`backend/nestjs-guide.md#payment-integration`](../backend/nestjs-guide.md)

---

## 🛡️ Content Moderation

### Automatic Filtering (Chat)

```typescript
export class ModerationService {
  private readonly profanityList: string[]; // Canadian EN + FR

  moderateMessage(content: string): ModerationResult {
    const flags = {
      hasPhone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(content),
      hasEmail: /\S+@\S+\.\S+/.test(content),
      hasUrl: /https?:\/\//.test(content),
      hasSocial: /@(instagram|telegram|whatsapp|facebook)/i.test(content),
      hasProfanity: this.checkProfanity(content),
    };

    const isAllowed = !Object.values(flags).some(Boolean);

    return {
      allowed: isAllowed,
      flags,
      cleaned: isAllowed ? content : this.cleanContent(content),
    };
  }

  private cleanContent(content: string): string {
    return content
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE REMOVED]')
      .replace(/\S+@\S+\.\S+/g, '[EMAIL REMOVED]')
      .replace(/https?:\/\/\S+/g, '[LINK REMOVED]');
  }
}
```

### Rate Limiting (Chat)

```typescript
// 20 messages per minute per user
@UseGuards(WsJwtGuard, WsThrottlerGuard)
@Throttle(20, 60)
@SubscribeMessage('sendMessage')
async handleMessage(@MessageBody() data: SendMessageDto) {
  const moderation = this.moderationService.moderateMessage(data.content);

  if (!moderation.allowed) {
    throw new WsException('Message contains prohibited content');
  }

  // Store and broadcast
}
```

**📖 Подробнее:** [`docs/modules/chat.md`](../../docs/modules/chat.md)

---

## 📊 Logging & Monitoring

### Structured Logging

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('UserService');

// ✅ ХОРОШО - structured logs with context
logger.log('User created', {
  userId: user.id,
  email: maskEmail(user.email), // Masked
  role: user.role,
  correlationId: context.correlationId,
  timestamp: new Date().toISOString(),
});

// ❌ ПЛОХО - PII в логах
logger.log(`User created: ${user.email} ${user.password}`); // NEVER!
```

### Audit Logging

```typescript
// Логировать все критичные действия
@Injectable()
export class AuditService {
  async logAction(action: AuditAction) {
    await this.prisma.auditLog.create({
      data: {
        userId: action.userId,
        action: action.type, // 'LOGIN', 'DATA_ACCESS', 'DATA_UPDATE', 'DATA_DELETE'
        resource: action.resource,
        ipAddress: action.ipAddress,
        userAgent: action.userAgent,
        correlationId: action.correlationId,
      },
    });
  }
}

// Использование
await this.auditService.logAction({
  userId: user.id,
  type: 'DATA_ACCESS',
  resource: 'user_profile',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Strip sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

---

## ✅ Security Checklist

### Перед написанием кода

- [ ] **User input** → Validate с class-validator (backend) + Zod (frontend)
- [ ] **Passwords** → Hash с bcrypt (cost 12+) или Argon2
- [ ] **Tokens** → HTTP-only cookies, NEVER localStorage
- [ ] **API keys** → Server-side only, NO `NEXT_PUBLIC_` prefix
- [ ] **Database queries** → Prisma ORM, NEVER string concatenation
- [ ] **File uploads** → Validate MIME type, strip EXIF, scan malware
- [ ] **Payments** → Stripe Elements, verify webhook signatures
- [ ] **PII** → Encrypt с AES-256, mask в logs
- [ ] **Errors** → Generic message для client, detailed log server-side
- [ ] **Rate limiting** → Apply ко ВСЕМ endpoints (особенно auth)

### Перед deploy в production

- [ ] HTTPS enabled (TLS 1.3)
- [ ] Security headers (Helmet.js)
- [ ] CORS configured (whitelisted domains only)
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Error tracking configured (Sentry)
- [ ] Database backups automated
- [ ] Secrets in environment variables (not code)
- [ ] PIPEDA compliance verified
- [ ] Security scan passed (Snyk, Trivy)

---

## 📚 Дополнительные ресурсы

### Связанные документы

- [**Critical Rules**](critical-rules.md) - Обязательные правила
- [`SECURITY_BEST_PRACTICES.md`](../../SECURITY_BEST_PRACTICES.md) - Comprehensive guide (2800+ lines)
- [`docs/security.md`](../../docs/security.md) - Security measures (471 lines)
- [**Backend Guide**](../backend/nestjs-guide.md) - Security implementations
- [**Frontend Guide**](../frontend/nextjs-guide.md) - Client-side security

### External Resources

- [PIPEDA Overview](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security](https://stripe.com/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Последнее обновление:** 27 октября 2025
**Приоритет:** КРИТИЧЕСКИЙ
**Compliance:** PIPEDA (Canada)
