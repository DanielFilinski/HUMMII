'use client';

import React, { useState, forwardRef } from 'react';
import { Input, InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon' | 'onRightIconClick'> {
  /** Показывать ли иконку замка слева */
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
        rightIcon={showPassword ? 'eye' : 'eye-slash'}
        onRightIconClick={togglePasswordVisibility}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
