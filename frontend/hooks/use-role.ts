import { useAuthStore } from '@/lib/store/auth-store';

/**
 * User role types
 */
export type UserRole = 'CLIENT' | 'CONTRACTOR' | 'ADMIN';

/**
 * Custom hook for role-based access control
 * 
 * @example
 * ```tsx
 * const { hasRole, isAdmin, isContractor, isClient } = useRole();
 * 
 * if (isAdmin()) {
 *   // Show admin content
 * }
 * 
 * if (hasRole(['CLIENT', 'CONTRACTOR'])) {
 *   // Show content for clients and contractors
 * }
 * ```
 */
export function useRole() {
  const user = useAuthStore((state) => state.user);
  
  /**
   * Check if user has one of the required roles
   * @param roles - Single role or array of roles
   * @returns true if user has any of the required roles
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role as UserRole);
  };

  /**
   * Check if user is CLIENT
   */
  const isClient = (): boolean => user?.role === 'CLIENT';

  /**
   * Check if user is CONTRACTOR
   */
  const isContractor = (): boolean => user?.role === 'CONTRACTOR';

  /**
   * Check if user is ADMIN
   */
  const isAdmin = (): boolean => user?.role === 'ADMIN';

  /**
   * Check if user has any of multiple roles
   * @param roles - Array of roles to check
   * @returns true if user has any of the roles
   */
  const hasAnyRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  /**
   * Check if user has all of the specified roles
   * Note: In current implementation, a user can only have one role at a time
   * This is for future-proofing if multiple roles are needed
   * @param roles - Array of roles to check
   * @returns true if user has all roles
   */
  const hasAllRoles = (...roles: UserRole[]): boolean => {
    if (!user || roles.length === 0) return false;
    // Currently user can only have one role, so only works for single role
    return roles.length === 1 && roles[0] === user.role;
  };

  return {
    /**
     * Current user role or undefined if not authenticated
     */
    role: user?.role as UserRole | undefined,
    
    /**
     * Check if user has required role(s)
     */
    hasRole,
    
    /**
     * Check if user is CLIENT
     */
    isClient,
    
    /**
     * Check if user is CONTRACTOR
     */
    isContractor,
    
    /**
     * Check if user is ADMIN
     */
    isAdmin,
    
    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole,
    
    /**
     * Check if user has all of the specified roles
     */
    hasAllRoles,
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated: !!user,
  };
}

