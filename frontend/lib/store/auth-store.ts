import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CLIENT' | 'CONTRACTOR' | 'ADMIN';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[]; // CHANGED: from role to roles array
  avatar?: string;
  isVerified?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  activeRole: UserRole | null; // NEW: currently active role
  setUser: (user: AuthUser | null) => void;
  setActiveRole: (role: UserRole) => void; // NEW: switch active role
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      activeRole: null,
      
      setUser: (user) => {
        // When setting user, set first role as active by default
        const activeRole = user?.roles?.[0] || null;
        set({ 
          user, 
          isAuthenticated: !!user,
          activeRole,
        });
      },
      
      setActiveRole: (role) => {
        const { user } = get();
        
        // Security: Validate that user has this role
        if (user && user.roles.includes(role)) {
          set({ activeRole: role });
        } else {
          console.warn(`Cannot set activeRole to ${role}: user doesn't have this role`);
        }
      },
      
      logout: () =>
        set({ 
          user: null, 
          isAuthenticated: false,
          activeRole: null,
        }),
    }),
    {
      name: 'auth-storage',
      // Only persist user info, not tokens (tokens in HTTP-only cookies)
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole, // Persist active role selection
      }),
    }
  )
);

