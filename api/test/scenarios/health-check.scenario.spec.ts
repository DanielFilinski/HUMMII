import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

/**
 * 🚀 Quick Health Check Scenario
 * 
 * Tests: API availability and basic functionality
 * Steps:
 * 1. Health Check
 * 2. Get API Version
 */
describe('🚀 Quick Health Check Scenario (E2E)', () => {
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

  describe('Step 1: Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      
      console.log('✅ Step 1: Health Check - PASSED');
    });
  });

  describe('Step 2: Get API Version', () => {
    it('should return API version info', async () => {
      const response = await request(app.getHttpServer())
        .get('/version')
        .expect(200);

      expect(response.body).toHaveProperty('version');
      
      console.log('✅ Step 2: API Version - PASSED');
      console.log('🎉 Quick Health Check Scenario - ALL TESTS PASSED!');
    });
  });
});
