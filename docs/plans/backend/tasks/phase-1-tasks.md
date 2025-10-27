# Phase 1: Authentication & Authorization - Детальные задачи

**Длительность:** Week 3-4 (2 недели)
**Приоритет:** 🔴 CRITICAL
**Зависимости:** Phase 0 должен быть завершен

---

## 📋 Overview

Phase 1 фокусируется на создании полноценной системы аутентификации и авторизации с соблюдением PIPEDA требований для Канады.

**Ключевые deliverables:**
- JWT-based authentication
- Role-Based Access Control (RBAC)
- User rights endpoints (PIPEDA compliance)
- Email verification mandatory
- OAuth2.0 integration (Google, Apple)
- Session management with Redis

---

## 🎯 Task Breakdown

### 1. Authentication Module Setup (Day 1-2)

#### 1.1 Create Auth Module Structure
**Файлы для создания:**
```
api/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── jwt-refresh.strategy.ts
│   └── local.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── local-auth.guard.ts
└── dto/
    ├── register.dto.ts
    ├── login.dto.ts
    └── refresh-token.dto.ts
```

**Задача 1.1.1:** Создать базовую структуру модуля
- [ ] `nest g module auth`
- [ ] `nest g controller auth`
- [ ] `nest g service auth`
- [ ] Импортировать необходимые модули (JwtModule, PassportModule)

**Задача 1.1.2:** Установить необходимые зависимости
```bash
pnpm add @nestjs/jwt @nestjs/passport passport passport-local passport-jwt
pnpm add bcrypt
pnpm add @types/passport-local @types/passport-jwt @types/bcrypt -D
```

**Задача 1.1.3:** Настроить JWT конфигурацию
- [ ] Создать `jwt.config.ts`
- [ ] Настроить access token (15 min expiration)
- [ ] Настроить refresh token (7 days expiration)
- [ ] Добавить JWT secrets в `.env`

**Acceptance Criteria:**
- ✅ Auth модуль создан и подключен к AppModule
- ✅ Все зависимости установлены
- ✅ JWT конфигурация настроена

---

### 2. User Registration (Day 2-3)

#### 2.1 Create Registration DTO
**Файл:** `api/src/auth/dto/register.dto.ts`

**Задача 2.1.1:** Создать DTO с валидацией
```typescript
import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(/^\+1\d{10}$/, {
    message: 'Phone must be a valid Canadian number (+1XXXXXXXXXX)',
  })
  phone?: string;
}
```

**Задача 2.1.2:** Добавить custom validators
- [ ] Canadian phone validator
- [ ] Disposable email check (optional)

**Acceptance Criteria:**
- ✅ DTO создан с полной валидацией
- ✅ Password complexity проверяется
- ✅ Canadian phone format валидируется

---

#### 2.2 Implement Registration Logic
**Файл:** `api/src/auth/auth.service.ts`

**Задача 2.2.1:** Метод `register()`
- [ ] Проверить существование пользователя по email
- [ ] Хешировать пароль (bcrypt cost 12)
- [ ] Создать пользователя в БД
- [ ] Сгенерировать email verification token
- [ ] Отправить email с verification link
- [ ] Вернуть user (без password)

**Задача 2.2.2:** Интеграция с Prisma
```typescript
async register(registerDto: RegisterDto) {
  const { email, password, name, phone } = registerDto;

  // Check if user exists
  const existingUser = await this.prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await this.prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      verificationToken,
      isVerified: false,
    },
  });

  // Send verification email (queue job)
  await this.emailQueue.add('verify-email', {
    userId: user.id,
    email: user.email,
    token: verificationToken,
  });

  return this.excludePassword(user);
}
```

**Задача 2.2.3:** Создать endpoint
```typescript
@Post('register')
@ApiOperation({ summary: 'Register new user' })
@ApiResponse({ status: 201, type: UserDto })
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
}
```

**Acceptance Criteria:**
- ✅ Registration endpoint работает
- ✅ Password хешируется (bcrypt cost 12)
- ✅ Email verification token генерируется
- ✅ User создается в БД
- ✅ Verification email отправляется (mock для Phase 0)

---

### 3. Email Verification (Day 3)

#### 3.1 Verification Flow

**Задача 3.1.1:** Создать verification endpoint
```typescript
@Get('verify-email')
@ApiOperation({ summary: 'Verify email with token' })
async verifyEmail(@Query('token') token: string) {
  return this.authService.verifyEmail(token);
}
```

**Задача 3.1.2:** Implement verification logic
- [ ] Find user by verification token
- [ ] Check token expiration (24 hours)
- [ ] Set `isVerified: true`
- [ ] Clear verification token
- [ ] Return success message

**Acceptance Criteria:**
- ✅ Verification endpoint работает
- ✅ Token expires after 24h
- ✅ User marked as verified
- ✅ Error handling для invalid/expired tokens

---

### 4. User Login (Day 4)

#### 4.1 Create Login DTO
**Файл:** `api/src/auth/dto/login.dto.ts`

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  password: string;
}
```

#### 4.2 Implement Login Logic

**Задача 4.2.1:** Метод `login()`
- [ ] Find user by email
- [ ] Verify password (bcrypt.compare)
- [ ] Check if email verified
- [ ] Track failed login attempts
- [ ] Generate JWT tokens (access + refresh)
- [ ] Store refresh token in Redis
- [ ] Return tokens + user

**Задача 4.2.2:** Failed login tracking
```typescript
async validateUser(email: string, password: string) {
  const user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Check if account locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new UnauthorizedException('Account locked. Try again later.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Increment failed attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        lockedUntil: user.failedLoginAttempts >= 4
          ? new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
          : null,
      },
    });

    throw new UnauthorizedException('Invalid credentials');
  }

  // Check email verification
  if (!user.isVerified) {
    throw new UnauthorizedException('Email not verified');
  }

  // Reset failed attempts
  if (user.failedLoginAttempts > 0) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0 },
    });
  }

  return user;
}
```

**Задача 4.2.3:** Generate JWT tokens
```typescript
async generateTokens(userId: string, email: string, role: string) {
  const payload = { sub: userId, email, role };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    }),
    this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    }),
  ]);

  // Store refresh token in Redis
  await this.redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    'EX',
    60 * 60 * 24 * 7, // 7 days
  );

  return { accessToken, refreshToken };
}
```

**Acceptance Criteria:**
- ✅ Login endpoint работает
- ✅ Password проверяется
- ✅ Email verification обязательна
- ✅ Failed login attempts отслеживаются
- ✅ Account lockout после 5 попыток (15 min)
- ✅ JWT tokens генерируются
- ✅ Refresh token сохраняется в Redis

---

### 5. Token Refresh (Day 4-5)

#### 5.1 Refresh Token Endpoint

**Задача 5.1.1:** Создать refresh endpoint
```typescript
@Post('refresh')
@ApiOperation({ summary: 'Refresh access token' })
async refreshTokens(@Body() refreshDto: RefreshTokenDto) {
  return this.authService.refreshTokens(refreshDto.refreshToken);
}
```

**Задача 5.1.2:** Implement refresh logic
- [ ] Verify refresh token (JWT)
- [ ] Check if token exists in Redis
- [ ] Generate new access + refresh tokens
- [ ] Rotate refresh token (delete old, store new)
- [ ] Return new tokens

**Acceptance Criteria:**
- ✅ Refresh endpoint работает
- ✅ Old refresh token invalidated
- ✅ New tokens generated
- ✅ Token rotation implemented

---

### 6. JWT Strategies & Guards (Day 5)

#### 6.1 JWT Access Strategy
**Файл:** `api/src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

#### 6.2 JWT Refresh Strategy
**Файл:** `api/src/auth/strategies/jwt-refresh.strategy.ts`

```typescript
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub };
  }
}
```

#### 6.3 Guards

**Задача 6.3.1:** JWT Auth Guard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Задача 6.3.2:** Roles Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Задача 6.3.3:** Roles Decorator
```typescript
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

**Acceptance Criteria:**
- ✅ JWT strategies работают
- ✅ Guards созданы
- ✅ Roles decorator работает
- ✅ Protected endpoints можно создавать с @UseGuards(JwtAuthGuard)

---

### 7. OAuth2.0 Integration (Day 6-7)

#### 7.1 Google OAuth

**Задача 7.1.1:** Установить зависимости
```bash
pnpm add @nestjs/passport passport-google-oauth20
pnpm add @types/passport-google-oauth20 -D
```

**Задача 7.1.2:** Google Strategy
**Файл:** `api/src/auth/strategies/google.strategy.ts`

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    const user = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      avatar: photos[0].value,
      provider: 'google',
      providerId: profile.id,
    };

    return this.authService.validateOAuthUser(user);
  }
}
```

**Задача 7.1.3:** OAuth endpoints
```typescript
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth() {
  // Redirect to Google
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req) {
  return this.authService.oauthLogin(req.user);
}
```

#### 7.2 Apple Sign In (Optional for Phase 1)
- [ ] Implement Apple Strategy (similar to Google)
- [ ] Add Apple callback endpoint
- [ ] Test Apple Sign In flow

**Acceptance Criteria:**
- ✅ Google OAuth работает
- ✅ User создается или находится по email
- ✅ JWT tokens возвращаются после OAuth
- ✅ Email verification не требуется для OAuth users

---

### 8. Password Reset Flow (Day 7-8)

#### 8.1 Password Reset Request

**Задача 8.1.1:** DTO
```typescript
export class PasswordResetRequestDto {
  @IsEmail()
  email: string;
}
```

**Задача 8.1.2:** Endpoint
```typescript
@Post('password-reset/request')
async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
  return this.authService.requestPasswordReset(dto.email);
}
```

**Задача 8.1.3:** Implementation
- [ ] Find user by email
- [ ] Generate reset token (crypto.randomBytes)
- [ ] Store token in DB with expiration (1 hour)
- [ ] Send email with reset link
- [ ] Return success message (even if email not found - security)

#### 8.2 Password Reset Confirm

**Задача 8.2.1:** DTO
```typescript
export class PasswordResetConfirmDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  newPassword: string;
}
```

**Задача 8.2.2:** Endpoint
```typescript
@Post('password-reset/confirm')
async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
  return this.authService.confirmPasswordReset(dto);
}
```

**Задача 8.2.3:** Implementation
- [ ] Validate reset token
- [ ] Check expiration (1 hour)
- [ ] Hash new password
- [ ] Update user password
- [ ] Clear reset token
- [ ] Invalidate all existing refresh tokens
- [ ] Send confirmation email

**Acceptance Criteria:**
- ✅ Password reset request работает
- ✅ Reset email отправляется
- ✅ Token expires after 1 hour
- ✅ Password reset confirm работает
- ✅ All sessions invalidated after reset

---

### 9. User Rights Endpoints (PIPEDA Compliance) (Day 8-9)

#### 9.1 Access User Data (Right to Access)

**Задача 9.1.1:** GET /api/v1/users/me
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get current user profile' })
async getCurrentUser(@Req() req) {
  return this.usersService.findById(req.user.userId);
}
```

#### 9.2 Update Profile (Right to Rectification)

**Задача 9.2.1:** PATCH /api/v1/users/me
```typescript
@Patch('me')
@UseGuards(JwtAuthGuard)
async updateProfile(@Req() req, @Body() updateDto: UpdateUserDto) {
  return this.usersService.update(req.user.userId, updateDto);
}
```

#### 9.3 Delete Account (Right to Erasure)

**Задача 9.3.1:** DELETE /api/v1/users/me
```typescript
@Delete('me')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async deleteAccount(@Req() req) {
  await this.usersService.deleteAccount(req.user.userId);
}
```

**Implementation:**
- [ ] Soft delete or hard delete (depends on legal requirements)
- [ ] Anonymize orders (keep for financial records)
- [ ] Delete messages
- [ ] Delete reviews
- [ ] Delete profile data
- [ ] Send confirmation email

#### 9.4 Export User Data (Right to Data Portability)

**Задача 9.4.1:** GET /api/v1/users/me/export
```typescript
@Get('me/export')
@UseGuards(JwtAuthGuard)
async exportData(@Req() req) {
  return this.usersService.exportUserData(req.user.userId);
}
```

**Implementation:**
- [ ] Collect all user data (profile, orders, reviews, messages)
- [ ] Format as JSON
- [ ] Include export timestamp
- [ ] Return downloadable JSON

**Acceptance Criteria:**
- ✅ User can access their data
- ✅ User can update their profile
- ✅ User can delete their account
- ✅ User can export their data (JSON format)
- ✅ PIPEDA compliance achieved

---

### 10. Session Management (Day 9)

#### 10.1 Redis Session Storage

**Задача 10.1.1:** Session tracking
- [ ] Store active sessions in Redis
- [ ] Track device information (user agent, IP)
- [ ] Store session metadata (login time, last activity)

**Задача 10.1.2:** Logout
```typescript
@Post('logout')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async logout(@Req() req) {
  await this.authService.logout(req.user.userId);
}
```

**Implementation:**
- [ ] Delete refresh token from Redis
- [ ] Clear session data
- [ ] Return success

#### 10.2 Logout All Devices

**Задача 10.2.1:** Endpoint
```typescript
@Post('logout-all')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.NO_CONTENT)
async logoutAll(@Req() req) {
  await this.authService.logoutAll(req.user.userId);
}
```

**Implementation:**
- [ ] Delete all refresh tokens for user
- [ ] Clear all sessions
- [ ] Invalidate all JWT tokens (blacklist)

**Acceptance Criteria:**
- ✅ Logout works
- ✅ Logout all devices works
- ✅ Sessions tracked in Redis

---

### 11. Testing (Day 10)

#### 11.1 Unit Tests

**Задача 11.1.1:** Auth Service Tests
- [ ] `register()` - success case
- [ ] `register()` - duplicate email
- [ ] `login()` - success case
- [ ] `login()` - invalid credentials
- [ ] `login()` - unverified email
- [ ] `login()` - account lockout
- [ ] `verifyEmail()` - success
- [ ] `verifyEmail()` - expired token
- [ ] `refreshTokens()` - success
- [ ] `refreshTokens()` - invalid token
- [ ] Password reset flow tests

**Задача 11.1.2:** Auth Controller Tests
- [ ] All endpoints respond correctly
- [ ] Validation works
- [ ] Error handling

#### 11.2 E2E Tests

**Задача 11.2.1:** Registration Flow
- [ ] POST /auth/register → 201
- [ ] Duplicate email → 409
- [ ] Invalid data → 400

**Задача 11.2.2:** Login Flow
- [ ] POST /auth/login → 200 with tokens
- [ ] Invalid credentials → 401
- [ ] Unverified email → 401

**Задача 11.2.3:** Protected Routes
- [ ] GET /users/me without token → 401
- [ ] GET /users/me with valid token → 200
- [ ] GET /users/me with expired token → 401

**Acceptance Criteria:**
- ✅ Unit test coverage > 80%
- ✅ All E2E tests pass
- ✅ Edge cases covered

---

### 12. Security Audit (Day 10)

#### 12.1 Security Checklist Review

**Задача 12.1.1:** Password Security
- [ ] Bcrypt cost 12+ ✓
- [ ] Password complexity enforced ✓
- [ ] Password never logged ✓
- [ ] Password never returned in API ✓

**Задача 12.1.2:** JWT Security
- [ ] Access token expires in 15 min ✓
- [ ] Refresh token expires in 7 days ✓
- [ ] Tokens in HTTP-only cookies (backend sets) ✓
- [ ] Strong JWT secrets (256-bit) ✓
- [ ] Token rotation on refresh ✓

**Задача 12.1.3:** Session Security
- [ ] Failed login tracking ✓
- [ ] Account lockout (5 attempts, 15 min) ✓
- [ ] Sessions stored in Redis ✓
- [ ] Logout invalidates tokens ✓

**Задача 12.1.4:** Rate Limiting
- [ ] Auth endpoints rate limited (5 req/min) ✓
- [ ] Rate limit headers returned ✓

**Acceptance Criteria:**
- ✅ All security requirements met
- ✅ No vulnerabilities found
- ✅ Code review completed

---

## 📊 Progress Tracking

### Daily Milestones

**Day 1-2:** Auth Module Setup + Registration
- [ ] Auth module structure created
- [ ] Dependencies installed
- [ ] Registration DTO created
- [ ] Registration logic implemented
- [ ] Registration endpoint working

**Day 3:** Email Verification
- [ ] Verification flow implemented
- [ ] Token expiration working
- [ ] Error handling complete

**Day 4:** Login + Token Refresh
- [ ] Login DTO created
- [ ] Login logic implemented
- [ ] Failed attempts tracking
- [ ] Token refresh working

**Day 5:** JWT Strategies & Guards
- [ ] JWT strategies created
- [ ] Guards implemented
- [ ] Roles decorator working
- [ ] Protected endpoints testable

**Day 6-7:** OAuth2.0 + Password Reset
- [ ] Google OAuth working
- [ ] Password reset request working
- [ ] Password reset confirm working

**Day 8-9:** User Rights + Session Management
- [ ] User rights endpoints created
- [ ] PIPEDA compliance achieved
- [ ] Session management working
- [ ] Logout functionality complete

**Day 10:** Testing + Security Audit
- [ ] Unit tests written (80%+ coverage)
- [ ] E2E tests pass
- [ ] Security audit complete

---

## 🔗 Dependencies

### Must be completed before Phase 1:
- ✅ Phase 0: Foundation & Infrastructure
- ✅ PostgreSQL + PostGIS running
- ✅ Redis running
- ✅ Prisma schema initialized
- ✅ NestJS project structure ready

### Required for Phase 1:
- Prisma User model
- Redis connection
- Email service (can be mocked initially)
- Environment variables configured

---

## 📝 Definition of Done

Phase 1 считается завершенным когда:

- [ ] ✅ All endpoints работают корректно
- [ ] ✅ JWT authentication функционирует
- [ ] ✅ RBAC implemented
- [ ] ✅ Email verification обязательна
- [ ] ✅ OAuth2.0 (Google) работает
- [ ] ✅ User rights endpoints (PIPEDA) реализованы
- [ ] ✅ Session management работает
- [ ] ✅ Password reset flow работает
- [ ] ✅ Failed login tracking активен
- [ ] ✅ Unit tests pass (80%+ coverage)
- [ ] ✅ E2E tests pass
- [ ] ✅ Security audit пройден
- [ ] ✅ Documentation обновлена
- [ ] ✅ Code review completed

---

## 🚀 Next Steps

После завершения Phase 1, переходим к **Phase 2: User Management Module**

---

**Created:** January 2025
**Last Updated:** January 2025
**Status:** Ready for implementation
