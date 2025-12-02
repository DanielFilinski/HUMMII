import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '../Spinner';

/**
 * BUTTON COMPONENT - Design System
 * 
 * Компонент кнопки с поддержкой различных вариантов и состояний
 * согласно дизайн-системе.
 * 
 * Варианты:
 * - primary: основная зелёная кнопка
 * - secondary: outlined кнопка с границей
 * - icon: круглая иконка-кнопка
 * - link: текстовая ссылка
 * - logo: круглая кнопка с логотипом
 * 
 * Состояния (автоматические):
 * - default: обычное состояние
 * - hover: при наведении
 * - pressed/active: при нажатии
 * - loading: с анимацией загрузки
 * - disabled: неактивное состояние
 */

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'icon' | 'link' | 'logo';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

interface ButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

interface LinkButtonProps extends BaseButtonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

type ButtonComponentProps = ButtonProps | LinkButtonProps;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonComponentProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Базовые стили для всех кнопок
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed';

    // Варианты кнопок
    const variants = {
      // Primary Button: зелёная кнопка с белым текстом
      primary: cn(
        'bg-accent-primary text-text-inverse rounded-full px-8 py-3 gap-2',
        'hover:bg-accent-secondary',
        'active:bg-accent-tertiary active:text-text-primary',
        'disabled:bg-accent-tertiary disabled:text-text-inverse disabled:opacity-60'
      ),
      
      // Secondary Button: outlined кнопка с зелёной границей
      secondary: cn(
        'bg-background border-2 border-accent-primary text-accent-primary rounded-full px-8 py-3 gap-2',
        'hover:border-accent-secondary hover:text-accent-secondary',
        'active:border-accent-tertiary active:text-text-tertiary',
        'disabled:border-accent-tertiary disabled:text-accent-tertiary disabled:opacity-60'
      ),
      
      // Icon Button: круглая кнопка с иконкой
      icon: cn(
        'bg-background border-2 border-transparent rounded-full w-12 h-12',
        'hover:border-accent-secondary hover:text-accent-secondary',
        'active:bg-surface-pressed',
        'disabled:opacity-60 disabled:cursor-not-allowed'
      ),
      
      // Link Button: текстовая ссылка
      link: cn(
        'text-accent-primary font-normal gap-1',
        'hover:text-accent-secondary',
        'active:text-accent-tertiary',
        'disabled:text-accent-tertiary disabled:opacity-60'
      ),
      
      // Logo Button: круглая кнопка с логотипом
      logo: cn(
        'bg-accent-primary text-text-inverse rounded-full w-16 h-16',
        'hover:bg-accent-secondary',
        'active:bg-accent-tertiary',
        'disabled:bg-accent-tertiary disabled:opacity-60'
      ),
    };

    // Размеры (для primary и secondary)
    const sizes = {
      sm: 'text-mobile-body-sm md:text-tablet-body-sm lg:text-desktop-body-sm px-6 py-2',
      md: 'text-mobile-body md:text-tablet-body lg:text-desktop-body px-8 py-3',
      lg: 'text-mobile-body md:text-tablet-body lg:text-desktop-body px-10 py-4',
    };

    // Spinner для состояния загрузки
    const renderSpinner = () => {
      if (!isLoading) return null;
      
      const spinnerColor = variant === 'primary' || variant === 'logo' 
        ? 'text-text-inverse' 
        : 'text-accent-primary';
      
      return <Spinner className={cn('w-5 h-5', spinnerColor)} />;
    };

    // Рендер содержимого кнопки
    const renderContent = () => {
      if (isLoading && (variant === 'primary' || variant === 'secondary')) {
        return (
          <>
            {renderSpinner()}
            {children}
          </>
        );
      }

      if (isLoading && (variant === 'icon' || variant === 'logo')) {
        return renderSpinner();
      }

      if (icon && children) {
        return iconPosition === 'left' ? (
          <>
            {icon}
            {children}
          </>
        ) : (
          <>
            {children}
            {icon}
          </>
        );
      }

      if (icon) {
        return icon;
      }

      return children;
    };

    // Применяем размеры только для primary и secondary
    const sizeClass = (variant === 'primary' || variant === 'secondary') ? sizes[size] : '';

    const buttonClasses = cn(
      baseStyles,
      variants[variant],
      sizeClass,
      fullWidth && 'w-full',
      className
    );

    // Если передан href, рендерим как ссылку
    if ('href' in props && props.href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={buttonClasses}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {renderContent()}
        </a>
      );
    }

    // Иначе рендерим как кнопку
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, LinkButtonProps, ButtonComponentProps };
