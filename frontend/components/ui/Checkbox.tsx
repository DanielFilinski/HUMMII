import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, disabled, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-5 w-5 cursor-pointer appearance-none rounded border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-opacity-20 focus:ring-offset-2',
              'checked:border-accent-1 checked:bg-accent-1',
              'disabled:cursor-not-allowed disabled:bg-background-2 disabled:border-text-unfocused',
              'relative',
              // Checkmark using pseudo-element
              'checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:h-[10px] checked:after:w-[6px]',
              'checked:after:rotate-45 checked:after:border-b-2 checked:after:border-r-2 checked:after:border-white checked:after:content-[""]',
              error
                ? 'border-feedback-error'
                : 'border-text-unfocused hover:border-accent-2',
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-mobile-body md:text-tablet-body lg:text-desktop-body cursor-pointer select-none',
                disabled ? 'text-text-disabled' : 'text-text-primary'
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-feedback-error ml-7"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
