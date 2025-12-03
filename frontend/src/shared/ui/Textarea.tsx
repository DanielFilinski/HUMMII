import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = false,
      showCharCount = false,
      maxLength,
      disabled,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-label-base text-text-primary"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          className={cn(
            'min-h-[120px] w-full rounded-lg border-2 px-4 py-3 text-body-base text-text-primary transition-all duration-200 resize-y',
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
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          value={value}
          {...props}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-body-sm text-feedback-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {hint && !error && (
              <p
                id={`${textareaId}-hint`}
                className="text-body-sm text-text-secondary"
              >
                {hint}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-body-sm text-text-secondary',
                currentLength > maxLength * 0.9 && 'text-feedback-attention',
                currentLength === maxLength && 'text-feedback-error'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
