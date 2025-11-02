'use client';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateOrderButton } from '@/components/features/orders/create-order-button';
import { UserMenu } from '@/components/features/auth/user-menu';
import { ProtectedFeatureCard } from '@/components/features/examples/protected-feature-card';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with User Menu */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Hummii</h2>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="z-10 w-full max-w-7xl items-center justify-between text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Hummii
          </h1>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Find trusted service providers in Canada. Secure payments, verified contractors, real-time chat.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <CreateOrderButton 
              text="Create Order"
              variant="primary"
              className="min-w-[200px]"
            />
            <Link href="/en/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px]">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Try Protected Features Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-16 text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-3">🚀 Try Protected Features</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Click any button below to test authentication flow. If you're not logged in, you'll see a modal prompting you to register or sign in.
            </p>
            
            {/* Protected Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <ProtectedFeatureCard
                icon="📝"
                title="Create Order"
                description="Post a job and find contractors"
                action="Create New Order"
                requiredRoles={['CLIENT']}
                onExecute={() => alert('🎉 Redirecting to order creation...')}
              />
              
              <ProtectedFeatureCard
                icon="💼"
                title="Apply to Orders"
                description="Browse and apply to available jobs"
                action="View Orders"
                requiredRoles={['CONTRACTOR']}
                onExecute={() => alert('🎉 Opening orders list...')}
              />
              
              <ProtectedFeatureCard
                icon="❤️"
                title="Save Favorites"
                description="Bookmark contractors you like"
                action="Add to Favorites"
                onExecute={() => alert('❤️ Added to your favorites!')}
              />
              
              <ProtectedFeatureCard
                icon="💬"
                title="Send Messages"
                description="Chat with service providers"
                action="Start Chatting"
                onExecute={() => alert('💬 Opening chat window...')}
              />
              
              <ProtectedFeatureCard
                icon="⭐"
                title="Leave Review"
                description="Rate your experience"
                action="Write Review"
                requiredRoles={['CLIENT', 'CONTRACTOR']}
                onExecute={() => alert('⭐ Opening review form...')}
              />
              
              <ProtectedFeatureCard
                icon="📊"
                title="View Dashboard"
                description="Access your stats and analytics"
                action="Open Dashboard"
                onExecute={() => alert('📊 Loading your dashboard...')}
              />
            </div>
          </div>

          {/* Protected Actions Demo Link */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-12 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left flex-1">
                <h3 className="text-xl font-bold mb-2">🔒 More Examples & Documentation</h3>
                <p className="text-blue-100">
                  Explore detailed examples with code samples and interactive demos
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Link href="/en/examples/simple-protected" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 border-white"
                  >
                    Simple Demo
                  </Button>
                </Link>
                <Link href="/en/examples/protected-actions" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Full Examples
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Find Services</h3>
              <p className="text-gray-600">
                Browse trusted contractors in your area for any service you need.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Trusted Platform</h3>
              <p className="text-gray-600">
                All contractors are verified and reviewed by real customers.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Safe and secure payment processing with our integrated system.
              </p>
            </div>
          </div>

          {/* Developer Features */}
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Developer Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🔒</div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Protected Actions System
                    </h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Two-layer protection with instant UX feedback and backend security enforcement
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                        Authentication
                      </span>
                      <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                        Role-based Access
                      </span>
                      <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                        PIPEDA Compliant
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      React Hooks & Components
                    </h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Ready-to-use hooks and components for rapid development
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">
                        useProtectedAction
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">
                        AuthModal
                      </span>
                      <span className="inline-block px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">
                        TypeScript
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
