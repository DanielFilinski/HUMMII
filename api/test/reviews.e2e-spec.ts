import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { OrderStatus, OrderType, UserRole } from '@prisma/client';
import { createTestUser } from './helpers/test-db';

describe('Reviews E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientToken: string;
  let contractorToken: string;
  let clientId: string;
  let contractorId: string;
  let orderId: string;
  let categoryId: string;
  let reviewId: string;

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
        slug: 'test-plumbing-reviews-e2e',
        isActive: true,
      },
    });
    categoryId = category.id;

    // Create client user
    const client = await createTestUser(prisma, {
      email: 'client-reviews@test.com',
      password: 'TestPassword123!',
      name: 'Reviews Client',
      isVerified: true,
      roles: [UserRole.CLIENT],
    });
    clientId = client.id;

    const clientLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'client-reviews@test.com',
        password: 'TestPassword123!',
      });
    clientToken = clientLogin.body.accessToken;

    // Create contractor user
    const contractor = await createTestUser(prisma, {
      email: 'contractor-reviews@test.com',
      password: 'TestPassword123!',
      name: 'Reviews Contractor',
      isVerified: true,
      roles: [UserRole.CONTRACTOR],
    });
    contractorId = contractor.id;

    // Create contractor profile
    await prisma.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor for reviews',
        hourlyRate: 50,
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'contractor-reviews@test.com',
        password: 'TestPassword123!',
      });
    contractorToken = contractorLogin.body.accessToken;

    // Create completed order (for review testing)
    const order = await prisma.order.create({
      data: {
        title: 'Test Order for Reviews',
        description: 'This is a test order for reviews E2E testing',
        type: OrderType.PUBLIC,
        status: OrderStatus.COMPLETED,
        categoryId,
        clientId,
        contractorId,
        latitude: 43.6532,
        longitude: -79.3832,
        budget: 500,
        completedAt: new Date(), // Completed today
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.review.deleteMany({});
    await prisma.proposal.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('/reviews (POST)', () => {
    it('should create review for completed order', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          criteriaRatings: {
            communication: 5,
            professionalism: 4,
            payment: 5,
          },
          comment: 'Great work! Very professional and on time.',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderId', orderId);
      expect(response.body).toHaveProperty('criteriaRatings');
      expect(response.body).toHaveProperty('comment');
      expect(response.body.reviewerId).toBe(clientId);

      reviewId = response.body.id;
    });

    it('should return 400 for non-completed order', async () => {
      // Create a draft order
      const draftOrder = await prisma.order.create({
        data: {
          title: 'Draft Order',
          description: 'Draft order for testing',
          type: OrderType.PUBLIC,
          status: OrderStatus.DRAFT,
          categoryId,
          clientId,
          latitude: 43.6532,
          longitude: -79.3832,
        },
      });

      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: draftOrder.id,
          criteriaRatings: {
            communication: 5,
            professionalism: 4,
            payment: 5,
          },
        })
        .expect(400);
    });

    it('should return 403 for non-participant', async () => {
      // Create another user who is not a participant
      const otherUser = await createTestUser(prisma, {
        email: 'other-reviews@test.com',
        password: 'TestPassword123!',
        name: 'Other User',
        isVerified: true,
      });

      const otherLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'other-reviews@test.com',
          password: 'TestPassword123!',
        });

      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
        .send({
          orderId,
          criteriaRatings: {
            communication: 5,
            professionalism: 4,
            payment: 5,
          },
        })
        .expect(403);
    });

    it('should return 400 for duplicate review', async () => {
      // Try to create another review for the same order
      await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          criteriaRatings: {
            communication: 5,
            professionalism: 4,
            payment: 5,
          },
        })
        .expect(400);
    });

    it('should enforce rate limiting', async () => {
      // Create multiple completed orders
      const orders = [];
      for (let i = 0; i < 6; i++) {
        const order = await prisma.order.create({
          data: {
            title: `Order ${i}`,
            description: `Test order ${i}`,
            type: OrderType.PUBLIC,
            status: OrderStatus.COMPLETED,
            categoryId,
            clientId,
            contractorId,
            latitude: 43.6532,
            longitude: -79.3832,
            completedAt: new Date(),
          },
        });
        orders.push(order);
      }

      // Try to create 6 reviews (limit is 5 per hour)
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/v1/reviews')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
              orderId: orders[i].id,
              criteriaRatings: {
                communication: 5,
                professionalism: 4,
                payment: 5,
              },
            }),
        );
      }

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('/reviews/user/:userId (GET)', () => {
    it('should get reviews for a user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reviews/user/${contractorId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reviews/user/${contractorId}`)
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/reviews/:id (GET)', () => {
    it('should get review by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', reviewId);
      expect(response.body).toHaveProperty('orderId', orderId);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/api/v1/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('/reviews/:id (PATCH)', () => {
    it('should update review before moderation', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          comment: 'Updated comment: Excellent work!',
        })
        .expect(200);

      expect(response.body.comment).toBe('Updated comment: Excellent work!');
    });

    it('should return 403 for updating other user review', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          comment: 'Trying to update client review',
        })
        .expect(403);
    });
  });

  describe('/reviews/:id (DELETE)', () => {
    it('should soft delete review', async () => {
      // Create a review for deletion test
      const deleteOrder = await prisma.order.create({
        data: {
          title: 'Order for Deletion',
          description: 'Test order',
          type: OrderType.PUBLIC,
          status: OrderStatus.COMPLETED,
          categoryId,
          clientId,
          contractorId,
          latitude: 43.6532,
          longitude: -79.3832,
          completedAt: new Date(),
        },
      });

      const deleteReview = await request(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId: deleteOrder.id,
          criteriaRatings: {
            communication: 5,
            professionalism: 4,
            payment: 5,
          },
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/reviews/${deleteReview.body.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Review should still exist but be soft deleted
      const deletedReview = await prisma.review.findUnique({
        where: { id: deleteReview.body.id },
      });
      expect(deletedReview?.isVisible).toBe(false);
    });
  });

  describe('/reviews/:id/response (POST)', () => {
    it('should allow reviewee to respond to review', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          response: 'Thank you for the review! I appreciate your feedback.',
        })
        .expect(201);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain('Thank you');
    });

    it('should return 403 for non-reviewee', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          response: 'Trying to respond to own review',
        })
        .expect(403);
    });
  });

  describe('/reviews/:id/report (POST)', () => {
    it('should report review', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/reviews/${reviewId}/report`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          reason: 'SPAM',
          description: 'This review appears to be spam',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should enforce rate limiting on reports', async () => {
      // Create multiple reviews to report
      const orders = [];
      for (let i = 0; i < 11; i++) {
        const order = await prisma.order.create({
          data: {
            title: `Order ${i}`,
            description: `Test order ${i}`,
            type: OrderType.PUBLIC,
            status: OrderStatus.COMPLETED,
            categoryId,
            clientId,
            contractorId,
            latitude: 43.6532,
            longitude: -79.3832,
            completedAt: new Date(),
          },
        });
        orders.push(order);
      }

      // Create reviews for each order
      const reviewIds = [];
      for (const order of orders) {
        const review = await request(app.getHttpServer())
          .post('/api/v1/reviews')
          .set('Authorization', `Bearer ${clientToken}`)
          .send({
            orderId: order.id,
            criteriaRatings: {
              communication: 5,
              professionalism: 4,
              payment: 5,
            },
          })
          .expect(201);
        reviewIds.push(review.body.id);
      }

      // Try to report 11 reviews (limit is 10 per day)
      const promises = [];
      for (let i = 0; i < 11; i++) {
        promises.push(
          request(app.getHttpServer())
            .post(`/api/v1/reviews/${reviewIds[i]}/report`)
            .set('Authorization', `Bearer ${contractorToken}`)
            .send({
              reason: 'SPAM',
              description: 'Test report',
            }),
        );
      }

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('/reviews/stats/:userId (GET)', () => {
    it('should get rating statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/reviews/stats/${contractorId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('totalReviews');
      expect(response.body).toHaveProperty('ratingDistribution');
      expect(response.body).toHaveProperty('weightedScore');
    });

    it('should return 404 for user without reviews', async () => {
      const newUser = await createTestUser(prisma, {
        email: 'new-user@test.com',
        password: 'TestPassword123!',
        name: 'New User',
        isVerified: true,
      });

      await request(app.getHttpServer())
        .get(`/api/v1/reviews/stats/${newUser.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });
});

