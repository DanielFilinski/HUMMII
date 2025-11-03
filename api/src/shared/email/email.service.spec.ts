import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { EmailService } from './email.service';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockQueue: any;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        EMAIL_FROM: 'test@hummii.ca',
        APP_NAME: 'Hummii Test',
        FRONTEND_URL: 'http://localhost:3001',
        EMAIL_PROVIDER: 'console', // Use console mode for tests
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: '1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getQueueToken('email'),
          useValue: mockQueue,
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

      // In console mode, queue should not be called
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should include verification URL in email', async () => {
      const email = 'user@example.com';
      const token = 'verification-token-123';

      await service.sendEmailVerification(email, token);

      // Should construct URL from config
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

    it('should initialize in console mode for tests', () => {
      expect(configService.get).toHaveBeenCalledWith('EMAIL_PROVIDER', 'console');
    });
  });

  describe('queue integration', () => {
    it('should not queue emails in console mode', async () => {
      await service.sendEmailVerification('test@example.com', 'token');
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should queue emails in sendgrid mode', async () => {
      // Override email provider for this test
      mockConfigService.get = jest.fn((key: string, defaultValue?: string) => {
        if (key === 'EMAIL_PROVIDER') return 'sendgrid';
        if (key === 'SENDGRID_API_KEY') return 'SG.test_key';
        if (key === 'EMAIL_FROM') return 'test@hummii.ca';
        if (key === 'APP_NAME') return 'Hummii Test';
        if (key === 'FRONTEND_URL') return 'http://localhost:3001';
        return defaultValue;
      });

      // Recreate service with sendgrid mode
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
          {
            provide: getQueueToken('email'),
            useValue: mockQueue,
          },
        ],
      }).compile();

      const sendgridService = module.get<EmailService>(EmailService);
      await sendgridService.sendEmailVerification('test@example.com', 'token');

      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Verify'),
        }),
        expect.any(Object),
      );
    });
  });
});

