import { Injectable, Logger } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { CloudflareImagesService } from './cloudflare-images.service';
import { UploadSecurityService } from './upload-security.service';

/**
 * Unified Upload Service
 * Combines Cloudflare R2 and Cloudflare Images services
 * Integrates with UploadSecurityService for validation and processing
 * 
 * Architecture:
 * - Cloudflare Images: Public images (avatars, portfolio) with automatic optimization
 * - Cloudflare R2: Private documents (verification docs, backups)
 * 
 * Security:
 * - EXIF metadata stripping via UploadSecurityService
 * - File type validation (magic numbers)
 * - File size limits
 * - Image optimization and resizing
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private r2Service: CloudflareR2Service,
    private imagesService: CloudflareImagesService,
    private securityService: UploadSecurityService,
  ) {}

  /**
   * Upload public image (avatar, portfolio)
   * Uses Cloudflare Images with automatic optimization
   * 
   * Flow:
   * 1. Validate and process image (security service)
   * 2. Strip EXIF metadata
   * 3. Upload to Cloudflare Images
   * 4. Return image ID and URLs
   * 
   * @param file - Multer file object
   * @param userId - User ID for metadata
   * @param type - Image type (avatar, portfolio)
   * @returns Image ID and variant URLs
   */
  async uploadPublicImage(
    file: Express.Multer.File,
    userId: string,
    type: 'avatar' | 'portfolio' = 'avatar',
  ): Promise<{
    id: string;
    url: string;
    thumbnailUrl: string;
    variants: Record<string, string>;
  }> {
    this.logger.log(`Uploading ${type} image for user ${userId}`);

    // Validate and process image (removes EXIF, resizes, optimizes)
    const processed = await this.securityService.validateAndProcessImage(file, {
      maxWidth: type === 'avatar' ? 512 : 2048,
      maxHeight: type === 'avatar' ? 512 : 2048,
      quality: 85,
      format: 'jpeg',
    });

    // Create processed file object
    const processedFile: Express.Multer.File = {
      ...file,
      buffer: processed.buffer,
      size: processed.size,
    };

    // Upload to Cloudflare Images
    const result = await this.imagesService.uploadImage(processedFile, {
      userId,
      type,
      uploadedAt: new Date().toISOString(),
      hash: processed.hash,
    });

    // Get all variant URLs
    const variants = this.imagesService.getAllVariantUrls(result.id);

    return {
      id: result.id,
      url: type === 'avatar' ? variants.avatar : variants.portfolio,
      thumbnailUrl: variants.thumbnail,
      variants,
    };
  }

  /**
   * Upload private document (verification docs)
   * Uses Cloudflare R2 for private storage
   * 
   * @param file - Multer file object
   * @param userId - User ID for organization
   * @param category - Document category
   * @returns Public URL to document
   */
  async uploadPrivateDocument(
    file: Express.Multer.File,
    userId: string,
    category: string = 'documents',
  ): Promise<{ key: string; url: string }> {
    this.logger.log(`Uploading ${category} document for user ${userId}`);

    // Validate document
    const validation = await this.securityService.validateDocument(file);

    // Generate unique key
    const key = this.r2Service.generateFileKey(`${category}/${userId}`, file.originalname);

    // Upload to R2
    const url = await this.r2Service.uploadFile(file, key);

    return {
      key,
      url,
    };
  }

  /**
   * Delete public image from Cloudflare Images
   * 
   * @param imageId - Cloudflare Images ID
   */
  async deletePublicImage(imageId: string): Promise<void> {
    this.logger.log(`Deleting public image: ${imageId}`);
    await this.imagesService.deleteImage(imageId);
  }

  /**
   * Delete private document from R2
   * 
   * @param key - R2 object key
   */
  async deletePrivateDocument(key: string): Promise<void> {
    this.logger.log(`Deleting private document: ${key}`);
    await this.r2Service.deleteFile(key);
  }

  /**
   * Get image URL with specific variant
   * 
   * @param imageId - Cloudflare Images ID
   * @param variant - Variant name
   * @returns Full CDN URL
   */
  getImageUrl(
    imageId: string,
    variant: 'avatar' | 'portfolio' | 'thumbnail' | 'public' = 'avatar',
  ): string {
    return this.imagesService.getImageUrl(imageId, variant);
  }

  /**
   * Get all variant URLs for an image
   * 
   * @param imageId - Cloudflare Images ID
   * @returns Object with all variant URLs
   */
  getAllImageVariants(imageId: string): Record<string, string> {
    return this.imagesService.getAllVariantUrls(imageId);
  }

  /**
   * Process and upload avatar specifically
   * Shorthand method with avatar-specific processing
   * 
   * @param file - Multer file object
   * @param userId - User ID
   * @returns Avatar URLs
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    id: string;
    avatarUrl: string;
    thumbnailUrl: string;
  }> {
    // Use avatar-specific processing from security service
    const processed = await this.securityService.processAvatar(file);

    const processedFile: Express.Multer.File = {
      ...file,
      buffer: processed.buffer,
      size: processed.buffer.length,
    };

    const result = await this.imagesService.uploadImage(processedFile, {
      userId,
      type: 'avatar',
      uploadedAt: new Date().toISOString(),
      hash: processed.hash,
    });

    return {
      id: result.id,
      avatarUrl: this.getImageUrl(result.id, 'avatar'),
      thumbnailUrl: this.getImageUrl(result.id, 'thumbnail'),
    };
  }
}

