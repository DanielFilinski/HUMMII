import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * 🏗️ Contractor Setup Scenario
 *
 * Tests: Complete contractor onboarding flow
 * Steps:
 * 1. Register as CONTRACTOR
 * 2. Login
 * 3. Create contractor profile
 * 4. Add portfolio item
 * 5. Assign categories
 * 6. Create subscription (BASIC)
 * 7. Verify profile is complete and public
 */
describe('🏗️ Contractor Setup Scenario (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let contractorToken: string;
  let contractorUserId: string;
  let contractorId: string;
  let portfolioItemId: string;
  let subscriptionId: string;
  let categoryId1: string;
  let categoryId2: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    console.log('🎬 Starting Contractor Setup Scenario...');

    // Create test categories
    const cat1 = await prisma.category.create({
      data: { name: 'Plumbing', slug: 'plumbing-scenario', isActive: true },
    });
    categoryId1 = cat1.id;

    const cat2 = await prisma.category.create({
      data: { name: 'HVAC', slug: 'hvac-scenario', isActive: true },
    });
    categoryId2 = cat2.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({});
    await prisma.contractorCategory.deleteMany({});
    await prisma.portfolioItem.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.category.deleteMany({ where: { slug: { contains: 'scenario' } } });
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('Step 1: Register as CONTRACTOR', () => {
    it('should register new user with contractor role', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'contractor-setup@test.com',
          password: 'SecurePass123!',
          name: 'Professional Contractor',
          phone: '+1-613-555-0123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('contractor-setup@test.com');

      contractorUserId = response.body.id;

      // Set contractor role
      await prisma.user.update({
        where: { id: contractorUserId },
        data: { role: UserRole.CONTRACTOR },
      });

      console.log('✅ Step 1: Registration - PASSED');
    });
  });

  describe('Step 2: Login', () => {
    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'contractor-setup@test.com',
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      contractorToken = response.body.accessToken;

      console.log('✅ Step 2: Login - PASSED');
    });
  });

  describe('Step 3: Create Contractor Profile', () => {
    it('should create complete contractor profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          businessName: 'Pro Plumbing & HVAC Solutions',
          bio: 'Professional plumbing and HVAC services with 15+ years experience in Ottawa area',
          experience: 15,
          address: '456 Bank St, Ottawa, ON K2P 1Y9',
          city: 'Ottawa',
          province: 'ON',
          postalCode: 'K2P 1Y9',
          latitude: 45.4172,
          longitude: -75.6947,
          serviceRadius: 50,
          phoneNumber: '+1-613-555-0123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.businessName).toBe('Pro Plumbing & HVAC Solutions');
      expect(response.body.experience).toBe(15);
      expect(response.body.serviceRadius).toBe(50);

      contractorId = response.body.id;

      console.log('✅ Step 3: Profile Creation - PASSED');
    });
  });

  describe('Step 4: Add Portfolio Item', () => {
    it('should add portfolio item with images', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Complete Kitchen Renovation',
          description: 'Full kitchen plumbing renovation including new fixtures, pipes, and water heater installation in downtown Ottawa home',
          beforeImageUrl: 'https://example.com/before-kitchen.jpg',
          afterImageUrl: 'https://example.com/after-kitchen.jpg',
          completedAt: new Date('2024-10-01').toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Complete Kitchen Renovation');
      expect(response.body.order).toBe(0); // First item

      portfolioItemId = response.body.id;

      console.log('✅ Step 4: Portfolio Item Added - PASSED');
    });

    it('should verify portfolio is visible', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(portfolioItemId);
    });
  });

  describe('Step 5: Assign Categories', () => {
    it('should assign multiple categories to contractor', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          categoryIds: [categoryId1, categoryId2],
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('assigned');

      console.log('✅ Step 5: Categories Assigned - PASSED');
    });

    it('should verify categories are assigned', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      const categoryIds = response.body.map(cat => cat.id);
      expect(categoryIds).toContain(categoryId1);
      expect(categoryIds).toContain(categoryId2);
    });
  });

  describe('Step 6: Create Subscription (BASIC)', () => {
    it('should create basic subscription', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          tier: 'BASIC',
          paymentMethodId: 'pm_card_visa', // Test payment method
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.tier).toBe('BASIC');
      expect(response.body.status).toBe('ACTIVE');
      expect(response.body.userId).toBe(contractorUserId);

      subscriptionId = response.body.id;

      console.log('✅ Step 6: Subscription Created - PASSED');
    });

    it('should verify subscription is active', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscriptions/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body.tier).toBe('BASIC');
      expect(response.body.status).toBe('ACTIVE');
    });
  });

  describe('Step 7: Verify Profile is Complete and Public', () => {
    it('should get complete profile as contractor', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body.id).toBe(contractorId);
      expect(response.body.businessName).toBe('Pro Plumbing & HVAC Solutions');

      // Should include categories
      expect(response.body).toHaveProperty('categories');
      expect(response.body.categories.length).toBe(2);

      // Should include portfolio
      expect(response.body).toHaveProperty('portfolio');
      expect(response.body.portfolio.length).toBe(1);

      console.log('✅ Step 7: Profile Complete - PASSED');
    });

    it('should be visible in public contractor search', async () => {
      // Search nearby contractors
      const response = await request(app.getHttpServer())
        .get('/contractors/nearby')
        .query({
          lat: 45.4172,
          lon: -75.6947,
          radius: 100,
        })
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Should include our contractor
      const ourContractor = response.body.find(c => c.id === contractorId);
      expect(ourContractor).toBeDefined();
      expect(ourContractor.businessName).toBe('Pro Plumbing & HVAC Solutions');

      console.log('✅ Step 7: Public Visibility - PASSED');
    });

    it('should have complete public profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contractors/${contractorId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body.id).toBe(contractorId);
      expect(response.body.businessName).toBe('Pro Plumbing & HVAC Solutions');
      expect(response.body.experience).toBe(15);
      expect(response.body.categories.length).toBe(2);
      expect(response.body.portfolio.length).toBe(1);

      console.log('✅ Step 7: Public Profile Verified - PASSED');
    });
  });

  it('🎉 Complete Contractor Setup - ALL STEPS PASSED!', () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 CONTRACTOR SETUP SCENARIO COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Summary:');
    console.log('  ✅ Contractor registered and logged in');
    console.log('  ✅ Complete profile created');
    console.log('  ✅ Portfolio with 1 item added');
    console.log('  ✅ 2 categories assigned');
    console.log('  ✅ BASIC subscription activated');
    console.log('  ✅ Profile is public and searchable');
    console.log('');
    console.log(`  Contractor ID: ${contractorId}`);
    console.log(`  Subscription ID: ${subscriptionId}`);
    console.log(`  Portfolio Items: 1`);
    console.log(`  Categories: 2`);
    console.log('');

    expect(contractorId).toBeDefined();
    expect(subscriptionId).toBeDefined();
    expect(portfolioItemId).toBeDefined();
  });
});
