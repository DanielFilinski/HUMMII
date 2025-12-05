'use client';

import React, { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Icon } from '@shared/ui/icons/Icon';
import { Typography } from '@shared/ui/typography/Typography';
import type { IconName } from '@shared/ui/icons/Icon';
import { cn } from '@shared/lib/utils';

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
  /** Цвет иконки слева */
  leftIconColor?: 'primary' | 'secondary' | 'success' | 'error' | 'disabled';
  /** Цвет иконки справа */
  rightIconColor?: 'primary' | 'secondary' | 'success' | 'error' | 'disabled';
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
      leftIconColor,
      rightIconColor,
      className = '',
      type = 'text',
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Определяем, заполнено ли поле
    const hasValue = value !== undefined && value !== '';
    const isFilledState = filled || hasValue;

    const baseClasses = cn(
      'w-full',
      'px-4 py-3',
      'bg-white',
      'text-text-primary',
      'text-base',
      'leading-6',
      'rounded-full',
      'border-2',
      'transition-all',
      'duration-200',
      'placeholder:text-text-tertiary',
      'focus:outline-none'
    );

    const stateClasses = cn({
      // Error state - красная рамка
      'border-feedback-error focus:border-feedback-error': error,

      // Focused state - зеленая рамка
      'border-accent-primary': !error && isFocused,

      // Default state - серая рамка
      'border-border-primary': !error && !isFocused,

      // Hover effect для default и filled состояний
      'hover:border-border-focus': !error && !isFocused && !disabled,

      // Disabled state
      'disabled:bg-surface-sunken': disabled,
      'disabled:text-text-disabled': disabled,
      'disabled:cursor-not-allowed': disabled,
      'disabled:border-border-secondary': disabled,
      'disabled:opacity-50': disabled,
    });

    const paddingClasses = cn({
      'pl-11': leftIcon,
      'pl-4': !leftIcon,
      'pr-11': rightIcon,
      'pr-4': !rightIcon,
    });

    const containerClasses = cn({
      'w-full': fullWidth,
    }, className);

    // Определяем цвет левой иконки
    const getLeftIconColor = () => {
      if (leftIconColor) return leftIconColor;
      if (error) return 'error';
      if (disabled) return 'disabled';
      return 'success'; // По дизайну зеленая по умолчанию
    };

    // Определяем цвет правой иконки
    const getRightIconColor = () => {
      if (rightIconColor) return rightIconColor;
      if (error) return 'error';
      if (disabled) return 'disabled';
      return 'secondary';
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block mb-2">
            <Typography variant="bodySm" color="primary" weight="medium">
              {label}
            </Typography>
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Icon
                name={leftIcon}
                size="sm"
                color={getLeftIconColor()}
              />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            value={value}
            className={cn(baseClasses, stateClasses, paddingClasses)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 z-10',
                onRightIconClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : 'pointer-events-none'
              )}
              onClick={onRightIconClick}
              role={onRightIconClick ? 'button' : undefined}
              tabIndex={onRightIconClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onRightIconClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRightIconClick();
                }
              }}
            >
              <Icon
                name={rightIcon}
                size="sm"
                color={getRightIconColor()}
              />
            </div>
          )}
        </div>

        {errorText && error && (
          <div className="mt-1.5 ml-4">
            <Typography variant="note" color="error">
              {errorText}
            </Typography>
          </div>
        )}

        {helperText && !error && (
          <div className="mt-1.5 ml-4">
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
