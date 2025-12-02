'use client';

import { AuthButton } from '@/components/ui/button/AuthButton';

/**
 * PREVIEW PAGE для AuthButton
 * 
 * Демонстрация кнопки аутентификации в реальном контексте
 * Откройте в браузере для просмотра
 */

export default function AuthButtonPreview() {
  const handleSignIn = () => {
    console.log('Sign In clicked');
  };

  const handleSignUp = () => {
    console.log('Sign Up clicked');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            AuthButton Component Preview
          </h1>
          <p className="text-text-secondary">
            Кнопка Sign In / Sign Up с размерами: 200×48px, padding 15/20px, radius 1000px
          </p>
        </header>

        {/* Grid of examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Primary variants */}
          <section className="bg-background-card p-6 rounded-lg border border-border-primary">
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Primary (Sign In)</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">Default</p>
                <AuthButton onClick={handleSignIn}>Sign In</AuthButton>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Loading</p>
                <AuthButton isLoading>Signing in...</AuthButton>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Disabled</p>
                <AuthButton disabled>Sign In</AuthButton>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Full Width</p>
                <AuthButton fullWidth onClick={handleSignIn}>Sign In</AuthButton>
              </div>
            </div>
          </section>

          {/* Secondary variants */}
          <section className="bg-background-card p-6 rounded-lg border border-border-primary">
            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Secondary (Sign Up)</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">Default</p>
                <AuthButton variant="secondary" onClick={handleSignUp}>Sign Up</AuthButton>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Loading</p>
                <AuthButton variant="secondary" isLoading>Creating account...</AuthButton>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Disabled</p>
                <AuthButton variant="secondary" disabled>Sign Up</AuthButton>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Full Width</p>
                <AuthButton variant="secondary" fullWidth onClick={handleSignUp}>
                  Sign Up
                </AuthButton>
              </div>
            </div>
          </section>
        </div>

        {/* Real-world example: Login Form */}
        <section className="max-w-md mx-auto">
          <div className="bg-background-card p-8 rounded-2xl border border-border-primary shadow-lg">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h2>
            <p className="text-text-secondary mb-6">Sign in to your account</p>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-border-primary bg-background focus:border-border-focus focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-text-secondary">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-accent-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border-primary bg-background focus:border-border-focus focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border-primary"
                />
                <label htmlFor="remember" className="text-sm text-text-secondary">
                  Remember me for 30 days
                </label>
              </div>

              <AuthButton fullWidth type="submit">
                Sign In
              </AuthButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-accent-primary hover:underline font-medium"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* Buttons side by side */}
        <section className="max-w-md mx-auto">
          <div className="bg-background-card p-8 rounded-2xl border border-border-primary">
            <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">
              Get Started
            </h2>
            <p className="text-text-secondary mb-6 text-center">
              Choose how you'd like to continue
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AuthButton onClick={handleSignIn}>
                Sign In
              </AuthButton>
              <AuthButton variant="secondary" onClick={handleSignUp}>
                Sign Up
              </AuthButton>
            </div>
          </div>
        </section>

        {/* Dark mode example */}
        <section className="dark bg-background p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Dark Mode</h2>
          <div className="flex gap-4 flex-wrap">
            <AuthButton>Sign In</AuthButton>
            <AuthButton variant="secondary">Sign Up</AuthButton>
            <AuthButton isLoading>Loading...</AuthButton>
            <AuthButton disabled>Disabled</AuthButton>
          </div>
        </section>

        {/* Size verification */}
        <section className="bg-background-card p-8 rounded-2xl border border-border-primary">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">
            Проверка размеров
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Требования:</h3>
              <ul className="space-y-1 text-text-secondary text-sm">
                <li>✓ Width: 200px (min-width)</li>
                <li>✓ Height: 48px</li>
                <li>✓ Padding: 15px 20px</li>
                <li>✓ Border radius: 1000px</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">Tailwind классы:</h3>
              <ul className="space-y-1 text-text-secondary text-sm font-mono">
                <li>min-w-[200px]</li>
                <li>h-12</li>
                <li>py-[15px] px-5</li>
                <li>rounded-full</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-accent-primary/10 rounded-lg border-l-4 border-accent-primary">
            <AuthButton>Measure with DevTools</AuthButton>
            <p className="text-xs text-text-secondary mt-2">
              Откройте DevTools → Inspect → измерьте размеры
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
