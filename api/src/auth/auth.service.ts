import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../shared/prisma/prisma.service';
import { EmailService } from '../shared/email/email.service';
import { AuditService } from '../shared/audit/audit.service';
import { FailedLoginService } from './services/failed-login.service';
import { AuditAction, AuditEntity } from '../shared/audit/enums/audit-action.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
    private readonly failedLoginService: FailedLoginService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, role } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role (only CLIENT or CONTRACTOR allowed for registration)
    if (role && role !== UserRole.CLIENT && role !== UserRole.CONTRACTOR) {
      throw new BadRequestException('Role must be either CLIENT or CONTRACTOR');
    }

    // Hash password with bcrypt cost 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours

    // Determine user role (default to CLIENT if not specified)
    const userRole = role || UserRole.CLIENT;
    const roles = [userRole];

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        roles,
        verificationToken,
        verificationTokenExpiry,
        isVerified: false,
      },
    });

    // Create contractor profile if user registered as CONTRACTOR
    if (userRole === UserRole.CONTRACTOR) {
      await this.prisma.contractor.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Audit log: User registration
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      entity: AuditEntity.USER,
      entityId: user.id,
      metadata: {
        email: user.email,
        name: user.name,
        hasPhone: !!phone,
        role: userRole,
        roles: roles,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationToken);

    // Audit log: Verification email sent
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.EMAIL_VERIFICATION_SENT,
      entity: AuditEntity.USER,
      entityId: user.id,
    });

    return this.excludePassword(user);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Audit log: Email verified
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.EMAIL_VERIFIED,
      entity: AuditEntity.USER,
      entityId: user.id,
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      message: 'Email successfully verified',
    };
  }

  /**
   * Login user with failed login tracking
   */
  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const { email, password } = loginDto;

    // Check if user account is locked (Redis-based)
    await this.failedLoginService.checkUserLockout(email);

    // Check if IP address is locked (Redis-based)
    if (ipAddress) {
      await this.failedLoginService.checkIpLockout(ipAddress);
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Record failed attempt (even for non-existent users to prevent enumeration)
      if (ipAddress) {
        await this.failedLoginService.recordFailedAttempt(email, ipAddress, userAgent);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed login attempt
      if (ipAddress) {
        await this.failedLoginService.recordFailedAttempt(email, ipAddress, userAgent);
      }

      // Audit log: Failed login attempt
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        entity: AuditEntity.USER,
        entityId: user.id,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: 'Invalid credentials',
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Record successful login (clears failed attempts in Redis)
    if (ipAddress) {
      await this.failedLoginService.recordSuccessfulLogin(email, ipAddress);
    }

    // Reset failed attempts and update login info
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null,
      },
    });

    // Generate tokens with device info
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.roles, // Pass roles array
      userAgent,
      ipAddress,
    );

    // Audit log: Successful login
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: AuditEntity.USER,
      entityId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        email: user.email,
      },
    });

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Generate JWT access and refresh tokens
   * Security: roles array is embedded in JWT payload for authorization
   */
  async generateTokens(
    userId: string,
    email: string,
    roles: UserRole[], // Array of roles
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Security: Include all roles in token payload
    const payload = { sub: userId, email, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Store refresh token in Session table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if token exists in database
      const session = await this.prisma.session.findFirst({
        where: {
          refreshToken,
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete old session
      await this.prisma.session.delete({
        where: { id: session.id },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(
        session.user.id,
        session.user.email,
        session.user.roles, // Pass roles array
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout current session by refresh token
   */
  async logout(refreshToken: string) {
    // Get session info before deleting for audit log
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });

    // Audit log: Logout
    if (session) {
      await this.auditService.log({
        userId: session.userId,
        action: AuditAction.LOGOUT,
        entity: AuditEntity.SESSION,
        entityId: session.id,
        ipAddress: session.ipAddress || undefined,
        userAgent: session.userAgent || undefined,
      });
    }
  }

  /**
   * Logout all sessions for user
   */
  async logoutAll(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    // Audit log: Logout all sessions
    await this.auditService.log({
      userId,
      action: AuditAction.LOGOUT_ALL,
      entity: AuditEntity.USER,
      entityId: userId,
    });
  }

  /**
   * Get all active sessions for user
   */
  async getActiveSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions;
  }

  /**
   * Delete specific session by ID
   */
  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return {
        message: 'If account exists, reset email has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await this.emailService.sendPasswordReset(email, resetToken);

    // Audit log: Password reset requested
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      entity: AuditEntity.USER,
      entityId: user.id,
    });

    return {
      message: 'If account exists, reset email has been sent',
    };
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(dto: PasswordResetConfirmDto) {
    const { token, newPassword } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Invalidate all existing sessions
    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Audit log: Password reset completed
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      entity: AuditEntity.USER,
      entityId: user.id,
      metadata: {
        sessionsInvalidated: true,
      },
    });

    // Send confirmation email
    await this.emailService.sendPasswordResetConfirmation(user.email);

    return {
      message: 'Password successfully reset',
    };
  }

  /**
   * OAuth login (Google, Apple, etc.)
   */
  async oauthLogin(oauthUser: any, userAgent?: string, ipAddress?: string) {
    const { email, name, avatar, provider, providerId } = oauthUser;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    const isNewUser = !user;

    if (!user) {
      // Create new user from OAuth
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatar,
          password: '', // OAuth users don't have password
          isVerified: true, // OAuth emails are pre-verified
        },
      });

      // Audit log: OAuth registration
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.OAUTH_REGISTER,
        entity: AuditEntity.USER,
        entityId: user.id,
        ipAddress,
        userAgent,
        metadata: {
          provider,
          email: user.email,
          name: user.name,
        },
      });
    }

    // Update last login info
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null,
      },
    });

    // Generate tokens with device info
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.roles, // Pass roles array
      userAgent,
      ipAddress,
    );

    // Audit log: OAuth login (for existing users)
    if (!isNewUser) {
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.OAUTH_LOGIN,
        entity: AuditEntity.USER,
        entityId: user.id,
        ipAddress,
        userAgent,
        metadata: {
          provider,
          email: user.email,
        },
      });
    }

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Validate user for strategies
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.excludePassword(user);
  }

  /**
   * Validate OAuth user
   */
  async validateOAuthUser(oauthData: any) {
    // Validate email exists
    if (!oauthData.email) {
      throw new UnauthorizedException('Email not provided by OAuth provider');
    }

    // Validate provider
    if (!oauthData.provider || !['google', 'apple'].includes(oauthData.provider)) {
      throw new UnauthorizedException('Invalid OAuth provider');
    }

    return {
      email: oauthData.email.toLowerCase(),
      name: oauthData.name || 'User',
      avatar: oauthData.avatar || null,
      provider: oauthData.provider,
      providerId: oauthData.providerId,
    };
  }

  /**
   * Exclude password from user object
   */
  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
