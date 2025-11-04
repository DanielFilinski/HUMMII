import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { CreateContractorProfileDto } from './dto/create-contractor-profile.dto';
import { UpdateContractorProfileDto } from './dto/update-contractor-profile.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ContractorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create contractor profile
   * User must have CONTRACTOR role
   */
  async createProfile(userId: string, dto: CreateContractorProfileDto) {
    // Check if user exists and has CONTRACTOR role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { contractor: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes(UserRole.CONTRACTOR)) {
      throw new BadRequestException('User must have CONTRACTOR role to create contractor profile');
    }

    // Check if contractor profile already exists
    if (user.contractor) {
      throw new ConflictException('Contractor profile already exists');
    }

    // Create contractor profile
    const contractor = await this.prisma.contractor.create({
      data: {
        userId,
        bio: dto.bio,
        experience: dto.experience,
        hourlyRate: dto.hourlyRate ? Number(dto.hourlyRate) : null,
        businessName: dto.businessName,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_CREATED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractor.id,
      metadata: {
        bio: dto.bio,
        experience: dto.experience,
        hourlyRate: dto.hourlyRate,
        businessName: dto.businessName,
      },
    });

    return contractor;
  }

  /**
   * Update contractor profile
   */
  async updateProfile(userId: string, dto: UpdateContractorProfileDto) {
    // Get contractor profile
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Get before state for audit
    const beforeState = {
      bio: contractor.bio,
      experience: contractor.experience,
      hourlyRate: contractor.hourlyRate,
      businessName: contractor.businessName,
    };

    // Update contractor profile
    const updated = await this.prisma.contractor.update({
      where: { userId },
      data: {
        bio: dto.bio !== undefined ? dto.bio : contractor.bio,
        experience: dto.experience !== undefined ? dto.experience : contractor.experience,
        hourlyRate: dto.hourlyRate !== undefined ? Number(dto.hourlyRate) : contractor.hourlyRate,
        businessName: dto.businessName !== undefined ? dto.businessName : contractor.businessName,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractor.id,
      changes: {
        before: beforeState,
        after: {
          bio: updated.bio,
          experience: updated.experience,
          hourlyRate: updated.hourlyRate,
          businessName: updated.businessName,
        },
      },
    });

    return updated;
  }

  /**
   * Update contractor location
   */
  async updateLocation(userId: string, dto: UpdateLocationDto) {
    // Get contractor profile
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Update location
    const updated = await this.prisma.contractor.update({
      where: { userId },
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode,
        serviceRadius: dto.serviceRadius !== undefined ? dto.serviceRadius : contractor.serviceRadius,
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.LOCATION_UPDATED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractor.id,
      metadata: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        city: dto.city,
        province: dto.province,
        serviceRadius: dto.serviceRadius,
      },
    });

    return updated;
  }

  /**
   * Get contractor profile
   */
  async getProfile(userId: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        portfolio: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    return contractor;
  }

  /**
   * Get contractor profile by ID (public view)
   */
  async getProfileById(contractorId: string) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        portfolio: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }

    return contractor;
  }

  /**
   * Find contractors nearby using Haversine formula
   * Simple implementation without PostGIS for MVP
   */
  async findNearby(lat: number, lon: number, radiusKm: number = 50) {
    // Get all contractors with location set
    const contractors = await this.prisma.contractor.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Calculate distance for each contractor and filter by radius
    const contractorsWithDistance = contractors
      .map((contractor) => ({
        ...contractor,
        distance: this.calculateDistance(
          lat,
          lon,
          contractor.latitude!,
          contractor.longitude!,
        ),
      }))
      .filter((contractor) => contractor.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return contractorsWithDistance;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Add portfolio item
   * Max 10 portfolio items per contractor
   */
  async addPortfolioItem(contractorId: string, userId: string, dto: CreatePortfolioItemDto) {
    // Get contractor
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        portfolio: true,
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Check ownership
    if (contractor.userId !== userId) {
      throw new BadRequestException('You can only add portfolio items to your own profile');
    }

    // Check max 10 items limit
    if (contractor.portfolio.length >= 10) {
      throw new BadRequestException('Maximum 10 portfolio items allowed');
    }

    // Create portfolio item
    const portfolioItem = await this.prisma.portfolioItem.create({
      data: {
        contractorId,
        title: dto.title,
        description: dto.description,
        images: dto.images,
        order: contractor.portfolio.length, // Add to end
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PORTFOLIO_ITEM_ADDED,
      entity: AuditEntity.PORTFOLIO,
      entityId: portfolioItem.id,
      metadata: {
        contractorId,
        title: dto.title,
        imagesCount: dto.images.length,
      },
    });

    return portfolioItem;
  }

  /**
   * Update portfolio item
   */
  async updatePortfolioItem(
    contractorId: string,
    userId: string,
    itemId: string,
    dto: UpdatePortfolioItemDto,
  ) {
    // Get portfolio item
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
      include: {
        contractor: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    // Check ownership
    if (item.contractorId !== contractorId || item.contractor.userId !== userId) {
      throw new BadRequestException('You can only update your own portfolio items');
    }

    // Update
    const updated = await this.prisma.portfolioItem.update({
      where: { id: itemId },
      data: {
        title: dto.title !== undefined ? dto.title : item.title,
        description: dto.description !== undefined ? dto.description : item.description,
        images: dto.images !== undefined ? dto.images : item.images,
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PORTFOLIO_ITEM_UPDATED,
      entity: AuditEntity.PORTFOLIO,
      entityId: itemId,
      changes: {
        before: {
          title: item.title,
          description: item.description,
          images: item.images,
        },
        after: {
          title: updated.title,
          description: updated.description,
          images: updated.images,
        },
      },
    });

    return updated;
  }

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(contractorId: string, userId: string, itemId: string) {
    // Get portfolio item
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
      include: {
        contractor: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Portfolio item not found');
    }

    // Check ownership
    if (item.contractorId !== contractorId || item.contractor.userId !== userId) {
      throw new BadRequestException('You can only delete your own portfolio items');
    }

    // Delete
    await this.prisma.portfolioItem.delete({
      where: { id: itemId },
    });

    // Reorder remaining items
    const remainingItems = await this.prisma.portfolioItem.findMany({
      where: { contractorId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < remainingItems.length; i++) {
      await this.prisma.portfolioItem.update({
        where: { id: remainingItems[i].id },
        data: { order: i },
      });
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PORTFOLIO_ITEM_DELETED,
      entity: AuditEntity.PORTFOLIO,
      entityId: itemId,
      metadata: {
        contractorId,
        title: item.title,
      },
    });

    return { message: 'Portfolio item deleted successfully' };
  }

  /**
   * Get portfolio items for contractor
   */
  async getPortfolio(contractorId: string) {
    const items = await this.prisma.portfolioItem.findMany({
      where: { contractorId },
      orderBy: { order: 'asc' },
    });

    return items;
  }

  /**
   * Reorder portfolio items
   */
  async reorderPortfolio(contractorId: string, userId: string, itemIds: string[]) {
    // Get contractor
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        portfolio: true,
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Check ownership
    if (contractor.userId !== userId) {
      throw new BadRequestException('You can only reorder your own portfolio');
    }

    // Verify all items belong to contractor
    const portfolioIds = contractor.portfolio.map((item) => item.id);
    const invalidIds = itemIds.filter((id) => !portfolioIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException('Some portfolio item IDs do not belong to this contractor');
    }

    // Update order
    for (let i = 0; i < itemIds.length; i++) {
      await this.prisma.portfolioItem.update({
        where: { id: itemIds[i] },
        data: { order: i },
      });
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PORTFOLIO_ITEM_UPDATED,
      entity: AuditEntity.PORTFOLIO,
      entityId: contractorId,
      metadata: {
        action: 'reorder',
        itemIds,
      },
    });

    return { message: 'Portfolio reordered successfully' };
  }

  /**
   * Assign categories to contractor (max 5)
   */
  async assignCategories(contractorId: string, userId: string, categoryIds: string[]) {
    // Get contractor
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
      include: { categories: true },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Check ownership
    if (contractor.userId !== userId) {
      throw new BadRequestException('You can only assign categories to your own profile');
    }

    // Check max 5 categories
    if (categoryIds.length > 5) {
      throw new BadRequestException('Maximum 5 categories allowed');
    }

    // Verify all categories exist
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds }, isActive: true },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('Some categories not found or inactive');
    }

    // Remove existing categories
    await this.prisma.contractorCategory.deleteMany({
      where: { contractorId },
    });

    // Add new categories
    await this.prisma.contractorCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        contractorId,
        categoryId,
      })),
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.CATEGORY_ASSIGNED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractorId,
      metadata: {
        categoryIds,
        count: categoryIds.length,
      },
    });

    return { message: 'Categories assigned successfully', count: categoryIds.length };
  }

  /**
   * Remove category from contractor
   */
  async removeCategory(contractorId: string, userId: string, categoryId: string) {
    // Get contractor
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Check ownership
    if (contractor.userId !== userId) {
      throw new BadRequestException('You can only remove categories from your own profile');
    }

    // Remove category
    await this.prisma.contractorCategory.deleteMany({
      where: {
        contractorId,
        categoryId,
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.CATEGORY_REMOVED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractorId,
      metadata: {
        categoryId,
      },
    });

    return { message: 'Category removed successfully' };
  }

  /**
   * Get contractor categories
   */
  async getCategories(contractorId: string) {
    const categories = await this.prisma.contractorCategory.findMany({
      where: { contractorId },
      include: {
        category: true,
      },
    });

    return categories.map((cc) => cc.category);
  }
}

