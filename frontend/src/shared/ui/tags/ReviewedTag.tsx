import { forwardRef } from 'react';
import { Tag, type TagSize } from './Tag';
import type { HTMLAttributes } from 'react';

interface ReviewedTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Размер тега
   * @default 'md'
   */
  size?: TagSize;

  /**
   * Текст тега
   * @default 'Reviewed'
   */
  label?: string;
}

/**
 * REVIEWED TAG COMPONENT
 *
 * Специализированный тег для статуса "Reviewed" (Задача проверена).
 * Тёмно-зелёный цвет с иконкой звёздочки.
 *
 * @example
 * // С дефолтным текстом
 * <ReviewedTag />
 *
 * @example
 * // С кастомным текстом
 * <ReviewedTag label="Проверено" />
 *
 * @example
 * // Разные размеры
 * <ReviewedTag size="sm" />
 * <ReviewedTag size="lg" label="Verified" />
 */
export const ReviewedTag = forwardRef<HTMLSpanElement, ReviewedTagProps>(
  ({ size = 'md', label = 'Reviewed', ...props }, ref) => {
    return (
      <Tag ref={ref} variant="reviewed" size={size} {...props}>
        {label}
      </Tag>
    );
  }
);

ReviewedTag.displayName = 'ReviewedTag';
