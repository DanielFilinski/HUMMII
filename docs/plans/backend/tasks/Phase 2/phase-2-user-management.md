# Phase 2: User Management Module

**Duration:** Week 5-6  
**Priority:** 🔴 CRITICAL (MVP)  
**Status:** Not Started  
**Dependencies:** Phase 1 (Authentication & Authorization) must be complete

---

## Цели фазы

Реализовать полноценную систему управления пользователями с поддержкой:
- Профили пользователей (CLIENT и CONTRACTOR)
- Portfolio management для подрядчиков
- Геолокация с PostGIS (privacy-focused)
- Загрузка и обработка файлов (фото, лицензии)
- PII protection и PIPEDA compliance
- Stripe Identity verification

---

## Задача 1: Users Module Setup

**Приоритет:** 🔴 CRITICAL  
**Время:** 1 день

### 1.1 Module Structure

**Цель:** Создать базовую структуру users модуля

#### Подзадачи:
- [ ] **1.1.1** Создать users module
  ```bash
  cd src
  nest g module users
  nest g service users
  nest g controller users
  ```
  
  Структура:
  ```
  src/users/
  ├── users.module.ts
  ├── users.service.ts
  ├── users.controller.ts
  ├── dto/
  │   ├── update-profile.dto.ts
  │   ├── create-contractor-profile.dto.ts
  │   ├── update-contractor-profile.dto.ts
  │   └── upload-file.dto.ts
  ├── entities/
  │   ├── user.entity.ts
  │   ├── profile.entity.ts
  │   └── contractor.entity.ts
  └── guards/
      ├── profile-owner.guard.ts
      └── contractor-verified.guard.ts
  ```

- [ ] **1.1.2** Обновить Prisma schema для User Management
  ```prisma
  model User {
    id                  String    @id @default(uuid())
    email               String    @unique
    passwordHash        String
    role                UserRole  @default(CLIENT)
    isVerified          Boolean   @default(false)
    failedLoginAttempts Int       @default(0)
    lastFailedLogin     DateTime?
    accountLockedUntil  DateTime?
    createdAt           DateTime  @default(now())
    updatedAt           DateTime  @updatedAt
    
    profile             Profile?
    contractor          Contractor?
    refreshTokens       RefreshToken[]
    emailVerifications  EmailVerification[]
    
    @@map("users")
  }
  
  model Profile {
    id          String   @id @default(uuid())
    userId      String   @unique
    firstName   String
    lastName    String
    phone       String?  @unique
    avatar      String?
    bio         String?
    location    Unsupported("geography(Point,4326)")?
    address     String?
    city        String?
    province    String?
    postalCode  String?
    country     String   @default("Canada")
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
    description       String?
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
    description   String?
    imageUrl      String
    order         Int        @default(0)
    createdAt     DateTime   @default(now())
    
    contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
    
    @@map("portfolio")
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
    
    contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
    
    @@map("contractor_licenses")
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
  }
  
  model ContractorService {
    id            String     @id @default(uuid())
    contractorId  String
    name          String
    description   String?
    price         Decimal?   @db.Decimal(10, 2)
    priceType     PriceType  @default(HOURLY)
    createdAt     DateTime   @default(now())
    updatedAt     DateTime   @updatedAt
    
    contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)
    
    @@map("contractor_services")
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

- [ ] **1.1.3** Создать и применить миграцию
  ```bash
  npx prisma migrate dev --name add_user_management_tables
  npx prisma generate
  ```

#### Критерии приемки:
- ✅ Users module создан
- ✅ Prisma schema обновлена
- ✅ Миграция применена
- ✅ TypeScript types сгенерированы

---

## Задача 2: User Profile Management

**Приоритет:** 🔴 CRITICAL  
**Время:** 2 дня

### 2.1 Get User Profile

**Цель:** Получение профиля текущего пользователя

#### Подзадачи:
- [ ] **2.1.1** Создать endpoint для получения профиля
  ```typescript
  // src/users/users.controller.ts
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }
  ```

- [ ] **2.1.2** Реализовать сервис
  ```typescript
  // src/users/users.service.ts
  async getProfile(userId: string): Promise<UserProfileResponse> {
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
          },
        },
      },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Mask sensitive data if needed
    return this.mapToProfileResponse(user);
  }
  
  private mapToProfileResponse(user: User & { profile: Profile; contractor?: Contractor }): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        avatar: user.profile.avatar,
        bio: user.profile.bio,
        city: user.profile.city,
        province: user.profile.province,
        // Don't expose full address unless necessary
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
        portfolio: user.contractor.portfolio,
      } : null,
    };
  }
  ```

#### Критерии приемки:
- ✅ User can get their own profile
- ✅ Sensitive data masked appropriately
- ✅ Contractor data included if role is CONTRACTOR
- ✅ Returns 404 if user not found

---

### 2.2 Update User Profile

**Цель:** Обновление базовой информации профиля

#### Подзадачи:
- [ ] **2.2.1** Создать UpdateProfileDto
  ```typescript
  // src/users/dto/update-profile.dto.ts
  export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName?: string;
    
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName?: string;
    
    @IsOptional()
    @IsString()
    @Matches(/^\+1\d{10}$/, {
      message: 'Phone must be in format +1XXXXXXXXXX',
    })
    phone?: string;
    
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;
    
    @IsOptional()
    @IsString()
    city?: string;
    
    @IsOptional()
    @IsString()
    @IsIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
    province?: string;
    
    @IsOptional()
    @Validate(CanadianPostalCodeValidator)
    postalCode?: string;
    
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
  }
  ```

- [ ] **2.2.2** Создать endpoint для обновления
  ```typescript
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 updates per hour
  async updateMyProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
  ```

- [ ] **2.2.3** Реализовать update service
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
          update: {
            ...dto,
          },
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
      metadata: { fields: Object.keys(dto) },
    });
    
    return this.mapToProfileResponse(updatedUser);
  }
  ```

#### Security Requirements:
- [ ] Rate limiting: 5 updates per hour
- [ ] Phone uniqueness validation
- [ ] Canadian postal code validation
- [ ] Audit logging
- [ ] Input sanitization

#### Критерии приемки:
- ✅ User can update their profile
- ✅ Phone uniqueness enforced
- ✅ Validation works correctly
- ✅ Rate limiting prevents abuse
- ✅ Audit log created

---

### 2.3 Profile Photo Upload

**Цель:** Загрузка и обработка фотографии профиля

#### Подзадачи:
- [ ] **2.3.1** Установить dependencies
  ```bash
  pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  pnpm add sharp
  pnpm add file-type
  ```

- [ ] **2.3.2** Создать FileUploadService
  ```typescript
  // src/shared/files/file-upload.service.ts
  @Injectable()
  export class FileUploadService {
    private s3Client: S3Client;
    
    constructor(private config: ConfigService) {
      this.s3Client = new S3Client({
        region: config.get('AWS_REGION'),
        credentials: {
          accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
        },
      });
    }
    
    async uploadProfilePhoto(
      userId: string,
      file: Express.Multer.File,
    ): Promise<string> {
      // 1. Validate file type
      await this.validateImageFile(file);
      
      // 2. Strip EXIF metadata and resize
      const processedBuffer = await this.processImage(file.buffer);
      
      // 3. Generate unique filename
      const filename = `profiles/${userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.jpg`;
      
      // 4. Upload to S3
      const uploadParams = {
        Bucket: this.config.get('AWS_S3_BUCKET'),
        Key: filename,
        Body: processedBuffer,
        ContentType: 'image/jpeg',
        ServerSideEncryption: 'AES256',
      };
      
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      // 5. Return URL
      return `https://${this.config.get('AWS_S3_BUCKET')}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${filename}`;
    }
    
    async validateImageFile(file: Express.Multer.File): Promise<void> {
      // Check size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size must not exceed 5MB');
      }
      
      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
      }
      
      // Validate file signature (magic numbers)
      const fileType = await fileTypeFromBuffer(file.buffer);
      if (!fileType || !['jpg', 'png', 'webp'].includes(fileType.ext)) {
        throw new BadRequestException('Invalid file type');
      }
    }
    
    async processImage(buffer: Buffer): Promise<Buffer> {
      return sharp(buffer)
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
    }
    
    async deleteFile(url: string): Promise<void> {
      const key = this.extractKeyFromUrl(url);
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.get('AWS_S3_BUCKET'),
          Key: key,
        }),
      );
    }
    
    private extractKeyFromUrl(url: string): string {
      const urlObj = new URL(url);
      return urlObj.pathname.slice(1); // Remove leading slash
    }
  }
  ```

- [ ] **2.3.3** Создать upload endpoint
  ```typescript
  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 uploads per hour
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Upload new avatar
    const avatarUrl = await this.fileUploadService.uploadProfilePhoto(
      user.id,
      file,
    );
    
    // Delete old avatar if exists
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
      select: { avatar: true },
    });
    
    if (profile?.avatar) {
      await this.fileUploadService.deleteFile(profile.avatar);
    }
    
    // Update profile with new avatar
    await this.prisma.profile.update({
      where: { userId: user.id },
      data: { avatar: avatarUrl },
    });
    
    // Log upload
    await this.auditService.log({
      userId: user.id,
      action: 'AVATAR_UPLOADED',
      metadata: { url: avatarUrl },
    });
    
    return { avatarUrl };
  }
  ```

- [ ] **2.3.4** Добавить virus scanning (optional but recommended)
  ```typescript
  // Using ClamAV or cloud service
  async scanFile(buffer: Buffer): Promise<boolean> {
    // Implement virus scanning
    // Return true if clean, false if infected
  }
  ```

#### Security Requirements:
- [ ] File size limit: 5MB
- [ ] MIME type validation
- [ ] File signature validation (magic numbers)
- [ ] EXIF metadata stripping
- [ ] Image resizing (800x800)
- [ ] S3 server-side encryption
- [ ] Rate limiting: 10 uploads/hour
- [ ] Virus scanning (recommended)
- [ ] Delete old avatar on new upload
- [ ] Audit logging

#### Критерии приемки:
- ✅ User can upload profile photo
- ✅ File validation works
- ✅ EXIF data stripped
- ✅ Image resized correctly
- ✅ Old avatar deleted
- ✅ S3 upload successful
- ✅ Rate limiting prevents abuse

---

## Задача 3: Contractor Profile Management

**Приоритет:** 🔴 CRITICAL  
**Время:** 2 дня

### 3.1 Create Contractor Profile

**Цель:** Создание профиля подрядчика

#### Подзадачи:
- [ ] **3.1.1** Создать CreateContractorProfileDto
  ```typescript
  // src/users/dto/create-contractor-profile.dto.ts
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

- [ ] **3.1.2** Создать endpoint
  ```typescript
  @Post('me/contractor')
  @UseGuards(JwtAuthGuard)
  async createContractorProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateContractorProfileDto,
  ) {
    // Check if user already has contractor profile
    const existing = await this.prisma.contractor.findUnique({
      where: { userId: user.id },
    });
    
    if (existing) {
      throw new ConflictException('Contractor profile already exists');
    }
    
    return this.usersService.createContractorProfile(user.id, dto);
  }
  ```

- [ ] **3.1.3** Реализовать service
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
      data: { role: UserRole.CONTRACTOR },
    });
    
    // Log contractor profile creation
    await this.auditService.log({
      userId,
      action: 'CONTRACTOR_PROFILE_CREATED',
      metadata: { contractorId: contractor.id },
    });
    
    return contractor;
  }
  ```

#### Критерии приемки:
- ✅ User can create contractor profile
- ✅ User role updated to CONTRACTOR
- ✅ Categories validated and assigned
- ✅ Primary category marked
- ✅ Audit log created

---

### 3.2 Portfolio Management

**Цель:** Управление портфолио работ (max 10 работ)

#### Подзадачи:
- [ ] **3.2.1** Создать AddPortfolioItemDto
  ```typescript
  // src/users/dto/add-portfolio-item.dto.ts
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
  ```

- [ ] **3.2.2** Создать endpoint для добавления работы
  ```typescript
  @Post('me/contractor/portfolio')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 uploads per hour
  async addPortfolioItem(
    @CurrentUser() user: User,
    @Body() dto: AddPortfolioItemDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Image is required');
    }
    
    return this.usersService.addPortfolioItem(user.id, dto, image);
  }
  ```

- [ ] **3.2.3** Реализовать service
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
    const imageUrl = await this.fileUploadService.uploadPortfolioImage(
      contractor.id,
      image,
    );
    
    // Create portfolio item
    const portfolioItem = await this.prisma.portfolio.create({
      data: {
        contractorId: contractor.id,
        title: dto.title,
        description: dto.description,
        imageUrl,
        order: contractor.portfolio.length, // Add to end
      },
    });
    
    // Update portfolio count
    await this.prisma.contractor.update({
      where: { id: contractor.id },
      data: {
        portfolioCount: { increment: 1 },
      },
    });
    
    // Log addition
    await this.auditService.log({
      userId,
      action: 'PORTFOLIO_ITEM_ADDED',
      metadata: { portfolioItemId: portfolioItem.id },
    });
    
    return portfolioItem;
  }
  ```

- [ ] **3.2.4** Endpoint для удаления работы из портфолио
  ```typescript
  @Delete('me/contractor/portfolio/:id')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  async deletePortfolioItem(
    @CurrentUser() user: User,
    @Param('id') portfolioItemId: string,
  ) {
    return this.usersService.deletePortfolioItem(user.id, portfolioItemId);
  }
  ```

- [ ] **3.2.5** Реализовать delete service
  ```typescript
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
    
    // Delete image from S3
    await this.fileUploadService.deleteFile(item.imageUrl);
    
    // Delete portfolio item
    await this.prisma.portfolio.delete({
      where: { id: portfolioItemId },
    });
    
    // Update portfolio count
    await this.prisma.contractor.update({
      where: { id: contractor.id },
      data: {
        portfolioCount: { decrement: 1 },
      },
    });
    
    // Reorder remaining items
    await this.reorderPortfolio(contractor.id);
    
    // Log deletion
    await this.auditService.log({
      userId,
      action: 'PORTFOLIO_ITEM_DELETED',
      metadata: { portfolioItemId },
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

- [ ] **3.2.6** Endpoint для reorder portfolio
  ```typescript
  @Patch('me/contractor/portfolio/reorder')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  async reorderPortfolio(
    @CurrentUser() user: User,
    @Body() dto: ReorderPortfolioDto, // { itemIds: string[] }
  ) {
    return this.usersService.reorderPortfolioItems(user.id, dto.itemIds);
  }
  ```

#### Security Requirements:
- [ ] Max 10 portfolio items
- [ ] File validation (same as avatar)
- [ ] Only contractor owner can modify
- [ ] Image stored in S3
- [ ] Old images deleted
- [ ] Rate limiting
- [ ] Audit logging

#### Критерии приемки:
- ✅ Contractor can add portfolio item (max 10)
- ✅ Image uploaded and validated
- ✅ Portfolio count updated
- ✅ Can delete portfolio item
- ✅ Images deleted from S3
- ✅ Can reorder portfolio items
- ✅ Audit logs created

---

### 3.3 Services and Pricing

**Цель:** Управление услугами и ценами

#### Подзадачи:
- [ ] **3.3.1** Создать AddServiceDto
  ```typescript
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
  ```

- [ ] **3.3.2** CRUD endpoints для services
  ```typescript
  @Post('me/contractor/services')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  async addService(
    @CurrentUser() user: User,
    @Body() dto: AddServiceDto,
  ) {
    return this.usersService.addService(user.id, dto);
  }
  
  @Patch('me/contractor/services/:id')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  async updateService(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.usersService.updateService(user.id, serviceId, dto);
  }
  
  @Delete('me/contractor/services/:id')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  async deleteService(
    @CurrentUser() user: User,
    @Param('id') serviceId: string,
  ) {
    return this.usersService.deleteService(user.id, serviceId);
  }
  ```

#### Критерии приемки:
- ✅ Contractor can add services
- ✅ Can update service pricing
- ✅ Can delete services
- ✅ Price types supported

---

### 3.4 License Upload

**Цель:** Загрузка профессиональных лицензий

#### Подзадачи:
- [ ] **3.4.1** Создать AddLicenseDto
  ```typescript
  export class AddLicenseDto {
    @IsString()
    @MinLength(3)
    type: string; // e.g., "Electrician License"
    
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

- [ ] **3.4.2** Endpoint для загрузки лицензии
  ```typescript
  @Post('me/contractor/licenses')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addLicense(
    @CurrentUser() user: User,
    @Body() dto: AddLicenseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addLicense(user.id, dto, file);
  }
  ```

- [ ] **3.4.3** Реализовать service
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
        contractor.id,
        file,
        'licenses',
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
      metadata: { licenseId: license.id },
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

#### Критерии приемки:
- ✅ Contractor can upload licenses
- ✅ PDF validation works
- ✅ Stored in S3
- ✅ Requires admin verification
- ✅ Audit log created

---

## Задача 4: Geolocation (PostGIS)

**Приоритет:** 🔴 CRITICAL  
**Время:** 1-2 дня

### 4.1 Location Storage

**Цель:** Хранение location с privacy (fuzzy location ±500m)

#### Подзадачи:
- [ ] **4.1.1** Создать UpdateLocationDto
  ```typescript
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
    
    @Validate(CanadianPostalCodeValidator)
    postalCode: string;
  }
  ```

- [ ] **4.1.2** Endpoint для обновления location
  ```typescript
  @Patch('me/location')
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @CurrentUser() user: User,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.usersService.updateLocation(user.id, dto);
  }
  ```

- [ ] **4.1.3** Реализовать service с PostGIS
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
      metadata: { city: dto.city, province: dto.province },
    });
    
    return profile;
  }
  ```

- [ ] **4.1.4** Fuzzy location для privacy
  ```typescript
  async getFuzzyLocation(userId: string): Promise<{ lat: number; lng: number }> {
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
    const offsetMeters = 500;
    const latOffset = (Math.random() - 0.5) * 2 * (offsetMeters / 111320); // 1 degree latitude ≈ 111.32 km
    const lngOffset = (Math.random() - 0.5) * 2 * (offsetMeters / (111320 * Math.cos(profile.latitude * Math.PI / 180)));
    
    return {
      lat: profile.latitude + latOffset,
      lng: profile.longitude + lngOffset,
    };
  }
  ```

#### Критерии приемки:
- ✅ User can set location
- ✅ Location stored as PostGIS Point
- ✅ Fuzzy location returned for privacy
- ✅ Full address only shared after order acceptance
- ✅ Audit log created

---

### 4.2 Radius Search

**Цель:** Поиск по радиусу с PostGIS

#### Подзадачи:
- [ ] **4.2.1** Создать SearchContractorsDto
  ```typescript
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
    radiusKm?: number = 10; // Default 10km
    
    @IsOptional()
    @IsString()
    categoryId?: string;
  }
  ```

- [ ] **4.2.2** Endpoint для поиска
  ```typescript
  @Get('contractors/search')
  async searchContractors(@Query() dto: SearchContractorsDto) {
    return this.usersService.searchContractors(dto);
  }
  ```

- [ ] **4.2.3** Реализовать search с PostGIS
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
      })),
      page: dto.page,
      limit: dto.limit,
    };
  }
  ```

#### Критерии приемки:
- ✅ Search by radius works
- ✅ PostGIS queries optimized
- ✅ Only verified contractors returned
- ✅ Distance calculated correctly
- ✅ Category filtering works
- ✅ Pagination supported

---

## Задача 5: Stripe Identity Verification

**Приоритет:** 🟡 HIGH  
**Время:** 1 день

### 5.1 Identity Verification

**Цель:** Верификация подрядчиков через Stripe Identity

#### Подзадачи:
- [ ] **5.1.1** Установить Stripe SDK
  ```bash
  pnpm add stripe
  ```

- [ ] **5.1.2** Создать VerificationService
  ```typescript
  // src/shared/verification/verification.service.ts
  @Injectable()
  export class VerificationService {
    private stripe: Stripe;
    
    constructor(private config: ConfigService) {
      this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
        apiVersion: '2023-10-16',
      });
    }
    
    async createVerificationSession(userId: string): Promise<string> {
      const session = await this.stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: { userId },
        options: {
          document: {
            allowed_types: ['driving_license', 'passport', 'id_card'],
            require_live_capture: true,
            require_matching_selfie: true,
          },
        },
      });
      
      return session.client_secret;
    }
    
    async handleVerificationWebhook(event: Stripe.Event): Promise<void> {
      if (event.type === 'identity.verification_session.verified') {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        const userId = session.metadata.userId;
        
        // Mark contractor as verified
        await this.prisma.contractor.updateMany({
          where: { userId },
          data: {
            isVerified: true,
            verificationDate: new Date(),
          },
        });
        
        // Send notification
        await this.notificationService.send({
          userId,
          type: 'CONTRACTOR_VERIFIED',
          title: 'Verification Complete',
          message: 'Your contractor profile has been verified!',
        });
      }
    }
  }
  ```

- [ ] **5.1.3** Endpoint для создания verification session
  ```typescript
  @Post('me/contractor/verify')
  @UseGuards(JwtAuthGuard, ContractorGuard)
  async createVerificationSession(@CurrentUser() user: User) {
    const clientSecret = await this.verificationService.createVerificationSession(
      user.id,
    );
    
    return { clientSecret };
  }
  ```

- [ ] **5.1.4** Webhook endpoint для Stripe
  ```typescript
  @Post('webhooks/stripe/identity')
  async handleStripeIdentityWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      this.config.get('STRIPE_IDENTITY_WEBHOOK_SECRET'),
    );
    
    await this.verificationService.handleVerificationWebhook(event);
    
    return { received: true };
  }
  ```

#### Security Requirements:
- [ ] Stripe webhook signature verification
- [ ] Only contractors can request verification
- [ ] Live capture required
- [ ] Matching selfie required
- [ ] Metadata includes userId
- [ ] Audit logging

#### Критерии приемки:
- ✅ Contractor can initiate verification
- ✅ Stripe Identity session created
- ✅ Webhook signature verified
- ✅ Contractor marked as verified
- ✅ Notification sent

---

## Задача 6: PII Protection & PIPEDA Compliance

**Приоритет:** 🔴 CRITICAL  
**Время:** 1 день

### 6.1 Data Masking

**Цель:** Маскировка PII в логах и API responses

#### Подзадачи:
- [ ] **6.1.1** Обновить LoggerService для masking
  ```typescript
  // src/shared/logger/logger.service.ts
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
  ```

- [ ] **6.1.2** Создать interceptor для admin endpoints
  ```typescript
  // src/core/interceptors/mask-pii.interceptor.ts
  @Injectable()
  export class MaskPIIInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      return next.handle().pipe(
        map(data => {
          // Only admins can see full PII
          if (user?.role === UserRole.ADMIN) {
            return data;
          }
          
          // Mask PII for non-admin users
          return this.maskSensitiveData(data);
        }),
      );
    }
    
    private maskSensitiveData(data: any): any {
      // Implement PII masking logic
      return data;
    }
  }
  ```

#### Критерии приемки:
- ✅ Email masked in logs
- ✅ Phone masked in logs
- ✅ Passwords never logged
- ✅ Tokens never logged
- ✅ Admin can see full data
- ✅ Regular users see masked data

---

### 6.2 User Data Export

**Цель:** PIPEDA Right to Access - экспорт всех данных пользователя

#### Подзадачи:
- [ ] **6.2.1** Endpoint для экспорта
  ```typescript
  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  async exportMyData(@CurrentUser() user: User) {
    return this.usersService.exportUserData(user.id);
  }
  ```

- [ ] **6.2.2** Реализовать export service
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
        // All data user has right to access
      },
    };
  }
  ```

#### Критерии приемки:
- ✅ User can export all their data
- ✅ Export includes all related data
- ✅ JSON format
- ✅ Timestamp included

---

## Deliverables

### Must Have
- [x] Users module with full CRUD
- [x] Profile management (client profile)
- [x] Contractor profile creation
- [x] Portfolio management (max 10 items)
- [x] Services and pricing
- [x] License upload
- [x] Profile photo upload with security
- [x] Geolocation with PostGIS
- [x] Fuzzy location for privacy
- [x] Radius search functionality
- [x] Stripe Identity verification
- [x] PII masking in logs
- [x] User data export (PIPEDA)

### Quality Gates
- [ ] All endpoints tested (E2E)
- [ ] File upload security verified
- [ ] PostGIS queries optimized
- [ ] PII masking works correctly
- [ ] Geolocation privacy enforced
- [ ] Portfolio limit enforced (10 max)
- [ ] Category limit enforced (5 max)
- [ ] Audit logging complete

### Security Checklist
- [ ] File upload validation (MIME, size, magic numbers)
- [ ] EXIF metadata stripped from images
- [ ] Image resizing and optimization
- [ ] S3 server-side encryption
- [ ] Virus scanning (recommended)
- [ ] Rate limiting on uploads
- [ ] PII masking in logs
- [ ] Fuzzy location (±500m)
- [ ] Full address only after order acceptance
- [ ] Stripe Identity verification
- [ ] Audit logging for all sensitive actions

---

## Testing Strategy

### Unit Tests
```typescript
describe('UsersService', () => {
  it('should create contractor profile', async () => {
    const dto = mockCreateContractorDto;
    const result = await service.createContractorProfile(userId, dto);
    expect(result.userId).toBe(userId);
    expect(result.categories).toHaveLength(dto.categoryIds.length);
  });
  
  it('should enforce portfolio limit', async () => {
    // Create 10 portfolio items
    // Attempt to add 11th should fail
    await expect(
      service.addPortfolioItem(userId, dto, file),
    ).rejects.toThrow('Maximum 10 portfolio items allowed');
  });
  
  it('should mask PII in logs', () => {
    const data = { email: 'test@example.com', phone: '+11234567890' };
    const masked = logger.maskPII(data);
    expect(masked.email).toBe('t***@example.com');
    expect(masked.phone).toBe('***-***-7890');
  });
});
```

### E2E Tests
```typescript
describe('Users (e2e)', () => {
  it('/users/me (GET) - get profile', () => {
    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body.profile).toBeDefined();
      });
  });
  
  it('/users/me/avatar (POST) - upload avatar', () => {
    return request(app.getHttpServer())
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', 'test/fixtures/avatar.jpg')
      .expect(201);
  });
  
  it('should enforce file size limit', () => {
    return request(app.getHttpServer())
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', 'test/fixtures/large-file.jpg') // > 5MB
      .expect(400);
  });
});
```

### PostGIS Tests
```typescript
describe('Geolocation', () => {
  it('should search contractors by radius', async () => {
    const dto = {
      latitude: 43.6532,
      longitude: -79.3832,
      radiusKm: 10,
    };
    
    const result = await service.searchContractors(dto);
    expect(result.contractors).toBeDefined();
    expect(result.contractors[0].distance_km).toBeLessThanOrEqual(10);
  });
  
  it('should return fuzzy location', async () => {
    const fuzzyLocation = await service.getFuzzyLocation(userId);
    const actualLocation = await getActualLocation(userId);
    
    const distance = calculateDistance(fuzzyLocation, actualLocation);
    expect(distance).toBeLessThanOrEqual(500); // ±500m
  });
});
```

---

## Next Steps

После завершения Phase 2:
1. ✅ Verify all deliverables complete
2. ✅ Run security checklist
3. ✅ Run all tests (unit + E2E + PostGIS)
4. ✅ Test file uploads with various file types
5. ✅ Verify PII masking works
6. ✅ Test geolocation search accuracy
7. ➡️ **Proceed to Phase 3: Orders Module**

---

**Last Updated:** January 2025  
**Status:** Ready to Start  
**Owner:** Backend Team
