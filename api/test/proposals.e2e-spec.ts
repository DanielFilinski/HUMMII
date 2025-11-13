import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { UserRole, OrderStatus, ProposalStatus } from '@prisma/client';

describe('Proposals (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientToken: string;
  let contractorToken: string;
  let contractor2Token: string;
  let clientUserId: string;
  let contractorUserId: string;
  let contractor2UserId: string;
  let orderId: string;
  let proposalId: string;
  let proposal2Id: string;

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

    // Clean up database before tests
    await prisma.proposal.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create client user
    const clientRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'client@test.com',
        password: 'ClientPass123!',
        name: 'Test Client',
      });

    clientUserId = clientRes.body.id;

    // Set client role
    await prisma.user.update({
      where: { id: clientUserId },
      data: { role: UserRole.CLIENT },
    });

    // Login client
    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'client@test.com',
        password: 'ClientPass123!',
      });

    clientToken = clientLogin.body.accessToken;

    // Create contractor user 1
    const contractorRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contractor@test.com',
        password: 'ContractorPass123!',
        name: 'Test Contractor',
      });

    contractorUserId = contractorRes.body.id;

    // Set contractor role
    await prisma.user.update({
      where: { id: contractorUserId },
      data: { role: UserRole.CONTRACTOR },
    });

    // Login contractor
    const contractorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contractor@test.com',
        password: 'ContractorPass123!',
      });

    contractorToken = contractorLogin.body.accessToken;

    // Create contractor user 2
    const contractor2Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contractor2@test.com',
        password: 'Contractor2Pass123!',
        name: 'Test Contractor 2',
      });

    contractor2UserId = contractor2Res.body.id;

    // Set contractor role
    await prisma.user.update({
      where: { id: contractor2UserId },
      data: { role: UserRole.CONTRACTOR },
    });

    // Login contractor 2
    const contractor2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contractor2@test.com',
        password: 'Contractor2Pass123!',
      });

    contractor2Token = contractor2Login.body.accessToken;

    // Create a published order for testing proposals
    const order = await prisma.order.create({
      data: {
        title: 'Need Plumbing Repair',
        description: 'Fix bathroom sink leak',
        clientId: clientUserId,
        budget: 200,
        status: OrderStatus.PUBLISHED,
      },
    });

    orderId = order.id;
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.proposal.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /orders/:orderId/proposals (Submit Proposal)', () => {
    it('should submit proposal as contractor', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'I can fix your sink quickly and professionally',
          price: 150,
          estimatedDays: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.orderId).toBe(orderId);
      expect(response.body.contractorId).toBe(contractorUserId);
      expect(response.body.price).toBe(150);
      expect(response.body.estimatedDays).toBe(1);
      expect(response.body.status).toBe(ProposalStatus.PENDING);

      proposalId = response.body.id;
    });

    it('should submit second proposal from different contractor', async () => {
      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractor2Token}`)
        .send({
          message: 'I have 15 years experience with plumbing',
          price: 180,
          estimatedDays: 2,
        })
        .expect(201);

      expect(response.body.contractorId).toBe(contractor2UserId);
      expect(response.body.price).toBe(180);

      proposal2Id = response.body.id;
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Test',
          price: -50, // Invalid: negative price
          estimatedDays: 1,
        })
        .expect(400);
    });

    it('should return 403 for client trying to submit proposal', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          message: 'Test',
          price: 100,
          estimatedDays: 1,
        })
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .send({
          message: 'Test',
          price: 100,
          estimatedDays: 1,
        })
        .expect(401);
    });

    it('should return 409 for duplicate proposal from same contractor', async () => {
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Another proposal',
          price: 200,
          estimatedDays: 3,
        })
        .expect(409);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .post('/orders/non-existent-order-id/proposals')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Test',
          price: 100,
          estimatedDays: 1,
        })
        .expect(404);
    });

    it('should return 400 for draft order (not published)', async () => {
      // Create draft order
      const draftOrder = await prisma.order.create({
        data: {
          title: 'Draft Order',
          description: 'Test',
          clientId: clientUserId,
          budget: 100,
          status: OrderStatus.DRAFT,
        },
      });

      await request(app.getHttpServer())
        .post(`/orders/${draftOrder.id}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Proposal for draft',
          price: 100,
          estimatedDays: 1,
        })
        .expect(400);

      // Cleanup
      await prisma.order.delete({ where: { id: draftOrder.id } });
    });
  });

  describe('GET /orders/:orderId/proposals (Get Proposals for Order)', () => {
    it('should get proposals as order client', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Two proposals submitted

      // Should include both proposals
      const proposal1 = response.body.find((p) => p.id === proposalId);
      const proposal2 = response.body.find((p) => p.id === proposal2Id);

      expect(proposal1).toBeDefined();
      expect(proposal2).toBeDefined();
      expect(proposal1.price).toBe(150);
      expect(proposal2.price).toBe(180);
    });

    it('should return 403 for contractor trying to view proposals', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(403);
    });

    it('should return 403 for different client', async () => {
      // Create another client
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'client2@test.com',
          password: 'Client2Pass123!',
          name: 'Client 2',
        });

      const client2Login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'client2@test.com',
          password: 'Client2Pass123!',
        });

      // Try to view proposals for order that doesn't belong to them
      await request(app.getHttpServer())
        .get(`/orders/${orderId}/proposals`)
        .set('Authorization', `Bearer ${client2Login.body.accessToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/non-existent-order-id/proposals')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${orderId}/proposals`)
        .expect(401);
    });
  });

  describe('GET /proposals/my-proposals (Get My Proposals)', () => {
    it('should get contractor own proposals', async () => {
      const response = await request(app.getHttpServer())
        .get('/proposals/my-proposals')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      // Should include contractor's proposal
      const myProposal = response.body.find((p) => p.id === proposalId);
      expect(myProposal).toBeDefined();
      expect(myProposal.contractorId).toBe(contractorUserId);

      // Should NOT include other contractors' proposals
      const otherProposal = response.body.find((p) => p.id === proposal2Id);
      expect(otherProposal).toBeUndefined();
    });

    it('should return empty array for contractor with no proposals', async () => {
      // Create new contractor
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'contractor3@test.com',
          password: 'Pass123!',
          name: 'Contractor 3',
        });

      await prisma.user.update({
        where: { email: 'contractor3@test.com' },
        data: { role: UserRole.CONTRACTOR },
      });

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'contractor3@test.com',
          password: 'Pass123!',
        });

      const response = await request(app.getHttpServer())
        .get('/proposals/my-proposals')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 403 for non-contractor role', async () => {
      await request(app.getHttpServer())
        .get('/proposals/my-proposals')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/proposals/my-proposals')
        .expect(401);
    });
  });

  describe('PATCH /proposals/:id (Update Proposal)', () => {
    it('should update proposal as owner', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Updated message: I can start immediately!',
          price: 140, // Reduced price
          estimatedDays: 1,
        })
        .expect(200);

      expect(response.body.message).toBe('Updated message: I can start immediately!');
      expect(response.body.price).toBe(140);
      expect(response.body.estimatedDays).toBe(1);
    });

    it('should return 403 for different contractor trying to update', async () => {
      await request(app.getHttpServer())
        .patch(`/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${contractor2Token}`)
        .send({
          message: 'Hacked!',
          price: 1,
        })
        .expect(403);
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .patch(`/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          price: -100, // Invalid
        })
        .expect(400);
    });

    it('should return 404 for non-existent proposal', async () => {
      await request(app.getHttpServer())
        .patch('/proposals/non-existent-proposal-id')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Test',
        })
        .expect(404);
    });

    it('should return 403 for client trying to update', async () => {
      await request(app.getHttpServer())
        .patch(`/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          message: 'Client trying to edit',
        })
        .expect(403);
    });
  });

  describe('POST /proposals/:id/accept (Accept Proposal)', () => {
    it('should accept proposal as client', async () => {
      const response = await request(app.getHttpServer())
        .post(`/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('accepted');

      // Verify proposal status
      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });
      expect(proposal.status).toBe(ProposalStatus.ACCEPTED);

      // Verify order was updated
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });
      expect(order.contractorId).toBe(contractorUserId);
      expect(order.status).toBe(OrderStatus.IN_PROGRESS);

      // Verify other proposals were rejected
      const otherProposal = await prisma.proposal.findUnique({
        where: { id: proposal2Id },
      });
      expect(otherProposal.status).toBe(ProposalStatus.REJECTED);
    });

    it('should return 400 for already accepted proposal', async () => {
      await request(app.getHttpServer())
        .post(`/proposals/${proposalId}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });

    it('should return 403 for contractor trying to accept', async () => {
      // Create new order for testing
      const newOrder = await prisma.order.create({
        data: {
          title: 'Test Order',
          description: 'Test',
          clientId: clientUserId,
          budget: 100,
          status: OrderStatus.PUBLISHED,
        },
      });

      const newProposal = await prisma.proposal.create({
        data: {
          orderId: newOrder.id,
          contractorId: contractorUserId,
          message: 'Test',
          price: 100,
          estimatedDays: 1,
          status: ProposalStatus.PENDING,
        },
      });

      await request(app.getHttpServer())
        .post(`/proposals/${newProposal.id}/accept`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(403);

      // Cleanup
      await prisma.proposal.delete({ where: { id: newProposal.id } });
      await prisma.order.delete({ where: { id: newOrder.id } });
    });

    it('should return 404 for non-existent proposal', async () => {
      await request(app.getHttpServer())
        .post('/proposals/non-existent-id/accept')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('POST /proposals/:id/reject (Reject Proposal)', () => {
    it('should reject proposal as client', async () => {
      // Create new order and proposal for testing rejection
      const newOrder = await prisma.order.create({
        data: {
          title: 'Test Order for Rejection',
          description: 'Test',
          clientId: clientUserId,
          budget: 100,
          status: OrderStatus.PUBLISHED,
        },
      });

      const newProposal = await prisma.proposal.create({
        data: {
          orderId: newOrder.id,
          contractorId: contractor2UserId,
          message: 'Test proposal',
          price: 100,
          estimatedDays: 1,
          status: ProposalStatus.PENDING,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/proposals/${newProposal.id}/reject`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('rejected');

      // Verify proposal status
      const proposal = await prisma.proposal.findUnique({
        where: { id: newProposal.id },
      });
      expect(proposal.status).toBe(ProposalStatus.REJECTED);

      // Cleanup
      await prisma.proposal.delete({ where: { id: newProposal.id } });
      await prisma.order.delete({ where: { id: newOrder.id } });
    });

    it('should return 400 for already rejected proposal', async () => {
      await request(app.getHttpServer())
        .post(`/proposals/${proposal2Id}/reject`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });

    it('should return 403 for contractor trying to reject', async () => {
      // Create test proposal
      const newOrder = await prisma.order.create({
        data: {
          title: 'Test Order',
          description: 'Test',
          clientId: clientUserId,
          budget: 100,
          status: OrderStatus.PUBLISHED,
        },
      });

      const newProposal = await prisma.proposal.create({
        data: {
          orderId: newOrder.id,
          contractorId: contractorUserId,
          message: 'Test',
          price: 100,
          estimatedDays: 1,
          status: ProposalStatus.PENDING,
        },
      });

      await request(app.getHttpServer())
        .post(`/proposals/${newProposal.id}/reject`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(403);

      // Cleanup
      await prisma.proposal.delete({ where: { id: newProposal.id } });
      await prisma.order.delete({ where: { id: newOrder.id } });
    });

    it('should return 404 for non-existent proposal', async () => {
      await request(app.getHttpServer())
        .post('/proposals/non-existent-id/reject')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('Edge Cases', () => {
    it('should prevent accepting proposal for completed order', async () => {
      // Create completed order
      const completedOrder = await prisma.order.create({
        data: {
          title: 'Completed Order',
          description: 'Test',
          clientId: clientUserId,
          budget: 100,
          status: OrderStatus.COMPLETED,
        },
      });

      const proposalForCompletedOrder = await prisma.proposal.create({
        data: {
          orderId: completedOrder.id,
          contractorId: contractorUserId,
          message: 'Late proposal',
          price: 100,
          estimatedDays: 1,
          status: ProposalStatus.PENDING,
        },
      });

      await request(app.getHttpServer())
        .post(`/proposals/${proposalForCompletedOrder.id}/accept`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);

      // Cleanup
      await prisma.proposal.delete({ where: { id: proposalForCompletedOrder.id } });
      await prisma.order.delete({ where: { id: completedOrder.id } });
    });

    it('should handle very high price values', async () => {
      const newOrder = await prisma.order.create({
        data: {
          title: 'High Budget Order',
          description: 'Test',
          clientId: clientUserId,
          budget: 100000,
          status: OrderStatus.PUBLISHED,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/orders/${newOrder.id}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Expensive work',
          price: 99999,
          estimatedDays: 365,
        })
        .expect(201);

      expect(response.body.price).toBe(99999);
      expect(response.body.estimatedDays).toBe(365);

      // Cleanup
      await prisma.proposal.deleteMany({ where: { orderId: newOrder.id } });
      await prisma.order.delete({ where: { id: newOrder.id } });
    });

    it('should handle zero estimated days', async () => {
      const newOrder = await prisma.order.create({
        data: {
          title: 'Urgent Order',
          description: 'Test',
          clientId: clientUserId,
          budget: 100,
          status: OrderStatus.PUBLISHED,
        },
      });

      await request(app.getHttpServer())
        .post(`/orders/${newOrder.id}/proposals`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          message: 'Instant work',
          price: 150,
          estimatedDays: 0, // Invalid
        })
        .expect(400);

      // Cleanup
      await prisma.order.delete({ where: { id: newOrder.id } });
    });
  });
});
