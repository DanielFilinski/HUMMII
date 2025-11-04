import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

/**
 * ResourceOwnerGuard - checks if user owns the resource they're trying to access
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
 * @Patch(':id')
 * async updateResource(@Param('id') id: string) { ... }
 *
 * Features:
 * - ADMIN always has access
 * - Resource owner has access
 * - Others get 403 Forbidden
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admin always has access
    // Security: Check if user has ADMIN in their roles array
    if (user.roles && user.roles.includes(UserRole.ADMIN)) {
      return true;
    }

    if (!resourceId) {
      throw new ForbiddenException('Resource ID is required');
    }

    // Determine resource type from URL path
    const resourceType = this.getResourceType(request.path);

    // Check ownership based on resource type
    const isOwner = await this.checkOwnership(resourceType, resourceId, user.userId);

    if (!isOwner) {
      throw new ForbiddenException(
        'You can only access your own resources. This action requires ownership or admin privileges.',
      );
    }

    return true;
  }

  /**
   * Extract resource type from URL path
   */
  private getResourceType(path: string): string {
    // Extract first segment after /api/v1/ or /
    const segments = path.split('/').filter(Boolean);

    // Common patterns:
    // /api/v1/orders/:id -> 'orders'
    // /orders/:id -> 'orders'
    // /users/:id -> 'users'

    if (segments.includes('orders')) return 'order';
    if (segments.includes('reviews')) return 'review';
    if (segments.includes('users')) return 'user';
    if (segments.includes('portfolio')) return 'portfolio';
    if (segments.includes('services')) return 'service';

    return 'unknown';
  }

  /**
   * Check if user owns the resource
   */
  private async checkOwnership(type: string, resourceId: string, userId: string): Promise<boolean> {
    try {
      switch (type) {
        case 'order':
          const order = await this.prisma.order.findUnique({
            where: { id: resourceId },
            select: { clientId: true, contractorId: true },
          });

          if (!order) {
            throw new NotFoundException('Order not found');
          }

          // User is owner if they are client OR contractor
          return order.clientId === userId || order.contractorId === userId;

        case 'review':
          const review = await this.prisma.review.findUnique({
            where: { id: resourceId },
            select: { reviewerId: true },
          });

          if (!review) {
            throw new NotFoundException('Review not found');
          }

          return review.reviewerId === userId;

        case 'user':
          // User can only access their own profile
          return resourceId === userId;

        case 'portfolio':
          const portfolio = await this.prisma.portfolioItem.findUnique({
            where: { id: resourceId },
            select: { contractor: { select: { userId: true } } },
          });

          if (!portfolio) {
            throw new NotFoundException('Portfolio item not found');
          }

          return portfolio.contractor.userId === userId;

        case 'service':
          const service = await this.prisma.service.findUnique({
            where: { id: resourceId },
            select: { contractor: { select: { userId: true } } },
          });

          if (!service) {
            throw new NotFoundException('Service not found');
          }

          return service.contractor.userId === userId;

        default:
          // By default, deny access for unknown resource types
          return false;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Log error and deny access
      console.error('Error checking ownership:', error);
      return false;
    }
  }
}
