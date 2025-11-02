import { useAuthStore } from '@/lib/store/auth-store';

/**
 * User role types
 */
export type UserRole = 'CLIENT' | 'CONTRACTOR' | 'ADMIN';

/**
 * Custom hook for role-based access control with multi-role support
 * 
 * Security: Uses activeRole for UI decisions, but checks full roles array
 * 
 * @example
 * ```tsx
 * const { hasRole, isAdmin, activeRole, roles } = useRole();
 * 
 * // Check if user HAS admin role (in their roles array)
 * if (hasRole('ADMIN')) {
 *   // User CAN be admin
 * }
 * 
 * // Check if user IS CURRENTLY in admin mode
 * if (activeRole === 'ADMIN') {
 *   // User is actively using admin mode
 * }
 * 
 * // Check if user has multiple roles
 * if (hasRole(['CLIENT', 'CONTRACTOR'])) {
 *   // User has at least one of these roles
 * }
 * ```
 */
export function useRole() {
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);
  
  /**
   * Check if user has one of the required roles (in their roles array)
   * @param roles - Single role or array of roles
   * @returns true if user has any of the required roles
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user || !user.roles) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.some(role => user.roles.includes(role));
  };

  /**
   * Check if user HAS CLIENT role (not necessarily active)
   */
  const isClient = (): boolean => user?.roles?.includes('CLIENT') || false;

  /**
   * Check if user HAS CONTRACTOR role (not necessarily active)
   */
  const isContractor = (): boolean => user?.roles?.includes('CONTRACTOR') || false;

  /**
   * Check if user HAS ADMIN role (not necessarily active)
   */
  const isAdmin = (): boolean => user?.roles?.includes('ADMIN') || false;

  /**
   * Check if user's ACTIVE role is CLIENT
   */
  const isActiveClient = (): boolean => activeRole === 'CLIENT';

  /**
   * Check if user's ACTIVE role is CONTRACTOR
   */
  const isActiveContractor = (): boolean => activeRole === 'CONTRACTOR';

  /**
   * Check if user's ACTIVE role is ADMIN
   */
  const isActiveAdmin = (): boolean => activeRole === 'ADMIN';

  /**
   * Check if user has any of multiple roles
   * @param roles - Array of roles to check
   * @returns true if user has any of the roles
   */
  const hasAnyRole = (...roles: UserRole[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  /**
   * Check if user has all of the specified roles
   * @param roles - Array of roles to check
   * @returns true if user has all roles
   */
  const hasAllRoles = (...roles: UserRole[]): boolean => {
    if (!user || !user.roles || roles.length === 0) return false;
    return roles.every(role => user.roles.includes(role));
  };

  return {
    /**
     * Current ACTIVE role (what mode user is in)
     */
    activeRole: activeRole as UserRole | null,
    
    /**
     * All roles user has
     */
    roles: user?.roles || [],
    
    /**
     * Check if user has required role(s) in their roles array
     */
    hasRole,
    
    /**
     * Check if user HAS CLIENT role
     */
    isClient,
    
    /**
     * Check if user HAS CONTRACTOR role
     */
    isContractor,
    
    /**
     * Check if user HAS ADMIN role
     */
    isAdmin,
    
    /**
     * Check if user's ACTIVE role is CLIENT
     */
    isActiveClient,
    
    /**
     * Check if user's ACTIVE role is CONTRACTOR
     */
    isActiveContractor,
    
    /**
     * Check if user's ACTIVE role is ADMIN
     */
    isActiveAdmin,
    
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

