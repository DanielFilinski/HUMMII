# 🔐 AuthButton Component

Кнопка для аутентификации (Sign In / Sign Up) согласно дизайн-системе Hummii.

## 📍 Расположение

```
/frontend/components/ui/button/AuthButton.tsx
```

## 📏 Размеры (из дизайн-токенов)

Все размеры соответствуют требованиям дизайна:

- **Width**: `200px` (min-width для адаптивности)
- **Height**: `48px` → `h-12` (Tailwind)
- **Padding**: `15px 20px` → `py-[15px] px-5`
- **Border Radius**: `1000px` → `rounded-full`

### Соответствие Tailwind/Tokens:

```tsx
className={cn(
  'min-w-[200px]',      // width: 200px
  'h-12',               // height: 48px (12 * 4px = 48px)
  'py-[15px] px-5',     // padding: 15px 20px (px-5 = 20px)
  'rounded-full',       // border-radius: 1000px
)}
```

## 🎨 Варианты

### Primary (для Sign In)
- Фон: `bg-accent-primary` (#3A971E в light, #67AD51 в dark)
- Текст: `text-text-inverse` (белый)
- Hover: `bg-accent-hover`
- Active: `bg-accent-active`

### Secondary (для Sign Up)
- Фон: прозрачный с обводкой
- Граница: `border-2 border-accent-primary`
- Текст: `text-accent-primary`
- Hover: `bg-accent-primary/10`

## 📦 Импорт

```tsx
import { AuthButton } from '@/components/ui/button';
// или
import { AuthButton } from '@/components/ui/button/AuthButton';
```

## 🚀 Использование

### Базовое использование

```tsx
// Primary (Sign In)
<AuthButton>Sign In</AuthButton>

// Secondary (Sign Up)
<AuthButton variant="secondary">Sign Up</AuthButton>
```

### Состояния

```tsx
// Загрузка
<AuthButton isLoading>Signing in...</AuthButton>

// Отключено
<AuthButton disabled>Disabled</AuthButton>

// Full width
<AuthButton fullWidth>Sign In</AuthButton>
```

### С иконками

```tsx
<AuthButton>
  <svg className="w-5 h-5" {...iconProps}>
    {/* icon path */}
  </svg>
  Sign In
</AuthButton>
```

### В форме

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <input type="email" placeholder="Email" className="input" />
  <input type="password" placeholder="Password" className="input" />
  
  <AuthButton fullWidth type="submit">
    Sign In
  </AuthButton>
  
  <AuthButton variant="secondary" fullWidth type="button" onClick={goToSignUp}>
    Sign Up
  </AuthButton>
</form>
```

## 🎯 Props

```tsx
interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';  // Вариант кнопки
  isLoading?: boolean;                // Состояние загрузки
  fullWidth?: boolean;                // Растянуть на всю ширину
}
```

## 🌓 Поддержка тем

Кнопка автоматически адаптируется к светлой/тёмной теме благодаря использованию CSS-переменных из `design-tokens.ts`.

**Светлая тема:**
- Primary: зеленый (#3A971E)
- Hover: светло-зеленый (#67AD51)

**Тёмная тема:**
- Primary: светло-зеленый (#67AD51)
- Hover: ещё светлее (#86C06E)

## ♿ Accessibility

- ✅ Полная поддержка клавиатуры
- ✅ Focus-visible ring для навигации
- ✅ aria-hidden на спиннере загрузки
- ✅ disabled состояние блокирует взаимодействие
- ✅ Правильные HTML-атрибуты (type, disabled)

## 📱 Адаптивность

Кнопка адаптируется на всех устройствах:
- Mobile: min-width 200px (адаптивная ширина)
- Tablet: то же
- Desktop: то же

Для мобильных используйте `fullWidth` для растягивания:

```tsx
<AuthButton fullWidth>Sign In</AuthButton>
```

## 🔗 Связанные компоненты

- `PrimaryButton` - базовая кнопка дизайн-системы
- `Button` - универсальная кнопка

## 📝 Примеры

Полные примеры использования смотрите в:
```
/frontend/components/ui/button/AuthButton.examples.tsx
```

## 🎨 Дизайн-токены

Кнопка использует следующие токены из `@/lib/design-tokens`:

```tsx
import { 
  borderRadius,   // rounded-full
  spacing,        // padding
  // Цвета через CSS-переменные в tailwind.config.ts
} from '@/lib/design-tokens';
```

Все значения импортируются из единого источника истины (`design-tokens.ts`), что обеспечивает консистентность дизайн-системы.
