import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width constraint
   * @default 'lg'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /**
   * Remove horizontal padding
   * @default false
   */
  noPadding?: boolean;
  
  /**
   * Center the container
   * @default true
   */
  center?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      maxWidth = 'lg',
      noPadding = false,
      center = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const maxWidthClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          maxWidthClasses[maxWidth],
          center && 'mx-auto',
          !noPadding && 'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };
export type { ContainerProps };
