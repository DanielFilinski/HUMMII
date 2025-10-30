# Phase 1: Core Modules - Authentication & Authorization

**Duration:** Week 3-4  
**Priority:** 🔴 CRITICAL (MVP)  
**Status:** Not Started  
**Dependencies:** Phase 0 (Foundation) must be complete

---

## Цели фазы

Реализовать полноценную систему аутентификации и авторизации с максимальным уровнем безопасности, включая:
- JWT-based authentication с refresh tokens
- Email verification (обязательно)
- Password security (bcrypt cost 12+)
- OAuth2.0 (Google, Apple Sign In)
- Role-Based Access Control (RBAC)
- Session management
- Device tracking
- Account security (lockout после N попыток)

---

## Задача 1: Authentication Module - Core

**Приоритет:** 🔴 CRITICAL  
**Время:** 3-4 дня

### 1.1 Module Setup

**Цель:** Создать базовую структуру auth модуля

#### Подзадачи:
- [ ] **1.1.1** Создать auth module structure
  ```bash
  cd src
  nest g module auth
  nest g service auth
  nest g controller auth
  ```
  
  Структура:
  ```
  src/auth/
  ├── auth.module.ts
  ├── auth.service.ts
  ├── auth.controller.ts
  ├── dto/
  │   ├── register.dto.ts
  │   ├── login.dto.ts
  │   ├── refresh-token.dto.ts
  │   └── verify-email.dto.ts
  ├── entities/
  │   ├── refresh-token.entity.ts
  │   └── email-verification.entity.ts
  ├── guards/
  │   ├── jwt-auth.guard.ts
  │   ├── roles.guard.ts
  │   └── email-verified.guard.ts
  ├── strategies/
  │   ├── jwt.strategy.ts
  │   └── jwt-refresh.strategy.ts
  └── decorators/
      ├── current-user.decorator.ts
      └── roles.decorator.ts
  ```
  
- [ ] **1.1.2** Установить dependencies
  ```bash
  pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
  pnpm add bcrypt
  pnpm add -D @types/bcrypt @types/passport-jwt
  ```
  
- [ ] **1.1.3** Настроить JwtModule
  ```typescript
  // src/auth/auth.module.ts
  @Module({
    imports: [
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          secret: config.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '15m', // Access token: 15 minutes
          },
        }),
        inject: [ConfigService],
      }),
      PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
  })
  export class AuthModule {}
  ```

#### Критерии приемки:
- ✅ Auth module создан со всей структурой
- ✅ Dependencies установлены
- ✅ JwtModule настроен

---

### 1.2 User Registration

**Цель:** Реализовать безопасную регистрацию пользователей

#### Подзадачи:
- [ ] **1.2.1** Создать RegisterDto
  ```typescript
  // src/auth/dto/register.dto.ts
  export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @MinLength(12)
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message: 'Password must contain uppercase, lowercase, number and special character',
      },
    )
    password: string;
    
    @IsString()
    @MinLength(2)
    firstName: string;
    
    @IsString()
    @MinLength(2)
    lastName: string;
    
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.CLIENT;
    
    @IsBoolean()
    acceptedTerms: boolean; // PIPEDA compliance
    
    @IsBoolean()
    @IsOptional()
    marketingConsent?: boolean = false;
  }
  ```
  
- [ ] **1.2.2** Реализовать password hashing
  ```typescript
  // src/auth/auth.service.ts
  import * as bcrypt from 'bcrypt';
  
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Minimum for security
    return bcrypt.hash(password, saltRounds);
  }
  
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  ```
  
- [ ] **1.2.3** Реализовать registration logic
  ```typescript
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // 1. Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    
    // 2. Hash password
    const passwordHash = await this.hashPassword(dto.password);
    
    // 3. Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
        isVerified: false,
        acceptedTerms: dto.acceptedTerms,
        marketingConsent: dto.marketingConsent,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
    });
    
    // 4. Generate verification token
    const verificationToken = await this.generateEmailVerificationToken(user.id);
    
    // 5. Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      dto.firstName,
      verificationToken,
    );
    
    // 6. Log registration (audit)
    await this.auditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      metadata: { email: user.email, role: user.role },
    });
    
    return {
      message: 'Registration successful. Please verify your email.',
    };
  }
  ```
  
- [ ] **1.2.4** Добавить rate limiting
  ```typescript
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  ```

#### Security Requirements:
- [ ] Password minimum 12 characters
- [ ] Password complexity enforced (upper, lower, number, special)
- [ ] bcrypt cost factor 12+
- [ ] Email lowercased before storage
- [ ] Email uniqueness check
- [ ] Rate limiting: 3 registrations per hour per IP
- [ ] Terms acceptance mandatory
- [ ] Audit logging

#### Критерии приемки:
- ✅ User can register
- ✅ Password hashed correctly
- ✅ Email verification sent
- ✅ Rate limiting works
- ✅ Validation enforced
- ✅ Audit log created

---

### 1.3 Email Verification

**Цель:** Обязательная верификация email перед активацией аккаунта

#### Подзадачи:
- [ ] **1.3.1** Добавить модели в Prisma
  ```prisma
  model EmailVerification {
    id        String   @id @default(uuid())
    userId    String
    token     String   @unique
    expiresAt DateTime
    createdAt DateTime @default(now())
    
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    @@map("email_verifications")
  }
  
  model User {
    // ... existing fields
    isVerified          Boolean               @default(false)
    emailVerifications  EmailVerification[]
  }
  ```
  
- [ ] **1.3.2** Реализовать генерацию токена
  ```typescript
  async generateEmailVerificationToken(userId: string): Promise<string> {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store in database
    await this.prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    
    return token;
  }
  ```
  
- [ ] **1.3.3** Реализовать верификацию
  ```typescript
  async verifyEmail(token: string): Promise<{ message: string }> {
    // 1. Find verification token
    const verification = await this.prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }
    
    // 2. Check expiration
    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Verification token expired');
    }
    
    // 3. Verify user
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { isVerified: true },
    });
    
    // 4. Delete used token
    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });
    
    // 5. Log verification
    await this.auditService.log({
      userId: verification.userId,
      action: 'EMAIL_VERIFIED',
    });
    
    return { message: 'Email verified successfully' };
  }
  ```
  
- [ ] **1.3.4** Реализовать resend verification
  ```typescript
  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  async resendVerification(@Body() dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, verification email sent' };
    }
    
    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }
    
    // Delete old tokens
    await this.prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });
    
    // Generate new token
    const token = await this.generateEmailVerificationToken(user.id);
    
    // Send email
    await this.emailService.sendVerificationEmail(
      user.email,
      user.profile.firstName,
      token,
    );
    
    return { message: 'Verification email sent' };
  }
  ```

#### Security Requirements:
- [ ] Token: 32 bytes random
- [ ] Token expires in 24 hours
- [ ] One-time use token
- [ ] Delete old tokens before generating new
- [ ] Rate limiting: 3 resends per hour
- [ ] Don't reveal if email exists
- [ ] Audit logging

#### Критерии приемки:
- ✅ Verification email sent on registration
- ✅ Token works and expires correctly
- ✅ Resend functionality works
- ✅ Rate limiting prevents abuse
- ✅ Audit logs created

---

### 1.4 Login with JWT

**Цель:** Реализовать безопасный login с JWT tokens

#### Подзадачи:
- [ ] **1.4.1** Создать LoginDto
  ```typescript
  // src/auth/dto/login.dto.ts
  export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsNotEmpty()
    password: string;
    
    @IsBoolean()
    @IsOptional()
    rememberMe?: boolean = false;
  }
  ```
  
- [ ] **1.4.2** Реализовать login logic
  ```typescript
  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<LoginResponse> {
    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });
    
    if (!user) {
      // Log failed attempt
      await this.logFailedLogin(dto.email, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // 2. Check if account locked
    if (await this.isAccountLocked(user.id)) {
      throw new UnauthorizedException('Account locked due to multiple failed attempts');
    }
    
    // 3. Verify password
    const isPasswordValid = await this.comparePasswords(
      dto.password,
      user.passwordHash,
    );
    
    if (!isPasswordValid) {
      await this.recordFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // 4. Check if email verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }
    
    // 5. Reset failed login attempts
    await this.resetFailedLoginAttempts(user.id);
    
    // 6. Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      ipAddress,
      userAgent,
      dto.rememberMe,
    );
    
    // 7. Log successful login
    await this.auditService.log({
      userId: user.id,
      action: 'USER_LOGGED_IN',
      metadata: { ipAddress, userAgent },
    });
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      },
    };
  }
  ```
  
- [ ] **1.4.3** Реализовать token generation
  ```typescript
  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m', // 15 minutes
    });
  }
  
  async generateRefreshToken(
    userId: string,
    ipAddress: string,
    userAgent: string,
    rememberMe: boolean,
  ): Promise<string> {
    // Generate token
    const token = crypto.randomBytes(64).toString('hex');
    
    // Calculate expiration
    const expiresAt = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
    
    return token;
  }
  ```
  
- [ ] **1.4.4** Настроить HTTP-only cookies
  ```typescript
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto, ip, userAgent);
    
    // Set HTTP-only cookie for refresh token
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'strict',
      maxAge: dto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });
    
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }
  ```

#### Security Requirements:
- [ ] Access token: 15 minutes expiry
- [ ] Refresh token: 7 days (or 30 days with rememberMe)
- [ ] HTTP-only cookies for refresh token
- [ ] SameSite=Strict for CSRF protection
- [ ] Secure flag in production
- [ ] Rate limiting: 5 attempts per minute
- [ ] Account lockout after 5 failed attempts
- [ ] Email verification mandatory
- [ ] Audit logging

#### Критерии приемки:
- ✅ User can login successfully
- ✅ Tokens generated correctly
- ✅ HTTP-only cookies set
- ✅ Failed attempts tracked
- ✅ Account lockout works
- ✅ Rate limiting functional
- ✅ Audit logs created

---

### 1.5 Failed Login Tracking & Account Lockout

**Цель:** Защита от brute-force атак

#### Подзадачи:
- [ ] **1.5.1** Добавить модели в Prisma
  ```prisma
  model User {
    // ... existing fields
    failedLoginAttempts Int      @default(0)
    lastFailedLogin     DateTime?
    accountLockedUntil  DateTime?
  }
  ```
  
- [ ] **1.5.2** Реализовать tracking failed attempts
  ```typescript
  async recordFailedLogin(userId: string): Promise<void> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLogin: new Date(),
      },
    });
    
    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      await this.lockAccount(userId);
    }
    
    // Log failed attempt
    await this.auditService.log({
      userId,
      action: 'LOGIN_FAILED',
      level: 'warning',
    });
  }
  
  async lockAccount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountLockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    
    // Send email notification
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    
    await this.emailService.sendAccountLockedEmail(
      user.email,
      user.profile.firstName,
    );
    
    // Log lockout
    await this.auditService.log({
      userId,
      action: 'ACCOUNT_LOCKED',
      level: 'error',
    });
  }
  
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accountLockedUntil: true },
    });
    
    if (!user.accountLockedUntil) {
      return false;
    }
    
    // Check if lock expired
    if (user.accountLockedUntil < new Date()) {
      // Reset lock
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountLockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      return false;
    }
    
    return true;
  }
  
  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        accountLockedUntil: null,
      },
    });
  }
  ```
  
- [ ] **1.5.3** Добавить endpoint для unlock (admin only)
  ```typescript
  @Post('unlock-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async unlockAccount(@Body() dto: UnlockAccountDto) {
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        accountLockedUntil: null,
        failedLoginAttempts: 0,
      },
    });
    
    return { message: 'Account unlocked' };
  }
  ```

#### Security Requirements:
- [ ] Lock after 5 failed attempts
- [ ] Lockout duration: 15 minutes
- [ ] Email notification on lockout
- [ ] Audit logging
- [ ] Admin can unlock manually
- [ ] Auto-unlock after timeout

#### Критерии приемки:
- ✅ Failed attempts tracked
- ✅ Account locks after 5 attempts
- ✅ Auto-unlock after 15 minutes
- ✅ Email notification sent
- ✅ Admin can unlock
- ✅ Audit logs created

---

### 1.6 Token Refresh

**Цель:** Обновление access token через refresh token

#### Подзадачи:
- [ ] **1.6.1** Добавить модель RefreshToken
  ```prisma
  model RefreshToken {
    id        String   @id @default(uuid())
    token     String   @unique
    userId    String
    expiresAt DateTime
    ipAddress String
    userAgent String
    createdAt DateTime @default(now())
    
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    @@map("refresh_tokens")
  }
  ```
  
- [ ] **1.6.2** Реализовать refresh logic
  ```typescript
  async refreshToken(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Find refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    // 2. Check expiration
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }
    
    // 3. Generate new tokens
    const newAccessToken = await this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(
      storedToken.userId,
      ipAddress,
      userAgent,
      false,
    );
    
    // 4. Delete old refresh token (token rotation)
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    
    // 5. Log token refresh
    await this.auditService.log({
      userId: storedToken.userId,
      action: 'TOKEN_REFRESHED',
      metadata: { ipAddress, userAgent },
    });
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  ```
  
- [ ] **1.6.3** Создать endpoint
  ```typescript
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    
    const tokens = await this.authService.refreshToken(
      refreshToken,
      ip,
      userAgent,
    );
    
    // Update HTTP-only cookie
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    return { accessToken: tokens.accessToken };
  }
  ```

#### Security Requirements:
- [ ] Token rotation (invalidate old token)
- [ ] Refresh token stored in database
- [ ] Expiration check
- [ ] HTTP-only cookie
- [ ] Device/IP tracking
- [ ] Audit logging

#### Критерии приемки:
- ✅ Refresh token works
- ✅ Old token invalidated
- ✅ New tokens generated
- ✅ Cookie updated
- ✅ Audit log created

---

## Задача 2: Authorization Module - RBAC

**Приоритет:** 🔴 CRITICAL  
**Время:** 2-3 дня

### 2.1 JWT Strategy

**Цель:** Настроить Passport JWT strategy

#### Подзадачи:
- [ ] **2.1.1** Создать JWT strategy
  ```typescript
  // src/auth/strategies/jwt.strategy.ts
  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
      private config: ConfigService,
      private prisma: PrismaService,
    ) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: config.get('JWT_SECRET'),
      });
    }
    
    async validate(payload: JwtPayload): Promise<User> {
      // Find user by ID from token
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      if (!user.isVerified) {
        throw new UnauthorizedException('Email not verified');
      }
      
      // Check if account locked
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        throw new UnauthorizedException('Account locked');
      }
      
      return user;
    }
  }
  ```
  
- [ ] **2.1.2** Создать JWT Auth Guard
  ```typescript
  // src/auth/guards/jwt-auth.guard.ts
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
      if (err || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      return user;
    }
  }
  ```

#### Критерии приемки:
- ✅ JWT strategy validates correctly
- ✅ User loaded from database
- ✅ Email verification checked
- ✅ Account lock checked
- ✅ Guard protects endpoints

---

### 2.2 Role-Based Access Control

**Цель:** Реализовать систему ролей и разрешений

#### Подзадачи:
- [ ] **2.2.1** Определить роли
  ```typescript
  // src/auth/enums/user-role.enum.ts
  export enum UserRole {
    CLIENT = 'CLIENT',
    CONTRACTOR = 'CONTRACTOR',
    ADMIN = 'ADMIN',
  }
  ```
  
- [ ] **2.2.2** Создать Roles decorator
  ```typescript
  // src/auth/decorators/roles.decorator.ts
  export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
  ```
  
- [ ] **2.2.3** Создать Roles Guard
  ```typescript
  // src/auth/guards/roles.guard.ts
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );
      
      if (!requiredRoles) {
        return true; // No roles required
      }
      
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      if (!user) {
        return false;
      }
      
      return requiredRoles.some((role) => user.role === role);
    }
  }
  ```
  
- [ ] **2.2.4** Создать CurrentUser decorator
  ```typescript
  // src/auth/decorators/current-user.decorator.ts
  export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
  );
  ```
  
- [ ] **2.2.5** Пример использования
  ```typescript
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
  
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }
  ```

#### Критерии приемки:
- ✅ Roles decorator works
- ✅ RolesGuard validates correctly
- ✅ CurrentUser decorator extracts user
- ✅ Unauthorized users blocked
- ✅ Role-based access enforced

---

### 2.3 Session Management

**Цель:** Управление активными сессиями пользователя

#### Подзадачи:
- [ ] **2.3.1** Создать Session service
  ```typescript
  // src/auth/services/session.service.ts
  @Injectable()
  export class SessionService {
    async getActiveSessions(userId: string) {
      return this.prisma.refreshToken.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          createdAt: true,
          ipAddress: true,
          userAgent: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    async revokeSession(userId: string, sessionId: string) {
      await this.prisma.refreshToken.delete({
        where: {
          id: sessionId,
          userId, // Ensure user owns this session
        },
      });
    }
    
    async revokeAllSessions(userId: string, exceptCurrent?: string) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
          id: exceptCurrent ? { not: exceptCurrent } : undefined,
        },
      });
    }
  }
  ```
  
- [ ] **2.3.2** Создать endpoints
  ```typescript
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser() user: User) {
    return this.sessionService.getActiveSessions(user.id);
  }
  
  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @CurrentUser() user: User,
    @Param('id') sessionId: string,
  ) {
    await this.sessionService.revokeSession(user.id, sessionId);
    return { message: 'Session revoked' };
  }
  
  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  async revokeAllSessions(@CurrentUser() user: User) {
    await this.sessionService.revokeAllSessions(user.id);
    return { message: 'All sessions revoked' };
  }
  ```

#### Критерии приемки:
- ✅ User can view active sessions
- ✅ User can revoke specific session
- ✅ User can logout from all devices
- ✅ Session info displayed correctly

---

## Задача 3: Password Management

**Приоритет:** 🔴 CRITICAL  
**Время:** 1-2 дня

### 3.1 Password Reset Flow

**Цель:** Безопасный сброс пароля

#### Подзадачи:
- [ ] **3.1.1** Добавить модель PasswordReset
  ```prisma
  model PasswordReset {
    id        String   @id @default(uuid())
    userId    String
    token     String   @unique
    expiresAt DateTime
    createdAt DateTime @default(now())
    
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    
    @@map("password_resets")
  }
  ```
  
- [ ] **3.1.2** Реализовать request reset
  ```typescript
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Don't reveal if email exists (security)
    if (!user) {
      return { message: 'If email exists, password reset link sent' };
    }
    
    // Delete old reset tokens
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });
    
    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    
    // Send email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.profile.firstName,
      token,
    );
    
    // Log request
    await this.auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
    });
    
    return { message: 'If email exists, password reset link sent' };
  }
  ```
  
- [ ] **3.1.3** Реализовать reset password
  ```typescript
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // 1. Find reset token
    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!reset) {
      throw new BadRequestException('Invalid reset token');
    }
    
    // 2. Check expiration
    if (reset.expiresAt < new Date()) {
      await this.prisma.passwordReset.delete({ where: { id: reset.id } });
      throw new BadRequestException('Reset token expired');
    }
    
    // 3. Hash new password
    const passwordHash = await this.hashPassword(newPassword);
    
    // 4. Update password
    await this.prisma.user.update({
      where: { id: reset.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });
    
    // 5. Delete reset token
    await this.prisma.passwordReset.delete({ where: { id: reset.id } });
    
    // 6. Revoke all sessions (force re-login)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: reset.userId },
    });
    
    // 7. Send confirmation email
    await this.emailService.sendPasswordChangedEmail(
      reset.user.email,
      reset.user.profile.firstName,
    );
    
    // 8. Log password change
    await this.auditService.log({
      userId: reset.userId,
      action: 'PASSWORD_CHANGED',
      level: 'warning',
    });
    
    return { message: 'Password reset successful' };
  }
  ```
  
- [ ] **3.1.4** Добавить rate limiting
  ```typescript
  @Post('password-reset/request')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  async requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }
  
  @Post('password-reset/confirm')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
  async confirmReset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
  ```

#### Security Requirements:
- [ ] Reset token: 32 bytes random
- [ ] Token expires in 1 hour
- [ ] One-time use token
- [ ] Don't reveal if email exists
- [ ] Revoke all sessions on password change
- [ ] Send confirmation email
- [ ] Rate limiting
- [ ] Audit logging

#### Критерии приемки:
- ✅ User can request password reset
- ✅ Email with token sent
- ✅ Token works and expires
- ✅ Password updated successfully
- ✅ All sessions revoked
- ✅ Confirmation email sent
- ✅ Rate limiting works

---

### 3.2 Change Password (Authenticated)

**Цель:** Изменение пароля авторизованным пользователем

#### Подзадачи:
- [ ] **3.2.1** Создать DTO
  ```typescript
  // src/auth/dto/change-password.dto.ts
  export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;
    
    @IsString()
    @MinLength(12)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    newPassword: string;
  }
  ```
  
- [ ] **3.2.2** Реализовать change password
  ```typescript
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // 1. Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    // 2. Verify current password
    const isValid = await this.comparePasswords(
      currentPassword,
      user.passwordHash,
    );
    
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    // 3. Check if new password same as old
    const isSameAsOld = await this.comparePasswords(
      newPassword,
      user.passwordHash,
    );
    
    if (isSameAsOld) {
      throw new BadRequestException('New password must be different');
    }
    
    // 4. Hash new password
    const passwordHash = await this.hashPassword(newPassword);
    
    // 5. Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    
    // 6. Revoke all sessions except current
    await this.sessionService.revokeAllSessions(userId);
    
    // 7. Send confirmation email
    await this.emailService.sendPasswordChangedEmail(
      user.email,
      user.profile.firstName,
    );
    
    // 8. Log change
    await this.auditService.log({
      userId,
      action: 'PASSWORD_CHANGED',
      level: 'warning',
    });
    
    return { message: 'Password changed successfully' };
  }
  ```
  
- [ ] **3.2.3** Создать endpoint
  ```typescript
  @Post('password/change')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
  ```

#### Security Requirements:
- [ ] Verify current password
- [ ] New password must be different
- [ ] Password validation enforced
- [ ] Revoke other sessions
- [ ] Send confirmation email
- [ ] Rate limiting
- [ ] Audit logging

#### Критерии приемки:
- ✅ User can change password
- ✅ Current password verified
- ✅ New password validated
- ✅ Confirmation email sent
- ✅ Other sessions revoked
- ✅ Audit log created

---

## Задача 4: OAuth2.0 Integration

**Приоритет:** 🟡 HIGH  
**Время:** 2-3 дня

### 4.1 Google OAuth

**Цель:** Интеграция Google Sign In

#### Подзадачи:
- [ ] **4.1.1** Установить dependencies
  ```bash
  pnpm add @nestjs/passport passport-google-oauth20
  pnpm add -D @types/passport-google-oauth20
  ```
  
- [ ] **4.1.2** Создать Google strategy
  ```typescript
  // src/auth/strategies/google.strategy.ts
  @Injectable()
  export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
      config: ConfigService,
      private authService: AuthService,
    ) {
      super({
        clientID: config.get('GOOGLE_CLIENT_ID'),
        clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
        callbackURL: config.get('GOOGLE_CALLBACK_URL'),
        scope: ['email', 'profile'],
      });
    }
    
    async validate(
      accessToken: string,
      refreshToken: string,
      profile: any,
    ): Promise<User> {
      const { emails, name, photos } = profile;
      
      return this.authService.validateOAuthUser({
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        avatar: photos[0].value,
        provider: 'google',
        providerId: profile.id,
      });
    }
  }
  ```
  
- [ ] **4.1.3** Реализовать validateOAuthUser
  ```typescript
  async validateOAuthUser(dto: OAuthUserDto): Promise<User> {
    // Find user by email
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });
    
    if (user) {
      // User exists - link OAuth provider if not linked
      // ...
      return user;
    }
    
    // Create new user
    user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        isVerified: true, // OAuth email is pre-verified
        role: UserRole.CLIENT,
        passwordHash: '', // No password for OAuth users
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            avatar: dto.avatar,
          },
        },
      },
    });
    
    // Log OAuth registration
    await this.auditService.log({
      userId: user.id,
      action: 'USER_REGISTERED_OAUTH',
      metadata: { provider: dto.provider },
    });
    
    return user;
  }
  ```
  
- [ ] **4.1.4** Создать endpoints
  ```typescript
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }
  
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req,
    @Res() res: Response,
  ) {
    const user = req.user;
    
    // Generate tokens
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(
      user.id,
      req.ip,
      req.headers['user-agent'],
      false,
    );
    
    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    
    // Redirect to frontend with access token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  }
  ```

#### Security Requirements:
- [ ] Email verification not required (OAuth pre-verified)
- [ ] Link OAuth to existing account if email matches
- [ ] Prevent account takeover (verify email ownership)
- [ ] Store OAuth provider info
- [ ] Audit logging

#### Критерии приемки:
- ✅ Google OAuth works
- ✅ User created or linked
- ✅ Tokens generated
- ✅ Redirect to frontend
- ✅ Audit log created

---

### 4.2 Apple Sign In

**Цель:** Интеграция Apple Sign In

#### Подзадачи:
- [ ] **4.2.1** Документировать Apple setup
  ```markdown
  # Apple Sign In Setup
  
  1. Create App ID in Apple Developer Portal
  2. Enable Sign In with Apple capability
  3. Create Service ID
  4. Configure callback URL
  5. Generate private key
  6. Get Team ID, Key ID, Client ID
  ```
  
- [ ] **4.2.2** Создать Apple strategy (similar to Google)
  
- [ ] **4.2.3** Handle email relay addresses
  ```typescript
  // Apple can provide relay email like xyz@privaterelay.appleid.com
  // Must handle this correctly
  ```

#### Критерии приемки:
- ✅ Apple Sign In documented
- ✅ Strategy created
- ✅ Relay emails handled
- ✅ Tokens generated

---

## Задача 5: User Rights (PIPEDA Compliance)

**Приоритет:** 🔴 CRITICAL  
**Время:** 1 день

### 5.1 User Data Access & Export

**Цель:** Предоставить пользователям доступ к их данным

#### Подзадачи:
- [ ] **5.1.1** Implement data export
  ```typescript
  // src/users/users.controller.ts
  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  async exportUserData(@CurrentUser() user: User) {
    const userData = await this.usersService.exportAllUserData(user.id);
    
    return {
      exportedAt: new Date().toISOString(),
      user: userData,
    };
  }
  ```
  
- [ ] **5.1.2** Собрать все данные пользователя
  ```typescript
  async exportAllUserData(userId: string) {
    return {
      profile: await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          contractor: true,
        },
      }),
      orders: await this.prisma.order.findMany({
        where: {
          OR: [{ clientId: userId }, { contractorId: userId }],
        },
      }),
      reviews: await this.prisma.review.findMany({
        where: {
          OR: [{ reviewerId: userId }, { revieweeId: userId }],
        },
      }),
      messages: await this.prisma.message.findMany({
        where: { userId },
      }),
      // ... other data
    };
  }
  ```

#### Критерии приемки:
- ✅ User can export all data
- ✅ Export includes all relevant data
- ✅ JSON format
- ✅ Timestamp included

---

### 5.2 Account Deletion

**Цель:** Полное удаление аккаунта и данных

#### Подзадачи:
- [ ] **5.2.1** Implement account deletion
  ```typescript
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(
    @CurrentUser() user: User,
    @Body() dto: DeleteAccountDto,
  ) {
    // Verify password
    const isValid = await this.authService.comparePasswords(
      dto.password,
      user.passwordHash,
    );
    
    if (!isValid) {
      throw new BadRequestException('Invalid password');
    }
    
    // Delete account
    await this.usersService.deleteAccount(user.id);
    
    return { message: 'Account deleted successfully' };
  }
  ```
  
- [ ] **5.2.2** Cascading deletion logic
  ```typescript
  async deleteAccount(userId: string) {
    // 1. Anonymize reviews (keep for contractors)
    await this.prisma.review.updateMany({
      where: { reviewerId: userId },
      data: { reviewerName: 'Deleted User' },
    });
    
    // 2. Delete messages
    await this.prisma.message.deleteMany({
      where: { userId },
    });
    
    // 3. Delete orders (if no active orders)
    // 4. Delete profile
    // 5. Delete user
    await this.prisma.user.delete({
      where: { id: userId },
    });
    
    // Log deletion
    await this.auditService.log({
      userId,
      action: 'ACCOUNT_DELETED',
      level: 'warning',
    });
  }
  ```

#### Критерии приемки:
- ✅ User can delete account
- ✅ Password verification required
- ✅ All data deleted/anonymized
- ✅ Audit log created

---

## Deliverables

### Must Have
- [x] User registration with email verification
- [x] Login with JWT (access + refresh tokens)
- [x] Password security (bcrypt cost 12+)
- [x] Email verification mandatory
- [x] Password reset flow
- [x] Failed login tracking & account lockout
- [x] Token refresh mechanism
- [x] HTTP-only cookies for tokens
- [x] RBAC (Role-Based Access Control)
- [x] Session management
- [x] OAuth2.0 (Google, Apple)
- [x] User data export
- [x] Account deletion
- [x] Rate limiting on all auth endpoints
- [x] Audit logging

### Quality Gates
- [ ] All auth endpoints tested (E2E)
- [ ] Security requirements met
- [ ] Rate limiting functional
- [ ] Email verification works
- [ ] Token expiration works
- [ ] Account lockout works
- [ ] OAuth integration tested
- [ ] PIPEDA compliance verified

### Security Checklist
- [ ] Passwords hashed (bcrypt cost 12+)
- [ ] JWT secrets strong (32+ bytes)
- [ ] Access token: 15 min expiry
- [ ] Refresh token: 7 days expiry
- [ ] HTTP-only cookies
- [ ] SameSite=Strict
- [ ] Email verification mandatory
- [ ] Rate limiting: 5 login attempts/min
- [ ] Account lockout after 5 failures
- [ ] Password reset tokens expire (1 hour)
- [ ] Audit logging complete

---

## Testing Strategy

### Unit Tests
```typescript
describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const password = 'Test123!@#';
    const hash = await service.hashPassword(password);
    expect(hash).not.toBe(password);
    expect(await service.comparePasswords(password, hash)).toBe(true);
  });
  
  it('should generate valid JWT', async () => {
    const token = await service.generateAccessToken(mockUser);
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.sub).toBe(mockUser.id);
  });
});
```

### E2E Tests
```typescript
describe('Auth (e2e)', () => {
  it('/auth/register (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(validRegisterDto)
      .expect(201);
  });
  
  it('/auth/login (POST) - invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' })
      .expect(401);
  });
  
  it('/auth/login (POST) - account lockout', async () => {
    // Attempt 6 failed logins
    for (let i = 0; i < 6; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });
    }
    
    // 7th attempt should be locked
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'correct' })
      .expect(401);
    
    expect(response.body.message).toContain('locked');
  });
});
```

---

## Next Steps

После завершения Phase 1:
1. ✅ Verify all deliverables complete
2. ✅ Run security checklist
3. ✅ Run all tests (unit + E2E)
4. ✅ Security audit (manual review)
5. ➡️ **Proceed to Phase 2: User Management Module**

---

**Last Updated:** January 2025  
**Status:** Ready to Start  
**Owner:** Backend Team
