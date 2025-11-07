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
  UserRole,
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
    return this.request<AuditLog>(`/admin/audit-logs/${id}`);
  }

  // ==================== PLATFORM STATISTICS ====================

  async getPlatformStats(): Promise<PlatformStats> {
    return this.request<PlatformStats>('/admin/stats');
  }

  async getUserStats(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return this.request<any>(`/admin/stats/users?period=${period}`);
  }
}

export const adminApi = new AdminApiClient();