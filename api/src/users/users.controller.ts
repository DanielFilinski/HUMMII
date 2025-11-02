import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile (PIPEDA: Right to Access)',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.userId);
  }

  @Patch('me')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 updates per hour
  @ApiOperation({
    summary: 'Update current user profile (PIPEDA: Right to Rectification)',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(user.userId, updateDto);
  }

  @Delete('me')
  @Throttle({ default: { limit: 2, ttl: 86400000 } }) // 2 requests per day (prevent accidental deletions)
  @ApiOperation({
    summary: 'Delete user account (PIPEDA: Right to Erasure)',
  })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    await this.usersService.deleteAccount(user.userId);
  }

  @Get('me/export')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 exports per hour
  @ApiOperation({
    summary: 'Export user data (PIPEDA: Right to Data Portability)',
  })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async exportData(@CurrentUser() user: JwtPayload) {
    return this.usersService.exportUserData(user.userId);
  }
}
