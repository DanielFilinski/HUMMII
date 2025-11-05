import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { createTestUser } from '../helpers/test-db';

describe('User Profile Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userToken: string;
  let userId: string;
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
    await prisma.portfolioItem.deleteMany({});
    await prisma.contractorCategory.deleteMany({});
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
          slug: 'plumbing-integration',
          isActive: true,
        },
      }),
      prisma.category.create({
        data: {
          name: 'Electrical',
          nameEn: 'Electrical',
          nameFr: 'Électrique',
          slug: 'electrical-integration',
          isActive: true,
        },
      }),
    ]);
    categoryIds = categories.map((c) => c.id);

    // Create user
    const user = await createTestUser(prisma, {
      email: 'user-integration@test.com',
      password: 'TestPassword123!',
      name: 'Integration User',
      isVerified: true,
      roles: [UserRole.CLIENT],
    });
    userId = user.id;

    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user-integration@test.com',
        password: 'TestPassword123!',
      });
    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.portfolioItem.deleteMany({});
    await prisma.contractorCategory.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  it('Complete user profile flow: Switch Role → Create Contractor → Assign Categories → Add Portfolio → Update Location', async () => {
    // Step 1: User switches to CONTRACTOR role
    const switchRoleResponse = await request(app.getHttpServer())
      .post('/api/v1/users/me/switch-role')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        targetRole: UserRole.CONTRACTOR,
      })
      .expect(200);

    expect(switchRoleResponse.body).toHaveProperty('currentRole', UserRole.CONTRACTOR);

    // Step 2: Create contractor profile
    const contractorResponse = await request(app.getHttpServer())
      .post('/api/v1/contractors/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        bio: 'Experienced contractor for integration testing',
        experience: 10,
        hourlyRate: 75,
        businessName: 'Integration Test Services',
      })
      .expect(201);

    expect(contractorResponse.body).toHaveProperty('id');
    contractorId = contractorResponse.body.id;

    // Step 3: Assign categories to contractor
    const categoriesResponse = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        categoryIds,
      })
      .expect(200);

    expect(categoriesResponse.body).toHaveProperty('success', true);

    // Step 4: Add portfolio items
    const portfolioResponse1 = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/portfolio')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Portfolio Item 1',
        description: 'Test portfolio item 1',
        imageUrl: 'https://example.com/image1.jpg',
      })
      .expect(201);

    expect(portfolioResponse1.body).toHaveProperty('id');

    const portfolioResponse2 = await request(app.getHttpServer())
      .post('/api/v1/contractors/me/portfolio')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Portfolio Item 2',
        description: 'Test portfolio item 2',
        imageUrl: 'https://example.com/image2.jpg',
      })
      .expect(201);

    expect(portfolioResponse2.body).toHaveProperty('id');

    // Step 5: Update contractor location
    const locationResponse = await request(app.getHttpServer())
      .patch('/api/v1/contractors/me/location')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        latitude: 43.6532,
        longitude: -79.3832,
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5H 2N2',
        serviceRadius: 50,
      })
      .expect(200);

    expect(locationResponse.body).toHaveProperty('latitude', 43.6532);
    expect(locationResponse.body).toHaveProperty('longitude', -79.3832);

    // Step 6: Get complete contractor profile
    const profileResponse = await request(app.getHttpServer())
      .get(`/api/v1/contractors/${contractorId}`)
      .expect(200);

    expect(profileResponse.body).toHaveProperty('id', contractorId);
    expect(profileResponse.body).toHaveProperty('categories');
    expect(profileResponse.body.categories.length).toBe(2);
    expect(profileResponse.body).toHaveProperty('portfolio');
    expect(profileResponse.body.portfolio.length).toBe(2);
    expect(profileResponse.body).toHaveProperty('latitude', 43.6532);
    expect(profileResponse.body).toHaveProperty('longitude', -79.3832);

    // Step 7: Verify data integrity
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        categories: true,
        portfolio: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    expect(contractor?.categories.length).toBe(2);
    expect(contractor?.portfolio.length).toBe(2);
    expect(contractor?.latitude).toBe(43.6532);
    expect(contractor?.longitude).toBe(-79.3832);
  });
});

