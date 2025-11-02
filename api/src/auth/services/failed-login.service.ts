import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

/**
 * Failed Login Tracking Service
 * Security Feature: Prevents brute-force attacks on login endpoint
 *
 * Features:
 * - Track failed login attempts per user
 * - Track failed login attempts per IP address
 * - Account lockout after max attempts (15 minutes)
 * - IP-based rate limiting
 * - Automatic unlock after timeout
 * - Audit logging for security monitoring
 *
 * PIPEDA Compliance: Logs security events for audit trail
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */
@Injectable()
export class FailedLoginService {
  private readonly logger = new Logger(FailedLoginService.name);

  // Configuration
  private readonly MAX_LOGIN_ATTEMPTS = 5; // Max failed attempts before lockout
  private readonly LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
  private readonly IP_MAX_ATTEMPTS = 10; // Max attempts per IP (stricter)
  private readonly IP_LOCKOUT_DURATION = 30 * 60; // 30 minutes for IP
  private readonly ATTEMPT_WINDOW = 60 * 60; // 1 hour window for counting attempts

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check if user account is locked
   * Throws UnauthorizedException if locked
   */
  async checkUserLockout(email: string): Promise<void> {
    const lockKey = this.getUserLockKey(email);
    const isLocked = await this.redis.get(lockKey);

    if (isLocked) {
      const ttl = await this.redis.ttl(lockKey);
      const minutesRemaining = Math.ceil(ttl / 60);

      this.logger.warn(`Login attempt for locked account: ${email}`);

      throw new UnauthorizedException(
        `Account temporarily locked due to too many failed login attempts. Try again in ${minutesRemaining} minutes.`,
      );
    }
  }

  /**
   * Check if IP address is locked
   * Throws UnauthorizedException if locked
   */
  async checkIpLockout(ipAddress: string): Promise<void> {
    const lockKey = this.getIpLockKey(ipAddress);
    const isLocked = await this.redis.get(lockKey);

    if (isLocked) {
      const ttl = await this.redis.ttl(lockKey);
      const minutesRemaining = Math.ceil(ttl / 60);

      this.logger.warn(`Login attempt from locked IP: ${ipAddress}`);

      throw new UnauthorizedException(
        `Too many login attempts from your IP address. Try again in ${minutesRemaining} minutes.`,
      );
    }
  }

  /**
   * Record failed login attempt
   * Increments counter and locks account/IP if threshold exceeded
   */
  async recordFailedAttempt(
    email: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<void> {
    // Increment user attempt counter
    const userAttempts = await this.incrementUserAttempts(email);

    // Increment IP attempt counter
    const ipAttempts = await this.incrementIpAttempts(ipAddress);

    // Log failed attempt for audit
    this.logger.warn(
      `Failed login attempt for ${email} from IP ${ipAddress} (attempt ${userAttempts}/${this.MAX_LOGIN_ATTEMPTS})`,
      {
        email,
        ipAddress,
        userAgent,
        userAttempts,
        ipAttempts,
      },
    );

    // Lock user account if threshold exceeded
    if (userAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      await this.lockUserAccount(email);
      this.logger.error(
        `Account locked due to ${userAttempts} failed login attempts: ${email}`,
      );
    }

    // Lock IP address if threshold exceeded
    if (ipAttempts >= this.IP_MAX_ATTEMPTS) {
      await this.lockIpAddress(ipAddress);
      this.logger.error(
        `IP address locked due to ${ipAttempts} failed login attempts: ${ipAddress}`,
      );
    }
  }

  /**
   * Record successful login
   * Clears failed attempt counters
   */
  async recordSuccessfulLogin(email: string, ipAddress: string): Promise<void> {
    // Clear user attempt counter
    await this.clearUserAttempts(email);

    // Note: We don't clear IP attempts to prevent IP rotation attacks
    // IP attempts will expire after ATTEMPT_WINDOW

    this.logger.log(`Successful login: ${email} from IP ${ipAddress}`);
  }

  /**
   * Get remaining attempts before lockout
   */
  async getRemainingAttempts(email: string): Promise<number> {
    const attemptKey = this.getUserAttemptKey(email);
    const attempts = await this.redis.get(attemptKey);
    const currentAttempts = attempts ? parseInt(attempts, 10) : 0;

    return Math.max(0, this.MAX_LOGIN_ATTEMPTS - currentAttempts);
  }

  /**
   * Manually unlock user account (admin action)
   */
  async unlockUserAccount(email: string): Promise<void> {
    const lockKey = this.getUserLockKey(email);
    const attemptKey = this.getUserAttemptKey(email);

    await this.redis.del(lockKey);
    await this.redis.del(attemptKey);

    this.logger.log(`User account manually unlocked: ${email}`);
  }

  /**
   * Manually unlock IP address (admin action)
   */
  async unlockIpAddress(ipAddress: string): Promise<void> {
    const lockKey = this.getIpLockKey(ipAddress);
    const attemptKey = this.getIpAttemptKey(ipAddress);

    await this.redis.del(lockKey);
    await this.redis.del(attemptKey);

    this.logger.log(`IP address manually unlocked: ${ipAddress}`);
  }

  /**
   * Get lockout status for user
   */
  async getUserLockoutStatus(email: string): Promise<{
    isLocked: boolean;
    attempts: number;
    remainingAttempts: number;
    lockoutExpiresIn?: number; // seconds
  }> {
    const lockKey = this.getUserLockKey(email);
    const attemptKey = this.getUserAttemptKey(email);

    const isLocked = (await this.redis.get(lockKey)) !== null;
    const attempts = await this.redis.get(attemptKey);
    const currentAttempts = attempts ? parseInt(attempts, 10) : 0;
    const remainingAttempts = Math.max(
      0,
      this.MAX_LOGIN_ATTEMPTS - currentAttempts,
    );

    let lockoutExpiresIn: number | undefined;
    if (isLocked) {
      lockoutExpiresIn = await this.redis.ttl(lockKey);
    }

    return {
      isLocked,
      attempts: currentAttempts,
      remainingAttempts,
      lockoutExpiresIn,
    };
  }

  // ========== Private Helper Methods ==========

  private async incrementUserAttempts(email: string): Promise<number> {
    const key = this.getUserAttemptKey(email);
    const attempts = await this.redis.incr(key);

    // Set expiration on first attempt
    if (attempts === 1) {
      await this.redis.expire(key, this.ATTEMPT_WINDOW);
    }

    return attempts;
  }

  private async incrementIpAttempts(ipAddress: string): Promise<number> {
    const key = this.getIpAttemptKey(ipAddress);
    const attempts = await this.redis.incr(key);

    // Set expiration on first attempt
    if (attempts === 1) {
      await this.redis.expire(key, this.ATTEMPT_WINDOW);
    }

    return attempts;
  }

  private async lockUserAccount(email: string): Promise<void> {
    const key = this.getUserLockKey(email);
    await this.redis.setex(key, this.LOCKOUT_DURATION, '1');
  }

  private async lockIpAddress(ipAddress: string): Promise<void> {
    const key = this.getIpLockKey(ipAddress);
    await this.redis.setex(key, this.IP_LOCKOUT_DURATION, '1');
  }

  private async clearUserAttempts(email: string): Promise<void> {
    const key = this.getUserAttemptKey(email);
    await this.redis.del(key);
  }

  // Redis key generators
  private getUserAttemptKey(email: string): string {
    return `hummii:auth:failed_attempts:user:${email}`;
  }

  private getUserLockKey(email: string): string {
    return `hummii:auth:lockout:user:${email}`;
  }

  private getIpAttemptKey(ipAddress: string): string {
    return `hummii:auth:failed_attempts:ip:${ipAddress}`;
  }

  private getIpLockKey(ipAddress: string): string {
    return `hummii:auth:lockout:ip:${ipAddress}`;
  }
}

