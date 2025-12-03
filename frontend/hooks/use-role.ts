import { useAuthStore } from '@/lib/store/auth-store';

export function useRole() {
  const { user } = useAuthStore();

  const activeRole = user?.roles?.[0] || null;
  const isActiveContractor = activeRole === 'contractor';
  const isActiveClient = activeRole === 'client';
  const isAdmin = activeRole === 'admin';

  return {
    activeRole,
    isActiveContractor,
    isActiveClient,
    isAdmin,
  };
}
