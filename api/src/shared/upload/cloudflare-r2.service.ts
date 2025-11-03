import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

/**
 * Cloudflare R2 Service
 * R2 is S3-compatible object storage
 * 
 * Use cases:
 * - Private documents (verification documents)
 * - Backup storage
 * - Non-public files
 * 
 * Features:
 * - Zero egress fees (vs AWS S3)
 * - S3-compatible API
 * - Global CDN integration
 * 
 * @see https://developers.cloudflare.com/r2/
 */
@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly accountId: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>('R2_ACCOUNT_ID') || '';
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';

    if (!this.accountId || !this.bucketName) {
      this.logger.warn(
        'Cloudflare R2 not configured. Set R2_ACCOUNT_ID and R2_BUCKET_NAME in .env',
      );
    }

    // Initialize S3 client for R2
    this.s3Client = new S3Client({
      region: 'auto', // R2 uses 'auto' region
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload file to R2 bucket
   * 
   * @param file - Multer file object
   * @param key - Object key (path in bucket)
   * @returns Public URL to the uploaded file
   */
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    try {
      const params: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      };

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      // Generate public URL (if bucket has public access enabled)
      const publicUrl = `https://pub-${this.bucketName}.r2.dev/${key}`;

      this.logger.log(`File uploaded to R2: ${key}`);
      return publicUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file to R2: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  /**
   * Delete file from R2 bucket
   * 
   * @param key - Object key (path in bucket)
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted from R2: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from R2: ${error.message}`, error.stack);
      // Don't throw error on delete failure (file might not exist)
      // This is intentional for idempotency
    }
  }

  /**
   * Generate R2 public URL for a given key
   * Note: Bucket must have public access enabled for this to work
   * 
   * @param key - Object key
   * @returns Public URL
   */
  getPublicUrl(key: string): string {
    return `https://pub-${this.bucketName}.r2.dev/${key}`;
  }

  /**
   * Generate unique key for file storage
   * Format: {prefix}/{timestamp}-{random}-{sanitizedFilename}
   * 
   * @param prefix - Folder prefix (e.g., 'documents', 'verification')
   * @param filename - Original filename
   * @returns Unique key
   */
  generateFileKey(prefix: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}-${random}-${sanitized}`;
  }
}

