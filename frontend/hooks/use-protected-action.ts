'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import type { UserRole } from './use-role';

interface UseProtectedActionOptions {
  /**
   * Required roles to perform action
   * If not specified, only authentication is required
   */
  requiredRoles?: UserRole[];
  /**
   * Reason message to show in modal
   */
  reason?: string;
  /**
   * Action description
   */
  action?: string;
  /**
   * Callback if user is authenticated and has required role
   */
  onSuccess?: () => void;
  /**
   * Callback if user is authenticated but lacks required role
   */
  onInsufficientRole?: () => void;
}

/**
 * Hook to protect actions behind authentication and role checks
 * Shows auth modal if user is not authenticated
 * 
 * @example
 * ```tsx
 * function CreateOrderButton() {
 *   const { execute, showModal, closeModal, reason, action } = useProtectedAction({
 *     requiredRoles: ['CLIENT'],
 *     reason: 'To create an order and find contractors',
 *     action: 'You need to register as a client',
 *   });
 * 
 *   const handleCreateOrder = () => {
 *     execute(() => {
 *       router.push('/orders/create');
 *     });
 *   };
 * 
 *   return (
 *     <>
 *       <button onClick={handleCreateOrder}>Create Order</button>
 *       <AuthModal 
 *         isOpen={showModal} 
 *         onClose={closeModal}
 *         reason={reason}
 *         action={action}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useProtectedAction({
  requiredRoles,
  reason,
  action,
  onSuccess,
  onInsufficientRole,
}: UseProtectedActionOptions = {}) {
  const { isAuthenticated, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  /**
   * Check if user has required role
   */
  const hasRequiredRole = useCallback(() => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!user || !user.roles) return false;
    return requiredRoles.some(role => user.roles.includes(role));
  }, [requiredRoles, user]);

  /**
   * Execute action if authenticated, otherwise show modal
   * @param callback - Function to execute if user has permission
   */
  const execute = useCallback(
    (callback: () => void | Promise<void>) => {
      // Check authentication first
      if (!isAuthenticated) {
        setShowModal(true);
        return;
      }

      // Check role if required
      if (requiredRoles && requiredRoles.length > 0 && !hasRequiredRole()) {
        // User is authenticated but lacks required role
        console.warn(
          `User roles ${user?.roles?.join(', ')} do not match required roles: ${requiredRoles.join(', ')}`
        );
        onInsufficientRole?.();
        // You can show a different modal or toast here
        return;
      }

      // User is authenticated and has required role
      const result = callback();
      
      // Handle async callbacks
      if (result instanceof Promise) {
        result.then(() => onSuccess?.()).catch((error) => {
          console.error('Protected action failed:', error);
        });
      } else {
        onSuccess?.();
      }
    },
    [isAuthenticated, hasRequiredRole, onSuccess, onInsufficientRole, requiredRoles, user?.roles]
  );

  /**
   * Close modal
   */
  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  /**
   * Open modal manually
   */
  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  return {
    /**
     * Execute protected action
     * Shows modal if not authenticated, executes callback if authorized
     */
    execute,
    /**
     * Whether to show auth modal
     */
    showModal,
    /**
     * Close auth modal
     */
    closeModal,
    /**
     * Open auth modal manually
     */
    openModal,
    /**
     * Whether user is authenticated
     */
    isAuthenticated,
    /**
     * Whether user has required role
     */
    hasRequiredRole: hasRequiredRole(),
    /**
     * Reason and action messages (for passing to AuthModal)
     */
    reason,
    action,
  };
}

