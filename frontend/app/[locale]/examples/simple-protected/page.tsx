'use client';

import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Simple example page showing basic protected action usage
 * Perfect for quick testing
 */
export default function SimpleProtectedExample() {
  const { isAuthenticated, user } = useAuthStore();
  
  const { execute, showModal, closeModal } = useProtectedAction({
    requiredRoles: ['CLIENT'],
    reason: 'To create an order',
    action: 'You need to register as a client',
  });

  const handleCreateOrder = () => {
    execute(() => {
      alert('✅ Order creation page would open here!');
      console.log('User is authenticated and has CLIENT role');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Protected Action Test
          </h1>
          
          {/* User Status */}
          <div className="mb-6 p-4 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Current Status:
            </p>
            {isAuthenticated ? (
              <div className="space-y-1">
                <p className="text-green-600 font-semibold">
                  ✅ Authenticated
                </p>
                <p className="text-sm text-gray-600">
                  Roles: <span className="font-medium">{user?.roles?.join(', ')}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Name: <span className="font-medium">{user?.name}</span>
                </p>
              </div>
            ) : (
              <p className="text-yellow-600 font-semibold">
                ⚠️ Not Authenticated
              </p>
            )}
          </div>

          {/* Test Button */}
          <button
            onClick={handleCreateOrder}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Order (CLIENT only)
          </button>

          {/* Instructions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              What happens:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">1.</span>
                <span>If not logged in → Shows registration modal</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">2.</span>
                <span>If wrong role → Shows error message</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">3.</span>
                <span>If CLIENT → Executes action</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 rounded-lg p-6 text-white shadow-xl">
          <p className="text-xs text-gray-400 mb-2">CODE:</p>
          <pre className="text-xs overflow-x-auto">
{`const { execute, showModal, closeModal } = 
  useProtectedAction({
    requiredRoles: ['CLIENT'],
    reason: 'To create an order',
  });

<button onClick={() => execute(() => {
  // Your protected code here
})}>
  Create Order
</button>

<AuthModal 
  isOpen={showModal} 
  onClose={closeModal}
/>`}
          </pre>
        </div>
      </div>

      {/* AuthModal */}
      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason="To create an order"
        action="You need to register as a client"
      />
    </div>
  );
}

