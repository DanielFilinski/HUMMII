import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ContractorsService } from './contractors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateContractorProfileDto } from './dto/create-contractor-profile.dto';
import { UpdateContractorProfileDto } from './dto/update-contractor-profile.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { ReorderPortfolioDto } from './dto/reorder-portfolio.dto';
import { AssignCategoriesDto } from './dto/assign-categories.dto';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Contractors')
@Controller('contractors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Post('me')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 profile creations per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create contractor profile',
    description: 'Create contractor profile for current user. User must have CONTRACTOR role.',
  })
  @ApiResponse({ status: 201, description: 'Contractor profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or profile already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async createProfile(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreateContractorProfileDto,
  ) {
    return this.contractorsService.createProfile(user.userId, createDto);
  }

  @Patch('me')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 updates per hour
  @ApiOperation({
    summary: 'Update contractor profile',
    description: 'Update contractor profile for current user.',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateDto: UpdateContractorProfileDto,
  ) {
    return this.contractorsService.updateProfile(user.userId, updateDto);
  }

  @Patch('me/location')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 location updates per hour
  @ApiOperation({
    summary: 'Update contractor location',
    description: 'Update contractor location and service radius.',
  })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() locationDto: UpdateLocationDto,
  ) {
    return this.contractorsService.updateLocation(user.userId, locationDto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get my contractor profile',
    description: 'Get contractor profile for current user with categories and portfolio.',
  })
  @ApiResponse({ status: 200, description: 'Contractor profile retrieved' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.contractorsService.getProfile(user.userId);
  }

  @Get('nearby')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 searches per minute
  @ApiOperation({
    summary: 'Find contractors nearby',
    description: 'Find contractors within specified radius using Haversine formula.',
  })
  @ApiQuery({
    name: 'lat',
    required: true,
    description: 'Latitude',
    example: 45.421530,
  })
  @ApiQuery({
    name: 'lon',
    required: true,
    description: 'Longitude',
    example: -75.697193,
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    description: 'Search radius in kilometers (default: 50)',
    example: 50,
  })
  @ApiResponse({ status: 200, description: 'Contractors found' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async findNearby(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = radius ? parseFloat(radius) : 50;

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      throw new Error('Invalid coordinates or radius');
    }

    return this.contractorsService.findNearby(latitude, longitude, radiusKm);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get contractor profile by ID',
    description: 'Get public contractor profile with categories and portfolio.',
  })
  @ApiResponse({ status: 200, description: 'Contractor profile retrieved' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  async getProfileById(@Param('id') id: string) {
    return this.contractorsService.getProfileById(id);
  }

  // Portfolio endpoints
  @Post('me/portfolio')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 portfolio additions per hour
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add portfolio item',
    description: 'Add portfolio item to contractor profile. Maximum 10 items allowed.',
  })
  @ApiResponse({ status: 201, description: 'Portfolio item added successfully' })
  @ApiResponse({ status: 400, description: 'Maximum 10 portfolio items reached or validation error' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async addPortfolioItem(
    @CurrentUser() user: JwtPayload,
    @Body() createDto: CreatePortfolioItemDto,
  ) {
    // Get contractor to find contractorId
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.addPortfolioItem(contractor.id, user.userId, createDto);
  }

  @Get('me/portfolio')
  @ApiOperation({
    summary: 'Get my portfolio',
    description: 'Get all portfolio items for current contractor.',
  })
  @ApiResponse({ status: 200, description: 'Portfolio items retrieved' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  async getMyPortfolio(@CurrentUser() user: JwtPayload) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.getPortfolio(contractor.id);
  }

  @Patch('me/portfolio/:id')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 updates per hour
  @ApiOperation({
    summary: 'Update portfolio item',
    description: 'Update portfolio item for current contractor.',
  })
  @ApiResponse({ status: 200, description: 'Portfolio item updated successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async updatePortfolioItem(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateDto: UpdatePortfolioItemDto,
  ) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.updatePortfolioItem(contractor.id, user.userId, id, updateDto);
  }

  @Delete('me/portfolio/:id')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 deletions per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete portfolio item',
    description: 'Delete portfolio item for current contractor.',
  })
  @ApiResponse({ status: 200, description: 'Portfolio item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Portfolio item not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async deletePortfolioItem(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.deletePortfolioItem(contractor.id, user.userId, id);
  }

  @Post('me/portfolio/reorder')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 reorders per hour
  @ApiOperation({
    summary: 'Reorder portfolio items',
    description: 'Change the order of portfolio items.',
  })
  @ApiResponse({ status: 200, description: 'Portfolio reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid portfolio item IDs' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async reorderPortfolio(
    @CurrentUser() user: JwtPayload,
    @Body() reorderDto: ReorderPortfolioDto,
  ) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.reorderPortfolio(contractor.id, user.userId, reorderDto.itemIds);
  }

  @Get(':id/portfolio')
  @ApiOperation({
    summary: 'Get contractor portfolio by ID',
    description: 'Get public portfolio for contractor.',
  })
  @ApiResponse({ status: 200, description: 'Portfolio items retrieved' })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  async getPortfolioById(@Param('id') id: string) {
    return this.contractorsService.getPortfolio(id);
  }

  // Category endpoints
  @Post('me/categories')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 assignments per hour
  @ApiOperation({
    summary: 'Assign categories to contractor',
    description: 'Assign categories to contractor profile. Maximum 5 categories allowed.',
  })
  @ApiResponse({ status: 200, description: 'Categories assigned successfully' })
  @ApiResponse({ status: 400, description: 'Maximum 5 categories or validation error' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async assignCategories(
    @CurrentUser() user: JwtPayload,
    @Body() assignDto: AssignCategoriesDto,
  ) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.assignCategories(contractor.id, user.userId, assignDto.categoryIds);
  }

  @Delete('me/categories/:id')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 removals per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove category from contractor',
    description: 'Remove category from contractor profile.',
  })
  @ApiResponse({ status: 200, description: 'Category removed successfully' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async removeCategory(@CurrentUser() user: JwtPayload, @Param('id') categoryId: string) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.removeCategory(contractor.id, user.userId, categoryId);
  }

  @Get('me/categories')
  @ApiOperation({
    summary: 'Get my categories',
    description: 'Get all assigned categories for current contractor.',
  })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  @ApiResponse({ status: 404, description: 'Contractor profile not found' })
  async getMyCategories(@CurrentUser() user: JwtPayload) {
    const contractor = await this.contractorsService.getProfile(user.userId);
    return this.contractorsService.getCategories(contractor.id);
  }
}

