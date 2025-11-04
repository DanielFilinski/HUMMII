import { Test, TestingModule } from '@nestjs/testing';
import { ProposalsService } from './proposals.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { getQueueToken } from '@nestjs/bull';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { OrderStatus, OrderType, ProposalStatus } from '@prisma/client';

describe('ProposalsService', () => {
  let service: ProposalsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    proposal: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
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
        ProposalsService,
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

    service = module.get<ProposalsService>(ProposalsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create proposal for published public order', async () => {
      const orderId = 'order-123';
      const contractorId = 'contractor-123';
      const createDto = {
        proposedPrice: 300,
        message: 'I can complete this job in 2 days',
        estimatedDays: 2,
      };

      const mockOrder = {
        id: orderId,
        status: OrderStatus.PUBLISHED,
        type: OrderType.PUBLIC,
        clientId: 'client-123',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);
      mockPrismaService.proposal.create.mockResolvedValue({
        id: 'proposal-123',
        orderId,
        contractorId,
        ...createDto,
        status: ProposalStatus.PENDING,
      });

      const result = await service.create(orderId, contractorId, createDto as any);

      expect(result.status).toBe(ProposalStatus.PENDING);
      expect(mockNotificationQueue.add).toHaveBeenCalledWith(
        'new-proposal',
        expect.any(Object),
      );
    });

    it('should throw ConflictException for duplicate proposal', async () => {
      const orderId = 'order-123';
      const contractorId = 'contractor-123';
      const mockOrder = {
        id: orderId,
        status: OrderStatus.PUBLISHED,
        type: OrderType.PUBLIC,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: 'existing-proposal',
      });

      await expect(
        service.create(orderId, contractorId, {} as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for direct order', async () => {
      const orderId = 'order-123';
      const contractorId = 'contractor-123';
      const mockOrder = {
        id: orderId,
        status: OrderStatus.PUBLISHED,
        type: OrderType.DIRECT,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);

      await expect(
        service.create(orderId, contractorId, {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('accept', () => {
    it('should accept proposal and assign contractor', async () => {
      const proposalId = 'proposal-123';
      const clientId = 'client-123';
      const mockProposal = {
        id: proposalId,
        orderId: 'order-123',
        contractorId: 'contractor-123',
        proposedPrice: 300,
        order: {
          id: 'order-123',
          clientId,
          status: OrderStatus.PUBLISHED,
        },
      };

      mockPrismaService.proposal.findUnique.mockResolvedValue(mockProposal);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
      mockPrismaService.proposal.update.mockResolvedValue({
        ...mockProposal,
        status: ProposalStatus.ACCEPTED,
      });
      mockPrismaService.proposal.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.order.update.mockResolvedValue({
        ...mockProposal.order,
        status: OrderStatus.IN_PROGRESS,
        contractorId: mockProposal.contractorId,
      });
      mockPrismaService.proposal.findMany.mockResolvedValue([]);

      const result = await service.accept(proposalId, clientId);

      expect(result.message).toBe('Proposal accepted successfully');
      expect(mockNotificationQueue.add).toHaveBeenCalled();
    });
  });
});

