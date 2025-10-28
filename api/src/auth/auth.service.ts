import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../shared/prisma/prisma.service';
import { EmailService } from '../shared/email/email.service';
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
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, phone } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt cost 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hours

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        verificationToken,
        verificationTokenExpiry,
        isVerified: false,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationToken);

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

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      message: 'Email successfully verified',
    };
  }

  /**
   * Login user
   */
  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesLeft} minutes.`,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      const lockAccount = newFailedAttempts >= 5;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil: lockAccount
            ? new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
            : null,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
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
      user.role,
      userAgent,
      ipAddress,
    );

    return {
      user: this.excludePassword(user),
      ...tokens,
    };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  async generateTokens(
    userId: string,
    email: string,
    role: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const payload = { sub: userId, email, role };

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
        session.user.role,
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
    await this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  /**
   * Logout all sessions for user
   */
  async logoutAll(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
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

    // Send confirmation email
    await this.emailService.sendPasswordResetConfirmation(user.email);

    return {
      message: 'Password successfully reset',
    };
  }

  /**
   * OAuth login (Google, Apple, etc.)
   */
  async oauthLogin(
    oauthUser: any,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const { email, name, avatar, provider, providerId } = oauthUser;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

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
      user.role,
      userAgent,
      ipAddress,
    );

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
    return oauthData;
  }

  /**
   * Exclude password from user object
   */
  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
