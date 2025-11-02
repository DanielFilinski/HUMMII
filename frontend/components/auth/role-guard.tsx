'use client';

import { useRole, UserRole } from '@/hooks/use-role';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  /**
   * Content to render if user has required role
   */
  children: ReactNode;
  
  /**
   * Required roles (user must have one of these)
   */
  allowedRoles: UserRole[];
  
  /**
   * Redirect path if user doesn't have required role
   * @default '/login'
   */
  redirectTo?: string;
  
  /**
   * Fallback content to show while checking or if access denied
   */
  fallback?: ReactNode;
  
  /**
   * If true, shows fallback instead of redirecting
   * @default false
   */
  showFallback?: boolean;
}

/**
 * Component to protect content based on user roles
 * 
 * @example
 * ```tsx
 * // Protect admin content
 * <RoleGuard allowedRoles={['ADMIN']}>
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * // Allow multiple roles
 * <RoleGuard allowedRoles={['CLIENT', 'CONTRACTOR']}>
 *   <OrdersList />
 * </RoleGuard>
 * 
 * // Custom fallback
 * <RoleGuard 
 *   allowedRoles={['ADMIN']} 
 *   showFallback={true}
 *   fallback={<div>You need admin access</div>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/login',
  fallback = null,
  showFallback = false,
}: RoleGuardProps) {
  const { hasRole, isAuthenticated } = useRole();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If authenticated but doesn't have required role
    if (!hasRole(allowedRoles) && !showFallback) {
      // Redirect to home or specified path
      router.push('/');
    }
  }, [hasRole, isAuthenticated, allowedRoles, redirectTo, router, showFallback]);

  // Show loading/fallback while checking
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // If doesn't have required role
  if (!hasRole(allowedRoles)) {
    if (showFallback) {
      return <>{fallback || <AccessDenied />}</>;
    }
    return <>{fallback}</>;
  }

  // User has required role, render children
  return <>{children}</>;
}

/**
 * Default access denied component
 */
function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}

/**
 * Higher-order component version for wrapping page components
 * 
 * @example
 * ```tsx
 * export default withRoleGuard(AdminPage, ['ADMIN']);
 * ```
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

