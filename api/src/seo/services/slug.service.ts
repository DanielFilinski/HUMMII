import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../shared/audit/enums/audit-action.enum';
import { GenerateSlugDto } from '../dto/generate-slug.dto';
import { UpdateSlugDto } from '../dto/update-slug.dto';
import { RedirectService } from './redirect.service';

@Injectable()
export class SlugService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly redirectService: RedirectService,
  ) {}

  /**
   * Sanitize string to create SEO-friendly slug
   * Removes special characters, converts to lowercase, replaces spaces with hyphens
   */
  private sanitizeSlug(input: string): string {
    if (!input) {
      return '';
    }

    // Convert to lowercase
    let slug = input.toLowerCase().trim();

    // Remove special characters (keep alphanumeric, spaces, and hyphens)
    slug = slug.replace(/[^a-z0-9\s-]/g, '');

    // Replace spaces and multiple hyphens with single hyphen
    slug = slug.replace(/[\s-]+/g, '-');

    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');

    return slug;
  }

  /**
   * Generate slug from business name, city, and province
   */
  private generateSlugFromData(businessName?: string, city?: string, province?: string, name?: string): string {
    const parts: string[] = [];

    if (businessName) {
      parts.push(businessName);
    } else if (name) {
      parts.push(name);
    }

    if (city) {
      parts.push(city);
    }

    if (province) {
      parts.push(province);
    }

    if (parts.length === 0) {
      throw new BadRequestException('Cannot generate slug: provide businessName/name and city');
    }

    const baseSlug = this.sanitizeSlug(parts.join(' '));

    if (!baseSlug || baseSlug.length < 3) {
      throw new BadRequestException('Generated slug is too short. Please provide more details.');
    }

    return baseSlug;
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const sanitized = this.sanitizeSlug(slug);

    if (!sanitized || sanitized.length < 3) {
      return false;
    }

    const existing = await this.prisma.contractorSlug.findUnique({
      where: { slug: sanitized },
    });

    return !existing;
  }

  /**
   * Generate unique slug with numeric suffix if needed
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    const sanitized = this.sanitizeSlug(baseSlug);

    if (!sanitized) {
      throw new BadRequestException('Invalid slug');
    }

    // Check if base slug is available
    const isAvailable = await this.isSlugAvailable(sanitized);
    if (isAvailable) {
      return sanitized;
    }

    // Try with numeric suffix
    let counter = 2;
    let uniqueSlug = `${sanitized}-${counter}`;

    while (!(await this.isSlugAvailable(uniqueSlug))) {
      counter++;
      uniqueSlug = `${sanitized}-${counter}`;

      // Prevent infinite loop (max 1000 attempts)
      if (counter > 1000) {
        throw new ConflictException('Unable to generate unique slug. Please try a different base slug.');
      }
    }

    return uniqueSlug;
  }

  /**
   * Generate slug for contractor
   */
  async generateSlug(userId: string, dto: GenerateSlugDto): Promise<{ slug: string }> {
    // Get contractor profile
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    let slug: string;

    if (dto.slug) {
      // Use provided slug
      slug = await this.generateUniqueSlug(dto.slug);
    } else {
      // Auto-generate from profile data or DTO
      const businessName = dto.businessName ?? contractor.businessName ?? undefined;
      const city = dto.city ?? contractor.city ?? undefined;
      const province = dto.province ?? contractor.province ?? undefined;
      const name = contractor.user.name ?? undefined;

      const baseSlug = this.generateSlugFromData(businessName, city, province, name);
      slug = await this.generateUniqueSlug(baseSlug);
    }

    // Create or update slug
    const existingSlug = await this.prisma.contractorSlug.findUnique({
      where: { contractorId: contractor.id },
    });

    if (existingSlug) {
      // Update existing slug (will create redirect in updateSlug method)
      await this.updateSlug(userId, { slug });
      return { slug };
    }

    // Create new slug
    await this.prisma.contractorSlug.create({
      data: {
        contractorId: contractor.id,
        slug,
        isActive: true,
      },
    });

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractor.id,
      metadata: {
        slug,
        action: 'slug_generated',
      },
    });

    return { slug };
  }

  /**
   * Update contractor slug (creates redirect for old URL)
   */
  async updateSlug(userId: string, dto: UpdateSlugDto): Promise<{ slug: string }> {
    // Get contractor profile
    const contractor = await this.prisma.contractor.findUnique({
      where: { userId },
      include: {
        slug: true,
      },
    });

    if (!contractor) {
      throw new NotFoundException('Contractor profile not found');
    }

    // Generate unique slug
    const newSlug = await this.generateUniqueSlug(dto.slug);

    // Get old slug if exists
    const oldSlug = contractor.slug?.slug;

    // Update slug
    if (contractor.slug) {
      await this.prisma.contractorSlug.update({
        where: { contractorId: contractor.id },
        data: {
          slug: newSlug,
          isActive: true,
        },
      });
    } else {
      await this.prisma.contractorSlug.create({
        data: {
          contractorId: contractor.id,
          slug: newSlug,
          isActive: true,
        },
      });
    }

    // Create redirect if old slug exists
    if (oldSlug && oldSlug !== newSlug) {
      await this.redirectService.createRedirect(
        `/performer/${oldSlug}`,
        `/performer/${newSlug}`,
        301,
      );
    }

    // Audit log
    await this.auditService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      entity: AuditEntity.CONTRACTOR,
      entityId: contractor.id,
      metadata: {
        oldSlug,
        newSlug,
        action: 'slug_updated',
      },
    });

    return { slug: newSlug };
  }

  /**
   * Get slug for contractor
   */
  async getSlugByContractorId(contractorId: string): Promise<string | null> {
    const slug = await this.prisma.contractorSlug.findUnique({
      where: { contractorId },
      select: { slug: true },
    });

    return slug?.slug || null;
  }

  /**
   * Get contractor ID by slug
   */
  async getContractorIdBySlug(slug: string): Promise<string | null> {
    const contractorSlug = await this.prisma.contractorSlug.findUnique({
      where: { slug },
      select: { contractorId: true },
    });

    return contractorSlug?.contractorId || null;
  }
}

