import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { SlugService } from './services/slug.service';
import { MetadataService } from './services/metadata.service';
import { RedirectService } from './services/redirect.service';
import { OpengraphService } from './services/opengraph.service';
import { StructuredDataService } from './services/structured-data.service';
import { GenerateSlugDto } from './dto/generate-slug.dto';
import { UpdateSlugDto } from './dto/update-slug.dto';
import { MetadataDto } from './dto/metadata.dto';
import { OpengraphDto } from './dto/opengraph.dto';
import { StructuredDataDto } from './dto/structured-data.dto';

@ApiTags('SEO')
@Controller('v1/seo')
export class SeoController {
  constructor(
    private readonly slugService: SlugService,
    private readonly metadataService: MetadataService,
    private readonly redirectService: RedirectService,
    private readonly opengraphService: OpengraphService,
    private readonly structuredDataService: StructuredDataService,
  ) {}

  @Post('generate-slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTRACTOR, UserRole.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate unique SEO-friendly slug' })
  @ApiResponse({ status: 201, description: 'Slug generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden - contractor role required' })
  async generateSlug(
    @CurrentUser() user: { id: string },
    @Body() dto: GenerateSlugDto,
  ) {
    return this.slugService.generateSlug(user.id, dto);
  }

  @Get('validate-slug/:slug')
  @ApiOperation({ summary: 'Validate slug availability' })
  @ApiParam({ name: 'slug', description: 'Slug to validate' })
  @ApiResponse({ status: 200, description: 'Slug availability check result' })
  async validateSlug(@Param('slug') slug: string) {
    const isAvailable = await this.slugService.isSlugAvailable(slug);
    return { slug, available: isAvailable };
  }

  @Patch('update-slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTRACTOR, UserRole.ADMIN)
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contractor slug (creates redirect)' })
  @ApiResponse({ status: 200, description: 'Slug updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateSlug(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateSlugDto,
  ) {
    return this.slugService.updateSlug(user.id, dto);
  }

  @Get('metadata/:contractorId')
  @ApiOperation({ summary: 'Get SEO metadata for contractor' })
  @ApiParam({ name: 'contractorId', description: 'Contractor ID' })
  @ApiResponse({ status: 200, description: 'SEO metadata', type: MetadataDto })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  async getMetadata(@Param('contractorId') contractorId: string): Promise<MetadataDto> {
    return this.metadataService.getMetadata(contractorId);
  }

  @Get('opengraph/:contractorId')
  @ApiOperation({ summary: 'Get OpenGraph metadata for contractor' })
  @ApiParam({ name: 'contractorId', description: 'Contractor ID' })
  @ApiResponse({ status: 200, description: 'OpenGraph metadata', type: OpengraphDto })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  async getOpengraph(@Param('contractorId') contractorId: string): Promise<OpengraphDto> {
    return this.opengraphService.getOpengraph(contractorId);
  }

  @Get('structured-data/:contractorId')
  @ApiOperation({ summary: 'Get JSON-LD structured data for contractor' })
  @ApiParam({ name: 'contractorId', description: 'Contractor ID' })
  @ApiResponse({ status: 200, description: 'Structured data', type: StructuredDataDto })
  @ApiResponse({ status: 404, description: 'Contractor not found' })
  async getStructuredData(@Param('contractorId') contractorId: string): Promise<StructuredDataDto> {
    return this.structuredDataService.getStructuredData(contractorId);
  }

  @Get('redirects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTRACTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get redirect history for contractor' })
  @ApiResponse({ status: 200, description: 'Redirect history' })
  async getRedirects(@CurrentUser() user: { id: string }) {
    return this.redirectService.getRedirectsForContractor(user.id);
  }
}

