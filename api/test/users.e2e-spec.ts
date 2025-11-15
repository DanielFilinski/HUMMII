import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { createTestUser, createAdminUser } from './helpers/test-db';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserAccessToken: string;
  let testUserId: string;
  let adminAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as in main.ts
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

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
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user and login
    const testUser = await createTestUser(prisma, {
      email: 'usertest@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
      isVerified: true,
    });
    testUserId = testUser.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'usertest@example.com',
        password: 'TestPassword123!',
      });

    testUserAccessToken = loginRes.body.accessToken;

    // Create admin user and login
    const adminUser = await createAdminUser(prisma, {
      email: 'admintest@example.com',
      password: 'AdminPassword123!',
      name: 'Admin User',
    });

    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admintest@example.com',
        password: 'AdminPassword123!',
      });

    adminAccessToken = adminLoginRes.body.accessToken;
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /api/v1/users/me - Get Profile', () => {
    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testUserId);
          expect(res.body).toHaveProperty('email', 'usertest@example.com');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).not.toHaveProperty('password');
          expect(res.body).toHaveProperty('roles');
          expect(res.body.roles).toContain('CLIENT');
        });
    });

    it('should fail without authentication token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/me - Update Profile', () => {
    it('should update user profile successfully', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .send({
          name: 'Updated Test User',
          phone: '+15551234567',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Test User');
          expect(res.body).toHaveProperty('phone', '+15551234567');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail with invalid phone format', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .send({
          phone: '12345', // Invalid format
        })
        .expect(400);
    });

    it('should not allow updating email directly', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .send({
          email: 'newemail@example.com', // Should be rejected
        })
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({
          name: 'Hacker Name',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/users/me/export - Export User Data (PIPEDA)', () => {
    it('should export all user data in JSON format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me/export')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .expect(200)
        .expect((res) => {
          // PIPEDA compliance: user should receive all their data
          expect(res.body).toHaveProperty('profile');
          expect(res.body.profile).toHaveProperty('id');
          expect(res.body.profile).toHaveProperty('email');
          expect(res.body.profile).toHaveProperty('name');
          expect(res.body.profile).toHaveProperty('createdAt');
          expect(res.body.profile).not.toHaveProperty('password');

          // Should include related data
          expect(res.body).toHaveProperty('sessions');
          expect(Array.isArray(res.body.sessions)).toBe(true);

          // Audit logs should be included for transparency
          expect(res.body).toHaveProperty('auditLogs');
          expect(Array.isArray(res.body.auditLogs)).toBe(true);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me/export')
        .expect(401);
    });

    it('should log the data export request in audit log', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me/export')
        .set('Authorization', `Bearer ${testUserAccessToken}`)
        .expect(200);

      // Check audit log was created
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userId: testUserId,
          action: 'DATA_EXPORT',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/v1/users/me - Delete Account (PIPEDA)', () => {
    it('should soft delete user account', async () => {
      // Create a new user for deletion test
      const deleteUser = await createTestUser(prisma, {
        email: 'todelete@example.com',
        password: 'DeletePassword123!',
        name: 'To Delete User',
      });

      // Login to get token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'todelete@example.com',
          password: 'DeletePassword123!',
        });

      const deleteToken = loginRes.body.accessToken;

      // Delete account
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(204);

      // Verify user is soft deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: deleteUser.id },
      });

      expect(deletedUser).toBeTruthy();
      expect(deletedUser?.deletedAt).toBeTruthy();
    });

    it('should anonymize user data on deletion', async () => {
      // Create another user for anonymization test
      const anonymizeUser = await createTestUser(prisma, {
        email: 'toanonymize@example.com',
        password: 'AnonymizePassword123!',
        name: 'To Anonymize User',
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'toanonymize@example.com',
          password: 'AnonymizePassword123!',
        });

      const deleteToken = loginRes.body.accessToken;

      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(204);

      // Verify PII is anonymized
      const deletedUser = await prisma.user.findUnique({
        where: { id: anonymizeUser.id },
      });

      expect(deletedUser?.email).toContain('deleted');
      expect(deletedUser?.name).toContain('Deleted User');
      expect(deletedUser?.phone).toBeNull();
    });

    it('should log account deletion in audit log', async () => {
      const auditUser = await createTestUser(prisma, {
        email: 'auditdelete@example.com',
        password: 'AuditPassword123!',
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'auditdelete@example.com',
          password: 'AuditPassword123!',
        });

      const deleteToken = loginRes.body.accessToken;

      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(204);

      // Check audit log
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          userId: auditUser.id,
          action: 'ACCOUNT_DELETED',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .expect(401);
    });

    it('should invalidate all sessions after deletion', async () => {
      const sessionUser = await createTestUser(prisma, {
        email: 'sessions@example.com',
        password: 'SessionPassword123!',
      });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'sessions@example.com',
          password: 'SessionPassword123!',
        });

      const deleteToken = loginRes.body.accessToken;

      // Delete account
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(204);

      // Try to use token after deletion
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(401);

      // Verify sessions are deleted
      const sessions = await prisma.session.findMany({
        where: { userId: sessionUser.id },
      });

      expect(sessions.length).toBe(0);
    });
  });
});

