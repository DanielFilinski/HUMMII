import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Verification')
@Controller('verification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('create')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 attempts per hour
  @ApiOperation({
    summary: 'Create verification session (stub)',
    description: 'Placeholder for Stripe Identity verification. Will be implemented in Phase 6.',
  })
  @ApiResponse({ status: 200, description: 'Stub verification session created' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async createSession(@CurrentUser() user: JwtPayload) {
    return this.verificationService.createVerificationSession(user.userId);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get verification status (stub)',
    description: 'Placeholder for getting verification status. Returns stub data.',
  })
  @ApiResponse({ status: 200, description: 'Stub verification status retrieved' })
  async getStatus(@CurrentUser() user: JwtPayload) {
    return this.verificationService.getVerificationStatus(user.userId);
  }
}

