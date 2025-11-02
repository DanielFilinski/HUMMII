import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService: any = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
    contractor: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    order: {
      count: jest.fn(),
    },
    portfolioItem: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(mockPrismaService)),
  };

  const mockAuditService = {
    log: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
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

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          roles: ['CLIENT'],
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          roles: ['CONTRACTOR'],
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(10);

      const result = await service.getAllUsers({
        page: 1,
        limit: 20,
      });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter users by role', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.getAllUsers({
        page: 1,
        limit: 10,
        role: UserRole.ADMIN,
      });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roles: { has: UserRole.ADMIN },
          }),
        }),
      );
    });

    it('should search users by email, name, or phone', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await service.getAllUsers({
        page: 1,
        limit: 10,
        search: 'john',
      });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { email: { contains: 'john', mode: 'insensitive' } },
              { name: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        roles: ['CLIENT'],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addUserRole', () => {
    it('should add role to user', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';
      const roleToAdd = UserRole.CONTRACTOR;

      const mockUser = {
        id: userId,
        roles: ['CLIENT'],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        roles: ['CLIENT', roleToAdd],
      });

      const result = await service.addUserRole(userId, roleToAdd, adminId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { roles: ['CLIENT', roleToAdd] },
        select: expect.any(Object),
      });
      expect(mockAuditService.log).toHaveBeenCalled();
      expect(result.user.roles).toContain(roleToAdd);
    });

    it('should not add duplicate role', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        roles: ['CLIENT', 'CONTRACTOR'],
      });

      await expect(
        service.addUserRole(userId, UserRole.CONTRACTOR, adminId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addUserRole('non-existent', UserRole.ADMIN, 'admin-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUserRole', () => {
    it('should remove role from user', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        roles: ['CLIENT', 'CONTRACTOR'],
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        roles: ['CLIENT'],
      });

      const result = await service.removeUserRole(
        userId,
        UserRole.CONTRACTOR,
        adminId,
      );

      expect(result.user.roles).not.toContain(UserRole.CONTRACTOR);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should not allow removing last role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        roles: ['CLIENT'],
      });

      await expect(
        service.removeUserRole('user-123', UserRole.CLIENT, 'admin-456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user does not have role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        roles: ['CLIENT'],
      });

      await expect(
        service.removeUserRole('user-123', UserRole.ADMIN, 'admin-456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('lockUser', () => {
    it('should lock user account', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';
      const reason = 'Suspicious activity';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        roles: ['CLIENT'],
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        lockedUntil: new Date(),
      });
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 2 });

      await service.lockUser(userId, reason, adminId);

      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.lockUser('non-existent', 'Reason', 'admin-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unlockUser', () => {
    it('should unlock user account', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        lockedUntil: new Date(),
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        lockedUntil: null,
      });

      await service.unlockUser(userId, adminId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const userId = 'user-123';
      const adminId = 'admin-456';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        roles: ['CLIENT'],
      });
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        deletedAt: new Date(),
      });

      await service.deleteUser(userId, adminId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should not allow deleting admin by another admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'admin-789',
        email: 'admin@example.com',
        roles: ['ADMIN'],
      });

      await expect(
        service.deleteUser('admin-789', 'admin-456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPlatformStats', () => {
    it('should return platform statistics', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(85) // clients
        .mockResolvedValueOnce(10) // contractors
        .mockResolvedValueOnce(5); // admins

      const stats = await service.getPlatformStats();

      expect(stats).toHaveProperty('users');
      expect(stats.users).toHaveProperty('total');
      expect(stats.users.total).toBe(100);
    });
  });

  describe('getAuditLogs', () => {
    it('should retrieve audit logs', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'LOGIN', userId: 'user-1' },
        { id: 'log-2', action: 'REGISTER', userId: 'user-2' },
      ];

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(50);

      const result = await service.getAuditLogs({
        page: 1,
        limit: 20,
      });

      expect(result.data).toEqual(mockLogs);
      expect(result.pagination.total).toBe(50);
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              roles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getAuditLogById', () => {
    it('should retrieve single audit log', async () => {
      const mockLog = {
        id: 'log-123',
        action: 'LOGIN',
        userId: 'user-123',
      };

      mockPrismaService.auditLog.findUnique.mockResolvedValue(mockLog);

      const result = await service.getAuditLogById('log-123');

      expect(result).toEqual(mockLog);
      expect(mockPrismaService.auditLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'log-123' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              roles: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException for non-existent log', async () => {
      mockPrismaService.auditLog.findUnique.mockResolvedValue(null);

      await expect(
        service.getAuditLogById('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

