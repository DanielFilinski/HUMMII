import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { OrderStatus, OrderType, UserRole } from '@prisma/client';
import { createTestUser } from './helpers/test-db';

describe('Chat E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientToken: string;
  let contractorToken: string;
  let clientId: string;
  let contractorId: string;
  let orderId: string;
  let categoryId: string;

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
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Plumbing',
        nameEn: 'Test Plumbing',
        nameFr: 'Plomberie Test',
        slug: 'test-plumbing-chat-e2e',
        isActive: true,
      },
    });
    categoryId = category.id;

    // Create client user
    const client = await createTestUser(prisma, {
      email: 'client-chat@test.com',
      password: 'TestPassword123!',
      name: 'Chat Client',
      isVerified: true,
      roles: [UserRole.CLIENT],
    });
    clientId = client.id;

    const clientLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'client-chat@test.com',
        password: 'TestPassword123!',
      });
    clientToken = clientLogin.body.accessToken;

    // Create contractor user
    const contractor = await createTestUser(prisma, {
      email: 'contractor-chat@test.com',
      password: 'TestPassword123!',
      name: 'Chat Contractor',
      isVerified: true,
      roles: [UserRole.CONTRACTOR],
    });
    contractorId = contractor.id;

    // Create contractor profile
    await prisma.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor for chat',
        hourlyRate: 50,
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'contractor-chat@test.com',
        password: 'TestPassword123!',
      });
    contractorToken = contractorLogin.body.accessToken;

    // Create test order
    const order = await prisma.order.create({
      data: {
        title: 'Test Order for Chat',
        description: 'This is a test order for chat E2E testing',
        type: OrderType.PUBLIC,
        status: OrderStatus.PUBLISHED,
        categoryId,
        clientId,
        latitude: 43.6532,
        longitude: -79.3832,
        address: '123 Test Street',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5H 2N2',
        budget: 500,
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('/chat/:orderId/messages (GET)', () => {
    it('should get message history for order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 for non-participant', async () => {
      // Create another user who is not a participant
      const otherUser = await createTestUser(prisma, {
        email: 'other-user@test.com',
        password: 'TestPassword123!',
        name: 'Other User',
        isVerified: true,
      });

      const otherLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'other-user@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeOrderId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/api/v1/chat/${fakeOrderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/messages`)
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });
  });

  describe('/chat/:orderId/messages (POST)', () => {
    it('should send message successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          content: 'Hello, this is a test message!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('orderId', orderId);
      expect(response.body.content).toBe('Hello, this is a test message!');
    });

    it('should moderate message with phone number', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          content: 'Call me at 555-123-4567',
        })
        .expect(201);

      // Message should be moderated (phone number blocked)
      expect(response.body.content).not.toContain('555-123-4567');
      expect(response.body.isModerated).toBe(true);
    });

    it('should moderate message with email', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          content: 'Contact me at test@example.com',
        })
        .expect(201);

      // Message should be moderated (email blocked)
      expect(response.body.content).not.toContain('test@example.com');
      expect(response.body.isModerated).toBe(true);
    });

    it('should return 400 for invalid input', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          content: '', // Empty content
        })
        .expect(400);
    });

    it('should return 400 for content too long', async () => {
      const longContent = 'a'.repeat(2001); // Exceeds 2000 character limit
      await request(app.getHttpServer())
        .post(`/api/v1/chat/${orderId}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          content: longContent,
        })
        .expect(400);
    });
  });

  describe('/chat/:orderId/messages/:id (PATCH)', () => {
    let messageId: string;

    beforeEach(async () => {
      // Create a message for editing
      const message = await prisma.message.create({
        data: {
          content: 'Original message content',
          orderId,
          senderId: clientId,
          receiverId: contractorId,
          roomId: (
            await prisma.chatRoom.findFirst({
              where: { orderId },
            })
          )?.id || (
            await prisma.chatRoom.create({
              data: { orderId },
            })
          ).id,
        },
      });
      messageId = message.id;
    });

    it('should edit message within 5 minutes', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/chat/${orderId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          content: 'Updated message content',
        })
        .expect(200);

      expect(response.body.content).toBe('Updated message content');
      expect(response.body.isEdited).toBe(true);
    });

    it('should return 403 for editing other user message', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/chat/${orderId}/messages/${messageId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          content: 'Trying to edit client message',
        })
        .expect(403);
    });
  });

  describe('/chat/:orderId/mark-read (POST)', () => {
    let messageId: string;

    beforeEach(async () => {
      // Create a message for marking as read
      const chatRoom = await prisma.chatRoom.findFirst({
        where: { orderId },
      }) || await prisma.chatRoom.create({
        data: { orderId },
      });

      const message = await prisma.message.create({
        data: {
          content: 'Message to mark as read',
          orderId,
          senderId: contractorId,
          receiverId: clientId,
          roomId: chatRoom.id,
        },
      });
      messageId = message.id;
    });

    it('should mark messages as read', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/chat/${orderId}/mark-read`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          messageIds: [messageId],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('/chat/:orderId/unread-count (GET)', () => {
    it('should get unread message count', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/unread-count`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });
  });

  describe('/chat/my-chats (GET)', () => {
    it('should get user active chats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/chat/my-chats')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/chat/:orderId/export (GET)', () => {
    it('should export chat as PDF', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/export`)
        .query({ format: 'pdf' })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should export chat as TXT', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/export`)
        .query({ format: 'txt' })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
    });

    it('should return 403 for non-participant', async () => {
      const otherUser = await createTestUser(prisma, {
        email: 'other-export@test.com',
        password: 'TestPassword123!',
        name: 'Other User',
        isVerified: true,
      });

      const otherLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'other-export@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .get(`/api/v1/chat/${orderId}/export`)
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .expect(403);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on message sending', async () => {
      // Send 21 messages quickly (limit is 20 per minute)
      const promises = [];
      for (let i = 0; i < 21; i++) {
        promises.push(
          request(app.getHttpServer())
            .post(`/api/v1/chat/${orderId}/messages`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
              orderId,
              content: `Message ${i}`,
            }),
        );
      }

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];
      
      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });
});

