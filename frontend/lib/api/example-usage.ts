/**
 * Example usage of the API client
 * This file demonstrates how to use the apiClient for different HTTP methods
 */

import { apiClient } from './client';
import type { User, PaginatedResponse } from '@/types';

// Example: GET request (with authentication)
export async function getUserProfile(userId: string): Promise<User> {
  return apiClient.get<User>(`/users/${userId}`);
}

// Example: POST request (create new resource)
export async function createOrder(orderData: {
  contractorId: string;
  serviceId: string;
  description: string;
}): Promise<{ id: string; status: string }> {
  return apiClient.post('/orders', orderData);
}

// Example: PUT request (full update)
export async function updateUserProfile(
  userId: string,
  profileData: Partial<User>
): Promise<User> {
  return apiClient.put<User>(`/users/${userId}`, profileData);
}

// Example: PATCH request (partial update)
export async function updateUserSettings(
  userId: string,
  settings: Record<string, unknown>
): Promise<User> {
  return apiClient.patch<User>(`/users/${userId}/settings`, settings);
}

// Example: DELETE request
export async function deleteOrder(orderId: string): Promise<void> {
  return apiClient.delete(`/orders/${orderId}`);
}

// Example: GET with pagination
export async function getUserOrders(
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<{ id: string; status: string }>> {
  return apiClient.get<PaginatedResponse<{ id: string; status: string }>>(
    `/users/${userId}/orders?page=${page}&limit=${limit}`
  );
}

// Example: Request without authentication (public endpoint)
export async function getPublicContractors(): Promise<User[]> {
  return apiClient.get<User[]>('/contractors/public', {
    requireAuth: false,
  });
}

