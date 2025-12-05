'use client';

import React, { useState, forwardRef } from 'react';
import { Input, InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon' | 'onRightIconClick' | 'leftIconColor' | 'rightIconColor'> {
  /** Показывать ли иконку замка слева (по умолчанию true) */
  showLockIcon?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showLockIcon = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        leftIcon={showLockIcon ? 'password' : undefined}
        leftIconColor="success"
        rightIcon={showPassword ? 'eye' : 'eye-slash'}
        rightIconColor="secondary"
        onRightIconClick={togglePasswordVisibility}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
