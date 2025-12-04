import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

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
        <div className="flex items-center gap-2.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'h-6 w-6 cursor-pointer appearance-none rounded-[10px] transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2',
              'relative',
              // Unchecked state - white background with green border
              'border-3 border-accent-primary bg-background',
              // Hover state (unchecked)
              'hover:bg-accent-primary/5',
              // Checked state - green background with white checkmark
              'checked:border-accent-primary checked:bg-accent-primary',
              // Checkmark using pseudo-element - white checkmark on green background
              'checked:after:absolute checked:after:left-[4px] checked:after:top-[1px] checked:after:h-[10px] checked:after:w-[6px]',
              'checked:after:rotate-45 checked:after:border-b-[2.5px] checked:after:border-r-[2.5px] checked:after:border-white checked:after:content-[""]',
              // Disabled state
              'disabled:cursor-not-allowed disabled:opacity-50',
              'disabled:border-border-primary disabled:bg-surface-sunken',
              'checked:disabled:bg-accent-disabled checked:disabled:border-accent-disabled',
              error && 'border-feedback-error',
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
            className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-feedback-error ml-8"
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
