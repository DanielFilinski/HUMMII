import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Rate Limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login (5 requests per minute)', () => {
    it('should allow 5 login attempts', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      };

      // First 5 attempts should return 401 (unauthorized, not rate limited)
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.message).toContain('Invalid credentials');
      }
    });

    it('should rate limit 6th login attempt', async () => {
      const loginDto = {
        email: 'ratelimit-test@example.com',
        password: 'WrongPassword123!',
      };

      // First 5 attempts
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(HttpStatus.UNAUTHORIZED);
      }

      // 6th attempt should be rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.headers['x-ratelimit-limit']).toBe('5');
      expect(response.headers['x-ratelimit-remaining']).toBe('0');
      expect(response.headers['retry-after']).toBeDefined();
    });
  });

  describe('POST /auth/register (3 requests per hour)', () => {
    it('should allow 3 registration attempts', async () => {
      // First 3 attempts (will fail validation, but won't be rate limited)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `test${i}@example.com`,
            password: 'ValidPassword123!',
            name: 'Test User',
          })
          .expect([HttpStatus.CREATED, HttpStatus.BAD_REQUEST]);
      }
    });

    it('should rate limit 4th registration attempt', async () => {
      // First 3 attempts
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: `ratelimit${i}@example.com`,
            password: 'ValidPassword123!',
            name: 'Test User',
          });
      }

      // 4th attempt should be rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'ratelimit4@example.com',
          password: 'ValidPassword123!',
          name: 'Test User',
        })
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.body.message).toContain('ThrottlerException');
    });
  });

  describe('POST /auth/password-reset/request (3 requests per minute)', () => {
    it('should allow 3 password reset requests', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/auth/password-reset/request')
          .send({ email: 'test@example.com' })
          .expect(HttpStatus.OK);
      }
    });

    it('should rate limit 4th password reset request', async () => {
      // First 3 attempts
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/auth/password-reset/request')
          .send({ email: 'reset-test@example.com' });
      }

      // 4th attempt should be rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/password-reset/request')
        .send({ email: 'reset-test@example.com' })
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.headers['x-ratelimit-limit']).toBe('3');
      expect(response.headers['retry-after']).toBeDefined();
    });
  });

  describe('POST /auth/refresh (10 requests per minute)', () => {
    it('should allow 10 refresh attempts', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken: 'invalid-token' })
          .expect([HttpStatus.UNAUTHORIZED, HttpStatus.BAD_REQUEST]);
      }
    });

    it('should rate limit 11th refresh attempt', async () => {
      // First 10 attempts
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({ refreshToken: 'invalid-token' });
      }

      // 11th attempt should be rate limited
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.headers['x-ratelimit-limit']).toBe('10');
    });
  });

  describe('Rate limit headers', () => {
    it('should include rate limit headers in successful responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('should include Retry-After header in 429 responses', async () => {
      // Exhaust rate limit
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'retry-test@example.com',
            password: 'WrongPassword123!',
          });
      }

      // Next request should include Retry-After
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'retry-test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.headers['retry-after']).toBeDefined();
      const retryAfter = parseInt(response.headers['retry-after'], 10);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60); // Should be within 60 seconds
    });
  });

  describe('Global rate limit (100 requests per minute)', () => {
    it('should rate limit any endpoint after 100 requests', async () => {
      // Make 100 requests to a safe endpoint (GET /users/me will fail with 401, but that's OK)
      for (let i = 0; i < 100; i++) {
        await request(app.getHttpServer()).get('/users/me');
      }

      // 101st request should be rate limited
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .expect(HttpStatus.TOO_MANY_REQUESTS);

      expect(response.body.message).toContain('ThrottlerException');
    });
  });
});

