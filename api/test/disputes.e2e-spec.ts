import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { DisputeStatus, DisputeReason, OrderStatus, UserRole } from '@prisma/client';

describe('Disputes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientToken: string;
  let contractorToken: string;
  let adminToken: string;
  let clientId: string;
  let contractorId: string;
  let orderId: string;
  let disputeId: string;

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

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.disputeMessage.deleteMany();
    await prisma.disputeEvidence.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    const client = await prisma.user.create({
      data: {
        email: 'client@test.com',
        password: 'hashed_password',
        name: 'Test Client',
        roles: [UserRole.CLIENT],
      },
    });

    const contractor = await prisma.user.create({
      data: {
        email: 'contractor@test.com',
        password: 'hashed_password',
        name: 'Test Contractor',
        roles: [UserRole.CONTRACTOR],
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'hashed_password',
        name: 'Test Admin',
        roles: [UserRole.ADMIN],
      },
    });

    clientId = client.id;
    contractorId = contractor.id;

    // Create test order
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        isActive: true,
      },
    });

    const order = await prisma.order.create({
      data: {
        title: 'Test Order',
        description: 'Test order description',
        clientId,
        contractorId,
        categoryId: category.id,
        status: OrderStatus.IN_PROGRESS,
        address: '123 Test St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5H 2N2',
      },
    });

    orderId = order.id;

    // Get tokens (simplified - in real test, use auth endpoints)
    // For now, we'll skip authentication setup and focus on dispute logic
    clientToken = 'mock_client_token';
    contractorToken = 'mock_contractor_token';
    adminToken = 'mock_admin_token';
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /api/v1/disputes', () => {
    it('should create dispute successfully', async () => {
      const createDisputeDto = {
        orderId,
        reason: DisputeReason.WORK_QUALITY_ISSUES,
        description: 'The work completed does not meet the agreed quality standards. Multiple issues were found.',
        amountInDispute: 500,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(createDisputeDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe(DisputeStatus.OPENED);
      expect(response.body.initiatedById).toBe(clientId);
      expect(response.body.respondentId).toBe(contractorId);

      disputeId = response.body.id;
    });

    it('should return 404 if order not found', async () => {
      const createDisputeDto = {
        orderId: 'non-existent-order-id',
        reason: DisputeReason.WORK_QUALITY_ISSUES,
        description: 'Test description',
      };

      await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(createDisputeDto)
        .expect(404);
    });

    it('should return 403 if user is not participant', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@test.com',
          password: 'hashed_password',
          name: 'Other User',
          roles: [UserRole.CLIENT],
        },
      });

      const createDisputeDto = {
        orderId,
        reason: DisputeReason.WORK_QUALITY_ISSUES,
        description: 'Test description',
      };

      await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${otherUser.id}`)
        .send(createDisputeDto)
        .expect(403);
    });

    it('should return 400 if order status does not allow dispute', async () => {
      // Update order to DRAFT status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DRAFT },
      });

      const createDisputeDto = {
        orderId,
        reason: DisputeReason.WORK_QUALITY_ISSUES,
        description: 'Test description',
      };

      await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(createDisputeDto)
        .expect(400);
    });

    it('should return 429 if rate limit exceeded', async () => {
      // Create 5 disputes to hit rate limit
      for (let i = 0; i < 5; i++) {
        const order = await prisma.order.create({
          data: {
            title: `Test Order ${i}`,
            description: 'Test order description',
            clientId,
            contractorId,
            categoryId: (await prisma.category.findFirst()).id,
            status: OrderStatus.IN_PROGRESS,
            address: '123 Test St',
            city: 'Toronto',
            province: 'ON',
            postalCode: 'M5H 2N2',
          },
        });

        await prisma.dispute.create({
          data: {
            orderId: order.id,
            initiatedById: clientId,
            respondentId: contractorId,
            reason: DisputeReason.WORK_QUALITY_ISSUES,
            description: 'Test description',
            status: DisputeStatus.OPENED,
          },
        });
      }

      const createDisputeDto = {
        orderId,
        reason: DisputeReason.WORK_QUALITY_ISSUES,
        description: 'Test description',
      };

      await request(app.getHttpServer())
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(createDisputeDto)
        .expect(429);
    });
  });

  describe('GET /api/v1/disputes', () => {
    it('should return user disputes with pagination', async () => {
      // Create test dispute
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/disputes')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body).toHaveProperty('disputes');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.disputes)).toBe(true);
    });
  });

  describe('GET /api/v1/disputes/:id', () => {
    it('should return dispute details for participant', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/disputes/${dispute.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.id).toBe(dispute.id);
      expect(response.body).toHaveProperty('evidence');
      expect(response.body).toHaveProperty('messages');
    });

    it('should return 403 if user is not participant', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      const otherUser = await prisma.user.create({
        data: {
          email: 'other@test.com',
          password: 'hashed_password',
          name: 'Other User',
          roles: [UserRole.CLIENT],
        },
      });

      await request(app.getHttpServer())
        .get(`/api/v1/disputes/${dispute.id}`)
        .set('Authorization', `Bearer ${otherUser.id}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/disputes/:id/evidence', () => {
    it('should upload evidence successfully', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      // Mock file upload
      const fileBuffer = Buffer.from('test file content');

      const response = await request(app.getHttpServer())
        .post(`/api/v1/disputes/${dispute.id}/evidence`)
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('file', fileBuffer, 'test.jpg')
        .field('evidenceType', 'PHOTO')
        .field('description', 'Test evidence')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.evidenceType).toBe('PHOTO');
    });

    it('should return 400 if file size exceeds limit', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      // Create file larger than 20MB
      const largeFileBuffer = Buffer.alloc(21 * 1024 * 1024);

      await request(app.getHttpServer())
        .post(`/api/v1/disputes/${dispute.id}/evidence`)
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('file', largeFileBuffer, 'large-file.jpg')
        .field('evidenceType', 'PHOTO')
        .expect(400);
    });
  });

  describe('POST /api/v1/disputes/:id/messages', () => {
    it('should add message successfully', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      const addMessageDto = {
        message: 'This is a test message for the dispute.',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/disputes/${dispute.id}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(addMessageDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe(addMessageDto.message);
    });

    it('should return 400 if message is too long', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.OPENED,
        },
      });

      const longMessage = 'a'.repeat(2001); // Exceeds 2000 char limit

      await request(app.getHttpServer())
        .post(`/api/v1/disputes/${dispute.id}/messages`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ message: longMessage })
        .expect(400);
    });
  });

  describe('POST /api/v1/admin/disputes/:id/resolve', () => {
    it('should resolve dispute successfully (admin only)', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.UNDER_REVIEW,
        },
      });

      const resolveDto = {
        resolutionType: 'BLOCK_USER',
        resolutionReason: 'User violated terms of service',
        actionDetails: {
          userId: contractorId,
        },
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/admin/disputes/${dispute.id}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resolveDto)
        .expect(200);

      expect(response.body.status).toBe(DisputeStatus.RESOLVED);
      expect(response.body.resolutionType).toBe('BLOCK_USER');
    });

    it('should return 403 if user is not admin', async () => {
      const dispute = await prisma.dispute.create({
        data: {
          orderId,
          initiatedById: clientId,
          respondentId: contractorId,
          reason: DisputeReason.WORK_QUALITY_ISSUES,
          description: 'Test description',
          status: DisputeStatus.UNDER_REVIEW,
        },
      });

      const resolveDto = {
        resolutionType: 'BLOCK_USER',
        resolutionReason: 'User violated terms of service',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/admin/disputes/${dispute.id}/resolve`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(resolveDto)
        .expect(403);
    });
  });
});

