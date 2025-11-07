/**
 * Типы для Admin API
 */

export enum UserRole {
  CLIENT = 'CLIENT',
  CONTRACTOR = 'CONTRACTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  isVerified: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  adminId: string;
  resourceType: string;
  resourceId: string;
  metadata: any;
  ipAddress: string;
  createdAt: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  verifiedContractors: number;
  pendingVerifications: number;
}

export interface ContractorVerification {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  businessName?: string;
  businessType?: string;
  documents: string[];
  status: string;
  createdAt: string;
}

export interface VerifyContractorDto {
  verified: boolean;
  notes?: string;
}