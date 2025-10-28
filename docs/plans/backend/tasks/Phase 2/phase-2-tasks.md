# Phase 2: User Management Module - Детальные задачи

**Длительность:** Week 5-6 (2 недели)
**Приоритет:** 🔴 CRITICAL
**Зависимости:** Phase 0 и Phase 1 должны быть завершены

---

## 📋 Overview

Phase 2 фокусируется на создании полноценной системы управления пользователями с профилями клиентов и исполнителей, портфолио, геолокацией и защитой персональных данных (PIPEDA compliance).

**Ключевые deliverables:**
- User profile management (CLIENT + CONTRACTOR roles)
- Portfolio system for contractors (10 works max)
- Geolocation with privacy (PostGIS + fuzzy location)
- PII protection (field-level encryption, audit logging)
- File upload security (avatars, portfolio, documents)
- Stripe Identity verification integration

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
│   ├── update-contractor-profile.dto.ts
│   └── update-location.dto.ts
├── entities/
│   ├── user.entity.ts
│   └── contractor.entity.ts
└── decorators/
    └── current-user.decorator.ts
```

**Задача 1.1.1:** Создать базовую структуру модуля
- [ ] `nest g module users`
- [ ] `nest g controller users`
- [ ] `nest g service users`
- [ ] Импортировать PrismaModule, JwtModule
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

**Acceptance Criteria:**
- ✅ Users module создан и подключен
- ✅ CurrentUser decorator работает с JwtAuthGuard
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
- [ ] Find user by ID with Prisma
- [ ] Include contractor profile if role === CONTRACTOR
- [ ] Exclude password field
- [ ] Return user entity
- [ ] Throw NotFoundException if not found

**Acceptance Criteria:**
- ✅ Endpoint returns current user profile
- ✅ Password excluded from response
- ✅ Contractor profile included if applicable
- ✅ Proper error handling

---

#### 2.2 Update User Profile

**Задача 2.2.1:** Create UpdateUserDto
```typescript
// api/src/users/dto/update-user.dto.ts
import { IsString, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\+1\d{10}$/, {
    message: 'Phone must be a valid Canadian number',
  })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string; // 'en' | 'fr'
}
```

**Задача 2.2.2:** Endpoint PATCH /api/v1/users/me
```typescript
@Patch('me')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Update current user profile' })
async updateProfile(
  @CurrentUser() user: JwtPayload,
  @Body() updateDto: UpdateUserDto,
) {
  return this.usersService.update(user.userId, updateDto);
}
```

**Задача 2.2.3:** Rate limiting for profile updates
- [ ] Apply @Throttle(5, 3600) - 5 requests per hour
- [ ] Document rate limit in Swagger

**Acceptance Criteria:**
- ✅ Profile update works
- ✅ Input validation enforced
- ✅ Rate limiting active (5 req/hour)
- ✅ Audit log entry created

---

#### 2.3 Profile Photo Upload

**Задача 2.3.1:** Install dependencies
```bash
pnpm add @nestjs/platform-express multer @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add @types/multer -D
```

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
- [ ] Validate MIME type (image/jpeg, image/png, image/webp only)
- [ ] Validate file size (max 5MB)
- [ ] Strip EXIF metadata (use sharp library)
- [ ] Generate unique filename (UUID + timestamp)

**Задача 2.3.4:** S3 upload service
```typescript
// api/src/shared/file-upload/file-upload.service.ts
@Injectable()
export class FileUploadService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    // Strip EXIF, resize, optimize, upload to S3
    // Return CloudFront URL
  }

  async deleteImage(key: string): Promise<void> {
    // Delete from S3
  }
}
```

**Задача 2.3.5:** Upload endpoint
```typescript
@Post('me/avatar')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({ type: FileUploadDto })
async uploadAvatar(
  @CurrentUser() user: JwtPayload,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
      ],
    }),
  )
  file: Express.Multer.File,
) {
  return this.usersService.uploadAvatar(user.userId, file);
}
```

**Acceptance Criteria:**
- ✅ File upload works (avatar)
- ✅ MIME type validation enforced
- ✅ File size limit enforced (5MB)
- ✅ EXIF metadata stripped
- ✅ Images optimized and resized
- ✅ S3 upload successful
- ✅ CloudFront URL returned
- ✅ Old avatar deleted on new upload

---

### 3. Contractor Profile Module (Day 3-4)

#### 3.1 Contractor Profile Setup

**Задача 3.1.1:** Create UpdateContractorProfileDto
```typescript
// api/src/users/dto/update-contractor-profile.dto.ts
import { IsString, IsOptional, IsNumber, Min, Max, IsArray, MaxLength } from 'class-validator';

export class UpdateContractorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(5, { each: true })
  categoryIds?: string[]; // Max 5 categories

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;
}
```

**Задача 3.1.2:** Endpoint PATCH /api/v1/users/me/contractor
```typescript
@Patch('me/contractor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@ApiOperation({ summary: 'Update contractor profile' })
async updateContractorProfile(
  @CurrentUser() user: JwtPayload,
  @Body() dto: UpdateContractorProfileDto,
) {
  return this.usersService.updateContractorProfile(user.userId, dto);
}
```

**Задача 3.1.3:** Implementation
- [ ] Check if user is CONTRACTOR
- [ ] Validate category IDs exist
- [ ] Update contractor record via Prisma
- [ ] Return updated contractor profile
- [ ] Create audit log entry

**Acceptance Criteria:**
- ✅ Contractor profile update works
- ✅ Only CONTRACTOR role can access
- ✅ Category validation works
- ✅ Max 5 categories enforced
- ✅ Audit log created

---

#### 3.2 Portfolio Management

**Задача 3.2.1:** Create Portfolio DTOs
```typescript
// api/src/users/dto/create-portfolio-item.dto.ts
export class CreatePortfolioItemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

// api/src/users/dto/update-portfolio-item.dto.ts
export class UpdatePortfolioItemDto extends PartialType(CreatePortfolioItemDto) {}
```

**Задача 3.2.2:** Portfolio endpoints
```typescript
@Post('me/portfolio')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@UseInterceptors(FileInterceptor('image'))
@ApiOperation({ summary: 'Add portfolio item (max 10 items)' })
async addPortfolioItem(
  @CurrentUser() user: JwtPayload,
  @Body() dto: CreatePortfolioItemDto,
  @UploadedFile() image: Express.Multer.File,
) {
  return this.usersService.addPortfolioItem(user.userId, dto, image);
}

@Patch('me/portfolio/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@ApiOperation({ summary: 'Update portfolio item' })
async updatePortfolioItem(
  @CurrentUser() user: JwtPayload,
  @Param('id') portfolioId: string,
  @Body() dto: UpdatePortfolioItemDto,
) {
  return this.usersService.updatePortfolioItem(user.userId, portfolioId, dto);
}

@Delete('me/portfolio/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Delete portfolio item' })
async deletePortfolioItem(
  @CurrentUser() user: JwtPayload,
  @Param('id') portfolioId: string,
) {
  await this.usersService.deletePortfolioItem(user.userId, portfolioId);
}
```

**Задача 3.2.3:** Business logic
- [ ] Check max 10 portfolio items per contractor
- [ ] Validate image upload (same as avatar)
- [ ] Upload image to S3 (folder: portfolio/)
- [ ] Store CloudFront URL in database
- [ ] Delete old image on portfolio item deletion
- [ ] Return portfolio item entity

**Acceptance Criteria:**
- ✅ Portfolio CRUD operations work
- ✅ Max 10 items enforced
- ✅ Image upload validated
- ✅ Images stored in S3
- ✅ Old images deleted on update/delete
- ✅ Only owner can modify their portfolio

---

#### 3.3 Services & Pricing

**Задача 3.3.1:** Create Service DTOs
```typescript
// api/src/users/dto/create-service.dto.ts
export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  pricingType?: 'fixed' | 'hourly' | 'negotiable';

  @IsOptional()
  @IsString()
  categoryId?: string;
}
```

**Задача 3.3.2:** Services endpoints
```typescript
@Post('me/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@ApiOperation({ summary: 'Add service offering' })
async addService(
  @CurrentUser() user: JwtPayload,
  @Body() dto: CreateServiceDto,
) {
  return this.usersService.addService(user.userId, dto);
}

@Get('me/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@ApiOperation({ summary: 'Get my services' })
async getMyServices(@CurrentUser() user: JwtPayload) {
  return this.usersService.getServices(user.userId);
}

@Patch('me/services/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@ApiOperation({ summary: 'Update service' })
async updateService(
  @CurrentUser() user: JwtPayload,
  @Param('id') serviceId: string,
  @Body() dto: UpdateServiceDto,
) {
  return this.usersService.updateService(user.userId, serviceId, dto);
}

@Delete('me/services/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
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
- ✅ Category assignment works
- ✅ Only owner can modify services

---

### 4. Geolocation & Privacy (Day 5)

#### 4.1 Location Update

**Задача 4.1.1:** Create UpdateLocationDto
```typescript
// api/src/users/dto/update-location.dto.ts
import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}
```

**Задача 4.1.2:** Endpoint PATCH /api/v1/users/me/location
```typescript
@Patch('me/location')
@UseGuards(JwtAuthGuard)
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
    const offsetLat = (Math.random() - 0.5) * 0.009; // ~500m
    const offsetLng = (Math.random() - 0.5) * 0.009; // ~500m

    return {
      lat: lat + offsetLat,
      lng: lng + offsetLng,
    };
  }

  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    // Haversine formula
    // Returns distance in kilometers
  }
}
```

**Задача 4.1.4:** Store location in PostGIS
- [ ] Store precise location (for admin/analytics)
- [ ] Store fuzzy location (for public display)
- [ ] Use Prisma with PostGIS geography type
- [ ] Return only city/district publicly
- [ ] Share precise address only after order acceptance

**Acceptance Criteria:**
- ✅ Location update works
- ✅ PostGIS geography type used
- ✅ Fuzzy location stored for privacy
- ✅ Precise location accessible only to authorized users
- ✅ City/district displayed publicly

---

#### 4.2 Geospatial Search

**Задача 4.2.1:** Search contractors by radius
```typescript
@Get('contractors/nearby')
@ApiOperation({ summary: 'Find contractors nearby' })
@ApiQuery({ name: 'lat', type: Number })
@ApiQuery({ name: 'lng', type: Number })
@ApiQuery({ name: 'radius', type: Number, description: 'Radius in km' })
@ApiQuery({ name: 'categoryId', required: false })
async findNearbyContractors(
  @Query('lat', ParseFloatPipe) lat: number,
  @Query('lng', ParseFloatPipe) lng: number,
  @Query('radius', ParseFloatPipe) radius: number,
  @Query('categoryId') categoryId?: string,
) {
  return this.usersService.findNearbyContractors(lat, lng, radius, categoryId);
}
```

**Задача 4.2.2:** Implement radius search with Prisma + PostGIS
```typescript
async findNearbyContractors(
  lat: number,
  lng: number,
  radius: number, // in km
  categoryId?: string,
) {
  // Use PostGIS ST_DWithin for radius search
  const contractors = await this.prisma.$queryRaw`
    SELECT u.*, c.*,
      ST_Distance(c.location::geography, ST_MakePoint(${lng}, ${lat})::geography) AS distance
    FROM "User" u
    JOIN "Contractor" c ON c."userId" = u.id
    WHERE u.role = 'CONTRACTOR'
      AND u."isVerified" = true
      AND ST_DWithin(
        c.location::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radius * 1000} -- Convert km to meters
      )
      ${categoryId ? Prisma.sql`AND c.id IN (
        SELECT "contractorId" FROM "ContractorCategory" WHERE "categoryId" = ${categoryId}
      )` : Prisma.empty}
    ORDER BY distance ASC
    LIMIT 50;
  `;

  return contractors.map(contractor => ({
    ...contractor,
    distance: Math.round(contractor.distance / 1000), // Convert to km
    location: null, // Hide precise location
    city: contractor.city, // Show only city
  }));
}
```

**Acceptance Criteria:**
- ✅ Radius search works (PostGIS)
- ✅ Distance calculated correctly
- ✅ Category filtering works
- ✅ Results sorted by distance
- ✅ Max 50 results returned
- ✅ Precise location hidden

---

### 5. Stripe Identity Verification (Day 6)

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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
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

  constructor(private configService: ConfigService, private prisma: PrismaService) {
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
        verificationSessionId: session.id,
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
async handleVerificationWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
  const event = this.stripe.webhooks.constructEvent(
    req.body,
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
        verifiedAt: new Date(),
      },
    });

    // Send notification email
    // Award verification badge
  }

  if (event.type === 'identity.verification_session.requires_input') {
    // Handle failed verification
  }

  return { received: true };
}
```

**Acceptance Criteria:**
- ✅ Verification session created
- ✅ Stripe Identity integration works
- ✅ Webhook handler processes events
- ✅ User marked as verified on success
- ✅ Verification badge awarded
- ✅ Notification sent on completion

---

### 6. PII Protection & Audit Logging (Day 7)

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
- [ ] Credit card data (if stored - NOT RECOMMENDED, use Stripe)
- [ ] License numbers
- [ ] Insurance numbers
- [ ] Precise location (for public API)

**Acceptance Criteria:**
- ✅ Encryption service works
- ✅ Sensitive fields encrypted at rest
- ✅ Decryption works for authorized users only
- ✅ AES-256 encryption used

---

#### 6.2 Audit Logging

**Задача 6.2.1:** Create AuditLog model (already in schema.prisma)
```typescript
// Prisma model
model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // "UPDATE_PROFILE", "DELETE_PORTFOLIO", etc.
  resource  String   // "USER", "PORTFOLIO", "SERVICE"
  metadata  Json?    // Additional data (changes made)
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Задача 6.2.2:** Create audit logging interceptor
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
          await this.prisma.auditLog.create({
            data: {
              userId: user?.userId,
              action: `${method}_${url}`,
              resource: this.extractResource(url),
              metadata: {
                body: request.body,
                params: request.params,
              },
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        }),
      );
    }

    return next.handle();
  }

  private extractResource(url: string): string {
    // Extract resource from URL (e.g., "/users/me/portfolio" -> "PORTFOLIO")
  }
}
```

**Задача 6.2.3:** Apply audit logging globally
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

### 7. Role Switching (Day 8)

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
  const newRole = user.role === Role.CLIENT ? Role.CONTRACTOR : Role.CLIENT;

  // If switching to CONTRACTOR and no contractor profile exists, create it
  if (newRole === Role.CONTRACTOR && !user.contractor) {
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
    updatedUser.role,
  );

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

### 8. Testing (Day 9)

#### 8.1 Unit Tests

**Задача 8.1.1:** UsersService Tests
- [ ] `findById()` - success case
- [ ] `findById()` - user not found
- [ ] `update()` - success case
- [ ] `update()` - validation errors
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

**Задача 8.1.2:** FileUploadService Tests
- [ ] `uploadImage()` - success
- [ ] `uploadImage()` - file size too large
- [ ] `uploadImage()` - invalid MIME type
- [ ] `deleteImage()` - success

#### 8.2 E2E Tests

**Задача 8.2.1:** Profile Management
- [ ] GET /users/me → 200 with user profile
- [ ] PATCH /users/me → 200 with updated profile
- [ ] PATCH /users/me without auth → 401

**Задача 8.2.2:** Contractor Profile
- [ ] PATCH /users/me/contractor → 200 (CONTRACTOR role)
- [ ] PATCH /users/me/contractor → 403 (CLIENT role)

**Задача 8.2.3:** Portfolio Management
- [ ] POST /users/me/portfolio → 201
- [ ] POST /users/me/portfolio (11th item) → 400
- [ ] DELETE /users/me/portfolio/:id → 204

**Задача 8.2.4:** Geolocation
- [ ] PATCH /users/me/location → 200
- [ ] GET /users/contractors/nearby → 200 with contractors
- [ ] GET /users/contractors/nearby (0 results) → 200 []

**Задача 8.2.5:** File Upload
- [ ] POST /users/me/avatar (valid image) → 200
- [ ] POST /users/me/avatar (invalid file) → 400

**Acceptance Criteria:**
- ✅ Unit test coverage > 80%
- ✅ All E2E tests pass
- ✅ Edge cases covered

---

### 9. Security Audit (Day 10)

#### 9.1 Security Checklist Review

**Задача 9.1.1:** File Upload Security
- [ ] MIME type validation enforced ✓
- [ ] File size limits enforced (5MB) ✓
- [ ] EXIF metadata stripped ✓
- [ ] Virus scanning (ClamAV or cloud service) ⚠️ (Optional)
- [ ] Images optimized and resized ✓
- [ ] S3 bucket ACLs configured (private) ✓

**Задача 9.1.2:** PII Protection
- [ ] Sensitive fields encrypted (AES-256) ✓
- [ ] PII masked in logs ✓
- [ ] Precise location hidden publicly ✓
- [ ] Fuzzy location used (±500m) ✓
- [ ] Access control for sensitive data ✓

**Задача 9.1.3:** Input Validation
- [ ] All DTOs validated with class-validator ✓
- [ ] SQL injection prevented (Prisma) ✓
- [ ] Max array lengths enforced ✓
- [ ] String length limits enforced ✓

**Задача 9.1.4:** Rate Limiting
- [ ] Profile updates: 5 req/hour ✓
- [ ] File uploads: 10 req/hour ✓
- [ ] Location updates: 10 req/hour ✓

**Задача 9.1.5:** Audit Logging
- [ ] All mutations logged ✓
- [ ] User actions tracked ✓
- [ ] No sensitive data in logs ✓

**Acceptance Criteria:**
- ✅ All security requirements met
- ✅ No vulnerabilities found
- ✅ Code review completed

---

## 📊 Progress Tracking

### Daily Milestones

**Day 1:** Users Module Setup + Profile Management
- [ ] Users module structure created
- [ ] CurrentUser decorator implemented
- [ ] GET /users/me endpoint working
- [ ] PATCH /users/me endpoint working

**Day 2:** Profile Photo Upload
- [ ] FileUploadModule created
- [ ] S3 integration working
- [ ] Avatar upload endpoint working
- [ ] File validation enforced

**Day 3-4:** Contractor Profile + Portfolio
- [ ] Contractor profile update working
- [ ] Portfolio CRUD operations working
- [ ] Services CRUD operations working
- [ ] Max 10 portfolio items enforced

**Day 5:** Geolocation & Privacy
- [ ] Location update endpoint working
- [ ] PostGIS integration working
- [ ] Fuzzy location implemented
- [ ] Radius search working

**Day 6:** Stripe Identity Verification
- [ ] Verification session creation working
- [ ] Webhook handler implemented
- [ ] User marked as verified on success

**Day 7:** PII Protection & Audit Logging
- [ ] Encryption service implemented
- [ ] Sensitive fields encrypted
- [ ] Audit logging interceptor created
- [ ] Audit logs created for mutations

**Day 8:** Role Switching
- [ ] Role switching endpoint working
- [ ] Contractor profile auto-created
- [ ] New JWT tokens generated

**Day 9:** Testing
- [ ] Unit tests written (80%+ coverage)
- [ ] E2E tests pass

**Day 10:** Security Audit
- [ ] Security checklist complete
- [ ] No vulnerabilities found

---

## 🔗 Dependencies

### Must be completed before Phase 2:
- ✅ Phase 0: Foundation & Infrastructure
- ✅ Phase 1: Authentication & Authorization

### Required for Phase 2:
- Users table (from Phase 1)
- Contractor, Portfolio, Service models
- FileUploadModule
- S3 bucket configured
- Stripe Identity configured
- PostGIS enabled in PostgreSQL

---

## 📝 Definition of Done

Phase 2 считается завершенным когда:

- [ ] ✅ All endpoints работают корректно
- [ ] ✅ User profile management функционирует
- [ ] ✅ Contractor profile system работает
- [ ] ✅ Portfolio management (max 10 items) работает
- [ ] ✅ Services CRUD operations работают
- [ ] ✅ File upload (avatar, portfolio) работает
- [ ] ✅ S3 integration работает
- [ ] ✅ Geolocation (PostGIS + fuzzy) работает
- [ ] ✅ Radius search функционирует
- [ ] ✅ Stripe Identity verification интегрирована
- [ ] ✅ PII protection (encryption) реализована
- [ ] ✅ Audit logging работает
- [ ] ✅ Role switching функционирует
- [ ] ✅ Unit tests pass (80%+ coverage)
- [ ] ✅ E2E tests pass
- [ ] ✅ Security audit пройден
- [ ] ✅ Documentation обновлена
- [ ] ✅ Code review completed

---

## 🚀 Next Steps

После завершения Phase 2, переходим к **Phase 3: Orders Module**

---

**Created:** January 2025
**Last Updated:** January 2025
**Status:** Ready for implementation
