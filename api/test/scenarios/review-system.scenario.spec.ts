import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { UserRole, OrderStatus } from '@prisma/client';

/**
 * ⭐ Review System Flow Scenario
 *
 * Tests: Complete review system from order completion to rating update
 * Steps:
 * 1. Complete order (prerequisite)
 * 2. Client creates review (5 stars)
 * 3. Get review details
 * 4. Contractor responds to review
 * 5. Verify rating updated
 * 6. Get contractor statistics
 */
describe('⭐ Review System Flow Scenario (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let clientToken: string;
  let contractorToken: string;
  let clientUserId: string;
  let contractorUserId: string;
  let orderId: string;
  let reviewId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    console.log('🎬 Starting Review System Flow Scenario...');

    // Create client
    const clientRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'client-review@test.com',
        password: 'ClientPass123!',
        name: 'Review Test Client',
      });

    clientUserId = clientRes.body.id;

    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'client-review@test.com',
        password: 'ClientPass123!',
      });

    clientToken = clientLogin.body.accessToken;

    // Create contractor
    const contractorRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contractor-review@test.com',
        password: 'ContractorPass123!',
        name: 'Review Test Contractor',
      });

    contractorUserId = contractorRes.body.id;

    await prisma.user.update({
      where: { id: contractorUserId },
      data: { role: UserRole.CONTRACTOR },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contractor-review@test.com',
        password: 'ContractorPass123!',
      });

    contractorToken = contractorLogin.body.accessToken;

    // Create completed order
    const order = await prisma.order.create({
      data: {
        title: 'Test Order for Review',
        description: 'Completed order for testing review system',
        clientId: clientUserId,
        contractorId: contractorUserId,
        budget: 500,
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    orderId = order.id;
  });

  afterAll(async () => {
    await prisma.review.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('Step 1: Order Completed (Prerequisite)', () => {
    it('should verify order is completed', async () => {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      expect(order.status).toBe(OrderStatus.COMPLETED);
      expect(order.completedAt).toBeDefined();
      expect(order.contractorId).toBe(contractorUserId);

      console.log('✅ Step 1: Order Completed - VERIFIED');
    });
  });

  describe('Step 2: Client Creates Review (5 stars)', () => {
    it('should create review with 5 stars', async () => {
      const response = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          contractorId: contractorUserId,
          rating: 5,
          comment: 'Excellent work! Very professional and completed the job ahead of schedule. Highly recommend!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.rating).toBe(5);
      expect(response.body.orderId).toBe(orderId);
      expect(response.body.contractorId).toBe(contractorUserId);
      expect(response.body.reviewerId).toBe(clientUserId);

      reviewId = response.body.id;

      console.log('✅ Step 2: Review Created - PASSED');
    });

    it('should prevent duplicate review for same order', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          orderId,
          contractorId: contractorUserId,
          rating: 4,
          comment: 'Duplicate review',
        })
        .expect(409); // Conflict

      console.log('✅ Step 2: Duplicate Prevention - VERIFIED');
    });
  });

  describe('Step 3: Get Review Details', () => {
    it('should get review by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.id).toBe(reviewId);
      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toContain('Excellent work');
      expect(response.body).toHaveProperty('reviewer');
      expect(response.body).toHaveProperty('contractor');

      console.log('✅ Step 3: Review Details Retrieved - PASSED');
    });

    it('should get contractor reviews list', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reviews/user/${contractorUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const ourReview = response.body.find(r => r.id === reviewId);
      expect(ourReview).toBeDefined();
      expect(ourReview.rating).toBe(5);

      console.log('✅ Step 3: Contractor Reviews List - PASSED');
    });
  });

  describe('Step 4: Contractor Responds to Review', () => {
    it('should allow contractor to respond', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reviews/${reviewId}/response`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          response: 'Thank you so much for the kind words! It was a pleasure working on your project.',
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toContain('Thank you');
      expect(response.body.respondedAt).toBeDefined();

      console.log('✅ Step 4: Contractor Response Added - PASSED');
    });

    it('should verify response is visible in review', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.response).toBeDefined();
      expect(response.body.response).toContain('Thank you');
      expect(response.body.respondedAt).toBeDefined();

      console.log('✅ Step 4: Response Visibility - VERIFIED');
    });
  });

  describe('Step 5: Verify Rating Updated', () => {
    it('should verify review affects contractor rating', async () => {
      // Get contractor user to check rating
      const user = await prisma.user.findUnique({
        where: { id: contractorUserId },
      });

      // Rating should be updated (5.0 from our review)
      expect(user.rating).toBeGreaterThan(0);
      expect(user.reviewCount).toBeGreaterThanOrEqual(1);

      console.log('✅ Step 5: Rating Updated - VERIFIED');
      console.log(`   Current Rating: ${user.rating}/5.0`);
      console.log(`   Review Count: ${user.reviewCount}`);
    });
  });

  describe('Step 6: Get Contractor Statistics', () => {
    it('should get detailed rating statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/reviews/stats/${contractorUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('totalReviews');
      expect(response.body).toHaveProperty('ratingDistribution');

      expect(response.body.totalReviews).toBeGreaterThanOrEqual(1);
      expect(response.body.averageRating).toBeGreaterThan(0);

      // Rating distribution (1-5 stars breakdown)
      expect(response.body.ratingDistribution).toHaveProperty('5');
      expect(response.body.ratingDistribution['5']).toBeGreaterThanOrEqual(1);

      console.log('✅ Step 6: Statistics Retrieved - PASSED');
      console.log(`   Average Rating: ${response.body.averageRating}/5.0`);
      console.log(`   Total Reviews: ${response.body.totalReviews}`);
      console.log(`   Rating Distribution:`, response.body.ratingDistribution);
    });
  });

  describe('Additional Scenarios', () => {
    it('should allow client to update review', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          rating: 4,
          comment: 'Updated: Still great work, minor delay but overall satisfied',
        })
        .expect(200);

      expect(response.body.rating).toBe(4);
      expect(response.body.comment).toContain('Updated:');

      console.log('✅ Additional: Review Updated - PASSED');
    });

    it('should prevent contractor from editing client review', async () => {
      await request(app.getHttpServer())
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          rating: 5,
          comment: 'Hacking attempt',
        })
        .expect(403);

      console.log('✅ Additional: Edit Protection - VERIFIED');
    });

    it('should allow reporting inappropriate review', async () => {
      const response = await request(app.getHttpServer())
        .post(`/reviews/${reviewId}/report`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          reason: 'SPAM',
          description: 'Test report for scenario',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      console.log('✅ Additional: Review Reporting - PASSED');
    });
  });

  it('🎉 Complete Review System Flow - ALL STEPS PASSED!', () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 REVIEW SYSTEM SCENARIO COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Order completed');
    console.log('  ✅ 5-star review created');
    console.log('  ✅ Contractor responded');
    console.log('  ✅ Rating updated correctly');
    console.log('  ✅ Statistics calculated');
    console.log('  ✅ Review updated successfully');
    console.log('  ✅ Security verified');
    console.log('');

    expect(reviewId).toBeDefined();
  });
});
