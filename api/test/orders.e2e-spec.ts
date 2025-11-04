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

