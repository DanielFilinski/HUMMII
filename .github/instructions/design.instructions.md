---
applyTo: '**'
---

# 🎨 Design System Rules - Hummii Project

## 🚨 CRITICAL: Color Usage Rules

### ❌ NEVER DO THIS:
```tsx
// Direct color values - FORBIDDEN!
<div className="bg-white text-black">
<div className="bg-[#FFFFFF]">
<div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
<button className="bg-green-600">
<p className="text-gray-500">
```

### ✅ ALWAYS DO THIS:
```tsx
// Use semantic Tailwind classes
<div className="bg-background text-text-primary">
<div className="bg-background-card border-border-primary">
<PrimaryButton>Действие</PrimaryButton>
<Typography color="secondary">Текст</Typography>

// Or use CSS variables directly
<div style={{ backgroundColor: 'var(--color-background-primary)' }}>
```

---

## 📋 Core Principles

1. **ALWAYS use semantic color names** - Never use direct hex colors or generic color classes
2. **Use CSS variables** - All colors come from `globals.css` CSS variables (auto-generated from `design-tokens.ts`)
3. **Support light & dark themes** - Colors automatically switch based on `.dark` class
4. **Use pre-built components** - Prefer `<PrimaryButton>`, `<SecondaryButton>`, `<Typography>`, `<Icon>` over custom styling
5. **Test in both themes** - Every component must work in light and dark mode
6. **Keep it minimal** - Create only component file + index.ts for export. NO documentation files unless explicitly requested.

---

## 🎨 Complete Color Palette

### Light Theme Colors

#### Background
- **Primary**: `#FFFFFF` - Main background
- **Secondary**: `#E1F7DB` - Secondary sections (light green tint)
- **Tertiary**: `#F6FBF7` - Subtle backgrounds
- **Card**: `#FFFFFF` - Card surfaces
- **Overlay**: `rgba(84, 84, 63, 0.7)` - Modal overlays

#### Text
- **Primary**: `#2A2A0F` - Main text (dark)
- **Secondary**: `#819082` - Secondary text (muted)
- **Tertiary**: `#96A996` - Disabled/unfocused text
- **Inverse**: `#FFFFFF` - Text on dark backgrounds
- **Disabled**: `#DBDBDB` - Disabled state
- **Link**: `#3A971E` - Clickable links (green)

#### Accent (Green Brand Colors)
- **Primary**: `#3A971E` - Main brand green
- **Secondary**: `#67AD51` - Lighter green
- **Tertiary**: `#AAC89A` - Subtle green
- **Hover**: `#2d7516` - Hover state (darker)
- **Active**: `#245d0f` - Pressed state (darkest)
- **Disabled**: `#AAC89A` - Disabled accent

#### Feedback
- **Error**: `#B52F2F` - Error messages (red)
- **Success**: `#3A971E` - Success messages (green)
- **Warning**: `#F59E0B` - Warnings (yellow/orange)
- **Info**: `#3B82F6` - Information (blue)
- **Attention**: `#F13A0C` - Critical attention (orange-red)

#### Border
- **Primary**: `#E5E7EB` - Default borders
- **Secondary**: `#D1D5DB` - Subtle borders
- **Focus**: `#3A971E` - Focus state (green)
- **Error**: `#B52F2F` - Error borders (red)

#### Surface
- **Elevated**: `#FFFFFF` - Modals, dropdowns
- **Sunken**: `#F9FAFB` - Input backgrounds
- **Hover**: `#F3F4F6` - Hover states
- **Pressed**: `#E5E7EB` - Active states

#### Gradients
- **Main**: `linear-gradient(to top, #CDF2C2, #FCFFFD)`
- **Card**: `linear-gradient(to bottom, #DDF8D4, #F9D5B7)`
- **Banner**: `linear-gradient(to bottom, #FFFDE9, #D7FAD6)`

### Dark Theme Colors

#### Background
- **Primary**: `#0F1419` - Main background (very dark)
- **Secondary**: `#1A2028` - Secondary sections
- **Tertiary**: `#232B36` - Elevated surfaces
- **Card**: `#1A2028` - Card surfaces
- **Overlay**: `rgba(15, 20, 25, 0.85)` - Modal overlays

#### Text
- **Primary**: `#F9FAFB` - Main text (light)
- **Secondary**: `#9CA3AF` - Secondary text (muted)
- **Tertiary**: `#6B7280` - Disabled/unfocused
- **Inverse**: `#0F1419` - Text on light backgrounds
- **Disabled**: `#4B5563` - Disabled state
- **Link**: `#67AD51` - Clickable links (green)

#### Accent (Green Brand Colors)
- **Primary**: `#3A971E` - Main brand green (same as light)
- **Secondary**: `#67AD51` - Lighter green
- **Tertiary**: `#AAC89A` - Subtle green
- **Hover**: `#7DBD62` - Hover state (lighter in dark theme)
- **Active**: `#8FCC78` - Pressed state (even lighter)
- **Disabled**: `#AAC89A` - Disabled accent

#### Feedback
- **Error**: `#EF4444` - Error messages (brighter red)
- **Success**: `#67AD51` - Success messages (green)
- **Warning**: `#FBBF24` - Warnings (brighter yellow)
- **Info**: `#60A5FA` - Information (brighter blue)
- **Attention**: `#FB923C` - Critical attention (orange)

#### Border
- **Primary**: `#374151` - Default borders
- **Secondary**: `#4B5563` - Subtle borders
- **Focus**: `#67AD51` - Focus state (green)
- **Error**: `#EF4444` - Error borders (red)

#### Surface
- **Elevated**: `#232B36` - Modals, dropdowns
- **Sunken**: `#0F1419` - Input backgrounds
- **Hover**: `#2A3441` - Hover states
- **Pressed**: `#1F2937` - Active states

#### Gradients
- **Main**: `linear-gradient(to top, #1A2028, #0F1419)`
- **Card**: `linear-gradient(to bottom, #232B36, #1A2028)`
- **Banner**: `linear-gradient(to bottom, #2A3441, #1A2028)`

---

## 🎨 Tailwind Color Classes

### Background Colors
```tsx
bg-background              // Main background
bg-background-secondary    // Secondary background
bg-background-tertiary     // Tertiary background
bg-background-card         // Card background
bg-background-overlay      // Modal overlay
```

### Text Colors
```tsx
text-text-primary          // Main text
text-text-secondary        // Secondary text
text-text-tertiary         // Tertiary/disabled text
text-text-inverse          // Inverse text (for dark backgrounds)
text-text-disabled         // Disabled state text
text-text-link             // Link text
```

### Accent Colors
```tsx
bg-accent-primary          // Main accent (green)
bg-accent-secondary        // Secondary accent
bg-accent-tertiary         // Tertiary accent
hover:bg-accent-hover      // Hover state
active:bg-accent-active    // Active state
bg-accent-disabled         // Disabled state
```

### Feedback Colors
```tsx
text-feedback-error        // Error messages
text-feedback-success      // Success messages
text-feedback-warning      // Warning messages
text-feedback-info         // Info messages
text-feedback-attention    // Critical attention
bg-feedback-error/10       // Error background with opacity
```

### Border Colors
```tsx
border-border-primary      // Main border
border-border-secondary    // Secondary border
focus:border-border-focus  // Focus state border
border-border-error        // Error border
```

### Surface Colors
```tsx
bg-surface-elevated        // Elevated surface (modals, dropdowns)
bg-surface-sunken          // Sunken surface
hover:bg-surface-hover     // Hover state
active:bg-surface-pressed  // Pressed state
```

---

## 🧩 Button Components

### PrimaryButton Component
```tsx
import { PrimaryButton } from '@shared/ui/button/PrimaryButton';

// Basic usage
<PrimaryButton>Отправить заказ</PrimaryButton>

// With loading state
<PrimaryButton isLoading>Загрузка...</PrimaryButton>

// Full width
<PrimaryButton fullWidth>Создать профиль</PrimaryButton>

// Disabled
<PrimaryButton disabled>Недоступно</PrimaryButton>

// With icon (icons inherit color automatically)
<PrimaryButton>
  <Icon name="plus" color="inherit" />
  Создать заказ
</PrimaryButton>
```

**Button States:**
- **Default**: `bg-accent-primary`, `text-text-inverse`
- **Hover**: `bg-accent-secondary`, `text-text-inverse`
- **Pressed/Active**: `bg-background-secondary`, `text-text-primary`
- **Loading**: `bg-background-secondary`, `text-text-primary` (shows spinner)
- **Disabled**: `bg-accent-disabled`, `text-text-inverse`

### SecondaryButton Component
```tsx
import { SecondaryButton } from '@shared/ui/button/SecondaryButton';

// Basic usage
<SecondaryButton>Отменить</SecondaryButton>

// With loading state
<SecondaryButton isLoading>Загрузка...</SecondaryButton>

// Full width
<SecondaryButton fullWidth>Назад</SecondaryButton>

// With icon
<SecondaryButton>
  <Icon name="arrow-left" color="inherit" />
  Назад
</SecondaryButton>
```

**Button States:**
- **Default**: `bg-transparent`, `border-accent-primary`, `text-accent-primary`
- **Hover**: `bg-transparent`, `text-accent-secondary`
- **Pressed/Active**: `bg-transparent`, `text-text-primary`
- **Loading**: `bg-transparent`, `border-accent-primary`, `text-text-primary`
- **Disabled**: `border-text-disabled`, `text-text-disabled`

### Button Best Practices
```tsx
// ❌ DON'T: Use className classes or inline styles
<button className="btn-primary">Submit</button>
<button className="bg-green-500">Submit</button>

// ✅ DO: Use component props
<PrimaryButton>Submit</PrimaryButton>
<SecondaryButton>Cancel</SecondaryButton>

// ✅ DO: Icons inside buttons inherit color
<PrimaryButton>
  <Icon name="google" color="inherit" />
  Sign in with Google
</PrimaryButton>
```

---

## 🎨 Icon Component

### Icon Usage
```tsx
import { Icon } from '@shared/ui/icons/Icon';

// Basic usage (default: md size, primary color)
<Icon name="bell" />

// With size
<Icon name="star" size="lg" />      // predefined: xs | sm | md | lg | xl | 2xl
<Icon name="menu" size={28} />      // custom pixel size

// With semantic color
<Icon name="edit" color="accent" />
<Icon name="error" color="error" />
<Icon name="check" color="success" />

// Inherit color from parent (for buttons, links)
<PrimaryButton>
  <Icon name="plus" color="inherit" />
  Create
</PrimaryButton>

<a href="/profile" className="text-accent-primary">
  <Icon name="person" color="current" />
  Profile
</a>
```

### Available Icons
```
person, apple, arrow-down, arrow-left, arrow-right, arrow-up, 
bell, claim, clip, clock, collapse, edit, email, extend, 
eye-slash, eye, facebook, google, icon, instagram, language, 
loading, menu, order-done, order-reviewed, orders, password, 
plus, report, settings, star, twitter, variant31, variant32, 
variant35, x
```

### Icon Sizes
- **xs**: 16px
- **sm**: 20px
- **md**: 24px (default)
- **lg**: 32px
- **xl**: 40px
- **2xl**: 48px

### Icon Colors (Semantic)
```tsx
color="primary"     // text-text-primary
color="secondary"   // text-text-secondary
color="tertiary"    // text-text-tertiary
color="inverse"     // text-text-inverse (white)
color="disabled"    // text-text-disabled
color="link"        // text-text-link
color="accent"      // text-accent-primary (green)
color="error"       // text-feedback-error
color="success"     // text-feedback-success
color="warning"     // text-feedback-warning
color="info"        // text-feedback-info
color="inherit"     // inherits from parent (for buttons)
color="current"     // uses currentColor (for inline text)
```

### Icon Best Practices
```tsx
// ❌ DON'T: Use img tags or manual SVG imports
<img src="/icons/bell.svg" />
<svg>...</svg>

// ✅ DO: Use Icon component
<Icon name="bell" />

// ✅ DO: Use color="inherit" inside buttons
<PrimaryButton>
  <Icon name="google" color="inherit" />
  Sign in
</PrimaryButton>

// ✅ DO: Use color="current" for inline icons with text
<span className="text-accent-primary">
  <Icon name="star" color="current" /> 4.9
</span>
```

### Cards
```tsx
<div className="card">
  <h3 className="text-text-primary">Заголовок</h3>
  <p className="text-text-secondary">Описание</p>
</div>
```

### Inputs
```tsx
// Standard input
<input 
  type="text" 
  className="input" 
  placeholder="Введите текст"
/>

// Input with error
<input 
  type="email" 
  className="input input-error" 
  placeholder="Email"
/>
<p className="error-text">Неверный формат email</p>
```

### Badges
```tsx
<span className="badge badge-success">Активен</span>
<span className="badge badge-error">Ошибка</span>
<span className="badge badge-warning">Ожидание</span>
<span className="badge badge-info">Информация</span>
```

### Gradients
```tsx
// Main gradient background
<div className="bg-gradient-main">
  <h1>Hero Section</h1>
</div>

// Card gradient
<div className="bg-gradient-card rounded-xl p-6">
  <p>Content</p>
</div>

// Gradient text
<h1 className="text-gradient">
  Заголовок с градиентом
</h1>
```

---

## 📝 Typography Component

### DO NOT use manual font sizes!
```tsx
// ❌ WRONG
<h1 className="text-3xl md:text-4xl">Заголовок</h1>
<p className="text-base md:text-lg">Текст</p>

// ✅ CORRECT - automatic responsive sizing
<Typography variant="h1">Заголовок</Typography>
<Typography variant="body">Текст</Typography>
```

### Typography Variants
```tsx
import { Typography } from '@shared/ui/typography/Typography';

// Headings (automatically responsive)
<Typography variant="h1">Главный заголовок</Typography>  // 28px → 30px → 36px
<Typography variant="h2">Подзаголовок</Typography>       // 22px → 24px → 24px
<Typography variant="h3">Заголовок блока</Typography>    // 18px → 20px → 20px

// Body text
<Typography variant="body">Основной текст</Typography>   // 16px → 18px → 20px
<Typography variant="bodySm">Мелкий текст</Typography>   // 14px → 16px → 16px

// Special
<Typography variant="tag">Тег</Typography>               // 14px → 16px → 16px (extrabold)
<Typography variant="note">Примечание</Typography>       // 12px → 16px → 14px
```

### Typography Colors
```tsx
// Semantic colors (automatically switch in dark theme)
<Typography color="primary">Основной текст</Typography>
<Typography color="secondary">Второстепенный</Typography>
<Typography color="tertiary">Неактивный</Typography>
<Typography color="inverse">Инверсный (белый на тёмном)</Typography>
<Typography color="disabled">Отключённый</Typography>

// Accent and feedback colors
<Typography color="accent">Акцент (зелёный)</Typography>
<Typography color="link">Ссылка</Typography>
<Typography color="error">Ошибка</Typography>
<Typography color="success">Успех</Typography>
<Typography color="warning">Предупреждение</Typography>
<Typography color="info">Информация</Typography>

// Special colors for nested content
<Typography color="inherit">Наследует цвет от родителя</Typography>
```

### Typography Features
```tsx
// Text truncation
<Typography truncate>Одна строка с многоточием...</Typography>
<Typography truncate={2}>Две строки с многоточием...</Typography>
<Typography truncate={3}>Три строки...</Typography>

// Gradient text
<Typography variant="h1" gradient>
  Текст с фирменным градиентом
</Typography>

// Text alignment
<Typography align="left">По левому краю</Typography>
<Typography align="center">По центру</Typography>
<Typography align="right">По правому краю</Typography>
<Typography align="justify">По ширине</Typography>

// Font weight override
<Typography weight="light">Лёгкий (300)</Typography>
<Typography weight="regular">Обычный (400)</Typography>
<Typography weight="medium">Средний (500)</Typography>
<Typography weight="semibold">Полужирный (600)</Typography>
<Typography weight="bold">Жирный (700)</Typography>
<Typography weight="extrabold">Очень жирный (800)</Typography>

// Custom HTML element
<Typography as="span" variant="body">Inline text</Typography>
<Typography as="div" variant="h2">Heading in div</Typography>
```

### Typography Best Practices
```tsx
// ❌ DON'T: Manual responsive classes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>

// ✅ DO: Use Typography component
<Typography variant="h1">Title</Typography>

// ❌ DON'T: Direct color values
<p style={{ color: '#2A2A0F' }}>Text</p>
<p className="text-gray-600">Text</p>

// ✅ DO: Semantic colors
<Typography color="primary">Text</Typography>
<Typography color="secondary">Text</Typography>

// ❌ DON'T: Non-semantic HTML
<div>Heading</div>
<span className="text-lg font-bold">Heading</span>

// ✅ DO: Proper semantic elements
<Typography variant="h2">Heading</Typography>
<Typography as="h2" variant="h2">Heading</Typography>
```

---

## 🧩 Other UI Components

### Cards
```tsx
<div className="card">
  <h3 className="text-text-primary">Заголовок</h3>
  <p className="text-text-secondary">Описание</p>
</div>
```

### Inputs
```tsx
// Standard input
<input 
  type="text" 
  className="input" 
  placeholder="Введите текст"
/>

// Input with error
<input 
  type="email" 
  className="input input-error" 
  placeholder="Email"
/>
<p className="error-text">Неверный формат email</p>
```

### Badges
```tsx
<span className="badge badge-success">Активен</span>
<span className="badge badge-error">Ошибка</span>
<span className="badge badge-warning">Ожидание</span>
<span className="badge badge-info">Информация</span>
```

### Gradients
```tsx
// Main gradient background
<div className="bg-gradient-main">
  <h1>Hero Section</h1>
</div>

// Card gradient
<div className="bg-gradient-card rounded-xl p-6">
  <p>Content</p>
</div>

// Gradient text
<h1 className="text-gradient">
  Заголовок с градиентом
</h1>
```

---

## 🎯 Component Examples

### User Card
```tsx
<div className="card">
  <div className="flex items-center justify-between mb-3">
    <Typography variant="h3">Иван Петров</Typography>
    <Badge variant="success">Доступен</Badge>
  </div>
  
  <Typography variant="bodySm" color="secondary" className="mb-3">
    Сантехник • Стаж 5 лет • <Rating value={4.9} />
  </Typography>
  
  <Typography variant="body" truncate={2} className="mb-3">
    Профессиональный сантехник с большим опытом работы...
  </Typography>
  
  <div className="flex items-center gap-2">
    <Price>2000</Price>
    <Typography variant="note" color="tertiary">/час</Typography>
  </div>
</div>
```

### Form with Validation
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <input 
    id="email" 
    type="email" 
    className="input"
    placeholder="email@example.com"
  />
  <ErrorText>Пожалуйста, введите корректный email</ErrorText>
</div>

<div className="space-y-2">
  <Label htmlFor="phone">Телефон</Label>
  <input 
    id="phone" 
    type="tel" 
    className="input"
  />
  <HelperText>Формат: +7 (XXX) XXX-XX-XX</HelperText>
</div>
```

### Hero Section
```tsx
<section className="py-16 bg-gradient-main">
  <div className="container mx-auto text-center">
    <Typography variant="h1" gradient className="mb-4">
      Найдите лучших специалистов
    </Typography>
    <Typography variant="body" color="secondary" className="max-w-2xl mx-auto">
      Hummii соединяет вас с проверенными профессионалами
    </Typography>
    <PrimaryButton className="mt-6">
      Начать поиск
    </PrimaryButton>
  </div>
</section>
```

### Modal/Dialog
```tsx
<div className="fixed inset-0 bg-background-overlay flex items-center justify-center p-4">
  <div className="card max-w-md w-full">
    <Typography variant="h3" className="mb-4">
      Подтвердите действие
    </Typography>
    <Typography variant="body" color="secondary" className="mb-6">
      Вы уверены, что хотите удалить этот элемент?
    </Typography>
    <div className="flex gap-3 justify-end">
      <SecondaryButton>Отменить</SecondaryButton>
      <PrimaryButton>Подтвердить</PrimaryButton>
    </div>
  </div>
</div>
```

### Notification/Alert
```tsx
<div className="p-4 bg-feedback-info/10 border-l-4 border-feedback-info rounded">
  <Typography variant="bodySm" color="info" weight="semibold" className="mb-1">
    Информация
  </Typography>
  <Typography variant="note" color="secondary">
    Ваш профиль успешно обновлён
  </Typography>
</div>

<div className="p-4 bg-feedback-error/10 border-l-4 border-feedback-error rounded">
  <Typography variant="bodySm" color="error" weight="semibold" className="mb-1">
    Ошибка
  </Typography>
  <Typography variant="note" color="secondary">
    Не удалось сохранить изменения
  </Typography>
</div>
```

---

## 📱 Responsive Design

### Use Built-in Responsive Classes
```tsx
// Grid layout - automatic responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Padding - mobile first
<div className="p-4 md:p-6 lg:p-8">
  <Typography variant="h2">Контент</Typography>
</div>

// Hide/show on different screens
<div className="hidden lg:block">Desktop only</div>
<div className="block lg:hidden">Mobile only</div>
```

### Breakpoints
- `mobile`: < 768px (default, no prefix needed)
- `sm`: 640px+
- `md` (tablet): 768px+
- `lg` (desktop): 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

---

## 🌓 Theme Support

### Automatic Theme Switching
All colors automatically adapt when `.dark` class is added to `<html>`:

```tsx
// This text is dark in light theme, light in dark theme
<Typography color="primary">Адаптивный текст</Typography>

// Background changes too
<div className="bg-background border-border-primary">
  <Typography color="secondary">Контент</Typography>
</div>
```

### Theme Toggle Component
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="bg-background-card border-b border-border-primary">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Typography variant="h3">Hummii</Typography>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

---

## ✨ Special Effects

### Glassmorphism
```tsx
<div className="glass rounded-xl p-6">
  <Typography variant="h3">Стеклянный эффект</Typography>
</div>
```

### Animations
```tsx
// Fade in
<div className="animate-fadeIn">
  <Typography>Появляется плавно</Typography>
</div>

// Slide in from left
<div className="animate-slideInFromLeft">
  <Typography>Скользит слева</Typography>
</div>
```

### Text Truncation
```tsx
// Single line truncate
<Typography truncate>
  Очень длинный текст который будет обрезан...
</Typography>

// Multi-line truncate
<Typography truncate={2}>
  Текст в две строки максимум...
</Typography>

// Or with utility class
<p className="truncate-3">
  Текст в три строки максимум...
</p>
```

### Custom Scrollbar
```tsx
<div className="scrollbar-custom h-64 overflow-y-auto">
  <Typography>Прокручиваемый контент</Typography>
</div>
```

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T:
```tsx
// Direct colors
<div style={{ color: '#2A2A0F', backgroundColor: '#FFFFFF' }}>

// Generic Tailwind colors
<button className="bg-white text-black border-gray-300">

// Manual responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Inline font sizes
<p style={{ fontSize: '16px' }}>

// Non-semantic elements
<div onClick={handleClick}>Click me</div>

// Using className button classes
<button className="btn-primary">Submit</button>
```

### ✅ DO:
```tsx
// Semantic colors
<div className="bg-background text-text-primary">

// Design system components
<PrimaryButton>Submit</PrimaryButton>
<SecondaryButton>Cancel</SecondaryButton>

// Typography component (automatic responsive)
<Typography variant="h1">Заголовок</Typography>

// Typography with colors
<Typography variant="body" color="secondary">

// Icon component
<Icon name="bell" size="lg" color="accent" />

// Semantic interactive elements
<button onClick={handleClick}>Click me</button>
```

---

## 📚 Quick Reference

### Color Classes Cheatsheet
```
Backgrounds:
- bg-background, bg-background-secondary, bg-background-card

Text:
- text-text-primary, text-text-secondary, text-text-link

Accents:
- bg-accent-primary, hover:bg-accent-hover

Feedback:
- text-feedback-error, text-feedback-success

Borders:
- border-border-primary, focus:border-border-focus
```

### Component Classes Cheatsheet
```
Buttons:
- <PrimaryButton>, <SecondaryButton>

Typography:
- <Typography variant="h1|h2|h3|body|bodySm|tag|note">

Icons:
- <Icon name="bell|star|..." size="xs|sm|md|lg|xl|2xl" color="primary|accent|...">

Inputs:
- input, input-error

Cards:
- card

Badges:
- badge badge-success, badge badge-error

Gradients:
- bg-gradient-main, bg-gradient-card, text-gradient
```

---

## 🔧 Integration with Code

### Import Components
```tsx
// Button imports
import { PrimaryButton } from '@shared/ui/button/PrimaryButton';
import { SecondaryButton } from '@shared/ui/button/SecondaryButton';

// Typography import
import { Typography } from '@shared/ui/typography/Typography';

// Icon import
import { Icon } from '@shared/ui/icons/Icon';
```

### TypeScript Support
```tsx
import type { TypographyProps } from '@shared/ui/typography/Typography';
import type { IconProps, IconName } from '@shared/ui/icons/Icon';

const props: TypographyProps = {
  variant: 'h1',      // Autocomplete available
  color: 'primary',   // Autocomplete available
  weight: 'bold',     // Autocomplete available
};

const iconName: IconName = 'bell'; // Type-safe icon names
```

---

## 🆕 Creating New Components

### Component Creation Rules

**CRITICAL: Keep it minimal!**

When creating a new UI component:

1. ✅ **DO**: Create component file (e.g., `MyComponent.tsx`)
2. ✅ **DO**: Create `index.ts` for export
3. ❌ **DON'T**: Create documentation files (`.md`, `README.md`, etc.)
4. ❌ **DON'T**: Create example files (`.examples.tsx`, `.stories.tsx`)
5. ❌ **DON'T**: Create test files unless explicitly requested
6. ❌ **DON'T**: Create extra configuration files

### Example: Correct Component Structure
```
components/
  ui/
    MyComponent/
      MyComponent.tsx   ✅ Component file
      index.ts          ✅ Export file
```

### Example: Wrong Component Structure (DON'T DO THIS)
```
components/
  ui/
    MyComponent/
      MyComponent.tsx
      index.ts
      MyComponent.md          ❌ NO documentation
      README.md               ❌ NO readme
      MyComponent.test.tsx    ❌ NO tests (unless requested)
      MyComponent.stories.tsx ❌ NO storybook
      MyComponent.examples.tsx ❌ NO examples
```

### Template for index.ts
```tsx
// components/ui/MyComponent/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

---

## 📖 Documentation Resources

- **Design System Overview**: `frontend/DESIGN_SYSTEM.md`
- **Color Palettes**: `frontend/srcshared/lib/design-tokens.ts`
- **CSS Variables**: `frontend/app/globals.css`
- **Tailwind Config**: `frontend/tailwind.config.ts`

---

## ✅ Before Committing Code

1. ✅ No direct hex colors or generic color classes
2. ✅ All text uses Typography component or semantic classes
3. ✅ Tested in both light and dark themes
4. ✅ Used pre-built components (PrimaryButton, SecondaryButton, Icon, Typography)
5. ✅ Responsive design works on mobile/tablet/desktop
6. ✅ Proper semantic HTML elements used
7. ✅ No hardcoded font sizes or colors
8. ✅ Follows TypeScript types and interfaces
9. ✅ New components have ONLY .tsx file + index.ts (no extra docs)

---

**Remember:** The design system is not just for styling - it ensures consistency, maintainability, and automatic theme support across the entire application. ALWAYS follow these rules!