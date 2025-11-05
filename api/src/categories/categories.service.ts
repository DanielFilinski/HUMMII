import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CategoryTreeResponseDto } from './dto/category-tree-response.dto';
import { CategoryTreeService } from './services/category-tree.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly categoryTreeService: CategoryTreeService,
  ) {}

  /**
   * Create category (admin only)
   */
  async create(createDto: CreateCategoryDto, adminUserId: string) {
    // Check if slug already exists
    const existing = await this.prisma.category.findUnique({
      where: { slug: createDto.slug },
    });

    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    // Validate parent if provided
    let parentCategory = null;
    let level = 0;
    if (createDto.parentId) {
      parentCategory = await this.prisma.category.findUnique({
        where: { id: createDto.parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      // Calculate level based on parent
      level = parentCategory.level + 1;

      // Prevent too deep hierarchy (max 3 levels recommended)
      if (level > 2) {
        throw new BadRequestException('Maximum category depth is 3 levels');
      }
    }

    // Check nameEn/nameFr uniqueness within parent
    const nameConflict = await this.prisma.category.findFirst({
      where: {
        parentId: createDto.parentId || null,
        OR: [
          { nameEn: createDto.nameEn },
          { nameFr: createDto.nameFr },
        ],
      },
    });

    if (nameConflict) {
      throw new ConflictException(
        'Category with this name (EN or FR) already exists in the same parent category',
      );
    }

    // Create category
    const category = await this.prisma.category.create({
      data: {
        name: createDto.name || createDto.nameEn, // Legacy field
        nameEn: createDto.nameEn,
        nameFr: createDto.nameFr,
        slug: createDto.slug,
        description: createDto.description,
        icon: createDto.icon,
        parentId: createDto.parentId,
        level,
        sortOrder: createDto.sortOrder ?? 0,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
        createdBy: adminUserId,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminUserId,
      action: AuditAction.CREATE,
      entity: AuditEntity.CATEGORY,
      entityId: category.id,
      metadata: {
        name: createDto.nameEn,
        nameFr: createDto.nameFr,
        slug: createDto.slug,
        parentId: createDto.parentId,
        level,
      },
    });

    return category;
  }

  /**
   * Get all categories (admin view) with filtering and pagination
   */
  async findAll(query: CategoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.parentId !== undefined) {
      where.parentId = query.parentId;
    }

    if (query.level !== undefined) {
      where.level = query.level;
    }

    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { nameFr: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (!query.includeInactive) {
      where.isActive = true;
    }

    const orderBy: any = {};
    if (query.sortBy) {
      const sortField = query.sortBy === 'name' ? 'nameEn' : query.sortBy;
      orderBy[sortField] = query.sortOrder ?? 'asc';
    } else {
      orderBy.sortOrder = 'asc';
      orderBy.nameEn = 'asc';
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              contractors: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all active categories (public view)
   */
  async findAllActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get category by ID
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contractors: true,
            orders: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Update category (admin only)
   */
  async update(id: string, updateDto: UpdateCategoryDto, adminUserId: string) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Update legacy name field if nameEn is provided
    const updateData: any = { ...updateDto };

    // Validate parent if being updated
    if (updateDto.parentId !== undefined && updateDto.parentId !== category.parentId) {
      // Prevent setting self as parent
      if (updateDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Validate parent exists
      if (updateDto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateDto.parentId },
        });

        if (!parent) {
          throw new NotFoundException('Parent category not found');
        }

        // Prevent circular reference
        const isCircular = await this.validateHierarchy(updateDto.parentId, id);
        if (isCircular) {
          throw new BadRequestException('Cannot set parent: would create circular reference');
        }

        // Calculate new level
        const newLevel = parent.level + 1;
        if (newLevel > 2) {
          throw new BadRequestException('Maximum category depth is 3 levels');
        }
        // Add level to update data
        updateData.level = newLevel;
      } else {
        // Setting to root (no parent)
        updateData.level = 0;
      }
    }

    // Check nameEn/nameFr uniqueness within parent if being updated
    if (updateDto.nameEn || updateDto.nameFr) {
      const parentId = updateDto.parentId ?? category.parentId;
      const nameConflict = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          parentId: parentId || null,
          OR: [
            ...(updateDto.nameEn ? [{ nameEn: updateDto.nameEn }] : []),
            ...(updateDto.nameFr ? [{ nameFr: updateDto.nameFr }] : []),
          ],
        },
      });

      if (nameConflict) {
        throw new ConflictException(
          'Category with this name (EN or FR) already exists in the same parent category',
        );
      }
    }

    // If slug is being updated, check for conflicts
    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: updateDto.slug },
      });

      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // Update legacy name field if nameEn is provided
    if (updateDto.nameEn && !updateDto.name) {
      updateData.name = updateDto.nameEn; // Legacy field
    }

    // Update category
    const updated = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await this.auditService.log({
      userId: adminUserId,
      action: AuditAction.UPDATE,
      entity: AuditEntity.CATEGORY,
      entityId: id,
      changes: {
        before: category,
        after: updated,
      },
    });

    return updated;
  }

  /**
   * Validate hierarchy to prevent circular references
   */
  private async validateHierarchy(parentId: string, childId: string): Promise<boolean> {
    return this.categoryTreeService.validateHierarchy(parentId, childId);
  }

  /**
   * Build category tree structure
   */
  async buildTree(includeInactive = false): Promise<CategoryTreeResponseDto[]> {
    return this.categoryTreeService.buildTree(includeInactive);
  }

  /**
   * Get subcategories of a parent category
   */
  async getSubcategories(parentId: string, includeInactive = false): Promise<any[]> {
    return this.categoryTreeService.getSubcategories(parentId, includeInactive);
  }

  /**
   * Get category path (breadcrumb) from root to category
   */
  async getCategoryPath(categoryId: string): Promise<any[]> {
    return this.categoryTreeService.getCategoryPath(categoryId);
  }

  /**
   * Get popular categories (by contractor count)
   */
  async getPopularCategories(limit = 10): Promise<any[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            contractors: true,
            orders: true,
          },
        },
      },
    });

    // Sort by contractor count descending
    categories.sort((a, b) => b._count.contractors - a._count.contractors);

    return categories.slice(0, limit);
  }

  /**
   * Get category analytics
   */
  async getCategoryAnalytics() {
    const [
      totalCategories,
      activeCategories,
      categoriesByLevel,
      recentAssignments,
    ] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.category.groupBy({
        by: ['level'],
        _count: true,
      }),
      this.prisma.contractorCategory.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          category: {
            select: {
              id: true,
              nameEn: true,
              nameFr: true,
              slug: true,
            },
          },
          contractor: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Get popular categories using the existing method
    const popularCategories = await this.getPopularCategories(10);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      categoryDistribution: categoriesByLevel.map((item) => ({
        level: item.level,
        count: item._count,
      })),
      popularCategories: popularCategories.map((category) => ({
        id: category.id,
        nameEn: category.nameEn,
        nameFr: category.nameFr,
        slug: category.slug,
        contractorCount: category._count.contractors,
        orderCount: category._count.orders,
      })),
      recentAssignments: recentAssignments.map((assignment) => ({
        categoryId: assignment.category.id,
        categoryNameEn: assignment.category.nameEn,
        categoryNameFr: assignment.category.nameFr,
        contractorId: assignment.contractor.id,
        contractorName: assignment.contractor.user.name,
        createdAt: assignment.createdAt,
      })),
    };
  }

  /**
   * Delete category (admin only)
   */
  async remove(id: string, adminUserId: string) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contractors: true,
            orders: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category is in use
    if (category._count.contractors > 0 || category._count.orders > 0) {
      throw new ConflictException(
        'Cannot delete category that is currently in use. Deactivate it instead.',
      );
    }

    // Delete category
    await this.prisma.category.delete({
      where: { id },
    });

    // Audit log
    await this.auditService.log({
      userId: adminUserId,
      action: AuditAction.DELETE,
      entity: AuditEntity.CATEGORY,
      entityId: id,
      metadata: {
        name: category.name,
        slug: category.slug,
      },
    });

    return { message: 'Category deleted successfully' };
  }
}

