import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = false,
      options,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-label-base text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-12 w-full appearance-none rounded-lg border-2 px-4 py-2 pr-10 text-body-base text-text-primary transition-all duration-200',
              'focus:border-accent-1 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-opacity-20',
              'disabled:cursor-not-allowed disabled:bg-background-2 disabled:text-text-disabled',
              error
                ? 'border-feedback-error focus:border-feedback-error focus:ring-feedback-error'
                : 'border-text-unfocused',
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="text-body-sm text-feedback-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${selectId}-hint`}
            className="text-body-sm text-text-secondary"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps };
