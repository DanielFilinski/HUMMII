import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * 📦 Order Lifecycle Scenario
 * 
 * Tests: Complete order flow from creation to completion
 * Steps:
 * 1. Setup: Create Client and Contractor users
 * 2. Login as Client
 * 3. Create Order (Draft)
 * 4. Publish Order
 * 5. Submit Proposal (as Contractor)
 * 6. Accept Proposal (as Client)
 * 7. Mark Order Complete
 */
describe('📦 Order Lifecycle Scenario (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  let clientEmail: string;
  let contractorEmail: string;
  const password = 'SecurePass123!';
  
  let clientId: string;
  let contractorId: string;
  let clientToken: string;
  let contractorToken: string;
  
  let orderId: string;
  let proposalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Generate unique test data
    const timestamp = Date.now();
    clientEmail = `client.${timestamp}@example.com`;
    contractorEmail = `contractor.${timestamp}@example.com`;
  });

  afterAll(async () => {
    // Cleanup
    if (orderId) {
      await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
    }
    if (clientId) {
      await prisma.user.delete({ where: { id: clientId } }).catch(() => {});
    }
    if (contractorId) {
      await prisma.user.delete({ where: { id: contractorId } }).catch(() => {});
    }
    await app.close();
  });

  describe('Setup: Create Test Users', () => {
    it('should create client user', async () => {
      console.log('🎬 Starting Order Lifecycle Scenario...');
      
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test Client',
          email: clientEmail,
          password: password,
          role: UserRole.CLIENT,
        })
        .expect(201);

      clientId = response.body.id;

      // Auto-verify for testing
      await prisma.user.update({
        where: { id: clientId },
        data: { isVerified: true, verificationToken: null },
      });

      console.log('✅ Setup: Client user created');
    });

    it('should create contractor user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test Contractor',
          email: contractorEmail,
          password: password,
          role: UserRole.CONTRACTOR,
        })
        .expect(201);

      contractorId = response.body.id;

      // Auto-verify for testing
      await prisma.user.update({
        where: { id: contractorId },
        data: { isVerified: true, verificationToken: null },
      });

      console.log('✅ Setup: Contractor user created');
    });
  });

  describe('Step 1: Login as Client', () => {
    it('should login client successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: clientEmail,
          password: password,
        })
        .expect(200);

      clientToken = response.body.accessToken;
      expect(clientToken).toBeDefined();

      console.log('✅ Step 1: Client Login - PASSED');
    });
  });

  describe('Step 2: Create Order (Draft)', () => {
    it('should create order in draft status', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Test Order - Plumbing Service',
          description: 'Need emergency plumbing repair',
          budget: 500,
          location: '123 Test St, Toronto, ON',
          deadline: '2025-12-31T23:59:59Z',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('DRAFT');

      orderId = response.body.id;

      console.log('✅ Step 2: Order Created - PASSED');
    });
  });

  describe('Step 3: Publish Order', () => {
    it('should publish order successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/publish`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.status).toBe('OPEN');

      console.log('✅ Step 3: Order Published - PASSED');
    });
  });

  describe('Step 4: Submit Proposal (as Contractor)', () => {
    it('should login contractor', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: contractorEmail,
          password: password,
        })
        .expect(200);

      contractorToken = response.body.accessToken;
    });

    it('should submit proposal successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          price: 450,
          description: 'I can complete this plumbing job within 2 days',
          estimatedDuration: 2,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      proposalId = response.body.id;

      console.log('✅ Step 4: Proposal Submitted - PASSED');
    });
  });

  describe('Step 5: Accept Proposal (as Client)', () => {
    it('should accept proposal successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.status).toBe('ACCEPTED');

      console.log('✅ Step 5: Proposal Accepted - PASSED');
    });
  });

  describe('Step 6: Mark Order Complete', () => {
    it('should complete order successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          status: 'COMPLETED',
        })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');

      console.log('✅ Step 6: Order Completed - PASSED');
      console.log('🎉 Order Lifecycle - ALL TESTS PASSED!');
    });
  });
});
