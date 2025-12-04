'use client';

import React, { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Icon } from '@shared/ui/icons/Icon';
import { Typography } from '@shared/ui/typography/Typography';
import type { IconName } from '@shared/ui/icons/Icon';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Состояние ошибки */
  error?: boolean;
  /** Текст ошибки */
  errorText?: string;
  /** Вспомогательный текст */
  helperText?: string;
  /** Лейбл поля */
  label?: string;
  /** Иконка слева */
  leftIcon?: IconName;
  /** Иконка справа */
  rightIcon?: IconName;
  /** Обработчик клика по правой иконке */
  onRightIconClick?: () => void;
  /** Заполненное состояние (стилистически) */
  filled?: boolean;
  /** Полная ширина */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error = false,
      errorText,
      helperText,
      label,
      leftIcon,
      rightIcon,
      onRightIconClick,
      filled = false,
      fullWidth = false,
      disabled = false,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

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
      placeholder:text-text-tertiary
      disabled:bg-surface-sunken
      disabled:text-text-disabled
      disabled:cursor-not-allowed
      disabled:border-border-secondary
    `;

    const stateClasses = error
      ? 'border-feedback-error focus:border-feedback-error'
      : filled
      ? 'border-border-secondary bg-surface-sunken'
      : isFocused
      ? 'border-border-focus'
      : 'border-border-primary hover:border-border-focus';

    const paddingClasses = `
      ${leftIcon ? 'pl-11' : 'pl-4'}
      ${rightIcon ? 'pr-11' : 'pr-4'}
    `;

    const containerClasses = fullWidth ? 'w-full' : '';

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
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                name={leftIcon}
                size="sm"
                color={error ? 'error' : disabled ? 'disabled' : 'secondary'}
              />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`${baseClasses} ${stateClasses} ${paddingClasses} focus:outline-none`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {rightIcon && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
              onClick={onRightIconClick}
            >
              <Icon
                name={rightIcon}
                size="sm"
                color={error ? 'error' : disabled ? 'disabled' : 'secondary'}
              />
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

Input.displayName = 'Input';
