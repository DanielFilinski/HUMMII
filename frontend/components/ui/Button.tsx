import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
      primary:
        'bg-accent-1 text-text-inverse hover:bg-accent-2 focus:ring-accent-1 active:scale-95',
      secondary:
        'bg-background-2 text-text-primary hover:bg-opacity-80 focus:ring-accent-1 active:scale-95',
      outline:
        'border-2 border-accent-1 text-accent-1 hover:bg-accent-1 hover:text-text-inverse focus:ring-accent-1 active:scale-95',
      ghost:
        'text-text-primary hover:bg-background-2 focus:ring-accent-1 active:scale-95',
      danger:
        'bg-feedback-error text-text-inverse hover:bg-opacity-90 focus:ring-feedback-error active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm h-8',
      md: 'px-4 py-2 text-mobile-body md:text-tablet-body-sm lg:text-desktop-body-sm h-10',
      lg: 'px-6 py-3 text-mobile-body md:text-tablet-body lg:text-desktop-body h-12',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
