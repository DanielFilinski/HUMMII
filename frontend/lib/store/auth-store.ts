import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  setUser: (user: AuthState['user']) => void;
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

