import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, disabled, id, ...props }, ref) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={cn(
              'h-5 w-5 cursor-pointer appearance-none rounded-full border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-opacity-20 focus:ring-offset-2',
              'checked:border-accent-1 checked:bg-accent-1',
              'disabled:cursor-not-allowed disabled:bg-background-2 disabled:border-text-unfocused',
              error
                ? 'border-feedback-error'
                : 'border-text-unfocused hover:border-accent-2',
              'relative',
              'checked:after:absolute checked:after:inset-[4px] checked:after:rounded-full checked:after:bg-white checked:after:content-[""]',
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${radioId}-error` : undefined}
            {...props}
          />
          {label && (
            <label
              htmlFor={radioId}
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
            id={`${radioId}-error`}
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

Radio.displayName = 'Radio';

export { Radio };
export type { RadioProps };
