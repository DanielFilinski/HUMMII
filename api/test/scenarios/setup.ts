import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Setup file for scenario tests
 * Runs before all tests
 */
beforeAll(async () => {
  console.log('\n🚀 Initializing Scenario Tests...\n');
  
  // Ensure database connection
  await prisma.$connect();
  
  console.log('✅ Database connected');
  console.log('📦 Test environment ready\n');
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  console.log('\n🧹 Cleaning up...');
  
  await prisma.$disconnect();
  
  console.log('✅ Cleanup complete\n');
});

/**
 * Global error handler
 */
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});
