import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

/**
 * AUTH BUTTON COMPONENT (Sign In / Sign Up)
 * 
 * Кнопка для аутентификации (вход/регистрация) согласно дизайн-системе Hummii.
 * 
 * Размеры из дизайн-токенов:
 * - width: 200px (min-width для адаптивности)
 * - height: 48px (h-12 в Tailwind)
 * - padding: 15px 20px (py-[15px] px-5)
 * - border-radius: 1000px (rounded-full)
 * 
 * Состояния:
 * 1. Default: bg-accent-primary
 * 2. Hover: bg-accent-hover
 * 3. Active/Pressed: bg-accent-active
 * 4. Loading: с индикатором загрузки
 * 5. Disabled: прозрачность 40%
 * 
 * @example
 * ```tsx
 * <AuthButton>Sign In</AuthButton>
 * <AuthButton variant="secondary">Sign Up</AuthButton>
 * <AuthButton isLoading>Signing in...</AuthButton>
 * ```
 */

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Вариант кнопки
   * - primary: Зеленая кнопка (для Sign In)
   * - secondary: Прозрачная с обводкой (для Sign Up)
   */
  variant?: 'primary' | 'secondary';
  
  /**
   * Состояние загрузки
   * Показывает спиннер и делает кнопку неактивной
   */
  isLoading?: boolean;
  
  /**
   * Растянуть на всю ширину родителя
   */
  fullWidth?: boolean;
}

/**
 * Компонент индикатора загрузки (спиннер)
 */
const LoadingSpinner = ({ variant }: { variant: 'primary' | 'secondary' }) => (
  <svg
    className={cn(
      'animate-spin h-5 w-5',
      variant === 'primary' ? 'text-text-inverse' : 'text-accent-primary'
    )}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      className,
      children,
      disabled,
      isLoading = false,
      fullWidth = false,
      variant = 'primary',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Базовые стили
          'inline-flex items-center justify-center gap-2',
          
          // Размеры из дизайн-требований
          'min-w-[200px] h-12',
          'py-[15px] px-5',
          'rounded-full', // border-radius: 1000px
          
          // Типографика
          'font-medium text-base leading-6',
          
          // Анимации
          'transition-all duration-200 ease-in-out',
          
          // Варианты стилей
          variant === 'primary' && [
            // Primary (Sign In)
            'bg-accent-primary',
            'text-text-inverse',
            'hover:bg-accent-hover',
            'active:bg-accent-active',
          ],
          variant === 'secondary' && [
            // Secondary (Sign Up)
            'bg-transparent',
            'text-accent-primary',
            'border-2 border-accent-primary',
            'hover:bg-accent-primary/10',
            'active:bg-accent-primary/20',
          ],
          
          // Состояние disabled
          'disabled:opacity-40 disabled:cursor-not-allowed',
          
          // Focus состояние (accessibility)
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          
          // Full width
          fullWidth && 'w-full',
          
          // Кастомные стили
          className
        )}
        {...props}
      >
        {isLoading && <LoadingSpinner variant={variant} />}
        {children}
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';
