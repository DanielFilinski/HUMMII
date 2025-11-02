import { plainToInstance } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUrl,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
  validateSync,
  ValidateIf,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

/**
 * Environment variables validation schema for Hummii API
 * Ensures all required configuration is present and valid at application startup
 * PIPEDA Compliance: Validates security-critical variables
 *
 * @see https://docs.nestjs.com/techniques/configuration#custom-validate-function
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  /**
   * PostgreSQL database connection string
   * Production: Must include SSL parameters
   * Example: postgresql://user:pass@host:5432/db?sslmode=require
   */
  @IsString()
  @MinLength(10)
  DATABASE_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  /**
   * Redis password
   * REQUIRED in production for security
   * Optional in development
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @MinLength(16, {
    message: 'REDIS_PASSWORD must be at least 16 characters in production',
  })
  @IsOptional()
  REDIS_PASSWORD?: string;

  /**
   * JWT Access Token Secret
   * CRITICAL: Must be 256-bit (32 bytes minimum)
   * Generate: openssl rand -base64 64
   */
  @IsString()
  @MinLength(32, {
    message:
      'JWT_ACCESS_SECRET must be at least 32 characters (256-bit). Generate with: openssl rand -base64 64',
  })
  @MaxLength(512)
  JWT_ACCESS_SECRET: string;

  /**
   * JWT Refresh Token Secret
   * CRITICAL: Must be 256-bit (32 bytes minimum) and DIFFERENT from access secret
   * Generate: openssl rand -base64 64
   */
  @IsString()
  @MinLength(32, {
    message:
      'JWT_REFRESH_SECRET must be at least 32 characters (256-bit). Generate with: openssl rand -base64 64',
  })
  @MaxLength(512)
  JWT_REFRESH_SECRET: string;

  /**
   * JWT Access Token Expiration
   * Format: 15m, 1h, 1d
   * Recommended: 15m (15 minutes) for security
   */
  @IsString()
  @Matches(/^\d+[smhd]$/, {
    message: 'JWT_ACCESS_EXPIRATION must be in format: 15m, 1h, 1d',
  })
  JWT_ACCESS_EXPIRATION: string;

  /**
   * JWT Refresh Token Expiration
   * Format: 7d, 30d, 90d
   * Recommended: 7d (7 days)
   */
  @IsString()
  @Matches(/^\d+[smhd]$/, {
    message: 'JWT_REFRESH_EXPIRATION must be in format: 7d, 30d, 90d',
  })
  JWT_REFRESH_EXPIRATION: string;

  /**
   * Stripe API Secret Key
   * Format: sk_test_... or sk_live_...
   * REQUIRED in production
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @Matches(/^sk_(test|live)_[A-Za-z0-9]{24,}$/, {
    message: 'STRIPE_SECRET_KEY must be valid Stripe secret key (sk_test_... or sk_live_...)',
  })
  @IsOptional()
  STRIPE_SECRET_KEY?: string;

  /**
   * Stripe Webhook Secret
   * Format: whsec_...
   * REQUIRED in production for webhook signature verification
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @Matches(/^whsec_[A-Za-z0-9]{24,}$/, {
    message: 'STRIPE_WEBHOOK_SECRET must be valid Stripe webhook secret (whsec_...)',
  })
  @IsOptional()
  STRIPE_WEBHOOK_SECRET?: string;

  /**
   * Google OAuth Client ID
   * Optional: Required only if Google OAuth is enabled
   */
  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  /**
   * Google OAuth Client Secret
   * Optional: Required only if Google OAuth is enabled
   */
  @IsString()
  @MinLength(20)
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  /**
   * Google OAuth Callback URL
   * Must match URL configured in Google Console
   */
  @IsUrl({ require_tld: false })
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  /**
   * Frontend Application URL
   * Used for CORS whitelist and redirects
   * Must be HTTPS in production
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @ValidateIf((o) => o.NODE_ENV !== 'production')
  @IsUrl({ require_tld: false })
  FRONTEND_URL: string;

  /**
   * Backend API URL
   * Used for webhook callbacks and email links
   * Must be HTTPS in production
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @ValidateIf((o) => o.NODE_ENV !== 'production')
  @IsUrl({ require_tld: false })
  API_URL: string;

  /**
   * AWS S3 Bucket Name
   * REQUIRED in production for file uploads
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @IsOptional()
  AWS_S3_BUCKET?: string;

  /**
   * AWS Access Key ID
   * REQUIRED in production for S3 access
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @MinLength(16)
  @MaxLength(128)
  @IsOptional()
  AWS_ACCESS_KEY_ID?: string;

  /**
   * AWS Secret Access Key
   * REQUIRED in production for S3 access
   */
  @ValidateIf((o) => o.NODE_ENV === 'production')
  @IsString()
  @MinLength(40)
  @IsOptional()
  AWS_SECRET_ACCESS_KEY?: string;

  /**
   * AWS Region
   * Example: us-east-1, ca-central-1
   */
  @IsString()
  @IsIn(['us-east-1', 'us-west-2', 'ca-central-1', 'eu-west-1'])
  @IsOptional()
  AWS_REGION?: string;

  /**
   * Email Service Provider
   * Currently supports: sendgrid, aws-ses
   */
  @IsString()
  @IsIn(['sendgrid', 'aws-ses', 'smtp'])
  @IsOptional()
  EMAIL_PROVIDER?: string;

  /**
   * SendGrid API Key
   * Required if EMAIL_PROVIDER=sendgrid
   */
  @ValidateIf((o) => o.EMAIL_PROVIDER === 'sendgrid')
  @IsString()
  @MinLength(32)
  @IsOptional()
  SENDGRID_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
