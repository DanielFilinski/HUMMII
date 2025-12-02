# 🎨 Архитектура дизайн-токенов

## ✅ Устранение дублирования данных

Все дизайн-токены теперь хранятся в **едином источнике истины**: `/lib/design-tokens.ts`

### 📁 Структура файлов

```
frontend/
├── lib/
│   └── design-tokens.ts          # ✅ ЕДИНСТВЕННЫЙ источник истины
├── tailwind.config.ts             # ✅ Только импорты из design-tokens.ts
└── app/
    └── globals.css                # ✅ CSS-переменные (используют значения из tokens)
```

## 🔄 Как это работает

### 1. **design-tokens.ts** - Единственный источник истины

Все токены определены здесь:

```typescript
// ✅ Цвета
export const lightPalette = { ... }
export const darkPalette = { ... }

// ✅ Типографика
export const baseFontSizes = { xs, sm, base, lg, ... }
export const fontSizes = { desktop, tablet, mobile }
export const fontWeights = { thin, light, regular, ... }

// ✅ Spacing
export const spacing = { xs, sm, md, lg, ... }
export const responsiveSpacing = { 18, 22, 88, ... }

// ✅ Layout
export const borderRadius = { none, sm, default, md, ... }
export const gridSystem = { columns, gutter, containerMaxWidth }

// ✅ Эффекты
export const extendedShadows = { sm, default, md, lg, ... }
export const animations = { fadeIn, slideIn, ... }
export const transitions = { fast, default, slow }

// ✅ И многое другое...
export const iconSizes = { ... }
export const opacities = { ... }
export const zIndex = { ... }
```

### 2. **tailwind.config.ts** - Только импорты

```typescript
import { 
  baseFontSizes,
  fontSizes,
  borderRadius,
  gridSystem,
  // ... все остальные токены
} from './lib/design-tokens';

const config: Config = {
  theme: {
    extend: {
      // ✅ Использование импортированных токенов
      fontSize: baseFontSizes,
      borderRadius: borderRadius,
      maxWidth: gridSystem.containerMaxWidth,
      // ❌ НЕТ hardcoded значений!
    }
  }
};
```

### 3. **globals.css** - CSS-переменные

```css
:root {
  /* ✅ Значения синхронизированы с design-tokens.ts */
  --color-background-primary: #FFFFFF;
  --color-accent-primary: #3A971E;
  /* ... */
}
```

## 📊 Сравнение: До vs После

### ❌ ДО (дублирование):

| Токен | design-tokens.ts | tailwind.config.ts | globals.css |
|-------|------------------|-------------------|-------------|
| Border Radius | ✅ Определен | ✅ Дублирован | - |
| Font Sizes | ✅ Определен | ✅ Дублирован | - |
| Shadows | ✅ Определен | ✅ Дублирован | - |
| Spacing | ✅ Определен | ✅ Дублирован | - |
| Max Width | ❌ Отсутствует | ✅ Hardcoded | - |

**Проблема:** При изменении токена нужно обновлять 2-3 файла!

### ✅ ПОСЛЕ (единый источник):

| Токен | design-tokens.ts | tailwind.config.ts | globals.css |
|-------|------------------|-------------------|-------------|
| Border Radius | ✅ Определен | ⬅️ Импорт | - |
| Font Sizes | ✅ Определен | ⬅️ Импорт | - |
| Shadows | ✅ Определен | ⬅️ Импорт | - |
| Spacing | ✅ Определен | ⬅️ Импорт | - |
| Max Width | ✅ Определен (gridSystem) | ⬅️ Импорт | - |

**Решение:** Изменяете токен в одном месте - обновляется везде!

## 🎯 Новые токены

Добавлены недостающие токены:

### Icon Sizes
```typescript
export const iconSizes = {
  sm: 16,  // 16px
  md: 24,  // 24px
  lg: 32,  // 32px
  xl: 48,  // 48px
}
```

### Grid System
```typescript
export const gridSystem = {
  columns: 12,
  gutter: 24,
  containerMaxWidth: {
    xs: '20rem', sm: '24rem', md: '28rem',
    lg: '32rem', xl: '36rem', '2xl': '42rem',
    '3xl': '48rem', '4xl': '56rem', '5xl': '64rem',
    '6xl': '72rem', '7xl': '80rem', full: '100%',
  },
}
```

### Opacities
```typescript
export const opacities = {
  disabled: 0.4,
  hover: 0.8,
  loading: 0.6,
  overlay: 0.7,
  subtle: 0.1,
  medium: 0.2,
}
```

### Font Weights
```typescript
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}
```

### Animations & Transitions
```typescript
export const keyframes = { ... }
export const animations = { ... }
export const transitionDurations = { ... }
export const transitionTimingFunctions = { ... }
```

## 🔐 TypeScript Type Safety

Добавлен namespace для type-safe доступа:

```typescript
import { DesignTokens } from '@/lib/design-tokens';

// ✅ Type-safe типы
type SpacingKey = DesignTokens.Spacing;        // 'xs' | 'sm' | 'md' | ...
type IconSize = DesignTokens.IconSize;         // 'sm' | 'md' | 'lg' | 'xl'
type ColorKey = DesignTokens.BackgroundColor;  // 'primary' | 'secondary' | ...
type FontWeight = DesignTokens.FontWeight;     // 'thin' | 'light' | 'regular' | ...
```

## 📦 Экспорт для других проектов

Весь набор токенов можно экспортировать:

```typescript
import { designTokens } from '@/lib/design-tokens';

console.log(designTokens.version); // '2.0.0'
console.log(designTokens.colors);  // { light, dark }
console.log(designTokens.spacing); // { xs, sm, md, ... }
```

## 🎨 Использование в компонентах

### Вариант 1: Tailwind классы
```tsx
<div className="p-lg rounded-md shadow-card">
  <h1 className="text-mobile-h1 md:text-tablet-h1 lg:text-desktop-h1">
    Заголовок
  </h1>
</div>
```

### Вариант 2: Программный доступ
```tsx
import { spacing, borderRadius, iconSizes } from '@/lib/design-tokens';

const styles = {
  padding: spacing.lg,         // '16px'
  borderRadius: borderRadius.md, // '12px'
  width: `${iconSizes.md}px`,   // '24px'
};
```

### Вариант 3: CSS-переменные
```tsx
<div style={{ 
  backgroundColor: 'var(--color-background-card)',
  color: 'var(--color-text-primary)' 
}}>
  Контент
</div>
```

## ✅ Преимущества новой архитектуры

1. **Единый источник истины** - все значения в одном файле
2. **Нет дублирования** - изменения в одном месте применяются везде
3. **Type Safety** - TypeScript типы для всех токенов
4. **Масштабируемость** - легко добавлять новые токены
5. **Переносимость** - можно экспортировать в другие проекты
6. **Документированность** - все токены описаны и типизированы
7. **Консистентность** - невозможно использовать несуществующие значения

## 🚀 Следующие шаги

1. ✅ Устранено дублирование токенов
2. ✅ Добавлены недостающие токены (iconSizes, gridSystem, opacities, fontWeights)
3. ✅ Создан TypeScript namespace для type-safe доступа
4. ⏳ Унификация токенов в компонентах (замена старых названий)
5. ⏳ Рефакторинг hardcoded цветов в `/app` и `/components/features`
6. ⏳ Создание standalone пакета для экспорта

---

**Версия:** 2.0.0  
**Обновлено:** December 2, 2025
