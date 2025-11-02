'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Check for redirect path from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRedirectPath = sessionStorage.getItem('redirect_after_auth');
      if (savedRedirectPath) {
        setRedirectPath(savedRedirectPath);
      }
    }
  }, []);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      // Save user data to store (tokens are stored in HTTP-only cookies by backend)
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        roles: response.user.roles,
      });

      // Redirect to saved path or home page
      if (typeof window !== 'undefined') {
        const savedPath = sessionStorage.getItem('redirect_after_auth');
        if (savedPath) {
          sessionStorage.removeItem('redirect_after_auth');
          router.push(savedPath);
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error messages from API
        const errorMessage = err.message;
        if (errorMessage.includes('locked')) {
          setError(errorMessage);
        } else if (errorMessage.includes('not verified')) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.');
        } else if (errorMessage.includes('Invalid credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      <p className="text-center text-gray-600 mb-6">
        Welcome back to Hummii
      </p>

      {redirectPath && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <p className="font-medium">Authentication Required</p>
          <p className="text-xs mt-1">Sign in to continue to your requested page</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            {...registerField('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...registerField('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

