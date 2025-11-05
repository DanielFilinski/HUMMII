import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { createTestUser, createAdminUser } from './helpers/test-db';

describe('SEO & Analytics E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contractorToken: string;
  let adminToken: string;
  let contractorId: string;
  let adminId: string;

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
    await prisma.analyticsEvent.deleteMany({});
    await prisma.searchAnalytics.deleteMany({});
    await prisma.contractorSlug.deleteMany({});
    await prisma.urlRedirect.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});

    // Create contractor user
    const contractor = await createTestUser(prisma, {
      email: 'contractor-seo@test.com',
      password: 'TestPassword123!',
      name: 'SEO Contractor',
      isVerified: true,
      roles: [UserRole.CONTRACTOR],
    });
    contractorId = contractor.id;

    // Create contractor profile
    await prisma.contractor.create({
      data: {
        userId: contractorId,
        bio: 'Test contractor for SEO',
        hourlyRate: 50,
        businessName: 'SEO Test Services',
      },
    });

    const contractorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'contractor-seo@test.com',
        password: 'TestPassword123!',
      });
    contractorToken = contractorLogin.body.accessToken;

    // Create admin user
    const admin = await createAdminUser(prisma, {
      email: 'admin-seo@test.com',
      password: 'AdminPassword123!',
      name: 'SEO Admin',
    });
    adminId = admin.id;

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin-seo@test.com',
        password: 'AdminPassword123!',
      });
    adminToken = adminLogin.body.accessToken;
  });

  afterAll(async () => {
    // Clean up
    await prisma.analyticsEvent.deleteMany({});
    await prisma.searchAnalytics.deleteMany({});
    await prisma.contractorSlug.deleteMany({});
    await prisma.urlRedirect.deleteMany({});
    await prisma.contractor.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('SEO Endpoints', () => {
    describe('/api/v1/seo/generate-slug (POST)', () => {
      it('should generate unique slug for contractor', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/seo/generate-slug')
          .set('Authorization', `Bearer ${contractorToken}`)
          .send({
            businessName: 'Test Plumbing Services',
            city: 'Toronto',
            province: 'ON',
          })
          .expect(201);

        expect(response.body).toHaveProperty('slug');
        expect(response.body).toHaveProperty('contractorId', contractorId);
        expect(response.body.slug).toContain('test-plumbing-services');
      });

      it('should return 403 for non-contractor', async () => {
        const client = await createTestUser(prisma, {
          email: 'client-seo@test.com',
          password: 'TestPassword123!',
          name: 'Client User',
          isVerified: true,
          roles: [UserRole.CLIENT],
        });

        const clientLogin = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'client-seo@test.com',
            password: 'TestPassword123!',
          });

        await request(app.getHttpServer())
          .post('/api/v1/seo/generate-slug')
          .set('Authorization', `Bearer ${clientLogin.body.accessToken}`)
          .send({
            businessName: 'Test Services',
          })
          .expect(403);
      });

      it('should enforce rate limiting', async () => {
        // Try to generate 6 slugs (limit is 5 per hour)
        const promises = [];
        for (let i = 0; i < 6; i++) {
          promises.push(
            request(app.getHttpServer())
              .post('/api/v1/seo/generate-slug')
              .set('Authorization', `Bearer ${contractorToken}`)
              .send({
                businessName: `Test Service ${i}`,
              }),
          );
        }

        const responses = await Promise.all(promises);
        const lastResponse = responses[responses.length - 1];

        // Last request should be rate limited
        expect(lastResponse.status).toBe(429);
      });
    });

    describe('/api/v1/seo/validate-slug/:slug (GET)', () => {
      it('should validate slug availability', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/seo/validate-slug/test-slug-availability')
          .expect(200);

        expect(response.body).toHaveProperty('slug');
        expect(response.body).toHaveProperty('available');
        expect(typeof response.body.available).toBe('boolean');
      });

      it('should return false for existing slug', async () => {
        // Create a slug first
        await prisma.contractorSlug.create({
          data: {
            contractorId,
            slug: 'existing-slug-test',
            isActive: true,
          },
        });

        const response = await request(app.getHttpServer())
          .get('/api/v1/seo/validate-slug/existing-slug-test')
          .expect(200);

        expect(response.body.available).toBe(false);
      });
    });

    describe('/api/v1/seo/update-slug (PATCH)', () => {
      it('should update contractor slug and create redirect', async () => {
        // Create initial slug
        await prisma.contractorSlug.create({
          data: {
            contractorId,
            slug: 'old-slug-test',
            isActive: true,
          },
        });

        const response = await request(app.getHttpServer())
          .patch('/api/v1/seo/update-slug')
          .set('Authorization', `Bearer ${contractorToken}`)
          .send({
            slug: 'new-slug-test',
          })
          .expect(200);

        expect(response.body).toHaveProperty('slug', 'new-slug-test');

        // Verify redirect was created
        const redirect = await prisma.urlRedirect.findFirst({
          where: {
            fromUrl: '/performer/old-slug-test',
            toUrl: '/performer/new-slug-test',
          },
        });
        expect(redirect).toBeTruthy();
      });
    });

    describe('/api/v1/seo/metadata/:contractorId (GET)', () => {
      it('should get SEO metadata for contractor', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/seo/metadata/${contractorId}`)
          .expect(200);

        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('keywords');
      });

      it('should return 404 for non-existent contractor', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        await request(app.getHttpServer())
          .get(`/api/v1/seo/metadata/${fakeId}`)
          .expect(404);
      });
    });

    describe('/api/v1/seo/opengraph/:contractorId (GET)', () => {
      it('should get OpenGraph metadata', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/seo/opengraph/${contractorId}`)
          .expect(200);

        expect(response.body).toHaveProperty('og:title');
        expect(response.body).toHaveProperty('og:description');
        expect(response.body).toHaveProperty('og:url');
      });
    });

    describe('/api/v1/seo/structured-data/:contractorId (GET)', () => {
      it('should get JSON-LD structured data', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/seo/structured-data/${contractorId}`)
          .expect(200);

        expect(response.body).toHaveProperty('@context');
        expect(response.body).toHaveProperty('@type');
      });
    });

    describe('/sitemap.xml (GET)', () => {
      it('should get main sitemap', async () => {
        const response = await request(app.getHttpServer())
          .get('/sitemap.xml')
          .expect(200);

        expect(response.headers['content-type']).toContain('application/xml');
        expect(response.text).toContain('sitemap');
      });
    });

    describe('/sitemap-contractors.xml (GET)', () => {
      it('should get contractors sitemap', async () => {
        const response = await request(app.getHttpServer())
          .get('/sitemap-contractors.xml')
          .expect(200);

        expect(response.headers['content-type']).toContain('application/xml');
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('/api/v1/analytics/track-view (POST)', () => {
      it('should track view event anonymously', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/analytics/track-view')
          .send({
            sessionId: 'test-session-123',
            viewType: 'profile',
            entityId: contractorId,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          })
          .expect(204);

        expect(response.body).toEqual({});
      });

      it('should enforce rate limiting', async () => {
        // Send 101 requests (limit is 100 per hour)
        const promises = [];
        for (let i = 0; i < 101; i++) {
          promises.push(
            request(app.getHttpServer())
              .post('/api/v1/analytics/track-view')
              .send({
                sessionId: `test-session-${i}`,
                viewType: 'profile',
                entityId: contractorId,
              }),
          );
        }

        const responses = await Promise.all(promises);
        const lastResponse = responses[responses.length - 1];

        // Last request should be rate limited
        expect(lastResponse.status).toBe(429);
      });

      it('should hash IP address for privacy (PIPEDA compliance)', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/analytics/track-view')
          .send({
            sessionId: 'test-session-privacy',
            viewType: 'profile',
            entityId: contractorId,
            ipAddress: '192.168.1.1',
          })
          .expect(204);

        // Verify IP is hashed in database
        const event = await prisma.analyticsEvent.findFirst({
          where: {
            sessionId: 'test-session-privacy',
          },
        });
        expect(event?.ipAddress).not.toBe('192.168.1.1');
        expect(event?.ipAddress).toHaveLength(64); // SHA-256 hash length
      });
    });

    describe('/api/v1/analytics/track-search (POST)', () => {
      it('should track search query anonymously', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/analytics/track-search')
          .send({
            sessionId: 'test-session-search',
            query: 'plumber toronto',
            category: 'plumbing',
            location: 'Toronto',
            results: 25,
          })
          .expect(204);

        expect(response.body).toEqual({});
      });

      it('should anonymize PII in search queries', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/analytics/track-search')
          .send({
            sessionId: 'test-session-pii',
            query: 'plumber contact@example.com',
            results: 10,
          })
          .expect(204);

        // Verify PII is anonymized in database
        const search = await prisma.searchAnalytics.findFirst({
          where: {
            sessionId: 'test-session-pii',
          },
        });
        expect(search?.query).not.toContain('contact@example.com');
      });
    });

    describe('/api/v1/analytics/track-conversion (POST)', () => {
      it('should track conversion event anonymously', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/analytics/track-conversion')
          .send({
            sessionId: 'test-session-conversion',
            conversionType: 'order_created',
            entityId: 'order-123',
          })
          .expect(204);

        expect(response.body).toEqual({});
      });
    });

    describe('/api/v1/admin/analytics/overview (GET)', () => {
      it('should get analytics overview (admin only)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/overview')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalViews');
        expect(response.body).toHaveProperty('totalSearches');
        expect(response.body).toHaveProperty('totalConversions');
      });

      it('should return 403 for non-admin', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/overview')
          .set('Authorization', `Bearer ${contractorToken}`)
          .expect(403);
      });
    });

    describe('/api/v1/admin/analytics/contractors (GET)', () => {
      it('should get contractor performance analytics (admin only)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/contractors')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('/api/v1/admin/analytics/searches (GET)', () => {
      it('should get search analytics (admin only)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/searches')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('/api/v1/admin/analytics/conversions (GET)', () => {
      it('should get conversion analytics (admin only)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/conversions')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('/api/v1/admin/analytics/export (GET)', () => {
      it('should export analytics data (admin only)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/export')
          .query({ format: 'json', startDate: '2025-01-01', endDate: '2025-12-31' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('format', 'json');
      });

      it('should export as CSV', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/analytics/export')
          .query({ format: 'csv' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('text/csv');
      });
    });
  });
});

