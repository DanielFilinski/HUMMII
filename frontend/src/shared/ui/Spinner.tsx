import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color variant
   * @default 'accent'
   */
  variant?: 'accent' | 'inverse' | 'secondary';
  
  /**
   * Show with text label
   */
  label?: string;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'accent',
      label,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-2',
      lg: 'h-12 w-12 border-3',
      xl: 'h-16 w-16 border-4',
    };

    const variantClasses = {
      accent: 'border-accent-1 border-t-transparent',
      inverse: 'border-text-inverse border-t-transparent',
      secondary: 'border-text-secondary border-t-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex flex-col items-center justify-center gap-3',
          className
        )}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        {label && (
          <span className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-text-secondary">
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
export type { SpinnerProps };
