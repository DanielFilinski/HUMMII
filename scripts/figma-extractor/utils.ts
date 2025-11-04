import { RGBA, Effect, Paint, TypeStyle } from './types';

/**
 * Convert Figma RGBA to CSS color string
 */
export function rgbaToCss(color: RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;

  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Convert Figma RGBA to HEX color string
 */
export function rgbaToHex(color: RGBA): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  
  const hex = [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
  
  if (color.a === 1) {
    return `#${hex}`;
  }
  
  const a = Math.round(color.a * 255);
  return `#${hex}${a.toString(16).padStart(2, '0')}`;
}

/**
 * Extract background color from fills
 */
export function getBackgroundColor(fills: Paint[] | undefined): string | null {
  if (!fills || fills.length === 0) return null;
  
  const solidFill = fills.find(fill => fill.type === 'SOLID' && fill.visible !== false);
  if (solidFill && solidFill.color) {
    return rgbaToCss(solidFill.color);
  }
  
  return null;
}

/**
 * Extract border/stroke color
 */
export function getBorderColor(strokes: Paint[] | undefined): string | null {
  if (!strokes || strokes.length === 0) return null;
  
  const solidStroke = strokes.find(stroke => stroke.type === 'SOLID' && stroke.visible !== false);
  if (solidStroke && solidStroke.color) {
    return rgbaToCss(solidStroke.color);
  }
  
  return null;
}

/**
 * Convert Figma effects to CSS box-shadow
 */
export function effectsToBoxShadow(effects: Effect[] | undefined): string | null {
  if (!effects || effects.length === 0) return null;
  
  const shadows = effects
    .filter(effect => 
      (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') && 
      effect.visible !== false
    )
    .map(effect => {
      const x = effect.offset?.x || 0;
      const y = effect.offset?.y || 0;
      const blur = effect.radius || 0;
      const spread = effect.spread || 0;
      const color = effect.color ? rgbaToCss(effect.color) : 'rgba(0, 0, 0, 0.1)';
      const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
      
      return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    });
  
  return shadows.length > 0 ? shadows.join(', ') : null;
}

/**
 * Extract font CSS properties from TypeStyle
 */
export function typeToCss(style: TypeStyle | undefined): Record<string, string> {
  if (!style) return {};
  
  const css: Record<string, string> = {
    fontFamily: style.fontFamily.includes(' ') ? `"${style.fontFamily}"` : style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: String(style.fontWeight),
    lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : 'normal',
  };
  
  if (style.letterSpacing !== 0) {
    css.letterSpacing = `${style.letterSpacing}px`;
  }
  
  if (style.textAlignHorizontal !== 'LEFT') {
    css.textAlign = style.textAlignHorizontal.toLowerCase();
  }
  
  if (style.italic) {
    css.fontStyle = 'italic';
  }
  
  if (style.textDecoration && style.textDecoration !== 'NONE') {
    css.textDecoration = style.textDecoration.toLowerCase();
  }
  
  if (style.textCase === 'UPPER') {
    css.textTransform = 'uppercase';
  } else if (style.textCase === 'LOWER') {
    css.textTransform = 'lowercase';
  } else if (style.textCase === 'TITLE') {
    css.textTransform = 'capitalize';
  }
  
  return css;
}

/**
 * Convert CSS object to CSS string
 */
export function cssObjectToString(css: Record<string, string>, indent = '  '): string {
  return Object.entries(css)
    .map(([key, value]) => {
      const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      return `${indent}${kebabKey}: ${value};`;
    })
    .join('\n');
}

/**
 * Convert CSS object to Tailwind classes (approximate)
 */
export function cssToTailwind(css: Record<string, string>): string[] {
  const classes: string[] = [];
  
  for (const [key, value] of Object.entries(css)) {
    switch (key) {
      case 'backgroundColor':
        if (value.startsWith('#')) {
          classes.push(`bg-[${value}]`);
        }
        break;
      case 'color':
        if (value.startsWith('#')) {
          classes.push(`text-[${value}]`);
        }
        break;
      case 'fontSize':
        classes.push(`text-[${value}]`);
        break;
      case 'fontWeight':
        const weightMap: Record<string, string> = {
          '100': 'font-thin',
          '200': 'font-extralight',
          '300': 'font-light',
          '400': 'font-normal',
          '500': 'font-medium',
          '600': 'font-semibold',
          '700': 'font-bold',
          '800': 'font-extrabold',
          '900': 'font-black',
        };
        classes.push(weightMap[value] || `font-[${value}]`);
        break;
      case 'borderRadius':
        if (value === '9999px') {
          classes.push('rounded-full');
        } else {
          classes.push(`rounded-[${value}]`);
        }
        break;
      case 'padding':
        classes.push(`p-[${value}]`);
        break;
      case 'display':
        if (value === 'flex') {
          classes.push('flex');
        }
        break;
      case 'flexDirection':
        if (value === 'column') {
          classes.push('flex-col');
        } else if (value === 'row') {
          classes.push('flex-row');
        }
        break;
      case 'justifyContent':
        const justifyMap: Record<string, string> = {
          'flex-start': 'justify-start',
          'center': 'justify-center',
          'flex-end': 'justify-end',
          'space-between': 'justify-between',
          'space-around': 'justify-around',
          'space-evenly': 'justify-evenly',
        };
        if (justifyMap[value]) {
          classes.push(justifyMap[value]);
        }
        break;
      case 'alignItems':
        const alignMap: Record<string, string> = {
          'flex-start': 'items-start',
          'center': 'items-center',
          'flex-end': 'items-end',
          'stretch': 'items-stretch',
        };
        if (alignMap[value]) {
          classes.push(alignMap[value]);
        }
        break;
      default:
        // For other properties, use arbitrary values
        if (value && !key.startsWith('webkit')) {
          const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
          classes.push(`[${kebabKey}:${value}]`);
        }
    }
  }
  
  return classes;
}

/**
 * Format number to fixed decimal places without trailing zeros
 */
export function formatNumber(num: number, decimals = 2): string {
  return Number(num.toFixed(decimals)).toString();
}

