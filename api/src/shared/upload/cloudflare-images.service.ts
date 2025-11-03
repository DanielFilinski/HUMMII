import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

/**
 * Cloudflare Images Service
 * Native Cloudflare Images API integration
 * 
 * Use cases:
 * - User avatars
 * - Portfolio images
 * - Public images requiring optimization
 * 
 * Features:
 * - Automatic image optimization (WebP/AVIF)
 * - On-the-fly transformations (resize, crop)
 * - Global CDN delivery
 * - Image variants (avatar, portfolio, thumbnail)
 * - $5/month for up to 100,000 images
 * 
 * @see https://developers.cloudflare.com/images/
 */
@Injectable()
export class CloudflareImagesService {
  private readonly logger = new Logger(CloudflareImagesService.name);
  private readonly accountId: string;
  private readonly accountHash: string;
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>('CF_ACCOUNT_ID') || '';
    this.accountHash = this.configService.get<string>('CF_ACCOUNT_HASH') || '';
    this.apiToken = this.configService.get<string>('CF_IMAGES_TOKEN') || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`;

    if (!this.accountId || !this.accountHash || !this.apiToken) {
      this.logger.warn(
        'Cloudflare Images not configured. Set CF_ACCOUNT_ID, CF_ACCOUNT_HASH, CF_IMAGES_TOKEN in .env',
      );
    }
  }

  /**
   * Upload image to Cloudflare Images
   * 
   * @param file - Multer file object
   * @param metadata - Optional metadata to attach to image
   * @returns Object with imageId and public URL
   */
  async uploadImage(
    file: Express.Multer.File,
    metadata?: Record<string, string>,
  ): Promise<{ id: string; url: string }> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Upload to Cloudflare Images
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          ...formData.getHeaders(),
        },
        body: formData as any, // FormData from 'form-data' package is compatible with fetch
      });

      const data = await response.json();

      if (!data.success) {
        const errors = data.errors?.map((e: any) => e.message).join(', ') || 'Unknown error';
        this.logger.error(`Cloudflare Images upload failed: ${errors}`);
        throw new BadRequestException(`Failed to upload image: ${errors}`);
      }

      const imageId = data.result.id;
      const publicUrl = this.getImageUrl(imageId, 'public');

      this.logger.log(`Image uploaded to Cloudflare: ${imageId}`);

      return {
        id: imageId,
        url: publicUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Failed to upload image to Cloudflare: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  /**
   * Delete image from Cloudflare Images
   * 
   * @param imageId - Cloudflare Images ID
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        const errors = data.errors?.map((e: any) => e.message).join(', ') || 'Unknown error';
        this.logger.error(`Cloudflare Images delete failed: ${errors}`);
        // Don't throw error on delete failure (image might not exist)
        // This is intentional for idempotency
        return;
      }

      this.logger.log(`Image deleted from Cloudflare: ${imageId}`);
    } catch (error) {
      this.logger.error(`Failed to delete image from Cloudflare: ${error.message}`, error.stack);
      // Don't throw error on delete failure for idempotency
    }
  }

  /**
   * Get image URL with specific variant
   * Variants are defined in Cloudflare Dashboard
   * 
   * Recommended variants:
   * - avatar: 300x300, cover
   * - portfolio: 800x600, scale-down
   * - thumbnail: 150x150, cover
   * - public: original size
   * 
   * @param imageId - Cloudflare Images ID
   * @param variant - Variant name (defined in CF dashboard)
   * @returns Full CDN URL
   */
  getImageUrl(
    imageId: string,
    variant: 'avatar' | 'portfolio' | 'thumbnail' | 'public' = 'public',
  ): string {
    return `https://imagedelivery.net/${this.accountHash}/${imageId}/${variant}`;
  }

  /**
   * Get all available variants for an image
   * 
   * @param imageId - Cloudflare Images ID
   * @returns Object with all variant URLs
   */
  getAllVariantUrls(imageId: string): Record<string, string> {
    return {
      avatar: this.getImageUrl(imageId, 'avatar'),
      portfolio: this.getImageUrl(imageId, 'portfolio'),
      thumbnail: this.getImageUrl(imageId, 'thumbnail'),
      public: this.getImageUrl(imageId, 'public'),
    };
  }

  /**
   * Get image details from Cloudflare
   * 
   * @param imageId - Cloudflare Images ID
   * @returns Image metadata
   */
  async getImageDetails(imageId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${imageId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new BadRequestException('Image not found');
      }

      return data.result;
    } catch (error) {
      this.logger.error(`Failed to get image details: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to retrieve image details');
    }
  }
}

