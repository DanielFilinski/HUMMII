import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-12 w-full rounded-lg border-2 px-4 py-2 text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-text-primary transition-all duration-200',
              'placeholder:text-text-unfocused',
              'focus:border-accent-1 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-opacity-20',
              'disabled:cursor-not-allowed disabled:bg-background-2 disabled:text-text-disabled',
              error
                ? 'border-feedback-error focus:border-feedback-error focus:ring-feedback-error'
                : 'border-text-unfocused',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-mobile-note md:text-tablet-note lg:text-desktop-note text-feedback-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-mobile-note md:text-tablet-note lg:text-desktop-note text-text-secondary"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
