import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { createTestUser, createAdminUser } from './helpers/test-db';

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminAccessToken: string;
  let adminUserId: string;
  let regularUserToken: string;
  let testUserId: string;

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
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});

    // Create admin user
    const adminUser = await createAdminUser(prisma, {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      name: 'Admin User',
    });
    adminUserId = adminUser.id;

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      });

    adminAccessToken = adminLogin.body.accessToken;

    // Create regular user for testing
    const regularUser = await createTestUser(prisma, {
      email: 'regular@example.com',
      password: 'RegularPassword123!',
      name: 'Regular User',
    });
    testUserId = regularUser.id;

    const regularLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'regular@example.com',
        password: 'RegularPassword123!',
      });

    regularUserToken = regularLogin.body.accessToken;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /api/v1/admin/users - List Users', () => {
    it('should list all users for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.users)).toBe(true);
          expect(res.body.users.length).toBeGreaterThan(0);
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          
          // Check user doesn't have password
          res.body.users.forEach((user: any) => {
            expect(user).not.toHaveProperty('password');
          });
        });
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });

    it('should support filtering by role', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          res.body.users.forEach((user: any) => {
            expect(user.roles).toContain('ADMIN');
          });
        });
    });

    it('should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .expect(401);
    });
  });

  describe('GET /api/v1/admin/users/:id - Get User Details', () => {
    it('should get user details by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testUserId);
          expect(res.body).toHaveProperty('email', 'regular@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/admin/users/:id/roles - Add Role', () => {
    it('should add role to user', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'CONTRACTOR' })
        .expect(200);

      // Verify role was added
      const user = await prisma.user.findUnique({
        where: { id: testUserId },
      });

      expect(user?.roles).toContain('CONTRACTOR');
    });

    it('should fail with invalid role', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/admin/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'INVALID_ROLE' })
        .expect(400);
    });

    it('should log role addition in audit log', async () => {
      const newUser = await createTestUser(prisma);

      await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${newUser.id}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'PARTNER' })
        .expect(200);

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityId: newUser.id,
          action: 'ROLE_ADDED',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });

    it('should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/admin/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'ADMIN' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/admin/users/:id/roles - Remove Role', () => {
    it('should remove role from user', async () => {
      // First add a role
      const userWithRole = await createTestUser(prisma, {
        roles: ['CLIENT', 'CONTRACTOR'],
      });

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${userWithRole.id}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'CONTRACTOR' })
        .expect(200);

      // Verify role was removed
      const user = await prisma.user.findUnique({
        where: { id: userWithRole.id },
      });

      expect(user?.roles).not.toContain('CONTRACTOR');
      expect(user?.roles).toContain('CLIENT');
    });

    it('should not allow removing last role', async () => {
      const singleRoleUser = await createTestUser(prisma, {
        roles: ['CLIENT'],
      });

      return request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${singleRoleUser.id}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'CLIENT' })
        .expect(400);
    });

    it('should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'CLIENT' })
        .expect(403);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role - Update Primary Role', () => {
    it('should update user primary role', async () => {
      const user = await createTestUser(prisma);

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${user.id}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'CONTRACTOR' })
        .expect(200);

      // Verify role was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.roles[0]).toBe('CONTRACTOR');
    });

    it('should fail with invalid role', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ role: 'SUPER_ADMIN' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/lock - Lock User', () => {
    it('should lock user account', async () => {
      const userToLock = await createTestUser(prisma);

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${userToLock.id}/lock`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ reason: 'Suspicious activity' })
        .expect(200);

      // Verify user is locked
      const lockedUser = await prisma.user.findUnique({
        where: { id: userToLock.id },
      });

      expect(lockedUser?.lockedUntil).toBeTruthy();
    });

    it('should invalidate user sessions when locked', async () => {
      const userToLock = await createTestUser(prisma, {
        email: 'lockme@example.com',
        password: 'LockPassword123!',
      });

      // Login to create session
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'lockme@example.com',
          password: 'LockPassword123!',
        });

      const userToken = loginRes.body.accessToken;

      // Lock the user
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${userToLock.id}/lock`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ reason: 'Testing lock' })
        .expect(200);

      // Try to access with old token
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);
    });

    it('should log lock action in audit log', async () => {
      const user = await createTestUser(prisma);

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${user.id}/lock`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ reason: 'Test lock' })
        .expect(200);

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityId: user.id,
          action: 'USER_LOCKED',
        },
      });

      expect(auditLogs.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/unlock - Unlock User', () => {
    it('should unlock locked user account', async () => {
      const lockedUser = await prisma.user.create({
        data: {
          email: 'locked@example.com',
          password: 'hashedpassword',
          name: 'Locked User',
          roles: ['CLIENT'],
          isVerified: true,
          lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Locked for 24 hours
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${lockedUser.id}/unlock`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Verify user is unlocked
      const unlockedUser = await prisma.user.findUnique({
        where: { id: lockedUser.id },
      });

      expect(unlockedUser?.lockedUntil).toBeNull();
    });
  });

  describe('DELETE /api/v1/admin/users/:id - Delete User', () => {
    it('should soft delete user', async () => {
      const userToDelete = await createTestUser(prisma);

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(204);

      // Verify user is soft deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      });

      expect(deletedUser?.deletedAt).toBeTruthy();
    });

    it('should not allow deleting another admin', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/audit-logs - Get Audit Logs', () => {
    it('should retrieve audit logs with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?page=1&limit=20')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.logs)).toBe(true);
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
        });
    });

    it('should filter logs by user ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/admin/audit-logs?userId=${testUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          res.body.logs.forEach((log: any) => {
            expect(log.userId).toBe(testUserId);
          });
        });
    });

    it('should filter logs by action', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs?action=LOGIN')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/audit-logs/:id - Get Single Audit Log', () => {
    it('should retrieve specific audit log', async () => {
      // Create an audit log
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: testUserId,
          action: 'TEST_ACTION',
          entity: 'USER',
          entityId: testUserId,
        },
      });

      return request(app.getHttpServer())
        .get(`/api/v1/admin/audit-logs/${auditLog.id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', auditLog.id);
          expect(res.body).toHaveProperty('action', 'TEST_ACTION');
        });
    });
  });

  describe('GET /api/v1/admin/stats - Get Platform Statistics', () => {
    it('should return platform statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalUsers');
          expect(res.body).toHaveProperty('activeUsers');
          expect(res.body).toHaveProperty('usersByRole');
          expect(typeof res.body.totalUsers).toBe('number');
        });
    });

    it('should fail for non-admin users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe('GET /api/v1/admin/stats/users - Get User Statistics', () => {
    it('should return detailed user statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/stats/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('registrationTrend');
          expect(res.body).toHaveProperty('verificationRate');
          expect(Array.isArray(res.body.registrationTrend)).toBe(true);
        });
    });
  });
});

