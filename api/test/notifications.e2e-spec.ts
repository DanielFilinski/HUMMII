import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { NotificationType, NotificationPriority, UserRole } from '@prisma/client';
import { createTestUser } from './helpers/test-db';

describe('Notifications E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: string;
  let notificationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.notification.deleteMany({});
    await prisma.notificationPreferences.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const user = await createTestUser(prisma, {
      email: 'user-notifications@test.com',
      password: 'TestPassword123!',
      name: 'Notifications User',
      isVerified: true,
      roles: [UserRole.CLIENT],
    });
    userId = user.id;

    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user-notifications@test.com',
        password: 'TestPassword123!',
      });
    userToken = userLogin.body.accessToken;

    // Create test notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: NotificationType.ORDER_STATUS_CHANGED,
        title: 'Order Status Updated',
        message: 'Your order status has been updated to COMPLETED',
        priority: NotificationPriority.MEDIUM,
        isRead: false,
      },
    });
    notificationId = notification.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.notification.deleteMany({});
    await prisma.notificationPreferences.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('/notifications (GET)', () => {
    it('should get user notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by read status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ isRead: false })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((notification: any) => {
        expect(notification.isRead).toBe(false);
      });
    });

    it('should filter by notification type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ type: NotificationType.ORDER_STATUS_CHANGED })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((notification: any) => {
        expect(notification.type).toBe(NotificationType.ORDER_STATUS_CHANGED);
      });
    });
  });

  describe('/notifications/unread-count (GET)', () => {
    it('should get unread notification count', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('/notifications/:id/read (PATCH)', () => {
    it('should mark notification as read', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isRead', true);

      // Verify in database
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });
      expect(notification?.isRead).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .patch(`/api/v1/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 403 for other user notification', async () => {
      const otherUser = await createTestUser(prisma, {
        email: 'other-notifications@test.com',
        password: 'TestPassword123!',
        name: 'Other User',
        isVerified: true,
      });

      const otherLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'other-notifications@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .expect(403);
    });
  });

  describe('/notifications/mark-all-read (POST)', () => {
    it('should mark all notifications as read', async () => {
      // Create some unread notifications
      await prisma.notification.createMany({
        data: [
          {
            userId,
            type: NotificationType.NEW_PROPOSAL,
            title: 'New Proposal',
            message: 'You have a new proposal',
            priority: NotificationPriority.MEDIUM,
            isRead: false,
          },
          {
            userId,
            type: NotificationType.NEW_MESSAGE,
            title: 'New Message',
            message: 'You have a new message',
            priority: NotificationPriority.HIGH,
            isRead: false,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/notifications/mark-all-read')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');

      // Verify all notifications are read
      const unreadCount = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
      expect(unreadCount).toBe(0);
    });
  });

  describe('/notifications/:id (DELETE)', () => {
    it('should delete notification', async () => {
      // Create a notification to delete
      const notification = await prisma.notification.create({
        data: {
          userId,
          type: NotificationType.NEW_REVIEW,
          title: 'New Review',
          message: 'You have a new review',
          priority: NotificationPriority.MEDIUM,
          isRead: false,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/notifications/${notification.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify notification is deleted
      const deletedNotification = await prisma.notification.findUnique({
        where: { id: notification.id },
      });
      expect(deletedNotification).toBeNull();
    });

    it('should return 403 for other user notification', async () => {
      const otherUser = await createTestUser(prisma, {
        email: 'other-delete@test.com',
        password: 'TestPassword123!',
        name: 'Other User',
        isVerified: true,
      });

      const otherNotification = await prisma.notification.create({
        data: {
          userId: otherUser.id,
          type: NotificationType.ORDER_STATUS_CHANGED,
          title: 'Other User Notification',
          message: 'Test',
          priority: NotificationPriority.MEDIUM,
          isRead: false,
        },
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/notifications/${otherNotification.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('/notifications (DELETE)', () => {
    it('should delete all notifications', async () => {
      // Create some notifications
      await prisma.notification.createMany({
        data: [
          {
            userId,
            type: NotificationType.NEW_PROPOSAL,
            title: 'Test 1',
            message: 'Test',
            priority: NotificationPriority.MEDIUM,
            isRead: false,
          },
          {
            userId,
            type: NotificationType.NEW_MESSAGE,
            title: 'Test 2',
            message: 'Test',
            priority: NotificationPriority.MEDIUM,
            isRead: false,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .delete('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');

      // Verify all notifications are deleted
      const count = await prisma.notification.count({
        where: { userId },
      });
      expect(count).toBe(0);
    });
  });

  describe('/notifications/preferences (GET)', () => {
    it('should get notification preferences', async () => {
      // Create preferences first
      await prisma.notificationPreferences.create({
        data: {
          userId,
          emailEnabled: true,
          pushEnabled: false,
          inAppEnabled: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('emailEnabled');
      expect(response.body).toHaveProperty('pushEnabled');
      expect(response.body).toHaveProperty('inAppEnabled');
    });
  });

  describe('/notifications/preferences (PATCH)', () => {
    it('should update notification preferences', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          emailEnabled: false,
          pushEnabled: true,
          inAppEnabled: true,
          emailOrderUpdates: false,
          pushOrderUpdates: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('emailEnabled', false);
      expect(response.body).toHaveProperty('pushEnabled', true);
      expect(response.body).toHaveProperty('inAppEnabled', true);
    });

    it('should not allow disabling security alerts', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          emailSecurity: false,
          pushSecurity: false,
        })
        .expect(200);

      // Security alerts should remain enabled
      expect(response.body).toHaveProperty('emailSecurity', true);
      expect(response.body).toHaveProperty('pushSecurity', true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on notifications', async () => {
      // Send 61 requests (limit is 60 per minute)
      const promises = [];
      for (let i = 0; i < 61; i++) {
        promises.push(
          request(app.getHttpServer())
            .get('/api/v1/notifications')
            .set('Authorization', `Bearer ${userToken}`),
        );
      }

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });
});

