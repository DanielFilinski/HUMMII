'use client';

import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { apiClient } from '@/lib/api/client';
import { useState } from 'react';

interface ApplyToOrderButtonProps {
  /**
   * Order ID to apply to
   */
  orderId: string;
  /**
   * Callback when application is submitted
   */
  onApplied?: () => void;
  /**
   * Custom button text
   */
  text?: string;
  /**
   * Custom CSS classes
   */
  className?: string;
}

/**
 * Protected button for contractors to apply to orders
 * Only authenticated CONTRACTORS can apply
 * Shows auth modal if user is not authenticated
 * 
 * @example
 * ```tsx
 * <ApplyToOrderButton 
 *   orderId="order-123"
 *   onApplied={() => console.log('Applied!')}
 * />
 * ```
 */
export function ApplyToOrderButton({
  orderId,
  onApplied,
  text = 'Apply to Order',
  className = '',
}: ApplyToOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { execute, showModal, closeModal, reason, action } = useProtectedAction({
    requiredRoles: ['CONTRACTOR'],
    reason: 'To apply to orders',
    action: 'You need to register as a contractor',
  });

  const handleApply = () => {
    execute(async () => {
      // This code runs ONLY if user is authenticated and is a CONTRACTOR
      setIsLoading(true);
      
      try {
        await apiClient.post(`/orders/${orderId}/apply`);
        
        // Notify parent component
        onApplied?.();
      } catch (error) {
        console.error('Failed to apply to order:', error);
        // Error is handled by apiClient
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleApply}
        disabled={isLoading}
        className={`px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Applying...
          </span>
        ) : (
          text
        )}
      </button>

      <AuthModal
        isOpen={showModal}
        onClose={closeModal}
        reason={reason}
        action={action}
      />
    </>
  );
}

