import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { createHash } from 'crypto';

/**
 * File Upload Security Service
 * PIPEDA Compliance: Validates files, strips metadata, prevents malicious uploads
 *
 * Features:
 * - MIME type validation (whitelist only)
 * - File signature validation (magic numbers)
 * - File size limits
 * - EXIF metadata stripping (location, camera info)
 * - Image optimization and resizing
 * - Virus scanning integration ready
 * - Content hash generation (deduplication)
 *
 * @see https://sharp.pixelplumbing.com/
 */
@Injectable()
export class UploadSecurityService {
  // Whitelist of allowed MIME types
  private readonly ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private readonly ALLOWED_DOCUMENT_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  // File size limits (in bytes)
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

  // Image dimensions
  private readonly MAX_IMAGE_WIDTH = 4096;
  private readonly MAX_IMAGE_HEIGHT = 4096;
  private readonly AVATAR_SIZE = 512; // Avatar dimensions
  private readonly THUMBNAIL_SIZE = 256; // Thumbnail dimensions

  /**
   * Validate and process uploaded image
   * Returns processed buffer, hash, and metadata
   */
  async validateAndProcessImage(
    file: Express.Multer.File,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    },
  ): Promise<{
    buffer: Buffer;
    hash: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    // 1. Validate MIME type (from multer)
    if (!this.ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_MIMES.join(', ')}`,
      );
    }

    // 2. Validate file size
    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      );
    }

    // 3. Validate file signature (magic numbers)
    this.validateImageSignature(file.buffer);

    // 4. Process image with Sharp
    let sharpInstance = sharp(file.buffer);

    // Get original metadata
    const metadata = await sharpInstance.metadata();

    // Validate dimensions
    if (metadata.width! > this.MAX_IMAGE_WIDTH || metadata.height! > this.MAX_IMAGE_HEIGHT) {
      throw new BadRequestException(
        `Image dimensions too large. Maximum: ${this.MAX_IMAGE_WIDTH}x${this.MAX_IMAGE_HEIGHT}`,
      );
    }

    // 5. Remove EXIF metadata (location, camera info, etc.)
    // 6. Resize if needed
    const maxWidth = options?.maxWidth || 2048;
    const maxHeight = options?.maxHeight || 2048;
    const quality = options?.quality || 80;
    const format = options?.format || 'jpeg';

    sharpInstance = sharpInstance
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .rotate(); // Auto-rotate based on EXIF and strip EXIF data

    // Convert to desired format
    if (format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality });
    } else if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    }

    // Get processed buffer
    const processedBuffer = await sharpInstance.toBuffer();

    // Get final metadata
    const finalMetadata = await sharp(processedBuffer).metadata();

    // 7. Generate content hash (for deduplication)
    const hash = this.generateFileHash(processedBuffer);

    return {
      buffer: processedBuffer,
      hash,
      width: finalMetadata.width!,
      height: finalMetadata.height!,
      format: finalMetadata.format!,
      size: processedBuffer.length,
    };
  }

  /**
   * Process avatar image (fixed size, square)
   */
  async processAvatar(file: Express.Multer.File): Promise<{
    buffer: Buffer;
    hash: string;
  }> {
    // Validate file size for avatar
    if (file.size > this.MAX_AVATAR_SIZE) {
      throw new BadRequestException(
        `Avatar too large. Maximum size: ${this.MAX_AVATAR_SIZE / 1024 / 1024}MB`,
      );
    }

    // Validate MIME type
    if (!this.ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid avatar image type');
    }

    // Validate signature
    this.validateImageSignature(file.buffer);

    // Process: resize to square, remove metadata
    const buffer = await sharp(file.buffer)
      .resize(this.AVATAR_SIZE, this.AVATAR_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .rotate() // Auto-rotate based on EXIF and strip EXIF data
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    const hash = this.generateFileHash(buffer);

    return { buffer, hash };
  }

  /**
   * Generate thumbnail from image
   */
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(this.THUMBNAIL_SIZE, this.THUMBNAIL_SIZE, {
        fit: 'cover',
        position: 'center',
      })
      .rotate() // Auto-rotate based on EXIF and strip EXIF data
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  /**
   * Validate image file signature (magic numbers)
   * Prevents file extension spoofing
   */
  private validateImageSignature(buffer: Buffer): void {
    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

    // WebP: 52 49 46 46 (RIFF) + WebP header
    const isWebP =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    // GIF: 47 49 46 38 (GIF8)
    const isGif =
      buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;

    if (!isJpeg && !isPng && !isWebP && !isGif) {
      throw new BadRequestException(
        'Invalid image file signature. File may be corrupted or not an image.',
      );
    }
  }

  /**
   * Validate document file
   * PDF, Word documents
   */
  async validateDocument(file: Express.Multer.File): Promise<{
    hash: string;
    mimeType: string;
    size: number;
  }> {
    // Validate MIME type
    if (!this.ALLOWED_DOCUMENT_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid document type. Allowed types: ${this.ALLOWED_DOCUMENT_MIMES.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > this.MAX_DOCUMENT_SIZE) {
      throw new BadRequestException(
        `Document too large. Maximum size: ${this.MAX_DOCUMENT_SIZE / 1024 / 1024}MB`,
      );
    }

    // Validate document signature
    this.validateDocumentSignature(file.buffer, file.mimetype);

    // Generate hash
    const hash = this.generateFileHash(file.buffer);

    return {
      hash,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Validate document file signature
   */
  private validateDocumentSignature(buffer: Buffer, mimeType: string): void {
    // PDF: 25 50 44 46 (%PDF)
    const isPdf =
      buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;

    // ZIP-based formats (DOCX): 50 4B 03 04 (PK..)
    const isZipBased =
      buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;

    // DOC (old format): D0 CF 11 E0 A1 B1 1A E1
    const isDoc =
      buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0;

    if (mimeType === 'application/pdf' && !isPdf) {
      throw new BadRequestException('Invalid PDF file signature');
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      !isZipBased
    ) {
      throw new BadRequestException('Invalid DOCX file signature');
    }

    if (mimeType === 'application/msword' && !isDoc) {
      throw new BadRequestException('Invalid DOC file signature');
    }
  }

  /**
   * Generate SHA-256 hash of file content
   * Used for deduplication and integrity verification
   */
  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Sanitize filename
   * Remove special characters, limit length
   */
  sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');

    // Remove special characters (keep alphanumeric, dash, underscore, dot)
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Limit filename length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const ext = sanitized.split('.').pop();
      const nameWithoutExt = sanitized.substring(0, sanitized.length - ext!.length - 1);
      sanitized = `${nameWithoutExt.substring(0, maxLength - ext!.length - 1)}.${ext}`;
    }

    return sanitized;
  }

  /**
   * Generate unique filename
   * timestamp-uuid-sanitized-original-name.ext
   */
  generateUniqueFilename(originalName: string): string {
    const sanitized = this.sanitizeFilename(originalName);
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.length - ext!.length - 1);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return `${timestamp}-${random}-${nameWithoutExt}.${ext}`;
  }
}
