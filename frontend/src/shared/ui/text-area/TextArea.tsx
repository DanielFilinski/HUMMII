'use client';

import React, { useState, forwardRef, TextareaHTMLAttributes } from 'react';
import { Typography } from '@shared/ui/typography/Typography';

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Состояние ошибки */
  error?: boolean;
  /** Текст ошибки */
  errorText?: string;
  /** Вспомогательный текст */
  helperText?: string;
  /** Лейбл поля */
  label?: string;
  /** Максимальная длина текста */
  maxLength?: number;
  /** Показывать счётчик символов */
  showCounter?: boolean;
  /** Полная ширина */
  fullWidth?: boolean;
  /** Минимальная высота в строках */
  rows?: number;
  /** Автоматическое изменение высоты */
  autoResize?: boolean;
  /** Дополнительный класс */
  className?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      error = false,
      errorText,
      helperText,
      label,
      maxLength = 500,
      showCounter = true,
      fullWidth = false,
      rows = 4,
      autoResize = false,
      disabled = false,
      className = '',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    const currentValue = value !== undefined ? value : internalValue;
    const currentLength =
      typeof currentValue === 'string' ? currentValue.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (maxLength && newValue.length > maxLength) {
        return;
      }

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(e);

      if (autoResize && e.target) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
    };

    const baseClasses = `
      w-full
      px-4 py-3
      bg-surface-sunken
      text-text-primary
      text-base
      rounded-[10px]
      border
      transition-all
      duration-200
      resize-none
      placeholder:text-text-tertiary
      disabled:bg-surface-sunken
      disabled:text-text-disabled
      disabled:cursor-not-allowed
      disabled:border-border-secondary
      focus:outline-none
    `;

    const stateClasses = error
      ? 'border-feedback-error focus:border-feedback-error'
      : isFocused
      ? 'border-border-focus'
      : 'border-border-primary hover:border-border-focus';

    const containerClasses = fullWidth ? 'w-full' : '';

    const isOverLimit = currentLength > maxLength;
    const counterColor = error || isOverLimit ? 'error' : 'tertiary';

    return (
      <div className={`${containerClasses} ${className}`}>
        {label && (
          <label className="block mb-2">
            <Typography variant="bodySm" color="primary" weight="medium">
              {label}
            </Typography>
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled}
            rows={rows}
            value={currentValue}
            onChange={handleChange}
            className={`${baseClasses} ${stateClasses}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            {...props}
          />

          {showCounter && (
            <div className="absolute bottom-3 right-4 pointer-events-none">
              <Typography variant="note" color={counterColor}>
                {currentLength}/{maxLength}
              </Typography>
            </div>
          )}
        </div>

        {errorText && error && (
          <div className="mt-1.5">
            <Typography variant="note" color="error">
              {errorText}
            </Typography>
          </div>
        )}

        {helperText && !error && (
          <div className="mt-1.5">
            <Typography variant="note" color="secondary">
              {helperText}
            </Typography>
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
