import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { OrderStatus, OrderType, UserRole } from '@prisma/client';

describe('Orders E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let clientToken: string;
  let contractorToken: string;
  let clientId: string;
  let contractorId: string;
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

    prismaService = app.get<PrismaService>(PrismaService);

    // Create test category
    const category = await prismaService.category.create({
      data: {
        name: 'Test Plumbing',
        slug: 'test-plumbing-e2e',
        isActive: true,
      },
    });
    categoryId = category.id;

    // Register and login test users
    const clientRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'client-test@test.com',
        password: 'TestPassword123!',
        name: 'Test Client',
      });

    clientId = clientRes.body.userId;

    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'client-test@test.com',
        password: 'TestPassword123!',
      });

    clientToken = clientLogin.body.accessToken;

    const contractorRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contractor-test@test.com',
        password: 'TestPassword123!',
        name: 'Test Contractor',
      });

    contractorId = contractorRes.body.userId;

    // Add CONTRACTOR role
    await prismaService.user.update({
      where: { id: contractorId },
      data: {
        roles: [UserRole.CLIENT, UserRole.CONTRACTOR],
      },
    });

    // Create contractor profile
    await prismaService.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor bio',
        hourlyRate: 50,
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contractor-test@test.com',
        password: 'TestPassword123!',
      });

    contractorToken = contractorLogin.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.proposal.deleteMany({});
    await prismaService.order.deleteMany({});
    await prismaService.contractor.deleteMany({});
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['client-test@test.com', 'contractor-test@test.com'],
        },
      },
    });
    await prismaService.category.deleteMany({
      where: { slug: 'test-plumbing-e2e' },
    });

    await app.close();
  });

  describe('POST /orders', () => {
    it('should create order in draft status', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Test Order Title',
          description: 'Test order description with more details',
          type: OrderType.PUBLIC,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          budget: 300,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(OrderStatus.DRAFT);
          expect(res.body.title).toBe('Test Order Title');
          expect(res.body.clientId).toBe(clientId);
        });
    });

    it('should reject order creation with invalid data', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Short', // Too short (min 10 chars)
          description: 'Too short', // Too short (min 20 chars)
        })
        .expect(400);
    });
  });

  describe('GET /orders/search', () => {
    it('should search orders publicly (no auth)', () => {
      return request(app.getHttpServer())
        .get('/orders/search')
        .query({ status: OrderStatus.PUBLISHED })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter orders by category', () => {
      return request(app.getHttpServer())
        .get('/orders/search')
        .query({ categoryId, status: OrderStatus.PUBLISHED })
        .expect(200);
    });
  });

  describe('POST /orders/:id/publish', () => {
    let draftOrderId: string;

    beforeEach(async () => {
      const order = await prismaService.order.create({
        data: {
          title: 'Draft Order to Publish',
          description: 'This is a draft order that will be published',
          type: OrderType.PUBLIC,
          status: OrderStatus.DRAFT,
          clientId,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          images: [],
        },
      });
      draftOrderId = order.id;
    });

    it('should publish draft order', () => {
      return request(app.getHttpServer())
        .post(`/orders/${draftOrderId}/publish`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(OrderStatus.PUBLISHED);
          expect(res.body.publishedAt).toBeDefined();
        });
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should return orders for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/orders/my-orders').expect(401);
    });
  });

  describe('GET /orders/:id (Get Order by ID)', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const order = await prismaService.order.create({
        data: {
          title: 'Test Order for Get by ID',
          description: 'This order will be retrieved by ID',
          type: OrderType.PUBLIC,
          status: OrderStatus.PUBLISHED,
          clientId,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          images: [],
          publishedAt: new Date(),
        },
      });
      testOrderId = order.id;
    });

    it('should get order by ID', () => {
      return request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testOrderId);
          expect(res.body.title).toBe('Test Order for Get by ID');
          expect(res.body.clientId).toBe(clientId);
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/orders/non-existent-order-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .expect(401);
    });
  });

  describe('PATCH /orders/:id (Update Order)', () => {
    let draftOrderId: string;

    beforeEach(async () => {
      const order = await prismaService.order.create({
        data: {
          title: 'Draft Order to Update',
          description: 'This order will be updated',
          type: OrderType.PUBLIC,
          status: OrderStatus.DRAFT,
          clientId,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          budget: 200,
          images: [],
        },
      });
      draftOrderId = order.id;
    });

    it('should update draft order', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${draftOrderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Updated Order Title',
          description: 'Updated description with more details about the job',
          budget: 350,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Order Title');
          expect(res.body.budget).toBe(350);
        });
    });

    it('should return 403 when trying to update published order', async () => {
      await prismaService.order.update({
        where: { id: draftOrderId },
        data: { status: OrderStatus.PUBLISHED },
      });

      return request(app.getHttpServer())
        .patch(`/orders/${draftOrderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Should not update published order',
        })
        .expect(403);
    });

    it('should return 403 when non-owner tries to update', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${draftOrderId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Unauthorized update',
        })
        .expect(403);
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .patch('/orders/non-existent-order-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Test',
        })
        .expect(404);
    });
  });

  describe('DELETE /orders/:id (Delete Order)', () => {
    let draftOrderId: string;

    beforeEach(async () => {
      const order = await prismaService.order.create({
        data: {
          title: 'Draft Order to Delete',
          description: 'This order will be deleted',
          type: OrderType.PUBLIC,
          status: OrderStatus.DRAFT,
          clientId,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          images: [],
        },
      });
      draftOrderId = order.id;
    });

    it('should delete draft order', () => {
      return request(app.getHttpServer())
        .delete(`/orders/${draftOrderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('deleted');
        });
    });

    it('should return 403 when trying to delete published order', async () => {
      await prismaService.order.update({
        where: { id: draftOrderId },
        data: { status: OrderStatus.PUBLISHED },
      });

      return request(app.getHttpServer())
        .delete(`/orders/${draftOrderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      return request(app.getHttpServer())
        .delete(`/orders/${draftOrderId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .delete('/orders/non-existent-order-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/status (Update Order Status)', () => {
    let inProgressOrderId: string;

    beforeEach(async () => {
      const order = await prismaService.order.create({
        data: {
          title: 'Order for Status Update',
          description: 'This order status will be updated',
          type: OrderType.PUBLIC,
          status: OrderStatus.IN_PROGRESS,
          clientId,
          contractorId,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          images: [],
        },
      });
      inProgressOrderId = order.id;
    });

    it('should mark order as completed by contractor', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${inProgressOrderId}/status`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          status: OrderStatus.COMPLETED,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(OrderStatus.COMPLETED);
          expect(res.body.completedAt).toBeDefined();
        });
    });

    it('should allow client to cancel order', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${inProgressOrderId}/status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          status: OrderStatus.CANCELLED,
          cancellationReason: 'No longer needed',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(OrderStatus.CANCELLED);
        });
    });

    it('should return 400 for invalid status transition', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${inProgressOrderId}/status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          status: OrderStatus.DRAFT, // Cannot go back to DRAFT
        })
        .expect(400);
    });

    it('should return 403 for unauthorized status update', async () => {
      // Create another client
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'other-client@test.com',
          password: 'TestPass123!',
          name: 'Other Client',
        });

      const otherClientLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'other-client@test.com',
          password: 'TestPass123!',
        });

      return request(app.getHttpServer())
        .patch(`/orders/${inProgressOrderId}/status`)
        .set('Authorization', `Bearer ${otherClientLogin.body.accessToken}`)
        .send({
          status: OrderStatus.COMPLETED,
        })
        .expect(403);
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .patch('/orders/non-existent-order-id/status')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          status: OrderStatus.COMPLETED,
        })
        .expect(404);
    });
  });

  describe('Complete Order Lifecycle', () => {
    it('should complete full order lifecycle: DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED', async () => {
      // Step 1: Create draft order
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Full Lifecycle Test Order',
          description: 'This order will go through complete lifecycle',
          type: OrderType.PUBLIC,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          budget: 500,
        })
        .expect(201);

      const orderId = createRes.body.id;
      expect(createRes.body.status).toBe(OrderStatus.DRAFT);

      // Step 2: Publish order
      const publishRes = await request(app.getHttpServer())
        .post(`/orders/${orderId}/publish`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(publishRes.body.status).toBe(OrderStatus.PUBLISHED);

      // Step 3: Contractor submits proposal
      const proposalRes = await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          proposedPrice: 450,
          message: 'I can complete this job',
          estimatedDays: 3,
        })
        .expect(201);

      // Step 4: Client accepts proposal (this moves order to IN_PROGRESS)
      await request(app.getHttpServer())
        .post(`/proposals/${proposalRes.body.id}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Verify order is IN_PROGRESS
      const inProgressRes = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(inProgressRes.body.status).toBe(OrderStatus.IN_PROGRESS);

      // Step 5: Contractor marks as completed
      const completedRes = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          status: OrderStatus.COMPLETED,
        })
        .expect(200);

      expect(completedRes.body.status).toBe(OrderStatus.COMPLETED);
      expect(completedRes.body.completedAt).toBeDefined();
    });
  });

  describe('Proposal Flow', () => {
    let publishedOrderId: string;

    beforeEach(async () => {
      const order = await prismaService.order.create({
        data: {
          title: 'Order for Proposal Test',
          description: 'This order will receive proposals from contractors',
          type: OrderType.PUBLIC,
          status: OrderStatus.PUBLISHED,
          clientId,
          categoryId,
          latitude: 43.6532,
          longitude: -79.3832,
          address: '123 Main St',
          city: 'Toronto',
          province: 'ON',
          postalCode: 'M5H 2N2',
          images: [],
          publishedAt: new Date(),
        },
      });
      publishedOrderId = order.id;
    });

    it('should allow contractor to submit proposal', () => {
      return request(app.getHttpServer())
        .post(`/orders/${publishedOrderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          proposedPrice: 350,
          message: 'I have 10 years of experience and can complete this job',
          estimatedDays: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.proposedPrice).toBe(350);
          expect(res.body.status).toBe('PENDING');
        });
    });

    it('should reject duplicate proposal from same contractor', async () => {
      // Create first proposal
      await prismaService.proposal.create({
        data: {
          orderId: publishedOrderId,
          contractorId,
          proposedPrice: 300,
          message: 'First proposal',
          status: 'PENDING',
        },
      });

      // Try to create second proposal
      return request(app.getHttpServer())
        .post(`/orders/${publishedOrderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          proposedPrice: 400,
          message: 'Second proposal (should fail)',
        })
        .expect(409); // Conflict
    });
  });
});

