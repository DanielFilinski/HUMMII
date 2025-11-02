'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { register } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const router = useRouter();
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
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const password = watch('password');

  const getPasswordStrength = (pass: string): 'weak' | 'medium' | 'strong' => {
    if (pass.length < 12) return 'weak';
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const criteriaCount = [hasLower, hasUpper, hasNumber].filter(Boolean).length;
    if (criteriaCount === 3 && pass.length >= 14) return 'strong';
    if (criteriaCount >= 2 && pass.length >= 12) return 'medium';
    return 'weak';
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });

      // Store email for verification page
      sessionStorage.setItem('registeredEmail', response.email);

      // Redirect to verification sent page
      router.push('/verify-email-sent');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <p className="text-center text-gray-600 mb-6">
        Join Hummii to find trusted service providers
      </p>

      {redirectPath && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <p className="font-medium">Registration Required</p>
          <p className="text-xs mt-1">Create an account to continue</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...registerField('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {password && password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded ${
                    passwordStrength === 'weak'
                      ? 'bg-red-500'
                      : passwordStrength === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded ${
                    passwordStrength === 'medium' || passwordStrength === 'strong'
                      ? passwordStrength === 'strong'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                      : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded ${
                    passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {passwordStrength === 'weak' && 'Weak password'}
                {passwordStrength === 'medium' && 'Medium strength'}
                {passwordStrength === 'strong' && 'Strong password'}
              </p>
            </div>
          )}

          {/* Password Requirements */}
          {password && password.length > 0 && (
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li className={password.length >= 12 ? 'text-green-600' : 'text-gray-400'}>
                  At least 12 characters
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  One lowercase letter
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  One uppercase letter
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  One number
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+11234567890"
            {...registerField('phone')}
            aria-invalid={errors.phone ? 'true' : 'false'}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Canadian format: +1XXXXXXXXXX</p>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-xs text-gray-500">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

