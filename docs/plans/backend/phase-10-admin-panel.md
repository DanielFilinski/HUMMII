# Phase 10: Admin Panel API

**Duration:** Week 21-22  
**Priority:** 🟢 MEDIUM  
**Status:** Not Started  
**Dependencies:** Phases 1-9 must be complete

---

## Цели фазы

Создать полноценный Admin Panel API для управления платформой, включая:
- Управление пользователями (поиск, модерация, блокировка)
- Очереди модерации (профили, портфолио, отзывы)
- Разрешение споров
- Analytics dashboard
- Audit log viewer
- Bulk операции
- Максимальный уровень безопасности и аудита

---

## Задача 1: Admin Module Foundation

**Приоритет:** 🔴 CRITICAL  
**Время:** 1 день

### 1.1 Module Setup

**Цель:** Создать базовую структуру admin модуля с безопасностью

#### Подзадачи:
- [ ] **1.1.1** Создать admin module structure
  ```bash
  cd src
  nest g module admin
  nest g service admin
  nest g controller admin
  ```
  
  Структура:
  ```
  src/admin/
  ├── admin.module.ts
  ├── admin.service.ts
  ├── admin.controller.ts
  ├── dto/
  │   ├── user-search.dto.ts
  │   ├── user-action.dto.ts
  │   ├── bulk-action.dto.ts
  │   └── analytics.dto.ts
  ├── guards/
  │   ├── admin-role.guard.ts
  │   └── ip-whitelist.guard.ts
  ├── interfaces/
  │   ├── admin-action.interface.ts
  │   └── analytics.interface.ts
  └── enums/
      ├── admin-action-type.enum.ts
      └── moderation-status.enum.ts
  ```

- [ ] **1.1.2** Настроить admin guards
  ```typescript
  // guards/admin-role.guard.ts
  @Injectable()
  export class AdminRoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return user?.role === UserRole.ADMIN;
    }
  }
  ```

- [ ] **1.1.3** Создать IP whitelist guard (опционально)
  ```typescript
  // guards/ip-whitelist.guard.ts
  @Injectable()
  export class IPWhitelistGuard implements CanActivate {
    private readonly whitelistedIPs = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
    
    canActivate(context: ExecutionContext): boolean {
      if (!this.whitelistedIPs.length) return true; // Disabled if not configured
      const request = context.switchToHttp().getRequest();
      const ip = request.ip || request.connection.remoteAddress;
      return this.whitelistedIPs.includes(ip);
    }
  }
  ```

### 1.2 Rate Limiting для Admin

**Цель:** Настроить специальное rate limiting для admin endpoints

#### Подзадачи:
- [ ] **1.2.1** Создать admin-specific rate limiting
  ```typescript
  // Rate limits для admin endpoints
  const ADMIN_RATE_LIMITS = {
    USER_SEARCH: { limit: 50, window: 60 }, // 50 req/min
    BULK_ACTIONS: { limit: 10, window: 60 }, // 10 bulk ops/min
    USER_ACTIONS: { limit: 30, window: 60 }, // 30 user actions/min
    ANALYTICS: { limit: 20, window: 60 }, // 20 analytics req/min
  };
  ```

- [ ] **1.2.2** Настроить audit logging interceptor
  ```typescript
  // interceptors/admin-audit.interceptor.ts
  @Injectable()
  export class AdminAuditInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const startTime = Date.now();
      
      return next.handle().pipe(
        tap((data) => {
          this.logAdminAction(request, data, Date.now() - startTime);
        }),
      );
    }
  }
  ```

**Критерии приемки:**
- ✅ Admin module создан с правильной структурой
- ✅ Admin role guard работает
- ✅ Rate limiting настроен
- ✅ Audit logging активен
- ✅ IP whitelist guard готов (опционально)

---

## Задача 2: User Management API

**Приоритет:** 🔴 CRITICAL  
**Время:** 2-3 дня

### 2.1 User Search & Filtering

**Цель:** Реализовать продвинутый поиск пользователей для админов

#### Подзадачи:
- [ ] **2.1.1** Создать DTO для user search
  ```typescript
  // dto/user-search.dto.ts
  export class UserSearchDto {
    @IsOptional()
    @IsString()
    @Length(2, 100)
    search?: string; // Email, name, phone
    
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
    
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;
    
    @IsOptional()
    @IsDateString()
    registeredAfter?: string;
    
    @IsOptional()
    @IsDateString()
    registeredBefore?: string;
    
    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
    
    @IsOptional()
    @IsBoolean()
    isSuspended?: boolean;
    
    @IsOptional()
    @Min(0)
    @Max(1000)
    limit?: number = 20;
    
    @IsOptional()
    @Min(0)
    offset?: number = 0;
    
    @IsOptional()
    @IsIn(['createdAt', 'lastLoginAt', 'email', 'rating'])
    sortBy?: string = 'createdAt';
    
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
  }
  ```

- [ ] **2.1.2** Реализовать user search service method
  ```typescript
  // admin.service.ts
  async searchUsers(searchDto: UserSearchDto) {
    const query = this.prisma.user.findMany({
      where: {
        AND: [
          searchDto.search ? {
            OR: [
              { email: { contains: searchDto.search, mode: 'insensitive' } },
              { firstName: { contains: searchDto.search, mode: 'insensitive' } },
              { lastName: { contains: searchDto.search, mode: 'insensitive' } },
              { phone: { contains: searchDto.search } },
            ]
          } : {},
          searchDto.role ? { role: searchDto.role } : {},
          searchDto.status ? { status: searchDto.status } : {},
          searchDto.isVerified !== undefined ? { isEmailVerified: searchDto.isVerified } : {},
          searchDto.isSuspended !== undefined ? { isSuspended: searchDto.isSuspended } : {},
          searchDto.registeredAfter ? { createdAt: { gte: new Date(searchDto.registeredAfter) } } : {},
          searchDto.registeredBefore ? { createdAt: { lte: new Date(searchDto.registeredBefore) } } : {},
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isSuspended: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            ordersAsClient: true,
            ordersAsContractor: true,
            reviewsReceived: true,
          }
        }
      },
      orderBy: {
        [searchDto.sortBy]: searchDto.sortOrder
      },
      take: searchDto.limit,
      skip: searchDto.offset,
    });
    
    const total = await this.prisma.user.count({ where: query.where });
    const users = await query;
    
    return {
      users: users.map(user => ({
        ...user,
        // Mask sensitive data
        email: this.maskEmail(user.email),
        phone: this.maskPhone(user.phone),
      })),
      pagination: {
        total,
        limit: searchDto.limit,
        offset: searchDto.offset,
        hasMore: (searchDto.offset + searchDto.limit) < total,
      }
    };
  }
  ```

- [ ] **2.1.3** Создать GET endpoint для user search
  ```typescript
  // admin.controller.ts
  @Get('users')
  @UseGuards(JwtAuthGuard, AdminRoleGuard, IPWhitelistGuard)
  @UseInterceptors(AdminAuditInterceptor)
  @Throttle(50, 60) // 50 requests per minute
  async searchUsers(@Query() searchDto: UserSearchDto) {
    return this.adminService.searchUsers(searchDto);
  }
  ```

### 2.2 User Profile Viewing

**Цель:** Админы могут просматривать полные профили пользователей

#### Подзадачи:
- [ ] **2.2.1** Создать endpoint для просмотра full user profile
  ```typescript
  @Get('users/:userId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  async getUserProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    const user = await this.adminService.getUserFullProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  ```

- [ ] **2.2.2** Реализовать getUserFullProfile method
  ```typescript
  async getUserFullProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        contractor: {
          include: {
            portfolio: true,
            services: true,
            reviews: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        ordersAsClient: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            createdAt: true,
          }
        },
        ordersAsContractor: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            createdAt: true,
          }
        },
        auditLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }
  ```

### 2.3 User Actions (Ban, Verify, Suspend)

**Цель:** Админы могут выполнять действия над пользователями

#### Подзадачи:
- [ ] **2.3.1** Создать DTO для user actions
  ```typescript
  // dto/user-action.dto.ts
  export class UserActionDto {
    @IsEnum(AdminActionType)
    action: AdminActionType;
    
    @IsOptional()
    @IsString()
    @Length(10, 500)
    reason?: string;
    
    @IsOptional()
    @IsDateString()
    expiresAt?: string; // For temporary suspensions
    
    @IsOptional()
    @IsBoolean()
    notifyUser?: boolean = true;
  }
  
  export enum AdminActionType {
    SUSPEND = 'suspend',
    UNSUSPEND = 'unsuspend',
    BAN = 'ban',
    UNBAN = 'unban',
    VERIFY = 'verify',
    UNVERIFY = 'unverify',
    RESET_PASSWORD = 'reset_password',
    FORCE_LOGOUT = 'force_logout',
  }
  ```

- [ ] **2.3.2** Создать POST endpoint для user actions
  ```typescript
  @Post('users/:userId/actions')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  @Throttle(30, 60) // 30 actions per minute
  async performUserAction(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() actionDto: UserActionDto,
    @Request() req,
  ) {
    return this.adminService.performUserAction(userId, actionDto, req.user.id);
  }
  ```

- [ ] **2.3.3** Реализовать performUserAction method
  ```typescript
  async performUserAction(userId: string, actionDto: UserActionDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    let updateData = {};
    let auditMessage = '';
    
    switch (actionDto.action) {
      case AdminActionType.SUSPEND:
        updateData = { 
          isSuspended: true, 
          suspendedAt: new Date(),
          suspendedUntil: actionDto.expiresAt ? new Date(actionDto.expiresAt) : null,
        };
        auditMessage = `User suspended: ${actionDto.reason}`;
        break;
        
      case AdminActionType.UNSUSPEND:
        updateData = { 
          isSuspended: false, 
          suspendedAt: null,
          suspendedUntil: null,
        };
        auditMessage = 'User unsuspended';
        break;
        
      case AdminActionType.BAN:
        updateData = { 
          isBanned: true, 
          bannedAt: new Date(),
        };
        auditMessage = `User banned: ${actionDto.reason}`;
        break;
        
      case AdminActionType.VERIFY:
        updateData = { 
          isManuallyVerified: true, 
          verifiedAt: new Date(),
        };
        auditMessage = 'User manually verified';
        break;
        
      // ... other cases
    }
    
    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    
    // Create audit log
    await this.auditService.log({
      action: `admin.user.${actionDto.action}`,
      adminId,
      targetUserId: userId,
      details: {
        reason: actionDto.reason,
        expiresAt: actionDto.expiresAt,
      },
      metadata: {
        userEmail: user.email,
        actionPerformed: auditMessage,
      }
    });
    
    // Notify user if requested
    if (actionDto.notifyUser) {
      await this.notificationService.sendUserActionNotification(userId, actionDto.action, actionDto.reason);
    }
    
    return {
      success: true,
      message: auditMessage,
      user: {
        id: updatedUser.id,
        email: this.maskEmail(updatedUser.email),
        status: updatedUser.status,
        isSuspended: updatedUser.isSuspended,
        isBanned: updatedUser.isBanned,
      }
    };
  }
  ```

**Критерии приемки:**
- ✅ Поиск пользователей работает с фильтрами
- ✅ Просмотр полного профиля пользователя
- ✅ Все user actions реализованы
- ✅ Audit logging работает
- ✅ Rate limiting настроен
- ✅ PII data маскируется в ответах
- ✅ Уведомления отправляются пользователям

---

## Задача 3: Moderation Queues

**Приоритет:** 🟡 HIGH  
**Время:** 2-3 дня

### 3.1 Content Moderation Queue

**Цель:** Система очередей для модерации контента

#### Подзадачи:
- [ ] **3.1.1** Создать moderation queue DTOs
  ```typescript
  // dto/moderation-queue.dto.ts
  export class ModerationQueueDto {
    @IsOptional()
    @IsEnum(ContentType)
    contentType?: ContentType;
    
    @IsOptional()
    @IsEnum(ModerationStatus)
    status?: ModerationStatus = ModerationStatus.PENDING;
    
    @IsOptional()
    @Min(0)
    @Max(100)
    limit?: number = 20;
    
    @IsOptional()
    @Min(0)
    offset?: number = 0;
  }
  
  export enum ContentType {
    PROFILE = 'profile',
    PORTFOLIO = 'portfolio',
    REVIEW = 'review',
    CHAT_MESSAGE = 'chat_message',
  }
  
  export enum ModerationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    FLAGGED = 'flagged',
  }
  ```

- [ ] **3.1.2** Создать GET endpoint для moderation queue
  ```typescript
  @Get('moderation/queue')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  async getModerationQueue(@Query() queueDto: ModerationQueueDto) {
    return this.adminService.getModerationQueue(queueDto);
  }
  ```

- [ ] **3.1.3** Реализовать getModerationQueue method
  ```typescript
  async getModerationQueue(queueDto: ModerationQueueDto) {
    const items = await this.prisma.moderationQueue.findMany({
      where: {
        contentType: queueDto.contentType,
        status: queueDto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        moderatedBy: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // FIFO
      },
      take: queueDto.limit,
      skip: queueDto.offset,
    });
    
    return {
      items: items.map(item => ({
        ...item,
        user: {
          ...item.user,
          email: this.maskEmail(item.user.email),
        }
      })),
      pagination: {
        total: await this.prisma.moderationQueue.count({
          where: {
            contentType: queueDto.contentType,
            status: queueDto.status,
          }
        }),
        limit: queueDto.limit,
        offset: queueDto.offset,
      }
    };
  }
  ```

### 3.2 Bulk Moderation Actions

**Цель:** Админы могут выполнять bulk операции над очередью модерации

#### Подзадачи:
- [ ] **3.2.1** Создать DTO для bulk actions
  ```typescript
  // dto/bulk-action.dto.ts
  export class BulkModerationActionDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50) // Max 50 items per bulk action
    @IsUUID('4', { each: true })
    itemIds: string[];
    
    @IsEnum(ModerationAction)
    action: ModerationAction;
    
    @IsOptional()
    @IsString()
    @Length(10, 500)
    reason?: string;
  }
  
  export enum ModerationAction {
    APPROVE = 'approve',
    REJECT = 'reject',
    FLAG = 'flag',
    DELETE = 'delete',
  }
  ```

- [ ] **3.2.2** Создать POST endpoint для bulk actions
  ```typescript
  @Post('moderation/bulk-action')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  @Throttle(10, 60) // 10 bulk actions per minute
  async performBulkModerationAction(
    @Body() bulkActionDto: BulkModerationActionDto,
    @Request() req,
  ) {
    return this.adminService.performBulkModerationAction(bulkActionDto, req.user.id);
  }
  ```

- [ ] **3.2.3** Реализовать performBulkModerationAction method
  ```typescript
  async performBulkModerationAction(bulkActionDto: BulkModerationActionDto, adminId: string) {
    const results = [];
    const errors = [];
    
    // Process items in transaction
    await this.prisma.$transaction(async (prisma) => {
      for (const itemId of bulkActionDto.itemIds) {
        try {
          const item = await prisma.moderationQueue.findUnique({
            where: { id: itemId }
          });
          
          if (!item) {
            errors.push({ itemId, error: 'Item not found' });
            continue;
          }
          
          let newStatus: ModerationStatus;
          switch (bulkActionDto.action) {
            case ModerationAction.APPROVE:
              newStatus = ModerationStatus.APPROVED;
              break;
            case ModerationAction.REJECT:
              newStatus = ModerationStatus.REJECTED;
              break;
            case ModerationAction.FLAG:
              newStatus = ModerationStatus.FLAGGED;
              break;
            default:
              throw new Error('Invalid action');
          }
          
          await prisma.moderationQueue.update({
            where: { id: itemId },
            data: {
              status: newStatus,
              moderatedBy: adminId,
              moderatedAt: new Date(),
              moderationReason: bulkActionDto.reason,
            }
          });
          
          results.push({ itemId, status: 'success' });
          
        } catch (error) {
          errors.push({ itemId, error: error.message });
        }
      }
    });
    
    // Log bulk action
    await this.auditService.log({
      action: 'admin.moderation.bulk_action',
      adminId,
      details: {
        action: bulkActionDto.action,
        itemIds: bulkActionDto.itemIds,
        reason: bulkActionDto.reason,
        successCount: results.length,
        errorCount: errors.length,
      }
    });
    
    return {
      success: results,
      errors,
      summary: {
        total: bulkActionDto.itemIds.length,
        processed: results.length,
        failed: errors.length,
      }
    };
  }
  ```

**Критерии приемки:**
- ✅ Moderation queue отображается корректно
- ✅ Фильтрация по типу контента работает
- ✅ Bulk actions выполняются в транзакциях
- ✅ Rate limiting для bulk operations
- ✅ Audit logging для всех действий
- ✅ Error handling для failed operations

---

## Задача 4: Analytics Dashboard API

**Приоритет:** 🟡 HIGH  
**Время:** 2 дня

### 4.1 System Statistics

**Цель:** API для получения системных статистик

#### Подзадачи:
- [ ] **4.1.1** Создать DTO для analytics
  ```typescript
  // dto/analytics.dto.ts
  export class AnalyticsDateRangeDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;
    
    @IsOptional()
    @IsDateString()
    endDate?: string;
    
    @IsOptional()
    @IsEnum(AnalyticsGranularity)
    granularity?: AnalyticsGranularity = AnalyticsGranularity.DAY;
  }
  
  export enum AnalyticsGranularity {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
  }
  ```

- [ ] **4.1.2** Создать GET endpoint для overview stats
  ```typescript
  @Get('analytics/overview')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  @Throttle(20, 60) // 20 requests per minute
  async getOverviewStats(@Query() dateRange: AnalyticsDateRangeDto) {
    return this.adminService.getOverviewStats(dateRange);
  }
  ```

- [ ] **4.1.3** Реализовать getOverviewStats method
  ```typescript
  async getOverviewStats(dateRange: AnalyticsDateRangeDto) {
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
    
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      completedOrders,
      totalRevenue,
      pendingModerations,
      activeDisputes,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // Active users (logged in last 7 days)
      this.prisma.user.count({
        where: {
          lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      
      // Total orders
      this.prisma.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // Completed orders
      this.prisma.order.count({
        where: {
          status: OrderStatus.COMPLETED,
          updatedAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // Total revenue
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // Pending moderations
      this.prisma.moderationQueue.count({
        where: { status: ModerationStatus.PENDING }
      }),
      
      // Active disputes
      this.prisma.dispute.count({
        where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.IN_REVIEW] } }
      }),
    ]);
    
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: await this.calculateGrowthRate('user', startDate, endDate),
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        growth: await this.calculateRevenueGrowth(startDate, endDate),
      },
      moderation: {
        pendingItems: pendingModerations,
        avgProcessingTime: await this.getAvgModerationTime(),
      },
      disputes: {
        active: activeDisputes,
        resolutionRate: await this.getDisputeResolutionRate(),
      },
    };
  }
  ```

### 4.2 Detailed Analytics Endpoints

**Цель:** Детальные analytics для различных метрик

#### Подзадачи:
- [ ] **4.2.1** User analytics endpoint
  ```typescript
  @Get('analytics/users')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getUserAnalytics(@Query() dateRange: AnalyticsDateRangeDto) {
    return this.adminService.getUserAnalytics(dateRange);
  }
  ```

- [ ] **4.2.2** Order analytics endpoint
  ```typescript
  @Get('analytics/orders')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getOrderAnalytics(@Query() dateRange: AnalyticsDateRangeDto) {
    return this.adminService.getOrderAnalytics(dateRange);
  }
  ```

- [ ] **4.2.3** Revenue analytics endpoint
  ```typescript
  @Get('analytics/revenue')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getRevenueAnalytics(@Query() dateRange: AnalyticsDateRangeDto) {
    return this.adminService.getRevenueAnalytics(dateRange);
  }
  ```

**Критерии приемки:**
- ✅ Overview statistics работают
- ✅ Детальные analytics по пользователям, заказам, доходам
- ✅ Кэширование результатов (Redis)
- ✅ Rate limiting для analytics endpoints
- ✅ Оптимизированные SQL запросы

---

## Задача 5: Dispute Resolution Tools

**Приоритет:** 🟡 HIGH  
**Время:** 2 дня

### 5.1 Dispute Management

**Цель:** Инструменты для управления спорами

#### Подзадачи:
- [ ] **5.1.1** Создать GET endpoint для dispute list
  ```typescript
  @Get('disputes')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  async getDisputes(@Query() query: DisputeSearchDto) {
    return this.adminService.getDisputes(query);
  }
  ```

- [ ] **5.1.2** Создать GET endpoint для single dispute
  ```typescript
  @Get('disputes/:disputeId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getDisputeDetails(@Param('disputeId', ParseUUIDPipe) disputeId: string) {
    return this.adminService.getDisputeDetails(disputeId);
  }
  ```

- [ ] **5.1.3** Создать POST endpoint для dispute resolution
  ```typescript
  @Post('disputes/:disputeId/resolve')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @UseInterceptors(AdminAuditInterceptor)
  async resolveDispute(
    @Param('disputeId', ParseUUIDPipe) disputeId: string,
    @Body() resolutionDto: DisputeResolutionDto,
    @Request() req,
  ) {
    return this.adminService.resolveDispute(disputeId, resolutionDto, req.user.id);
  }
  ```

- [ ] **5.1.4** Реализовать dispute resolution logic
  ```typescript
  async resolveDispute(disputeId: string, resolutionDto: DisputeResolutionDto, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            payment: true,
            client: true,
            contractor: true,
          }
        }
      }
    });
    
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    
    // Process payment distribution based on resolution
    let paymentDistribution;
    switch (resolutionDto.resolution) {
      case DisputeResolution.FULL_REFUND:
        paymentDistribution = { clientAmount: dispute.order.payment.amount, contractorAmount: 0 };
        break;
      case DisputeResolution.FULL_PAYMENT:
        paymentDistribution = { clientAmount: 0, contractorAmount: dispute.order.payment.amount };
        break;
      case DisputeResolution.PARTIAL_SPLIT:
        paymentDistribution = {
          clientAmount: Math.round(dispute.order.payment.amount * resolutionDto.clientPercentage / 100),
          contractorAmount: Math.round(dispute.order.payment.amount * (100 - resolutionDto.clientPercentage) / 100),
        };
        break;
    }
    
    // Execute in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update dispute
      const updatedDispute = await prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          resolvedAt: new Date(),
          resolvedBy: adminId,
          resolution: resolutionDto.resolution,
          adminNotes: resolutionDto.adminNotes,
          paymentDistribution,
        }
      });
      
      // Update order status
      await prisma.order.update({
        where: { id: dispute.orderId },
        data: { status: OrderStatus.COMPLETED }
      });
      
      // Process payment distribution
      if (paymentDistribution.clientAmount > 0) {
        await this.paymentService.processRefund(dispute.order.payment.id, paymentDistribution.clientAmount);
      }
      
      if (paymentDistribution.contractorAmount > 0) {
        await this.paymentService.processPayment(dispute.order.contractorId, paymentDistribution.contractorAmount);
      }
      
      return updatedDispute;
    });
    
    // Send notifications
    await Promise.all([
      this.notificationService.sendDisputeResolutionNotification(
        dispute.order.clientId,
        dispute.id,
        resolutionDto.resolution,
      ),
      this.notificationService.sendDisputeResolutionNotification(
        dispute.order.contractorId,
        dispute.id,
        resolutionDto.resolution,
      ),
    ]);
    
    // Log audit
    await this.auditService.log({
      action: 'admin.dispute.resolve',
      adminId,
      targetUserId: dispute.order.clientId,
      details: {
        disputeId,
        resolution: resolutionDto.resolution,
        paymentDistribution,
        adminNotes: resolutionDto.adminNotes,
      }
    });
    
    return result;
  }
  ```

**Критерии приемки:**
- ✅ Dispute list с фильтрацией
- ✅ Детальный просмотр спора
- ✅ Разрешение споров с payment distribution
- ✅ Уведомления участникам
- ✅ Audit logging

---

## Задача 6: Audit Log Viewer

**Приоритет:** 🔴 CRITICAL  
**Время:** 1 день

### 6.1 Audit Log API

**Цель:** Просмотр и поиск по audit logs

#### Подзадачи:
- [ ] **6.1.1** Создать DTO для audit search
  ```typescript
  // dto/audit-search.dto.ts
  export class AuditSearchDto {
    @IsOptional()
    @IsString()
    action?: string; // Filter by action type
    
    @IsOptional()
    @IsUUID()
    adminId?: string; // Filter by admin
    
    @IsOptional()
    @IsUUID()
    targetUserId?: string; // Filter by target user
    
    @IsOptional()
    @IsDateString()
    startDate?: string;
    
    @IsOptional()
    @IsDateString()
    endDate?: string;
    
    @IsOptional()
    @Min(0)
    @Max(100)
    limit?: number = 50;
    
    @IsOptional()
    @Min(0)
    offset?: number = 0;
  }
  ```

- [ ] **6.1.2** Создать GET endpoint для audit logs
  ```typescript
  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  async getAuditLogs(@Query() searchDto: AuditSearchDto) {
    return this.adminService.getAuditLogs(searchDto);
  }
  ```

- [ ] **6.1.3** Реализовать getAuditLogs method
  ```typescript
  async getAuditLogs(searchDto: AuditSearchDto) {
    const whereClause = {
      ...(searchDto.action && { action: { contains: searchDto.action } }),
      ...(searchDto.adminId && { adminId: searchDto.adminId }),
      ...(searchDto.targetUserId && { targetUserId: searchDto.targetUserId }),
      ...(searchDto.startDate && { createdAt: { gte: new Date(searchDto.startDate) } }),
      ...(searchDto.endDate && { createdAt: { lte: new Date(searchDto.endDate) } }),
    };
    
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: whereClause,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          targetUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: searchDto.limit,
        skip: searchDto.offset,
      }),
      this.prisma.auditLog.count({ where: whereClause }),
    ]);
    
    return {
      logs: logs.map(log => ({
        ...log,
        admin: log.admin ? {
          ...log.admin,
          email: this.maskEmail(log.admin.email),
        } : null,
        targetUser: log.targetUser ? {
          ...log.targetUser,
          email: this.maskEmail(log.targetUser.email),
        } : null,
      })),
      pagination: {
        total,
        limit: searchDto.limit,
        offset: searchDto.offset,
        hasMore: (searchDto.offset + searchDto.limit) < total,
      }
    };
  }
  ```

**Критерии приемки:**
- ✅ Audit logs отображаются с фильтрацией
- ✅ Поиск по action, admin, target user, date range
- ✅ Пагинация работает
- ✅ PII data маскируется
- ✅ Performance оптимизирован

---

## Задача 7: Security & Testing

**Приоритет:** 🔴 CRITICAL  
**Время:** 1-2 дня

### 7.1 Security Implementation

**Цель:** Максимальная безопасность admin panel

#### Подзадачи:
- [ ] **7.1.1** Implement request validation
  ```typescript
  // Все DTOs должны быть валидированы
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  ```

- [ ] **7.1.2** Add security headers
  ```typescript
  // main.ts
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      }
    }
  }));
  ```

- [ ] **7.1.3** Implement data masking utilities
  ```typescript
  // utils/data-masking.ts
  export class DataMaskingUtil {
    static maskEmail(email: string): string {
      const [username, domain] = email.split('@');
      const maskedUsername = username.length > 3 ? 
        username.substring(0, 2) + '*'.repeat(username.length - 4) + username.slice(-2) :
        username.charAt(0) + '*'.repeat(username.length - 1);
      return `${maskedUsername}@${domain}`;
    }
    
    static maskPhone(phone: string): string {
      if (!phone || phone.length < 4) return phone;
      return '***-***-' + phone.slice(-4);
    }
    
    static maskCreditCard(cardNumber: string): string {
      return '**** **** **** ' + cardNumber.slice(-4);
    }
  }
  ```

### 7.2 Comprehensive Testing

**Цель:** 100% покрытие тестами critical admin functionality

#### Подзадачи:
- [ ] **7.2.1** Unit tests для admin service
  ```typescript
  // admin.service.spec.ts
  describe('AdminService', () => {
    describe('searchUsers', () => {
      it('should search users with filters', async () => {
        // Test user search functionality
      });
      
      it('should mask sensitive data in response', async () => {
        // Test data masking
      });
      
      it('should handle pagination correctly', async () => {
        // Test pagination
      });
    });
    
    describe('performUserAction', () => {
      it('should suspend user correctly', async () => {
        // Test user suspension
      });
      
      it('should create audit log for actions', async () => {
        // Test audit logging
      });
      
      it('should throw error for invalid user', async () => {
        // Test error handling
      });
    });
  });
  ```

- [ ] **7.2.2** E2E tests для admin endpoints
  ```typescript
  // admin.e2e-spec.ts
  describe('Admin API (e2e)', () => {
    describe('/admin/users (GET)', () => {
      it('should require admin role', () => {
        return request(app.getHttpServer())
          .get('/admin/users')
          .expect(403);
      });
      
      it('should return filtered users for admin', () => {
        return request(app.getHttpServer())
          .get('/admin/users?role=CLIENT')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.users).toBeDefined();
            expect(res.body.pagination).toBeDefined();
          });
      });
    });
    
    describe('/admin/users/:id/actions (POST)', () => {
      it('should suspend user successfully', () => {
        return request(app.getHttpServer())
          .post(`/admin/users/${testUserId}/actions`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            action: 'suspend',
            reason: 'Test suspension',
          })
          .expect(201);
      });
    });
  });
  ```

- [ ] **7.2.3** Security tests
  ```typescript
  // security.spec.ts
  describe('Admin Security', () => {
    it('should enforce rate limiting', async () => {
      // Test rate limiting on admin endpoints
    });
    
    it('should validate admin role on all endpoints', async () => {
      // Test role validation
    });
    
    it('should log all admin actions to audit', async () => {
      // Test audit logging
    });
    
    it('should mask PII in all responses', async () => {
      // Test data masking
    });
  });
  ```

**Критерии приемки:**
- ✅ 90%+ test coverage на admin module
- ✅ Все security требования реализованы
- ✅ Rate limiting работает
- ✅ Data masking активен
- ✅ Audit logging протестирован
- ✅ Error handling покрыт тестами

---

## Security Checklist для Phase 10

### 🔒 Обязательные требования безопасности:

- [ ] **Admin Role Verification**
  - [ ] AdminRoleGuard на всех endpoints
  - [ ] Проверка роли в JWT token
  - [ ] Отказ доступа для non-admin users

- [ ] **Rate Limiting**
  - [ ] Глобальное: 100 req/min per IP
  - [ ] User search: 50 req/min
  - [ ] Bulk actions: 10 req/min
  - [ ] User actions: 30 req/min
  - [ ] Analytics: 20 req/min

- [ ] **Input Validation**
  - [ ] class-validator на всех DTOs
  - [ ] whitelist: true
  - [ ] forbidNonWhitelisted: true
  - [ ] Request size limits

- [ ] **Audit Logging**
  - [ ] Все admin actions логируются
  - [ ] User ID, timestamp, action, details
  - [ ] Correlation IDs для tracking
  - [ ] No sensitive data в логах

- [ ] **Data Protection**
  - [ ] Email masking: `u***@example.com`
  - [ ] Phone masking: `***-***-1234`
  - [ ] No passwords/tokens в responses
  - [ ] Access control (только admin data)

- [ ] **IP Whitelist (опционально)**
  - [ ] IPWhitelistGuard
  - [ ] Configurable через env variables
  - [ ] Fallback если не configured

- [ ] **HTTPS & Headers**
  - [ ] Helmet.js security headers
  - [ ] CORS для admin domains only
  - [ ] HSTS headers
  - [ ] CSP configured

### 🧪 Тестирование безопасности:

- [ ] **Authentication Tests**
  - [ ] Доступ без токена → 401
  - [ ] Доступ с invalid токеном → 401  
  - [ ] Доступ с non-admin токеном → 403

- [ ] **Rate Limiting Tests**
  - [ ] Превышение лимита → 429
  - [ ] Rate limit headers в response
  - [ ] Different limits для разных endpoints

- [ ] **Data Protection Tests**
  - [ ] Email masking работает
  - [ ] Phone masking работает
  - [ ] No sensitive data в responses

- [ ] **Audit Logging Tests**
  - [ ] Все admin actions создают audit records
  - [ ] Audit records содержат нужные поля
  - [ ] Correlation IDs присутствуют

---

## 📊 Критерии готовности Phase 10

### Функциональность:
- ✅ User management API (search, actions, profile view)
- ✅ Moderation queues (content review, bulk actions)  
- ✅ Analytics dashboard (overview, detailed stats)
- ✅ Dispute resolution tools
- ✅ Audit log viewer
- ✅ Admin authentication & authorization

### Безопасность:
- ✅ Admin role guards на всех endpoints
- ✅ Rate limiting активен
- ✅ Audit logging работает  
- ✅ Data masking реализован
- ✅ Input validation настроен
- ✅ Security headers конфигурированы

### Тестирование:
- ✅ Unit tests (90%+ coverage)
- ✅ E2E tests для критических путей
- ✅ Security tests пройдены
- ✅ Performance tests выполнены

### Документация:
- ✅ API documentation (Swagger)
- ✅ Security guidelines
- ✅ Admin user guide
- ✅ Troubleshooting guide

---

**Время выполнения:** 10-12 дней  
**Команда:** 2-3 backend разработчика  
**Блокеры:** Зависит от Phase 1-9  
**Следующая фаза:** Phase 11 (Partner Portal API)