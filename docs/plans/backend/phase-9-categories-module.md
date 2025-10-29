# Phase 9: Categories Module - Detailed Implementation Plan

**Status:** 🟢 MEDIUM Priority  
**Duration:** Week 20 (1 week)  
**Dependencies:** Phase 0 (Foundation), Phase 1 (Auth)  
**Last Updated:** 29 октября 2025

---

## 📋 Overview

Модуль категорий предоставляет систему классификации услуг для подрядчиков и заказов. Включает иерархическую структуру категорий с подкатегориями, поиск, фильтрацию и аналитику.

### Success Criteria
- ✅ Иерархическая система категорий работает корректно
- ✅ Подрядчики могут выбирать до 5 категорий
- ✅ Поиск и фильтрация по категориям функционируют
- ✅ Admin панель для управления категориями
- ✅ Аналитика по популярности категорий
- ✅ 80%+ покрытие тестами

---

## 🏗️ Architecture Overview

### Database Schema
```prisma
model Category {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  icon          String?   // URL to icon image or icon name
  parentId      String?
  parent        Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children      Category[] @relation("CategoryHierarchy")
  
  // Metadata
  isActive      Boolean   @default(true)
  sortOrder     Int       @default(0)
  level         Int       @default(0) // 0 = root, 1 = subcategory
  
  // Relations
  contractors   ContractorCategory[]
  orders        Order[]
  
  // Audit
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String?   // Admin user ID
  
  @@map("categories")
}

model ContractorCategory {
  id           String      @id @default(cuid())
  contractorId String
  categoryId   String
  contractor   Contractor  @relation(fields: [contractorId], references: [id], onDelete: Cascade)
  category     Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  // Metadata
  isPrimary    Boolean     @default(false) // Main category
  createdAt    DateTime    @default(now())
  
  @@unique([contractorId, categoryId])
  @@map("contractor_categories")
}
```

### Module Structure
```
src/categories/
├── categories.module.ts
├── categories.controller.ts
├── categories.service.ts
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── category-query.dto.ts
│   └── category-assignment.dto.ts
├── entities/
│   ├── category.entity.ts
│   └── contractor-category.entity.ts
└── __tests__/
    ├── categories.service.spec.ts
    ├── categories.controller.spec.ts
    └── categories.e2e.spec.ts
```

---

## 🎯 Task Breakdown

### Task 9.1: Database Schema & Entities (2 hours)
**Priority:** 🔴 CRITICAL  
**Dependencies:** Phase 0 (Prisma setup)

#### Subtasks:
1. **9.1.1: Prisma Schema Design**
   - [ ] Create Category model with hierarchical structure
   - [ ] Add ContractorCategory junction table
   - [ ] Add Order category relation
   - [ ] Define indexes for performance
   - [ ] Add unique constraints

2. **9.1.2: Database Migration**
   - [ ] Generate migration for categories table
   - [ ] Generate migration for contractor_categories table
   - [ ] Update Order schema to include categoryId
   - [ ] Test migration rollback
   - [ ] Verify foreign key constraints

3. **9.1.3: Prisma Client Update**
   - [ ] Update Prisma client generation
   - [ ] Test database connection
   - [ ] Verify relations work correctly

**Security Requirements:**
- [ ] Input validation on all fields
- [ ] Slug generation with sanitization
- [ ] Admin-only access for category management
- [ ] Audit logging for category changes

**Testing:**
- [ ] Migration tests
- [ ] Relation tests
- [ ] Constraint validation tests

**Deliverables:**
- Database schema with Category and ContractorCategory models
- Migration files
- Updated Prisma client

---

### Task 9.2: DTOs & Validation (1.5 hours)
**Priority:** 🔴 CRITICAL  
**Dependencies:** Task 9.1

#### Subtasks:
1. **9.2.1: Create Category DTOs**
   ```typescript
   // create-category.dto.ts
   export class CreateCategoryDto {
     @IsString()
     @Length(2, 50)
     name: string;
   
     @IsOptional()
     @IsString()
     @Length(0, 200)
     description?: string;
   
     @IsOptional()
     @IsString()
     parentId?: string;
   
     @IsOptional()
     @IsString()
     icon?: string;
   
     @IsOptional()
     @IsInt()
     @Min(0)
     sortOrder?: number;
   }
   ```

2. **9.2.2: Update Category DTOs**
   - [ ] Validation for name uniqueness within parent
   - [ ] Slug validation and generation
   - [ ] Icon URL validation
   - [ ] Parent-child relationship validation

3. **9.2.3: Query DTOs**
   - [ ] CategoryQueryDto for filtering and search
   - [ ] Pagination parameters
   - [ ] Sorting options
   - [ ] Include/exclude parameters

4. **9.2.4: Assignment DTOs**
   - [ ] ContractorCategoryAssignmentDto
   - [ ] Validation for maximum 5 categories per contractor
   - [ ] Primary category validation

**Security Requirements:**
- [ ] class-validator decorators on all fields
- [ ] HTML sanitization in description
- [ ] URL validation for icons
- [ ] Admin role validation

**Testing:**
- [ ] DTO validation tests
- [ ] Sanitization tests
- [ ] Edge case validation tests

**Deliverables:**
- Complete DTO classes with validation
- Custom validators for business rules
- Test coverage for all DTOs

---

### Task 9.3: Categories Service Layer (3 hours)
**Priority:** 🔴 CRITICAL  
**Dependencies:** Task 9.2

#### Subtasks:
1. **9.3.1: Core Category Operations**
   ```typescript
   @Injectable()
   export class CategoriesService {
     async create(createCategoryDto: CreateCategoryDto, adminId: string): Promise<Category>
     async findAll(query: CategoryQueryDto): Promise<PaginatedResult<Category>>
     async findOne(id: string): Promise<Category>
     async update(id: string, updateDto: UpdateCategoryDto, adminId: string): Promise<Category>
     async remove(id: string, adminId: string): Promise<void>
   }
   ```

2. **9.3.2: Hierarchy Management**
   - [ ] Build category tree structure
   - [ ] Validate parent-child relationships
   - [ ] Prevent circular references
   - [ ] Calculate category levels
   - [ ] Sort by hierarchy and order

3. **9.3.3: Search & Filtering**
   - [ ] Search by name (case-insensitive)
   - [ ] Filter by parent category
   - [ ] Filter by active status
   - [ ] Filter by level (root/subcategory)
   - [ ] Pagination support

4. **9.3.4: Contractor Assignment**
   ```typescript
   async assignToContractor(contractorId: string, categoryIds: string[]): Promise<void>
   async removeFromContractor(contractorId: string, categoryId: string): Promise<void>
   async getContractorCategories(contractorId: string): Promise<Category[]>
   async setCategoryAsPrimary(contractorId: string, categoryId: string): Promise<void>
   ```

5. **9.3.5: Analytics Methods**
   - [ ] Get popular categories (by contractor count)
   - [ ] Get category usage statistics
   - [ ] Calculate category distribution
   - [ ] Track category trends

**Security Requirements:**
- [ ] Admin role check for CRUD operations
- [ ] Contractor ownership validation for assignments
- [ ] Input sanitization
- [ ] Rate limiting on search operations

**Testing:**
- [ ] Unit tests for all service methods
- [ ] Hierarchy validation tests
- [ ] Search functionality tests
- [ ] Assignment validation tests

**Deliverables:**
- Complete CategoriesService with all methods
- Hierarchy management logic
- Search and filtering capabilities
- Analytics methods

---

### Task 9.4: Categories Controller (2 hours)
**Priority:** 🔴 CRITICAL  
**Dependencies:** Task 9.3

#### Subtasks:
1. **9.4.1: Public Endpoints**
   ```typescript
   @Controller('categories')
   export class CategoriesController {
     @Get()
     async findAll(@Query() query: CategoryQueryDto): Promise<PaginatedResult<Category>>
   
     @Get('tree')
     async getCategoryTree(): Promise<CategoryTree[]>
   
     @Get('popular')
     async getPopularCategories(): Promise<Category[]>
   
     @Get(':id')
     async findOne(@Param('id') id: string): Promise<Category>
   }
   ```

2. **9.4.2: Admin Endpoints**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.ADMIN)
   export class AdminCategoriesController {
     @Post()
     async create(@Body() createDto: CreateCategoryDto, @User() admin): Promise<Category>
   
     @Put(':id')
     async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto): Promise<Category>
   
     @Delete(':id')
     async remove(@Param('id') id: string): Promise<void>
   
     @Get('analytics/usage')
     async getCategoryAnalytics(): Promise<CategoryAnalytics>
   }
   ```

3. **9.4.3: Contractor Assignment Endpoints**
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Controller('contractors/categories')
   export class ContractorCategoriesController {
     @Post()
     async assignCategories(@Body() dto: CategoryAssignmentDto, @User() user): Promise<void>
   
     @Get()
     async getMyCategories(@User() user): Promise<Category[]>
   
     @Delete(':categoryId')
     async removeCategory(@Param('categoryId') categoryId: string, @User() user): Promise<void>
   
     @Put(':categoryId/primary')
     async setPrimary(@Param('categoryId') categoryId: string, @User() user): Promise<void>
   }
   ```

4. **9.4.4: Response Serialization**
   - [ ] Category response DTOs
   - [ ] Tree structure serialization
   - [ ] Analytics response formatting
   - [ ] Error response standardization

**Security Requirements:**
- [ ] JWT authentication for protected routes
- [ ] Admin role validation
- [ ] Contractor ownership validation
- [ ] Rate limiting on all endpoints
- [ ] Input validation middleware

**Testing:**
- [ ] Controller unit tests
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Response format tests

**Deliverables:**
- Public categories controller
- Admin categories controller
- Contractor assignment controller
- Proper error handling and responses

---

### Task 9.5: Category Features Implementation (2.5 hours)
**Priority:** 🟡 HIGH  
**Dependencies:** Task 9.4

#### Subtasks:
1. **9.5.1: Category Tree Builder**
   ```typescript
   export class CategoryTreeService {
     async buildTree(): Promise<CategoryTree[]>
     async getSubcategories(parentId: string): Promise<Category[]>
     async getCategoryPath(categoryId: string): Promise<Category[]>
     async validateHierarchy(parentId: string, childId: string): Promise<boolean>
   }
   ```

2. **9.5.2: Slug Generation**
   - [ ] Auto-generate slugs from category names
   - [ ] Ensure slug uniqueness
   - [ ] Handle special characters
   - [ ] Update slugs on name change
   - [ ] Slug history tracking

3. **9.5.3: Icon Management**
   - [ ] Icon URL validation
   - [ ] Default icons for categories
   - [ ] Icon optimization
   - [ ] CDN integration for icons

4. **9.5.4: Popular Categories**
   - [ ] Calculate popularity by contractor count
   - [ ] Calculate popularity by order count
   - [ ] Cache popular categories (Redis)
   - [ ] Update popularity periodically

5. **9.5.5: Category Statistics**
   - [ ] Track category views
   - [ ] Track category assignments
   - [ ] Track category-based orders
   - [ ] Generate usage reports

**Security Requirements:**
- [ ] Validate icon URLs (no XSS)
- [ ] Sanitize category names and descriptions
- [ ] Rate limit analytics endpoints
- [ ] Cache security headers

**Testing:**
- [ ] Tree building tests
- [ ] Slug generation tests
- [ ] Popularity calculation tests
- [ ] Statistics accuracy tests

**Deliverables:**
- Category tree service
- Slug generation system
- Icon management
- Analytics and statistics

---

### Task 9.6: Integration & Relationships (2 hours)
**Priority:** 🟡 HIGH  
**Dependencies:** Task 9.5, Phase 2 (Users), Phase 3 (Orders)

#### Subtasks:
1. **9.6.1: Contractor Profile Integration**
   - [ ] Update ContractorService to handle categories
   - [ ] Add category display in contractor profiles
   - [ ] Validate category assignments on profile update
   - [ ] Primary category highlighting

2. **9.6.2: Order Integration**
   - [ ] Add category selection to order creation
   - [ ] Category-based order filtering
   - [ ] Validate order category exists
   - [ ] Category in order notifications

3. **9.6.3: Search Integration**
   - [ ] Category-based contractor search
   - [ ] Category-based order search
   - [ ] Multi-category filtering
   - [ ] Category autocomplete

4. **9.6.4: Notification Integration**
   - [ ] Notify contractors of new orders in their categories
   - [ ] Category-based push notifications
   - [ ] Email notifications for category updates
   - [ ] Subscription preferences by category

**Security Requirements:**
- [ ] Validate contractor ownership for category notifications
- [ ] Prevent category-based data leakage
- [ ] Secure notification delivery
- [ ] Rate limit category-based notifications

**Testing:**
- [ ] Integration tests with contractor profiles
- [ ] Order category validation tests
- [ ] Search integration tests
- [ ] Notification delivery tests

**Deliverables:**
- Contractor-category integration
- Order-category relationship
- Category-based search and filtering
- Notification system integration

---

### Task 9.7: Admin Panel Features (1.5 hours)
**Priority:** 🟢 MEDIUM  
**Dependencies:** Task 9.4

#### Subtasks:
1. **9.7.1: Category Management Interface**
   - [ ] List all categories with hierarchy
   - [ ] Create new category form
   - [ ] Edit category details
   - [ ] Reorder categories (drag & drop support)
   - [ ] Bulk operations (activate/deactivate)

2. **9.7.2: Category Analytics Dashboard**
   ```typescript
   export interface CategoryAnalytics {
     totalCategories: number;
     activeCategories: number;
     categoryDistribution: CategoryDistribution[];
     popularCategories: PopularCategory[];
     recentAssignments: RecentAssignment[];
     usageStats: CategoryUsageStats;
   }
   ```

3. **9.7.3: Category Moderation**
   - [ ] Review category assignments
   - [ ] Approve/reject new category requests
   - [ ] Monitor category usage patterns
   - [ ] Flag inappropriate category usage

4. **9.7.4: Bulk Operations**
   - [ ] Import categories from CSV
   - [ ] Export category data
   - [ ] Bulk category updates
   - [ ] Mass category assignments

**Security Requirements:**
- [ ] Admin authentication required
- [ ] Audit log all admin actions
- [ ] Validate bulk operations
- [ ] Prevent CSV injection

**Testing:**
- [ ] Admin interface tests
- [ ] Analytics calculation tests
- [ ] Bulk operation tests
- [ ] Security validation tests

**Deliverables:**
- Admin category management interface
- Analytics dashboard
- Moderation tools
- Bulk operation capabilities

---

### Task 9.8: Caching & Performance (1 hour)
**Priority:** 🟡 HIGH  
**Dependencies:** Task 9.5

#### Subtasks:
1. **9.8.1: Redis Caching Strategy**
   ```typescript
   // Cache keys
   CACHE_KEYS = {
     CATEGORY_TREE: 'categories:tree',
     POPULAR_CATEGORIES: 'categories:popular',
     CONTRACTOR_CATEGORIES: 'categories:contractor:${contractorId}',
     CATEGORY_STATS: 'categories:stats:${categoryId}'
   }
   ```

2. **9.8.2: Cache Implementation**
   - [ ] Cache category tree (TTL: 1 hour)
   - [ ] Cache popular categories (TTL: 6 hours)
   - [ ] Cache contractor categories (TTL: 30 minutes)
   - [ ] Cache category statistics (TTL: 1 hour)

3. **9.8.3: Cache Invalidation**
   - [ ] Invalidate on category create/update/delete
   - [ ] Invalidate on contractor assignment changes
   - [ ] Batch cache updates
   - [ ] Cache warming strategies

4. **9.8.4: Database Optimization**
   - [ ] Add database indexes
   - [ ] Optimize query performance
   - [ ] Use database views for complex queries
   - [ ] Monitor query performance

**Security Requirements:**
- [ ] Secure cache keys
- [ ] No sensitive data in cache
- [ ] Cache access control
- [ ] Cache encryption (if needed)

**Testing:**
- [ ] Cache hit/miss tests
- [ ] Cache invalidation tests
- [ ] Performance benchmarks
- [ ] Memory usage tests

**Deliverables:**
- Redis caching implementation
- Cache invalidation strategies
- Database optimization
- Performance monitoring

---

### Task 9.9: Testing & Documentation (2 hours)
**Priority:** 🔴 CRITICAL  
**Dependencies:** All previous tasks

#### Subtasks:
1. **9.9.1: Unit Tests**
   - [ ] CategoriesService unit tests (80%+ coverage)
   - [ ] Controller unit tests
   - [ ] DTO validation tests
   - [ ] Utility function tests

2. **9.9.2: Integration Tests**
   - [ ] Database integration tests
   - [ ] Cache integration tests
   - [ ] API endpoint tests
   - [ ] Cross-module integration tests

3. **9.9.3: E2E Tests**
   ```typescript
   describe('Categories E2E', () => {
     test('should create category hierarchy')
     test('should assign categories to contractor')
     test('should search categories')
     test('should calculate analytics')
   })
   ```

4. **9.9.4: Performance Tests**
   - [ ] Load testing for category search
   - [ ] Performance testing for tree building
   - [ ] Cache performance tests
   - [ ] Memory leak tests

5. **9.9.5: API Documentation**
   - [ ] Swagger/OpenAPI documentation
   - [ ] Request/response examples
   - [ ] Error codes documentation
   - [ ] Rate limiting documentation

6. **9.9.6: Developer Documentation**
   - [ ] Service architecture documentation
   - [ ] Database schema documentation
   - [ ] Caching strategy documentation
   - [ ] Integration guide

**Testing Requirements:**
- [ ] 80%+ code coverage
- [ ] All critical paths tested
- [ ] Security tests included
- [ ] Performance benchmarks documented

**Deliverables:**
- Comprehensive test suite
- API documentation
- Developer documentation
- Performance benchmarks

---

## 🔒 Security Requirements

### Authentication & Authorization
- [ ] Admin-only access for category CRUD operations
- [ ] JWT authentication for contractor category assignments
- [ ] Rate limiting on all endpoints:
  - Category search: 60 req/min
  - Category CRUD: 10 req/min (admin)
  - Category assignment: 20 req/min (contractor)

### Input Validation
- [ ] class-validator on all DTOs
- [ ] HTML sanitization in descriptions
- [ ] URL validation for icons
- [ ] Slug generation with safe characters only
- [ ] Maximum 5 categories per contractor validation

### Data Protection
- [ ] No sensitive data in category names/descriptions
- [ ] Audit logging for all category changes
- [ ] Secure cache keys (no PII)
- [ ] Safe error messages (no data leakage)

### Performance Security
- [ ] Prevent DoS with pagination limits
- [ ] Cache TTL limits
- [ ] Query timeout limits
- [ ] Memory usage monitoring

---

## 📊 Analytics & Monitoring

### Key Metrics
- [ ] Total categories count
- [ ] Active categories percentage
- [ ] Popular categories (top 10)
- [ ] Category assignment distribution
- [ ] Search query patterns
- [ ] API response times

### Monitoring Points
- [ ] Category CRUD operations
- [ ] Search performance
- [ ] Cache hit rates
- [ ] Database query performance
- [ ] Memory usage for tree operations

---

## 🧪 Testing Strategy

### Test Coverage Goals
- [ ] Unit tests: 85%+ coverage
- [ ] Integration tests: All API endpoints
- [ ] E2E tests: Critical user flows
- [ ] Performance tests: Search and tree building

### Critical Test Scenarios
1. **Category Hierarchy**
   - Create nested categories (3 levels deep)
   - Prevent circular references
   - Tree building performance with 1000+ categories

2. **Contractor Assignments**
   - Assign maximum 5 categories
   - Set primary category
   - Remove categories and validate integrity

3. **Search & Filtering**
   - Search performance with special characters
   - Multi-level category filtering
   - Pagination accuracy

4. **Cache Operations**
   - Cache invalidation accuracy
   - Cache performance under load
   - Memory usage optimization

---

## 📋 Acceptance Criteria

### Functional Requirements
- [ ] ✅ Admins can create/edit/delete categories with hierarchy
- [ ] ✅ Contractors can select up to 5 categories for their profile
- [ ] ✅ Category tree displays correctly (3 levels max)
- [ ] ✅ Search by category name works (case-insensitive)
- [ ] ✅ Popular categories are calculated and cached
- [ ] ✅ Category analytics are accurate and real-time

### Performance Requirements
- [ ] ✅ Category tree loads in <500ms
- [ ] ✅ Category search responds in <200ms
- [ ] ✅ Cache hit rate >90% for popular operations
- [ ] ✅ Support 10,000+ categories without performance degradation

### Security Requirements
- [ ] ✅ All endpoints have proper authentication/authorization
- [ ] ✅ Input validation prevents XSS and injection attacks
- [ ] ✅ Rate limiting prevents abuse
- [ ] ✅ Admin actions are logged for audit

### Quality Requirements
- [ ] ✅ 80%+ test coverage
- [ ] ✅ All critical paths have E2E tests
- [ ] ✅ Documentation is complete and accurate
- [ ] ✅ Code follows project coding standards

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Database migration tested
- [ ] Cache configuration verified
- [ ] Environment variables set
- [ ] Admin access configured

### Post-Deployment Verification
- [ ] Category tree loads correctly
- [ ] Search functionality works
- [ ] Cache is populated
- [ ] Analytics are calculating
- [ ] Admin panel accessible

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Cache monitoring enabled
- [ ] Database query monitoring

---

## 📚 Resources & Dependencies

### External Dependencies
- None (internal module only)

### Internal Dependencies
- Phase 0: Foundation & Infrastructure
- Phase 1: Authentication & Authorization
- Phase 2: User Management (for contractor integration)

### Documentation References
- [Category Entity Design](../entities/category-entity.md)
- [Admin Panel API](../api/admin-categories-api.md)
- [Caching Strategy](../infrastructure/redis-caching.md)

---

**Next Phase:** [Phase 10 - Admin Panel API](./phase-10-admin-panel.md)  
**Previous Phase:** [Phase 8 - Notifications Module](./phase-8-notifications.md)

---

**Created:** 29 октября 2025  
**Author:** GitHub Copilot  
**Status:** Ready for Development  
**Estimated Effort:** 15 hours (1 week)