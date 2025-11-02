/**
 * API Client for backend communication
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_V1_URL = `${API_BASE_URL}/api/v1`;

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Auth tokens are in HTTP-only cookies, automatically included with credentials: 'include'
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let error: ApiError;

      try {
        error = await response.json();
      } catch {
        error = {
          message: response.statusText || 'An error occurred',
          statusCode: response.status,
        };
      }

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        // Clear auth state
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid circular dependency
          import('@/lib/store/auth-store').then(({ useAuthStore }) => {
            useAuthStore.getState().logout();
          });

          // Show error message
          this.showErrorToast('Your session has expired. Please login again.');

          // Redirect to login
          window.location.href = '/login';
        }

        throw new Error(error.message || 'Unauthorized');
      }

      // Handle 403 Forbidden - insufficient permissions
      if (response.status === 403) {
        this.showErrorToast(
          'Access denied. You do not have permission to perform this action.'
        );

        throw new Error(error.message || 'Access denied');
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error(error.message || 'Resource not found');
      }

      // Handle 429 Too Many Requests
      if (response.status === 429) {
        this.showErrorToast(
          'Too many requests. Please slow down and try again later.'
        );

        throw new Error(error.message || 'Rate limit exceeded');
      }

      // Handle 500 Internal Server Error
      if (response.status >= 500) {
        this.showErrorToast(
          'Server error. Please try again later or contact support.'
        );

        throw new Error(error.message || 'Server error');
      }

      throw new Error(error.message || 'API request failed');
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  private showErrorToast(message: string): void {
    // Show toast notification if available
    if (typeof window !== 'undefined') {
      // Try to use sonner if available
      import('sonner').then(({ toast }) => {
        toast.error(message);
      }).catch(() => {
        // Fallback to console if sonner not available
        console.error(message);
      });
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers = await (requireAuth
      ? this.getAuthHeaders()
      : Promise.resolve({ 'Content-Type': 'application/json' }));

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
        credentials: 'include', // Include HTTP-only cookies for authentication
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_V1_URL);
export { API_BASE_URL, API_V1_URL };

