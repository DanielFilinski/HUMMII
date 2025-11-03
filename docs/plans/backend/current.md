# Текущие Задачи - Hummii Backend

**Обновлено:** 3 января 2025  
**Статус проекта:** 18% (2.7/15 фаз завершено)  
**Текущая фаза:** Phase 2 (User Management) - 30% выполнено

---

## 🎯 Приоритет: КРИТИЧНО

### Phase 2 должна быть завершена перед Phase 3!

**Причина:** Orders Module (Phase 3) зависит от:
- ✅ Профилей подрядчиков
- ✅ Геолокации и поиска по радиусу
- ✅ Системы загрузки файлов
- ✅ Верификации через Stripe Identity

---

## 📋 Ближайшие Задачи (2 недели)

### 🔴 Неделя 1: Завершение Phase 2 - Базовые Функции

#### 1. Система Загрузки Файлов (Cloudflare R2 + Images) - 2 дня
**Статус:** ⚠️ Модуль существует, но не интегрирован  
**Файл:** `api/src/shared/upload/` (skeleton exists)

**Почему Cloudflare для MVP:**
- ✅ **Экономия 80-90%** на storage costs (бесплатный egress)
- ✅ **Автоматическая оптимизация** - WebP/AVIF, resize, compress (Cloudflare Images)
- ✅ **Встроенный Global CDN** - быстрая раздача по всему миру
- ✅ **S3-совместимый API** (R2) - простая миграция на AWS позже если нужно
- ✅ **Меньше кода** - не нужен sharp, не нужна Lambda для image processing

**Архитектура:**
- **Cloudflare R2** - для документов верификации (приватные файлы)
- **Cloudflare Images** - для аватаров и портфолио (публичные, с auto-optimization)

**Задачи:**
- [ ] Настроить Cloudflare account и получить credentials
- [ ] Создать R2 bucket (для приватных документов)
- [ ] Настроить Cloudflare Images (для публичных изображений)
- [ ] Создать image variants:
  - `avatar` (300x300, fit=cover)
  - `portfolio` (800x600, fit=scale-down)
  - `thumbnail` (150x150, fit=cover)
- [ ] Установить зависимости: `@aws-sdk/client-s3` (R2 compatible)
- [ ] Реализовать dual upload service:
  - `CloudflareR2Service` - для документов (S3-compatible API)
  - `CloudflareImagesService` - для изображений (native API)
- [ ] Добавить валидацию MIME типов (images: jpeg, png, webp)
- [ ] Добавить endpoint `POST /users/me/avatar`
- [ ] Реализовать удаление старого аватара при загрузке нового
- [ ] Написать unit тесты для upload services
- [ ] Написать E2E тесты для avatar upload

**Детальная инструкция:** [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md#file-upload-system)

**Dependencies:**
- AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`) - для R2
- Multer для multipart/form-data
- Form-data для Cloudflare Images API
- `.env` variables:
  ```bash
  # Cloudflare R2 (S3-compatible)
  R2_ACCOUNT_ID=your_account_id
  R2_ACCESS_KEY_ID=your_access_key
  R2_SECRET_ACCESS_KEY=your_secret_key
  R2_BUCKET_NAME=hummii-documents
  R2_ENDPOINT=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
  
  # Cloudflare Images
  CF_ACCOUNT_ID=your_account_id
  CF_ACCOUNT_HASH=your_account_hash
  CF_IMAGES_TOKEN=your_images_api_token
  ```

**Cost Comparison (1000 users, 5GB storage, 100GB egress/month):**
```
AWS S3:        ~$50-100/month
Cloudflare:    ~$5-10/month  ✅ Экономия 80-90%
```

---

#### 2. Профиль Подрядчика (Contractor Profile) - 2 дня
**Статус:** ❌ Не реализовано

**Задачи:**
- [ ] Обновить Prisma schema (добавить поля к ContractorProfile):
  - `bio: String?` (max 500 chars)
  - `services: String[]` (array of service descriptions)
  - `hourlyRate: Decimal?`
  - `yearsOfExperience: Int?`
  - `languages: String[]` (e.g., ["EN", "FR"])
- [ ] Run migration: `pnpm prisma migrate dev`
- [ ] Создать DTO: `UpdateContractorProfileDto`
- [ ] Реализовать endpoint `PATCH /users/me/contractor`
- [ ] Добавить валидацию (class-validator):
  - Bio max 500 characters
  - Hourly rate min $10, max $500
  - Experience min 0, max 50 years
- [ ] Написать unit тесты
- [ ] Написать E2E тесты

**Детальная инструкция:** [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md#contractor-profile)

---

### 🔴 Неделя 2: Завершение Phase 2 - Продвинутые Функции

#### 3. Портфолио (Portfolio Management) - 2 дня
**Статус:** ❌ Не реализовано

**Задачи:**
- [ ] Создать Prisma model `Portfolio`:
  ```prisma
  model Portfolio {
    id          String   @id @default(cuid())
    userId      String
    title       String
    description String?
    imageUrl    String
    status      PortfolioStatus @default(PENDING)
    createdAt   DateTime @default(now())
    user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  
  enum PortfolioStatus {
    PENDING
    APPROVED
    REJECTED
  }
  ```
- [ ] Run migration
- [ ] Создать DTOs: `CreatePortfolioDto`, `UpdatePortfolioDto`
- [ ] Реализовать endpoints:
  - `POST /users/me/portfolio` - Add item (max 10 per user)
  - `GET /users/me/portfolio` - List my portfolio
  - `PATCH /users/me/portfolio/:id` - Update item
  - `DELETE /users/me/portfolio/:id` - Delete item
- [ ] Добавить guard: max 10 portfolio items per contractor
- [ ] Интегрировать с Cloudflare Images (auto-optimization, CDN)
- [ ] Написать unit тесты
- [ ] Написать E2E тесты

**Детальная инструкция:** [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md#portfolio-management)

---

#### 4. Геолокация и Поиск (PostGIS) - 2 дня
**Статус:** ❌ Не реализовано

**Задачи:**
- [ ] Убедиться что PostGIS extension включен (уже в Docker Compose)
- [ ] Обновить Prisma schema:
  ```prisma
  model ContractorProfile {
    // ... existing fields
    latitude   Float?
    longitude  Float?
    location   String? // Address text
    fuzzyLat   Float?  // Privacy: ±500m offset
    fuzzyLon   Float?
  }
  ```
- [ ] Создать raw SQL query для radius search:
  ```sql
  ST_DWithin(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    $3 * 1000 -- radius in km → meters
  )
  ```
- [ ] Реализовать endpoints:
  - `PATCH /users/me/location` - Update location (auto-generate fuzzy coords)
  - `GET /users/contractors/nearby?lat=X&lon=Y&radius=10` - Search contractors
- [ ] Реализовать fuzzy location logic (±500m random offset for privacy)
- [ ] Добавить кэширование radius search (Redis, TTL 5 min)
- [ ] Написать unit тесты
- [ ] Написать E2E тесты

**Детальная инструкция:** [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md#geolocation)

**Dependencies:**
- PostGIS extension (уже в Docker Compose)
- Prisma raw queries для геопространственных запросов

---

#### 5. Верификация (Stripe Identity) - 1 день
**Статус:** ❌ Не реализовано

**Задачи:**
- [ ] Настроить Stripe Identity в dashboard
- [ ] Установить Stripe SDK: `pnpm add stripe`
- [ ] Создать verification service
- [ ] Реализовать endpoints:
  - `POST /verification/create` - Create verification session (return URL)
  - `GET /verification/status` - Get verification status
- [ ] Настроить webhook handler: `verification.session.completed`
- [ ] Обновить `ContractorProfile.isVerified` при успешной верификации
- [ ] Добавить "Verified" badge logic (frontend будет читать `isVerified`)
- [ ] Настроить expiration (2 года) и reminder logic
- [ ] Написать unit тесты (mock Stripe SDK)
- [ ] Написать E2E тесты

**Детальная инструкция:** [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md#verification-stripe-identity)

**Dependencies:**
- Stripe account + Identity enabled
- `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

---

#### 6. Переключение Ролей (Role Switching) - 1 день
**Статус:** ❌ Не реализовано

**Задачи:**
- [ ] Реализовать endpoint `POST /users/me/switch-role`
- [ ] Логика:
  - CLIENT → CONTRACTOR: Create `ContractorProfile`, add role
  - CONTRACTOR → CLIENT: Keep `ContractorProfile` (don't delete), add CLIENT role
  - User can have both roles simultaneously
- [ ] Добавить rate limiting (max 1 switch per day)
- [ ] Добавить audit logging
- [ ] Написать unit тесты
- [ ] Написать E2E тесты

**Детальная инструкция:** [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md#role-switching)

---

#### 7. Шифрование PII (AES-256) - 1 день
**Статус:** ❌ Не реализовано (PIPEDA requirement)

**Задачи:**
- [ ] Создать encryption utility (`api/src/common/utils/encryption.util.ts`)
- [ ] Реализовать AES-256-CBC encryption/decryption
- [ ] Зашифровать чувствительные поля:
  - User phone numbers
  - User addresses (если добавим)
  - Contractor location (точные координаты, не fuzzy)
- [ ] Добавить `.env` variable: `ENCRYPTION_KEY` (256-bit)
- [ ] Написать unit тесты

**Детальная инструкция:** [../../security-checklist.md](./security-checklist.md#data-encryption)

**ВАЖНО:** Encryption key должен быть сгенерирован:
```bash
openssl rand -hex 32
```

---

## 📊 Прогресс Phase 2

```
✅ Basic Profile Management (30%)
├── ✅ GET /users/me
├── ✅ PATCH /users/me
├── ✅ GET /users/me/export (PIPEDA)
└── ✅ DELETE /users/me (PIPEDA)

⚠️ Advanced Features (70% remaining)
├── ❌ File Upload System (Cloudflare R2 + Images) - 2 days
├── ❌ Contractor Profile - 2 days
├── ❌ Portfolio Management - 2 days
├── ❌ Geolocation & Radius Search - 2 days
├── ❌ Stripe Identity Verification - 1 day
├── ❌ Role Switching - 1 day
└── ❌ PII Encryption - 1 day

Total: ~10 working days (2 weeks)
```

---

## 🔗 Важные Ссылки

### Детальная Документация
- [Phase 2 Unified Plan](./tasks/Phase%202/phase-2-unified.md) - Полный план Phase 2
- [Phase 3 Tasks](./tasks/Phase%203/phase-3-tasks.md) - Следующая фаза (Orders Module)
- [PROJECT_STATUS.md](./tasks/PROJECT_STATUS.md) - Общий статус проекта

### Безопасность и Соответствие
- [Security Checklist](./security-checklist.md) - PIPEDA, шифрование, best practices
- [Security Compliance](./../../../.claude/core/security-compliance.md) - PIPEDA детали

### Инструкции и Правила
- [NestJS Guide](./../../../.claude/backend/nestjs-guide.md) - NestJS best practices
- [Cursor Rules](./../../../.cursor/rules/nest.mdc) - Coding standards

### Tech Stack
- [Stack Documentation](./../../Stack_EN.md) - Полный tech stack

---

## ⚠️ Критичные Проблемы

### 1. HTTP-only Cookies (Phase 1) - БЕЗОПАСНОСТЬ
**Статус:** ⚠️ Не исправлено  
**Severity:** MEDIUM  
**Дедлайн:** До production deployment (Phase 15)

**Проблема:** Токены возвращаются в response body (localStorage), уязвимы к XSS.

**Решение:** Использовать HTTP-only cookies
```typescript
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
});
```

**Файл:** `api/src/auth/auth.controller.ts` (login, register methods)

---

### 2. Phase 2 Блокирует Phase 3
**Статус:** 🔴 КРИТИЧНО  
**Severity:** HIGH

**Проблема:** Orders Module (Phase 3) не может быть начат без:
- Contractor profiles
- Geolocation
- Portfolio (для отображения в proposals)

**Решение:** Завершить Phase 2 в течение 2 недель.

---

## 🎯 После Phase 2: Что Дальше?

### Phase 3: Orders Module (2 недели)
**Статус:** 📋 Ready to implement  
**Документация:** [Phase 3/phase-3-tasks.md](./tasks/Phase%203/phase-3-tasks.md)

**Основные задачи:**
- Order lifecycle management (7 statuses)
- Proposal system (contractors bid)
- Search & filtering (text, category, location, price)
- Geospatial radius search (PostGIS)
- Status transition validation
- Authorization guards
- Rate limiting
- Notifications on status changes

**Endpoints:** 13 endpoints
**Duration:** 2 weeks
**Dependencies:** ✅ Phase 2 complete

---

## 📅 Timeline

```
Week 5 (Current):
└── File Upload (Cloudflare R2 + Images) + Contractor Profile + Portfolio

Week 6:
└── Geolocation + Verification + Role Switching + PII Encryption

Week 7-8:
└── Phase 3: Orders Module (Part 1)

Week 9-10:
└── Phase 3: Orders Module (Part 2)
```

---

## ✅ Критерии Завершения Phase 2

- [ ] Все 6 основных задач реализованы
- [ ] Unit тесты написаны и проходят (coverage >80%)
- [ ] E2E тесты написаны и проходят
- [ ] Swagger документация обновлена
- [ ] Security audit пройден (no vulnerabilities)
- [ ] Все endpoints протестированы вручную
- [ ] Миграции Prisma применены и работают
- [ ] Cloudflare R2 bucket настроен и работает
- [ ] Cloudflare Images настроен с variants
- [ ] Stripe Identity настроен и работает
- [ ] PostGIS queries работают корректно
- [ ] COMPLETED.md обновлен
- [ ] Commit messages написаны (conventional commits)

---

## 🚀 Как Начать

### 1. Подготовка Окружения
```bash
# Install dependencies (if needed)
cd api && pnpm install

# Start development environment
docker compose up -d

# Check services health
docker compose ps
```

### 2. Создать Feature Branch
```bash
git checkout -b feature/phase-2-complete
```

### 3. Начать с Задачи #1 (File Upload)
```bash
# Read detailed instructions
cat docs/plans/backend/tasks/Phase\ 2/phase-2-unified.md

# Start implementation
code api/src/shared/upload/
```

### 4. Тестировать Постоянно
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type check
pnpm type-check

# Lint
pnpm lint
```

---

**Вопросы?** Смотрите [PROJECT_STATUS.md](./tasks/PROJECT_STATUS.md) или детальные инструкции в [Phase 2/phase-2-unified.md](./tasks/Phase%202/phase-2-unified.md)

---

## 📦 Cloudflare Setup Guide

### 1. Получить Cloudflare Credentials

#### R2 (Object Storage)
```bash
# 1. Зайти в Cloudflare Dashboard → R2
# 2. Create bucket: hummii-documents
# 3. Manage R2 API Tokens → Create API Token
# 4. Copy: Access Key ID, Secret Access Key, Account ID
```

#### Cloudflare Images
```bash
# 1. Cloudflare Dashboard → Images
# 2. Enable Cloudflare Images ($5/month, up to 100k images)
# 3. API Tokens → Create Token (scope: Images - Edit)
# 4. Copy: Account ID, Account Hash, API Token
```

### 2. Настроить Image Variants

```bash
# Cloudflare Dashboard → Images → Variants → Create Variant
# 
# Variant 1: avatar
# - Width: 300px, Height: 300px
# - Fit: cover
# - Format: auto (WebP/AVIF)
#
# Variant 2: portfolio  
# - Width: 800px, Height: 600px
# - Fit: scale-down
# - Format: auto
#
# Variant 3: thumbnail
# - Width: 150px, Height: 150px
# - Fit: cover
# - Format: auto
```

### 3. Примеры Кода

#### Cloudflare R2 Service (S3-Compatible)

```typescript
// api/src/shared/upload/cloudflare-r2.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareR2Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
    
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME');
  }

  async uploadFile(
    file: Express.Multer.File,
    key: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    
    // R2 public URL (if bucket is public)
    return `https://pub-${this.bucketName}.r2.dev/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
```

#### Cloudflare Images Service

```typescript
// api/src/shared/upload/cloudflare-images.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

@Injectable()
export class CloudflareImagesService {
  private readonly accountId: string;
  private readonly accountHash: string;
  private readonly apiToken: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>('CF_ACCOUNT_ID');
    this.accountHash = this.configService.get<string>('CF_ACCOUNT_HASH');
    this.apiToken = this.configService.get<string>('CF_IMAGES_TOKEN');
  }

  async uploadImage(
    file: Express.Multer.File,
    metadata?: Record<string, string>,
  ): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          ...formData.getHeaders(),
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (!data.success) {
      throw new BadRequestException('Failed to upload image to Cloudflare');
    }

    return {
      id: data.result.id,
      url: this.getImageUrl(data.result.id, 'public'),
    };
  }

  async deleteImage(imageId: string): Promise<void> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    const data = await response.json();

    if (!data.success) {
      throw new BadRequestException('Failed to delete image from Cloudflare');
    }
  }

  getImageUrl(imageId: string, variant: 'avatar' | 'portfolio' | 'thumbnail' | 'public' = 'public'): string {
    return `https://imagedelivery.net/${this.accountHash}/${imageId}/${variant}`;
  }
}
```

#### Upload Module Integration

```typescript
// api/src/shared/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { CloudflareImagesService } from './cloudflare-images.service';
import { UploadService } from './upload.service';

@Module({
  providers: [
    CloudflareR2Service,
    CloudflareImagesService,
    UploadService,
  ],
  exports: [UploadService],
})
export class UploadModule {}
```

```typescript
// api/src/shared/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { CloudflareImagesService } from './cloudflare-images.service';

@Injectable()
export class UploadService {
  constructor(
    private r2Service: CloudflareR2Service,
    private imagesService: CloudflareImagesService,
  ) {}

  // For public images (avatars, portfolio)
  async uploadPublicImage(file: Express.Multer.File, userId: string) {
    return this.imagesService.uploadImage(file, {
      userId,
      uploadedAt: new Date().toISOString(),
    });
  }

  // For private documents (verification docs)
  async uploadPrivateDocument(file: Express.Multer.File, key: string) {
    return this.r2Service.uploadFile(file, key);
  }

  async deletePublicImage(imageId: string) {
    return this.imagesService.deleteImage(imageId);
  }

  async deletePrivateDocument(key: string) {
    return this.r2Service.deleteFile(key);
  }

  getImageUrl(imageId: string, variant: 'avatar' | 'portfolio' | 'thumbnail' = 'avatar') {
    return this.imagesService.getImageUrl(imageId, variant);
  }
}
```

#### Usage in Controller

```typescript
// api/src/users/users.controller.ts
import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadService } from '../shared/upload/upload.service';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Delete old avatar if exists
    if (user.avatarId) {
      await this.uploadService.deletePublicImage(user.avatarId);
    }

    // Upload new avatar
    const { id, url } = await this.uploadService.uploadPublicImage(file, user.id);

    // Update user in database
    await this.usersService.update(user.id, {
      avatarId: id,
      avatarUrl: this.uploadService.getImageUrl(id, 'avatar'),
    });

    return {
      avatarId: id,
      avatarUrl: this.uploadService.getImageUrl(id, 'avatar'),
      thumbnailUrl: this.uploadService.getImageUrl(id, 'thumbnail'),
    };
  }
}
```

### 4. Environment Variables

```bash
# .env
# Cloudflare R2 (for private documents)
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=hummii-documents

# Cloudflare Images (for public images)
CF_ACCOUNT_ID=your_account_id_here
CF_ACCOUNT_HASH=your_account_hash_here
CF_IMAGES_TOKEN=your_api_token_here
```

### 5. Dependencies

```bash
# Install required packages
cd api
pnpm add @aws-sdk/client-s3 form-data
pnpm add -D @types/multer
```

### 6. Migration Path (если потребуется AWS позже)

```typescript
// Просто меняем endpoint в CloudflareR2Service:
// FROM: https://${accountId}.r2.cloudflarestorage.com
// TO:   https://s3.amazonaws.com (или s3.region.amazonaws.com)

// Cloudflare Images → AWS S3:
// Нужно добавить image processing (sharp) и CDN (CloudFront)
```

---

**Последнее обновление:** 3 января 2025 (добавлен Cloudflare для MVP)  
**Следующий review:** После завершения Phase 2

