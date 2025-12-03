import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { LoadingSpinner } from '@/src/shared/ui/spinner/LoadingSpinner';

/**
 * SECONDARY BUTTON COMPONENT
 * 
 * Вторичная кнопка дизайн-системы Hummii согласно макету.
 * 
 * Состояния:
 * 1. Default: bg-background (белый/темный), border-accent-primary (зеленая обводка), text-accent-primary (зеленый текст)
 * 2. Hover: bg-accent-secondary (зеленый фон), text-text-inverse (белый текст)
 * 3. Pressed: bg-accent-tertiary (темно-зеленый фон), text-text-primary (темный текст)
 * 4. Loading: с индикатором загрузки
 * 5. Disabled: прозрачность 40%
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
          'inline-flex items-center justify-center gap-2',
          'rounded-full px-8 py-3',
          'transition-all duration-200 ease-in-out',
          
          // Состояния цвета и обводки
          'bg-background border-2 border-accent-primary',
          'text-accent-primary',
          
          // Hover состояние
          'hover:enabled:bg-accent-secondary hover:enabled:text-text-inverse hover:enabled:border-accent-secondary',
          
          // Active/Pressed состояние
          'active:enabled:bg-accent-tertiary active:enabled:text-text-primary active:enabled:border-accent-tertiary',
          
          // Состояние disabled
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background',
          
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
        {isLoading && <LoadingSpinner className="h-5 w-5 text-current animate-spin" />}
        {children}
      </button>
    );
  }
);

SecondaryButton.displayName = 'SecondaryButton';
