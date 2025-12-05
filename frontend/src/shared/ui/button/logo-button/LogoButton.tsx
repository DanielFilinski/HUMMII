import React from 'react';
import { LoadingSpinner } from '@shared/ui/spinner/LoadingSpinner';
import Image from 'next/image';
import { Icon } from '../../icons';

export interface LogoButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const LogoButton: React.FC<LogoButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  ariaLabel = 'Logo button',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      className={`
        relative inline-flex items-center justify-center
        w-[90px] h-[60px]
        rounded-full
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
        group
        ${
          disabled
            ? 'bg-accent-disabled cursor-not-allowed'
            : isLoading
            ? 'bg-background-secondary cursor-wait'
            : 'bg-accent-primary hover:bg-accent-disabled active:bg-background-secondary'
        }
        ${className}
      `}
    >
      {isLoading ? (
        <LoadingSpinner size={24} color="primary" speed="normal" />
      ) : (
        <div
          className={`
            relative w-6 h-6 transition-all duration-200
            flex items-center justify-center
            ${disabled || (!disabled && !isLoading) ? '[&>img]:brightness-0 [&>img]:invert' : ''}
            ${!disabled && !isLoading ? 'group-active:[&>img]:brightness-100 group-active:[&>img]:invert-0' : ''}
          `}
        >
          <Image
            src="/images/logo/Logo.svg"
            alt="Hummii logo"
            width={24}
            height={24}
            className="transition-all duration-200"
          />
        </div>
      )}
    </button>
  );
};
