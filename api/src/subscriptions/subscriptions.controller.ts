import {
  Controller,
  Get,
  Post,
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
import { Throttle } from '@nestjs/throttler';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpgradeSubscriptionDto, DowngradeSubscriptionDto, CancelSubscriptionDto } from './dto/update-subscription.dto';
import { CreatePortalSessionDto } from './dto/create-portal-session.dto';
import { CustomerPortalService } from './services/customer-portal.service';
import { SubscriptionEntity } from './entities/subscription.entity';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

@ApiTags('Subscriptions')
@Controller('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly customerPortalService: CustomerPortalService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: SubscriptionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Subscription already exists' })
  async createSubscription(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(user.userId, createDto);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Get my subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully',
    type: SubscriptionEntity,
  })
  async getMySubscription(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.getSubscription(user.userId);
  }

  @Patch('upgrade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 per hour
  @ApiOperation({ summary: 'Upgrade subscription tier' })
  @ApiResponse({
    status: 200,
    description: 'Subscription upgraded successfully',
    type: SubscriptionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async upgradeSubscription(
    @CurrentUser() user: JwtPayload,
    @Body() upgradeDto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgradeSubscription(user.userId, upgradeDto);
  }

  @Patch('downgrade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 per hour
  @ApiOperation({ summary: 'Downgrade subscription tier' })
  @ApiResponse({
    status: 200,
    description: 'Subscription downgraded successfully',
    type: SubscriptionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async downgradeSubscription(
    @CurrentUser() user: JwtPayload,
    @Body() downgradeDto: DowngradeSubscriptionDto,
  ) {
    return this.subscriptionsService.downgradeSubscription(user.userId, downgradeDto);
  }

  @Delete()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully',
    type: SubscriptionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async cancelSubscription(
    @CurrentUser() user: JwtPayload,
    @Body() cancelDto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(user.userId, cancelDto);
  }

  @Post('reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Reactivate canceled subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription reactivated successfully',
    type: SubscriptionEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async reactivateSubscription(@CurrentUser() user: JwtPayload) {
    return this.subscriptionsService.reactivateSubscription(user.userId);
  }

  @Post('portal')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Get Stripe Customer Portal session URL' })
  @ApiResponse({
    status: 200,
    description: 'Portal session URL created successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://billing.stripe.com/session/...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPortalSession(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreatePortalSessionDto,
  ) {
    // Get contractor profile
    const contractor = await this.subscriptionsService.getContractorByUserId(user.userId);
    return this.customerPortalService.createPortalSession(contractor.id, createDto.returnUrl || undefined);
  }
}

