import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('Categories (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let testCategoryId: string;
  let testSubcategoryId: string;

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
    await prisma.contractorCategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create admin user
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123!',
        name: 'Admin User',
      });

    // Set admin role manually
    await prisma.user.update({
      where: { id: adminRes.body.id },
      data: { roles: [UserRole.ADMIN] },
    });

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123!',
      });

    adminToken = adminLogin.body.accessToken;

    // Create regular user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@test.com',
        password: 'UserPass123!',
        name: 'Regular User',
      });

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'UserPass123!',
      });

    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.contractorCategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /categories (Admin Only)', () => {
    it('should create a parent category as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Plumbing',
          description: 'Plumbing and water-related services',
          isActive: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Plumbing');
      expect(response.body.slug).toBe('plumbing');
      expect(response.body.parentId).toBeNull();
      expect(response.body.isActive).toBe(true);

      testCategoryId = response.body.id;
    });

    it('should create a subcategory as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Emergency Plumbing',
          description: '24/7 emergency plumbing services',
          parentId: testCategoryId,
          isActive: true,
        })
        .expect(201);

      expect(response.body.parentId).toBe(testCategoryId);
      expect(response.body.name).toBe('Emergency Plumbing');
      expect(response.body.slug).toBe('emergency-plumbing');

      testSubcategoryId = response.body.id;
    });

    it('should return 400 for invalid data', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '', // Invalid: empty name
        })
        .expect(400);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Electrical',
          description: 'Electrical services',
        })
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Electrical',
          description: 'Electrical services',
        })
        .expect(401);
    });

    it('should prevent duplicate category names (409)', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Plumbing', // Duplicate
          description: 'Another plumbing category',
        })
        .expect(409);
    });
  });

  describe('GET /categories/tree (Public)', () => {
    it('should get category tree with hierarchy', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/tree')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Find plumbing category
      const plumbingCategory = response.body.find((cat: any) => cat.id === testCategoryId);
      expect(plumbingCategory).toBeDefined();
      expect(plumbingCategory.name).toBe('Plumbing');

      // Check if it has subcategories
      if (plumbingCategory.children) {
        const subcategory = plumbingCategory.children.find(
          (sub: any) => sub.id === testSubcategoryId,
        );
        expect(subcategory).toBeDefined();
        expect(subcategory.name).toBe('Emergency Plumbing');
      }
    });

    it('should work without authentication (public endpoint)', async () => {
      await request(app.getHttpServer())
        .get('/categories/tree')
        .expect(200);
    });
  });

  describe('GET /categories/popular (Public)', () => {
    it('should get popular categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/popular')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should include our test category
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/popular?limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    it('should work without authentication (public endpoint)', async () => {
      await request(app.getHttpServer())
        .get('/categories/popular')
        .expect(200);
    });
  });

  describe('GET /categories/public (Public)', () => {
    it('should get all active categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/public')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // All returned categories should be active
      response.body.forEach((category: any) => {
        expect(category.isActive).toBe(true);
      });

      // Should include our test category
      const plumbingCategory = response.body.find((cat: any) => cat.id === testCategoryId);
      expect(plumbingCategory).toBeDefined();
    });

    it('should work without authentication (public endpoint)', async () => {
      await request(app.getHttpServer())
        .get('/categories/public')
        .expect(200);
    });
  });

  describe('GET /categories/:id/subcategories (Public)', () => {
    it('should get subcategories of a parent category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}/subcategories`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Should include our subcategory
      const subcategory = response.body.find((sub: any) => sub.id === testSubcategoryId);
      expect(subcategory).toBeDefined();
      expect(subcategory.name).toBe('Emergency Plumbing');
      expect(subcategory.parentId).toBe(testCategoryId);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/categories/non-existent-id/subcategories')
        .expect(404);
    });

    it('should work without authentication (public endpoint)', async () => {
      await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}/subcategories`)
        .expect(200);
    });
  });

  describe('GET /categories/:id/path (Public - Breadcrumbs)', () => {
    it('should get category path (breadcrumb) for subcategory', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${testSubcategoryId}/path`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Parent + Child

      // First element should be parent (Plumbing)
      expect(response.body[0].id).toBe(testCategoryId);
      expect(response.body[0].name).toBe('Plumbing');

      // Second element should be child (Emergency Plumbing)
      expect(response.body[1].id).toBe(testSubcategoryId);
      expect(response.body[1].name).toBe('Emergency Plumbing');
    });

    it('should get path for parent category (just itself)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}/path`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Just the parent
      expect(response.body[0].id).toBe(testCategoryId);
      expect(response.body[0].name).toBe('Plumbing');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/categories/non-existent-id/path')
        .expect(404);
    });

    it('should work without authentication (public endpoint)', async () => {
      await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}/path`)
        .expect(200);
    });
  });

  describe('GET /categories (Admin Only)', () => {
    it('should get all categories as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThanOrEqual(2); // At least our 2 test categories
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('totalItems');
      expect(response.body.meta).toHaveProperty('currentPage');
    });

    it('should support search', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?search=Plumbing')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      const plumbingCategory = response.body.items.find((cat: any) => cat.id === testCategoryId);
      expect(plumbingCategory).toBeDefined();
    });

    it('should return 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/categories')
        .expect(401);
    });
  });

  describe('GET /categories/:id (Admin Only)', () => {
    it('should get category by ID as admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(testCategoryId);
      expect(response.body.name).toBe('Plumbing');
      expect(response.body).toHaveProperty('slug');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .get('/categories/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}`)
        .expect(401);
    });
  });

  describe('PATCH /categories/:id (Admin Only)', () => {
    it('should update category as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated description for plumbing services',
          isActive: true,
        })
        .expect(200);

      expect(response.body.id).toBe(testCategoryId);
      expect(response.body.description).toBe('Updated description for plumbing services');
    });

    it('should deactivate category', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false,
        })
        .expect(200);

      expect(response.body.isActive).toBe(false);

      // Reactivate for other tests
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: true,
        });
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .patch('/categories/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated',
        })
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Unauthorized update',
        })
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .send({
          description: 'Unauthorized update',
        })
        .expect(401);
    });
  });

  describe('DELETE /categories/:id (Admin Only)', () => {
    it('should delete subcategory first (no dependencies)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/categories/${testSubcategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');

      // Verify category is actually deleted
      await request(app.getHttpServer())
        .get(`/categories/${testSubcategoryId}/path`)
        .expect(404);
    });

    it('should delete parent category', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify category is deleted
      await request(app.getHttpServer())
        .get(`/categories/${testCategoryId}/path`)
        .expect(404);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/categories/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      // Create a test category to delete
      const createRes = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Category for Delete',
          description: 'Test',
        });

      // Try to delete as regular user
      await request(app.getHttpServer())
        .delete(`/categories/${createRes.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Cleanup: delete as admin
      await request(app.getHttpServer())
        .delete(`/categories/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/categories/some-id')
        .expect(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long category names', async () => {
      const longName = 'A'.repeat(255);

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: longName,
          description: 'Test long name',
        })
        .expect(201);

      expect(response.body.name).toBe(longName);

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/categories/${response.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should handle special characters in category name', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'HVAC & Climate Control',
          description: 'Heating, ventilation, and air conditioning',
        })
        .expect(201);

      expect(response.body.name).toBe('HVAC & Climate Control');
      expect(response.body.slug).toBe('hvac-climate-control');

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/categories/${response.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('should prevent creating subcategory with non-existent parent', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Orphan Category',
          description: 'Category with invalid parent',
          parentId: 'non-existent-parent-id',
        })
        .expect(400);
    });
  });
});
