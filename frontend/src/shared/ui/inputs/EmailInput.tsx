'use client';

import React, { forwardRef } from 'react';
import { Input, InputProps } from './Input';

export interface EmailInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>((props, ref) => {
  return <Input ref={ref} type="email" leftIcon="email" {...props} />;
});

EmailInput.displayName = 'EmailInput';
