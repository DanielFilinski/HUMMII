import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { getQueueToken } from '@nestjs/bull';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, OrderType } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let auditService: AuditService;
  let notificationQueue: any;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    contractor: {
      findUnique: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockNotificationQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: getQueueToken('notifications'),
          useValue: mockNotificationQueue,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
    notificationQueue = module.get(getQueueToken('notifications'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order with draft status', async () => {
      const clientId = 'client-123';
      const createDto = {
        title: 'Test Order Title',
        description: 'Test order description with more details',
        type: OrderType.PUBLIC,
        categoryId: 'category-123',
        latitude: 43.6532,
        longitude: -79.3832,
        address: '123 Main St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5H 2N2',
      };

      const mockCategory = { id: 'category-123', name: 'Plumbing' };
      const mockOrder = {
        id: 'order-123',
        ...createDto,
        status: OrderStatus.DRAFT,
        clientId,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(clientId, createDto as any);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.categoryId },
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      const clientId = 'client-123';
      const createDto = {
        categoryId: 'invalid-category',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.create(clientId, createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publishOrder', () => {
    it('should publish draft order', async () => {
      const orderId = 'order-123';
      const clientId = 'client-123';
      const mockOrder = {
        id: orderId,
        clientId,
        status: OrderStatus.DRAFT,
        type: OrderType.PUBLIC,
        categoryId: 'category-123',
        latitude: 43.6532,
        longitude: -79.3832,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      const result = await service.publishOrder(orderId, clientId);

      expect(result.status).toBe(OrderStatus.PUBLISHED);
      expect(mockNotificationQueue.add).toHaveBeenCalledWith(
        'order-published',
        expect.any(Object),
      );
    });

    it('should throw ForbiddenException if not order owner', async () => {
      const orderId = 'order-123';
      const clientId = 'client-123';
      const mockOrder = {
        id: orderId,
        clientId: 'different-client',
        status: OrderStatus.DRAFT,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.publishOrder(orderId, clientId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if not draft', async () => {
      const orderId = 'order-123';
      const clientId = 'client-123';
      const mockOrder = {
        id: orderId,
        clientId,
        status: OrderStatus.PUBLISHED,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.publishOrder(orderId, clientId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status with valid transition', async () => {
      const orderId = 'order-123';
      const userId = 'client-123';
      const newStatus = OrderStatus.PUBLISHED;
      const mockOrder = {
        id: orderId,
        clientId: userId,
        status: OrderStatus.DRAFT,
        contractorId: null,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: newStatus,
      });

      const result = await service.updateStatus(orderId, userId, newStatus);

      expect(result.status).toBe(newStatus);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const orderId = 'order-123';
      const userId = 'client-123';
      const mockOrder = {
        id: orderId,
        clientId: userId,
        status: OrderStatus.COMPLETED,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.updateStatus(orderId, userId, OrderStatus.DRAFT),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete draft order', async () => {
      const orderId = 'order-123';
      const clientId = 'client-123';
      const mockOrder = {
        id: orderId,
        clientId,
        status: OrderStatus.DRAFT,
        title: 'Test Order',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.delete.mockResolvedValue(mockOrder);

      const result = await service.delete(orderId, clientId);

      expect(result.message).toBe('Order deleted successfully');
      expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });

    it('should throw BadRequestException if not draft', async () => {
      const orderId = 'order-123';
      const clientId = 'client-123';
      const mockOrder = {
        id: orderId,
        clientId,
        status: OrderStatus.PUBLISHED,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.delete(orderId, clientId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

