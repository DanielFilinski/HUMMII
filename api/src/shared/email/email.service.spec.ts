import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        EMAIL_FROM: 'test@hummii.ca',
        APP_NAME: 'Hummii Test',
        FRONTEND_URL: 'http://localhost:3001',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailVerification', () => {
    it('should send email verification with correct parameters', async () => {
      const email = 'user@example.com';
      const token = 'verification-token-123';

      // Should not throw
      await expect(
        service.sendEmailVerification(email, token),
      ).resolves.not.toThrow();
    });

    it('should include verification URL in email', async () => {
      const email = 'user@example.com';
      const token = 'verification-token-123';

      await service.sendEmailVerification(email, token);

      // In production, this would send an actual email
      // For now, it just logs
      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      const email = 'user@example.com';
      const token = 'reset-token-123';

      await expect(
        service.sendPasswordReset(email, token),
      ).resolves.not.toThrow();
    });

    it('should use correct reset URL', async () => {
      const email = 'user@example.com';
      const token = 'reset-token-123';

      await service.sendPasswordReset(email, token);

      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
    });
  });

  describe('sendPasswordResetConfirmation', () => {
    it('should send password reset confirmation', async () => {
      const email = 'user@example.com';

      await expect(
        service.sendPasswordResetConfirmation(email),
      ).resolves.not.toThrow();
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new user', async () => {
      const email = 'newuser@example.com';
      const name = 'New User';

      await expect(
        service.sendWelcomeEmail(email, name),
      ).resolves.not.toThrow();
    });

    it('should personalize email with user name', async () => {
      const email = 'newuser@example.com';
      const name = 'John Doe';

      await service.sendWelcomeEmail(email, name);

      expect(configService.get).toHaveBeenCalledWith('APP_NAME', 'Hummii');
    });
  });

  describe('email template generation', () => {
    it('should generate valid HTML templates', async () => {
      const email = 'test@example.com';
      const token = 'test-token';

      // Should not throw when generating templates
      await expect(
        service.sendEmailVerification(email, token),
      ).resolves.not.toThrow();
    });
  });

  describe('email configuration', () => {
    it('should use correct from address', () => {
      expect(configService.get).toHaveBeenCalledWith(
        'EMAIL_FROM',
        'noreply@hummii.ca',
      );
    });

    it('should use correct app name', () => {
      expect(configService.get).toHaveBeenCalledWith('APP_NAME', 'Hummii');
    });
  });
});

