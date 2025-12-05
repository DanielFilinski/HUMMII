'use client';

import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

export interface EmailInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'leftIconColor'> {
  /** Показывать ли иконку email слева (по умолчанию true) */
  showEmailIcon?: boolean;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ showEmailIcon = true, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="email"
        leftIcon={showEmailIcon ? 'email' : undefined}
        leftIconColor="success"
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';
