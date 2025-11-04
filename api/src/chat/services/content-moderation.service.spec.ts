import { Test, TestingModule } from '@nestjs/testing';
import { ContentModerationService } from './content-moderation.service';
import { ModerationFlag } from '../interfaces/moderation-flag.enum';

describe('ContentModerationService', () => {
  let service: ContentModerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentModerationService],
    }).compile();

    service = module.get<ContentModerationService>(ContentModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('moderateMessage', () => {
    it('should not modify clean content', () => {
      const content = 'Hello! When can you start the work?';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe(content);
      expect(result.isModerated).toBe(false);
      expect(result.flags).toEqual([]);
      expect(result.originalContent).toBe(content);
    });

    it('should block Canadian phone number with +1', () => {
      const content = 'Call me at +1234567890';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Call me at ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PHONE);
    });

    it('should block phone number with dashes', () => {
      const content = 'My number is 123-456-7890';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('My number is ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PHONE);
    });

    it('should block phone number with parentheses', () => {
      const content = 'Reach me at (123) 456-7890';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Reach me at ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PHONE);
    });

    it('should block phone number with spaces', () => {
      const content = 'Text me 123 456 7890';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Text me ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PHONE);
    });

    it('should block email addresses', () => {
      const content = 'Email me at john.doe@example.com';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Email me at ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.EMAIL);
    });

    it('should block multiple emails', () => {
      const content = 'Contact john@test.com or jane@example.org';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Contact *** or ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.EMAIL);
    });

    it('should block HTTP URLs', () => {
      const content = 'Check out http://example.com';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Check out [link removed]');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.URL);
    });

    it('should block HTTPS URLs', () => {
      const content = 'Visit https://www.example.com/page';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Visit [link removed]');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.URL);
    });

    it('should block Instagram handles', () => {
      const content = 'Follow me @instagram/myprofile';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Follow me ***/myprofile');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.SOCIAL_MEDIA);
    });

    it('should block Telegram handles', () => {
      const content = 'Message me on @telegram';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Message me on ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.SOCIAL_MEDIA);
    });

    it('should block WhatsApp mentions', () => {
      const content = 'Add me on @whatsapp';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Add me on ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.SOCIAL_MEDIA);
    });

    it('should block Facebook mentions', () => {
      const content = 'Find me @facebook';
      const result = service.moderateMessage(content);

      expect(result.cleanedContent).toBe('Find me ***');
      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.SOCIAL_MEDIA);
    });

    it('should block English profanity', () => {
      const content = 'This is damn frustrating';
      const result = service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PROFANITY);
      expect(result.cleanedContent).toContain('***');
    });

    it('should block French profanity', () => {
      const content = 'C\'est de la merde';
      const result = service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PROFANITY);
      expect(result.cleanedContent).toContain('***');
    });

    it('should handle multiple violations in one message', () => {
      const content = 'Call 123-456-7890 or email test@example.com or visit https://example.com';
      const result = service.moderateMessage(content);

      expect(result.isModerated).toBe(true);
      expect(result.flags).toContain(ModerationFlag.PHONE);
      expect(result.flags).toContain(ModerationFlag.EMAIL);
      expect(result.flags).toContain(ModerationFlag.URL);
      expect(result.cleanedContent).not.toContain('123-456-7890');
      expect(result.cleanedContent).not.toContain('test@example.com');
      expect(result.cleanedContent).not.toContain('https://example.com');
    });

    it('should handle empty content', () => {
      const result = service.moderateMessage('');

      expect(result.cleanedContent).toBe('');
      expect(result.isModerated).toBe(false);
      expect(result.flags).toEqual([]);
    });

    it('should handle content with only whitespace', () => {
      const result = service.moderateMessage('   ');

      expect(result.isModerated).toBe(false);
      expect(result.flags).toEqual([]);
    });

    it('should preserve original content for audit', () => {
      const content = 'Call me at 123-456-7890';
      const result = service.moderateMessage(content);

      expect(result.originalContent).toBe(content);
      expect(result.originalContent).not.toBe(result.cleanedContent);
    });
  });

  describe('containsBlockedContent', () => {
    it('should return true for phone numbers', () => {
      expect(service.containsBlockedContent('Call 123-456-7890')).toBe(true);
    });

    it('should return true for emails', () => {
      expect(service.containsBlockedContent('Email test@example.com')).toBe(true);
    });

    it('should return true for URLs', () => {
      expect(service.containsBlockedContent('Visit https://example.com')).toBe(true);
    });

    it('should return true for social media', () => {
      expect(service.containsBlockedContent('Follow @instagram')).toBe(true);
    });

    it('should return false for clean content', () => {
      expect(service.containsBlockedContent('Hello, how are you?')).toBe(false);
    });

    it('should return false for empty content', () => {
      expect(service.containsBlockedContent('')).toBe(false);
    });
  });

  describe('detectFlags', () => {
    it('should detect phone flag', () => {
      const flags = service.detectFlags('Call 123-456-7890');
      expect(flags).toContain(ModerationFlag.PHONE);
    });

    it('should detect email flag', () => {
      const flags = service.detectFlags('Email test@example.com');
      expect(flags).toContain(ModerationFlag.EMAIL);
    });

    it('should detect URL flag', () => {
      const flags = service.detectFlags('Visit https://example.com');
      expect(flags).toContain(ModerationFlag.URL);
    });

    it('should detect social media flag', () => {
      const flags = service.detectFlags('Follow @instagram');
      expect(flags).toContain(ModerationFlag.SOCIAL_MEDIA);
    });

    it('should detect multiple flags', () => {
      const flags = service.detectFlags('Call 123-456-7890 or email test@example.com');
      expect(flags).toContain(ModerationFlag.PHONE);
      expect(flags).toContain(ModerationFlag.EMAIL);
      expect(flags.length).toBe(2);
    });

    it('should return empty array for clean content', () => {
      const flags = service.detectFlags('Hello, how are you?');
      expect(flags).toEqual([]);
    });

    it('should return empty array for empty content', () => {
      const flags = service.detectFlags('');
      expect(flags).toEqual([]);
    });
  });
});

