import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CLIENT' | 'CONTRACTOR' | 'ADMIN';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),
      logout: () =>
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      // Only persist user info, not tokens (tokens in HTTP-only cookies)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

