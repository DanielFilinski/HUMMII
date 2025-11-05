import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { OrderStatus, OrderType, UserRole } from '@prisma/client';
import { createTestUser } from '../helpers/test-db';

describe('Order Lifecycle Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientToken: string;
  let contractorToken: string;
  let clientId: string;
  let contractorId: string;
  let orderId: string;
  let proposalId: string;
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
    await prisma.review.deleteMany({});
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
        slug: 'test-plumbing-integration',
        isActive: true,
      },
    });
    categoryId = category.id;

    // Create client user
    const client = await createTestUser(prisma, {
      email: 'client-integration@test.com',
      password: 'TestPassword123!',
      name: 'Integration Client',
      isVerified: true,
      roles: [UserRole.CLIENT],
    });
    clientId = client.id;

    const clientLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'client-integration@test.com',
        password: 'TestPassword123!',
      });
    clientToken = clientLogin.body.accessToken;

    // Create contractor user
    const contractor = await createTestUser(prisma, {
      email: 'contractor-integration@test.com',
      password: 'TestPassword123!',
      name: 'Integration Contractor',
      isVerified: true,
      roles: [UserRole.CONTRACTOR],
    });
    contractorId = contractor.id;

    // Create contractor profile
    await prisma.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor for integration',
        hourlyRate: 50,
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'contractor-integration@test.com',
        password: 'TestPassword123!',
      });
    contractorToken = contractorLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.review.deleteMany({});
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

  it('Complete order lifecycle: Create → Publish → Propose → Accept → Chat → Complete → Review', async () => {
    // Step 1: Client creates order (DRAFT)
    const createOrderResponse = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Integration Test Order',
        description: 'This is a test order for integration testing',
        type: OrderType.PUBLIC,
        categoryId,
        latitude: 43.6532,
        longitude: -79.3832,
        budget: 500,
      })
      .expect(201);

    expect(createOrderResponse.body).toHaveProperty('id');
    expect(createOrderResponse.body.status).toBe(OrderStatus.DRAFT);
    orderId = createOrderResponse.body.id;

    // Step 2: Client publishes order
    const publishResponse = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/publish`)
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(publishResponse.body.status).toBe(OrderStatus.PUBLISHED);

    // Step 3: Contractor submits proposal
    const proposalResponse = await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/proposals`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        proposedPrice: 450,
        message: 'I can complete this work within 2 days',
        estimatedDays: 2,
      })
      .expect(201);

    expect(proposalResponse.body).toHaveProperty('id');
    proposalId = proposalResponse.body.id;

    // Step 4: Client accepts proposal
    const acceptResponse = await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/accept`)
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(acceptResponse.body.status).toBe(OrderStatus.IN_PROGRESS);

    // Step 5: Chat room should be activated (messages can be sent)
    const chatMessagesResponse = await request(app.getHttpServer())
      .get(`/api/v1/chat/${orderId}/messages`)
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(chatMessagesResponse.body).toHaveProperty('success', true);

    // Step 6: Client sends message
    const sendMessageResponse = await request(app.getHttpServer())
      .post(`/api/v1/chat/${orderId}/messages`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        orderId,
        content: 'Hello! When can you start?',
      })
      .expect(201);

    expect(sendMessageResponse.body).toHaveProperty('data');
    expect(sendMessageResponse.body.data.content).toBe('Hello! When can you start?');

    // Step 7: Contractor responds
    const contractorMessageResponse = await request(app.getHttpServer())
      .post(`/api/v1/chat/${orderId}/messages`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        orderId,
        content: 'I can start tomorrow morning',
      })
      .expect(201);

    expect(contractorMessageResponse.body).toHaveProperty('data');

    // Step 8: Contractor marks order as completed
    const completeResponse = await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        status: OrderStatus.PENDING_REVIEW,
      })
      .expect(200);

    expect(completeResponse.body.status).toBe(OrderStatus.PENDING_REVIEW);

    // Step 9: Client completes review and marks order as completed
    const clientCompleteResponse = await request(app.getHttpServer())
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        status: OrderStatus.COMPLETED,
      })
      .expect(200);

    expect(clientCompleteResponse.body.status).toBe(OrderStatus.COMPLETED);

    // Step 10: Both parties create reviews
    const clientReviewResponse = await request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        orderId,
        criteriaRatings: {
          communication: 5,
          professionalism: 4,
          payment: 5,
        },
        comment: 'Great work! Very professional.',
      })
      .expect(201);

    expect(clientReviewResponse.body).toHaveProperty('id');

    const contractorReviewResponse = await request(app.getHttpServer())
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        orderId,
        criteriaRatings: {
          quality: 5,
          professionalism: 5,
          communication: 5,
          value: 4,
        },
        comment: 'Great client, clear communication!',
      })
      .expect(201);

    expect(contractorReviewResponse.body).toHaveProperty('id');

    // Step 11: Verify all data is linked correctly
    const finalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        proposals: true,
        reviews: true,
        chatRoom: {
          include: {
            messages: true,
          },
        },
      },
    });

    expect(finalOrder?.status).toBe(OrderStatus.COMPLETED);
    expect(finalOrder?.proposals.length).toBeGreaterThan(0);
    expect(finalOrder?.reviews.length).toBe(2);
    expect(finalOrder?.chatRoom).toBeTruthy();
    expect(finalOrder?.chatRoom?.messages.length).toBeGreaterThan(0);
  });
});

