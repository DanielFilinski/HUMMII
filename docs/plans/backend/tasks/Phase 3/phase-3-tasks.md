# Phase 3: Orders Module - Детальные задачи

**Длительность:** Week 7-8 (2 недели)
**Приоритет:** 🔴 CRITICAL
**Зависимости:** Phase 0, Phase 1, Phase 2 должны быть завершены

---

## 📋 Overview

Phase 3 фокусируется на создании полноценной системы управления заказами (orders) с двусторонним рабочим процессом: клиент создает заказ → исполнители отправляют предложения (proposals) → клиент выбирает исполнителя → работа выполняется → оплата и отзывы.

**Ключевые deliverables:**
- Order lifecycle management (7 statuses)
- Proposal system (contractors bid on orders)
- Public orders (receive proposals) + Direct orders (to specific contractor)
- Order search & filtering (category, location, price, date)
- Geospatial search (PostGIS radius queries)
- Status transitions with validation
- Security & rate limiting

---

## 🎯 Task Breakdown

### 1. Orders Module Setup (Day 1)

#### 1.1 Create Orders Module Structure
**Файлы для создания:**
```
api/src/orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── proposals.controller.ts
├── proposals.service.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order.dto.ts
│   ├── create-proposal.dto.ts
│   ├── update-proposal.dto.ts
│   ├── search-orders.dto.ts
│   └── filter-orders.dto.ts
├── entities/
│   ├── order.entity.ts
│   └── proposal.entity.ts
└── guards/
    ├── order-owner.guard.ts
    └── proposal-owner.guard.ts
```

**Задача 1.1.1:** Создать базовую структуру модуля
- [ ] `nest g module orders`
- [ ] `nest g controller orders`
- [ ] `nest g service orders`
- [ ] `nest g controller proposals`
- [ ] `nest g service proposals`
- [ ] Импортировать PrismaModule, JwtModule, UsersModule
- [ ] Подключить к AppModule

**Задача 1.1.2:** Создать Order и Proposal entities
```typescript
// api/src/orders/entities/order.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum OrderType {
  PUBLIC = 'public',       // Receive proposals from any contractor
  DIRECT = 'direct',       // Direct order to specific contractor
}

export class OrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: OrderType })
  type: OrderType;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  clientId: string;

  @ApiProperty({ required: false })
  contractorId?: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ required: false })
  budget?: number;

  @ApiProperty({ required: false })
  deadline?: Date;

  @ApiProperty()
  location: { lat: number; lng: number };

  @ApiProperty()
  address: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

**Acceptance Criteria:**
- ✅ Orders module создан и подключен
- ✅ Entities определены с полной типизацией
- ✅ Swagger documentation настроена

---

### 2. Order Creation (Day 1-2)

#### 2.1 Create Order DTOs

**Задача 2.1.1:** CreateOrderDto
```typescript
// api/src/orders/dto/create-order.dto.ts
import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, MinLength, MaxLength, Min, IsDateString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: ['public', 'direct'] })
  @IsEnum(['public', 'direct'])
  type: 'public' | 'direct';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contractorId?: string; // Required if type === 'direct'

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;
}
```

**Задача 2.1.2:** UpdateOrderDto
```typescript
// api/src/orders/dto/update-order.dto.ts
import { PartialType } from '@nestjs/swagger';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
```

**Acceptance Criteria:**
- ✅ DTOs созданы с полной валидацией
- ✅ Location validated (lat/lng)
- ✅ Budget must be positive
- ✅ Title/description length validated

---

#### 2.2 Create Order Endpoints

**Задача 2.2.1:** POST /api/v1/orders (Create Draft)
```typescript
@Post()
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Create order (draft by default)' })
@ApiResponse({ status: 201, type: OrderEntity })
@Throttle(10, 3600) // 10 orders per hour
async createOrder(
  @CurrentUser() user: JwtPayload,
  @Body() createDto: CreateOrderDto,
) {
  return this.ordersService.create(user.userId, createDto);
}
```

**Задача 2.2.2:** OrdersService.create() implementation
```typescript
async create(clientId: string, createDto: CreateOrderDto) {
  // Validate contractor exists if type === 'direct'
  if (createDto.type === 'direct' && createDto.contractorId) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId: createDto.contractorId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }
  }

  // Validate category exists
  const category = await this.prisma.category.findUnique({
    where: { id: createDto.categoryId },
  });

  if (!category) {
    throw new NotFoundException('Category not found');
  }

  // Create order (draft status by default)
  const order = await this.prisma.order.create({
    data: {
      title: createDto.title,
      description: createDto.description,
      type: createDto.type,
      status: OrderStatus.DRAFT,
      clientId,
      contractorId: createDto.contractorId,
      categoryId: createDto.categoryId,
      budget: createDto.budget,
      deadline: createDto.deadline ? new Date(createDto.deadline) : null,
      location: {
        type: 'Point',
        coordinates: [createDto.location.lng, createDto.location.lat],
      },
      address: createDto.address,
      city: createDto.city,
      province: createDto.province,
      postalCode: createDto.postalCode,
    },
    include: {
      client: true,
      category: true,
      contractor: true,
    },
  });

  return order;
}
```

**Acceptance Criteria:**
- ✅ Order creation works
- ✅ Draft status by default
- ✅ Contractor validation for direct orders
- ✅ Category validation enforced
- ✅ PostGIS Point stored for location
- ✅ Rate limiting active (10 req/hour)

---

### 3. Order Lifecycle Management (Day 2-3)

#### 3.1 Order Status Transitions

**Задача 3.1.1:** Define status transition rules
```typescript
// api/src/orders/constants/status-transitions.ts
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.DRAFT]: [OrderStatus.PUBLISHED, OrderStatus.CANCELLED],
  [OrderStatus.PUBLISHED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.PENDING_REVIEW, OrderStatus.DISPUTED, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_REVIEW]: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
  [OrderStatus.COMPLETED]: [], // Final state
  [OrderStatus.CANCELLED]: [], // Final state
  [OrderStatus.DISPUTED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED], // Admin resolves
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
```

**Задача 3.1.2:** PATCH /api/v1/orders/:id/status endpoint
```typescript
@Patch(':id/status')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Update order status' })
async updateStatus(
  @CurrentUser() user: JwtPayload,
  @Param('id') orderId: string,
  @Body() updateDto: UpdateOrderStatusDto,
) {
  return this.ordersService.updateStatus(orderId, user.userId, updateDto.status);
}
```

**Задача 3.1.3:** Status update logic with validation
```typescript
async updateStatus(orderId: string, userId: string, newStatus: OrderStatus) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Authorization: only client or contractor can update
  if (order.clientId !== userId && order.contractorId !== userId) {
    throw new ForbiddenException('Not authorized to update this order');
  }

  // Validate status transition
  if (!canTransition(order.status, newStatus)) {
    throw new BadRequestException(
      `Invalid status transition from ${order.status} to ${newStatus}`,
    );
  }

  // Status-specific validations
  if (newStatus === OrderStatus.IN_PROGRESS && !order.contractorId) {
    throw new BadRequestException('Cannot start order without assigned contractor');
  }

  // Update status
  const updatedOrder = await this.prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      ...(newStatus === OrderStatus.IN_PROGRESS && { startedAt: new Date() }),
      ...(newStatus === OrderStatus.COMPLETED && { completedAt: new Date() }),
    },
    include: {
      client: true,
      contractor: true,
      category: true,
    },
  });

  // Send notifications (queue job)
  await this.notificationQueue.add('order-status-changed', {
    orderId: order.id,
    oldStatus: order.status,
    newStatus,
  });

  return updatedOrder;
}
```

**Acceptance Criteria:**
- ✅ Status transitions validated
- ✅ Invalid transitions rejected
- ✅ Authorization enforced (client/contractor only)
- ✅ Timestamps updated (startedAt, completedAt)
- ✅ Notifications sent on status change

---

#### 3.2 Publish Order

**Задача 3.2.1:** POST /api/v1/orders/:id/publish endpoint
```typescript
@Post(':id/publish')
@UseGuards(JwtAuthGuard, OrderOwnerGuard)
@ApiOperation({ summary: 'Publish order (draft → published)' })
async publishOrder(
  @CurrentUser() user: JwtPayload,
  @Param('id') orderId: string,
) {
  return this.ordersService.publishOrder(orderId, user.userId);
}
```

**Задача 3.2.2:** Publish logic
```typescript
async publishOrder(orderId: string, clientId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.clientId !== clientId) {
    throw new ForbiddenException('Not authorized');
  }

  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestException('Only draft orders can be published');
  }

  // Update to published
  const published = await this.prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    include: {
      client: true,
      category: true,
    },
  });

  // Notify nearby contractors (if public order)
  if (order.type === 'public') {
    await this.notificationQueue.add('notify-nearby-contractors', {
      orderId: order.id,
      location: order.location,
      categoryId: order.categoryId,
    });
  }

  // Notify specific contractor (if direct order)
  if (order.type === 'direct' && order.contractorId) {
    await this.notificationQueue.add('notify-contractor-direct-order', {
      orderId: order.id,
      contractorId: order.contractorId,
    });
  }

  return published;
}
```

**Acceptance Criteria:**
- ✅ Order published successfully
- ✅ Only draft orders can be published
- ✅ publishedAt timestamp set
- ✅ Notifications sent to contractors

---

### 4. Proposal System (Day 3-4)

#### 4.1 Create Proposal DTOs

**Задача 4.1.1:** CreateProposalDto
```typescript
// api/src/orders/dto/create-proposal.dto.ts
import { IsString, IsNumber, Min, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDays?: number;
}
```

**Задача 4.1.2:** UpdateProposalDto
```typescript
export class UpdateProposalDto extends PartialType(CreateProposalDto) {}
```

**Acceptance Criteria:**
- ✅ DTOs created with validation
- ✅ Price must be positive
- ✅ Message min 20 chars

---

#### 4.2 Proposal Endpoints

**Задача 4.2.1:** POST /api/v1/orders/:id/proposals (Submit Proposal)
```typescript
@Post(':orderId/proposals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRACTOR)
@ApiOperation({ summary: 'Submit proposal for order' })
@ApiResponse({ status: 201, type: ProposalEntity })
@Throttle(20, 3600) // 20 proposals per hour
async createProposal(
  @CurrentUser() user: JwtPayload,
  @Param('orderId') orderId: string,
  @Body() createDto: CreateProposalDto,
) {
  return this.proposalsService.create(orderId, user.userId, createDto);
}
```

**Задача 4.2.2:** ProposalsService.create()
```typescript
async create(orderId: string, contractorId: string, createDto: CreateProposalDto) {
  // Validate order exists and is published
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.status !== OrderStatus.PUBLISHED) {
    throw new BadRequestException('Order is not accepting proposals');
  }

  if (order.type !== 'public') {
    throw new BadRequestException('Cannot submit proposal to direct order');
  }

  // Check if contractor already submitted proposal
  const existing = await this.prisma.proposal.findUnique({
    where: {
      orderId_contractorId: {
        orderId,
        contractorId,
      },
    },
  });

  if (existing) {
    throw new ConflictException('Proposal already submitted');
  }

  // Create proposal
  const proposal = await this.prisma.proposal.create({
    data: {
      orderId,
      contractorId,
      price: createDto.price,
      message: createDto.message,
      estimatedDays: createDto.estimatedDays,
      status: 'pending',
    },
    include: {
      contractor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  // Notify client
  await this.notificationQueue.add('new-proposal', {
    orderId: order.id,
    clientId: order.clientId,
    contractorId,
  });

  return proposal;
}
```

**Acceptance Criteria:**
- ✅ Proposal creation works
- ✅ Only published public orders accept proposals
- ✅ One proposal per contractor per order
- ✅ Client notified on new proposal
- ✅ Rate limiting active (20 req/hour)

---

#### 4.3 Get Order Proposals

**Задача 4.3.1:** GET /api/v1/orders/:id/proposals
```typescript
@Get(':orderId/proposals')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get proposals for order (client only)' })
async getOrderProposals(
  @CurrentUser() user: JwtPayload,
  @Param('orderId') orderId: string,
) {
  // Only order owner (client) can view proposals
  const order = await this.ordersService.findOne(orderId, user.userId);

  if (order.clientId !== user.userId) {
    throw new ForbiddenException('Not authorized');
  }

  return this.proposalsService.findByOrder(orderId);
}
```

**Задача 4.3.2:** Implementation
```typescript
async findByOrder(orderId: string) {
  return this.prisma.proposal.findMany({
    where: { orderId },
    include: {
      contractor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              createdAt: true,
            },
          },
          categories: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

**Acceptance Criteria:**
- ✅ Client can view all proposals
- ✅ Contractor profile included
- ✅ Proposals sorted by date (newest first)
- ✅ Authorization enforced

---

#### 4.4 Accept/Reject Proposal

**Задача 4.4.1:** POST /api/v1/proposals/:id/accept
```typescript
@Post(':proposalId/accept')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Accept proposal (client only)' })
async acceptProposal(
  @CurrentUser() user: JwtPayload,
  @Param('proposalId') proposalId: string,
) {
  return this.proposalsService.accept(proposalId, user.userId);
}
```

**Задача 4.4.2:** Accept logic
```typescript
async accept(proposalId: string, clientId: string) {
  const proposal = await this.prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { order: true },
  });

  if (!proposal) {
    throw new NotFoundException('Proposal not found');
  }

  if (proposal.order.clientId !== clientId) {
    throw new ForbiddenException('Not authorized');
  }

  if (proposal.order.status !== OrderStatus.PUBLISHED) {
    throw new BadRequestException('Order is not accepting proposals');
  }

  // Accept proposal
  await this.prisma.$transaction(async (prisma) => {
    // Update proposal status
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'accepted' },
    });

    // Reject all other proposals
    await prisma.proposal.updateMany({
      where: {
        orderId: proposal.orderId,
        id: { not: proposalId },
      },
      data: { status: 'rejected' },
    });

    // Update order (assign contractor, start order)
    await prisma.order.update({
      where: { id: proposal.orderId },
      data: {
        contractorId: proposal.contractorId,
        status: OrderStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  });

  // Notify contractor (accepted)
  await this.notificationQueue.add('proposal-accepted', {
    proposalId: proposal.id,
    contractorId: proposal.contractorId,
  });

  return { message: 'Proposal accepted' };
}
```

**Задача 4.4.3:** POST /api/v1/proposals/:id/reject
```typescript
@Post(':proposalId/reject')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Reject proposal (client only)' })
async rejectProposal(
  @CurrentUser() user: JwtPayload,
  @Param('proposalId') proposalId: string,
) {
  return this.proposalsService.reject(proposalId, user.userId);
}
```

**Acceptance Criteria:**
- ✅ Proposal acceptance works
- ✅ Order assigned to contractor
- ✅ Order status updated to IN_PROGRESS
- ✅ All other proposals rejected
- ✅ Notifications sent
- ✅ Rejection works

---

### 5. Order Search & Filtering (Day 5-6)

#### 5.1 Search Orders DTO

**Задача 5.1.1:** SearchOrdersDto
```typescript
// api/src/orders/dto/search-orders.dto.ts
import { IsOptional, IsString, IsNumber, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchOrdersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string; // Search in title/description

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  radius?: number; // in km

  @ApiPropertyOptional({ enum: ['published', 'in_progress', 'completed'] })
  @IsOptional()
  @IsEnum(['published', 'in_progress', 'completed'])
  status?: string;

  @ApiPropertyOptional({ enum: ['date', 'budget', 'distance'] })
  @IsOptional()
  @IsEnum(['date', 'budget', 'distance'])
  sortBy?: 'date' | 'budget' | 'distance';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
```

**Acceptance Criteria:**
- ✅ DTO created with full validation
- ✅ Pagination support (page, limit)
- ✅ Sorting support (date, budget, distance)
- ✅ Location filtering (lat, lng, radius)

---

#### 5.2 Search Endpoint

**Задача 5.2.1:** GET /api/v1/orders/search
```typescript
@Get('search')
@ApiOperation({ summary: 'Search and filter orders' })
@ApiResponse({ status: 200, type: [OrderEntity] })
async searchOrders(@Query() searchDto: SearchOrdersDto) {
  return this.ordersService.search(searchDto);
}
```

**Задача 5.2.2:** Implement search logic
```typescript
async search(searchDto: SearchOrdersDto) {
  const {
    search,
    categoryId,
    minBudget,
    maxBudget,
    lat,
    lng,
    radius,
    status,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = searchDto;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status: status || OrderStatus.PUBLISHED, // Default to published orders
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minBudget || maxBudget) {
    where.budget = {};
    if (minBudget) where.budget.gte = minBudget;
    if (maxBudget) where.budget.lte = maxBudget;
  }

  // Geospatial search with PostGIS
  let orders;
  if (lat && lng && radius) {
    // Use PostGIS for radius search
    orders = await this.prisma.$queryRaw`
      SELECT o.*,
        ST_Distance(o.location::geography, ST_MakePoint(${lng}, ${lat})::geography) / 1000 AS distance
      FROM "Order" o
      WHERE o.status = ${status || OrderStatus.PUBLISHED}
        ${categoryId ? Prisma.sql`AND o."categoryId" = ${categoryId}` : Prisma.empty}
        ${minBudget ? Prisma.sql`AND o.budget >= ${minBudget}` : Prisma.empty}
        ${maxBudget ? Prisma.sql`AND o.budget <= ${maxBudget}` : Prisma.empty}
        AND ST_DWithin(
          o.location::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radius * 1000}
        )
      ORDER BY
        ${sortBy === 'distance' ? Prisma.sql`distance ASC` : Prisma.empty}
        ${sortBy === 'date' ? Prisma.sql`o."createdAt" ${Prisma.raw(sortOrder === 'asc' ? 'ASC' : 'DESC')}` : Prisma.empty}
        ${sortBy === 'budget' ? Prisma.sql`o.budget ${Prisma.raw(sortOrder === 'asc' ? 'ASC' : 'DESC')}` : Prisma.empty}
      LIMIT ${limit}
      OFFSET ${skip};
    `;
  } else {
    // Regular search without geospatial
    orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy:
        sortBy === 'date'
          ? { createdAt: sortOrder }
          : sortBy === 'budget'
          ? { budget: sortOrder }
          : undefined,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
    });
  }

  // Get total count
  const total = await this.prisma.order.count({ where });

  return {
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

**Acceptance Criteria:**
- ✅ Text search works (title, description)
- ✅ Category filtering works
- ✅ Budget range filtering works
- ✅ Geospatial radius search works (PostGIS)
- ✅ Sorting works (date, budget, distance)
- ✅ Pagination works
- ✅ Distance calculated in km

---

### 6. Order Management (Day 7)

#### 6.1 Get My Orders

**Задача 6.1.1:** GET /api/v1/orders/my-orders
```typescript
@Get('my-orders')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get current user orders (as client or contractor)' })
async getMyOrders(
  @CurrentUser() user: JwtPayload,
  @Query('role') role?: 'client' | 'contractor',
) {
  return this.ordersService.getMyOrders(user.userId, role);
}
```

**Задача 6.1.2:** Implementation
```typescript
async getMyOrders(userId: string, role?: 'client' | 'contractor') {
  const where: any = {};

  if (role === 'client') {
    where.clientId = userId;
  } else if (role === 'contractor') {
    where.contractorId = userId;
  } else {
    // Both roles
    where.OR = [{ clientId: userId }, { contractorId: userId }];
  }

  return this.prisma.order.findMany({
    where,
    include: {
      client: {
        select: { id: true, name: true, avatar: true },
      },
      contractor: {
        select: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
      category: true,
      _count: {
        select: { proposals: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

**Acceptance Criteria:**
- ✅ Returns orders for client role
- ✅ Returns orders for contractor role
- ✅ Returns both if role not specified
- ✅ Proposal count included

---

#### 6.2 Get Order by ID

**Задача 6.2.1:** GET /api/v1/orders/:id
```typescript
@Get(':id')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get order by ID' })
async getOrder(
  @CurrentUser() user: JwtPayload,
  @Param('id') orderId: string,
) {
  return this.ordersService.findOne(orderId, user.userId);
}
```

**Задача 6.2.2:** Implementation with authorization
```typescript
async findOne(orderId: string, userId?: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true, // Only if authorized
        },
      },
      contractor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          categories: {
            include: { category: true },
          },
        },
      },
      category: true,
      proposals: {
        where: userId ? { contractorId: userId } : undefined, // Only own proposals
        include: {
          contractor: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Hide precise location unless user is client or assigned contractor
  const isAuthorized = order.clientId === userId || order.contractorId === userId;

  if (!isAuthorized) {
    delete order.address; // Hide precise address
    // Show only city
  }

  return order;
}
```

**Acceptance Criteria:**
- ✅ Returns order with full details
- ✅ Hides precise location for unauthorized users
- ✅ Only shows own proposals to contractors
- ✅ Shows all proposals to client

---

#### 6.3 Update Order

**Задача 6.3.1:** PATCH /api/v1/orders/:id
```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard, OrderOwnerGuard)
@ApiOperation({ summary: 'Update order (draft orders only)' })
async updateOrder(
  @CurrentUser() user: JwtPayload,
  @Param('id') orderId: string,
  @Body() updateDto: UpdateOrderDto,
) {
  return this.ordersService.update(orderId, user.userId, updateDto);
}
```

**Задача 6.3.2:** Implementation
```typescript
async update(orderId: string, clientId: string, updateDto: UpdateOrderDto) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.clientId !== clientId) {
    throw new ForbiddenException('Not authorized');
  }

  // Only draft orders can be edited
  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestException('Only draft orders can be edited');
  }

  return this.prisma.order.update({
    where: { id: orderId },
    data: updateDto,
    include: {
      client: true,
      category: true,
    },
  });
}
```

**Acceptance Criteria:**
- ✅ Update works for draft orders
- ✅ Published/active orders cannot be edited
- ✅ Only order owner can update
- ✅ Audit log created

---

#### 6.4 Delete Order

**Задача 6.4.1:** DELETE /api/v1/orders/:id
```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, OrderOwnerGuard)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Delete order (draft orders only)' })
async deleteOrder(
  @CurrentUser() user: JwtPayload,
  @Param('id') orderId: string,
) {
  await this.ordersService.delete(orderId, user.userId);
}
```

**Задача 6.4.2:** Implementation
```typescript
async delete(orderId: string, clientId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.clientId !== clientId) {
    throw new ForbiddenException('Not authorized');
  }

  // Only draft orders can be deleted
  if (order.status !== OrderStatus.DRAFT) {
    throw new BadRequestException('Only draft orders can be deleted');
  }

  await this.prisma.order.delete({
    where: { id: orderId },
  });
}
```

**Acceptance Criteria:**
- ✅ Delete works for draft orders
- ✅ Published/active orders cannot be deleted
- ✅ Cascade deletes proposals
- ✅ Only order owner can delete

---

### 7. Guards & Authorization (Day 8)

#### 7.1 OrderOwnerGuard

**Задача 7.1.1:** Create guard
```typescript
// api/src/orders/guards/order-owner.guard.ts
@Injectable()
export class OrderOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.id;

    if (!orderId) {
      return false;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order.clientId === user.userId;
  }
}
```

**Acceptance Criteria:**
- ✅ Guard validates order ownership
- ✅ Throws 404 if order not found
- ✅ Returns false if not owner

---

### 8. Testing (Day 9)

#### 8.1 Unit Tests

**Задача 8.1.1:** OrdersService Tests
- [ ] `create()` - success case
- [ ] `create()` - invalid contractor
- [ ] `create()` - invalid category
- [ ] `publishOrder()` - success
- [ ] `publishOrder()` - only drafts can be published
- [ ] `updateStatus()` - valid transition
- [ ] `updateStatus()` - invalid transition
- [ ] `search()` - text search
- [ ] `search()` - geospatial search
- [ ] `search()` - filters (category, budget)
- [ ] `update()` - only draft orders
- [ ] `delete()` - only draft orders

**Задача 8.1.2:** ProposalsService Tests
- [ ] `create()` - success
- [ ] `create()` - duplicate proposal
- [ ] `create()` - only published orders
- [ ] `accept()` - success
- [ ] `accept()` - order assigned to contractor
- [ ] `accept()` - other proposals rejected
- [ ] `reject()` - success

#### 8.2 E2E Tests

**Задача 8.2.1:** Order Lifecycle
- [ ] POST /orders → 201 (draft)
- [ ] POST /orders/:id/publish → 200
- [ ] PATCH /orders/:id/status → 200
- [ ] PATCH /orders/:id/status (invalid transition) → 400

**Задача 8.2.2:** Proposals
- [ ] POST /orders/:id/proposals → 201
- [ ] POST /orders/:id/proposals (duplicate) → 409
- [ ] GET /orders/:id/proposals → 200
- [ ] POST /proposals/:id/accept → 200
- [ ] POST /proposals/:id/reject → 200

**Задача 8.2.3:** Search & Filtering
- [ ] GET /orders/search → 200
- [ ] GET /orders/search?categoryId=... → 200
- [ ] GET /orders/search?lat=...&lng=...&radius=... → 200

**Acceptance Criteria:**
- ✅ Unit test coverage > 80%
- ✅ All E2E tests pass
- ✅ Edge cases covered

---

### 9. Security Audit (Day 10)

#### 9.1 Security Checklist Review

**Задача 9.1.1:** Authorization
- [ ] Order owner validation enforced ✓
- [ ] Proposal owner validation enforced ✓
- [ ] Role-based access control (CONTRACTOR for proposals) ✓
- [ ] Precise location hidden for unauthorized users ✓

**Задача 9.1.2:** Input Validation
- [ ] All DTOs validated with class-validator ✓
- [ ] Budget must be positive ✓
- [ ] Status transitions validated ✓
- [ ] Geospatial coordinates validated ✓

**Задача 9.1.3:** Rate Limiting
- [ ] Order creation: 10 req/hour ✓
- [ ] Proposal submission: 20 req/hour ✓

**Задача 9.1.4:** Data Privacy
- [ ] Precise address hidden unless authorized ✓
- [ ] Only show city/district publicly ✓
- [ ] Client email hidden unless authorized ✓

**Acceptance Criteria:**
- ✅ All security requirements met
- ✅ No vulnerabilities found
- ✅ Code review completed

---

## 📊 Progress Tracking

### Daily Milestones

**Day 1:** Orders Module Setup + Order Creation
- [ ] Orders module structure created
- [ ] Order entities defined
- [ ] Create order endpoint working

**Day 2-3:** Order Lifecycle + Status Management
- [ ] Status transition rules defined
- [ ] Status update endpoint working
- [ ] Publish order endpoint working
- [ ] Notifications sent on status changes

**Day 3-4:** Proposal System
- [ ] Create proposal endpoint working
- [ ] Get proposals endpoint working
- [ ] Accept/reject proposal working
- [ ] Order assigned on proposal acceptance

**Day 5-6:** Search & Filtering
- [ ] Search endpoint working
- [ ] Text search working
- [ ] Category filtering working
- [ ] Geospatial radius search working (PostGIS)
- [ ] Sorting and pagination working

**Day 7:** Order Management
- [ ] Get my orders endpoint working
- [ ] Get order by ID working
- [ ] Update order working (draft only)
- [ ] Delete order working (draft only)

**Day 8:** Guards & Authorization
- [ ] OrderOwnerGuard created
- [ ] Authorization enforced

**Day 9:** Testing
- [ ] Unit tests written (80%+ coverage)
- [ ] E2E tests pass

**Day 10:** Security Audit
- [ ] Security checklist complete
- [ ] No vulnerabilities found

---

## 🔗 Dependencies

### Must be completed before Phase 3:
- ✅ Phase 0: Foundation & Infrastructure
- ✅ Phase 1: Authentication & Authorization
- ✅ Phase 2: User Management Module

### Required for Phase 3:
- Order, Proposal models (Prisma schema)
- PostGIS enabled in PostgreSQL
- Notification queue configured
- Users module (contractors)
- Categories module

---

## 📝 Definition of Done

Phase 3 считается завершенным когда:

- [ ] ✅ All endpoints работают корректно
- [ ] ✅ Order lifecycle management функционирует (7 statuses)
- [ ] ✅ Proposal system работает
- [ ] ✅ Public/direct orders supported
- [ ] ✅ Search & filtering работает (text, category, location)
- [ ] ✅ Geospatial search (PostGIS) функционирует
- [ ] ✅ Status transitions validated
- [ ] ✅ Authorization enforced (order owner, contractor)
- [ ] ✅ Notifications sent on status changes
- [ ] ✅ Rate limiting active
- [ ] ✅ Unit tests pass (80%+ coverage)
- [ ] ✅ E2E tests pass
- [ ] ✅ Security audit пройден
- [ ] ✅ Documentation обновлена
- [ ] ✅ Code review completed

---

## 🚀 Next Steps

После завершения Phase 3, переходим к **Phase 4: Chat Module (Real-time Communication)**

---

**Created:** January 2025
**Last Updated:** January 2025
**Status:** Ready for implementation
