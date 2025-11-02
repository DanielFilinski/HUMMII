import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { maskSensitiveData, sanitizeLogMessage } from '../shared/logging/pii-masking.util';

/**
 * Winston Logger Configuration with PII Masking
 * PIPEDA Compliance: Automatically masks sensitive personal information in logs
 *
 * Features:
 * - Email masking (john.doe@example.com → j*******@example.com)
 * - Phone masking (+1234567890 → ******7890)
 * - Token removal (accessToken, refreshToken, password)
 * - Credit card masking (4532015112830366 → ************0366)
 * - IP address partial masking (192.168.1.100 → 192.168.1.***)
 *
 * @see https://github.com/winstonjs/winston
 */

/**
 * Custom format to mask PII in log data
 * Removes sensitive fields and masks PII fields
 */
const piiMaskingFormat = winston.format((info) => {
  // Mask sensitive data in the info object
  if (typeof info === 'object') {
    const masked = maskSensitiveData(info);
    Object.assign(info, masked);
  }

  // Sanitize message string to remove sensitive patterns
  if (typeof info.message === 'string') {
    info.message = sanitizeLogMessage(info.message);
  }

  // Sanitize error messages
  if (info.error && typeof info.error === 'object' && 'message' in info.error) {
    const error = info.error as { message: string };
    if (typeof error.message === 'string') {
      error.message = sanitizeLogMessage(error.message);
    }
  }

  return info;
})();

/**
 * Console format for development
 * Human-readable with colors
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  piiMaskingFormat, // Apply PII masking
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let log = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;

    // Add metadata if present (excluding common fields)
    const metaKeys = Object.keys(meta).filter(
      (key) => !['timestamp', 'level', 'message', 'context'].includes(key),
    );

    if (metaKeys.length > 0) {
      const metaString = JSON.stringify(meta, null, 2);
      log += `\n${metaString}`;
    }

    return log;
  }),
);

/**
 * File format for production
 * Structured JSON with PII masking
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  piiMaskingFormat, // Apply PII masking
  winston.format.errors({ stack: true }), // Include stack traces
  winston.format.json(),
);

/**
 * Winston configuration with PII masking enabled
 */
export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    }),

    // File transport for audit logs (authentication, data access)
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 30, // Keep 30 days of audit logs
      tailable: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
};
