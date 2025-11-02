'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { RoleSwitcher } from './role-switcher';

/**
 * User menu component with logout functionality and role switcher
 * Shows user info, role switcher (if multiple roles), and logout button
 */
export function UserMenu() {
  const { user, activeRole, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Call logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state
      logout();
      setIsLoading(false);
      
      // Redirect to home
      router.push('/');
      router.refresh();
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Role Switcher (only shows if user has multiple roles) */}
      <RoleSwitcher />

      {/* User Info */}
      <div className="hidden sm:block text-right">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">
          {activeRole || user.roles[0]}
        </p>
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}

