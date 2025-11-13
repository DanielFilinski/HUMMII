import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * 👤 Complete User Journey Scenario
 * 
 * Tests: Full user lifecycle from registration to profile update
 * Steps:
 * 1. Register New User
 * 2. Verify Email
 * 3. Login User
 * 4. Get User Profile
 * 5. Update Profile
 */
describe('👤 Complete User Journey Scenario (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  let testEmail: string;
  let testPassword: string;
  let userId: string;
  let verificationToken: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Generate unique test data
    const timestamp = Date.now();
    testEmail = `test.user.${timestamp}@example.com`;
    testPassword = 'SecurePass123!';
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  describe('Step 1: Register New User', () => {
    it('should register user successfully', async () => {
      console.log('🎬 Starting User Journey Scenario...');
      console.log('📧 Generated test email:', testEmail);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User Journey',
          email: testEmail,
          password: testPassword,
          phone: '+15551234567',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testEmail);
      expect(response.body.isVerified).toBe(false);

      userId = response.body.id;

      // Get verification token
      const user = await prisma.user.findUnique({ where: { id: userId } });
      verificationToken = user.verificationToken;

      console.log('✅ Step 1: User Registration - PASSED');
    });
  });

  describe('Step 2: Verify Email', () => {
    it('should verify email successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      console.log('✅ Step 2: Email Verification - PASSED');
    });
  });

  describe('Step 3: Login User', () => {
    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      console.log('✅ Step 3: User Login - PASSED');
    });
  });

  describe('Step 4: Get User Profile', () => {
    it('should retrieve user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testEmail);
      expect(response.body.isVerified).toBe(true);

      console.log('✅ Step 4: Get Profile - PASSED');
    });
  });

  describe('Step 5: Update Profile', () => {
    it('should update profile successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          bio: 'Updated bio from test scenario',
          location: 'Toronto, ON',
        })
        .expect(200);

      expect(response.body).toHaveProperty('bio');
      expect(response.body.bio).toBe('Updated bio from test scenario');

      console.log('✅ Step 5: Update Profile - PASSED');
      console.log('🎉 Complete User Journey - ALL TESTS PASSED!');
    });
  });
});
