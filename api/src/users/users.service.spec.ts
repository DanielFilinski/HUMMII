import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../shared/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
  };

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+15551234567',
    avatar: 'https://example.com/avatar.jpg',
    role: 'CLIENT',
    isVerified: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithRelations = {
    ...mockUser,
    password: 'hashedPassword',
    clientOrders: [
      {
        id: 'order-1',
        title: 'Test Order',
        description: 'Test description',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    contractorOrders: [],
    sentMessages: [
      {
        id: 'msg-1',
        content: 'Test message',
        createdAt: new Date(),
      },
    ],
    givenReviews: [
      {
        id: 'review-1',
        overallRating: '4.50',
        comment: 'Great service',
        createdAt: new Date(),
      },
    ],
    receivedReviews: [],
    contractor: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return user without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Name',
      phone: '+15559876543',
    };

    it('should successfully update user profile', async () => {
      const updatedUser = {
        ...mockUser,
        ...updateDto,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('123', updateDto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: updateDto,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe(updateDto.name);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'New Name Only' };
      const updatedUser = { ...mockUser, name: partialUpdate.name };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('123', partialUpdate);

      expect(result.name).toBe(partialUpdate.name);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete user account (PIPEDA compliance)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        email: `deleted_${mockUser.id}@deleted.local`,
        name: 'Deleted User',
        deletedAt: new Date(),
      });
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 2 });

      await service.deleteAccount('123');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          email: 'deleted_123@deleted.local',
          name: 'Deleted User',
          phone: null,
          avatar: null,
          password: '',
          isVerified: false,
          verificationToken: null,
          verificationTokenExpiry: null,
          resetToken: null,
          resetTokenExpiry: null,
          deletedAt: expect.any(Date),
        },
      });
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: '123' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should anonymize user data but preserve account for compliance', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 0 });

      await service.deleteAccount('123');

      // Verify personal data is anonymized
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Deleted User',
            phone: null,
            avatar: null,
            password: '',
          }),
        }),
      );
    });
  });

  describe('exportUserData', () => {
    it('should export all user data (PIPEDA compliance)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithRelations,
      );

      const result = await service.exportUserData('123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          clientOrders: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          contractorOrders: {
            select: {
              id: true,
              title: true,
              status: true,
              agreedPrice: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          sentMessages: {
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
          },
          givenReviews: {
            select: {
              id: true,
              overallRating: true,
              comment: true,
              createdAt: true,
            },
          },
          receivedReviews: {
            select: {
              id: true,
              overallRating: true,
              comment: true,
              createdAt: true,
            },
          },
          contractor: {
            select: {
              bio: true,
              hourlyRate: true,
              city: true,
              province: true,
              rating: true,
              totalOrders: true,
              completedOrders: true,
            },
          },
        },
      });

      expect(result).toHaveProperty('exportDate');
      expect(result).toHaveProperty('userData');
      expect(result).toHaveProperty('notice');
      expect(result.userData).not.toHaveProperty('password');
      expect(result.notice).toContain('PIPEDA');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.exportUserData('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include all related data in export', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithRelations,
      );

      const result = await service.exportUserData('123');

      expect(result.userData.clientOrders).toBeDefined();
      expect(result.userData.sentMessages).toBeDefined();
      expect(result.userData.givenReviews).toBeDefined();
      expect(Array.isArray(result.userData.clientOrders)).toBe(true);
    });

    it('should not expose password in export', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithRelations,
      );

      const result = await service.exportUserData('123');

      expect(result.userData).not.toHaveProperty('password');
    });

    it('should include export timestamp', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithRelations,
      );

      const result = await service.exportUserData('123');

      expect(result.exportDate).toBeDefined();
      expect(new Date(result.exportDate)).toBeInstanceOf(Date);
    });
  });
});
