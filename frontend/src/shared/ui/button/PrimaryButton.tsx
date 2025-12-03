import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { LoadingSpinner } from '@/src/shared/ui/LoadingSpinner';

/**
 * PRIMARY BUTTON COMPONENT
 * 
 * Основная кнопка дизайн-системы Hummii согласно макету.
 * 
 * Состояния:
 * 1. Default: bg-accent-primary (#3A971E в light mode, #67AD51 в dark mode)
 * 2. Hover: bg-accent-secondary (#67AD51 в light mode, #86C06E в dark mode)
 * 3. Pressed: bg-accent-tertiary (#AAC89A в light mode, #5A8D47 в dark mode)
 * 4. Loading: с индикатором загрузки
 * 5. Disabled: прозрачность 40%
 * 
 * @example
 * ```tsx
 * <PrimaryButton>View all services</PrimaryButton>
 * <PrimaryButton isLoading>Loading...</PrimaryButton>
 * <PrimaryButton disabled>Disabled</PrimaryButton>
 * ```
 */

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      className,
      children,
      disabled,
      isLoading = false,
      fullWidth = false,
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
          'rounded-full px-8 py-3',
          'font-medium text-base leading-6',
          'text-text-inverse',
          'transition-all duration-200 ease-in-out',
          
          // Состояния цвета
          'bg-accent-primary',
          'hover:enabled:bg-accent-secondary',
          'active:enabled:bg-accent-tertiary',
          
          // Состояние disabled
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-primary',
          
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
        {isLoading && <LoadingSpinner className="h-5 w-5 text-text-inverse animate-spin" />}
        {children}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';
