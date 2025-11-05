import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SlugService } from './slug.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { RedirectService } from './redirect.service';

describe('SlugService', () => {
  let service: SlugService;
  let prisma: PrismaService;
  let auditService: AuditService;
  let redirectService: RedirectService;

  const mockPrismaService = {
    contractor: {
      findUnique: jest.fn(),
    },
    contractorSlug: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockRedirectService = {
    createRedirect: jest.fn(),
  };

  const mockContractor = {
    id: 'contractor-1',
    userId: 'user-1',
    businessName: 'Test Business',
    city: 'Toronto',
    province: 'ON',
    user: {
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlugService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: RedirectService, useValue: mockRedirectService },
      ],
    }).compile();

    service = module.get<SlugService>(SlugService);
    prisma = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
    redirectService = module.get<RedirectService>(RedirectService);

    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should generate slug from provided slug', async () => {
      const dto = {
        slug: 'test-business-toronto',
      };

      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.contractorSlug.findUnique
        .mockResolvedValueOnce(null) // availability check
        .mockResolvedValueOnce(null); // existing slug check
      mockPrismaService.contractorSlug.create.mockResolvedValue({
        contractorId: 'contractor-1',
        slug: 'test-business-toronto',
        isActive: true,
      });

      const result = await service.generateSlug('user-1', dto);

      expect(result).toHaveProperty('slug');
      expect(mockPrismaService.contractorSlug.create).toHaveBeenCalled();
    });

    it('should auto-generate slug from profile data', async () => {
      const dto = {};

      mockPrismaService.contractor.findUnique.mockResolvedValue(mockContractor);
      mockPrismaService.contractorSlug.findUnique
        .mockResolvedValueOnce(null) // availability check
        .mockResolvedValueOnce(null); // existing slug check
      mockPrismaService.contractorSlug.create.mockResolvedValue({
        contractorId: 'contractor-1',
        slug: 'test-business-toronto',
        isActive: true,
      });

      const result = await service.generateSlug('user-1', dto);

      expect(result).toHaveProperty('slug');
    });

    it('should throw NotFoundException if contractor not found', async () => {
      mockPrismaService.contractor.findUnique.mockResolvedValue(null);

      await expect(
        service.generateSlug('user-1', {
          slug: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('isSlugAvailable', () => {
    it('should return true if slug is available', async () => {
      mockPrismaService.contractorSlug.findUnique.mockResolvedValue(null);

      const result = await service.isSlugAvailable('test-slug');

      expect(result).toBe(true);
    });

    it('should return false if slug is taken', async () => {
      mockPrismaService.contractorSlug.findUnique.mockResolvedValue({
        contractorId: 'contractor-1',
        slug: 'test-slug',
      });

      const result = await service.isSlugAvailable('test-slug');

      expect(result).toBe(false);
    });
  });

  describe('sanitizeSlug', () => {
    it('should sanitize string to slug format', () => {
      const input = 'Test Business Name!';
      const result = (service as any).sanitizeSlug(input);

      expect(result).toBe('test-business-name');
      expect(result).not.toContain('!');
      expect(result).not.toContain(' ');
    });
  });
});

