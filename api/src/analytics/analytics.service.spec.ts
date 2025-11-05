import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../shared/prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    analyticsEvent: {
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ANALYTICS_IP_SALT') {
        return 'test-salt';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create analytics event successfully', async () => {
      const eventData = {
        eventType: 'profile_view',
        sessionId: 'session-123',
        entityId: 'contractor-1',
        metadata: { source: 'search' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      mockPrismaService.analyticsEvent.create.mockResolvedValue({
        id: 'event-1',
        ...eventData,
        createdAt: new Date(),
      });

      await service.createEvent(
        eventData.eventType,
        eventData.sessionId,
        eventData.entityId,
        eventData.metadata,
        eventData.ipAddress,
        eventData.userAgent,
      );

      expect(mockPrismaService.analyticsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: eventData.eventType,
          sessionId: eventData.sessionId,
          entityId: eventData.entityId,
          ipHash: expect.any(String),
          userAgent: eventData.userAgent,
        }),
      });
    });

    it('should hash IP address for privacy', async () => {
      const ipAddress = '192.168.1.1';

      mockPrismaService.analyticsEvent.create.mockResolvedValue({
        id: 'event-1',
        ipHash: 'hashed',
      });

      await service.createEvent('test', 'session-1', undefined, undefined, ipAddress);

      expect(mockPrismaService.analyticsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipHash: expect.any(String),
        }),
      });
      expect(mockPrismaService.analyticsEvent.create.mock.calls[0][0].data.ipHash).not.toBe(
        ipAddress,
      );
    });

    it('should sanitize metadata to remove PII', async () => {
      const metadata = {
        email: 'test@example.com',
        phone: '+1234567890',
        safeField: 'safe-value',
      };

      mockPrismaService.analyticsEvent.create.mockResolvedValue({
        id: 'event-1',
      });

      await service.createEvent('test', 'session-1', undefined, metadata);

      const createdData = mockPrismaService.analyticsEvent.create.mock.calls[0][0].data;
      expect(createdData.metadata).not.toHaveProperty('email');
      expect(createdData.metadata).not.toHaveProperty('phone');
      expect(createdData.metadata).toHaveProperty('safeField');
    });
  });

  describe('anonymizeQuery', () => {
    it('should anonymize email patterns in query', () => {
      const query = 'plumber john@example.com';
      const result = service.anonymizeQuery(query);

      expect(result).not.toContain('@example.com');
      expect(result).toContain('***');
    });

    it('should anonymize phone patterns in query', () => {
      const query = 'plumber 123-456-7890';
      const result = service.anonymizeQuery(query);

      expect(result).not.toContain('123-456-7890');
      expect(result).toContain('***');
    });

    it('should return original query if no PII detected', () => {
      const query = 'plumber toronto';
      const result = service.anonymizeQuery(query);

      expect(result).toBe(query);
    });
  });

  describe('hashIpAddress', () => {
    it('should hash IP address using SHA-256', () => {
      const ipAddress = '192.168.1.1';
      const hash1 = (service as any).hashIpAddress(ipAddress);
      const hash2 = (service as any).hashIpAddress(ipAddress);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(ipAddress);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 char hex string
    });
  });
});

