import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CookieConfig } from '../config/cookie.config';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 registrations per hour
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const result = await this.authService.login(loginDto, userAgent, ipAddress);

    // Set HTTP-only cookies for tokens (XSS protection)
    res.cookie(
      CookieConfig.ACCESS_TOKEN_COOKIE,
      result.accessToken,
      CookieConfig.getAccessTokenOptions(this.configService),
    );

    res.cookie(
      CookieConfig.REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      CookieConfig.getRefreshTokenOptions(this.configService),
    );

    // Return user data without tokens (tokens in cookies only)
    return { user: result.user };
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refreshes per minute
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshDto?: RefreshTokenDto,
  ) {
    // Try to get refresh token from cookie first, then from body (backward compatibility)
    const refreshToken =
      req.cookies?.[CookieConfig.REFRESH_TOKEN_COOKIE] || refreshDto?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    // Update access token cookie
    res.cookie(
      CookieConfig.ACCESS_TOKEN_COOKIE,
      result.accessToken,
      CookieConfig.getAccessTokenOptions(this.configService),
    );

    // Update refresh token cookie (token rotation)
    res.cookie(
      CookieConfig.REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      CookieConfig.getRefreshTokenOptions(this.configService),
    );

    return { message: 'Token refreshed successfully' };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshDto?: RefreshTokenDto,
  ) {
    // Try to get refresh token from cookie first, then from body
    const refreshToken =
      req.cookies?.[CookieConfig.REFRESH_TOKEN_COOKIE] || refreshDto?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    res.clearCookie(
      CookieConfig.ACCESS_TOKEN_COOKIE,
      CookieConfig.getClearCookieOptions(this.configService),
    );
    res.clearCookie(
      CookieConfig.REFRESH_TOKEN_COOKIE,
      CookieConfig.getClearCookieOptions(this.configService),
    );
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard, RolesGuard) // Add RolesGuard
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all sessions (requires authentication)' })
  @ApiResponse({ status: 204, description: 'All sessions terminated' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(req.user.userId);

    // Clear cookies for current session
    res.clearCookie(
      CookieConfig.ACCESS_TOKEN_COOKIE,
      CookieConfig.getClearCookieOptions(this.configService),
    );
    res.clearCookie(
      CookieConfig.REFRESH_TOKEN_COOKIE,
      CookieConfig.getClearCookieOptions(this.configService),
    );
  }

  @Post('password-reset/request')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset/confirm')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return this.authService.confirmPasswordReset(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const result = await this.authService.oauthLogin(req.user, userAgent, ipAddress);

    // Set HTTP-only cookies for OAuth tokens
    res.cookie(
      CookieConfig.ACCESS_TOKEN_COOKIE,
      result.accessToken,
      CookieConfig.getAccessTokenOptions(this.configService),
    );

    res.cookie(
      CookieConfig.REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      CookieConfig.getRefreshTokenOptions(this.configService),
    );

    return { user: result.user };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved' })
  async getActiveSessions(@Req() req: RequestWithUser) {
    return this.authService.getActiveSessions(req.user.userId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete specific session (requires authentication)' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Req() req: RequestWithUser, @Param('sessionId') sessionId: string) {
    await this.authService.deleteSession(req.user.userId, sessionId);
  }
}
