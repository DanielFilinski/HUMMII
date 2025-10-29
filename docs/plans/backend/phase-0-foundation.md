# Phase 0: Foundation & Infrastructure

**Duration:** Week 1-2  
**Priority:** 🔴 CRITICAL (MVP)  
**Status:** Not Started

---

## Цели фазы

Создать базовую инфраструктуру проекта, настроить окружение разработки, базу данных и основные security measures. Эта фаза является фундаментом для всех последующих разработок.

---

## Задача 1: Infrastructure Setup

**Приоритет:** 🔴 CRITICAL  
**Время:** 2-3 дня

### 1.1 Docker Configuration

**Цель:** Настроить контейнеризацию для всех сервисов

#### Подзадачи:
- [ ] **1.1.1** Создать `docker-compose.yml` для development
  - Сервисы: PostgreSQL, Redis, API, Admin, Frontend
  - Volume mapping для hot-reload
  - Network configuration
  - Environment variables setup
  
- [ ] **1.1.2** Создать `docker-compose.prod.yml` для production
  - Optimized images
  - Health checks
  - Restart policies
  - Resource limits
  
- [ ] **1.1.3** Настроить Dockerfile для API (api.Dockerfile)
  - Multi-stage build
  - Non-root user
  - Security best practices
  - Minimal base image (Alpine)

#### Критерии приемки:
- ✅ `docker compose up -d` запускает все сервисы
- ✅ Hot-reload работает для API
- ✅ Все сервисы доступны и здоровы

---

### 1.2 PostgreSQL + PostGIS Setup

**Цель:** Настроить основную базу данных с поддержкой геолокации

#### Подзадачи:
- [ ] **1.2.1** Настроить PostgreSQL 16 в Docker
  - Version: PostgreSQL 16
  - Extensions: PostGIS, uuid-ossp
  - Initial database creation
  - User permissions setup
  
- [ ] **1.2.2** Включить PostGIS extension
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```
  
- [ ] **1.2.3** Настроить SSL/TLS connection
  - Generate certificates
  - Configure postgresql.conf
  - Test encrypted connection
  
- [ ] **1.2.4** Настроить connection pooling
  - Prisma connection pool configuration
  - Max connections limit
  - Connection timeout

#### Security Requirements:
- [ ] Database password strong (16+ characters)
- [ ] SSL/TLS required for connections
- [ ] Separate user for application (not postgres superuser)
- [ ] Connection string in `.env` only

#### Критерии приемки:
- ✅ PostgreSQL запущен и доступен
- ✅ PostGIS extension активен
- ✅ SSL connection работает
- ✅ Connection pooling настроен

---

### 1.3 Redis Configuration

**Цель:** Настроить Redis для сессий, кэширования и очередей

#### Подзадачи:
- [ ] **1.3.1** Настроить Redis в Docker
  - Version: Redis 7+
  - Persistence configuration (AOF)
  - Memory limits
  
- [ ] **1.3.2** Настроить password authentication
  - Strong password in `.env`
  - requirepass configuration
  
- [ ] **1.3.3** Настроить persistence
  - AOF enabled
  - Save policy configuration
  - Backup directory

#### Security Requirements:
- [ ] Redis password configured
- [ ] No public exposure (only internal network)
- [ ] Memory limit configured
- [ ] Persistence enabled

#### Критерии приемки:
- ✅ Redis запущен и доступен
- ✅ Authentication работает
- ✅ Data persistence enabled

---

### 1.4 Environment Variables Structure

**Цель:** Создать безопасную структуру для secrets

#### Подзадачи:
- [ ] **1.4.1** Создать `.env.example` с описанием всех переменных
  ```bash
  # Database
  DATABASE_URL=postgresql://user:pass@localhost:5432/hummii
  
  # Redis
  REDIS_URL=redis://:password@localhost:6379
  
  # JWT
  JWT_SECRET=your-secret-here-256-bits
  JWT_REFRESH_SECRET=your-refresh-secret-here
  
  # Stripe
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # Email
  SMTP_HOST=smtp.example.com
  SMTP_USER=...
  SMTP_PASS=...
  
  # Google Maps
  GOOGLE_MAPS_API_KEY=...
  
  # OneSignal
  ONESIGNAL_APP_ID=...
  ONESIGNAL_API_KEY=...
  ```
  
- [ ] **1.4.2** Добавить `.env` в `.gitignore`
  - Verify not in git history
  - Add to .dockerignore
  
- [ ] **1.4.3** Создать validation schema (class-validator)
  ```typescript
  // src/config/env.validation.ts
  export class EnvironmentVariables {
    @IsString()
    @IsNotEmpty()
    DATABASE_URL: string;
    
    @IsString()
    @MinLength(32)
    JWT_SECRET: string;
    
    // ... остальные
  }
  ```
  
- [ ] **1.4.4** Настроить ConfigModule в NestJS
  - Load and validate on startup
  - Fail fast if invalid
  - Type-safe access

#### Security Requirements:
- [ ] No secrets in code
- [ ] `.env` never committed to git
- [ ] Validation on startup
- [ ] Different secrets for dev/prod
- [ ] Strong secrets generation script

#### Критерии приемки:
- ✅ `.env.example` complete
- ✅ Validation works on startup
- ✅ Type-safe config access
- ✅ No secrets in git

---

### 1.5 CI/CD Pipeline Setup (GitHub Actions)

**Цель:** Автоматизировать тестирование и деплой

#### Подзадачи:
- [ ] **1.5.1** Создать workflow для testing
  ```yaml
  # .github/workflows/test.yml
  name: Tests
  on: [push, pull_request]
  jobs:
    test:
      - Install dependencies
      - Run linter
      - Run type-check
      - Run unit tests
      - Run e2e tests
      - Upload coverage
  ```
  
- [ ] **1.5.2** Создать workflow для deployment
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      - Build Docker images
      - Push to registry
      - Deploy to server
      - Run migrations
      - Health check
  ```
  
- [ ] **1.5.3** Настроить secrets в GitHub
  - DOCKER_USERNAME
  - DOCKER_PASSWORD
  - SSH_PRIVATE_KEY
  - ENV variables for production
  
- [ ] **1.5.4** Настроить branch protection
  - Require tests pass
  - Require code review
  - No direct push to main

#### Критерии приемки:
- ✅ Tests run on every push
- ✅ Deploy works on main branch
- ✅ Branch protection enabled
- ✅ Secrets configured

---

### 1.6 Development Environment Documentation

**Цель:** Документировать процесс setup для новых разработчиков

#### Подзадачи:
- [ ] **1.6.1** Обновить `api/README.md`
  - Prerequisites
  - Installation steps
  - Environment setup
  - Running locally
  - Testing
  - Common issues
  
- [ ] **1.6.2** Создать quick start guide
  ```bash
  # Quick Start
  git clone ...
  cd api
  cp .env.example .env
  # Edit .env with your values
  docker compose up -d
  pnpm install
  pnpm run migration:run
  pnpm run dev
  ```
  
- [ ] **1.6.3** Документировать команды разработки
  - `pnpm run dev` - start dev server
  - `pnpm run build` - build production
  - `pnpm run test` - run tests
  - `pnpm run lint` - check code style
  - `pnpm run migration:create` - create migration
  - `pnpm run migration:run` - apply migrations

#### Критерии приемки:
- ✅ Новый разработчик может setup за 15 минут
- ✅ Все команды документированы
- ✅ Troubleshooting section complete

---

## Задача 2: Project Structure

**Приоритет:** 🔴 CRITICAL  
**Время:** 1-2 дня

### 2.1 NestJS Project Initialization

**Цель:** Создать правильную структуру NestJS проекта

#### Подзадачи:
- [ ] **2.1.1** Инициализировать NestJS проект
  ```bash
  pnpm create nest api
  cd api
  pnpm install
  ```
  
- [ ] **2.1.2** Настроить TypeScript strict mode
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "strict": true,
      "strictNullChecks": true,
      "noImplicitAny": true,
      "strictFunctionTypes": true
    }
  }
  ```
  
- [ ] **2.1.3** Установить необходимые dependencies
  ```json
  {
    "dependencies": {
      "@nestjs/common": "^10.0.0",
      "@nestjs/config": "^3.0.0",
      "@nestjs/jwt": "^10.0.0",
      "@nestjs/passport": "^10.0.0",
      "@nestjs/platform-express": "^10.0.0",
      "@prisma/client": "^5.0.0",
      "bcrypt": "^5.1.0",
      "class-validator": "^0.14.0",
      "class-transformer": "^0.5.1",
      "helmet": "^7.0.0",
      "@nestjs/throttler": "^5.0.0"
    }
  }
  ```

#### Критерии приемки:
- ✅ NestJS проект создан
- ✅ TypeScript strict mode enabled
- ✅ Dependencies установлены

---

### 2.2 Module Structure Creation

**Цель:** Создать модульную архитектуру проекта

#### Подзадачи:
- [ ] **2.2.1** Создать структуру директорий
  ```
  src/
  ├── auth/           # Аутентификация
  ├── users/          # Управление пользователями
  ├── orders/         # Заказы
  ├── chat/           # Чат
  ├── reviews/        # Отзывы
  ├── payments/       # Платежи
  ├── disputes/       # Споры
  ├── notifications/  # Уведомления
  ├── categories/     # Категории
  ├── partners/       # Партнеры
  ├── core/           # Core functionality
  │   ├── filters/    # Exception filters
  │   ├── interceptors/ # Interceptors
  │   ├── guards/     # Guards
  │   └── decorators/ # Custom decorators
  ├── shared/         # Shared modules
  │   ├── prisma/     # Prisma service
  │   ├── email/      # Email service
  │   ├── audit/      # Audit logging
  │   └── redis/      # Redis service
  └── config/         # Configuration
  ```
  
- [ ] **2.2.2** Создать базовые модули
  - CoreModule (global)
  - SharedModule (for services used everywhere)
  - ConfigModule (environment variables)
  
- [ ] **2.2.3** Настроить barrel exports
  ```typescript
  // src/core/index.ts
  export * from './filters';
  export * from './interceptors';
  export * from './guards';
  export * from './decorators';
  ```

#### Критерии приемки:
- ✅ Структура директорий создана
- ✅ Базовые модули настроены
- ✅ Barrel exports работают

---

### 2.3 Prisma Schema Design and Setup

**Цель:** Создать базовую схему базы данных

#### Подзадачи:
- [ ] **2.3.1** Инициализировать Prisma
  ```bash
  pnpm add -D prisma
  pnpm add @prisma/client
  npx prisma init
  ```
  
- [ ] **2.3.2** Создать базовые модели
  ```prisma
  // prisma/schema.prisma
  model User {
    id            String    @id @default(uuid())
    email         String    @unique
    passwordHash  String
    role          UserRole  @default(CLIENT)
    isVerified    Boolean   @default(false)
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    
    profile       Profile?
    
    @@map("users")
  }
  
  model Profile {
    id          String   @id @default(uuid())
    userId      String   @unique
    firstName   String
    lastName    String
    phone       String?
    avatar      String?
    
    user        User     @relation(fields: [userId], references: [id])
    
    @@map("profiles")
  }
  
  enum UserRole {
    CLIENT
    CONTRACTOR
    ADMIN
  }
  ```
  
- [ ] **2.3.3** Настроить Prisma Client
  ```typescript
  // src/shared/prisma/prisma.service.ts
  @Injectable()
  export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
      await this.$connect();
    }
    
    async onModuleDestroy() {
      await this.$disconnect();
    }
  }
  ```
  
- [ ] **2.3.4** Создать первую миграцию
  ```bash
  npx prisma migrate dev --name init
  ```

#### Критерии приемки:
- ✅ Prisma настроен
- ✅ Базовые модели созданы
- ✅ Миграция применена
- ✅ PrismaService работает

---

### 2.4 Base DTOs and Entities Structure

**Цель:** Создать базовые классы для DTO и entities

#### Подзадачи:
- [ ] **2.4.1** Создать базовые DTO классы
  ```typescript
  // src/shared/dto/pagination.dto.ts
  export class PaginationDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;
    
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;
  }
  
  // src/shared/dto/response.dto.ts
  export class ResponseDto<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
  }
  ```
  
- [ ] **2.4.2** Создать базовые entity классы
  ```typescript
  // src/shared/entities/base.entity.ts
  export class BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
  
- [ ] **2.4.3** Настроить validation pipe globally
  ```typescript
  // src/main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
  ```

#### Критерии приемки:
- ✅ Базовые DTO созданы
- ✅ Validation pipe настроен
- ✅ Type transformation работает

---

### 2.5 Global Guards, Filters, Interceptors Setup

**Цель:** Настроить глобальные middleware

#### Подзадачи:
- [ ] **2.5.1** Создать Global Exception Filter
  ```typescript
  // src/core/filters/http-exception.filter.ts
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      // Handle all exceptions
      // Log error
      // Return user-friendly message
      // Never expose sensitive info
    }
  }
  ```
  
- [ ] **2.5.2** Создать Logging Interceptor
  ```typescript
  // src/core/interceptors/logging.interceptor.ts
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req = context.switchToHttp().getRequest();
      const now = Date.now();
      
      return next.handle().pipe(
        tap(() => {
          const responseTime = Date.now() - now;
          // Log request info (mask PII)
        }),
      );
    }
  }
  ```
  
- [ ] **2.5.3** Создать Transform Interceptor
  ```typescript
  // src/core/interceptors/transform.interceptor.ts
  @Injectable()
  export class TransformInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
      return next.handle().pipe(
        map(data => ({
          success: true,
          data,
          timestamp: new Date().toISOString(),
        })),
      );
    }
  }
  ```
  
- [ ] **2.5.4** Применить глобально в main.ts
  ```typescript
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  ```

#### Критерии приемки:
- ✅ Exception filter работает
- ✅ Logging interceptor записывает логи
- ✅ Response transformation работает
- ✅ PII не попадает в логи

---

### 2.6 Logging Configuration (Winston)

**Цель:** Настроить структурированное логирование

#### Подзадачи:
- [ ] **2.6.1** Установить Winston
  ```bash
  pnpm add winston nest-winston
  ```
  
- [ ] **2.6.2** Создать Winston configuration
  ```typescript
  // src/config/winston.config.ts
  export const winstonConfig = {
    transports: [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.json(),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.json(),
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            return `${timestamp} [${context}] ${level}: ${message}`;
          }),
        ),
      }),
    ],
  };
  ```
  
- [ ] **2.6.3** Интегрировать в NestJS
  ```typescript
  // src/main.ts
  import { WinstonModule } from 'nest-winston';
  
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  ```
  
- [ ] **2.6.4** Создать LoggerService с PII masking
  ```typescript
  // src/shared/logger/logger.service.ts
  @Injectable()
  export class LoggerService {
    private maskPII(data: any): any {
      // Mask emails, phones, passwords, tokens
      // Return masked data
    }
    
    log(message: string, context?: string, data?: any) {
      this.logger.log(message, this.maskPII(data));
    }
  }
  ```

#### Security Requirements:
- [ ] Never log passwords
- [ ] Never log tokens
- [ ] Mask emails (u***@example.com)
- [ ] Mask phone numbers
- [ ] Use correlation IDs

#### Критерии приемки:
- ✅ Winston настроен
- ✅ Логи пишутся в файлы
- ✅ PII masking работает
- ✅ Structured logging (JSON)

---

### 2.7 Error Handling Setup

**Цель:** Создать централизованную обработку ошибок

#### Подзадачи:
- [ ] **2.7.1** Создать custom exceptions
  ```typescript
  // src/core/exceptions/business.exception.ts
  export class BusinessException extends HttpException {
    constructor(message: string, statusCode: number = 400) {
      super(
        {
          success: false,
          error: message,
          timestamp: new Date().toISOString(),
        },
        statusCode,
      );
    }
  }
  
  export class ValidationException extends BusinessException {
    constructor(errors: ValidationError[]) {
      super('Validation failed', 400);
    }
  }
  ```
  
- [ ] **2.7.2** Создать error codes enum
  ```typescript
  // src/core/constants/error-codes.ts
  export enum ErrorCode {
    // Auth
    INVALID_CREDENTIALS = 'AUTH_001',
    EMAIL_NOT_VERIFIED = 'AUTH_002',
    TOKEN_EXPIRED = 'AUTH_003',
    
    // User
    USER_NOT_FOUND = 'USER_001',
    EMAIL_ALREADY_EXISTS = 'USER_002',
    
    // ...
  }
  ```
  
- [ ] **2.7.3** Обновить Exception Filter для custom exceptions

#### Критерии приемки:
- ✅ Custom exceptions работают
- ✅ Error codes используются
- ✅ User-friendly error messages
- ✅ Technical details только в логах

---

## Задача 3: Security Foundation

**Приоритет:** 🔴 CRITICAL  
**Время:** 2-3 дня

### 3.1 Helmet.js Configuration

**Цель:** Настроить security headers

#### Подзадачи:
- [ ] **3.1.1** Установить Helmet
  ```bash
  pnpm add helmet
  ```
  
- [ ] **3.1.2** Настроить в main.ts
  ```typescript
  import helmet from 'helmet';
  
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  ```
  
- [ ] **3.1.3** Проверить security headers
  ```bash
  curl -I http://localhost:3000/api/health
  # Verify headers:
  # X-Frame-Options: DENY
  # X-Content-Type-Options: nosniff
  # Strict-Transport-Security: max-age=31536000
  ```

#### Критерии приемки:
- ✅ Helmet настроен
- ✅ Security headers присутствуют
- ✅ CSP configured
- ✅ HSTS enabled

---

### 3.2 CORS Setup with Whitelist

**Цель:** Настроить CORS для production domains

#### Подзадачи:
- [ ] **3.2.1** Создать CORS configuration
  ```typescript
  // src/config/cors.config.ts
  export const corsConfig: CorsOptions = {
    origin: (origin, callback) => {
      const whitelist = [
        'https://hummii.ca',
        'https://www.hummii.ca',
        'https://admin.hummii.ca',
      ];
      
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  ```
  
- [ ] **3.2.2** Применить в main.ts
  ```typescript
  app.enableCors(corsConfig);
  ```
  
- [ ] **3.2.3** Добавить whitelist в environment variables
  ```bash
  CORS_ORIGINS=https://hummii.ca,https://www.hummii.ca
  ```

#### Security Requirements:
- [ ] No wildcard (`*`) in production
- [ ] credentials: true for cookies
- [ ] Origin validation strict

#### Критерии приемки:
- ✅ CORS whitelist работает
- ✅ Credentials enabled
- ✅ Preflight requests handled
- ✅ Invalid origins blocked

---

### 3.3 Rate Limiting Configuration

**Цель:** Защита от brute-force и DDoS

#### Подзадачи:
- [ ] **3.3.1** Установить @nestjs/throttler
  ```bash
  pnpm add @nestjs/throttler
  ```
  
- [ ] **3.3.2** Настроить global rate limiting
  ```typescript
  // src/app.module.ts
  @Module({
    imports: [
      ThrottlerModule.forRoot([
        {
          ttl: 60000, // 1 minute
          limit: 100, // 100 requests
        },
      ]),
    ],
  })
  ```
  
- [ ] **3.3.3** Создать custom rate limiters для auth
  ```typescript
  // src/auth/auth.controller.ts
  @Controller('auth')
  @UseGuards(ThrottlerGuard)
  export class AuthController {
    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 req/min
    async login() {}
    
    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 req/hour
    async register() {}
  }
  ```
  
- [ ] **3.3.4** Настроить Redis для distributed rate limiting
  ```typescript
  ThrottlerModule.forRoot({
    storage: new ThrottlerStorageRedisService(redisClient),
  })
  ```

#### Rate Limits:
- Global: 100 req/min per IP
- Auth login: 5 req/min
- Auth register: 3 req/hour
- Password reset: 3 req/hour
- Profile update: 5 req/hour
- Order creation: 10 req/hour
- Chat messages: 20 req/min
- File uploads: 10 req/hour

#### Критерии приемки:
- ✅ Global rate limiting works
- ✅ Auth endpoints protected
- ✅ Redis storage working
- ✅ Rate limit headers returned

---

### 3.4 Basic Input Validation Setup

**Цель:** Защита от injection attacks

#### Подзадачи:
- [ ] **3.4.1** Настроить ValidationPipe globally
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown
      transform: true, // Auto type conversion
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
  ```
  
- [ ] **3.4.2** Создать custom validators
  ```typescript
  // src/shared/validators/canadian-postal-code.validator.ts
  @ValidatorConstraint({ name: 'canadianPostalCode', async: false })
  export class CanadianPostalCodeValidator implements ValidatorConstraintInterface {
    validate(value: string) {
      const regex = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
      return regex.test(value);
    }
    
    defaultMessage() {
      return 'Invalid Canadian postal code format (e.g., A1A 1A1)';
    }
  }
  
  // Usage in DTO:
  @Validate(CanadianPostalCodeValidator)
  postalCode: string;
  ```
  
- [ ] **3.4.3** Создать validators для:
  - Canadian postal code
  - Canadian phone number (+1XXXXXXXXXX)
  - SIN number (9 digits, Luhn algorithm)
  - Strong password
  - Email format

#### Security Requirements:
- [ ] All DTOs use class-validator
- [ ] whitelist: true (prevent mass assignment)
- [ ] forbidNonWhitelisted: true
- [ ] Custom validators for business logic

#### Критерии приемки:
- ✅ Validation pipe работает globally
- ✅ Unknown properties stripped
- ✅ Custom validators работают
- ✅ Error messages user-friendly

---

### 3.5 Environment Variables Encryption

**Цель:** Защита secrets в репозитории

#### Подзадачи:
- [ ] **3.5.1** Создать script для генерации сильных secrets
  ```typescript
  // scripts/generate-secrets.ts
  import * as crypto from 'crypto';
  
  function generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  console.log('JWT_SECRET=' + generateSecret(32));
  console.log('JWT_REFRESH_SECRET=' + generateSecret(32));
  console.log('ENCRYPTION_KEY=' + generateSecret(32));
  ```
  
- [ ] **3.5.2** Проверить .gitignore
  ```bash
  # .gitignore
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
  secrets/
  ```
  
- [ ] **3.5.3** Создать env validation на startup
  ```typescript
  // src/config/env.validation.ts
  export function validateEnvironment(config: Record<string, unknown>) {
    const schema = Joi.object({
      JWT_SECRET: Joi.string().min(32).required(),
      JWT_REFRESH_SECRET: Joi.string().min(32).required(),
      DATABASE_URL: Joi.string().required(),
      // ... остальные
    });
    
    const { error, value } = schema.validate(config);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return value;
  }
  ```
  
- [ ] **3.5.4** Документировать процесс генерации secrets
  ```markdown
  # Secrets Generation
  
  1. Run: `pnpm run generate:secrets`
  2. Copy output to `.env`
  3. Never commit `.env` to git
  4. Use different secrets for dev/staging/prod
  ```

#### Security Requirements:
- [ ] JWT secrets minimum 256 bits (32 bytes)
- [ ] Secrets never in code
- [ ] `.env` in `.gitignore`
- [ ] Validation on startup
- [ ] Different secrets per environment

#### Критерии приемки:
- ✅ Script генерирует сильные secrets
- ✅ `.env` не в git
- ✅ Validation works on startup
- ✅ Documentation complete

---

### 3.6 SSL/TLS Setup for Production

**Цель:** Настроить HTTPS для production

#### Подзадачи:
- [ ] **3.6.1** Документировать SSL setup
  ```markdown
  # SSL/TLS Setup
  
  ## Development
  - Use HTTP (localhost only)
  
  ## Production
  - Use Let's Encrypt (free)
  - Auto-renewal with certbot
  - TLS 1.3 only
  - Strong cipher suites
  ```
  
- [ ] **3.6.2** Создать nginx configuration
  ```nginx
  # docker/nginx/nginx.conf
  server {
    listen 443 ssl http2;
    server_name api.hummii.ca;
    
    ssl_certificate /etc/letsencrypt/live/api.hummii.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.hummii.ca/privkey.pem;
    
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    location / {
      proxy_pass http://api:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
  
  # Redirect HTTP to HTTPS
  server {
    listen 80;
    server_name api.hummii.ca;
    return 301 https://$server_name$request_uri;
  }
  ```
  
- [ ] **3.6.3** Создать certbot renewal script
  ```bash
  #!/bin/bash
  # scripts/renew-certs.sh
  certbot renew --nginx
  systemctl reload nginx
  ```
  
- [ ] **3.6.4** Настроить cron для auto-renewal
  ```bash
  # Run daily at 2am
  0 2 * * * /app/scripts/renew-certs.sh >> /var/log/certbot-renew.log 2>&1
  ```

#### Security Requirements:
- [ ] TLS 1.3 only
- [ ] Strong cipher suites
- [ ] HSTS header enabled
- [ ] Auto-renewal configured
- [ ] Certificate monitoring

#### Критерии приемки:
- ✅ nginx configuration готов
- ✅ SSL setup документирован
- ✅ Auto-renewal script создан
- ✅ HSTS enabled

---

## Deliverables

### Must Have
- [x] Working Docker environment with all services
- [x] PostgreSQL + PostGIS configured and running
- [x] Redis configured and running
- [x] NestJS project structure created
- [x] Prisma setup with initial schema
- [x] Environment variables structure
- [x] Basic security middleware (Helmet, CORS, Rate Limiting)
- [x] Logging configured with PII masking
- [x] Error handling setup
- [x] CI/CD pipeline (GitHub Actions)
- [x] Documentation complete

### Quality Gates
- [ ] All services start with `docker compose up -d`
- [ ] Database migrations run successfully
- [ ] Environment validation works
- [ ] Secrets not in git history
- [ ] Logging works with PII masking
- [ ] Rate limiting functional
- [ ] CORS configured correctly
- [ ] Security headers present
- [ ] Documentation reviewed

### Security Checklist
- [ ] `.env` in `.gitignore`
- [ ] Strong secrets generated (32+ bytes)
- [ ] Database SSL/TLS enabled
- [ ] Redis password set
- [ ] Rate limiting configured
- [ ] Helmet.js active
- [ ] CORS whitelist configured
- [ ] Input validation global
- [ ] PII masking in logs
- [ ] SSL/TLS documented

---

## Testing Strategy

### Infrastructure Tests
```bash
# Test Docker services
docker compose ps
docker compose logs api
docker compose exec postgres psql -U hummii -c "SELECT version();"
docker compose exec redis redis-cli ping

# Test database connection
pnpm run prisma:studio

# Test API health
curl http://localhost:3000/api/health
```

### Security Tests
```bash
# Test rate limiting
ab -n 200 -c 10 http://localhost:3000/api/health

# Test CORS
curl -H "Origin: https://evil.com" http://localhost:3000/api/health

# Test security headers
curl -I http://localhost:3000/api/health
```

### Validation Tests
```typescript
// test/validation.e2e-spec.ts
describe('Validation', () => {
  it('should strip unknown properties', () => {
    // Test whitelist: true
  });
  
  it('should reject invalid data', () => {
    // Test forbidNonWhitelisted: true
  });
  
  it('should validate Canadian postal code', () => {
    // Test custom validator
  });
});
```

---

## Troubleshooting

### Issue: Docker services not starting
**Solution:**
```bash
docker compose down -v
docker compose up -d --build
docker compose logs -f
```

### Issue: Database connection refused
**Solution:**
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U hummii -c "SELECT 1;"
```

### Issue: Prisma Client generation fails
**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

### Issue: Environment variables not loading
**Solution:**
```bash
# Check .env exists
ls -la .env

# Validate .env format
cat .env | grep -v "^#" | grep -v "^$"

# Restart with fresh env
docker compose down
docker compose up -d
```

---

## Next Steps

После завершения Phase 0:
1. ✅ Verify all deliverables complete
2. ✅ Run security checklist
3. ✅ Test all infrastructure components
4. ✅ Review documentation
5. ➡️ **Proceed to Phase 1: Authentication & Authorization**

---

**Last Updated:** January 2025  
**Status:** Ready to Start  
**Owner:** Backend Team
