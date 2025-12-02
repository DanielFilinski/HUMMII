'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiClient } from '@/lib/api/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      // Fetch user data from backend (tokens are in cookies)
      apiClient
        .get('/users/me')
        .then((response: any) => {
          setUser(response.data);
          
          // Redirect to saved path or home
          const savedPath = sessionStorage.getItem('redirect_after_auth');
          if (savedPath) {
            sessionStorage.removeItem('redirect_after_auth');
            router.push(savedPath);
          } else {
            router.push('/');
          }
        })
        .catch(() => {
          router.push('/login?error=session_failed');
        });
    } else if (error) {
      router.push(`/login?error=${error}`);
    } else {
      router.push('/login');
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}

