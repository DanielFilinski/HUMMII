/**
 * Authentication API functions
 * Handles registration, email verification, and login
 */

import { apiClient } from './client';
import { UserRole } from '@/types';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CLIENT' | 'CONTRACTOR';
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
    isVerified: boolean;
  };
  // Tokens are stored in HTTP-only cookies by backend, not in response body
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>('/auth/register', data, {
    requireAuth: false,
  });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  return apiClient.get<VerifyEmailResponse>(`/auth/verify-email?token=${token}`, {
    requireAuth: false,
  });
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', data, {
    requireAuth: false,
  });
}

