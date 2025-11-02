import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

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
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 requests per minute
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
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.authService.login(loginDto, userAgent, ipAddress);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204, description: 'Successfully logged out' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() refreshDto: RefreshTokenDto) {
    await this.authService.logout(refreshDto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard, RolesGuard) // Add RolesGuard
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all sessions (requires authentication)' })
  @ApiResponse({ status: 204, description: 'All sessions terminated' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@Req() req: RequestWithUser) {
    await this.authService.logoutAll(req.user.userId);
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
  async googleAuthCallback(@Req() req: RequestWithUser) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.authService.oauthLogin(req.user, userAgent, ipAddress);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard) // Add RolesGuard
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved' })
  async getActiveSessions(@Req() req: RequestWithUser) {
    return this.authService.getActiveSessions(req.user.userId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard) // Add RolesGuard
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete specific session (requires authentication)' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Req() req: RequestWithUser, @Param('sessionId') sessionId: string) {
    await this.authService.deleteSession(req.user.userId, sessionId);
  }
}
