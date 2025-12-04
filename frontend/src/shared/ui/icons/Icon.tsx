import React, { useState, useEffect } from 'react';
import { cn } from '@shared/lib/utils';

/**
 * Типы иконок, доступные в проекте
 */
export type IconName =
  | 'person'
  | 'apple'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'bell'
  | 'claim'
  | 'clip'
  | 'clock'
  | 'collapse'
  | 'edit'
  | 'email'
  | 'extend'
  | 'eye-slash'
  | 'eye'
  | 'facebook'
  | 'google'
  | 'icon'
  | 'instagram'
  | 'language'
  | 'loading'
  | 'menu'
  | 'order-done'
  | 'order-reviewed'
  | 'orders'
  | 'password'
  | 'plus'
  | 'report'
  | 'settings'
  | 'star'
  | 'twitter'
  | 'variant31'
  | 'variant32'
  | 'variant35'
  | 'x';

/**
 * Размеры иконок
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Цвета иконок (семантические из дизайн-системы)
 */
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'disabled'
  | 'link'
  | 'accent'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'inherit'
  | 'current';

/**
 * Маппинг имён иконок на файлы
 */
const iconFileMap: Record<IconName, string> = {
  'person': 'Person.svg',
  'apple': 'Property 1=Apple.svg',
  'arrow-down': 'Property 1=Arrow-down.svg',
  'arrow-left': 'Property 1=Arrow-left.svg',
  'arrow-right': 'Property 1=Arrow-right.svg',
  'arrow-up': 'Property 1=Arrow-up.svg',
  'bell': 'Property 1=Bell.svg',
  'claim': 'Property 1=Claim.svg',
  'clip': 'Property 1=Clip.svg',
  'clock': 'Property 1=Clock.svg',
  'collapse': 'Property 1=Collapse.svg',
  'edit': 'Property 1=Edit.svg',
  'email': 'Property 1=Email.svg',
  'extend': 'Property 1=Extend.svg',
  'eye-slash': 'Property 1=Eye Slash.svg',
  'eye': 'Property 1=Eye.svg',
  'facebook': 'Property 1=Facebook.svg',
  'google': 'Property 1=Google.svg',
  'icon': 'Property 1=Icon.svg',
  'instagram': 'Property 1=Instagram.svg',
  'language': 'Property 1=Language.svg',
  'loading': 'Property 1=Loading.svg',
  'menu': 'Property 1=Menu.svg',
  'order-done': 'Property 1=Order Done.svg',
  'order-reviewed': 'Property 1=Order Reviewed.svg',
  'orders': 'Property 1=Orders.svg',
  'password': 'Property 1=Password.svg',
  'plus': 'Property 1=Plus.svg',
  'report': 'Property 1=Report.svg',
  'settings': 'Property 1=Settings.svg',
  'star': 'Property 1=Star.svg',
  'twitter': 'Property 1=Twitter.svg',
  'variant31': 'Property 1=Variant31.svg',
  'variant32': 'Property 1=Variant32.svg',
  'variant35': 'Property 1=Variant35.svg',
  'x': 'Property 1=Х.svg',
};

/**
 * Маппинг размеров на пиксели
 */
const sizeMap: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
};

/**
 * Маппинг цветов на CSS-классы
 */
const colorMap: Record<Exclude<IconColor, 'inherit' | 'current'>, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  disabled: 'text-text-disabled',
  link: 'text-text-link',
  accent: 'text-accent-primary',
  error: 'text-feedback-error',
  success: 'text-feedback-success',
  warning: 'text-feedback-warning',
  info: 'text-feedback-info',
};

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  /**
   * Название иконки
   */
  name: IconName;
  
  /**
   * Размер иконки
   * @default 'md'
   */
  size?: IconSize | number;
  
  /**
   * Цвет иконки (семантический)
   * @default 'primary'
   */
  color?: IconColor;
  
  /**
   * Дополнительные классы
   */
  className?: string;
  
  /**
   * Альтернативный текст для доступности
   */
  alt?: string;
}

/**
 * Универсальный компонент иконки с поддержкой наследования цвета
 * 
 * ВАЖНО: Иконки теперь поддерживают наследование цвета через currentColor!
 * SVG встраивается напрямую и использует fill="currentColor".
 * 
 * @example
 * // Базовое использование
 * <Icon name="bell" />
 * 
 * @example
 * // С кастомным размером и цветом
 * <Icon name="star" size="lg" color="accent" />
 * 
 * @example
 * // С числовым размером
 * <Icon name="menu" size={28} />
 * 
 * @example
 * // Наследование цвета от родителя (для использования в кнопках)
 * <button className="text-white">
 *   <Icon name="google" color="inherit" />
 * </button>
 * 
 * @example
 * // С дополнительными классами и событиями
 * <Icon 
 *   name="close" 
 *   size="sm" 
 *   color="secondary"
 *   className="cursor-pointer hover:opacity-80 transition-opacity"
 *   onClick={handleClose}
 * />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'primary',
  className,
  alt,
  ...props
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  
  // Определяем размер в пикселях
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];
  
  // Определяем CSS-класс для цвета
  const colorClass = color === 'inherit' 
    ? 'text-inherit' 
    : color === 'current'
    ? 'text-current'
    : colorMap[color];
  
  // Получаем путь к файлу иконки
  const iconFile = iconFileMap[name];
  const iconPath = `/images/icons/${iconFile}`;
  
  // Загружаем SVG контент
  useEffect(() => {
    fetch(iconPath)
      .then(res => res.text())
      .then(svg => {
        // Добавляем currentColor к SVG если его там нет
        const svgWithColor = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        setSvgContent(svgWithColor);
      })
      .catch(err => console.error(`Failed to load icon ${name}:`, err));
  }, [iconPath, name]);
  
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0',
        colorClass,
        className
      )}
      style={{
        width: pixelSize,
        height: pixelSize,
      }}
      role="img"
      aria-label={alt || name}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};

Icon.displayName = 'Icon';
