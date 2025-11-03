# Phase 2: User Management Module - Unified Comprehensive Plan

**Duration:** Week 5-6 (2 weeks)  
**Priority:** 🔴 CRITICAL (MVP)  
**Status:** Ready to Start  
**Dependencies:** Phase 0 ✅, Phase 1 ✅

---

## 📋 Overview

Phase 2 фокусируется на создании полноценной системы управления пользователями с профилями клиентов и исполнителей, портфолио, геолокацией и защитой персональных данных (PIPEDA compliance).

**Ключевые deliverables:**
- User profile management (CLIENT + CONTRACTOR roles)
- Portfolio system for contractors (max 10 items)
- Geolocation with privacy (PostGIS + fuzzy location ±500m)
- PII protection (field-level encryption, audit logging)
- File upload security (avatars, portfolio, licenses)
- Stripe Identity verification integration
- License management for contractors
- Role switching (CLIENT ↔ CONTRACTOR)

---

## 🎯 Task Breakdown

### 1. Users Module Setup (Day 1)

#### 1.1 Create Users Module Structure

**Файлы для создания:**
```
api/src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── update-profile.dto.ts
│   ├── update-contractor-profile.dto.ts
│   ├── create-contractor-profile.dto.ts
│   ├── add-portfolio-item.dto.ts
│   ├── add-service.dto.ts
│   ├── add-license.dto.ts
│   └── update-location.dto.ts
├── entities/
│   ├── user.entity.ts
│   ├── profile.entity.ts
│   └── contractor.entity.ts
├── decorators/
│   └── current-user.decorator.ts
└── guards/
    ├── profile-owner.guard.ts
    └── contractor-verified.guard.ts
```

**Задача 1.1.1:** Создать базовую структуру модуля
- [ ] `nest g module users`
- [ ] `nest g controller users`
- [ ] `nest g service users`
- [ ] Импортировать PrismaModule, JwtModule, ThrottlerModule
- [ ] Подключить к AppModule

**Задача 1.1.2:** Создать CurrentUser decorator
```typescript
// api/src/users/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Задача 1.1.3:** Создать Guards
```typescript
// api/src/users/guards/profile-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProfileOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = request.params.userId || request.params.id;

    if (user.userId !== userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}

// api/src/users/guards/contractor-verified.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ContractorVerifiedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== 'CONTRACTOR') {
      throw new ForbiddenException('Only contractors can access this resource');
    }

    // Optional: Check if contractor is verified
    // const contractor = await this.prisma.contractor.findUnique({...});
    // if (!contractor?.isVerified) throw new ForbiddenException('Contractor not verified');

    return true;
  }
}
```

**Задача 1.1.4:** Обновить Prisma schema
```prisma
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String
  role                UserRole  @default(CLIENT)
  isVerified          Boolean   @default(false)
  isIdentityVerified  Boolean   @default(false)
  verificationDate    DateTime?
  failedLoginAttempts Int       @default(0)
  lastFailedLogin     DateTime?
  accountLockedUntil  DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  profile             Profile?
  contractor          Contractor?
  refreshTokens       RefreshToken[]
  emailVerifications  EmailVerification[]
  auditLogs           AuditLog[]
  
  @@map("users")
}

model Profile {
  id          String   @id @default(uuid())
  userId      String   @unique
  firstName   String?
  lastName    String?
  phone       String?  @unique
  avatar      String?
  bio         String?
  location    Unsupported("geography(Point,4326)")? // PostGIS
  address     String?
  city        String?
  province    String?
  postalCode  String?
  country     String   @default("Canada")
  language    String?  // 'en' | 'fr'
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([location], type: Gist)
  @@map("profiles")
}

model Contractor {
  id                String              @id @default(uuid())
  userId            String              @unique
  businessName      String?
  description       String?             @db.Text
  experience        Int                 @default(0) // years
  hourlyRate        Decimal?            @db.Decimal(10, 2)
  availability      ContractorAvailability @default(AVAILABLE)
  isVerified        Boolean             @default(false)
  verificationDate  DateTime?
  portfolioCount    Int                 @default(0)
  totalOrders       Int                 @default(0)
  rating            Decimal             @default(0) @db.Decimal(3, 2)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  portfolio         Portfolio[]
  licenses          ContractorLicense[]
  categories        ContractorCategory[]
  services          ContractorService[]
  
  @@map("contractors")
}

model Portfolio {
  id            String     @id @default(uuid())
  contractorId  String
  title         String
  description   String?    @db.Text
  imageUrl      String
  order         Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  @@map("portfolio")
  @@index([contractorId])
}

model ContractorLicense {
  id            String     @id @default(uuid())
  contractorId  String
  type          String     // e.g., "Electrician License", "Plumber License"
  number        String
  fileUrl       String?
  issuedBy      String
  issuedDate    DateTime
  expiryDate    DateTime?
  isVerified    Boolean    @default(false)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  @@map("contractor_licenses")
  @@index([contractorId])
}

model ContractorCategory {
  id            String     @id @default(uuid())
  contractorId  String
  categoryId    String
  isPrimary     Boolean    @default(false)
  createdAt     DateTime   @default(now())
  
  contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  @@unique([contractorId, categoryId])
  @@map("contractor_categories")
  @@index([contractorId])
  @@index([categoryId])
}

model ContractorService {
  id            String     @id @default(uuid())
  contractorId  String
  name          String
  description   String?    @db.Text
  price         Decimal?   @db.Decimal(10, 2)
  priceType     PriceType  @default(HOURLY)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  
  @@map("contractor_services")
  @@index([contractorId])
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // "PROFILE_UPDATED", "AVATAR_UPLOADED", etc.
  resource  String   // "USER", "PORTFOLIO", "SERVICE"
  metadata  Json?    // Additional data (changes made)
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("audit_logs")
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

enum UserRole {
  CLIENT
  CONTRACTOR
  ADMIN
}

enum ContractorAvailability {
  AVAILABLE
  BUSY
  UNAVAILABLE
}

enum PriceType {
  HOURLY
  FIXED
  PER_PROJECT
}
```

**Задача 1.1.5:** Применить миграцию
```bash
npx prisma migrate dev --name add_user_management_models
npx prisma generate
```

**Acceptance Criteria:**
- ✅ Users module создан и подключен
- ✅ CurrentUser decorator работает с JwtAuthGuard
- ✅ Guards созданы (ProfileOwner, ContractorVerified)
- ✅ Prisma schema обновлена
- ✅ Миграция применена
- ✅ TypeScript types сгенерированы
- ✅ Структура папок соответствует NestJS best practices

---

### 2. User Profile Management (Day 1-2)

#### 2.1 Get Current User Profile

**Задача 2.1.1:** Endpoint GET /api/v1/users/me
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get current user profile' })
@ApiResponse({ status: 200, type: UserDto })
async getCurrentUser(@CurrentUser() user: JwtPayload) {
  return this.usersService.findById(user.userId);
}
```

**Задача 2.1.2:** UsersService.findById()
```typescript
async findById(userId: string): Promise<UserProfileResponse> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      contractor: {
        include: {
          portfolio: {
            orderBy: { order: 'asc' },
            take: 10,
          },
          categories: true,
          services: true,
          licenses: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return this.mapToProfileResponse(user);
}

private mapToProfileResponse(user: User & { profile: Profile; contractor?: Contractor }): UserProfileResponse {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isIdentityVerified: user.isIdentityVerified,
    profile: user.profile ? {
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      phone: user.profile.phone,
      avatar: user.profile.avatar,
      bio: user.profile.bio,
      city: user.profile.city,
      province: user.profile.province,
      language: user.profile.language,
    } : null,
    contractor: user.contractor ? {
      id: user.contractor.id,
      businessName: user.contractor.businessName,
      description: user.contractor.description,
      experience: user.contractor.experience,
      hourlyRate: user.contractor.hourlyRate,
      availability: user.contractor.availability,
      isVerified: user.contractor.isVerified,
      rating: user.contractor.rating,
      portfolioCount: user.contractor.portfolioCount,
      portfolio: user.contractor.portfolio,
      categories: user.contractor.categories,
      services: user.contractor.services,
      licenses: user.contractor.licenses,
    } : null,
  };
}
```

**Acceptance Criteria:**
- ✅ User can get their own profile
- ✅ Password excluded from response
- ✅ Contractor profile included if applicable
- ✅ Proper error handling
- ✅ Sensitive data masked appropriately

---

#### 2.2 Update User Profile

**Задача 2.2.1:** Create UpdateProfileDto
```typescript
// api/src/users/dto/update-profile.dto.ts
import { IsString, IsOptional, MinLength, MaxLength, Matches, IsIn, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\+1\d{10}$/, {
    message: 'Phone must be a valid Canadian number (+1XXXXXXXXXX)',
  })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(['en', 'fr'])
  language?: string; // 'en' | 'fr'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]\d[A-Z] \d[A-Z]\d$/, {
    message: 'Postal code must be in format A1A 1A1',
  })
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
```

**Задача 2.2.2:** Endpoint PATCH /api/v1/users/me
```typescript
@Patch('me')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 updates per hour
@ApiOperation({ summary: 'Update current user profile' })
async updateProfile(
  @CurrentUser() user: JwtPayload,
  @Body() updateDto: UpdateProfileDto,
) {
  return this.usersService.updateProfile(user.userId, updateDto);
}
```

**Задача 2.2.3:** Implementation
```typescript
async updateProfile(
  userId: string,
  dto: UpdateProfileDto,
): Promise<UserProfileResponse> {
  // Check if phone is unique (if provided)
  if (dto.phone) {
    const existingPhone = await this.prisma.profile.findFirst({
      where: {
        phone: dto.phone,
        userId: { not: userId },
      },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already in use');
    }
  }

  // Update profile
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      profile: {
        update: dto,
      },
    },
    include: {
      profile: true,
      contractor: true,
    },
  });

  // Log profile update
  await this.auditService.log({
    userId,
    action: 'PROFILE_UPDATED',
    resource: 'USER',
    metadata: { fields: Object.keys(dto) },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return this.mapToProfileResponse(updatedUser);
}
```

**Acceptance Criteria:**
- ✅ Profile update works
- ✅ Input validation enforced (Canadian phone, postal code, provinces)
- ✅ Rate limiting active (5 req/hour)
- ✅ Phone uniqueness enforced
- ✅ Audit log entry created
- ✅ PII masked in logs

---

#### 2.3 Profile Photo Upload

**Задача 2.3.1:** Install dependencies
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add sharp file-type
pnpm add @types/multer -D
```

**Note:** Cloudflare R2 is S3-compatible, so we use the AWS SDK.

**Задача 2.3.2:** Create FileUploadModule
```
api/src/shared/file-upload/
├── file-upload.module.ts
├── file-upload.service.ts
├── file-upload.config.ts
└── interceptors/
    └── file-validation.interceptor.ts
```

**Задача 2.3.3:** File validation interceptor
```typescript
// api/src/shared/file-upload/file-validation.interceptor.ts
@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size must not exceed 5MB');
      }

      // Validate file signature (magic numbers)
      const fileType = await fileTypeFromBuffer(file.buffer);
      if (!fileType || !['jpg', 'png', 'webp'].includes(fileType.ext)) {
        throw new BadRequestException('Invalid file type detected');
      }
    }

    return next.handle();
  }
}
```

**Задача 2.3.4:** R2 upload service (S3-compatible)
```typescript
// api/src/shared/file-upload/file-upload.service.ts
@Injectable()
export class FileUploadService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'auto', // Cloudflare R2 uses 'auto'
      endpoint: this.configService.get('R2_ENDPOINT'), // https://<account_id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    userId: string,
  ): Promise<string> {
    // Strip EXIF, resize, optimize
    const processedBuffer = await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .withMetadata(false) // Strip EXIF metadata
      .toBuffer();

    // Generate unique filename
    const filename = `${folder}/${userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`;

    // Upload to R2
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('R2_BUCKET_NAME'),
        Key: filename,
        Body: processedBuffer,
        ContentType: 'image/jpeg',
        // Note: R2 automatically encrypts all data at rest
      }),
    );

    // Return R2 public URL (or custom domain)
    return `${this.configService.get('R2_PUBLIC_URL')}/${filename}`;
  }

  async deleteImage(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('R2_BUCKET_NAME'),
        Key: key,
      }),
    );
  }

  // Upload PDF for licenses
  async uploadDocument(
    file: Express.Multer.File,
    folder: string,
    contractorId: string,
  ): Promise<string> {
    // Validate PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 20MB');
    }

    const filename = `${folder}/${contractorId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.pdf`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.configService.get('R2_BUCKET_NAME'),
        Key: filename,
        Body: file.buffer,
        ContentType: 'application/pdf',
        // R2 automatic encryption
      }),
    );

    return `${this.configService.get('R2_PUBLIC_URL')}/${filename}`;
  }

  // Optional: Virus scanning (ClamAV or cloud service)
  async scanFile(buffer: Buffer): Promise<boolean> {
    // Implement virus scanning
    // Return true if clean, false if infected
    return true;
  }
}
```

**Задача 2.3.5:** Upload endpoint
```typescript
@Post('me/avatar')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'), FileValidationInterceptor)
@Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 uploads per hour
@ApiConsumes('multipart/form-data')
@ApiBody({ type: FileUploadDto })
async uploadAvatar(
  @CurrentUser() user: JwtPayload,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('File is required');
  }

  // Delete old avatar if exists
  const profile = await this.prisma.profile.findUnique({
    where: { userId: user.userId },
    select: { avatar: true },
  });

  if (profile?.avatar) {
    const oldKey = this.extractKeyFromUrl(profile.avatar);
    await this.fileUploadService.deleteImage(oldKey);
  }

  // Upload new avatar
  const avatarUrl = await this.fileUploadService.uploadImage(
    file,
    'avatars',
    user.userId,
  );

  // Update profile
  await this.prisma.profile.update({
    where: { userId: user.userId },
    data: { avatar: avatarUrl },
  });

  // Log upload
  await this.auditService.log({
    userId: user.userId,
    action: 'AVATAR_UPLOADED',
    resource: 'USER',
    metadata: { avatarUrl },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return { avatarUrl };
}
```

**Acceptance Criteria:**
- ✅ File upload works (avatar)
- ✅ MIME type validation enforced
- ✅ File size limit enforced (5MB)
- ✅ File signature validation (magic numbers)
- ✅ EXIF metadata stripped
- ✅ Images optimized and resized (800x800)
- ✅ R2 upload successful with automatic encryption
- ✅ R2 public URL or custom domain URL returned
- ✅ Old avatar deleted on new upload
- ✅ Rate limiting active (10 req/hour)
- ✅ Audit logging works

---

### 3. Contractor Profile Management (Day 2-3)

#### 3.1 Create Contractor Profile

**Задача 3.1.1:** Create CreateContractorProfileDto
```typescript
// api/src/users/dto/create-contractor-profile.dto.ts
import { IsString, IsOptional, IsInt, IsNumber, Min, Max, IsArray, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateContractorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessName?: string;

  @IsString()
  @MinLength(50)
  @MaxLength(2000)
  description: string;

  @IsInt()
  @Min(0)
  @Max(50)
  experience: number; // years

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  categoryIds: string[]; // Up to 5 categories
}
```

**Задача 3.1.2:** Endpoint PATCH /api/v1/users/me/contractor
```typescript
@Patch('me/contractor')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Update contractor profile' })
async updateContractorProfile(
  @CurrentUser() user: JwtPayload,
  @Body() dto: UpdateContractorProfileDto,
) {
  return this.usersService.updateContractorProfile(user.userId, dto);
}

@Post('me/contractor')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Create contractor profile' })
async createContractorProfile(
  @CurrentUser() user: JwtPayload,
  @Body() dto: CreateContractorProfileDto,
) {
  // Check if user already has contractor profile
  const existing = await this.prisma.contractor.findUnique({
    where: { userId: user.userId },
  });

  if (existing) {
    throw new ConflictException('Contractor profile already exists');
  }

  return this.usersService.createContractorProfile(user.userId, dto);
}
```

**Задача 3.1.3:** Implementation
```typescript
async createContractorProfile(
  userId: string,
  dto: CreateContractorProfileDto,
): Promise<Contractor> {
  // Validate categories exist
  const categories = await this.prisma.category.findMany({
    where: { id: { in: dto.categoryIds } },
  });

  if (categories.length !== dto.categoryIds.length) {
    throw new BadRequestException('One or more categories not found');
  }

  // Create contractor profile
  const contractor = await this.prisma.contractor.create({
    data: {
      userId,
      businessName: dto.businessName,
      description: dto.description,
      experience: dto.experience,
      hourlyRate: dto.hourlyRate,
      categories: {
        create: dto.categoryIds.map((categoryId, index) => ({
          categoryId,
          isPrimary: index === 0, // First category is primary
        })),
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  // Update user role to CONTRACTOR
  await this.prisma.user.update({
    where: { id: userId },
    data: { role: 'CONTRACTOR' },
  });

  // Log contractor profile creation
  await this.auditService.log({
    userId,
    action: 'CONTRACTOR_PROFILE_CREATED',
    resource: 'CONTRACTOR',
    metadata: { contractorId: contractor.id },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return contractor;
}

async updateContractorProfile(
  userId: string,
  dto: UpdateContractorProfileDto,
): Promise<Contractor> {
  const contractor = await this.prisma.contractor.findUnique({
    where: { userId },
  });

  if (!contractor) {
    throw new NotFoundException('Contractor profile not found');
  }

  // Validate category IDs if provided
  if (dto.categoryIds && dto.categoryIds.length > 0) {
    const categories = await this.prisma.category.findMany({
      where: { id: { in: dto.categoryIds } },
    });

    if (categories.length !== dto.categoryIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    // Update categories
    await this.prisma.contractorCategory.deleteMany({
      where: { contractorId: contractor.id },
    });

    await this.prisma.contractorCategory.createMany({
      data: dto.categoryIds.map((categoryId, index) => ({
        contractorId: contractor.id,
        categoryId,
        isPrimary: index === 0,
      })),
    });
  }

  // Update contractor
  const updatedContractor = await this.prisma.contractor.update({
    where: { id: contractor.id },
    data: {
      businessName: dto.businessName,
      description: dto.description,
      experience: dto.experience,
      hourlyRate: dto.hourlyRate,
    },
    include: {
      categories: true,
      portfolio: true,
      services: true,
      licenses: true,
    },
  });

  // Log update
  await this.auditService.log({
    userId,
    action: 'CONTRACTOR_PROFILE_UPDATED',
    resource: 'CONTRACTOR',
    metadata: { contractorId: contractor.id },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return updatedContractor;
}
```

**Acceptance Criteria:**
- ✅ User can create contractor profile
- ✅ User role updated to CONTRACTOR
- ✅ Categories validated and assigned (max 5)
- ✅ Primary category marked
- ✅ Audit log created
- ✅ Validation works correctly

---

#### 3.2 Portfolio Management (Max 10 Items)

**Задача 3.2.1:** Create Portfolio DTOs
```typescript
// api/src/users/dto/add-portfolio-item.dto.ts
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class AddPortfolioItemDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// api/src/users/dto/update-portfolio-item.dto.ts
export class UpdatePortfolioItemDto extends PartialType(AddPortfolioItemDto) {}
```

**Задача 3.2.2:** Portfolio endpoints
```typescript
@Post('me/contractor/portfolio')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@UseInterceptors(FileInterceptor('image'), FileValidationInterceptor)
@Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 uploads per hour
@ApiOperation({ summary: 'Add portfolio item (max 10 items)' })
async addPortfolioItem(
  @CurrentUser() user: JwtPayload,
  @Body() dto: AddPortfolioItemDto,
  @UploadedFile() image: Express.Multer.File,
) {
  if (!image) {
    throw new BadRequestException('Image is required');
  }

  return this.usersService.addPortfolioItem(user.userId, dto, image);
}

@Patch('me/contractor/portfolio/:id')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Update portfolio item' })
async updatePortfolioItem(
  @CurrentUser() user: JwtPayload,
  @Param('id') portfolioId: string,
  @Body() dto: UpdatePortfolioItemDto,
) {
  return this.usersService.updatePortfolioItem(user.userId, portfolioId, dto);
}

@Delete('me/contractor/portfolio/:id')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Delete portfolio item' })
async deletePortfolioItem(
  @CurrentUser() user: JwtPayload,
  @Param('id') portfolioId: string,
) {
  await this.usersService.deletePortfolioItem(user.userId, portfolioId);
}

@Patch('me/contractor/portfolio/reorder')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Reorder portfolio items' })
async reorderPortfolio(
  @CurrentUser() user: JwtPayload,
  @Body() dto: ReorderPortfolioDto, // { itemIds: string[] }
) {
  return this.usersService.reorderPortfolioItems(user.userId, dto.itemIds);
}
```

**Задача 3.2.3:** Business logic
```typescript
async addPortfolioItem(
  userId: string,
  dto: AddPortfolioItemDto,
  image: Express.Multer.File,
): Promise<Portfolio> {
  // Get contractor
  const contractor = await this.prisma.contractor.findUnique({
    where: { userId },
    include: { portfolio: true },
  });

  if (!contractor) {
    throw new NotFoundException('Contractor profile not found');
  }

  // Check portfolio limit (max 10 items)
  if (contractor.portfolio.length >= 10) {
    throw new BadRequestException('Maximum 10 portfolio items allowed');
  }

  // Upload image
  const imageUrl = await this.fileUploadService.uploadImage(
    image,
    'portfolio',
    contractor.id,
  );

  // Create portfolio item
  const portfolioItem = await this.prisma.portfolio.create({
    data: {
      contractorId: contractor.id,
      title: dto.title,
      description: dto.description,
      imageUrl,
      order: contractor.portfolio.length,
    },
  });

  // Update portfolio count
  await this.prisma.contractor.update({
    where: { id: contractor.id },
    data: { portfolioCount: { increment: 1 } },
  });

  // Log addition
  await this.auditService.log({
    userId,
    action: 'PORTFOLIO_ITEM_ADDED',
    resource: 'PORTFOLIO',
    metadata: { portfolioItemId: portfolioItem.id },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return portfolioItem;
}

async deletePortfolioItem(
  userId: string,
  portfolioItemId: string,
): Promise<void> {
  // Get contractor
  const contractor = await this.prisma.contractor.findUnique({
    where: { userId },
  });

  if (!contractor) {
    throw new NotFoundException('Contractor profile not found');
  }

  // Find portfolio item
  const item = await this.prisma.portfolio.findFirst({
    where: {
      id: portfolioItemId,
      contractorId: contractor.id,
    },
  });

  if (!item) {
    throw new NotFoundException('Portfolio item not found');
  }

  // Delete image from R2
  const key = this.extractKeyFromUrl(item.imageUrl);
  await this.fileUploadService.deleteImage(key);

  // Delete portfolio item
  await this.prisma.portfolio.delete({
    where: { id: portfolioItemId },
  });

  // Update portfolio count
  await this.prisma.contractor.update({
    where: { id: contractor.id },
    data: { portfolioCount: { decrement: 1 } },
  });

  // Reorder remaining items
  await this.reorderPortfolio(contractor.id);

  // Log deletion
  await this.auditService.log({
    userId,
    action: 'PORTFOLIO_ITEM_DELETED',
    resource: 'PORTFOLIO',
    metadata: { portfolioItemId },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });
}

private async reorderPortfolio(contractorId: string): Promise<void> {
  const items = await this.prisma.portfolio.findMany({
    where: { contractorId },
    orderBy: { order: 'asc' },
  });

  await Promise.all(
    items.map((item, index) =>
      this.prisma.portfolio.update({
        where: { id: item.id },
        data: { order: index },
      }),
    ),
  );
}
```

**Acceptance Criteria:**
- ✅ Portfolio CRUD operations work
- ✅ Max 10 items enforced
- ✅ Image upload validated
- ✅ Images stored in R2
- ✅ Old images deleted on update/delete
- ✅ Only owner can modify their portfolio
- ✅ Reordering works
- ✅ Audit logs created

---

#### 3.3 Services & Pricing

**Задача 3.3.1:** Create Service DTOs
```typescript
// api/src/users/dto/add-service.dto.ts
import { IsString, IsOptional, IsNumber, Min, IsEnum, MinLength, MaxLength } from 'class-validator';

export class AddServiceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsEnum(PriceType)
  priceType: PriceType; // HOURLY, FIXED, PER_PROJECT
}

export class UpdateServiceDto extends PartialType(AddServiceDto) {}
```

**Задача 3.3.2:** Services endpoints
```typescript
@Post('me/contractor/services')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Add service offering' })
async addService(
  @CurrentUser() user: JwtPayload,
  @Body() dto: AddServiceDto,
) {
  return this.usersService.addService(user.userId, dto);
}

@Get('me/contractor/services')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Get my services' })
async getMyServices(@CurrentUser() user: JwtPayload) {
  return this.usersService.getServices(user.userId);
}

@Patch('me/contractor/services/:id')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Update service' })
async updateService(
  @CurrentUser() user: JwtPayload,
  @Param('id') serviceId: string,
  @Body() dto: UpdateServiceDto,
) {
  return this.usersService.updateService(user.userId, serviceId, dto);
}

@Delete('me/contractor/services/:id')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteService(
  @CurrentUser() user: JwtPayload,
  @Param('id') serviceId: string,
) {
  await this.usersService.deleteService(user.userId, serviceId);
}
```

**Acceptance Criteria:**
- ✅ Services CRUD operations work
- ✅ Price validation enforced
- ✅ Price types supported (HOURLY, FIXED, PER_PROJECT)
- ✅ Only owner can modify services
- ✅ Audit logs created

---

#### 3.4 License Upload

**Задача 3.4.1:** Create AddLicenseDto
```typescript
// api/src/users/dto/add-license.dto.ts
import { IsString, MinLength, IsDateString, IsOptional } from 'class-validator';

export class AddLicenseDto {
  @IsString()
  @MinLength(3)
  type: string; // e.g., "Electrician License", "Plumber License"

  @IsString()
  number: string;

  @IsString()
  issuedBy: string;

  @IsDateString()
  issuedDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
```

**Задача 3.4.2:** Endpoint для загрузки лицензии
```typescript
@Post('me/contractor/licenses')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@UseInterceptors(FileInterceptor('file'))
async addLicense(
  @CurrentUser() user: JwtPayload,
  @Body() dto: AddLicenseDto,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.usersService.addLicense(user.userId, dto, file);
}

@Delete('me/contractor/licenses/:id')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteLicense(
  @CurrentUser() user: JwtPayload,
  @Param('id') licenseId: string,
) {
  await this.usersService.deleteLicense(user.userId, licenseId);
}
```

**Задача 3.4.3:** Implementation
```typescript
async addLicense(
  userId: string,
  dto: AddLicenseDto,
  file?: Express.Multer.File,
): Promise<ContractorLicense> {
  const contractor = await this.prisma.contractor.findUnique({
    where: { userId },
  });

  if (!contractor) {
    throw new NotFoundException('Contractor profile not found');
  }

  let fileUrl: string | null = null;

  if (file) {
    // Validate PDF file
    await this.validatePdfFile(file);

    // Upload to S3
    fileUrl = await this.fileUploadService.uploadDocument(
      file,
      'licenses',
      contractor.id,
    );
  }

  const license = await this.prisma.contractorLicense.create({
    data: {
      contractorId: contractor.id,
      type: dto.type,
      number: dto.number,
      issuedBy: dto.issuedBy,
      issuedDate: new Date(dto.issuedDate),
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      fileUrl,
      isVerified: false, // Requires admin verification
    },
  });

  await this.auditService.log({
    userId,
    action: 'LICENSE_ADDED',
    resource: 'LICENSE',
    metadata: { licenseId: license.id },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return license;
}

private async validatePdfFile(file: Express.Multer.File): Promise<void> {
  if (file.size > 20 * 1024 * 1024) {
    throw new BadRequestException('File size must not exceed 20MB');
  }

  if (file.mimetype !== 'application/pdf') {
    throw new BadRequestException('Only PDF files are allowed');
  }
}
```

**Acceptance Criteria:**
- ✅ Contractor can upload licenses
- ✅ PDF validation works (MIME, size)
- ✅ Stored in R2 with automatic encryption
- ✅ Requires admin verification
- ✅ Audit log created
- ✅ Can delete licenses

---

### 4. Geolocation & Privacy (Day 4)

#### 4.1 Location Update

**Задача 4.1.1:** Create UpdateLocationDto
```typescript
// api/src/users/dto/update-location.dto.ts
import { IsNumber, Min, Max, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  @IsIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
  province: string;

  @IsString()
  @Matches(/^[A-Z]\d[A-Z] \d[A-Z]\d$/, {
    message: 'Postal code must be in format A1A 1A1',
  })
  postalCode: string;
}
```

**Задача 4.1.2:** Endpoint PATCH /api/v1/users/me/location
```typescript
@Patch('me/location')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 updates per hour
@ApiOperation({ summary: 'Update user location (with privacy)' })
async updateLocation(
  @CurrentUser() user: JwtPayload,
  @Body() dto: UpdateLocationDto,
) {
  return this.usersService.updateLocation(user.userId, dto);
}
```

**Задача 4.1.3:** Implement fuzzy location (±500m)
```typescript
// api/src/shared/utils/geo.utils.ts
export class GeoUtils {
  static addRandomOffset(lat: number, lng: number): { lat: number; lng: number } {
    // Add random offset ±500m for privacy
    const offsetMeters = 500;
    const latOffset = (Math.random() - 0.5) * 2 * (offsetMeters / 111320); // 1 degree latitude ≈ 111.32 km
    const lngOffset = (Math.random() - 0.5) * 2 * (offsetMeters / (111320 * Math.cos(lat * Math.PI / 180)));

    return {
      lat: lat + latOffset,
      lng: lng + lngOffset,
    };
  }

  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
```

**Задача 4.1.4:** Store location in PostGIS
```typescript
async updateLocation(
  userId: string,
  dto: UpdateLocationDto,
): Promise<Profile> {
  // Create PostGIS Point
  const point = `POINT(${dto.longitude} ${dto.latitude})`;

  // Update profile with location
  const profile = await this.prisma.$executeRaw`
    UPDATE profiles
    SET
      location = ST_GeomFromText(${point}, 4326),
      address = ${dto.address},
      city = ${dto.city},
      province = ${dto.province},
      "postalCode" = ${dto.postalCode}
    WHERE "userId" = ${userId}
    RETURNING *
  `;

  // Log location update
  await this.auditService.log({
    userId,
    action: 'LOCATION_UPDATED',
    resource: 'USER',
    metadata: { city: dto.city, province: dto.province },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return profile;
}

async getFuzzyLocation(userId: string): Promise<{ lat: number; lng: number } | null> {
  const profile = await this.prisma.$queryRaw`
    SELECT
      ST_Y(ST_Transform(location, 4326)) as latitude,
      ST_X(ST_Transform(location, 4326)) as longitude
    FROM profiles
    WHERE "userId" = ${userId}
  `;

  if (!profile || !profile.latitude) {
    return null;
  }

  // Add random offset ±500m for privacy
  return GeoUtils.addRandomOffset(profile.latitude, profile.longitude);
}
```

**Acceptance Criteria:**
- ✅ Location update works
- ✅ PostGIS geography type used
- ✅ Fuzzy location stored for privacy
- ✅ Precise location accessible only to authorized users
- ✅ City/district displayed publicly
- ✅ Audit log created

---

#### 4.2 Geospatial Search

**Задача 4.2.1:** Search contractors by radius
```typescript
// api/src/users/dto/search-contractors.dto.ts
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class SearchContractorsDto extends PaginationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  radiusKm: number = 10; // Default 10km

  @IsOptional()
  @IsString()
  categoryId?: string;
}
```

**Задача 4.2.2:** Endpoint
```typescript
@Get('contractors/search')
@ApiOperation({ summary: 'Find contractors nearby' })
async findNearbyContractors(@Query() dto: SearchContractorsDto) {
  return this.usersService.searchContractors(dto);
}
```

**Задача 4.2.3:** Implement radius search with Prisma + PostGIS
```typescript
async searchContractors(dto: SearchContractorsDto) {
  const userPoint = `POINT(${dto.longitude} ${dto.latitude})`;
  const radiusMeters = dto.radiusKm * 1000;

  const contractors = await this.prisma.$queryRaw`
    SELECT
      c.*,
      u.email,
      p."firstName",
      p."lastName",
      p.avatar,
      p.city,
      p.province,
      ST_Distance(
        p.location::geography,
        ST_GeomFromText(${userPoint}, 4326)::geography
      ) as distance_meters
    FROM contractors c
    INNER JOIN users u ON c."userId" = u.id
    INNER JOIN profiles p ON u.id = p."userId"
    WHERE
      c."isVerified" = true
      AND c.availability != 'UNAVAILABLE'
      AND ST_DWithin(
        p.location::geography,
        ST_GeomFromText(${userPoint}, 4326)::geography,
        ${radiusMeters}
      )
      ${dto.categoryId ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM contractor_categories cc
        WHERE cc."contractorId" = c.id
        AND cc."categoryId" = ${dto.categoryId}
      )` : Prisma.empty}
    ORDER BY distance_meters ASC
    LIMIT ${dto.limit}
    OFFSET ${(dto.page - 1) * dto.limit}
  `;

  return {
    contractors: contractors.map(c => ({
      ...c,
      distance_km: (c.distance_meters / 1000).toFixed(2),
      location: null, // Hide precise location
    })),
    page: dto.page,
    limit: dto.limit,
    total: contractors.length,
  };
}
```

**Acceptance Criteria:**
- ✅ Radius search works (PostGIS)
- ✅ Distance calculated correctly
- ✅ Category filtering works
- ✅ Results sorted by distance
- ✅ Pagination supported
- ✅ Precise location hidden
- ✅ Only verified contractors returned

---

### 5. Stripe Identity Verification (Day 5)

#### 5.1 Verification Flow Integration

**Задача 5.1.1:** Install Stripe SDK
```bash
pnpm add stripe
```

**Задача 5.1.2:** Create verification module
```
api/src/verification/
├── verification.module.ts
├── verification.controller.ts
└── verification.service.ts
```

**Задача 5.1.3:** Create verification session
```typescript
@Post('verification/create')
@UseGuards(JwtAuthGuard, ContractorVerifiedGuard)
@ApiOperation({ summary: 'Create Stripe Identity verification session' })
async createVerificationSession(@CurrentUser() user: JwtPayload) {
  return this.verificationService.createSession(user.userId);
}
```

**Задача 5.1.4:** Implement Stripe Identity session
```typescript
// api/src/verification/verification.service.ts
@Injectable()
export class VerificationService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const session = await this.stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: user.id,
      },
      options: {
        document: {
          require_matching_selfie: true,
          allowed_types: ['driving_license', 'passport', 'id_card'],
        },
      },
      return_url: `${this.configService.get('FRONTEND_URL')}/verification/complete`,
    });

    // Save session ID to database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        // Store session ID if needed
      },
    });

    return {
      sessionId: session.id,
      clientSecret: session.client_secret,
      url: session.url,
    };
  }
}
```

**Задача 5.1.5:** Webhook handler for verification result
```typescript
@Post('webhooks/verification')
@ApiExcludeEndpoint()
async handleVerificationWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('stripe-signature') signature: string,
) {
  const event = this.stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    this.configService.get('STRIPE_VERIFICATION_WEBHOOK_SECRET'),
  );

  if (event.type === 'identity.verification_session.verified') {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = session.metadata.userId;

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isIdentityVerified: true,
        verificationDate: new Date(),
      },
    });

    // Mark contractor as verified
    await this.prisma.contractor.updateMany({
      where: { userId },
      data: {
        isVerified: true,
        verificationDate: new Date(),
      },
    });

    // Send notification email
    await this.notificationService.send({
      userId,
      type: 'CONTRACTOR_VERIFIED',
      title: 'Verification Complete',
      message: 'Your contractor profile has been verified!',
    });
  }

  if (event.type === 'identity.verification_session.requires_input') {
    // Handle failed verification
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = session.metadata.userId;

    // Send notification to user
    await this.notificationService.send({
      userId,
      type: 'VERIFICATION_FAILED',
      title: 'Verification Failed',
      message: 'Please try again or contact support',
    });
  }

  return { received: true };
}
```

**Acceptance Criteria:**
- ✅ Verification session created
- ✅ Stripe Identity integration works
- ✅ Webhook signature verified
- ✅ User marked as verified on success
- ✅ Contractor marked as verified
- ✅ Verification badge awarded
- ✅ Notification sent on completion

---

### 6. PII Protection & Audit Logging (Day 6)

#### 6.1 Field-Level Encryption

**Задача 6.1.1:** Install encryption library
```bash
pnpm add crypto-js
pnpm add @types/crypto-js -D
```

**Задача 6.1.2:** Create encryption service
```typescript
// api/src/shared/encryption/encryption.service.ts
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly key: string;

  constructor(private configService: ConfigService) {
    this.key = this.configService.get('ENCRYPTION_KEY'); // AES-256 key
  }

  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
```

**Задача 6.1.3:** Encrypt sensitive fields
- [ ] SIN numbers (Social Insurance Number)
- [ ] License numbers
- [ ] Insurance numbers
- [ ] Precise location coordinates

**Acceptance Criteria:**
- ✅ Encryption service works
- ✅ Sensitive fields encrypted at rest
- ✅ Decryption works for authorized users only
- ✅ AES-256 encryption used

---

#### 6.2 Audit Logging

**Задача 6.2.1:** Create audit logging interceptor
```typescript
// api/src/core/interceptors/audit-log.interceptor.ts
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    // Only log state-changing operations
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async (data) => {
          if (user) {
            await this.prisma.auditLog.create({
              data: {
                userId: user.userId,
                action: `${method}_${url}`,
                resource: this.extractResource(url),
                metadata: {
                  body: this.maskPII(request.body),
                  params: request.params,
                },
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
              },
            });
          }
        }),
      );
    }

    return next.handle();
  }

  private extractResource(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1].toUpperCase() : 'UNKNOWN';
  }

  private maskPII(data: any): any {
    if (!data) return data;

    const masked = { ...data };

    // Mask email
    if (masked.email) {
      const [username, domain] = masked.email.split('@');
      masked.email = `${username[0]}***@${domain}`;
    }

    // Mask phone
    if (masked.phone) {
      masked.phone = `***-***-${masked.phone.slice(-4)}`;
    }

    // Never log these fields
    delete masked.passwordHash;
    delete masked.password;
    delete masked.token;
    delete masked.refreshToken;

    return masked;
  }
}
```

**Задача 6.2.2:** Apply audit logging globally
```typescript
// api/src/app.module.ts
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
```

**Acceptance Criteria:**
- ✅ Audit log created for all mutations
- ✅ User actions tracked
- ✅ IP address and user agent logged
- ✅ Metadata includes request details
- ✅ No sensitive data logged (PII masked)

---

### 7. Role Switching (Day 7)

#### 7.1 Switch Between CLIENT and CONTRACTOR

**Задача 7.1.1:** Endpoint POST /api/v1/users/me/switch-role
```typescript
@Post('me/switch-role')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Switch between CLIENT and CONTRACTOR roles' })
async switchRole(@CurrentUser() user: JwtPayload) {
  return this.usersService.switchRole(user.userId);
}
```

**Задача 7.1.2:** Implementation
```typescript
async switchRole(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { contractor: true },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Toggle role
  const newRole = user.role === 'CLIENT' ? 'CONTRACTOR' : 'CLIENT';

  // If switching to CONTRACTOR and no contractor profile exists, create it
  if (newRole === 'CONTRACTOR' && !user.contractor) {
    await this.prisma.contractor.create({
      data: {
        userId: user.id,
      },
    });
  }

  // Update role
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    include: { contractor: true },
  });

  // Regenerate JWT with new role
  const tokens = await this.authService.generateTokens(
    updatedUser.id,
    updatedUser.email,
    updatedUser.role as UserRole,
  );

  // Log role switch
  await this.auditService.log({
    userId,
    action: 'ROLE_SWITCHED',
    resource: 'USER',
    metadata: { oldRole: user.role, newRole },
    ipAddress: this.getClientIp(),
    userAgent: this.getUserAgent(),
  });

  return {
    user: this.excludePassword(updatedUser),
    ...tokens,
  };
}
```

**Acceptance Criteria:**
- ✅ Role switching works
- ✅ Contractor profile created if needed
- ✅ New JWT tokens generated
- ✅ User can switch back and forth
- ✅ Audit log entry created

---

### 8. User Data Export (Day 7)

#### 8.1 PIPEDA Right to Access

**Задача 8.1.1:** Endpoint GET /api/v1/users/me/export
```typescript
@Get('me/export')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Export all user data (PIPEDA)' })
async exportMyData(@CurrentUser() user: JwtPayload) {
  return this.usersService.exportUserData(user.userId);
}
```

**Задача 8.1.2:** Implementation
```typescript
async exportUserData(userId: string) {
  const userData = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      contractor: {
        include: {
          portfolio: true,
          licenses: true,
          categories: true,
          services: true,
        },
      },
      // Include all related data
    },
  });

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      createdAt: userData.createdAt,
      profile: userData.profile,
      contractor: userData.contractor,
      // All data user has right to access under PIPEDA
    },
  };
}
```

**Acceptance Criteria:**
- ✅ User can export all their data
- ✅ Export includes all related data
- ✅ JSON format
- ✅ Timestamp included

---

### 9. Testing (Day 8)

#### 9.1 Unit Tests

**Задача 9.1.1:** UsersService Tests
- [ ] `findById()` - success case
- [ ] `findById()` - user not found
- [ ] `updateProfile()` - success case
- [ ] `updateProfile()` - validation errors
- [ ] `uploadAvatar()` - success case
- [ ] `uploadAvatar()` - invalid file type
- [ ] `updateContractorProfile()` - success
- [ ] `updateContractorProfile()` - max categories exceeded
- [ ] `addPortfolioItem()` - success
- [ ] `addPortfolioItem()` - max 10 items exceeded
- [ ] `updateLocation()` - success
- [ ] `findNearbyContractors()` - radius search
- [ ] `switchRole()` - CLIENT to CONTRACTOR
- [ ] `switchRole()` - CONTRACTOR to CLIENT
- [ ] `exportUserData()` - success

**Задача 9.1.2:** FileUploadService Tests
- [ ] `uploadImage()` - success
- [ ] `uploadImage()` - file size too large
- [ ] `uploadImage()` - invalid MIME type
- [ ] `uploadDocument()` - PDF validation
- [ ] `deleteImage()` - success

#### 9.2 E2E Tests

**Задача 9.2.1:** Profile Management
- [ ] GET /users/me → 200 with user profile
- [ ] PATCH /users/me → 200 with updated profile
- [ ] PATCH /users/me without auth → 401

**Задача 9.2.2:** Contractor Profile
- [ ] POST /users/me/contractor → 200 (contractor created)
- [ ] PATCH /users/me/contractor → 200 (CONTRACTOR role)
- [ ] PATCH /users/me/contractor → 403 (CLIENT role)

**Задача 9.2.3:** Portfolio Management
- [ ] POST /users/me/contractor/portfolio → 201
- [ ] POST /users/me/contractor/portfolio (11th item) → 400
- [ ] DELETE /users/me/contractor/portfolio/:id → 204

**Задача 9.2.4:** Geolocation
- [ ] PATCH /users/me/location → 200
- [ ] GET /users/contractors/search → 200 with contractors
- [ ] GET /users/contractors/search (0 results) → 200 []

**Задача 9.2.5:** File Upload
- [ ] POST /users/me/avatar (valid image) → 200
- [ ] POST /users/me/avatar (invalid file) → 400
- [ ] POST /users/me/contractor/licenses (valid PDF) → 201
- [ ] POST /users/me/contractor/licenses (invalid file) → 400

**Acceptance Criteria:**
- ✅ Unit test coverage > 80%
- ✅ All E2E tests pass
- ✅ Edge cases covered
- ✅ Security tests pass

---

### 10. Security Audit (Day 9-10)

#### 10.1 Security Checklist Review

**Задача 10.1.1:** File Upload Security
- [ ] MIME type validation enforced ✓
- [ ] ✅ File size limits enforced (5MB for images, 20MB for PDFs) ✓
- [ ] ✅ File signature validation (magic numbers) ✓
- [ ] ✅ EXIF metadata stripped ✓
- [ ] ✅ Virus scanning implemented (optional)
- [ ] ✅ Images optimized and resized ✓
- [ ] ✅ R2 bucket configured with proper permissions ✓
- [ ] ✅ Automatic encryption enabled (R2 default) ✓

**Задача 10.1.2:** PII Protection
- [ ] Sensitive fields encrypted (AES-256) ✓
- [ ] PII masked in logs ✓
- [ ] Precise location hidden publicly ✓
- [ ] Fuzzy location used (±500m) ✓
- [ ] Access control for sensitive data ✓
- [ ] User data export implemented ✓

**Задача 10.1.3:** Input Validation
- [ ] All DTOs validated with class-validator ✓
- [ ] SQL injection prevented (Prisma) ✓
- [ ] Max array lengths enforced ✓
- [ ] String length limits enforced ✓
- [ ] Canadian validators implemented ✓

**Задача 10.1.4:** Rate Limiting
- [ ] Profile updates: 5 req/hour ✓
- [ ] File uploads: 10 req/hour ✓
- [ ] Location updates: 10 req/hour ✓

**Задача 10.1.5:** Audit Logging
- [ ] All mutations logged ✓
- [ ] User actions tracked ✓
- [ ] No sensitive data in logs ✓
- [ ] IP address and user agent logged ✓

**Задача 10.1.6:** Stripe Identity
- [ ] Webhook signature verified ✓
- [ ] Secure metadata handling ✓
- [ ] Verification badges awarded ✓

**Acceptance Criteria:**
- ✅ All security requirements met
- ✅ No vulnerabilities found
- ✅ Code review completed
- ✅ Security scan passed (Snyk, Trivy)

---

## 📊 Progress Tracking

### Daily Milestones

**Day 1:** Users Module Setup + Profile Management
- [ ] Users module structure created
- [ ] CurrentUser decorator implemented
- [ ] Guards created (ProfileOwner, ContractorVerified)
- [ ] GET /users/me endpoint working
- [ ] PATCH /users/me endpoint working

**День 2:** Profile Photo Upload
- [ ] FileUploadModule created
- [ ] R2 integration working
- [ ] Avatar upload endpoint working
- [ ] File validation enforced (MIME, size, magic numbers)
- [ ] EXIF stripping working

**Day 3:** Contractor Profile + Portfolio
- [ ] Contractor profile create/update working
- [ ] Portfolio CRUD operations working
- [ ] Max 10 portfolio items enforced
- [ ] Image upload to R2 working

**Day 4:** Services, Licenses & Geolocation
- [ ] Services CRUD operations working
- [ ] License upload working (PDF validation)
- [ ] Location update endpoint working
- [ ] PostGIS integration working
- [ ] Fuzzy location implemented

**Day 5:** Stripe Identity Verification
- [ ] Verification session creation working
- [ ] Webhook handler implemented
- [ ] User and contractor marked as verified on success
- [ ] Notification sent on completion

**Day 6:** PII Protection & Audit Logging
- [ ] Encryption service implemented
- [ ] Sensitive fields encrypted
- [ ] Audit logging interceptor created
- [ ] Audit logs created for mutations
- [ ] PII masking in logs

**Day 7:** Role Switching & Data Export
- [ ] Role switching endpoint working
- [ ] Contractor profile auto-created
- [ ] New JWT tokens generated
- [ ] User data export working

**Day 8:** Testing
- [ ] Unit tests written (80%+ coverage)
- [ ] E2E tests pass
- [ ] Edge cases covered

**Day 9-10:** Security Audit
- [ ] Security checklist complete
- [ ] No vulnerabilities found
- [ ] Code review completed
- [ ] Documentation updated

---

## 🔗 Dependencies

### Must be completed before Phase 2:
- ✅ Phase 0: Foundation & Infrastructure
- ✅ Phase 1: Authentication & Authorization

### Required for Phase 2:
- Users table (from Phase 1)
- Prisma models: Contractor, Portfolio, ContractorLicense, ContractorCategory, ContractorService, Profile, AuditLog
- FileUploadModule
- R2 bucket configured with proper permissions
- Stripe Identity configured
- PostGIS enabled in PostgreSQL
- AuditLogInterceptor implemented

---

## 📝 Definition of Done

Phase 2 считается завершенным когда:

**Core Functionality:**
- [ ] ✅ Users module with full CRUD
- [ ] ✅ User profile management functioning
- [ ] ✅ Contractor profile system работает
- [ ] ✅ Portfolio management (max 10 items) работает
- [ ] ✅ Services CRUD operations работают
- [ ] ✅ License upload работает
- [ ] ✅ Файлы загрузки (avatar, portfolio) работает
- [ ] ✅ R2 integration работает
- [ ] ✅ Geolocation (PostGIS + fuzzy) работает
- [ ] ✅ Radius search функционирует
- [ ] ✅ Stripe Identity verification интегрирована

**Security & Compliance:**
- [ ] ✅ PII protection (encryption) реализована
- [ ] ✅ Audit logging работает
- [ ] ✅ Role switching функционирует
- [ ] ✅ User data export работает (PIPEDA)
- [ ] ✅ All security requirements met
- [ ] ✅ Canadian validators implemented (phone, postal code, provinces)

**Quality:**
- [ ] ✅ Unit tests pass (80%+ coverage)
- [ ] ✅ E2E tests pass
- [ ] ✅ Security audit пройден
- [ ] ✅ Documentation обновлена
- [ ] ✅ Code review completed

---

## 🚀 Next Steps

После завершения Phase 2:
1. ✅ Verify all deliverables complete
2. ✅ Run security checklist
3. ✅ Run all tests (unit + E2E + PostGIS)
4. ✅ Test file uploads with various file types
5. ✅ Verify PII masking works
6. ✅ Test geolocation search accuracy
7. ➡️ **Proceed to Phase 3: Orders Module**

---

**Created:** January 2025  
**Last Updated:** January 2025  
**Status:** Ready for implementation  
**Owner:** Backend Team


