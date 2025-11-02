import { Module } from '@nestjs/common';
import { UploadSecurityService } from './upload-security.service';

/**
 * Upload Module
 * Provides secure file upload services with validation and processing
 *
 * Services:
 * - UploadSecurityService: File validation, EXIF stripping, image optimization
 *
 * @see https://docs.nestjs.com/techniques/file-upload
 */
@Module({
  providers: [UploadSecurityService],
  exports: [UploadSecurityService],
})
export class UploadModule {}
