'use client';

import { useRole, UserRole } from '@/hooks/use-role';
import { ReactNode } from 'react';

interface RequireRoleProps {
  /**
   * Content to render if user has required role
   */
  children: ReactNode;
  
  /**
   * Required roles (user must have one of these)
   */
  roles: UserRole | UserRole[];
  
  /**
   * Content to show if user doesn't have required role
   */
  fallback?: ReactNode;
}

/**
 * Inline component for conditional rendering based on roles
 * Unlike RoleGuard, this doesn't redirect - just hides/shows content
 * 
 * @example
 * ```tsx
 * <RequireRole roles="ADMIN">
 *   <button>Delete User</button>
 * </RequireRole>
 * 
 * <RequireRole roles={['CLIENT', 'CONTRACTOR']}>
 *   <button>Create Order</button>
 * </RequireRole>
 * 
 * <RequireRole 
 *   roles="ADMIN" 
 *   fallback={<p>Admin only</p>}
 * >
 *   <AdminPanel />
 * </RequireRole>
 * ```
 */
export function RequireRole({ children, roles, fallback = null }: RequireRoleProps) {
  const { hasRole } = useRole();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to show content ONLY for specific role
 * 
 * @example
 * ```tsx
 * <OnlyFor role="ADMIN">
 *   <AdminButton />
 * </OnlyFor>
 * ```
 */
export function OnlyFor({ 
  role, 
  children 
}: { 
  role: UserRole; 
  children: ReactNode;
}) {
  const { role: userRole } = useRole();

  if (userRole !== role) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Component to hide content for specific role
 * 
 * @example
 * ```tsx
 * <HideFor role="ADMIN">
 *   <UpgradeButton />
 * </HideFor>
 * ```
 */
export function HideFor({ 
  role, 
  children 
}: { 
  role: UserRole; 
  children: ReactNode;
}) {
  const { role: userRole } = useRole();

  if (userRole === role) {
    return null;
  }

  return <>{children}</>;
}

