import { PrismaClient, UserRole } from '@prisma/client';

/**
 * Test Database Helper
 * Provides utility methods for managing test database state
 */
export class TestDatabase {
  private prisma: PrismaClient;

  /**
   * Initialize test database connection
   */
  async setup(): Promise<PrismaClient> {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    await this.prisma.$connect();
    await this.cleanDatabase();
    return this.prisma;
  }

  /**
   * Clean all tables in correct order (respecting foreign key constraints)
   */
  async cleanDatabase(): Promise<void> {
    // Delete in order to respect foreign key constraints
    await this.prisma.session.deleteMany({});
    await this.prisma.auditLog.deleteMany({});
    await this.prisma.user.deleteMany({});
  }

  /**
   * Teardown database connection and cleanup
   */
  async teardown(): Promise<void> {
    await this.cleanDatabase();
    await this.prisma.$disconnect();
  }

  /**
   * Get Prisma client instance
   */
  getClient(): PrismaClient {
    return this.prisma;
  }
}

/**
 * Create test user helper
 */
export async function createTestUser(
  prisma: PrismaClient,
  data?: Partial<{
    email: string;
    password: string;
    name: string;
    phone: string;
    isVerified: boolean;
    roles: string[];
  }>,
) {
  const bcrypt = await import('bcryptjs');
  
  const hashedPassword = await bcrypt.hash(
    data?.password || 'TestPassword123!',
    12,
  );

  return prisma.user.create({
    data: {
      email: data?.email || `test${Date.now()}@example.com`,
      password: hashedPassword,
      name: data?.name || 'Test User',
      phone: data?.phone,
      isVerified: data?.isVerified ?? true,
      roles: (data?.roles as UserRole[]) || [UserRole.CLIENT],
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });
}

/**
 * Create admin test user helper
 */
export async function createAdminUser(
  prisma: PrismaClient,
  data?: Partial<{
    email: string;
    password: string;
    name: string;
  }>,
) {
  return createTestUser(prisma, {
    ...data,
    roles: ['ADMIN'],
    isVerified: true,
  });
}

