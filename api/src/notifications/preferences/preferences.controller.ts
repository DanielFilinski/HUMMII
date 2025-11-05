import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PreferencesService } from './preferences.service';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity';

@ApiTags('Notifications')
@Controller('notifications/preferences')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
    type: NotificationPreferencesEntity,
  })
  async getPreferences(@CurrentUser() user: User) {
    return this.preferencesService.findOrCreate(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    type: NotificationPreferencesEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Security alerts cannot be disabled',
  })
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    // Validate: security alerts cannot be disabled
    if (dto.emailSecurity === false || dto.pushSecurity === false) {
      throw new BadRequestException('Security alerts cannot be disabled');
    }

    return this.preferencesService.update(user.id, dto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset notification preferences to defaults' })
  @ApiResponse({
    status: 200,
    description: 'Preferences reset successfully',
    type: NotificationPreferencesEntity,
  })
  async resetPreferences(@CurrentUser() user: User) {
    return this.preferencesService.reset(user.id);
  }
}

