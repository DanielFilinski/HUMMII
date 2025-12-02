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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Shape of the avatar
   * @default 'circle'
   */
  shape?: 'circle' | 'square';
  
  /**
   * Show online status indicator
   */
  online?: boolean;
  
  /**
   * Show border around avatar
   * @default true
   */
  showBorder?: boolean;
  
  /**
   * Variant for different states (affects border color)
   * @default 'default'
   */
  variant?: 'default' | 'pressed' | 'filled';
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
      showBorder = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    // Размеры аватара и внутреннего изображения Person.png
    const sizeClasses = {
      xs: 'h-9 w-9',  // 36px (24px для Person.png)
      sm: 'h-[60px] w-[60px]',  // 60px (32px для Person.png)
      md: 'h-20 w-20',  // 80px (40px для Person.png)
      lg: 'h-[150px] w-[150px]',  // 150px
      xl: 'h-[180px] w-[180px]',  // 180px (77px для Person.png)
    };

    // Размеры Person.png в зависимости от размера аватара
    const personIconSizes = {
      xs: 'w-6 h-6',  // 24px
      sm: 'w-8 h-8',  // 32px
      md: 'w-10 h-10',  // 40px
      lg: 'w-[60px] h-[60px]',  // примерно 40% от 150px
      xl: 'w-[77px] h-[77px]',  // 77px
    };

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };
    
    const borderClasses = {
      default: 'border-2 border-[#E0E0E0]',
      pressed: 'border-2 border-accent-1',
      filled: 'border-2 border-transparent',
    };

    const statusSizeClasses = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden bg-background-2',
          sizeClasses[size],
          shapeClasses[shape],
          showBorder && borderClasses[variant],
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
              // Fallback to default icon if image fails to load
              e.currentTarget.src = '/images/icons/Person.png';
            }}
          />
        ) : (
          <img
            src="/images/icons/Person.png"
            alt={alt}
            className={cn('object-contain', personIconSizes[size])}
          />
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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
