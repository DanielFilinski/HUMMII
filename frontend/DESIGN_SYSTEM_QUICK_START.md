# 🎨 Дизайн-система: Быстрый старт

## ⚡ Быстрая справка

### Правила использования цветов

```tsx
// ✅ ПРАВИЛЬНО - используйте семантические классы
<div className="bg-background text-text-primary">
<button className="btn-primary">
<input className="input" />

// ❌ НЕПРАВИЛЬНО - не используйте прямые цвета
<div className="bg-white text-black">
<div style={{ backgroundColor: '#FFFFFF' }}>
```

---

## 📦 Основные компоненты

### Кнопки
```tsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
```

### Карточки
```tsx
<div className="card">Контент карточки</div>
```

### Инпуты
```tsx
<input className="input" placeholder="Текст" />
<input className="input input-error" /> {/* С ошибкой */}
<p className="error-text">Текст ошибки</p>
```

### Статусы (Badge)
```tsx
<span className="badge badge-success">Успех</span>
<span className="badge badge-error">Ошибка</span>
<span className="badge badge-warning">Предупреждение</span>
<span className="badge badge-info">Инфо</span>
```

---

## 🎨 Цветовые категории

### Фоны
- `bg-background` — основной фон
- `bg-background-secondary` — вторичный фон
- `bg-background-tertiary` — третичный фон
- `bg-background-card` — фон карточек

### Текст
- `text-primary` — основной текст
- `text-secondary` — вторичный текст
- `text-tertiary` — третичный текст
- `text-inverse` — инверсный текст (белый на тёмном)
- `text-disabled` — отключённый текст
- `text-link` — ссылки

### Акценты
- `bg-accent-primary` — основной акцент
- `bg-accent-secondary` — вторичный акцент
- `hover:bg-accent-hover` — hover-состояние
- `active:bg-accent-active` — active-состояние

### Обратная связь
- `text-feedback-error` — ошибка (красный)
- `text-feedback-success` — успех (зелёный)
- `text-feedback-warning` — предупреждение (жёлтый)
- `text-feedback-info` — информация (синий)

### Границы
- `border-border-primary` — основная граница
- `border-border-secondary` — вторичная граница
- `focus:border-border-focus` — граница при фокусе

### Поверхности
- `bg-surface-elevated` — приподнятые поверхности
- `bg-surface-sunken` — утопленные поверхности
- `hover:bg-surface-hover` — hover-состояние

---

## 🌈 Градиенты

```tsx
<div className="bg-gradient-main">
<div className="bg-gradient-card">
<div className="bg-gradient-banner">
<h1 className="text-gradient">Текст с градиентом</h1>
```

---

## 📱 Адаптивная типографика

```tsx
<h1>Заголовок H1</h1>  {/* Автоматически адаптируется */}
<h2>Заголовок H2</h2>
<h3>Заголовок H3</h3>
<p>Параграф</p>

{/* Или явно указывайте размеры для разных экранов */}
<h1 className="text-mobile-h1 tablet:text-tablet-h1 desktop:text-desktop-h1">
```

---

## 🌓 Переключение темы

### Простая кнопка
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';
<ThemeToggle />
```

### Расширенный выбор (светлая/тёмная/авто)
```tsx
import { ThemeSelector } from '@/components/ThemeToggle';
<ThemeSelector />
```

### Компактный вариант (только иконки)
```tsx
import { CompactThemeToggle } from '@/components/ThemeToggle';
<CompactThemeToggle />
```

### Использование хука
```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, toggleTheme, effectiveTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Текущая тема: {effectiveTheme}
    </button>
  );
}
```

---

## 🛠️ Утилиты CSS

### Анимации
```tsx
<div className="animate-fadeIn">
<div className="animate-slideIn">
<div className="animate-slideInFromLeft">
<div className="animate-slideInFromRight">
```

### Скроллбар
```tsx
<div className="scrollbar-hide">  {/* Скрыть скроллбар */}
<div className="scrollbar-custom"> {/* Кастомный скроллбар */}
```

### Усечение текста
```tsx
<p className="truncate-1">  {/* 1 строка */}
<p className="truncate-2">  {/* 2 строки */}
<p className="truncate-3">  {/* 3 строки */}
```

### Эффекты
```tsx
<div className="glass">  {/* Glassmorphism */}
<div className="theme-transition"> {/* Плавный переход темы */}
```

---

## 📐 Breakpoints

```tsx
// Mobile: < 768px
<div className="mobile:p-4">

// Tablet: 768-1023px
<div className="tablet:p-6">

// Desktop: >= 1024px
<div className="desktop:p-8">
```

---

## 🚨 Типичные ошибки

### ❌ Использование прямых цветов
```tsx
// НЕ ДЕЛАЙТЕ ТАК:
<div style={{ color: '#000000' }}>
<div className="bg-white">
<button className="bg-blue-500">
```

### ✅ Правильно
```tsx
// ДЕЛАЙТЕ ТАК:
<div className="text-text-primary">
<div className="bg-background">
<button className="btn-primary">
```

---

## 📚 Ресурсы

- **Полная документация:** `frontend/DESIGN_SYSTEM.md`
- **Конфиг Tailwind:** `frontend/tailwind.config.ts`
- **Глобальные стили:** `frontend/app/globals.css`
- **Примеры:** `frontend/components/examples/DesignSystemShowcase.tsx`
- **Правила проекта:** `.github/instructions/next.instructions.md`

---

## 🎯 Чек-лист перед коммитом

- [ ] Используются только семантические цвета из палитры
- [ ] Нет хардкода цветов (#FFFFFF, rgb(), и т.д.)
- [ ] Компонент протестирован в светлой И тёмной теме
- [ ] Используются готовые классы (.btn-primary, .card, .input)
- [ ] Адаптивная типографика применена правильно
- [ ] Анимации и переходы плавные
- [ ] Контрастность текста достаточная (WCAG AA)

---

**Версия:** 1.0 | **Дата:** Декабрь 2025
