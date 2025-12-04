import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/src/shared/lib/utils';
import { Icon, type IconName } from '@/src/shared/ui/icons/Icon';

/**
 * TAG VARIANTS
 *
 * Варианты тегов для отображения статусов задач:
 * - claimed: Синий, задача взята в работу (Claimed)
 * - done: Зелёный, задача выполнена (Done)
 * - reviewed: Тёмно-зелёный, задача проверена (Reviewed)
 */
export type TagVariant = 'claimed' | 'done' | 'reviewed';

/**
 * TAG SIZES
 *
 * Размеры тегов:
 * - sm: Маленький (padding: 4px 8px, текст: 12px, иконка: 16px)
 * - md: Средний (padding: 6px 12px, текст: 14px, иконка: 20px) - default
 * - lg: Большой (padding: 8px 16px, текст: 16px, иконка: 24px)
 */
export type TagSize = 'sm' | 'md' | 'lg';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Вариант тега (определяет цвет и иконку)
   * @default 'claimed'
   */
  variant?: TagVariant;

  /**
   * Размер тега
   * @default 'md'
   */
  size?: TagSize;

  /**
   * Кастомная иконка (переопределяет иконку по умолчанию для варианта)
   */
  icon?: IconName;

  /**
   * Текст тега
   */
  children: React.ReactNode;
}

/**
 * Маппинг вариантов на стили
 */
const variantStyles: Record<TagVariant, {
  bg: string;
  text: string;
  icon: IconName;
}> = {
  claimed: {
    bg: 'bg-[#4A90E2]', // Синий цвет из дизайна
    text: 'text-white',
    icon: 'claim',
  },
  done: {
    bg: 'bg-[#7ED321]', // Зелёный цвет из дизайна
    text: 'text-white',
    icon: 'order-done',
  },
  reviewed: {
    bg: 'bg-[#5FB547]', // Тёмно-зелёный цвет из дизайна
    text: 'text-white',
    icon: 'order-reviewed',
  },
};

/**
 * Маппинг размеров на стили
 */
const sizeStyles: Record<TagSize, {
  padding: string;
  fontSize: string;
  iconSize: 'xs' | 'sm' | 'md';
  gap: string;
}> = {
  sm: {
    padding: 'px-2 py-1',
    fontSize: 'text-xs',
    iconSize: 'xs',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    iconSize: 'sm',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
    iconSize: 'md',
    gap: 'gap-2',
  },
};

/**
 * TAG COMPONENT
 *
 * Компонент для отображения статусов задач в виде цветных тегов с иконками.
 * Основан на дизайне из макета "Tag task state.jpg".
 *
 * Особенности:
 * - 3 предустановленных варианта: claimed, done, reviewed
 * - Каждый вариант имеет свой цвет и иконку
 * - Поддержка 3 размеров: sm, md, lg
 * - Скруглённые углы (rounded-full)
 * - Белый текст на цветном фоне
 *
 * @example
 * // Базовое использование
 * <Tag variant="claimed">Claimed</Tag>
 *
 * @example
 * // Разные размеры
 * <Tag variant="done" size="sm">Done</Tag>
 * <Tag variant="reviewed" size="lg">Reviewed</Tag>
 *
 * @example
 * // Кастомная иконка
 * <Tag variant="claimed" icon="star">Custom Icon</Tag>
 *
 * @example
 * // С дополнительными классами
 * <Tag variant="done" className="ml-2">Done</Tag>
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      variant = 'claimed',
      size = 'md',
      icon,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    const iconName = icon || variantStyle.icon;

    return (
      <span
        ref={ref}
        className={cn(
          // Базовые стили
          'inline-flex items-center justify-center',
          'rounded-full',
          'font-medium',
          'transition-all duration-200',

          // Цвета по варианту
          variantStyle.bg,
          variantStyle.text,

          // Размеры
          sizeStyle.padding,
          sizeStyle.fontSize,
          sizeStyle.gap,

          // Кастомные стили
          className
        )}
        {...props}
      >
        <Icon
          name={iconName}
          size={sizeStyle.iconSize}
          color="inherit"
          className="flex-shrink-0"
        />
        <span className="whitespace-nowrap">{children}</span>
      </span>
    );
  }
);

Tag.displayName = 'Tag';
