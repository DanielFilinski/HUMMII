/**
 * Typography Component
 * 
 * Универсальный компонент для типографики с поддержкой адаптивности и дизайн-системы.
 * 
 * ОСОБЕННОСТИ:
 * - Автоматическая адаптация размеров для mobile/tablet/desktop
 * - Семантическая HTML-разметка (h1, h2, h3, p и т.д.)
 * - Интеграция с палитрой цветов дизайн-системы
 * - Поддержка светлой и тёмной темы через CSS-переменные
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * <Typography variant="h1" color="primary">Заголовок</Typography>
 * <Typography variant="body" color="secondary">Текст</Typography>
 * <Typography variant="tag" weight="extrabold" color="accent">Тег</Typography>
 * 
 * АДАПТИВНОСТЬ:
 * Все варианты автоматически масштабируются:
 * - h1: 28px (mobile) → 30px (tablet) → 36px (desktop)
 * - h2: 22px (mobile) → 24px (tablet) → 24px (desktop)
 * - h3: 18px (mobile) → 20px (tablet) → 20px (desktop)
 * - body: 16px (mobile) → 18px (tablet) → 20px (desktop)
 * - bodySm: 14px (mobile) → 16px (tablet) → 16px (desktop)
 * - tag: 14px (mobile) → 16px (tablet) → 16px (desktop)
 * - note: 12px (mobile) → 16px (tablet) → 14px (desktop)
 */

import { type HTMLAttributes, type ElementType, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { typography } from './design-tokens';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  /**
   * HTML-элемент или React-компонент для рендеринга
   * 
   * @default 'p' для body/bodySm/note
   * @default 'h1' для h1
   * @default 'h2' для h2
   * @default 'h3' для h3
   * @default 'span' для tag
   * 
   * @example
   * <Typography as="h1" variant="h1">Заголовок</Typography>
   * <Typography as="div" variant="body">Параграф в div</Typography>
   */
  as?: ElementType;
  
  /**
   * Вариант типографики
   * 
   * - **h1**: Главный заголовок страницы (28-36px, bold)
   * - **h2**: Подзаголовок секции (22-24px, semibold)
   * - **h3**: Подзаголовок блока (18-20px, medium)
   * - **body**: Основной текст (16-20px, regular)
   * - **bodySm**: Мелкий текст (14-16px, regular)
   * - **tag**: Тег/метка (14-16px, extrabold)
   * - **note**: Примечание (12-14px, regular)
   * 
   * @default 'body'
   */
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'tag' | 'note';
  
  /**
   * Цвет текста из палитры дизайн-системы
   * 
   * - **primary**: Основной текст (#2A2A0F в светлой теме)
   * - **secondary**: Второстепенный текст (#819082)
   * - **tertiary**: Неактивный/третичный текст (#96A996)
   * - **inverse**: Инверсный текст (белый на тёмном фоне)
   * - **disabled**: Отключённый текст (#DBDBDB)
   * - **accent**: Акцентный текст (зелёный #3A971E)
   * - **link**: Цвет ссылок (зелёный #3A971E)
   * - **error**: Цвет ошибки (красный #B52F2F)
   * - **success**: Цвет успеха (зелёный #3A971E)
   * - **warning**: Цвет предупреждения (жёлтый #F59E0B)
   * - **info**: Цвет информации (синий #3B82F6)
   * 
   * @default 'primary'
   */
  color?: 
    | 'primary' 
    | 'secondary' 
    | 'tertiary' 
    | 'inverse' 
    | 'disabled' 
    | 'accent' 
    | 'link'
    | 'error' 
    | 'success'
    | 'warning'
    | 'info';
  
  /**
   * Выравнивание текста
   * 
   * @default undefined (left)
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Переопределение веса шрифта
   * 
   * - **light**: 300
   * - **regular**: 400 (по умолчанию для body)
   * - **medium**: 500 (по умолчанию для h3)
   * - **semibold**: 600 (по умолчанию для h2)
   * - **bold**: 700 (по умолчанию для h1)
   * - **extrabold**: 800 (по умолчанию для tag)
   * 
   * @default зависит от variant
   */
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  
  /**
   * Усечение текста с многоточием
   * 
   * - **true**: Одна строка с многоточием
   * - **number**: Количество строк с многоточием
   * 
   * @default false
   * 
   * @example
   * <Typography truncate>Очень длинный текст...</Typography>
   * <Typography truncate={2}>Две строки с многоточием...</Typography>
   */
  truncate?: boolean | number;
  
  /**
   * Градиентный текст (использует фирменный градиент)
   * 
   * @default false
   * 
   * @example
   * <Typography variant="h1" gradient>Заголовок с градиентом</Typography>
   */
  gradient?: boolean;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as,
      variant = 'body',
      color = 'primary',
      align,
      weight,
      truncate = false,
      gradient = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Автоматический выбор HTML-элемента на основе variant
    const defaultElement: Record<string, ElementType> = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      body: 'p',
      bodySm: 'p',
      tag: 'span',
      note: 'p',
    };
    
    const Component = as || defaultElement[variant] || 'p';
    
    // Цветовые классы из дизайн-системы
    const colorClasses = {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary: 'text-text-tertiary',
      inverse: 'text-text-inverse',
      disabled: 'text-text-disabled',
      accent: 'text-accent-primary',
      link: 'text-text-link hover:text-accent-hover transition-colors',
      error: 'text-feedback-error',
      success: 'text-feedback-success',
      warning: 'text-feedback-warning',
      info: 'text-feedback-info',
    };

    // Выравнивание текста
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    // Веса шрифтов
    const weightClasses = {
      light: 'font-light',
      regular: 'font-regular',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    };
    
    // Усечение текста с многоточием
    const truncateClasses = 
      truncate === true 
        ? 'truncate' 
        : typeof truncate === 'number'
        ? `line-clamp-${truncate}`
        : '';
    
    // Градиентный текст
    const gradientClasses = gradient
      ? 'bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent'
      : '';

    return (
      <Component
        ref={ref}
        className={cn(
          // Базовый адаптивный класс из design-tokens
          typography[variant],
          // Цвет текста (только если не градиент)
          !gradient && colorClasses[color],
          // Выравнивание
          align && alignClasses[align],
          // Вес шрифта
          weight && weightClasses[weight],
          // Усечение
          truncateClasses,
          // Градиент
          gradientClasses,
          // Дополнительные классы
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
