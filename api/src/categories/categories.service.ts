import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
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

    // Create category
    const category = await this.prisma.category.create({
      data: {
        name: createDto.name,
        slug: createDto.slug,
        description: createDto.description,
        icon: createDto.icon,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });

    // Audit log
    await this.auditService.log({
      userId: adminUserId,
      action: AuditAction.CREATE,
      entity: AuditEntity.CATEGORY,
      entityId: category.id,
      metadata: {
        name: createDto.name,
        slug: createDto.slug,
      },
    });

    return category;
  }

  /**
   * Get all categories (admin view)
   */
  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            contractors: true,
            orders: true,
          },
        },
      },
    });
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

    // If slug is being updated, check for conflicts
    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: updateDto.slug },
      });

      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // Update category
    const updated = await this.prisma.category.update({
      where: { id },
      data: updateDto,
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

