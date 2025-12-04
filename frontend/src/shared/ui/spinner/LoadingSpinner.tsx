/**
 * LOADING SPINNER COMPONENT
 * 
 * Индикатор загрузки (спиннер) для использования в кнопках и других компонентах.
 * Использует Icon компонент с именем "loading".
 * 
 * @example
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size={32} />
 * <LoadingSpinner color="accent" />
 * ```
 */

import { Icon } from '@shared/ui/icons/Icon';
import type { IconProps } from '@shared/ui/icons/Icon';

interface LoadingSpinnerProps {
  /**
   * Размер спиннера в пикселях
   * @default 24
   */
  size?: number;
  /**
   * Цвет спиннера (семантический)
   * @default "inverse"
   */
  color?: IconProps['color'];
  /**
   * Скорость вращения
   * - slow: 2 секунды на оборот
   * - normal: 1 секунда на оборот (по умолчанию)
   * - fast: 0.5 секунды на оборот
   * @default "normal"
   */
  speed?: 'slow' | 'normal' | 'fast';
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

const speedClasses = {
  slow: '[animation-duration:2s]',
  normal: '',
  fast: '[animation-duration:0.5s]',
};

export const LoadingSpinner = ({ 
  size = 30, 
  color = 'inverse',
  speed = 'normal',
  className = '' 
}: LoadingSpinnerProps) => (
  <Icon 
    name="loading" 
    size={size} 
    color={color}
    className={`animate-spin ${speedClasses[speed]} ${className}`}
  />
);
