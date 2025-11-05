import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class AnalyticsService {
  private readonly ipHashSalt: string;

  constructor(private readonly prisma: PrismaService) {
    // Use environment variable for salt, or generate a default (should be set in production)
    this.ipHashSalt = process.env.ANALYTICS_IP_SALT || 'default-salt-change-in-production';
  }

  /**
   * Hash IP address with SHA-256 for privacy (PIPEDA compliance)
   */
  private hashIpAddress(ip: string): string {
    if (!ip) {
      return '';
    }

    // Remove port if present
    const cleanIp = ip.split(':')[0];

    // Hash with salt
    return createHash('sha256')
      .update(cleanIp + this.ipHashSalt)
      .digest('hex');
  }

  /**
   * Detect and anonymize PII in search queries
   */
  anonymizeQuery(query: string): string {
    if (!query) {
      return query;
    }

    let anonymized = query;

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    anonymized = anonymized.replace(emailPattern, '[REDACTED]');

    // Phone pattern (Canadian)
    const phonePattern = /\b(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
    anonymized = anonymized.replace(phonePattern, '[REDACTED]');

    // SIN pattern (Canadian Social Insurance Number)
    const sinPattern = /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/g;
    anonymized = anonymized.replace(sinPattern, '[REDACTED]');

    return anonymized;
  }

  /**
   * Create analytics event
   */
  async createEvent(
    eventType: string,
    sessionId: string,
    entityId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // Hash IP address
    const ipHash = ipAddress ? this.hashIpAddress(ipAddress) : null;

    // Anonymize user agent (remove PII if any)
    const anonymizedUserAgent = userAgent ? userAgent.substring(0, 200) : null;

    // Ensure metadata doesn't contain PII
    const safeMetadata = this.sanitizeMetadata(metadata);

    await this.prisma.analyticsEvent.create({
      data: {
        eventType,
        sessionId,
        entityId,
        metadata: safeMetadata || undefined,
        ipHash,
        userAgent: anonymizedUserAgent,
      },
    });
  }

  /**
   * Sanitize metadata to remove any potential PII
   */
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) {
      return undefined;
    }

    const safe: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Skip PII fields
      if (
        ['email', 'phone', 'name', 'userId', 'user_id', 'emailAddress', 'phoneNumber'].includes(
          key.toLowerCase(),
        )
      ) {
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        safe[key] = this.sanitizeMetadata(value);
      } else if (Array.isArray(value)) {
        safe[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? this.sanitizeMetadata(item) : item,
        );
      } else {
        safe[key] = value;
      }
    }

    return safe;
  }
}

