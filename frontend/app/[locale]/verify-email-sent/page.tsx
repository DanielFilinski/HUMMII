'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailSentPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from sessionStorage
    const registeredEmail = sessionStorage.getItem('registeredEmail');
    if (registeredEmail) {
      setEmail(registeredEmail);
    } else {
      // If no email found, redirect to register
      router.push('/register');
    }
  }, [router]);

  const handleOpenEmail = () => {
    // Open default email client
    window.location.href = 'mailto:';
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600">
            We've sent a verification link to:
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-2">{email}</p>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600">
            Click the link in the email to verify your account.
          </p>
          <p className="text-xs text-gray-500">
            The link will expire in 24 hours.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleOpenEmail} className="w-full" variant="default">
            Open Email App
          </Button>
          
          <div className="text-sm space-y-2">
            <p>
              <Link href="/register" className="text-blue-600 hover:underline">
                Didn't receive email? Resend
              </Link>
            </p>
            <p>
              <Link href="/register" className="text-gray-600 hover:underline">
                Wrong email? Go back
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

