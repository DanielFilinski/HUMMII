import { type AnchorHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { LoadingSpinner } from '@/src/shared/ui/spinner/LoadingSpinner';
import { Typography } from '@/src/shared/ui/typography/Typography';
import Link from 'next/link';

/**
 * LINK BUTTON COMPONENT
 * 
 * Кнопка-ссылка дизайн-системы Hummii. Текстовая кнопка без фона и рамки.
 * 
 * Состояния:
 * 1. Default: text-accent-primary (зелёный)
 * 2. Hover: text-accent-secondary (светло-зелёный) + underline
 * 3. Pressed: text-text-primary (тёмный)
 * 4. Loading: text-text-secondary (серый) + spinner
 * 5. Disabled: text-text-tertiary (светло-серый)
 * 
 * @example
 * ```tsx
 * <LinkButton href="/profile">View Profile</LinkButton>
 * <LinkButton href="/services" isLoading>Loading...</LinkButton>
 * <LinkButton href="/disabled" disabled>Unavailable</LinkButton>
 * <LinkButton onClick={handleClick}>Click Action</LinkButton>
 * ```
 */

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /**
   * URL для навигации (если используется как ссылка)
   */
  href?: string;
  
  /**
   * Состояние загрузки
   * Показывает спиннер и делает кнопку неактивной
   */
  isLoading?: boolean;
  
  /**
   * Отключённое состояние
   */
  disabled?: boolean;
  
  /**
   * Обработчик клика (если используется как кнопка без href)
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  
  /**
   * Внешняя ссылка (откроется в новой вкладке)
   */
  external?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      children,
      href,
      disabled = false,
      isLoading = false,
      external = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const baseClasses = cn(
      // Базовые стили
      'inline-flex items-center justify-center gap-2',
      'transition-all duration-200 ease-in-out',
      'cursor-pointer',
      'no-underline',
      
      // Default состояние - зелёный акцентный цвет
      !isLoading && !disabled && 'text-accent-primary',
      
      // Hover состояние - светло-зелёный (без подчёркивания)
      !isLoading && !disabled && 'hover:text-accent-secondary',
      
      // Active/Pressed состояние - тёмный текст
      !isLoading && !disabled && 'active:text-text-primary',
      
      // Loading состояние - серый цвет
      isLoading && 'text-text-secondary cursor-wait',
      
      // Disabled состояние - светло-серый
      disabled && 'text-text-tertiary cursor-not-allowed pointer-events-none',
      
      className
    );

    const content = (
      <>
        {isLoading && (
          <LoadingSpinner color="inherit" />
        )}
        <Typography 
          
          variant="h3" 
          color="inherit"
          className="whitespace-nowrap"
        >
          {children}
        </Typography>
      </>
    );

    // Если есть href и не отключено - используем Next.js Link
    if (href && !isDisabled) {
      if (external) {
        return (
          <a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClasses}
            onClick={handleClick}
            {...props}
          >
            {content}
          </a>
        );
      }

      return (
        <Link
          ref={ref}
          href={href}
          className={baseClasses}
          onClick={handleClick}
          {...props}
        >
          {content}
        </Link>
      );
    }

    // Иначе обычная ссылка (для кнопок без навигации или disabled)
    return (
      <a
        ref={ref}
        href={href || '#'}
        className={baseClasses}
        onClick={handleClick}
        aria-disabled={isDisabled}
        {...props}
      >
        {content}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';
