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
<button className="btn-primary">
<p className="text-text-secondary">

// Or use CSS variables directly
<div style={{ backgroundColor: 'var(--color-background-primary)' }}>
```

---

## 📋 Core Principles

1. **ALWAYS use semantic color names** - Never use direct hex colors or generic color classes
2. **Use CSS variables** - All colors come from `globals.css` CSS variables
3. **Support light & dark themes** - Colors automatically switch based on `.dark` class
4. **Use pre-built components** - Prefer `.btn-primary`, `.card`, `.input` over custom styling
5. **Test in both themes** - Every component must work in light and dark mode

---

## 🎨 Available Color Categories

### Background Colors
```tsx
bg-background              // Main background
bg-background-secondary    // Secondary background
bg-background-tertiary     // Tertiary background
bg-background-card         // Card background
```

### Text Colors
```tsx
text-text-primary          // Main text (dark in light theme, light in dark theme)
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
hover:bg-accent-hover      // Hover state
active:bg-accent-active    // Active state
```

### Feedback Colors
```tsx
text-feedback-error        // Error messages
text-feedback-success      // Success messages
text-feedback-warning      // Warning messages
text-feedback-info         // Info messages
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
```

---

## 🧩 Pre-built Components

### Buttons
```tsx
// Primary button (green)
<button className="btn-primary">
  Отправить заказ
</button>

// Secondary button (outlined)
<button className="btn-secondary">
  Отменить
</button>

// With icon
<button className="btn-primary flex items-center gap-2">
  <Icon />
  Создать заказ
</button>
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

## 📝 Typography System

### DO NOT use manual font sizes!
```tsx
// ❌ WRONG
<h1 className="text-3xl md:text-4xl">Заголовок</h1>
<p className="text-base md:text-lg">Текст</p>

// ✅ CORRECT - automatic responsive sizing
<Typography variant="h1">Заголовок</Typography>
<Typography variant="body">Текст</Typography>
```

### Use Typography Component
```tsx
import { Typography } from '@/components/ui/Typography';

// Headings
<Typography variant="h1">Главный заголовок</Typography>  // 28px → 30px → 36px
<Typography variant="h2">Подзаголовок</Typography>       // 22px → 24px → 24px
<Typography variant="h3">Заголовок блока</Typography>    // 18px → 20px → 20px

// Body text
<Typography variant="body">Основной текст</Typography>   // 16px → 18px → 20px
<Typography variant="bodySm" color="secondary">         // 14px → 16px → 16px
  Мелкий текст
</Typography>

// Special
<Typography variant="tag">Тег</Typography>               // 14px → 16px → 16px
<Typography variant="note" color="tertiary">            // 12px → 16px → 14px
  Примечание
</Typography>
```

### Typography Features
```tsx
// Colors
<Typography color="primary">Основной</Typography>
<Typography color="secondary">Второстепенный</Typography>
<Typography color="accent">Акцент</Typography>
<Typography color="error">Ошибка</Typography>
<Typography color="link">Ссылка</Typography>

// Text truncation
<Typography truncate>Одна строка...</Typography>
<Typography truncate={2}>Две строки...</Typography>

// Gradient text
<Typography variant="h1" gradient>
  Текст с градиентом
</Typography>

// Alignment
<Typography align="center">По центру</Typography>

// Weight
<Typography weight="bold">Жирный текст</Typography>
```

### Utility Components
```tsx
import { 
  Heading1,      // H1 с отступом
  Badge,         // Бейдж/тег
  Price,         // Цена с валютой
  Rating,        // Рейтинг
  ErrorText,     // Текст ошибки
  HelperText,    // Подсказка
  Link,          // Ссылка
  Label,         // Лейбл формы
  EmptyState,    // Пустое состояние
} from '@/components/ui';

<Heading1>Заголовок</Heading1>
<Badge variant="success">Активен</Badge>
<Price currency="₽">2000</Price>
<Rating value={4.9} />
<ErrorText>Неверный email</ErrorText>
<Link href="/about">О нас</Link>
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
    <button className="btn-primary mt-6">
      Начать поиск
    </button>
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
      <button className="btn-secondary">Отменить</button>
      <button className="btn-primary">Подтвердить</button>
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
```

### ✅ DO:
```tsx
// Semantic colors
<div className="bg-background text-text-primary">

// Design system buttons
<button className="btn-primary">

// Typography component (automatic responsive)
<Typography variant="h1">Заголовок</Typography>

// Typography with colors
<Typography variant="body" color="secondary">

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
- btn-primary, btn-secondary

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

### Import Typography
```tsx
// Single import
import { Typography } from '@/components/ui/Typography';

// Or with utilities
import { 
  Typography,
  Heading1,
  Badge,
  Price,
  Link
} from '@/components/ui';
```

### TypeScript Support
```tsx
import { type TypographyProps } from '@/components/ui/Typography';

const props: TypographyProps = {
  variant: 'h1',      // Autocomplete available
  color: 'primary',   // Autocomplete available
  weight: 'bold',     // Autocomplete available
};
```

---

## 📖 Documentation Resources

- **Design System Overview**: `frontend/DESIGN_SYSTEM.md`
- **Typography Guide**: `frontend/components/ui/TYPOGRAPHY_GUIDE.md`
- **Typography Cheatsheet**: `frontend/components/ui/TYPOGRAPHY_CHEATSHEET.md`
- **Component Examples**: `frontend/components/ui/Typography.examples.tsx`
- **Color Palettes**: `frontend/tailwind.config.ts`
- **CSS Variables**: `frontend/app/globals.css`

---

## ✅ Before Committing Code

1. ✅ No direct hex colors or generic color classes
2. ✅ All text uses Typography component or semantic classes
3. ✅ Tested in both light and dark themes
4. ✅ Used pre-built components (btn-primary, card, input, etc.)
5. ✅ Responsive design works on mobile/tablet/desktop
6. ✅ Proper semantic HTML elements used
7. ✅ No hardcoded font sizes or colors
8. ✅ Follows TypeScript types and interfaces

---

**Remember:** The design system is not just for styling - it ensures consistency, maintainability, and automatic theme support across the entire application. ALWAYS follow these rules!