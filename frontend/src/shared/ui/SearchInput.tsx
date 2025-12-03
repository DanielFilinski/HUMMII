import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = false,
      disabled,
      id,
      value,
      onClear,
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
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            ref={ref}
            id={inputId}
            type="search"
            className={cn(
              'h-12 w-full rounded-lg border-2 pl-10 pr-10 text-mobile-body md:text-tablet-body-sm lg:text-desktop-body-sm text-text-primary transition-all duration-200',
              'placeholder:text-text-unfocused',
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
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            value={value}
            {...props}
          />

          {/* Clear Button */}
          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Очистить поиск"
            >
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-feedback-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm text-text-secondary"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
export type { SearchInputProps };
