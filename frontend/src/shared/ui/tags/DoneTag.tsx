import { forwardRef } from 'react';
import { Tag, type TagSize } from './Tag';
import type { HTMLAttributes } from 'react';

interface DoneTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Размер тега
   * @default 'md'
   */
  size?: TagSize;

  /**
   * Текст тега
   * @default 'Done'
   */
  label?: string;
}

/**
 * DONE TAG COMPONENT
 *
 * Специализированный тег для статуса "Done" (Задача выполнена).
 * Зелёный цвет с иконкой галочки.
 *
 * @example
 * // С дефолтным текстом
 * <DoneTag />
 *
 * @example
 * // С кастомным текстом
 * <DoneTag label="Выполнено" />
 *
 * @example
 * // Разные размеры
 * <DoneTag size="sm" />
 * <DoneTag size="lg" label="Completed" />
 */
export const DoneTag = forwardRef<HTMLSpanElement, DoneTagProps>(
  ({ size = 'md', label = 'Done', ...props }, ref) => {
    return (
      <Tag ref={ref} variant="done" size={size} {...props}>
        {label}
      </Tag>
    );
  }
);

DoneTag.displayName = 'DoneTag';
