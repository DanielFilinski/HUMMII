import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { CategoryTreeService } from './services/category-tree.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;
  let auditService: AuditService;
  let categoryTreeService: CategoryTreeService;

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockCategoryTreeService = {
    buildTree: jest.fn(),
    getSubcategories: jest.fn(),
    getPath: jest.fn(),
    validateHierarchy: jest.fn(),
  };

  const mockCategory = {
    id: 'category-1',
    name: 'Electrical',
    nameEn: 'Electrical',
    nameFr: 'Électrique',
    slug: 'electrical',
    description: 'Electrical services',
    icon: 'lightning-bolt',
    parentId: null,
    level: 0,
    sortOrder: 0,
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      contractors: 10,
      orders: 25,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: CategoryTreeService, useValue: mockCategoryTreeService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
    categoryTreeService = module.get<CategoryTreeService>(CategoryTreeService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create category successfully', async () => {
      const dto = {
        nameEn: 'Electrical',
        nameFr: 'Électrique',
        slug: 'electrical',
        description: 'Electrical services',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findFirst.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue({
        ...mockCategory,
        ...dto,
      });

      const result = await service.create(dto, 'admin-1');

      expect(result).toBeDefined();
      expect(mockPrismaService.category.create).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      const dto = {
        nameEn: 'Electrical',
        nameFr: 'Électrique',
        slug: 'electrical',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(service.create(dto, 'admin-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if name already exists in same parent', async () => {
      const dto = {
        nameEn: 'Electrical',
        nameFr: 'Électrique',
        slug: 'electrical-new',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);

      await expect(service.create(dto, 'admin-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if parent not found', async () => {
      const dto = {
        nameEn: 'Sub Electrical',
        nameFr: 'Sous-électrique',
        slug: 'sub-electrical',
        parentId: 'non-existent-parent',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, 'admin-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if max depth exceeded', async () => {
      const dto = {
        nameEn: 'Deep Category',
        nameFr: 'Catégorie profonde',
        slug: 'deep-category',
        parentId: 'parent-3',
      };

      const deepParent = {
        ...mockCategory,
        id: 'parent-3',
        level: 2,
      };

      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(null) // slug check
        .mockResolvedValueOnce(null) // name check
        .mockResolvedValueOnce(deepParent); // parent check

      await expect(service.create(dto, 'admin-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const query = {
        page: 1,
        limit: 20,
      };

      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);
      mockPrismaService.category.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by parentId', async () => {
      const query = {
        parentId: 'parent-1',
        page: 1,
        limit: 20,
      };

      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);
      mockPrismaService.category.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentId: 'parent-1',
          }),
        }),
      );
    });

    it('should filter by search term', async () => {
      const query = {
        search: 'electrical',
        page: 1,
        limit: 20,
      };

      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);
      mockPrismaService.category.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(result).toBeDefined();
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findAllActive', () => {
    it('should return all active categories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAllActive();

      expect(result).toEqual([mockCategory]);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return category by ID', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('category-1');

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'category-1' },
        include: {
          _count: {
            select: {
              contractors: true,
              orders: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const dto = {
        nameEn: 'Updated Electrical',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue({
        ...mockCategory,
        ...dto,
      });

      const result = await service.update('category-1', dto, 'admin-1');

      expect(result).toBeDefined();
      expect(mockPrismaService.category.update).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', {}, 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if setting self as parent', async () => {
      const dto = {
        parentId: 'category-1',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(service.update('category-1', dto, 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate circular reference', async () => {
      const dto = {
        parentId: 'parent-1',
      };

      const parent = {
        ...mockCategory,
        id: 'parent-1',
      };

      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(parent);
      mockCategoryTreeService.validateHierarchy.mockResolvedValue(true);

      await expect(service.update('category-1', dto, 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete category successfully', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: {
          contractors: 0,
          orders: 0,
        },
      });
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.delete('category-1', 'admin-1');

      expect(result).toEqual({ message: 'Category deleted successfully' });
      expect(mockPrismaService.category.delete).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent', 'admin-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if category in use', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        _count: {
          contractors: 5,
          orders: 10,
        },
      });

      await expect(service.delete('category-1', 'admin-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTree', () => {
    it('should return category tree', async () => {
      const tree = [mockCategory];
      mockCategoryTreeService.buildTree.mockResolvedValue(tree);

      const result = await service.getTree();

      expect(result).toEqual(tree);
      expect(mockCategoryTreeService.buildTree).toHaveBeenCalledWith(false);
    });
  });

  describe('getSubcategories', () => {
    it('should return subcategories', async () => {
      const subcategories = [mockCategory];
      mockCategoryTreeService.getSubcategories.mockResolvedValue(subcategories);

      const result = await service.getSubcategories('parent-1');

      expect(result).toEqual(subcategories);
      expect(mockCategoryTreeService.getSubcategories).toHaveBeenCalledWith('parent-1', false);
    });
  });

  describe('getPath', () => {
    it('should return category path', async () => {
      const path = [mockCategory];
      mockCategoryTreeService.getPath.mockResolvedValue(path);

      const result = await service.getPath('category-1');

      expect(result).toEqual(path);
      expect(mockCategoryTreeService.getPath).toHaveBeenCalledWith('category-1');
    });
  });
});

