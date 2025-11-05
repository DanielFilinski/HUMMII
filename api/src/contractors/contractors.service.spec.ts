import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { FeatureGateService } from '../subscriptions/services/feature-gate.service';
import { UserRole } from '@prisma/client';

describe('ContractorsService', () => {
  let service: ContractorsService;
  let prisma: PrismaService;
  let auditService: AuditService;
  let featureGateService: FeatureGateService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    contractor: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    portfolioItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contractorCategory: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockFeatureGateService = {
    canAddPortfolioItem: jest.fn(),
    canAddCategory: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    roles: [UserRole.CONTRACTOR],
    contractor: null,
  };

  const mockContractor = {
    id: 'contractor-1',
    userId: 'user-1',
    bio: 'Test bio',
    experience: 5,
    hourlyRate: 50,
    businessName: 'Test Business',
    latitude: 45.421530,
    longitude: -75.697193,
    city: 'Ottawa',
    province: 'ON',
    serviceRadius: 50,
    isAvailable: true,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      avatarUrl: null,
      isVerified: true,
    },
    portfolio: [],
    categories: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractorsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: FeatureGateService, useValue: mockFeatureGateService },
      ],
    }).compile();

    service = module.get<ContractorsService>(ContractorsService);
    prisma = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
    featureGateService = module.get<FeatureGateService>(FeatureGateService);

    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create contractor profile successfully', async () => {
      const dto = {
        bio: 'Test bio',
        experience: 5,
        hourlyRate: 50,
        businessName: 'Test Business',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.contractor.create.mockResolvedValue({
        ...mockContractor,
        ...dto,
      });

      const result = await service.createProfile('user-1', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.contractor.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          bio: dto.bio,
          experience: dto.experience,
          hourlyRate: 50,
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
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createProfile('user-1', {
          bio: 'Test bio',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user does not have CONTRACTOR role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.CLIENT],
      });

      await expect(
        service.createProfile('user-1', {
          bio: 'Test bio',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if profile already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        contractor: mockContractor,
      });

      await expect(
        service.createProfile('user-1', {
          bio: 'Test bio',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    it('should update contractor profile successfully', async () => {
      const dto = {
        bio: 'Updated bio',
        experience: 10,
      };

      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.contractor.update.mockResolvedValue({
        ...mockContractor,
        ...dto,
      });

      const result = await service.updateProfile('user-1', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.contractor.update).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if contractor profile not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('user-1', {
          bio: 'Updated bio',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLocation', () => {
    it('should update location successfully', async () => {
      const dto = {
        latitude: 45.421530,
        longitude: -75.697193,
        city: 'Ottawa',
        province: 'ON',
        serviceRadius: 50,
      };

      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.contractor.update.mockResolvedValue({
        ...mockContractor,
        ...dto,
      });

      const result = await service.updateLocation('user-1', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.contractor.update).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if contractor profile not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(
        service.updateLocation('user-1', {
          latitude: 45.421530,
          longitude: -75.697193,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfile', () => {
    it('should return contractor profile', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockContractor);
      expect(mockPrismaService.contractor.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
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
    });

    it('should throw NotFoundException if contractor profile not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProfileById', () => {
    it('should return contractor profile by ID', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);

      const result = await service.getProfileById('contractor-1');

      expect(result).toEqual(mockContractor);
      expect(mockPrismaService.contractor.findUnique).toHaveBeenCalledWith({
        where: { id: 'contractor-1' },
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
    });

    it('should throw NotFoundException if contractor not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(service.getProfileById('contractor-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findNearby', () => {
    it('should find contractors within radius', async () => {
      const contractors = [
        {
          ...mockContractor,
          latitude: 45.421530,
          longitude: -75.697193,
        },
        {
          ...mockContractor,
          id: 'contractor-2',
          latitude: 45.431530,
          longitude: -75.707193,
        },
      ];

      mockPrismaService.contractor.findMany.mockResolvedValue(contractors);

      const result = await service.findNearby(45.421530, -75.697193, 50);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('distance');
      expect(mockPrismaService.contractor.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no contractors in radius', async () => {
      mockPrismaService.contractor.findMany.mockResolvedValue([]);

      const result = await service.findNearby(45.421530, -75.697193, 50);

      expect(result).toEqual([]);
    });
  });

  describe('addPortfolioItem', () => {
    it('should add portfolio item successfully', async () => {
      const dto = {
        title: 'Test Project',
        description: 'Test description',
        images: ['image-1', 'image-2'],
      };

      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        portfolio: [],
      });
      mockFeatureGateService.canAddPortfolioItem.mockResolvedValue({
        allowed: true,
        max: 10,
        current: 0,
      });
      mockPrismaService.portfolioItem.create.mockResolvedValue({
        id: 'portfolio-1',
        contractorId: 'contractor-1',
        ...dto,
        order: 0,
      });

      const result = await service.addPortfolioItem('contractor-1', 'user-1', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.portfolioItem.create).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if contractor not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(
        service.addPortfolioItem('contractor-1', 'user-1', {
          title: 'Test',
          images: [],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if not owner', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        userId: 'user-2',
      });

      await expect(
        service.addPortfolioItem('contractor-1', 'user-1', {
          title: 'Test',
          images: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if subscription limit reached', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        portfolio: [],
      });
      mockFeatureGateService.canAddPortfolioItem.mockResolvedValue({
        allowed: false,
        max: 5,
        current: 5,
      });

      await expect(
        service.addPortfolioItem('contractor-1', 'user-1', {
          title: 'Test',
          images: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePortfolioItem', () => {
    it('should update portfolio item successfully', async () => {
      const dto = {
        title: 'Updated Title',
      };

      const item = {
        id: 'portfolio-1',
        contractorId: 'contractor-1',
        title: 'Old Title',
        description: 'Old description',
        images: [],
        contractor: mockContractor,
      };

      mockPrismaService.portfolioItem.findUnique.mockResolvedValue(item);
      mockPrismaService.portfolioItem.update.mockResolvedValue({
        ...item,
        ...dto,
      });

      const result = await service.updatePortfolioItem('contractor-1', 'user-1', 'portfolio-1', dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.portfolioItem.update).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if portfolio item not found', async () => {
      mockPrismaService.portfolioItem.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePortfolioItem('contractor-1', 'user-1', 'portfolio-1', {
          title: 'Updated',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePortfolioItem', () => {
    it('should delete portfolio item successfully', async () => {
      const item = {
        id: 'portfolio-1',
        contractorId: 'contractor-1',
        title: 'Test Item',
        contractor: mockContractor,
      };

      mockPrismaService.portfolioItem.findUnique.mockResolvedValue(item);
      mockPrismaService.portfolioItem.delete.mockResolvedValue(item);
      mockPrismaService.portfolioItem.findMany.mockResolvedValue([]);

      const result = await service.deletePortfolioItem('contractor-1', 'user-1', 'portfolio-1');

      expect(result).toEqual({ message: 'Portfolio item deleted successfully' });
      expect(mockPrismaService.portfolioItem.delete).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if portfolio item not found', async () => {
      mockPrismaService.portfolioItem.findUnique.mockResolvedValue(null);

      await expect(
        service.deletePortfolioItem('contractor-1', 'user-1', 'portfolio-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderPortfolio', () => {
    it('should reorder portfolio items successfully', async () => {
      const itemIds = ['portfolio-1', 'portfolio-2', 'portfolio-3'];
      const portfolio = itemIds.map((id, index) => ({
        id,
        contractorId: 'contractor-1',
        order: index,
      }));

      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        portfolio,
      });
      mockPrismaService.portfolioItem.update.mockResolvedValue({});

      const result = await service.reorderPortfolio('contractor-1', 'user-1', itemIds);

      expect(result).toEqual({ message: 'Portfolio reordered successfully' });
      expect(mockPrismaService.portfolioItem.update).toHaveBeenCalledTimes(itemIds.length);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if invalid item IDs', async () => {
      const itemIds = ['portfolio-1', 'invalid-id'];
      const portfolio = [
        {
          id: 'portfolio-1',
          contractorId: 'contractor-1',
          order: 0,
        },
      ];

      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        portfolio,
      });

      await expect(
        service.reorderPortfolio('contractor-1', 'user-1', itemIds),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignCategories', () => {
    it('should assign categories successfully', async () => {
      const categoryIds = ['category-1', 'category-2'];

      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        categories: [],
      });
      mockFeatureGateService.canAddCategory.mockResolvedValue({
        allowed: true,
        max: 5,
        current: 0,
      });
      mockPrismaService.category.findMany.mockResolvedValue(
        categoryIds.map((id) => ({ id, isActive: true })),
      );
      mockPrismaService.contractorCategory.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.contractorCategory.createMany.mockResolvedValue({ count: categoryIds.length });

      const result = await service.assignCategories('contractor-1', 'user-1', categoryIds);

      expect(result).toEqual({
        message: 'Categories assigned successfully',
        count: categoryIds.length,
      });
      expect(mockPrismaService.contractorCategory.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.contractorCategory.createMany).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if subscription limit exceeded', async () => {
      const categoryIds = ['category-1', 'category-2', 'category-3', 'category-4', 'category-5', 'category-6'];

      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        categories: [],
      });
      mockFeatureGateService.canAddCategory.mockResolvedValue({
        allowed: true,
        max: 5,
        current: 0,
      });

      await expect(
        service.assignCategories('contractor-1', 'user-1', categoryIds),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if categories not found', async () => {
      const categoryIds = ['category-1'];

      mockPrismaService.contractor.findUnique.mockResolvedValue({
        ...mockContractor,
        categories: [],
      });
      mockFeatureGateService.canAddCategory.mockResolvedValue({
        allowed: true,
        max: 5,
        current: 0,
      });
      mockPrismaService.category.findMany.mockResolvedValue([]);

      await expect(
        service.assignCategories('contractor-1', 'user-1', categoryIds),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCategory', () => {
    it('should remove category successfully', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.contractorCategory.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.removeCategory('contractor-1', 'user-1', 'category-1');

      expect(result).toEqual({ message: 'Category removed successfully' });
      expect(mockPrismaService.contractorCategory.deleteMany).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if contractor not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(
        service.removeCategory('contractor-1', 'user-1', 'category-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

