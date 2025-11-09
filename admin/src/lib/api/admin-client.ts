import Cookies from 'js-cookie';
import type {
  User,
  PaginatedResponse,
  UserListParams,
  AuditLog,
  AuditLogParams,
  PlatformStats,
  ContractorVerification,
  VerifyContractorDto,
} from '@/types/admin';
import { UserRole } from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ==================== MOCK DATA CONTROL ====================
// Установите в false, когда бэкенд будет готов
const USE_MOCK_DATA = true;
// ==========================================================

class AdminApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = Cookies.get('admin_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'API request failed');
    }

    // Для 204 No Content возвращаем пустой объект
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ==================== USER MANAGEMENT ====================

  async getUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: [
          {
            id: '1',
            email: 'john.doe@example.com',
            name: 'John Doe',
            roles: [UserRole.CLIENT, UserRole.CONTRACTOR],
            isVerified: true,
            isLocked: false,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-11-05T15:30:00Z',
          },
          {
            id: '2',
            email: 'jane.smith@example.com',
            name: 'Jane Smith',
            roles: [UserRole.CLIENT],
            isVerified: true,
            isLocked: false,
            createdAt: '2024-02-20T12:00:00Z',
            updatedAt: '2024-11-06T09:15:00Z',
          },
          {
            id: '3',
            email: 'bob.worker@example.com',
            name: 'Bob Worker',
            roles: [UserRole.CONTRACTOR],
            isVerified: true,
            isLocked: true,
            createdAt: '2024-03-10T08:00:00Z',
            updatedAt: '2024-11-01T14:20:00Z',
          },
          {
            id: '4',
            email: 'alice.admin@example.com',
            name: 'Alice Admin',
            roles: [UserRole.ADMIN, UserRole.CLIENT],
            isVerified: true,
            isLocked: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-11-08T18:45:00Z',
          },
          {
            id: '5',
            email: 'mike.unverified@example.com',
            name: 'Mike Unverified',
            roles: [UserRole.CONTRACTOR],
            isVerified: false,
            isLocked: false,
            createdAt: '2024-10-15T11:30:00Z',
            updatedAt: '2024-10-15T11:30:00Z',
          },
        ],
        pagination: {
          total: 5,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1,
        },
      });
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.role) searchParams.append('role', params.role);
    if (params.search) searchParams.append('search', params.search);

    return this.request<PaginatedResponse<User>>(
      `/admin/users?${searchParams.toString()}`,
    );
  }

  async getUserById(id: string): Promise<User> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id,
        email: 'john.doe@example.com',
        name: 'John Doe',
        roles: [UserRole.CLIENT, UserRole.CONTRACTOR],
        isVerified: true,
        isLocked: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-11-05T15:30:00Z',
      });
    }

    return this.request<User>(`/admin/users/${id}`);
  }

  async addUserRole(userId: string, role: UserRole): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async removeUserRole(userId: string, role: UserRole): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/roles`, {
      method: 'DELETE',
      body: JSON.stringify({ role }),
    });
  }

  async lockUser(userId: string, reason?: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/lock`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async unlockUser(userId: string): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/unlock`, {
      method: 'PATCH',
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ==================== CONTRACTOR VERIFICATION ====================

  async getPendingContractors(
    params: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResponse<ContractorVerification>> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: [
          {
            id: '1',
            userId: '5',
            user: {
              name: 'Mike Unverified',
              email: 'mike.unverified@example.com',
            },
            businessName: 'ООО "МайкСтрой"',
            businessType: 'Строительство',
            documents: [
              'https://example.com/doc1.pdf',
              'https://example.com/doc2.pdf',
            ],
            status: 'PENDING',
            createdAt: '2024-10-15T11:30:00Z',
          },
          {
            id: '2',
            userId: '6',
            user: {
              name: 'Sarah Builder',
              email: 'sarah.builder@example.com',
            },
            businessName: 'ИП Сарычева',
            businessType: 'Ремонт',
            documents: [
              'https://example.com/doc3.pdf',
            ],
            status: 'PENDING',
            createdAt: '2024-11-01T09:15:00Z',
          },
        ],
        pagination: {
          total: 2,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1,
        },
      });
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return this.request<PaginatedResponse<ContractorVerification>>(
      `/admin/contractors/pending?${searchParams.toString()}`,
    );
  }

  async verifyContractor(
    contractorId: string,
    data: VerifyContractorDto,
  ): Promise<ContractorVerification> {
    return this.request<ContractorVerification>(
      `/admin/contractors/${contractorId}/verify`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  }

  async rejectContractor(
    contractorId: string,
    reason?: string,
  ): Promise<ContractorVerification> {
    return this.request<ContractorVerification>(
      `/admin/contractors/${contractorId}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      },
    );
  }

  // ==================== AUDIT LOGS ====================

  async getAuditLogs(params: AuditLogParams = {}): Promise<PaginatedResponse<AuditLog>> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: [
          {
            id: '1',
            action: 'USER_LOCKED',
            userId: '3',
            adminId: '4',
            resourceType: 'USER',
            resourceId: '3',
            metadata: { reason: 'Нарушение правил платформы' },
            ipAddress: '192.168.1.100',
            createdAt: '2024-11-01T14:20:00Z',
          },
          {
            id: '2',
            action: 'USER_ROLE_ADDED',
            userId: '2',
            adminId: '4',
            resourceType: 'USER',
            resourceId: '2',
            metadata: { role: 'CONTRACTOR' },
            ipAddress: '192.168.1.100',
            createdAt: '2024-10-28T10:15:00Z',
          },
          {
            id: '3',
            action: 'CONTRACTOR_VERIFIED',
            userId: '1',
            adminId: '4',
            resourceType: 'CONTRACTOR',
            resourceId: '1',
            metadata: { verified: true },
            ipAddress: '192.168.1.100',
            createdAt: '2024-10-15T16:45:00Z',
          },
          {
            id: '4',
            action: 'USER_CREATED',
            userId: '5',
            adminId: '4',
            resourceType: 'USER',
            resourceId: '5',
            metadata: { email: 'mike.unverified@example.com' },
            ipAddress: '192.168.1.101',
            createdAt: '2024-10-15T11:30:00Z',
          },
        ],
        pagination: {
          total: 4,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1,
        },
      });
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.userId) searchParams.append('userId', params.userId);
    if (params.action) searchParams.append('action', params.action);
    if (params.resourceType) searchParams.append('resourceType', params.resourceType);

    return this.request<PaginatedResponse<AuditLog>>(
      `/admin/audit-logs?${searchParams.toString()}`,
    );
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        id,
        action: 'USER_LOCKED',
        userId: '3',
        adminId: '4',
        resourceType: 'USER',
        resourceId: '3',
        metadata: { reason: 'Нарушение правил платформы' },
        ipAddress: '192.168.1.100',
        createdAt: '2024-11-01T14:20:00Z',
      });
    }

    return this.request<AuditLog>(`/admin/audit-logs/${id}`);
  }

  // ==================== PLATFORM STATISTICS ====================

  async getPlatformStats(): Promise<PlatformStats> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        totalUsers: 125,
        totalOrders: 342,
        totalRevenue: 1250000,
        activeUsers: 89,
        verifiedContractors: 45,
        pendingVerifications: 2,
        pendingOrders: 15,
        completedOrders: 298,
        cancelledOrders: 29,
      });
    }

    return this.request<PlatformStats>('/admin/stats');
  }

  async getUserStats(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        period,
        data: [
          { date: '2024-10-01', users: 10 },
          { date: '2024-10-08', users: 15 },
          { date: '2024-10-15', users: 22 },
          { date: '2024-10-22', users: 18 },
          { date: '2024-10-29', users: 25 },
          { date: '2024-11-05', users: 30 },
        ],
      });
    }

    return this.request<any>(`/admin/stats/users?period=${period}`);
  }
}

export const adminApi = new AdminApiClient();