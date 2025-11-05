import { Test, TestingModule } from '@nestjs/testing';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  DisputeReason,
  DisputeStatus,
  DisputePriority,
  OrderStatus,
  UserRole,
} from '@prisma/client';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';

describe('DisputesService', () => {
  let service: DisputesService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    dispute: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDispute', () => {
    const userId = 'user-1';
    const orderId = 'order-1';
    const contractorId = 'contractor-1';

    const createDto: CreateDisputeDto = {
      orderId,
      reason: DisputeReason.WORK_QUALITY_ISSUES,
      description: 'The work completed does not meet the agreed quality standards. Multiple issues were found.',
      amountInDispute: 500,
    };

    const mockOrder = {
      id: orderId,
      clientId: userId,
      contractorId,
      status: OrderStatus.IN_PROGRESS,
      client: { id: userId, name: 'Client', email: 'client@example.com' },
      contractor: { id: contractorId, name: 'Contractor', email: 'contractor@example.com' },
    };

    it('should create dispute successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.dispute.findUnique.mockResolvedValue(null);
      mockPrismaService.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        orderId,
        initiatedById: userId,
        respondentId: contractorId,
        reason: createDto.reason,
        description: createDto.description,
        status: DisputeStatus.OPENED,
        priority: DisputePriority.MEDIUM,
        amountInDispute: createDto.amountInDispute,
        order: mockOrder,
        initiatedBy: { id: userId, name: 'Client', email: 'client@example.com' },
        respondent: { id: contractorId, name: 'Contractor', email: 'contractor@example.com' },
      });
      mockPrismaService.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.DISPUTED });

      const result = await service.createDispute(userId, createDto);

      expect(result).toBeDefined();
      expect(result.initiatedById).toBe(userId);
      expect(result.respondentId).toBe(contractorId);
      expect(mockPrismaService.dispute.create).toHaveBeenCalled();
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatus.DISPUTED },
      });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DISPUTE_CREATED',
          entity: 'Dispute',
          userId,
        }),
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.createDispute(userId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        clientId: 'other-client',
        contractorId: 'other-contractor',
      });

      await expect(service.createDispute(userId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if order status does not allow dispute', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.DRAFT,
      });

      await expect(service.createDispute(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if dispute already exists', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.dispute.findUnique.mockResolvedValue({ id: 'existing-dispute' });

      await expect(service.createDispute(userId, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getUserDisputes', () => {
    const userId = 'user-1';
    const query = { page: 1, limit: 20 };

    it('should return user disputes with pagination', async () => {
      const mockDisputes = [
        {
          id: 'dispute-1',
          orderId: 'order-1',
          initiatedById: userId,
          respondentId: 'user-2',
          status: DisputeStatus.OPENED,
          order: { id: 'order-1', title: 'Order 1', status: OrderStatus.DISPUTED },
          _count: { evidence: 2, messages: 5 },
        },
      ];

      mockPrismaService.dispute.findMany.mockResolvedValue(mockDisputes);
      mockPrismaService.dispute.count.mockResolvedValue(1);

      const result = await service.getUserDisputes(userId, query);

      expect(result.disputes).toEqual(mockDisputes);
      expect(result.pagination.total).toBe(1);
      expect(mockPrismaService.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ initiatedById: userId }, { respondentId: userId }],
          },
        }),
      );
    });
  });

  describe('getDisputeById', () => {
    const disputeId = 'dispute-1';
    const userId = 'user-1';

    const mockDispute = {
      id: disputeId,
      orderId: 'order-1',
      initiatedById: userId,
      respondentId: 'user-2',
      status: DisputeStatus.OPENED,
      order: { id: 'order-1', title: 'Order 1' },
      evidence: [],
      messages: [],
      _count: { evidence: 0, messages: 0 },
    };

    it('should return dispute for participant', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      const result = await service.getDisputeById(disputeId, userId);

      expect(result).toEqual(mockDispute);
    });

    it('should throw NotFoundException if dispute not found', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue(null);

      await expect(service.getDisputeById(disputeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        initiatedById: 'other-user',
        respondentId: 'another-user',
      });

      await expect(service.getDisputeById(disputeId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateStatus', () => {
    const disputeId = 'dispute-1';
    const adminId = 'admin-1';
    const dto: UpdateDisputeStatusDto = {
      status: DisputeStatus.UNDER_REVIEW,
      priority: DisputePriority.HIGH,
    };

    it('should update dispute status successfully', async () => {
      const mockDispute = {
        id: disputeId,
        status: DisputeStatus.OPENED,
        priority: DisputePriority.MEDIUM,
      };

      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);
      mockPrismaService.dispute.update.mockResolvedValue({
        ...mockDispute,
        status: dto.status,
        priority: dto.priority,
      });

      const result = await service.updateStatus(disputeId, dto, adminId);

      expect(result.status).toBe(dto.status);
      expect(result.priority).toBe(dto.priority);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DISPUTE_STATUS_CHANGED',
          userId: adminId,
        }),
      );
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const mockDispute = {
        id: disputeId,
        status: DisputeStatus.CLOSED,
        priority: DisputePriority.MEDIUM,
      };

      mockPrismaService.dispute.findUnique.mockResolvedValue(mockDispute);

      await expect(service.updateStatus(disputeId, dto, adminId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkUserAccess', () => {
    const disputeId = 'dispute-1';
    const userId = 'user-1';

    it('should return true for participant', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue({
        initiatedById: userId,
        respondentId: 'user-2',
      });

      const result = await service.checkUserAccess(disputeId, userId);

      expect(result).toBe(true);
    });

    it('should return true for admin', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue({
        initiatedById: 'other-user',
        respondentId: 'another-user',
      });

      const result = await service.checkUserAccess(disputeId, userId, UserRole.ADMIN);

      expect(result).toBe(true);
    });

    it('should return false for non-participant', async () => {
      mockPrismaService.dispute.findUnique.mockResolvedValue({
        initiatedById: 'other-user',
        respondentId: 'another-user',
      });

      const result = await service.checkUserAccess(disputeId, userId);

      expect(result).toBe(false);
    });
  });
});

