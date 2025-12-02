import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, error, disabled, id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <label
            htmlFor={toggleId}
            className={cn(
              'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
          >
            <input
              ref={ref}
              type="checkbox"
              id={toggleId}
              className={cn(
                'peer sr-only',
                'focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-opacity-20 focus:ring-offset-2'
              )}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${toggleId}-error` : undefined}
              {...props}
            />
            <span
              className={cn(
                'block h-6 w-11 rounded-full transition-colors duration-200',
                error
                  ? 'bg-feedback-error peer-checked:bg-feedback-error'
                  : 'bg-text-unfocused peer-checked:bg-accent-1',
                disabled && 'bg-background-2 peer-checked:bg-accent-disabled'
              )}
            />
            <span
              className={cn(
                'absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-transform duration-200',
                'peer-checked:translate-x-5',
                'shadow-md'
              )}
            />
          </label>
          {label && (
            <span
              className={cn(
                'text-mobile-body md:text-tablet-body lg:text-desktop-body select-none',
                disabled ? 'text-text-disabled' : 'text-text-primary'
              )}
            >
              {label}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${toggleId}-error`}
            className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-feedback-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
export type { ToggleProps };
