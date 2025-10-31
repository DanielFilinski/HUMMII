'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/api/auth';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    // Verify email with token
    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email successfully verified!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage('Invalid or expired verification token.');
        }
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <div>
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Your account has been successfully verified.
                <br />
                You can now sign in to your account.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                variant="default"
              >
                Sign In
              </Button>
              <p className="text-xs text-gray-500">
                Redirecting to login in 3 seconds...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Verification Link</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                This verification link is invalid or has expired.
                <br />
                The link expires 24 hours after registration.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/register')}
                className="w-full"
                variant="default"
              >
                Resend Verification Email
              </Button>
              <Link href="/" className="block text-center text-sm text-blue-600 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

