import React from 'react';
import { Icon, IconName } from '@shared/ui/icons/Icon';
import { LoadingSpinner } from '@shared/ui/spinner/LoadingSpinner';

export interface IconButtonProps {
  /** Icon name to display */
  iconName: IconName;
  /** Size of the icon button */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

const iconSizes = {
  sm: 20,
  md: 24,
  lg: 28,
};

export const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  size = 'md',
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  ariaLabel,
  type = 'button',
}) => {
  const handleClick = () => {
    if (!disabled && !isLoading && onClick) {
      onClick();
    }
  };

  // Base classes
  const baseClasses = 'rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none';
  
  // State-specific classes
  let stateClasses = '';
  let iconColor: 'primary' | 'inverse' = 'primary';
  
  if (disabled) {
    // Disabled: Accents/Accent Disabled background, Text/Text Inverse icon
    stateClasses = 'bg-accent-disabled cursor-not-allowed';
    iconColor = 'inverse';
  } else if (isLoading) {
    // Loading: BG/Background 1, Text/Text Primary icon (spinner)
    stateClasses = 'bg-background shadow-sm cursor-wait';
  } else {
    // Default, Hover, Pressed: BG/Background 1
    stateClasses = 'bg-background shadow-sm hover:shadow-md active:shadow-sm cursor-pointer';
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel || `${iconName} button`}
      className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner 
          size={iconSizes[size]} 
          color="primary"
        />
      ) : (
        <Icon 
          name={iconName} 
          size={iconSizes[size]} 
          color={disabled ? iconColor : 'accent'}
          className={!disabled ? 'text-accent-primary hover:text-accent-secondary active:text-text-primary transition-colors' : undefined}
        />
      )}
    </button>
  );
};
