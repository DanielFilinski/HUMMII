/**
 * Users API client methods
 */

import { apiClient } from './client';
import { CookiePreferences, UpdateCookiePreferencesDto } from '@/types';

/**
 * Update user cookie preferences (PIPEDA compliance)
 * POST /users/me/cookie-preferences
 */
export async function updateCookiePreferences(
  preferences: UpdateCookiePreferencesDto
): Promise<{ message: string; preferences: CookiePreferences }> {
  return apiClient.post<{ message: string; preferences: CookiePreferences }>(
    '/users/me/cookie-preferences',
    preferences
  );
}

/**
 * Get current user profile (includes cookiePreferences)
 * GET /users/me
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string;
  roles: string[];
  cookiePreferences?: CookiePreferences;
}> {
  return apiClient.get('/users/me');
}

