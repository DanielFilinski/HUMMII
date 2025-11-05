import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SearchOrdersDto } from './dto/search-orders.dto';
import { OrderStatus, OrderType } from '@prisma/client';
import { canTransition } from './constants/status-transitions';
import { calculateDistance } from './utils/haversine.util';
import {
  SearchResult,
  PaginationMeta,
} from './interfaces/search-result.interface';
import { OrderWithDistance } from './interfaces/order-with-distance.interface';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { forwardRef, Inject, Optional } from '@nestjs/common';
import { NotificationType, NotificationPriority } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    @Optional() @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService?: NotificationsService,
  ) {}

  private async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      // Use NotificationsService if available
      if (this.notificationsService) {
        await this.notificationsService.create(userId, type, {
          title,
          body,
          actionUrl,
          metadata,
        });
      } else {
        // Fallback to queue if service not available
        await this.notificationQueue.add('order-status-changed', {
          userId,
          type,
          title,
          body,
          actionUrl,
          metadata,
        });
      }
    } catch (error) {
      // Fallback to queue on error
      await this.notificationQueue.add('order-status-changed', {
        userId,
        type,
        title,
        body,
        actionUrl,
        metadata,
      });
    }
  }

  /**
   * Create new order (draft status by default)
   * Security: Only authenticated users
   * Rate limit: 10 orders/hour
   */
  async create(clientId: string, createDto: CreateOrderDto) {
    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // If type is DIRECT, validate contractor exists
    if (createDto.type === OrderType.DIRECT && createDto.contractorId) {
      const contractor = await this.prisma.contractor.findUnique({
        where: { userId: createDto.contractorId },
      });

      if (!contractor) {
        throw new NotFoundException('Contractor not found');
      }
    }

    // Create order with DRAFT status
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
        latitude: createDto.latitude,
        longitude: createDto.longitude,
        address: createDto.address,
        city: createDto.city,
        province: createDto.province,
        postalCode: createDto.postalCode,
        images: [],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    // Audit log
    await this.auditService.log({
      action: AuditAction.ORDER_CREATE,
      entity: AuditEntity.ORDER,
      entityId: order.id,
      userId: clientId,
      metadata: { status: order.status, type: order.type },
    });

    return order;
  }

  /**
   * Publish order (DRAFT → PUBLISHED)
   * Security: Only order owner (client)
   */
  async publishOrder(orderId: string, clientId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        category: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.clientId !== clientId) {
      throw new ForbiddenException('Not authorized to publish this order');
    }

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be published');
    }

    // Update status to PUBLISHED
    const published = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });

    // Queue notification job
    if (order.type === OrderType.PUBLIC) {
      await this.notificationQueue.add('order-published', {
        orderId: order.id,
        categoryId: order.categoryId,
        location: {
          lat: order.latitude,
          lon: order.longitude,
        },
      });
    } else if (order.type === OrderType.DIRECT && order.contractorId) {
      await this.notificationQueue.add('order-direct-created', {
        orderId: order.id,
        contractorId: order.contractorId,
      });
    }

    // Audit log
    await this.auditService.log({
      action: AuditAction.ORDER_PUBLISH,
      entity: AuditEntity.ORDER,
      entityId: order.id,
      userId: clientId,
      metadata: { previousStatus: OrderStatus.DRAFT, newStatus: OrderStatus.PUBLISHED },
    });

    return published;
  }

  /**
   * Update order status with validation
   * Security: Only client or assigned contractor can update
   */
  async updateStatus(orderId: string, userId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Authorization: only client or contractor can update status
    const isAuthorized =
      order.clientId === userId || order.contractorId === userId;

    if (!isAuthorized) {
      throw new ForbiddenException('Not authorized to update this order');
    }

    // Validate status transition
    if (!canTransition(order.status, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${newStatus}`,
      );
    }

    // Special validation: IN_PROGRESS requires contractor
    if (newStatus === OrderStatus.IN_PROGRESS && !order.contractorId) {
      throw new BadRequestException(
        'Cannot start order without assigned contractor',
      );
    }

    // Update status with timestamps
    const updateData: {
      status: OrderStatus;
      startedAt?: Date;
      completedAt?: Date;
    } = {
      status: newStatus,
    };

    if (newStatus === OrderStatus.IN_PROGRESS) {
      updateData.startedAt = new Date();
    }

    if (newStatus === OrderStatus.COMPLETED) {
      const completedAt = new Date();
      updateData.completedAt = completedAt;
      
      // Set review eligibility and deadline (14 days from completion)
      const reviewDeadline = new Date(completedAt);
      reviewDeadline.setDate(reviewDeadline.getDate() + 14);
      
      (updateData as any).isReviewEligible = true;
      (updateData as any).reviewDeadline = reviewDeadline;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });

    // Send notifications to client and contractor
    const statusMessages: Record<OrderStatus, string> = {
      [OrderStatus.DRAFT]: 'draft',
      [OrderStatus.PUBLISHED]: 'published',
      [OrderStatus.IN_PROGRESS]: 'in progress',
      [OrderStatus.PENDING_REVIEW]: 'pending review',
      [OrderStatus.COMPLETED]: 'completed',
      [OrderStatus.CANCELLED]: 'cancelled',
      [OrderStatus.DISPUTED]: 'disputed',
    };

    // Notify client
    await this.sendNotification(
      order.clientId,
      NotificationType.ORDER_STATUS_CHANGED,
      `Order #${order.id.substring(0, 8)} status updated`,
      `Your order "${order.title}" status has been updated to ${statusMessages[newStatus]}.`,
      `/orders/${order.id}`,
      {
        orderId: order.id,
        oldStatus: order.status,
        newStatus,
      },
    );

    // Notify contractor if assigned
    if (order.contractorId) {
      await this.sendNotification(
        order.contractorId,
        NotificationType.ORDER_STATUS_CHANGED,
        `Order #${order.id.substring(0, 8)} status updated`,
        `Order "${order.title}" status has been updated to ${statusMessages[newStatus]}.`,
        `/orders/${order.id}`,
        {
          orderId: order.id,
          oldStatus: order.status,
          newStatus,
        },
      );
    }

    // Audit log
    await this.auditService.log({
      action: AuditAction.ORDER_STATUS_CHANGE,
      entity: AuditEntity.ORDER,
      entityId: order.id,
      userId,
      metadata: { previousStatus: order.status, newStatus },
    });

    return updatedOrder;
  }

  /**
   * Search orders with filters and geospatial radius search
   * Security: Public endpoint, but hides sensitive data
   */
  async search(
    searchDto: SearchOrdersDto,
  ): Promise<SearchResult<OrderWithDistance>> {
    const {
      search,
      categoryId,
      minBudget,
      maxBudget,
      latitude,
      longitude,
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
      deletedAt: null, // Exclude soft-deleted orders
    };

    // Text search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Budget range filter
    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) {
        where.budget.gte = minBudget;
      }
      if (maxBudget !== undefined) {
        where.budget.lte = maxBudget;
      }
    }

    // If radius search is requested, fetch all matching orders and filter by distance
    if (latitude !== undefined && longitude !== undefined && radius) {
      // Fetch orders without pagination first
      const allOrders = await this.prisma.order.findMany({
        where: {
          ...where,
          latitude: { not: null },
          longitude: { not: null },
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: { proposals: true },
          },
        },
      });

      // Calculate distance and filter by radius
      const ordersWithDistance: OrderWithDistance[] = allOrders
        .map((order) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            order.latitude!,
            order.longitude!,
          );

          return {
            ...order,
            distance,
          } as OrderWithDistance;
        })
        .filter((order) => order.distance! <= radius);

      // Sort by distance or other criteria
      if (sortBy === 'distance') {
        ordersWithDistance.sort((a, b) => (a.distance! - b.distance!));
      } else if (sortBy === 'date') {
        ordersWithDistance.sort((a, b) => {
          const dateA = a.createdAt.getTime();
          const dateB = b.createdAt.getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (sortBy === 'budget') {
        ordersWithDistance.sort((a, b) => {
          const budgetA = a.budget || 0;
          const budgetB = b.budget || 0;
          return sortOrder === 'asc' ? budgetA - budgetB : budgetB - budgetA;
        });
      }

      // Apply pagination
      const paginatedOrders = ordersWithDistance.slice(skip, skip + limit);
      const total = ordersWithDistance.length;

      return {
        data: paginatedOrders,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // Regular search without geospatial filtering
    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy:
        sortBy === 'date'
          ? { createdAt: sortOrder }
          : sortBy === 'budget'
          ? { budget: sortOrder }
          : { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: { proposals: true },
        },
      },
    });

    // Get total count
    const total = await this.prisma.order.count({ where });

    return {
      data: orders as OrderWithDistance[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get my orders (as client or contractor)
   * Security: Only authenticated users, returns their own orders
   */
  async getMyOrders(userId: string, role?: 'client' | 'contractor') {
    const where: any = {
      deletedAt: null,
    };

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
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            avatar: true,
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

  /**
   * Get order by ID with authorization-based visibility
   * Security: Public for basic info, full details for authorized users
   */
  async findOne(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        category: true,
        proposals: userId
          ? {
              where: { contractorId: userId }, // Only show own proposals to contractors
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
            }
          : undefined,
        _count: {
          select: { proposals: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user is authorized (client or contractor)
    const isAuthorized =
      userId && (order.clientId === userId || order.contractorId === userId);

    // Hide sensitive data for unauthorized users (PIPEDA compliance)
    if (!isAuthorized) {
      // Remove precise address
      delete (order as any).address;
      delete (order as any).postalCode;

      // Remove client PII
      if (order.client) {
        delete (order.client as any).email;
        delete (order.client as any).phone;
      }

      // Remove contractor PII
      if (order.contractor) {
        delete (order.contractor as any).email;
        delete (order.contractor as any).phone;
      }
    }

    return order;
  }

  /**
   * Update order (draft only)
   * Security: Only order owner can update
   */
  async update(orderId: string, clientId: string, updateDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.clientId !== clientId) {
      throw new ForbiddenException('Not authorized to update this order');
    }

    // Only draft orders can be edited
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be edited');
    }

    // If changing contractor, validate
    if (updateDto.contractorId && updateDto.contractorId !== order.contractorId) {
      const contractor = await this.prisma.contractor.findUnique({
        where: { userId: updateDto.contractorId },
      });

      if (!contractor) {
        throw new NotFoundException('Contractor not found');
      }
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        title: updateDto.title,
        description: updateDto.description,
        type: updateDto.type,
        categoryId: updateDto.categoryId,
        contractorId: updateDto.contractorId,
        budget: updateDto.budget,
        deadline: updateDto.deadline ? new Date(updateDto.deadline) : null,
        latitude: updateDto.latitude,
        longitude: updateDto.longitude,
        address: updateDto.address,
        city: updateDto.city,
        province: updateDto.province,
        postalCode: updateDto.postalCode,
      },
      include: {
        client: true,
        category: true,
      },
    });

    // Audit log
    await this.auditService.log({
      action: AuditAction.ORDER_UPDATE,
      entity: AuditEntity.ORDER,
      entityId: order.id,
      userId: clientId,
      metadata: { fields: Object.keys(updateDto) },
    });

    return updated;
  }

  /**
   * Delete order (draft only)
   * Security: Only order owner can delete
   */
  async delete(orderId: string, clientId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.clientId !== clientId) {
      throw new ForbiddenException('Not authorized to delete this order');
    }

    // Only draft orders can be deleted
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be deleted');
    }

    // Delete order (cascade will delete proposals)
    await this.prisma.order.delete({
      where: { id: orderId },
    });

    // Audit log
    await this.auditService.log({
      action: AuditAction.ORDER_DELETE,
      entity: AuditEntity.ORDER,
      entityId: order.id,
      userId: clientId,
      metadata: { title: order.title, status: order.status },
    });

    return { message: 'Order deleted successfully' };
  }
}
