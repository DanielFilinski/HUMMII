import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { LoadingSpinner } from '@/src/shared/ui/spinner/LoadingSpinner';

/**
 * SECONDARY BUTTON COMPONENT
 * 
 * Вторичная кнопка дизайн-системы Hummii согласно макету.
 * 
 * Состояния:
 * 1. Default: bg-transparent, border-accent-primary, text-accent-primary
 * 2. Hover: bg-transparent, border-accent-primary, text-accent-secondary
 * 3. Pressed: bg-transparent, border-accent-primary, text-text-primary
 * 4. Loading: bg-transparent, border-accent-primary, text-text-primary
 * 5. Disabled: bg-transparent, border-text-disabled, text-text-disabled
 * 
 * @example
 * ```tsx
 * <SecondaryButton>Cancel</SecondaryButton>
 * <SecondaryButton isLoading>Loading...</SecondaryButton>
 * <SecondaryButton disabled>Disabled</SecondaryButton>
 * ```
 */

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
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
          'relative inline-flex items-center justify-center gap-2',
          'rounded-full px-8 py-3',
          'transition-all duration-200 ease-in-out',
          
          // Фон всегда прозрачный
          'bg-transparent',
          
          // Default состояние
          'border border-accent-primary text-accent-primary',
          
          // Hover состояние
          'hover:enabled:text-accent-secondary',
          
          // Active/Pressed состояние
          'active:enabled:text-text-primary',
          
          // Loading состояние - текст меняется на text-primary, border остаётся accent-primary
          isLoading && '!text-text-primary !border-accent-primary',
          
          // Disabled состояние
          'disabled:border-text-disabled disabled:text-text-disabled disabled:cursor-not-allowed',
          
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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className="h-5 w-5 text-current animate-spin" />
          </div>
        )}
        <span className={cn('inline-flex items-center justify-center gap-2', isLoading && 'invisible')}>
          {children}
        </span>
      </button>
    );
  }
);

SecondaryButton.displayName = 'SecondaryButton';
