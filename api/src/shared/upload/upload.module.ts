import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadSecurityService } from './upload-security.service';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { CloudflareImagesService } from './cloudflare-images.service';
import { UploadService } from './upload.service';

/**
 * Upload Module
 * Provides secure file upload services with Cloudflare integration
 *
 * Services:
 * - UploadService: Unified service for public images and private documents
 * - CloudflareR2Service: S3-compatible storage for private documents
 * - CloudflareImagesService: Native Cloudflare Images API for public images
 * - UploadSecurityService: File validation, EXIF stripping, image optimization
 *
 * Architecture:
 * - Public images (avatars, portfolio) → Cloudflare Images (auto-optimization, CDN)
 * - Private documents (verification) → Cloudflare R2 (S3-compatible storage)
 *
 * @see https://docs.nestjs.com/techniques/file-upload
 * @see https://developers.cloudflare.com/images/
 * @see https://developers.cloudflare.com/r2/
 */
@Module({
  imports: [ConfigModule],
  providers: [
    UploadSecurityService,
    CloudflareR2Service,
    CloudflareImagesService,
    UploadService,
  ],
  exports: [
    UploadService,
    UploadSecurityService, // Keep for backward compatibility
    CloudflareR2Service, // Export for DisputesModule
  ],
})
export class UploadModule {}
