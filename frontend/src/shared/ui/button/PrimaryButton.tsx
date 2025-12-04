import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { LoadingSpinner } from '@/src/shared/ui/spinner/LoadingSpinner';
import { Typography } from '@/src/shared/ui/typography/Typography';

/**
 * PRIMARY BUTTON COMPONENT
 * 
 * Основная кнопка дизайн-системы Hummii согласно макету.
 * 
 * Состояния:
 * 1. Default: bg-accent-primary (Accents/Accent 1), текст text-inverse
 * 2. Hover: bg-accent-secondary (Accents/Accent 2), текст text-inverse
 * 3. Pressed: bg-background-secondary (BG/Background 2), текст text-primary
 * 4. Loading: bg-background-secondary (BG/Background 2), текст text-primary
 * 5. Disabled: bg-accent-disabled (Accents/Accent Disabled), текст text-inverse
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
          'relative inline-flex items-center justify-center gap-2',
          'rounded-full px-8 py-3',
          'transition-all duration-200 ease-in-out',
          
          // Состояния цвета фона
          !isLoading && 'bg-accent-primary',
          !isLoading && 'hover:enabled:bg-accent-secondary',
          !isLoading && 'active:enabled:bg-background-secondary',
          
          // Состояние disabled
          'disabled:bg-accent-disabled disabled:cursor-not-allowed',
          
          // Состояние loading - приоритет над другими
          isLoading && '!bg-background-secondary',
          
          
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
            <LoadingSpinner className="h-5 w-5 text-text-primary animate-spin" />
          </div>
        )}
        <Typography
          variant="h3"
          className={cn(
            // Default, Hover, Disabled: белый текст
            'text-text-inverse',
            
            // Pressed: чёрный текст
            'active:text-text-primary',
            
            // Loading: невидимый текст
            isLoading && 'invisible',
          )}
        >
          {children}
        </Typography>
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';
