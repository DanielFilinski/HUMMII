import { Injectable, Logger } from '@nestjs/common';
import { ModerationFlag } from '../interfaces/moderation-flag.enum';
import { ModerationResult } from '../interfaces/moderation-result.interface';

/**
 * Content Moderation Service
 * 
 * Automatically filters and blocks inappropriate content in chat messages:
 * - Phone numbers (Canadian formats +1, 10-digit)
 * - Email addresses
 * - URLs and external links
 * - Social media handles (@instagram, @telegram, etc.)
 * - Profanity (English + French)
 * 
 * Critical for protecting business model and preventing contact exchange outside platform.
 */
@Injectable()
export class ContentModerationService {
  private readonly logger = new Logger(ContentModerationService.name);

  // Profanity word list (EN + FR)
  private readonly profanityWords = new Set([
    // English profanity
    'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'crap',
    // French profanity (Canadian context)
    'merde', 'putain', 'connard', 'salaud', 'con', 'chier',
    'foutre', 'bordel', 'enculé', 'pute', 'merdique',
  ]);

  // Regex patterns for content detection
  private readonly patterns = {
    // Canadian phone numbers: +1234567890, (123) 456-7890, 123-456-7890, etc.
    phone: /(\+?1\s*)?[\(]?([0-9]{3})[\)]?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    
    // Email addresses
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    
    // URLs (http, https, www)
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    
    // Social media handles
    social: /@(instagram|telegram|whatsapp|facebook|twitter|tiktok|snapchat|viber|wechat|line|discord)/gi,
  };

  // Replacement strings
  private readonly replacements = {
    phone: '***',
    email: '***',
    url: '[link removed]',
    social: '***',
    profanity: '***',
  };

  constructor() {
    this.logger.log('Content moderation service initialized with EN/FR profanity filter');
  }

  /**
   * Moderate message content
   * Applies all moderation rules and returns cleaned content with flags
   * 
   * @param content - Original message content
   * @returns ModerationResult with cleaned content and flags
   */
  moderateMessage(content: string): ModerationResult {
    if (!content || content.trim().length === 0) {
      return {
        cleanedContent: content,
        isModerated: false,
        flags: [],
        originalContent: content,
      };
    }

    const flags: ModerationFlag[] = [];
    let cleanedContent = content;
    const originalContent = content;

    // 1. Block phone numbers
    if (this.patterns.phone.test(cleanedContent)) {
      flags.push(ModerationFlag.PHONE);
      cleanedContent = cleanedContent.replace(this.patterns.phone, this.replacements.phone);
      this.logger.warn('Phone number detected and blocked in message');
    }

    // 2. Block email addresses
    if (this.patterns.email.test(cleanedContent)) {
      flags.push(ModerationFlag.EMAIL);
      cleanedContent = cleanedContent.replace(this.patterns.email, this.replacements.email);
      this.logger.warn('Email address detected and blocked in message');
    }

    // 3. Block URLs
    if (this.patterns.url.test(cleanedContent)) {
      flags.push(ModerationFlag.URL);
      cleanedContent = cleanedContent.replace(this.patterns.url, this.replacements.url);
      this.logger.warn('URL detected and blocked in message');
    }

    // 4. Block social media handles
    if (this.patterns.social.test(cleanedContent)) {
      flags.push(ModerationFlag.SOCIAL_MEDIA);
      cleanedContent = cleanedContent.replace(this.patterns.social, this.replacements.social);
      this.logger.warn('Social media handle detected and blocked in message');
    }

    // 5. Filter profanity (EN + FR)
    if (this.containsProfanity(cleanedContent)) {
      flags.push(ModerationFlag.PROFANITY);
      cleanedContent = this.filterProfanity(cleanedContent);
      this.logger.warn('Profanity detected and filtered in message');
    }

    const isModerated = flags.length > 0;

    if (isModerated) {
      this.logger.log(`Message moderated with flags: ${flags.join(', ')}`);
    }

    return {
      cleanedContent: cleanedContent.trim(),
      isModerated,
      flags,
      originalContent,
    };
  }

  /**
   * Check if content contains any blocked elements
   * Useful for pre-validation without modifying content
   * 
   * @param content - Content to check
   * @returns true if content would be moderated
   */
  containsBlockedContent(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }

    return (
      this.patterns.phone.test(content) ||
      this.patterns.email.test(content) ||
      this.patterns.url.test(content) ||
      this.patterns.social.test(content) ||
      this.containsProfanity(content)
    );
  }

  /**
   * Get list of detected flags without modifying content
   * Useful for analytics and reporting
   * 
   * @param content - Content to analyze
   * @returns Array of detected moderation flags
   */
  detectFlags(content: string): ModerationFlag[] {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const flags: ModerationFlag[] = [];

    if (this.patterns.phone.test(content)) {
      flags.push(ModerationFlag.PHONE);
    }

    if (this.patterns.email.test(content)) {
      flags.push(ModerationFlag.EMAIL);
    }

    if (this.patterns.url.test(content)) {
      flags.push(ModerationFlag.URL);
    }

    if (this.patterns.social.test(content)) {
      flags.push(ModerationFlag.SOCIAL_MEDIA);
    }

    if (this.containsProfanity(content)) {
      flags.push(ModerationFlag.PROFANITY);
    }

    return flags;
  }

  /**
   * Check if content contains profanity
   */
  private containsProfanity(content: string): boolean {
    const lowerContent = content.toLowerCase();
    for (const word of this.profanityWords) {
      // Use word boundaries to match whole words only
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerContent)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Filter profanity from content
   */
  private filterProfanity(content: string): string {
    let filtered = content;
    for (const word of this.profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '***');
    }
    return filtered;
  }
}

