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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile (PIPEDA: Right to Access)',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile (PIPEDA: Right to Rectification)',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateDto);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete user account (PIPEDA: Right to Erasure)',
  })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: any) {
    await this.usersService.deleteAccount(user.userId);
  }

  @Get('me/export')
  @ApiOperation({
    summary: 'Export user data (PIPEDA: Right to Data Portability)',
  })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  async exportData(@CurrentUser() user: any) {
    return this.usersService.exportUserData(user.userId);
  }
}
