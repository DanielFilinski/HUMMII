import { AuthButton } from './AuthButton';

/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ AuthButton
 * 
 * Демонстрирует различные варианты использования кнопки аутентификации
 */

export function AuthButtonExamples() {
  return (
    <div className="space-y-8 p-8 bg-background">
      {/* Базовое использование */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Базовые варианты</h2>
        <div className="flex gap-4">
          <AuthButton>Sign In</AuthButton>
          <AuthButton variant="secondary">Sign Up</AuthButton>
        </div>
      </section>

      {/* Состояния */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Состояния</h2>
        <div className="flex gap-4 flex-wrap">
          <AuthButton>Default</AuthButton>
          <AuthButton isLoading>Loading...</AuthButton>
          <AuthButton disabled>Disabled</AuthButton>
        </div>
      </section>

      {/* Secondary вариант */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Secondary варианты</h2>
        <div className="flex gap-4 flex-wrap">
          <AuthButton variant="secondary">Sign Up</AuthButton>
          <AuthButton variant="secondary" isLoading>Creating account...</AuthButton>
          <AuthButton variant="secondary" disabled>Disabled</AuthButton>
        </div>
      </section>

      {/* Full width */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Full Width</h2>
        <div className="max-w-md space-y-3">
          <AuthButton fullWidth>Sign In</AuthButton>
          <AuthButton variant="secondary" fullWidth>Sign Up</AuthButton>
        </div>
      </section>

      {/* С иконками */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">С иконками</h2>
        <div className="flex gap-4 flex-wrap">
          <AuthButton>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </AuthButton>
          <AuthButton variant="secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Sign Up
          </AuthButton>
        </div>
      </section>

      {/* Реальный пример формы входа */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Пример формы входа</h2>
        <div className="max-w-md bg-background-card p-6 rounded-lg border border-border-primary">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">Welcome back</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg border border-border-primary focus:border-border-focus focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-border-primary focus:border-border-focus focus:outline-none"
              />
            </div>
            <AuthButton fullWidth type="submit">
              Sign In
            </AuthButton>
            <div className="text-center text-text-secondary text-sm">
              Don't have an account?{' '}
              <button type="button" className="text-accent-primary hover:underline">
                Sign up
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Тёмная тема */}
      <section className="dark bg-background p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Тёмная тема</h2>
        <div className="flex gap-4 flex-wrap">
          <AuthButton>Sign In</AuthButton>
          <AuthButton variant="secondary">Sign Up</AuthButton>
          <AuthButton isLoading>Loading...</AuthButton>
          <AuthButton disabled>Disabled</AuthButton>
        </div>
      </section>

      {/* Размеры - соответствие требованиям */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">Размеры (проверка)</h2>
        <div className="space-y-2">
          <p className="text-text-secondary text-sm">✓ width: 200px (min-width)</p>
          <p className="text-text-secondary text-sm">✓ height: 48px</p>
          <p className="text-text-secondary text-sm">✓ padding: 15px (top/bottom), 20px (left/right)</p>
          <p className="text-text-secondary text-sm">✓ border-radius: 1000px (rounded-full)</p>
        </div>
        <div className="mt-4">
          <AuthButton>Measure Me</AuthButton>
        </div>
      </section>
    </div>
  );
}

export default AuthButtonExamples;
