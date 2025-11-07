/**
 * Zod validation schemas for authentication forms
 */

import { z } from 'zod';

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
  phone: z
    .string()
    .regex(/^\+1\d{10}$/, 'Phone must be a valid Canadian number (+1XXXXXXXXXX)')
    .optional()
    .or(z.literal('')),
  role: z
    .enum(['CLIENT', 'CONTRACTOR'], {
      errorMap: () => ({ message: 'Role must be either CLIENT or CONTRACTOR' }),
    })
    .optional()
    .default('CLIENT'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

