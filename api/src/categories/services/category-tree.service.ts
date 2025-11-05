import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CategoryTreeResponseDto } from '../dto/category-tree-response.dto';

@Injectable()
export class CategoryTreeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build complete category tree structure
   */
  async buildTree(includeInactive = false): Promise<CategoryTreeResponseDto[]> {
    const where: any = { parentId: null }; // Start with root categories

    if (!includeInactive) {
      where.isActive = true;
    }

    const rootCategories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { nameEn: 'asc' },
      ],
      include: {
        _count: {
          select: {
            contractors: true,
            orders: true,
          },
        },
      },
    });

    return Promise.all(
      rootCategories.map((category) => this.buildCategoryNode(category, includeInactive)),
    );
  }

  /**
   * Build a single category node with children
   */
  private async buildCategoryNode(
    category: any,
    includeInactive: boolean,
  ): Promise<CategoryTreeResponseDto> {
    const where: any = { parentId: category.id };

    if (!includeInactive) {
      where.isActive = true;
    }

    const children = await this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { nameEn: 'asc' },
      ],
      include: {
        _count: {
          select: {
            contractors: true,
            orders: true,
          },
        },
      },
    });

    const childrenNodes = await Promise.all(
      children.map((child) => this.buildCategoryNode(child, includeInactive)),
    );

    return {
      id: category.id,
      name: category.name,
      nameEn: category.nameEn,
      nameFr: category.nameFr,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parentId: category.parentId,
      level: category.level,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      contractorCount: category._count.contractors,
      orderCount: category._count.orders,
      children: childrenNodes.length > 0 ? childrenNodes : undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Get direct subcategories of a parent category
   */
  async getSubcategories(parentId: string, includeInactive = false): Promise<any[]> {
    // Verify parent exists
    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent category not found');
    }

    const where: any = { parentId };

    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { nameEn: 'asc' },
      ],
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
   * Get category path from root to category (breadcrumb)
   */
  async getCategoryPath(categoryId: string): Promise<any[]> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, nameEn: true, nameFr: true, slug: true, parentId: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const path: any[] = [category];

    let currentId = category.parentId;
    while (currentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { id: true, nameEn: true, nameFr: true, slug: true, parentId: true },
      });

      if (!parent) {
        break;
      }

      path.unshift(parent);
      currentId = parent.parentId;
    }

    return path;
  }

  /**
   * Validate hierarchy to prevent circular references
   */
  async validateHierarchy(parentId: string, childId: string): Promise<boolean> {
    let currentId: string | null = parentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        return true; // Circular reference detected
      }

      if (currentId === childId) {
        return true; // Would create circular reference
      }

      visited.add(currentId);

      // TypeScript: currentId is guaranteed to be non-null here due to while condition
      const category: { parentId: string | null } | null = await this.prisma.category.findUnique({
        where: { id: currentId as string },
        select: { parentId: true },
      });

      if (!category) {
        break;
      }

      currentId = category.parentId || null;
    }

    return false; // No circular reference
  }

  /**
   * Calculate category level based on parent
   */
  async calculateLevel(parentId?: string | null): Promise<number> {
    if (!parentId) {
      return 0; // Root category
    }

    const parent = await this.prisma.category.findUnique({
      where: { id: parentId },
      select: { level: true },
    });

    if (!parent) {
      throw new NotFoundException('Parent category not found');
    }

    return parent.level + 1;
  }
}

