'use client';

import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { useState } from 'react';

interface ProtectedFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  action: string;
  requiredRoles?: Array<'CLIENT' | 'CONTRACTOR' | 'ADMIN'>;
  onExecute?: () => void;
}

/**
 * Card component for demonstrating protected features
 * Shows a feature that requires authentication to use
 */
export function ProtectedFeatureCard({
  title,
  description,
  icon,
  action,
  requiredRoles,
  onExecute,
}: ProtectedFeatureCardProps) {
  const [result, setResult] = useState<string | null>(null);
  
  const { execute, showModal, closeModal } = useProtectedAction({
    requiredRoles,
    reason: `To use ${title}`,
    action: `You need to ${requiredRoles ? `be ${requiredRoles.join(' or ')}` : 'be authenticated'}`,
    onSuccess: () => {
      setResult('✅ Success! Action executed.');
      setTimeout(() => setResult(null), 3000);
    },
  });

  const handleClick = () => {
    execute(() => {
      // Execute custom action if provided
      if (onExecute) {
        onExecute();
      } else {
        console.log(`${title} action executed`);
      }
    });
  };

  return (
    <>
      <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500">
        {/* Icon Circle */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
        
        <div className="relative p-6">
          {/* Icon */}
          <div className="text-5xl mb-4">{icon}</div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          
          {/* Role Badge */}
          {requiredRoles && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {requiredRoles.join(' / ')} only
              </span>
            </div>
          )}
          
          {/* Action Button */}
          <button
            onClick={handleClick}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
          >
            {action}
          </button>
          
          {/* Result Message */}
          {result && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm text-center animate-[slideIn_0.2s_ease-out]">
              {result}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}

