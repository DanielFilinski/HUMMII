import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { SubscriptionTier, SubscriptionStatus, UserRole } from '@prisma/client';
import { createTestUser } from './helpers/test-db';

describe('Subscriptions E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contractorToken: string;
  let contractorId: string;
  let subscriptionId: string;

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
    await prisma.subscription.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create contractor user
    const contractor = await createTestUser(prisma, {
      email: 'contractor-sub@test.com',
      password: 'TestPassword123!',
      name: 'Sub Contractor',
      isVerified: true,
      roles: [UserRole.CONTRACTOR],
    });
    contractorId = contractor.id;

    // Create contractor profile
    await prisma.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor for subscriptions',
        hourlyRate: 50,
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'contractor-sub@test.com',
        password: 'TestPassword123!',
      });
    contractorToken = contractorLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.subscription.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('/subscriptions (POST)', () => {
    it('should create subscription for contractor', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          tier: SubscriptionTier.STANDARD,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('tier', SubscriptionTier.STANDARD);
      expect(response.body).toHaveProperty('status');
      expect(response.body.contractorId).toBe(contractorId);

      subscriptionId = response.body.id;
    });

    it('should return 403 for non-contractor', async () => {
      const client = await createTestUser(prisma, {
        email: 'client-sub@test.com',
        password: 'TestPassword123!',
        name: 'Client User',
        isVerified: true,
        roles: [UserRole.CLIENT],
      });

      const clientLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'client-sub@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${clientLogin.body.accessToken}`)
        .send({
          tier: SubscriptionTier.STANDARD,
        })
        .expect(403);
    });

    it('should enforce rate limiting', async () => {
      // Try to create 6 subscriptions (limit is 5 per hour)
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/v1/subscriptions')
            .set('Authorization', `Bearer ${contractorToken}`)
            .send({
              tier: SubscriptionTier.STANDARD,
            }),
        );
      }

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('/subscriptions/me (GET)', () => {
    it('should get current subscription', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('tier');
      expect(response.body).toHaveProperty('status');
      expect(response.body.contractorId).toBe(contractorId);
    });

    it('should return 404 if no subscription exists', async () => {
      // Create contractor without subscription
      const newContractor = await createTestUser(prisma, {
        email: 'new-contractor@test.com',
        password: 'TestPassword123!',
        name: 'New Contractor',
        isVerified: true,
        roles: [UserRole.CONTRACTOR],
      });

      await prisma.contractor.create({
        data: {
          userId: newContractor.id,
          bio: 'New contractor',
          hourlyRate: 50,
        },
      });

      const newLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'new-contractor@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .get('/api/v1/subscriptions/me')
        .set('Authorization', `Bearer ${newLogin.body.accessToken}`)
        .expect(404);
    });
  });

  describe('/subscriptions/upgrade (PATCH)', () => {
    it('should upgrade subscription tier', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          tier: SubscriptionTier.PROFESSIONAL,
        })
        .expect(200);

      expect(response.body).toHaveProperty('tier', SubscriptionTier.PROFESSIONAL);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 400 for invalid upgrade', async () => {
      // Try to upgrade to same tier
      await request(app.getHttpServer())
        .patch('/api/v1/subscriptions/upgrade')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          tier: SubscriptionTier.PROFESSIONAL,
        })
        .expect(400);
    });
  });

  describe('/subscriptions/downgrade (PATCH)', () => {
    it('should downgrade subscription tier', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/subscriptions/downgrade')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          tier: SubscriptionTier.STANDARD,
        })
        .expect(200);

      expect(response.body).toHaveProperty('tier', SubscriptionTier.STANDARD);
    });
  });

  describe('/subscriptions (DELETE)', () => {
    it('should cancel subscription', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          immediate: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should enforce rate limiting', async () => {
      // Try to cancel multiple times (limit is 5 per hour)
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app.getHttpServer())
            .delete('/api/v1/subscriptions')
            .set('Authorization', `Bearer ${contractorToken}`)
            .send({
              immediate: false,
            }),
        );
      }

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('/subscriptions/reactivate (POST)', () => {
    it('should reactivate canceled subscription', async () => {
      // First cancel subscription
      await request(app.getHttpServer())
        .delete('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          immediate: false,
        })
        .expect(200);

      // Then reactivate
      const response = await request(app.getHttpServer())
        .post('/api/v1/subscriptions/reactivate')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('/subscriptions/portal (POST)', () => {
    it('should create Customer Portal session', async () => {
      // Ensure subscription exists
      await request(app.getHttpServer())
        .post('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          tier: SubscriptionTier.STANDARD,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/subscriptions/portal')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          returnUrl: 'http://localhost:3000/subscriptions',
        })
        .expect(201);

      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('https://');
    });

    it('should return 404 if no subscription exists', async () => {
      const newContractor = await createTestUser(prisma, {
        email: 'portal-contractor@test.com',
        password: 'TestPassword123!',
        name: 'Portal Contractor',
        isVerified: true,
        roles: [UserRole.CONTRACTOR],
      });

      await prisma.contractor.create({
        data: {
          userId: newContractor.id,
          bio: 'Portal contractor',
          hourlyRate: 50,
        },
      });

      const newLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'portal-contractor@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .post('/api/v1/subscriptions/portal')
        .set('Authorization', `Bearer ${newLogin.body.accessToken}`)
        .send({
          returnUrl: 'http://localhost:3000/subscriptions',
        })
        .expect(404);
    });
  });
});

