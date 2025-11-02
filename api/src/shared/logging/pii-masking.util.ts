/**
 * PII (Personally Identifiable Information) Masking Utilities
 * PIPEDA Compliance: Never log sensitive personal data in plain text
 *
 * @see https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/
 */

/**
 * Mask email address
 * Example: john.doe@example.com → j*******@example.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '[invalid-email]';
  }

  const [user, domain] = email.split('@');
  if (!user || !domain) {
    return '[invalid-email]';
  }

  // Show first character, mask the rest
  const maskedUser = user.charAt(0) + '*'.repeat(Math.max(user.length - 1, 3));
  return `${maskedUser}@${domain}`;
}

/**
 * Mask phone number
 * Example: +1 (234) 567-8900 → ******7890
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '[invalid-phone]';
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 4) {
    return '*'.repeat(digitsOnly.length);
  }

  // Show last 4 digits, mask the rest
  const lastFour = digitsOnly.slice(-4);
  const masked = '*'.repeat(digitsOnly.length - 4) + lastFour;

  return masked;
}

/**
 * Mask credit card number
 * Example: 4532015112830366 → ************0366
 */
export function maskCreditCard(cardNumber: string): string {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return '[invalid-card]';
  }

  const digitsOnly = cardNumber.replace(/\D/g, '');

  if (digitsOnly.length < 4) {
    return '*'.repeat(digitsOnly.length);
  }

  // Show last 4 digits, mask the rest
  return '*'.repeat(digitsOnly.length - 4) + digitsOnly.slice(-4);
}

/**
 * Mask Social Insurance Number (SIN) - Canadian equivalent of SSN
 * Example: 123-456-789 → ***-***-789
 */
export function maskSIN(sin: string): string {
  if (!sin || typeof sin !== 'string') {
    return '[invalid-sin]';
  }

  const digitsOnly = sin.replace(/\D/g, '');

  if (digitsOnly.length !== 9) {
    return '[invalid-sin]';
  }

  // Show last 3 digits, mask the rest
  return `***-***-${digitsOnly.slice(-3)}`;
}

/**
 * Mask IP address (for privacy)
 * Example: 192.168.1.100 → 192.168.1.***
 */
export function maskIP(ip: string): string {
  if (!ip || typeof ip !== 'string') {
    return '[invalid-ip]';
  }

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length !== 4) {
      return '[invalid-ip]';
    }
    return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
  }

  // IPv6 - mask last segment
  if (ip.includes(':')) {
    const parts = ip.split(':');
    const maskedParts = parts.slice(0, -1);
    return maskedParts.join(':') + ':***';
  }

  return '[invalid-ip]';
}

/**
 * Mask JWT token
 * Example: eyJhbGciOiJIUzI1... → eyJ***
 */
export function maskToken(token: string): string {
  if (!token || typeof token !== 'string') {
    return '[no-token]';
  }

  if (token.length < 10) {
    return '***';
  }

  // Show first 3 characters, mask the rest
  return token.substring(0, 3) + '***';
}

/**
 * Mask any sensitive field by key name
 * Automatically detects and masks common PII fields
 */
export function maskSensitiveData(data: Record<string, any>): Record<string, any> {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const masked = { ...data };
  const sensitiveKeys = [
    'password',
    'passwordConfirm',
    'currentPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'creditCard',
    'cardNumber',
    'cvv',
    'cvc',
    'sin',
    'ssn',
  ];

  const piiKeys = {
    email: maskEmail,
    phone: maskPhone,
    phoneNumber: maskPhone,
    mobile: maskPhone,
    ipAddress: maskIP,
    ip: maskIP,
  };

  // Remove sensitive keys completely (never log them)
  for (const key of sensitiveKeys) {
    if (key in masked) {
      delete masked[key];
    }
  }

  // Mask PII keys
  for (const [key, maskFn] of Object.entries(piiKeys)) {
    if (key in masked && typeof masked[key] === 'string') {
      masked[key] = maskFn(masked[key]);
    }
  }

  return masked;
}

/**
 * Sanitize log message by removing sensitive patterns
 * Useful for sanitizing entire log strings
 */
export function sanitizeLogMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return message;
  }

  let sanitized = message;

  // Mask email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (email) =>
    maskEmail(email),
  );

  // Mask phone numbers (various formats)
  sanitized = sanitized.replace(
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    (phone) => maskPhone(phone),
  );

  // Mask credit card numbers (16 digits)
  sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, (card) =>
    maskCreditCard(card),
  );

  // Mask JWT tokens (starts with eyJ)
  sanitized = sanitized.replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, (token) =>
    maskToken(token),
  );

  return sanitized;
}
