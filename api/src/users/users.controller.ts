import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCookiePreferencesDto } from './dto/cookie-preferences.dto';
import { UploadAvatarResponseDto } from './dto/upload-avatar-response.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { UploadService } from '../shared/upload/upload.service';
import { UserRole } from '@prisma/client';

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
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

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

  @Post('me/cookie-preferences')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 updates per minute
  @ApiOperation({
    summary: 'Update cookie preferences (PIPEDA: Right to Withdraw Consent)',
    description: 'Update your cookie consent preferences. Essential cookies cannot be disabled.',
  })
  @ApiResponse({ status: 200, description: 'Cookie preferences updated successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async updateCookiePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCookiePreferencesDto,
  ) {
    return this.usersService.updateCookiePreferences(user.userId, dto.preferences);
  }

  @Post('me/avatar')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 uploads per hour
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload user avatar',
    description: 'Upload or update user avatar image. Old avatar will be automatically deleted.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, WebP, max 2MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UploadAvatarResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 413, description: 'File too large (max 2MB)' })
  @ApiResponse({ status: 429, description: 'Too many requests (max 5 per hour)' })
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadAvatarResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Get current user to check for existing avatar
    const currentUser = await this.usersService.findById(user.userId);

    // Delete old avatar if exists
    if (currentUser.avatarId) {
      await this.uploadService.deletePublicImage(currentUser.avatarId);
    }

    // Upload new avatar
    const result = await this.uploadService.uploadAvatar(file, user.userId);

    // Update user record with new avatar
    await this.usersService.updateAvatar(user.userId, result.id, result.avatarUrl);

    return {
      avatarId: result.id,
      avatarUrl: result.avatarUrl,
      thumbnailUrl: result.thumbnailUrl,
    };
  }

  @Post('me/switch-role')
  @Throttle({ default: { limit: 1, ttl: 86400000 } }) // 1 switch per day
  @ApiOperation({
    summary: 'Switch user role',
    description: 'Switch between CLIENT and CONTRACTOR roles. User can have both roles simultaneously.',
  })
  @ApiResponse({ status: 200, description: 'Role switched successfully' })
  @ApiResponse({ status: 400, description: 'User already has the specified role' })
  @ApiResponse({ status: 429, description: 'Too many requests (max 1 per day)' })
  async switchRole(@CurrentUser() user: JwtPayload, @Body() switchRoleDto: SwitchRoleDto) {
    if (switchRoleDto.role === UserRole.CONTRACTOR) {
      return this.usersService.switchToContractor(user.userId);
    } else if (switchRoleDto.role === UserRole.CLIENT) {
      return this.usersService.switchToClient(user.userId);
    } else {
      throw new BadRequestException('Invalid role. Must be CLIENT or CONTRACTOR');
    }
  }
}
