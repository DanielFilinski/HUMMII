import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * 📧 Email Verification Flow Scenario
 * 
 * Tests: Complete email verification cycle
 * Steps:
 * 1. Register User (isVerified=false)
 * 2. Try Login Before Verification
 * 3. Verify Email with Token
 * 4. Login After Verification
 * 5. Verify Profile Shows isVerified=true
 * 6. Try Invalid Token (Should Fail)
 */
describe('📧 Email Verification Flow Scenario (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  let testEmail: string;
  let testPassword: string;
  let userId: string;
  let verificationToken: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Generate unique test data
    const timestamp = Date.now();
    testEmail = `verify.test.${timestamp}@example.com`;
    testPassword = 'TestPass123!';
  });

  afterAll(async () => {
    // Cleanup: Delete test user
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  describe('Step 1: Register User for Verification', () => {
    it('should register user with isVerified=false', async () => {
      console.log('🎬 Starting Email Verification Flow Scenario...');
      console.log('📧 Generated test email:', testEmail);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Verification Test User',
          email: testEmail,
          password: testPassword,
          phone: '+15559876543',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testEmail);
      expect(response.body.isVerified).toBe(false);

      userId = response.body.id;
      
      // Get verification token from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      verificationToken = user.verificationToken;
      expect(verificationToken).toBeDefined();
      expect(user.verificationTokenExpiry).toBeDefined();

      console.log('✅ Step 1: User Registered - PASSED');
      console.log('⚠️  Email verification required. Token retrieved from DB.');
    });
  });

  describe('Step 2: Try Login Before Verification', () => {
    it('should allow/block login based on implementation', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      // Status can be 200 (allowed with limitations), 401, or 403
      expect([200, 401, 403]).toContain(response.status);

      console.log('✅ Step 2: Pre-verification login attempt - PASSED');
      console.log('   Status:', response.status);
    });
  });

  describe('Step 3: Verify Email with Token', () => {
    it('should verify email successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      expect(user.isVerified).toBe(true);
      expect(user.verificationToken).toBeNull();
      expect(user.verificationTokenExpiry).toBeNull();

      console.log('✅ Step 3: Email Verified - PASSED');
    });
  });

  describe('Step 4: Login After Verification', () => {
    it('should login successfully after verification', async () => {
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

      console.log('✅ Step 4: Post-verification login - PASSED');
    });
  });

  describe('Step 5: Verify Profile Shows isVerified=true', () => {
    it('should show verified status in profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testEmail);
      expect(response.body.isVerified).toBe(true);

      console.log('✅ Step 5: Profile verification status - PASSED');
    });
  });

  describe('Step 6: Try Invalid Token', () => {
    it('should reject invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/verify-email?token=invalid-token-123456')
        .expect(400);

      expect(response.body).toHaveProperty('message');

      console.log('✅ Step 6: Invalid token rejection - PASSED');
      console.log('🎉 Email Verification Flow - ALL TESTS PASSED!');
    });
  });
});
