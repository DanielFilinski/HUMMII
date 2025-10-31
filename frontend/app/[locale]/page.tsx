import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm text-center">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('welcome')}
        </h1>
        <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          {t('description')}
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px]">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Find Services</h3>
            <p className="text-gray-600">
              Browse trusted contractors in your area for any service you need.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Trusted Platform</h3>
            <p className="text-gray-600">
              All contractors are verified and reviewed by real customers.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Safe and secure payment processing with our integrated system.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
