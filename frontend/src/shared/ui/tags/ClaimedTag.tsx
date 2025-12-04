import { forwardRef } from 'react';
import { Tag, type TagSize } from './Tag';
import type { HTMLAttributes } from 'react';

interface ClaimedTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Размер тега
   * @default 'md'
   */
  size?: TagSize;

  /**
   * Текст тега
   * @default 'Claimed'
   */
  label?: string;
}

/**
 * CLAIMED TAG COMPONENT
 *
 * Специализированный тег для статуса "Claimed" (Задача взята в работу).
 * Синий цвет с иконкой руки.
 *
 * @example
 * // С дефолтным текстом
 * <ClaimedTag />
 *
 * @example
 * // С кастомным текстом
 * <ClaimedTag label="В работе" />
 *
 * @example
 * // Разные размеры
 * <ClaimedTag size="sm" />
 * <ClaimedTag size="lg" label="Taken" />
 */
export const ClaimedTag = forwardRef<HTMLSpanElement, ClaimedTagProps>(
  ({ size = 'md', label = 'Claimed', ...props }, ref) => {
    return (
      <Tag ref={ref} variant="claimed" size={size} {...props}>
        {label}
      </Tag>
    );
  }
);

ClaimedTag.displayName = 'ClaimedTag';
