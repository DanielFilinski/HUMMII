'use client';

import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { useRouter } from 'next/navigation';

interface CreateOrderButtonProps {
  /**
   * Custom button text
   */
  text?: string;
  /**
   * Custom CSS classes
   */
  className?: string;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Protected button for creating orders
 * Only authenticated CLIENTS can create orders
 * Shows auth modal if user is not authenticated
 * 
 * @example
 * ```tsx
 * <CreateOrderButton />
 * <CreateOrderButton text="Post a Job" variant="secondary" />
 * ```
 */
export function CreateOrderButton({
  text = 'Create Order',
  className = '',
  variant = 'primary',
}: CreateOrderButtonProps) {
  const router = useRouter();
  
  const { execute, showModal, closeModal, reason, action } = useProtectedAction({
    requiredRoles: ['CLIENT'],
    reason: 'To create an order and find contractors',
    action: 'You need to register as a client',
  });

  const handleCreateOrder = () => {
    execute(() => {
      // This code runs ONLY if user is authenticated and is a CLIENT
      router.push('/en/orders/create');
    });
  };

  // Button styles based on variant
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  return (
    <>
      <button
        onClick={handleCreateOrder}
        className={`px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles[variant]} ${className}`}
      >
        {text}
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

