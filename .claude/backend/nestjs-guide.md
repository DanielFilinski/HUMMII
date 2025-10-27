# NestJS Backend Guide - Hummii

> **Версия:** 1.0
> **Последнее обновление:** 27 октября 2025
> **Проект:** Hummii Service Marketplace Platform

---

## Содержание

1. [Архитектура модулей](#архитектура-модулей)
2. [Паттерны Controller/Service](#паттерны-controllerservice)
3. [DTOs и валидация](#dtos-и-валидация)
4. [Интеграция с Prisma](#интеграция-с-prisma)
5. [WebSocket (Socket.io)](#websocket-socketio)
6. [Аутентификация и безопасность](#аутентификация-и-безопасность)
7. [Интеграция с Stripe](#интеграция-с-stripe)
8. [Модерация контента](#модерация-контента)
9. [Фоновые задачи (Bull)](#фоновые-задачи-bull)
10. [PIPEDA Compliance](#pipeda-compliance)

---

## Архитектура модулей

### Структура директорий

```
api/src/
├── core/                  # Глобальная инфраструктура
│   ├── filters/           # Обработка исключений
│   ├── guards/            # Авторизация и RBAC
│   └── interceptors/      # Обработка запросов/ответов
├── shared/                # Общие утилиты
│   ├── utils/             # Вспомогательные функции
│   └── services/          # Межмодульная логика
└── [feature-modules]/     # Доменные модули
    ├── dto/               # Data Transfer Objects
    ├── entities/          # Prisma модели
    ├── services/          # Бизнес-логика
    └── controllers/       # HTTP endpoints
```

### Паттерн модуля

**Принципы:**
- Один модуль на домен/маршрут
- Один контроллер на основной маршрут
- DTOs валидируются через class-validator
- Сервисы содержат бизнес-логику
- Entities используют Prisma

**Базовая структура:**

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## Паттерны Controller/Service

### Controller Pattern

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: UserDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
```

### Service Pattern

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // password excluded for security
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    this.logger.log(`User created: ${user.id}`, 'UsersService');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findById(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated: ${user.id}`, 'UsersService');

    return user;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findById(id);

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User deleted: ${id}`, 'UsersService');
  }
}
```

---

## DTOs и валидация

### Глобальная настройка валидации

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Strip unknown properties
  forbidNonWhitelisted: true,   // Throw error on unknown properties
  transform: true,              // Auto type conversion
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

### Примеры DTOs

**Create User DTO:**

```typescript
import { IsEmail, IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (min 12 characters, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123!',
    minLength: 12,
  })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @ApiProperty({
    description: 'Canadian phone number',
    example: '+14165551234',
    required: false,
  })
  @IsOptional()
  @Matches(/^\+1\d{10}$/, {
    message: 'Phone must be a valid Canadian number (+1XXXXXXXXXX)',
  })
  phone?: string;
}
```

**Update User DTO:**

```typescript
import { PartialType, OmitType } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const)
) {}
```

---

## Интеграция с Prisma

### Prisma Service

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

### Prisma Module

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Использование в сервисах

```typescript
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, role: UserRole) {
    const where = role === 'CLIENT'
      ? { clientId: userId }
      : { contractorId: userId };

    return this.prisma.order.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createWithTransaction(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          ...createOrderDto,
          status: 'PENDING',
        },
      });

      // Send notification
      await tx.notification.create({
        data: {
          userId: createOrderDto.contractorId,
          type: 'NEW_ORDER',
          orderId: order.id,
        },
      });

      return order;
    });
  }
}
```

---

## WebSocket (Socket.io)

### Gateway Configuration

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly moderationService: ModerationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Verify JWT token
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verifyAsync(token);

      client.data.userId = payload.sub;
      client.data.userRole = payload.role;

      // Update user online status
      await this.chatService.setUserOnline(payload.sub);

      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      await this.chatService.setUserOffline(userId);
      console.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    // Rate limiting check
    const canSend = await this.chatService.checkRateLimit(userId);
    if (!canSend) {
      return {
        event: 'error',
        data: { message: 'Rate limit exceeded. Max 20 messages per minute.' },
      };
    }

    // Moderate content
    const moderation = await this.moderationService.moderateMessage(data.content);
    if (!moderation.allowed) {
      return {
        event: 'error',
        data: {
          message: 'Message contains prohibited content',
          flags: moderation.flags,
        },
      };
    }

    // Save message
    const message = await this.chatService.createMessage({
      senderId: userId,
      receiverId: data.receiverId,
      content: moderation.cleaned,
    });

    // Broadcast to receiver
    this.server.to(`user:${data.receiverId}`).emit('message', message);

    return {
      event: 'message',
      data: message,
    };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    this.server.to(`user:${data.receiverId}`).emit('typing', { userId });
  }
}
```

### WebSocket Security

**Guards:**

```typescript
@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token;

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
      client.data.userRole = payload.role;

      return true;
    } catch {
      return false;
    }
  }
}
```

---

## Аутентификация и безопасность

### JWT Configuration

```typescript
// .env
JWT_ACCESS_SECRET=<256-bit secret>   # openssl rand -base64 64
JWT_REFRESH_SECRET=<256-bit secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Auth Service

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRATION,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
```

### Rate Limiting

```typescript
// Global configuration
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 requests per minute per IP
    }),
  ],
})
export class AppModule {}

// Controller-specific
@Controller('auth')
export class AuthController {
  @Throttle(5, 60) // 5 requests per minute
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

---

## Интеграция с Stripe

### Payment Service

```typescript
@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(createPaymentDto: CreatePaymentDto) {
    const { amount, orderId, customerId } = createPaymentDto;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'cad',
      customer: customerId,
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentIntentId: paymentIntent.id,
        paidAt: new Date(),
      },
    });

    // Send notification to contractor
    // ...
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAYMENT_FAILED',
      },
    });

    // Notify client
    // ...
  }
}
```

### Stripe Identity Verification

```typescript
async createVerificationSession(userId: string) {
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

  return {
    url: session.url,
    sessionId: session.id,
  };
}

async handleVerificationCompleted(session: Stripe.Identity.VerificationSession) {
  const userId = session.metadata.userId;

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      isVerified: true,
      verificationDate: new Date(),
    },
  });
}
```

---

## Модерация контента

### Moderation Service

```typescript
@Injectable()
export class ModerationService {
  private readonly profanityList: Set<string>;

  constructor() {
    // Load profanity lists for Canadian English + French
    this.profanityList = new Set([
      // Add profanity words here
    ]);
  }

  moderateMessage(content: string): ModerationResult {
    const flags = {
      hasPhone: this.hasPhoneNumber(content),
      hasEmail: this.hasEmail(content),
      hasUrl: this.hasUrl(content),
      hasSocial: this.hasSocialMedia(content),
      hasProfanity: this.hasProfanity(content),
    };

    const allowed = !Object.values(flags).some(Boolean);
    const cleaned = allowed ? content : this.cleanContent(content);

    return { allowed, flags, cleaned };
  }

  private hasPhoneNumber(content: string): boolean {
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    return phoneRegex.test(content);
  }

  private hasEmail(content: string): boolean {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(content);
  }

  private hasUrl(content: string): boolean {
    const urlRegex = /https?:\/\/(?!hummii\.ca)/;
    return urlRegex.test(content);
  }

  private hasSocialMedia(content: string): boolean {
    const socialRegex = /@(instagram|telegram|whatsapp|facebook|twitter)/i;
    return socialRegex.test(content);
  }

  private hasProfanity(content: string): boolean {
    const words = content.toLowerCase().split(/\s+/);
    return words.some(word => this.profanityList.has(word));
  }

  private cleanContent(content: string): string {
    let cleaned = content;

    // Remove phone numbers
    cleaned = cleaned.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

    // Remove emails
    cleaned = cleaned.replace(/\S+@\S+\.\S+/g, '[EMAIL]');

    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/\S+/g, '[URL]');

    return cleaned;
  }
}
```

---

## Фоновые задачи (Bull)

### Queue Configuration

```typescript
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'notifications' },
    ),
  ],
})
export class QueuesModule {}
```

### Queue Producer

```typescript
@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(userId: string) {
    await this.emailQueue.add('welcome',
      { userId },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }

  async sendOrderNotification(orderId: string, type: string) {
    await this.emailQueue.add('order-notification',
      { orderId, type },
      {
        priority: 2,
        attempts: 5,
      }
    );
  }
}
```

### Queue Processor

```typescript
@Processor('email')
export class EmailProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly onesignal: OneSignalService,
  ) {}

  @Process('welcome')
  async handleWelcome(job: Job<{ userId: string }>) {
    const { userId } = job.data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    await this.onesignal.sendEmail({
      to: user.email,
      templateId: 'welcome',
      data: {
        name: user.name,
      },
    });

    console.log(`Welcome email sent to ${user.email}`);
  }

  @Process('order-notification')
  async handleOrderNotification(
    job: Job<{ orderId: string; type: string }>
  ) {
    const { orderId, type } = job.data;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        contractor: true,
      },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Send email based on type
    const recipient = type === 'NEW_ORDER' ? order.contractor : order.client;

    await this.onesignal.sendEmail({
      to: recipient.email,
      templateId: `order-${type}`,
      data: {
        orderId: order.id,
        // ... other data
      },
    });
  }

  @OnQueueError()
  handleError(error: Error) {
    console.error('Queue error:', error);
  }

  @OnQueueFailed()
  handleFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error);
  }
}
```

---

## PIPEDA Compliance

### Data Masking

```typescript
// Logger Interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Mask sensitive data in logs
    const sanitizedBody = this.maskSensitiveData(request.body);

    console.log('Request:', {
      method: request.method,
      url: request.url,
      body: sanitizedBody,
    });

    return next.handle();
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const masked = { ...data };

    // Mask password
    if (masked.password) {
      masked.password = '***';
    }

    // Mask email
    if (masked.email) {
      const [user, domain] = masked.email.split('@');
      masked.email = `${user[0]}***@${domain}`;
    }

    // Mask phone
    if (masked.phone) {
      masked.phone = `***-***-${masked.phone.slice(-4)}`;
    }

    return masked;
  }
}
```

### User Rights Endpoints

```typescript
@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UserDataController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  // Right to Access
  @Get('data')
  @ApiOperation({ summary: 'Export all user data (PIPEDA compliance)' })
  async exportData(@Req() req: AuthRequest) {
    const userId = req.user.sub;

    const [user, orders, reviews, messages] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.order.findMany({ where: { clientId: userId } }),
      this.prisma.review.findMany({ where: { authorId: userId } }),
      this.prisma.message.findMany({ where: { senderId: userId } }),
    ]);

    return {
      user,
      orders,
      reviews,
      messages,
      exportedAt: new Date(),
    };
  }

  // Right to Erasure
  @Delete()
  @ApiOperation({ summary: 'Delete user account and all data' })
  async deleteAccount(@Req() req: AuthRequest) {
    const userId = req.user.sub;

    await this.prisma.$transaction(async (tx) => {
      // Anonymize orders instead of deleting (legal requirement)
      await tx.order.updateMany({
        where: { clientId: userId },
        data: { clientId: null },
      });

      // Delete messages
      await tx.message.deleteMany({
        where: { senderId: userId },
      });

      // Delete reviews
      await tx.review.deleteMany({
        where: { authorId: userId },
      });

      // Delete user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { message: 'Account deleted successfully' };
  }

  // Right to Data Portability
  @Get('export')
  @ApiOperation({ summary: 'Export user data in JSON format' })
  async exportPortable(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    const data = await this.exportData(req);

    // Return as downloadable JSON
    return {
      data,
      format: 'JSON',
      exportedAt: new Date(),
    };
  }
}
```

---

## Связанные документы

- **[CLAUDE.md](/Volumes/FilinSky/PROJECTS/Hummii/CLAUDE.md)** - Полное руководство по проекту
- **[SECURITY_BEST_PRACTICES.md](/Volumes/FilinSky/PROJECTS/Hummii/SECURITY_BEST_PRACTICES.md)** - Практики безопасности
- **[docs/security.md](/Volumes/FilinSky/PROJECTS/Hummii/docs/security.md)** - PIPEDA Compliance
- **[docs/Stack_EN.md](/Volumes/FilinSky/PROJECTS/Hummii/docs/Stack_EN.md)** - Технический стек

---

**Последнее обновление:** 27 октября 2025
