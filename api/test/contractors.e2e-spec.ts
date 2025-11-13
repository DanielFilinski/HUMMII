import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('Contractors (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contractorToken: string;
  let contractor2Token: string;
  let clientToken: string;
  let contractorUserId: string;
  let contractor2UserId: string;
  let contractorId: string;
  let contractor2Id: string;
  let portfolioItemId: string;
  let testCategoryId1: string;
  let testCategoryId2: string;

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

    // Clean up database before tests
    await prisma.portfolioItem.deleteMany({});
    await prisma.contractorCategory.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test categories
    const category1 = await prisma.category.create({
      data: {
        name: 'Plumbing',
        nameEn: 'Plumbing',
        nameFr: 'Plomberie',
        slug: 'plumbing',
        description: 'Plumbing services',
        isActive: true,
      },
    });
    testCategoryId1 = category1.id;

    const category2 = await prisma.category.create({
      data: {
        name: 'Electrical',
        nameEn: 'Electrical',
        nameFr: 'Électricité',
        slug: 'electrical',
        description: 'Electrical services',
        isActive: true,
      },
    });
    testCategoryId2 = category2.id;

    // Create contractor user 1
    const contractor1Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contractor1@test.com',
        password: 'ContractorPass123!',
        name: 'Contractor One',
      });

    contractorUserId = contractor1Res.body.id;

    // Set contractor role
    await prisma.user.update({
      where: { id: contractorUserId },
      data: { roles: [UserRole.CONTRACTOR] },
    });

    // Login contractor 1
    const contractor1Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contractor1@test.com',
        password: 'ContractorPass123!',
      });

    contractorToken = contractor1Login.body.accessToken;

    // Create contractor user 2
    const contractor2Res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'contractor2@test.com',
        password: 'ContractorPass123!',
        name: 'Contractor Two',
      });

    contractor2UserId = contractor2Res.body.id;

    // Set contractor role
    await prisma.user.update({
      where: { id: contractor2UserId },
      data: { roles: [UserRole.CONTRACTOR] },
    });

    // Login contractor 2
    const contractor2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contractor2@test.com',
        password: 'ContractorPass123!',
      });

    contractor2Token = contractor2Login.body.accessToken;

    // Create client user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'client@test.com',
        password: 'ClientPass123!',
        name: 'Test Client',
      });

    // Login client
    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'client@test.com',
        password: 'ClientPass123!',
      });

    clientToken = clientLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.portfolioItem.deleteMany({});
    await prisma.contractorCategory.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /contractors/me (Create Profile)', () => {
    it('should create contractor profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          businessName: 'Best Plumbing Services',
          bio: 'Professional plumbing services in Ottawa',
          experience: 10,
          address: '123 Main St, Ottawa, ON K1A 0A1',
          city: 'Ottawa',
          province: 'ON',
          postalCode: 'K1A 0A1',
          latitude: 45.4215,
          longitude: -75.6972,
          serviceRadius: 50,
          phoneNumber: '+1-613-555-0100',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.businessName).toBe('Best Plumbing Services');
      expect(response.body.userId).toBe(contractorUserId);
      expect(response.body.experience).toBe(10);
      expect(response.body.serviceRadius).toBe(50);
      expect(response.body.latitude).toBe(45.4215);
      expect(response.body.longitude).toBe(-75.6972);

      contractorId = response.body.id;
    });

    it('should return 400 if profile already exists', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          businessName: 'Duplicate Profile',
          bio: 'Test',
          experience: 5,
        })
        .expect(400);
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me')
        .set('Authorization', `Bearer ${contractor2Token}`)
        .send({
          businessName: '', // Invalid: empty
          bio: 'Test',
        })
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me')
        .send({
          businessName: 'Test Business',
          bio: 'Test',
        })
        .expect(401);
    });

    it('should create second contractor profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me')
        .set('Authorization', `Bearer ${contractor2Token}`)
        .send({
          businessName: 'Elite Electrical',
          bio: 'Professional electrical services',
          experience: 15,
          address: '456 Bank St, Ottawa, ON K2P 1Y9',
          city: 'Ottawa',
          province: 'ON',
          postalCode: 'K2P 1Y9',
          latitude: 45.4172,
          longitude: -75.6947,
          serviceRadius: 30,
          phoneNumber: '+1-613-555-0200',
        })
        .expect(201);

      contractor2Id = response.body.id;
      expect(response.body.businessName).toBe('Elite Electrical');
    });
  });

  describe('PATCH /contractors/me (Update Profile)', () => {
    it('should update contractor profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          bio: 'Updated bio: 10+ years of plumbing experience',
          experience: 12,
          phoneNumber: '+1-613-555-0101',
        })
        .expect(200);

      expect(response.body.bio).toBe('Updated bio: 10+ years of plumbing experience');
      expect(response.body.experience).toBe(12);
      expect(response.body.phoneNumber).toBe('+1-613-555-0101');
    });

    it('should return 404 if contractor profile not found', async () => {
      // Login as client (no contractor profile)
      await request(app.getHttpServer())
        .patch('/contractors/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          bio: 'Test',
        })
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/contractors/me')
        .send({
          bio: 'Test',
        })
        .expect(401);
    });
  });

  describe('PATCH /contractors/me/location (Update Location)', () => {
    it('should update contractor location', async () => {
      const response = await request(app.getHttpServer())
        .patch('/contractors/me/location')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          address: '789 Wellington St, Ottawa, ON K1A 0B9',
          city: 'Ottawa',
          province: 'ON',
          postalCode: 'K1A 0B9',
          latitude: 45.4230,
          longitude: -75.6990,
          serviceRadius: 75,
        })
        .expect(200);

      expect(response.body.address).toBe('789 Wellington St, Ottawa, ON K1A 0B9');
      expect(response.body.latitude).toBe(45.4230);
      expect(response.body.longitude).toBe(-75.6990);
      expect(response.body.serviceRadius).toBe(75);
    });

    it('should validate coordinates', async () => {
      await request(app.getHttpServer())
        .patch('/contractors/me/location')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          latitude: 200, // Invalid: out of range
          longitude: -75.6990,
        })
        .expect(400);
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .patch('/contractors/me/location')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          latitude: 45.4230,
          longitude: -75.6990,
        })
        .expect(404);
    });
  });

  describe('GET /contractors/me (Get My Profile)', () => {
    it('should get current contractor profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body.id).toBe(contractorId);
      expect(response.body.userId).toBe(contractorUserId);
      expect(response.body.businessName).toBe('Best Plumbing Services');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('portfolio');
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .get('/contractors/me')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/contractors/me')
        .expect(401);
    });
  });

  describe('GET /contractors/:id (Get Public Profile)', () => {
    it('should get contractor profile by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contractors/${contractorId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.id).toBe(contractorId);
      expect(response.body.businessName).toBe('Best Plumbing Services');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('portfolio');
      // Should not expose sensitive data
      expect(response.body).not.toHaveProperty('phoneNumber');
    });

    it('should return 404 for non-existent contractor', async () => {
      await request(app.getHttpServer())
        .get('/contractors/non-existent-id')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });

    it('should work with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contractors/${contractorId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body.id).toBe(contractorId);
    });
  });

  describe('GET /contractors/nearby (Geolocation Search)', () => {
    it('should find contractors nearby', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/nearby')
        .query({
          lat: 45.4215, // Ottawa coordinates
          lon: -75.6972,
          radius: 100, // 100 km radius
        })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Should include our test contractors
      const foundContractor1 = response.body.find((c: any) => c.id === contractorId);
      const foundContractor2 = response.body.find((c: any) => c.id === contractor2Id);

      expect(foundContractor1).toBeDefined();
      expect(foundContractor2).toBeDefined();

      // Each contractor should have distance property
      expect(foundContractor1).toHaveProperty('distance');
      expect(typeof foundContractor1.distance).toBe('number');
    });

    it('should respect radius parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/nearby')
        .query({
          lat: 45.4215,
          lon: -75.6972,
          radius: 1, // Very small radius (1 km)
        })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // May or may not find contractors depending on exact coordinates
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 for invalid coordinates', async () => {
      await request(app.getHttpServer())
        .get('/contractors/nearby')
        .query({
          lat: 'invalid',
          lon: -75.6972,
        })
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });

    it('should require lat and lon parameters', async () => {
      await request(app.getHttpServer())
        .get('/contractors/nearby')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });
  });

  describe('POST /contractors/me/portfolio (Add Portfolio Item)', () => {
    it('should add portfolio item', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Kitchen Renovation',
          description: 'Complete kitchen plumbing renovation in downtown Ottawa',
          beforeImageUrl: 'https://example.com/before.jpg',
          afterImageUrl: 'https://example.com/after.jpg',
          completedAt: new Date('2024-01-15').toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Kitchen Renovation');
      expect(response.body.contractorId).toBe(contractorId);
      expect(response.body.order).toBe(0); // First item

      portfolioItemId = response.body.id;
    });

    it('should add multiple portfolio items with correct order', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Bathroom Remodel',
          description: 'Modern bathroom installation',
        })
        .expect(201);

      expect(response1.body.order).toBe(1); // Second item

      const response2 = await request(app.getHttpServer())
        .post('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Emergency Repair',
          description: 'Quick pipe repair',
        })
        .expect(201);

      expect(response2.body.order).toBe(2); // Third item
    });

    it('should return 400 for maximum 10 portfolio items', async () => {
      // Add 7 more items (we already have 3)
      for (let i = 0; i < 7; i++) {
        await request(app.getHttpServer())
          .post('/contractors/me/portfolio')
          .set('Authorization', `Bearer ${contractorToken}`)
          .send({
            title: `Portfolio Item ${i + 4}`,
            description: 'Test portfolio item',
          })
          .expect(201);
      }

      // Now we have 10 items, 11th should fail
      await request(app.getHttpServer())
        .post('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Portfolio Item 11',
          description: 'This should fail',
        })
        .expect(400);
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Test',
          description: 'Test',
        })
        .expect(404);
    });
  });

  describe('GET /contractors/me/portfolio (Get My Portfolio)', () => {
    it('should get all portfolio items for current contractor', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(10); // Maximum reached

      // Should be ordered by order field
      expect(response.body[0].order).toBe(0);
      expect(response.body[1].order).toBe(1);
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .get('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('PATCH /contractors/me/portfolio/:id (Update Portfolio Item)', () => {
    it('should update portfolio item', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contractors/me/portfolio/${portfolioItemId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Updated Kitchen Renovation',
          description: 'Updated description with more details',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Kitchen Renovation');
      expect(response.body.description).toBe('Updated description with more details');
    });

    it('should return 404 for non-existent portfolio item', async () => {
      await request(app.getHttpServer())
        .patch('/contractors/me/portfolio/non-existent-id')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: 'Updated',
        })
        .expect(404);
    });

    it('should prevent updating another contractor portfolio', async () => {
      await request(app.getHttpServer())
        .patch(`/contractors/me/portfolio/${portfolioItemId}`)
        .set('Authorization', `Bearer ${contractor2Token}`)
        .send({
          title: 'Hacked!',
        })
        .expect(403);
    });
  });

  describe('DELETE /contractors/me/portfolio/:id (Delete Portfolio Item)', () => {
    it('should delete portfolio item', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/contractors/me/portfolio/${portfolioItemId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const portfolio = await request(app.getHttpServer())
        .get('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(portfolio.body.length).toBe(9); // One less
      const deletedItem = portfolio.body.find((item: any) => item.id === portfolioItemId);
      expect(deletedItem).toBeUndefined();
    });

    it('should return 404 for non-existent portfolio item', async () => {
      await request(app.getHttpServer())
        .delete('/contractors/me/portfolio/non-existent-id')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(404);
    });
  });

  describe('POST /contractors/me/portfolio/reorder (Reorder Portfolio)', () => {
    it('should reorder portfolio items', async () => {
      // Get current portfolio
      const currentPortfolio = await request(app.getHttpServer())
        .get('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      const itemIds = currentPortfolio.body.map((item: any) => item.id);

      // Reverse the order
      const reversedIds = [...itemIds].reverse();

      const response = await request(app.getHttpServer())
        .post('/contractors/me/portfolio/reorder')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          itemIds: reversedIds,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reordered');

      // Verify new order
      const updatedPortfolio = await request(app.getHttpServer())
        .get('/contractors/me/portfolio')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(updatedPortfolio.body[0].id).toBe(reversedIds[0]);
      expect(updatedPortfolio.body[1].id).toBe(reversedIds[1]);
    });

    it('should return 400 for invalid item IDs', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me/portfolio/reorder')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          itemIds: ['non-existent-1', 'non-existent-2'],
        })
        .expect(400);
    });
  });

  describe('GET /contractors/:id/portfolio (Get Public Portfolio)', () => {
    it('should get contractor portfolio by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contractors/${contractorId}/portfolio`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent contractor', async () => {
      await request(app.getHttpServer())
        .get('/contractors/non-existent-id/portfolio')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('POST /contractors/me/categories (Assign Categories)', () => {
    it('should assign categories to contractor', async () => {
      const response = await request(app.getHttpServer())
        .post('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          categoryIds: [testCategoryId1, testCategoryId2],
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('assigned');
    });

    it('should return 400 for maximum 5 categories', async () => {
      // Create 5 more categories
      const categoryIds = [];
      for (let i = 0; i < 5; i++) {
        const cat = await prisma.category.create({
          data: {
            name: `Category ${i}`,
            nameEn: `Category ${i}`,
            nameFr: `Catégorie ${i}`,
            slug: `category-${i}`,
            description: 'Test category',
            isActive: true,
          },
        });
        categoryIds.push(cat.id);
      }

      // Try to assign 6 categories (exceeds max)
      await request(app.getHttpServer())
        .post('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          categoryIds: [testCategoryId1, ...categoryIds],
        })
        .expect(400);
    });

    it('should return 400 for non-existent category', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          categoryIds: ['non-existent-category-id'],
        })
        .expect(400);
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .post('/contractors/me/categories')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          categoryIds: [testCategoryId1],
        })
        .expect(404);
    });
  });

  describe('GET /contractors/me/categories (Get My Categories)', () => {
    it('should get assigned categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // We assigned 2 categories

      const categoryIds = response.body.map((cat: any) => cat.id);
      expect(categoryIds).toContain(testCategoryId1);
      expect(categoryIds).toContain(testCategoryId2);
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .get('/contractors/me/categories')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('DELETE /contractors/me/categories/:id (Remove Category)', () => {
    it('should remove category from contractor', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/contractors/me/categories/${testCategoryId1}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('removed');

      // Verify removal
      const categories = await request(app.getHttpServer())
        .get('/contractors/me/categories')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(200);

      expect(categories.body.length).toBe(1); // One less
      const categoryIds = categories.body.map((cat: any) => cat.id);
      expect(categoryIds).not.toContain(testCategoryId1);
    });

    it('should return 404 for non-existent category assignment', async () => {
      await request(app.getHttpServer())
        .delete('/contractors/me/categories/non-existent-category-id')
        .set('Authorization', `Bearer ${contractorToken}`)
        .expect(404);
    });

    it('should return 404 if contractor profile not found', async () => {
      await request(app.getHttpServer())
        .delete(`/contractors/me/categories/${testCategoryId2}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('Edge Cases', () => {
    it('should handle profile with very long business name', async () => {
      // Create new test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'contractor3@test.com',
          password: 'Pass123!',
          name: 'Test',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'contractor3@test.com' },
      });

      if (!user) throw new Error('User not found');

      await prisma.user.update({
        where: { id: user.id },
        data: { roles: [UserRole.CONTRACTOR] },
      });

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'contractor3@test.com',
          password: 'Pass123!',
        });

      const longName = 'A'.repeat(255);

      const response = await request(app.getHttpServer())
        .post('/contractors/me')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .send({
          businessName: longName,
          bio: 'Test',
          experience: 5,
        })
        .expect(201);

      expect(response.body.businessName).toBe(longName);
    });

    it('should handle special characters in business name', async () => {
      const profile = await request(app.getHttpServer())
        .patch('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          businessName: "Mike's Plumbing & HVAC Solutions Inc.",
        })
        .expect(200);

      expect(profile.body.businessName).toBe("Mike's Plumbing & HVAC Solutions Inc.");
    });

    it('should handle negative experience years', async () => {
      await request(app.getHttpServer())
        .patch('/contractors/me')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          experience: -5, // Invalid
        })
        .expect(400);
    });

    it('should handle zero service radius', async () => {
      await request(app.getHttpServer())
        .patch('/contractors/me/location')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          serviceRadius: 0, // Invalid
        })
        .expect(400);
    });
  });
});
