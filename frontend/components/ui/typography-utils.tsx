/**
 * Typography Utilities
 * 
 * Вспомогательные утилиты для работы с типографикой
 */

import { type VariantProps } from 'class-variance-authority';
import { Typography, type TypographyProps } from './Typography';

/**
 * Получить размер текста для конкретного breakpoint
 */
export const getTypographySize = (
  variant: TypographyProps['variant'],
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): string => {
  const sizes = {
    h1: { mobile: '28px', tablet: '30px', desktop: '36px' },
    h2: { mobile: '22px', tablet: '24px', desktop: '24px' },
    h3: { mobile: '18px', tablet: '20px', desktop: '20px' },
    body: { mobile: '16px', tablet: '18px', desktop: '20px' },
    bodySm: { mobile: '14px', tablet: '16px', desktop: '16px' },
    tag: { mobile: '14px', tablet: '16px', desktop: '16px' },
    note: { mobile: '12px', tablet: '16px', desktop: '14px' },
  };

  return sizes[variant || 'body'][breakpoint];
};

/**
 * Получить стандартный вес шрифта для варианта
 */
export const getDefaultWeight = (variant: TypographyProps['variant']): string => {
  const weights = {
    h1: 'bold',
    h2: 'semibold',
    h3: 'medium',
    body: 'regular',
    bodySm: 'regular',
    tag: 'extrabold',
    note: 'regular',
  };

  return weights[variant || 'body'];
};

/**
 * Компонент-обёртка для заголовков с автоматическими отступами
 */
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" className="mb-6" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" className="mb-4" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" className="mb-3" {...props} />
);

/**
 * Компонент для текста с ограниченной шириной (улучшает читаемость)
 */
export const Prose: React.FC<TypographyProps> = ({ className, ...props }) => (
  <Typography className={`max-w-prose ${className || ''}`} {...props} />
);

/**
 * Компонент для текста-ссылки с hover-эффектом
 */
export const Link: React.FC<Omit<TypographyProps, 'as' | 'color'> & { href: string }> = ({
  href,
  className,
  ...props
}) => (
  <Typography
    as="a"
    href={href}
    color="link"
    className={`cursor-pointer underline-offset-4 hover:underline ${className || ''}`}
    {...props}
  />
);

/**
 * Компонент для метки формы
 */
export const Label: React.FC<
  Omit<TypographyProps, 'variant' | 'as'> & { htmlFor?: string }
> = ({ htmlFor, className, ...props }) => (
  <Typography
    as="label"
    htmlFor={htmlFor}
    variant="bodySm"
    weight="medium"
    className={`block mb-2 ${className || ''}`}
    {...props}
  />
);

/**
 * Компонент для текста ошибки
 */
export const ErrorText: React.FC<Omit<TypographyProps, 'variant' | 'color'>> = ({
  className,
  ...props
}) => (
  <Typography
    variant="note"
    color="error"
    className={`mt-1 ${className || ''}`}
    {...props}
  />
);

/**
 * Компонент для текста-подсказки
 */
export const HelperText: React.FC<Omit<TypographyProps, 'variant' | 'color'>> = ({
  className,
  ...props
}) => (
  <Typography
    variant="note"
    color="tertiary"
    className={`mt-1 ${className || ''}`}
    {...props}
  />
);

/**
 * Компонент для бейджа/тега
 */
export const Badge: React.FC<
  Omit<TypographyProps, 'variant'> & {
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  }
> = ({ variant = 'default', className, children, ...props }) => {
  const variantClasses = {
    default: 'bg-background-secondary text-accent-primary',
    success: 'bg-feedback-success/10 text-feedback-success',
    error: 'bg-feedback-error/10 text-feedback-error',
    warning: 'bg-feedback-warning/10 text-feedback-warning',
    info: 'bg-feedback-info/10 text-feedback-info',
  };

  return (
    <Typography
      variant="tag"
      className={`inline-flex px-3 py-1 rounded-full ${variantClasses[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </Typography>
  );
};

/**
 * Компонент для цены
 */
export const Price: React.FC<Omit<TypographyProps, 'color'> & { currency?: string }> = ({
  currency = '₽',
  children,
  className,
  ...props
}) => (
  <Typography
    color="accent"
    weight="semibold"
    className={`${className || ''}`}
    {...props}
  >
    {children}
    {currency && ` ${currency}`}
  </Typography>
);

/**
 * Компонент для рейтинга
 */
export const Rating: React.FC<
  Omit<TypographyProps, 'variant' | 'color'> & { value: number; max?: number }
> = ({ value, max = 5, className, ...props }) => (
  <Typography
    variant="bodySm"
    color="secondary"
    className={`inline-flex items-center gap-1 ${className || ''}`}
    {...props}
  >
    <span className="text-feedback-warning">★</span>
    {value.toFixed(1)} / {max}
  </Typography>
);

/**
 * Компонент для даты/времени
 */
export const DateTime: React.FC<
  Omit<TypographyProps, 'variant' | 'color' | 'as'> & { date: Date | string }
> = ({ date, className, ...props }) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formatted = dateObj.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Typography
      as="time"
      variant="bodySm"
      color="tertiary"
      dateTime={dateObj.toISOString()}
      className={className}
      {...props}
    >
      {formatted}
    </Typography>
  );
};

/**
 * Компонент для отображения статуса
 */
export const Status: React.FC<
  Omit<TypographyProps, 'variant'> & {
    status: 'online' | 'offline' | 'busy' | 'away';
  }
> = ({ status, className, ...props }) => {
  const statusConfig = {
    online: { color: 'success' as const, label: 'Онлайн', icon: '🟢' },
    offline: { color: 'tertiary' as const, label: 'Оффлайн', icon: '⚫' },
    busy: { color: 'error' as const, label: 'Занят', icon: '🔴' },
    away: { color: 'warning' as const, label: 'Нет на месте', icon: '🟡' },
  };

  const config = statusConfig[status];

  return (
    <Typography
      variant="bodySm"
      color={config.color}
      className={`inline-flex items-center gap-1 ${className || ''}`}
      {...props}
    >
      <span>{config.icon}</span>
      {config.label}
    </Typography>
  );
};

/**
 * Компонент для текста с иконкой
 */
export const IconText: React.FC<
  TypographyProps & {
    icon: React.ReactNode;
    iconPosition?: 'left' | 'right';
  }
> = ({ icon, iconPosition = 'left', children, className, ...props }) => (
  <Typography
    className={`inline-flex items-center gap-2 ${className || ''}`}
    {...props}
  >
    {iconPosition === 'left' && icon}
    {children}
    {iconPosition === 'right' && icon}
  </Typography>
);

/**
 * Компонент для пустого состояния
 */
export const EmptyState: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-4xl">{icon}</div>}
    <Typography variant="h3" color="secondary" className="mb-2">
      {title}
    </Typography>
    {description && (
      <Typography variant="body" color="tertiary" className="max-w-md">
        {description}
      </Typography>
    )}
  </div>
);

/**
 * Компонент для отображения счётчика
 */
export const Counter: React.FC<
  Omit<TypographyProps, 'variant'> & {
    count: number;
    label?: string;
  }
> = ({ count, label, className, ...props }) => (
  <div className={`inline-flex flex-col ${className || ''}`}>
    <Typography variant="h2" {...props}>
      {count.toLocaleString('ru-RU')}
    </Typography>
    {label && (
      <Typography variant="bodySm" color="tertiary">
        {label}
      </Typography>
    )}
  </div>
);

/**
 * Компонент для Breadcrumbs (хлебные крошки)
 */
export const Breadcrumbs: React.FC<{
  items: Array<{ label: string; href?: string }>;
  separator?: React.ReactNode;
}> = ({ items, separator = '/' }) => (
  <nav aria-label="Breadcrumbs" className="flex items-center gap-2">
    {items.map((item, index) => (
      <div key={index} className="flex items-center gap-2">
        {item.href ? (
          <Link href={item.href} variant="bodySm">
            {item.label}
          </Link>
        ) : (
          <Typography variant="bodySm" color="tertiary">
            {item.label}
          </Typography>
        )}
        {index < items.length - 1 && (
          <Typography variant="bodySm" color="tertiary">
            {separator}
          </Typography>
        )}
      </div>
    ))}
  </nav>
);
