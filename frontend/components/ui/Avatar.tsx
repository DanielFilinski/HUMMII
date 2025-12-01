import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Image source URL
   */
  src?: string;
  
  /**
   * Alt text for the image
   */
  alt?: string;
  
  /**
   * Fallback initials if no image
   */
  fallback?: string;
  
  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /**
   * Shape of the avatar
   * @default 'circle'
   */
  shape?: 'circle' | 'square';
  
  /**
   * Show online status indicator
   */
  online?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = 'Avatar',
      fallback,
      size = 'md',
      shape = 'circle',
      online,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-6 w-6 text-[10px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
      '2xl': 'h-24 w-24 text-2xl',
    };

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };

    const statusSizeClasses = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
      '2xl': 'h-5 w-5',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden bg-background-2',
          sizeClasses[size],
          shapeClasses[shape],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="font-semibold text-text-primary">
            {fallback || alt.charAt(0).toUpperCase()}
          </span>
        )}
        
        {online !== undefined && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background-1',
              statusSizeClasses[size],
              online ? 'bg-accent-1' : 'bg-text-disabled'
            )}
            aria-label={online ? 'Online' : 'Offline'}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum avatars to show before "+N"
   * @default 3
   */
  max?: number;
  
  /**
   * Size of avatars in the group
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 3, size = 'md', ...props }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children];
    const visibleAvatars = childrenArray.slice(0, max);
    const remainingCount = Math.max(0, childrenArray.length - max);

    return (
      <div
        ref={ref}
        className={cn('flex items-center -space-x-2', className)}
        {...props}
      >
        {visibleAvatars}
        {remainingCount > 0 && (
          <Avatar
            size={size}
            fallback={`+${remainingCount}`}
            className="border-2 border-background-1"
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
export type { AvatarProps, AvatarGroupProps };
