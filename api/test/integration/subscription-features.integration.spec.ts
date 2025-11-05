import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { SubscriptionTier, UserRole } from '@prisma/client';
import { createTestUser } from '../helpers/test-db';

describe('Subscription Features Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contractorToken: string;
  let contractorId: string;
  let categoryIds: string[];

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
    await prisma.contractorCategory.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Plumbing',
          nameEn: 'Plumbing',
          nameFr: 'Plomberie',
          slug: 'plumbing-sub-integration',
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Electrical',
          nameEn: 'Electrical',
          nameFr: 'Électrique',
          slug: 'electrical-sub-integration',
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Carpentry',
          nameEn: 'Carpentry',
          nameFr: 'Menuiserie',
          slug: 'carpentry-sub-integration',
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'HVAC',
          nameEn: 'HVAC',
          nameFr: 'CVC',
          slug: 'hvac-sub-integration',
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Roofing',
          nameEn: 'Roofing',
          nameFr: 'Toiture',
          slug: 'roofing-sub-integration',
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Painting',
          nameEn: 'Painting',
          nameFr: 'Peinture',
          slug: 'painting-sub-integration',
          isActive: true,
        },
      }),
    ]);
    categoryIds = categories.map((c) => c.id);

    // Create contractor user
    const contractor = await createTestUser(prisma, {
      email: 'contractor-sub-features@test.com',
      password: 'TestPassword123!',
      name: 'Sub Features Contractor',
      isVerified: true,
      roles: [UserRole.CONTRACTOR],
    });
    contractorId = contractor.id;

    // Create contractor profile
    await prisma.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor for subscription features',
        hourlyRate: 50,
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'contractor-sub-features@test.com',
        password: 'TestPassword123!',
      });
    contractorToken = contractorLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.contractorCategory.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  it('Subscription → Feature Gating → Category Limits flow', async () => {
    // Step 1: FREE tier - can assign max 3 categories
    const freeCategoriesResponse = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/categories')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        categoryIds: categoryIds.slice(0, 3), // First 3 categories
      })
      .expect(200);

    expect(freeCategoriesResponse.body).toHaveProperty('success', true);

    // Step 2: Try to assign 4th category (should fail for FREE tier)
    const tooManyCategoriesResponse = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/categories')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        categoryIds: categoryIds.slice(0, 4), // First 4 categories
      })
      .expect(400);

    expect(tooManyCategoriesResponse.body.message).toContain('category limit');

    // Step 3: Create STANDARD subscription (allows 5 categories)
    const subscriptionResponse = await request(app.getHttpServer())
      .post('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        tier: SubscriptionTier.STANDARD,
      })
      .expect(201);

    expect(subscriptionResponse.body.tier).toBe(SubscriptionTier.STANDARD);

    // Step 4: Now can assign up to 5 categories
    const standardCategoriesResponse = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/categories')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        categoryIds: categoryIds.slice(0, 5), // First 5 categories
      })
      .expect(200);

    expect(standardCategoriesResponse.body).toHaveProperty('success', true);

    // Step 5: Upgrade to PROFESSIONAL (unlimited categories)
    const upgradeResponse = await request(app.getHttpServer())
      .patch('/api/v1/subscriptions/upgrade')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        tier: SubscriptionTier.PROFESSIONAL,
      })
      .expect(200);

    expect(upgradeResponse.body.tier).toBe(SubscriptionTier.PROFESSIONAL);

    // Step 6: Now can assign all 6 categories
    const allCategoriesResponse = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/categories')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        categoryIds, // All 6 categories
      })
      .expect(200);

    expect(allCategoriesResponse.body).toHaveProperty('success', true);

    // Step 7: Verify subscription features are applied
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        subscription: true,
        categories: true,
      },
    });

    expect(contractor?.subscription?.tier).toBe(SubscriptionTier.PROFESSIONAL);
    expect(contractor?.categories.length).toBe(6);
  });
});

