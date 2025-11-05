import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 creations per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create category (admin only)',
    description: 'Create a new category for contractors to select.',
  })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 409, description: 'Category with this slug already exists' })
  async create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateCategoryDto) {
    return this.categoriesService.create(createDto, user.userId);
  }

  @Get('tree')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get category tree (public)',
    description: 'Get complete category tree structure with hierarchy.',
  })
  @ApiResponse({ status: 200, description: 'Category tree retrieved' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories',
  })
  async getTree(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveBool = includeInactive === 'true';
    return this.categoriesService.buildTree(includeInactiveBool);
  }

  @Get('popular')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get popular categories (public)',
    description: 'Get popular categories sorted by contractor count.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of categories to return (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Popular categories retrieved' })
  async getPopular(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.categoriesService.getPopularCategories(limitNum);
  }

  @Get('public')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get all active categories (public)',
    description: 'Get all active categories available for selection.',
  })
  @ApiResponse({ status: 200, description: 'Active categories retrieved' })
  async findAllActive() {
    return this.categoriesService.findAllActive();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get all categories with filtering (admin only)',
    description: 'Get all categories with filtering, pagination, and search support.',
  })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id/subcategories')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get subcategories (public)',
    description: 'Get direct subcategories of a parent category.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories',
  })
  @ApiResponse({ status: 200, description: 'Subcategories retrieved' })
  @ApiResponse({ status: 404, description: 'Parent category not found' })
  async getSubcategories(
    @Param('id') id: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const includeInactiveBool = includeInactive === 'true';
    return this.categoriesService.getSubcategories(id, includeInactiveBool);
  }

  @Get(':id/path')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get category path (breadcrumb) (public)',
    description: 'Get category path from root to category (breadcrumb).',
  })
  @ApiResponse({ status: 200, description: 'Category path retrieved' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryPath(@Param('id') id: string) {
    return this.categoriesService.getCategoryPath(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  @ApiOperation({
    summary: 'Get category by ID (admin only)',
    description: 'Get category details including usage statistics.',
  })
  @ApiResponse({ status: 200, description: 'Category retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 updates per hour
  @ApiOperation({
    summary: 'Update category (admin only)',
    description: 'Update category details.',
  })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category with this slug already exists' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 deletions per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete category (admin only)',
    description: 'Delete category if not in use. Deactivate instead if in use.',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category is in use and cannot be deleted' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.categoriesService.remove(id, user.userId);
  }
}

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('analytics')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
  @ApiOperation({
    summary: 'Get category analytics (admin only)',
    description: 'Get comprehensive category analytics including usage statistics.',
  })
  @ApiResponse({ status: 200, description: 'Category analytics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getAnalytics() {
    return this.categoriesService.getCategoryAnalytics();
  }
}

