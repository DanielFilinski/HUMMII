import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, AuditEntity } from './enums/audit-action.enum';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create audit log entry', async () => {
      const auditData = {
        userId: 'user-123',
        action: AuditAction.LOGIN,
        entity: AuditEntity.USER,
        entityId: 'user-123',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        metadata: { success: true },
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-123',
        ...auditData,
        createdAt: new Date(),
      });

      await service.log(auditData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: auditData.userId,
          action: auditData.action,
          entity: auditData.entity,
          entityId: auditData.entityId,
        }),
      });
    });

    it('should log user registration', async () => {
      const auditData = {
        userId: 'user-456',
        action: AuditAction.REGISTER,
        entity: AuditEntity.USER,
        entityId: 'user-456',
        metadata: {
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-456',
        ...auditData,
        createdAt: new Date(),
      });

      await service.log(auditData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
      const createCall = mockPrismaService.auditLog.create.mock.calls[0][0];
      expect(createCall.data.action).toBe(AuditAction.REGISTER);
    });

    it('should log PIPEDA data export', async () => {
      const auditData = {
        userId: 'user-789',
        action: AuditAction.DATA_EXPORTED,
        entity: AuditEntity.USER,
        entityId: 'user-789',
        metadata: {
          format: 'JSON',
          dataTypes: ['profile', 'sessions', 'orders'],
        },
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-789',
        ...auditData,
        createdAt: new Date(),
      });

      await service.log(auditData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
      const createCall = mockPrismaService.auditLog.create.mock.calls[0][0];
      expect(createCall.data.action).toBe(AuditAction.DATA_EXPORTED);
    });

    it('should include metadata in audit log', async () => {
      const metadata = {
        oldValue: 'old',
        newValue: 'new',
        changedFields: ['name', 'email'],
      };

      const auditData = {
        userId: 'user-101',
        action: AuditAction.UPDATE,
        entity: AuditEntity.USER,
        entityId: 'user-101',
        metadata,
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-101',
        ...auditData,
        createdAt: new Date(),
      });

      await service.log(auditData);

      const createCall = mockPrismaService.auditLog.create.mock.calls[0][0];
      expect(createCall.data.metadata).toEqual(metadata);
    });

    it('should handle optional fields', async () => {
      const auditData = {
        userId: 'user-202',
        action: AuditAction.LOGIN,
        entity: AuditEntity.USER,
        entityId: 'user-202',
        // No ipAddress, userAgent, or metadata
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-202',
        ...auditData,
        createdAt: new Date(),
      });

      await service.log(auditData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('PIPEDA compliance', () => {
    it('should log account deletion for compliance', async () => {
      const auditData = {
        userId: 'user-deleted-123',
        action: AuditAction.ACCOUNT_DELETED,
        entity: AuditEntity.USER,
        entityId: 'user-deleted-123',
        metadata: {
          reason: 'User requested deletion',
          dataRetention: '7 years for tax records',
        },
      };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: 'audit-deletion-123',
        ...auditData,
        createdAt: new Date(),
      });

      await service.log(auditData);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
      const createCall = mockPrismaService.auditLog.create.mock.calls[0][0];
      expect(createCall.data.action).toBe(AuditAction.ACCOUNT_DELETED);
    });
  });
});

