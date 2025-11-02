'use client';

import { useState } from 'react';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { CreateOrderButton } from '@/components/features/orders/create-order-button';
import { ApplyToOrderButton } from '@/components/features/orders/apply-to-order-button';
import { ChatInput } from '@/components/features/chat/chat-input';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api/client';

/**
 * Demo page showing various protected action patterns
 * This page demonstrates how to use the protection system
 */
export default function ProtectedActionsExamplePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Protected Actions Demo
          </h1>
          <p className="text-lg text-gray-600">
            Examples of authentication and role-based protection
          </p>
          
          {/* User Status */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow inline-block">
            <p className="text-sm font-medium text-gray-700">
              Status: {isAuthenticated ? (
                <span className="text-green-600">✅ Authenticated as {user?.roles?.join(', ')}</span>
              ) : (
                <span className="text-yellow-600">⚠️ Not Authenticated</span>
              )}
            </p>
            {isAuthenticated && (
              <p className="text-xs text-gray-500 mt-1">
                {user?.name} ({user?.email})
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Examples */}
          <div className="space-y-8">
            {/* Example 1: Pre-built Components */}
            <ExampleCard
              title="1. Pre-built Components"
              description="Ready-to-use protected buttons"
            >
              <div className="space-y-3">
                <CreateOrderButton 
                  text="Create Order (CLIENT only)"
                  className="w-full"
                />
                
                <ApplyToOrderButton 
                  orderId="demo-order-123"
                  text="Apply to Order (CONTRACTOR only)"
                  className="w-full"
                  onApplied={() => addLog('Applied to order successfully')}
                />
              </div>
            </ExampleCard>

            {/* Example 2: Simple Protection */}
            <Example2SimpleProtection addLog={addLog} />

            {/* Example 3: Role-based Protection */}
            <Example3RoleProtection addLog={addLog} />

            {/* Example 4: Async API Call */}
            <Example4AsyncApiCall addLog={addLog} />

            {/* Example 5: Multiple Actions */}
            <Example5MultipleActions addLog={addLog} />

            {/* Example 6: Chat Input */}
            <ExampleCard
              title="6. Chat Input Component"
              description="Protected real-time messaging"
            >
              <ChatInput
                orderId="demo-order-123"
                onMessageSent={(msg) => addLog(`Message sent: ${msg}`)}
                placeholder="Try sending a message..."
              />
            </ExampleCard>
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activity Log
                </h3>
                <button
                  onClick={() => setLogs([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No activity yet. Try clicking the buttons!
                  </p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-600 p-2 bg-gray-50 rounded font-mono"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Code Example */}
            <div className="mt-6 bg-gray-900 rounded-lg p-6 text-white">
              <h4 className="text-sm font-semibold mb-3">Quick Start Code:</h4>
              <pre className="text-xs overflow-x-auto">
{`const { execute, showModal, closeModal } = 
  useProtectedAction({
    requiredRoles: ['CLIENT'],
    reason: 'To create orders',
  });

<button onClick={() => execute(() => {
  // Your action here
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
        </div>

        {/* Documentation Links */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📚 Documentation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <a href="/docs/PROTECTED_ACTIONS.md" className="text-blue-600 hover:underline">
              → Full Documentation (English)
            </a>
            <a href="/docs/PROTECTED_ACTIONS_RU.md" className="text-blue-600 hover:underline">
              → Quick Start (Russian)
            </a>
            <a href="/docs/examples/protected-actions-examples.tsx" className="text-blue-600 hover:underline">
              → Code Examples
            </a>
            <a href="/docs/FLOW_DIAGRAM.md" className="text-blue-600 hover:underline">
              → Flow Diagrams
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example Card Component
function ExampleCard({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {children}
    </div>
  );
}

// Example 2: Simple Protection
function Example2SimpleProtection({ addLog }: { addLog: (msg: string) => void }) {
  const { execute, showModal, closeModal } = useProtectedAction({
    reason: 'To access this feature',
    action: 'Please register or login to continue',
  });

  const handleClick = () => {
    execute(() => {
      addLog('Simple protected action executed');
      alert('✅ Action completed successfully!');
    });
  };

  return (
    <>
      <ExampleCard
        title="2. Simple Protection"
        description="Basic authentication check without role requirement"
      >
        <button
          onClick={handleClick}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Click Me (Auth Required)
        </button>
      </ExampleCard>

      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason="To access this feature"
        action="Please register or login to continue"
      />
    </>
  );
}

// Example 3: Role-based Protection
function Example3RoleProtection({ addLog }: { addLog: (msg: string) => void }) {
  const { execute, showModal, closeModal } = useProtectedAction({
    requiredRoles: ['ADMIN'],
    reason: 'To access admin features',
    action: 'You need administrator privileges',
    onInsufficientRole: () => {
      addLog('❌ Access denied: Insufficient role (need ADMIN)');
      alert('⛔ You need to be an ADMIN to perform this action');
    },
  });

  const handleAdminAction = () => {
    execute(() => {
      addLog('✅ Admin action executed');
      alert('🔐 Admin action completed!');
    });
  };

  return (
    <>
      <ExampleCard
        title="3. Role-based Protection"
        description="Requires specific role (ADMIN)"
      >
        <button
          onClick={handleAdminAction}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Admin Action (ADMIN only)
        </button>
        <p className="text-xs text-gray-500 mt-2">
          💡 This will show error if you're not an ADMIN
        </p>
      </ExampleCard>

      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason="To access admin features"
        action="You need administrator privileges"
      />
    </>
  );
}

// Example 4: Async API Call
function Example4AsyncApiCall({ addLog }: { addLog: (msg: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { execute, showModal, closeModal } = useProtectedAction({
    reason: 'To add items to favorites',
    action: 'Register to save your favorites',
  });

  const addToFavorites = () => {
    execute(async () => {
      addLog('⏳ Adding to favorites...');
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // await apiClient.post('/favorites', { itemId: 'demo-123' });
        
        addLog('✅ Added to favorites successfully');
        alert('❤️ Added to favorites!');
      } catch (error) {
        addLog('❌ Failed to add to favorites');
        alert('⚠️ Failed to add to favorites');
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <>
      <ExampleCard
        title="4. Async API Call"
        description="Protected action with loading state"
      >
        <button
          onClick={addToFavorites}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </>
          ) : (
            '❤️ Add to Favorites'
          )}
        </button>
      </ExampleCard>

      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason="To add items to favorites"
        action="Register to save your favorites"
      />
    </>
  );
}

// Example 5: Multiple Actions
function Example5MultipleActions({ addLog }: { addLog: (msg: string) => void }) {
  // First protected action
  const viewProfile = useProtectedAction({
    requiredRoles: ['CLIENT', 'CONTRACTOR'],
    reason: 'To view profiles',
  });

  // Second protected action
  const sendMessage = useProtectedAction({
    reason: 'To send messages',
  });

  return (
    <>
      <ExampleCard
        title="5. Multiple Protected Actions"
        description="Two different actions with different requirements"
      >
        <div className="space-y-3">
          <button
            onClick={() => viewProfile.execute(() => {
              addLog('📋 Viewing profile...');
              alert('👤 Profile opened!');
            })}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Profile (CLIENT/CONTRACTOR)
          </button>

          <button
            onClick={() => sendMessage.execute(() => {
              addLog('💬 Sending message...');
              alert('📨 Message sent!');
            })}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Send Message (Any authenticated)
          </button>
        </div>
      </ExampleCard>

      {/* Modals for both actions */}
      <AuthModal 
        isOpen={viewProfile.showModal} 
        onClose={viewProfile.closeModal}
        reason="To view profiles"
        action="Register to view contractor profiles"
      />
      
      <AuthModal 
        isOpen={sendMessage.showModal} 
        onClose={sendMessage.closeModal}
        reason="To send messages"
        action="Register to start messaging"
      />
    </>
  );
}

