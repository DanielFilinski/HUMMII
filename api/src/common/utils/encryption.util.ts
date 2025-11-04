import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Get encryption key from environment
 * Generate with: openssl rand -hex 32
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    console.warn('ENCRYPTION_KEY not set in environment. Using default key (NOT FOR PRODUCTION!)');
    // Default key for development only
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt text using AES-256-CBC
 * @param text - Plain text to encrypt
 * @returns Encrypted text in format: iv:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) {
    return text;
  }

  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt text encrypted with encrypt()
 * @param encryptedText - Encrypted text in format: iv:encryptedData
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) {
    return encryptedText;
  }

  try {
    const key = getEncryptionKey();
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encryptedText; // Return original if decryption fails
  }
}

/**
 * Encrypt PII fields in an object
 * @param data - Object with PII fields
 * @param fields - Array of field names to encrypt
 * @returns Object with encrypted fields
 */
export function encryptPII<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[],
): T {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as T[keyof T];
    }
  }
  
  return result;
}

/**
 * Decrypt PII fields in an object
 * @param data - Object with encrypted PII fields
 * @param fields - Array of field names to decrypt
 * @returns Object with decrypted fields
 */
export function decryptPII<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[],
): T {
  const result = { ...data };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decrypt(result[field] as string) as T[keyof T];
    }
  }
  
  return result;
}

