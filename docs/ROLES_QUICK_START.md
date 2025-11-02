# Quick Start: Использование системы ролей

## Базовое использование

### 1. Защита эндпоинта по роли

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard) // Оба guard'а обязательны
export class OrdersController {
  
  // Только CLIENT может создавать заказы
  @Post()
  @Roles(UserRole.CLIENT)
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // CLIENT и CONTRACTOR могут просматривать
  @Get()
  @Roles(UserRole.CLIENT, UserRole.CONTRACTOR)
  async getOrders() {
    return this.ordersService.findAll();
  }

  // Только ADMIN
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }
}
```

### 2. Проверка владения ресурсом

```typescript
import { ResourceOwnerGuard } from './auth/guards/resource-owner.guard';

@Controller('orders')
export class OrdersController {
  
  // Только владелец заказа (CLIENT или CONTRACTOR) или ADMIN
  @Patch(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  async updateOrder(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }
}
```

### 3. Получение текущего пользователя

```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    // user.userId - ID пользователя
    // user.email - Email
    // user.role - Роль (CLIENT, CONTRACTOR, ADMIN)
    
    return this.usersService.findById(user.userId);
  }
}
```

## Матрица доступа

| Эндпоинт | CLIENT | CONTRACTOR | ADMIN |
|----------|--------|------------|-------|
| `GET /users/me` | ✅ | ✅ | ✅ |
| `POST /orders` | ✅ | ❌ | ✅ |
| `POST /orders/:id/proposals` | ❌ | ✅ | ✅ |
| `GET /admin/*` | ❌ | ❌ | ✅ |
| `PATCH /orders/:id` (свой) | ✅ | ✅ | ✅ |
| `PATCH /orders/:id` (чужой) | ❌ | ❌ | ✅ |

## Тестирование в Swagger

1. Зарегистрируйте пользователя: `POST /auth/register`
2. Войдите: `POST /auth/login`
3. Скопируйте `accessToken` из ответа
4. Нажмите "Authorize" в Swagger UI
5. Вставьте токен: `Bearer <accessToken>`
6. Тестируйте защищенные эндпоинты

## Частые ошибки

### ❌ Забыли применить guards
```typescript
// ПЛОХО - не защищено!
@Get('admin/users')
async getAllUsers() { ... }

// ХОРОШО
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin/users')
async getAllUsers() { ... }
```

### ❌ Неправильный порядок guards
```typescript
// ПЛОХО - RolesGuard сначала не сработает (нет user)
@UseGuards(RolesGuard, JwtAuthGuard)

// ХОРОШО - сначала аутентификация, потом роли
@UseGuards(JwtAuthGuard, RolesGuard)
```

### ❌ Забыли экспортировать guard
```typescript
// В module.ts
@Module({
  providers: [RolesGuard],
  exports: [RolesGuard], // ✅ Экспортируем!
})
```

## Audit Logging

Все операции автоматически логируются через `AuditInterceptor`:

```typescript
// Audit log автоматически создается для:
// - POST (CREATE)
// - PATCH/PUT (UPDATE)
// - DELETE
// - GET для sensitive endpoints (/admin/*, /users/me/export)

// Просмотр логов (только ADMIN):
GET /admin/audit-logs?userId=xxx&action=UPDATE
```

## PIPEDA Compliance

Система ролей обеспечивает PIPEDA compliance:

- ✅ **Right to Access** - `GET /users/me`
- ✅ **Right to Rectification** - `PATCH /users/me`
- ✅ **Right to Erasure** - `DELETE /users/me`
- ✅ **Right to Data Portability** - `GET /users/me/export`
- ✅ **Audit Trail** - все операции логируются

---

**Документация:** `/docs/ROLES_IMPLEMENTATION.md`  
**Создано:** January 2025

