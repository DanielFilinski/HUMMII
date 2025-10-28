/**
 * Shared TypeScript type definitions
 */

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'CONTRACTOR' | 'ADMIN' | 'PARTNER';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  avatar?: string;
}

