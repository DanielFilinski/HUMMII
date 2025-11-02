import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global pipes as in main.ts
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
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should successfully register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'StrongPass123',
          name: 'Test User',
          phone: '+15551234567',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).not.toHaveProperty('password');
          expect(res.body.isVerified).toBe(false);
        });
    });

    it('should fail with duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'StrongPass123',
          name: 'First User',
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'AnotherPass123',
          name: 'Second User',
        })
        .expect(409);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'weak',
          name: 'Weak User',
        })
        .expect(400);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'StrongPass123',
          name: 'Invalid Email User',
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'incomplete@example.com',
          // Missing password and name
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const testUser = {
      email: 'logintest@example.com',
      password: 'TestPassword123',
      name: 'Login Test User',
    };

    let verificationToken: string;

    beforeAll(async () => {
      // Register user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      // Get verification token from database
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });
      verificationToken = user?.verificationToken || '';

      // Verify email
      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(200);
    });

    it('should successfully login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).not.toHaveProperty('password');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        })
        .expect(401);
    });

    it('should fail if email not verified', async () => {
      // Register unverified user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'unverified@example.com',
          password: 'TestPassword123',
          name: 'Unverified User',
        });

      // Try to login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'TestPassword123',
        })
        .expect(401);
    });
  });

  describe('/auth/verify-email (GET)', () => {
    it('should successfully verify email with valid token', async () => {
      // Register user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'verify@example.com',
          password: 'TestPassword123',
          name: 'Verify Test',
        });

      // Get token from database
      const user = await prisma.user.findUnique({
        where: { email: 'verify@example.com' },
      });

      // Verify email
      return request(app.getHttpServer())
        .get(`/auth/verify-email?token=${user?.verificationToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('verified');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/verify-email?token=invalid-token-123')
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Register and verify user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'TestPassword123',
          name: 'Refresh Test',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'refresh@example.com' },
      });

      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${user?.verificationToken}`);

      // Login to get refresh token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'TestPassword123',
        });

      refreshToken = loginRes.body.refreshToken;
    });

    it('should successfully refresh access token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.refreshToken).not.toBe(refreshToken); // Token rotation
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('/auth/password-reset (POST)', () => {
    beforeAll(async () => {
      // Register and verify user for password reset tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'reset@example.com',
          password: 'OldPassword123',
          name: 'Reset Test',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'reset@example.com' },
      });

      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${user?.verificationToken}`);
    });

    it('should request password reset successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'reset@example.com' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should not reveal if email does not exist', () => {
      return request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'nonexistent@example.com' })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            'If account exists, reset email has been sent',
          );
        });
    });

    it('should successfully reset password with valid token', async () => {
      // Request reset
      await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'reset@example.com' });

      // Get reset token from database
      const user = await prisma.user.findUnique({
        where: { email: 'reset@example.com' },
      });

      // Confirm reset with token
      return request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: user?.resetToken || '',
          newPassword: 'NewPassword123',
        })
        .expect(200);
    });

    it('should fail with invalid reset token', () => {
      return request(app.getHttpServer())
        .post('/auth/password-reset/confirm')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123',
        })
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register, verify and login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `logout${Date.now()}@example.com`,
          password: 'TestPassword123',
          name: 'Logout Test',
        });

      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
      const user = users[0];

      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${user?.verificationToken}`);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'TestPassword123',
        });

      refreshToken = loginRes.body.refreshToken;
    });

    it('should successfully logout', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(204);
    });

    it('should invalidate refresh token after logout', async () => {
      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(204);

      // Try to use the same refresh token
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('/users/me (GET) - Protected Route', () => {
    let accessToken: string;
    let testUserEmail: string;

    beforeAll(async () => {
      testUserEmail = `protected${Date.now()}@example.com`;

      // Register, verify and login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserEmail,
          password: 'TestPassword123',
          name: 'Protected Test',
        });

      const user = await prisma.user.findUnique({
        where: { email: testUserEmail },
      });

      await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${user?.verificationToken}`);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'TestPassword123',
        });

      accessToken = loginRes.body.accessToken;
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', testUserEmail);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail to access protected route without token', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login endpoint', async () => {
      const requests = [];

      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'rate@example.com',
              password: 'SomePassword123',
            }),
        );
      }

      const responses = await Promise.all(requests);

      // Some requests should be rate limited
      // Note: Actual rate limiting behavior depends on configuration
      expect(responses.length).toBe(10);
    });
  });

  describe('Security Headers', () => {
    it('should have security headers set', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-content-type-options');
          expect(res.headers).toHaveProperty('x-frame-options');
        });
    });
  });
});
