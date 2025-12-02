import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-1 rounded-full font-extrabold transition-colors';

    const variants = {
      success: 'bg-accent-1 bg-opacity-10 text-accent-1',
      warning: 'bg-feedback-attention bg-opacity-10 text-feedback-attention',
      error: 'bg-feedback-error bg-opacity-10 text-feedback-error',
      info: 'bg-accent-2 bg-opacity-10 text-accent-2',
      neutral: 'bg-text-secondary bg-opacity-10 text-text-secondary',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-mobile-note md:text-tablet-note lg:text-desktop-note',
      md: 'px-2.5 py-1 text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm',
      lg: 'px-3 py-1.5 text-mobile-tag md:text-tablet-tag lg:text-desktop-tag',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
