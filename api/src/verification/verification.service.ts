import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';

/**
 * Verification Service (Stub)
 * This is a placeholder for Stripe Identity integration
 * TODO: Implement real Stripe Identity integration in Phase 6 (Payments)
 */
@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create verification session (stub)
   * Returns stub data until Stripe Identity is integrated
   */
  async createVerificationSession(userId: string) {
    return {
      sessionId: `stub_session_${Date.now()}`,
      url: 'https://verify.stripe.com/start/stub',
      status: 'pending',
      message: 'Verification stub - Stripe Identity integration coming in Phase 6',
      note: 'This is a placeholder endpoint. Real verification will be implemented with Stripe Identity.',
    };
  }

  /**
   * Get verification status (stub)
   * Returns pending status until Stripe Identity is integrated
   */
  async getVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { contractor: true },
    });

    return {
      status: user?.contractor?.verificationStatus || 'PENDING',
      verified: false,
      message: 'Verification stub - Real status will be available after Stripe Identity integration',
      note: 'This is a placeholder. Real verification status will come from Stripe Identity.',
    };
  }
}

