import { type HTMLAttributes, type ElementType, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { typography } from './design-tokens';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /**
   * The HTML element or React component to render
   * @default 'p'
   */
  as?: ElementType;
  
  /**
   * Typography variant
   */
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'tag' | 'note';
  
  /**
   * Text color
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'unfocused' | 'inverse' | 'disabled' | 'accent' | 'error';
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Font weight override
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as: Component = 'p',
      variant = 'body',
      color = 'primary',
      align,
      weight,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const colorClasses = {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      unfocused: 'text-text-unfocused',
      inverse: 'text-text-inverse',
      disabled: 'text-text-disabled',
      accent: 'text-accent-1',
      error: 'text-feedback-error',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const weightClasses = {
      regular: 'font-regular',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          typography[variant],
          colorClasses[color],
          align && alignClasses[align],
          weight && weightClasses[weight],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

export { Typography };
export type { TypographyProps };
