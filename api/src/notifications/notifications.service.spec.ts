import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType, NotificationPriority, NotificationChannel } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let gateway: NotificationsGateway;
  let notificationQueue: Queue;

  const mockPrismaService = {
    notificationPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockGateway = {
    sendToUser: jest.fn(),
    updateUnreadCount: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsGateway, useValue: mockGateway },
        {
          provide: 'BullQueue_notifications',
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
    notificationQueue = module.get<Queue>('BullQueue_notifications');

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create notification successfully', async () => {
      const dto = {
        title: 'Test Notification',
        body: 'Test body',
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(null);
      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notification-1',
        userId: 'user-1',
        type: NotificationType.ORDER_STATUS_CHANGED,
        priority: NotificationPriority.MEDIUM,
        ...dto,
        channels: [NotificationChannel.IN_APP],
        isRead: false,
        createdAt: new Date(),
      });

      mockPrismaService.notification.count.mockResolvedValue(1);

      const result = await service.create('user-1', NotificationType.ORDER_STATUS_CHANGED, dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });

    it('should send via WebSocket if in-app enabled', async () => {
      const dto = {
        title: 'Test Notification',
        body: 'Test body',
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue({
        inAppEnabled: true,
      });
      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notification-1',
        userId: 'user-1',
        type: NotificationType.ORDER_STATUS_CHANGED,
        priority: NotificationPriority.MEDIUM,
        ...dto,
        channels: [NotificationChannel.IN_APP],
        isRead: false,
      });
      mockPrismaService.notification.count.mockResolvedValue(1);

      await service.create('user-1', NotificationType.ORDER_STATUS_CHANGED, dto);

      expect(mockGateway.sendToUser).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockPrismaService.notification.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(5);
      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isRead: false,
        },
      });
    });
  });
});

