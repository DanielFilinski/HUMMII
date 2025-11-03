import { ApiProperty } from '@nestjs/swagger';

/**
 * Avatar Upload Response DTO
 * Returned after successful avatar upload
 * 
 * Contains Cloudflare Images ID and URLs for different variants
 */
export class UploadAvatarResponseDto {
  @ApiProperty({
    description: 'Cloudflare Images ID',
    example: '2cdc28f0-017a-49c4-9ed7-87056c83901f',
  })
  avatarId: string;

  @ApiProperty({
    description: 'Avatar URL (300x300 variant, optimized for profile display)',
    example:
      'https://imagedelivery.net/abc123/2cdc28f0-017a-49c4-9ed7-87056c83901f/avatar',
  })
  avatarUrl: string;

  @ApiProperty({
    description: 'Thumbnail URL (150x150 variant, optimized for lists)',
    example:
      'https://imagedelivery.net/abc123/2cdc28f0-017a-49c4-9ed7-87056c83901f/thumbnail',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: 'Public URL (original size, optimized)',
    example:
      'https://imagedelivery.net/abc123/2cdc28f0-017a-49c4-9ed7-87056c83901f/public',
    required: false,
  })
  publicUrl?: string;
}

