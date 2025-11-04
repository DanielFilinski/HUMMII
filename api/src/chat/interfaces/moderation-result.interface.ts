import { ModerationFlag } from './moderation-flag.enum';

/**
 * Result of content moderation
 */
export interface ModerationResult {
  /**
   * Cleaned content with blocked elements replaced
   */
  cleanedContent: string;

  /**
   * Whether any moderation was applied
   */
  isModerated: boolean;

  /**
   * List of moderation flags that were triggered
   */
  flags: ModerationFlag[];

  /**
   * Original content before moderation (for audit purposes)
   */
  originalContent: string;
}


