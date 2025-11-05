import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

/**
 * Feature Flags Service
 * 
 * Provides feature flag checking functionality.
 * Supports rollout percentages for gradual feature releases.
 */
@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if feature flag is enabled for a user
   * 
   * @param flagName Feature flag name
   * @param userId User ID (for rollout percentage calculation)
   * @returns true if feature is enabled for this user
   */
  async isEnabled(flagName: string, userId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name: flagName },
    });

    if (!flag) {
      return false; // Flag doesn't exist, feature is disabled
    }

    if (!flag.enabled) {
      return false; // Flag is disabled
    }

    // If rollout percentage is 100, enable for all users
    if (flag.rolloutPercentage >= 100) {
      return true;
    }

    // If no userId provided, check only if flag is enabled (ignore rollout)
    if (!userId) {
      return flag.enabled;
    }

    // Calculate if user should have access based on rollout percentage
    // Use consistent hashing based on userId to ensure same user always gets same result
    const hash = this.hashUserId(userId);
    const userPercentage = hash % 100;

    return userPercentage < flag.rolloutPercentage;
  }

  /**
   * Get feature flag value
   * 
   * @param flagName Feature flag name
   * @returns Feature flag object or null if not found
   */
  async getFlag(flagName: string) {
    return this.prisma.featureFlag.findUnique({
      where: { name: flagName },
    });
  }

  /**
   * Get all enabled feature flags
   * 
   * @returns Array of enabled feature flag names
   */
  async getEnabledFlags(): Promise<string[]> {
    const flags = await this.prisma.featureFlag.findMany({
      where: { enabled: true },
      select: { name: true },
    });

    return flags.map((flag) => flag.name);
  }

  /**
   * Hash user ID to get consistent percentage (0-99)
   * Uses simple hash function for consistent results
   * 
   * @param userId User ID
   * @returns Hash value (0-99)
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }
}


