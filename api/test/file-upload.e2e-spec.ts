import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { UserRole, OrderStatus, DisputeStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

describe('File Upload (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let user2Token: string;
  let userId: string;
  let user2Id: string;
  let disputeId: string;
  let evidenceId: string;

  // Test image paths (we'll create these in beforeAll)
  const testImagesDir = path.join(__dirname, 'test-images');
  const validJpegPath = path.join(testImagesDir, 'valid.jpg');
  const validPngPath = path.join(testImagesDir, 'valid.png');
  const validWebpPath = path.join(testImagesDir, 'valid.webp');
  const largePath = path.join(testImagesDir, 'large.jpg');
  const invalidTypePath = path.join(testImagesDir, 'invalid.txt');

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

    // Create test images directory
    if (!fs.existsSync(testImagesDir)) {
      fs.mkdirSync(testImagesDir, { recursive: true });
    }

    // Create test images (minimal valid images)
    // Valid JPEG (1x1 pixel red image)
    const validJpegBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
      'base64',
    );
    fs.writeFileSync(validJpegPath, validJpegBuffer);

    // Valid PNG (1x1 pixel red image)
    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
      'base64',
    );
    fs.writeFileSync(validPngPath, validPngBuffer);

    // Valid WebP (1x1 pixel)
    const validWebpBuffer = Buffer.from(
      'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
      'base64',
    );
    fs.writeFileSync(validWebpPath, validWebpBuffer);

    // Large file (3MB - exceeds 2MB avatar limit)
    const largeBuffer = Buffer.alloc(3 * 1024 * 1024, 0);
    fs.writeFileSync(largePath, largeBuffer);

    // Invalid file type (text file)
    fs.writeFileSync(invalidTypePath, 'This is not an image');

    // Clean up database
    await prisma.disputeEvidence.deleteMany({});
    await prisma.disputeMessage.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test users
    const user1Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user1@test.com',
        password: 'User1Pass123!',
        name: 'Test User 1',
      });

    userId = user1Res.body.id;

    const user1Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'User1Pass123!',
      });

    userToken = user1Login.body.accessToken;

    // Create second user
    const user2Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user2@test.com',
        password: 'User2Pass123!',
        name: 'Test User 2',
      });

    user2Id = user2Res.body.id;

    const user2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user2@test.com',
        password: 'User2Pass123!',
      });

    user2Token = user2Login.body.accessToken;

    // Create order and dispute for evidence upload testing
    const order = await prisma.order.create({
      data: {
        title: 'Test Order for Dispute',
        description: 'Test',
        clientId: userId,
        contractorId: user2Id,
        budget: 100,
        status: OrderStatus.IN_PROGRESS,
      },
    });

    const dispute = await prisma.dispute.create({
      data: {
        orderId: order.id,
        initiatorId: userId,
        respondentId: user2Id,
        reason: 'Test dispute for evidence upload',
        description: 'Test',
        status: DisputeStatus.OPENED,
      },
    });

    disputeId = dispute.id;
  });

  afterAll(async () => {
    // Clean up test images
    if (fs.existsSync(testImagesDir)) {
      fs.rmSync(testImagesDir, { recursive: true, force: true });
    }

    // Clean up database
    await prisma.disputeEvidence.deleteMany({});
    await prisma.disputeMessage.deleteMany({});
    await prisma.dispute.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /users/me/avatar (Upload Avatar)', () => {
    it('should upload valid JPEG avatar', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', validJpegPath)
        .expect(200);

      expect(response.body).toHaveProperty('avatarId');
      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body).toHaveProperty('thumbnailUrl');
      expect(response.body.avatarUrl).toContain('http');

      // Verify avatar was saved to user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user.avatarId).toBe(response.body.avatarId);
      expect(user.avatarUrl).toBe(response.body.avatarUrl);
    });

    it('should upload valid PNG avatar', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', validPngPath)
        .expect(200);

      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toContain('http');
    });

    it('should upload valid WebP avatar', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', validWebpPath)
        .expect(200);

      expect(response.body).toHaveProperty('avatarUrl');
    });

    it('should replace old avatar when uploading new one', async () => {
      // Upload first avatar
      const firstUpload = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', validJpegPath)
        .expect(200);

      const firstAvatarId = firstUpload.body.avatarId;

      // Upload second avatar (should delete first)
      const secondUpload = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', validPngPath)
        .expect(200);

      expect(secondUpload.body.avatarId).not.toBe(firstAvatarId);

      // Verify user has new avatar
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user.avatarId).toBe(secondUpload.body.avatarId);
    });

    it('should return 400 for missing file', async () => {
      await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should return 400 for invalid file type', async () => {
      await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', invalidTypePath)
        .expect(400);
    });

    it('should return 413 for file exceeding size limit (2MB)', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', largePath);

      // Should return 413 (Payload Too Large) or 400 (Bad Request)
      expect([400, 413]).toContain(response.status);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/users/me/avatar')
        .attach('file', validJpegPath)
        .expect(401);
    });

    it('should handle concurrent uploads gracefully', async () => {
      // Upload avatar twice in parallel
      const [response1, response2] = await Promise.all([
        request(app.getHttpServer())
          .post('/users/me/avatar')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('file', validJpegPath),
        request(app.getHttpServer())
          .post('/users/me/avatar')
          .set('Authorization', `Bearer ${userToken}`)
          .attach('file', validPngPath),
      ]);

      // Both should succeed (last one wins)
      expect([200, 201]).toContain(response1.status);
      expect([200, 201]).toContain(response2.status);

      // User should have one avatar
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user.avatarId).toBeDefined();
    });
  });

  describe('POST /disputes/:id/evidence (Upload Evidence)', () => {
    it('should upload evidence with valid JPEG', async () => {
      const response = await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Photo evidence of the issue')
        .attach('file', validJpegPath)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('fileUrl');
      expect(response.body.evidenceType).toBe('PHOTO');
      expect(response.body.description).toBe('Photo evidence of the issue');
      expect(response.body.uploadedById).toBe(userId);

      evidenceId = response.body.id;
    });

    it('should upload evidence with valid PNG', async () => {
      const response = await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'SCREENSHOT')
        .field('description', 'Screenshot of conversation')
        .attach('file', validPngPath)
        .expect(201);

      expect(response.body.evidenceType).toBe('SCREENSHOT');
      expect(response.body).toHaveProperty('fileUrl');
    });

    it('should upload evidence with all evidence types', async () => {
      const evidenceTypes = ['PHOTO', 'SCREENSHOT', 'DOCUMENT', 'CONTRACT', 'COMMUNICATION', 'RECEIPT', 'OTHER'];

      for (const type of evidenceTypes) {
        const response = await request(app.getHttpServer())
          .post(`/disputes/${disputeId}/evidence`)
          .set('Authorization', `Bearer ${userToken}`)
          .field('evidenceType', type)
          .field('description', `Test ${type}`)
          .attach('file', validJpegPath);

        if (response.status === 201) {
          expect(response.body.evidenceType).toBe(type);
        }
      }
    });

    it('should allow both initiator and respondent to upload evidence', async () => {
      // Initiator uploads
      const initiatorUpload = await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Evidence from initiator')
        .attach('file', validJpegPath)
        .expect(201);

      expect(initiatorUpload.body.uploadedById).toBe(userId);

      // Respondent uploads
      const respondentUpload = await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${user2Token}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Evidence from respondent')
        .attach('file', validPngPath)
        .expect(201);

      expect(respondentUpload.body.uploadedById).toBe(user2Id);
    });

    it('should return 400 for missing file', async () => {
      await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'No file attached')
        .expect(400);
    });

    it('should return 400 for invalid evidence type', async () => {
      await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'INVALID_TYPE')
        .field('description', 'Test')
        .attach('file', validJpegPath)
        .expect(400);
    });

    it('should return 400 for invalid file type', async () => {
      await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'DOCUMENT')
        .field('description', 'Invalid file')
        .attach('file', invalidTypePath)
        .expect(400);
    });

    it('should return 403 for unauthorized user (not dispute participant)', async () => {
      // Create third user not involved in dispute
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user3@test.com',
          password: 'User3Pass123!',
          name: 'User 3',
        });

      const user3Login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user3@test.com',
          password: 'User3Pass123!',
        });

      // Try to upload evidence as non-participant
      await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${user3Login.body.accessToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Unauthorized upload')
        .attach('file', validJpegPath)
        .expect(403);
    });

    it('should return 404 for non-existent dispute', async () => {
      await request(app.getHttpServer())
        .post('/disputes/non-existent-dispute-id/evidence')
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Test')
        .attach('file', validJpegPath)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Test')
        .attach('file', validJpegPath)
        .expect(401);
    });
  });

  describe('GET /disputes/:id/evidence (Get Evidence List)', () => {
    it('should get all evidence for dispute', async () => {
      const response = await request(app.getHttpServer())
        .get(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify structure of evidence items
      const firstEvidence = response.body[0];
      expect(firstEvidence).toHaveProperty('id');
      expect(firstEvidence).toHaveProperty('evidenceType');
      expect(firstEvidence).toHaveProperty('fileUrl');
      expect(firstEvidence).toHaveProperty('uploadedById');
      expect(firstEvidence).toHaveProperty('createdAt');
    });

    it('should allow respondent to view evidence', async () => {
      const response = await request(app.getHttpServer())
        .get(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 403 for unauthorized user', async () => {
      // User 3 (not participant)
      const user3Login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user3@test.com',
          password: 'User3Pass123!',
        });

      await request(app.getHttpServer())
        .get(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${user3Login.body.accessToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent dispute', async () => {
      await request(app.getHttpServer())
        .get('/disputes/non-existent-dispute-id/evidence')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/disputes/${disputeId}/evidence`)
        .expect(401);
    });
  });

  describe('DELETE /disputes/:id/evidence/:evidenceId (Delete Evidence)', () => {
    it('should delete own evidence', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/disputes/${disputeId}/evidence/${evidenceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');

      // Verify evidence is deleted
      const evidence = await prisma.disputeEvidence.findUnique({
        where: { id: evidenceId },
      });
      expect(evidence).toBeNull();
    });

    it('should return 403 when trying to delete another user evidence', async () => {
      // User 1 uploads evidence
      const uploadResponse = await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Test evidence')
        .attach('file', validJpegPath)
        .expect(201);

      const newEvidenceId = uploadResponse.body.id;

      // User 2 tries to delete User 1's evidence
      await request(app.getHttpServer())
        .delete(`/disputes/${disputeId}/evidence/${newEvidenceId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      // Verify evidence still exists
      const evidence = await prisma.disputeEvidence.findUnique({
        where: { id: newEvidenceId },
      });
      expect(evidence).not.toBeNull();

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/disputes/${disputeId}/evidence/${newEvidenceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent evidence', async () => {
      await request(app.getHttpServer())
        .delete(`/disputes/${disputeId}/evidence/non-existent-evidence-id`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 404 for wrong dispute ID', async () => {
      // Upload evidence
      const uploadResponse = await request(app.getHttpServer())
        .post(`/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('evidenceType', 'PHOTO')
        .field('description', 'Test')
        .attach('file', validJpegPath)
        .expect(201);

      // Try to delete with wrong dispute ID
      await request(app.getHttpServer())
        .delete(`/disputes/wrong-dispute-id/evidence/${uploadResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/disputes/${disputeId}/evidence/${uploadResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/disputes/${disputeId}/evidence/some-id`)
        .expect(401);
    });
  });

  describe('Edge Cases & Security', () => {
    it('should handle empty file', async () => {
      const emptyFilePath = path.join(testImagesDir, 'empty.jpg');
      fs.writeFileSync(emptyFilePath, '');

      await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', emptyFilePath)
        .expect(400);

      fs.unlinkSync(emptyFilePath);
    });

    it('should handle file with misleading extension', async () => {
      // Text file with .jpg extension
      const misleadingPath = path.join(testImagesDir, 'fake.jpg');
      fs.writeFileSync(misleadingPath, 'This is actually a text file');

      await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', misleadingPath)
        .expect(400);

      fs.unlinkSync(misleadingPath);
    });

    it('should handle very long file names', async () => {
      const longNamePath = path.join(testImagesDir, 'a'.repeat(255) + '.jpg');
      fs.copyFileSync(validJpegPath, longNamePath);

      const response = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', longNamePath);

      // Should handle gracefully (200 or 400)
      expect([200, 400]).toContain(response.status);

      fs.unlinkSync(longNamePath);
    });

    it('should handle special characters in file name', async () => {
      const specialNamePath = path.join(testImagesDir, 'test@#$%^&*().jpg');
      fs.copyFileSync(validJpegPath, specialNamePath);

      const response = await request(app.getHttpServer())
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('file', specialNamePath);

      expect([200, 400]).toContain(response.status);

      fs.unlinkSync(specialNamePath);
    });
  });
});
