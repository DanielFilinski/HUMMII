# 🎨 Дизайн-система HUMMII

## 📋 Содержание
- [Обзор](#обзор)
- [Цветовые палитры](#цветовые-палитры)
- [Правила использования](#правила-использования)
- [Примеры компонентов](#примеры-компонентов)
- [Переключение темы](#переключение-темы)
- [Добавление новой темы](#добавление-новой-темы)

---

## 🎯 Обзор

Дизайн-система построена на **CSS-переменных** и **Tailwind CSS** для обеспечения:
- ✅ Автоматического переключения между светлой и тёмной темой
- ✅ Легкого добавления новых цветовых схем
- ✅ Консистентности дизайна по всему проекту
- ✅ Поддержки системных настроек (`prefers-color-scheme`)

---

## 🎨 Цветовые палитры

### Светлая тема (по умолчанию)

#### Фоны
```css
--color-background-primary: #FFFFFF      /* Основной белый фон */
--color-background-secondary: #E1F7DB    /* Светло-зелёный */
--color-background-tertiary: #F6FBF7     /* Очень светлый */
--color-background-card: #FFFFFF         /* Фон карточек */
--color-background-overlay: rgba(22, 22, 14, 0.7) /* Оверлей */
```

#### Текст
```css
--color-text-primary: #2A2A0F           /* Тёмный основной текст */
--color-text-secondary: #819082         /* Серый вторичный текст */
--color-text-tertiary: #96A996          /* Unfocused текст */
--color-text-inverse: #FFFFFF           /* Белый на тёмном */
--color-text-disabled: #DBDBDB          /* Отключённый текст */
--color-text-link: #3A971E              /* Зелёные ссылки */
```

#### Акценты
```css
--color-accent-primary: #3A971E         /* Основной зелёный */
--color-accent-secondary: #67AD51       /* Светло-зелёный */
--color-accent-tertiary: #AAC89A        /* Disabled */
--color-accent-hover: #2d7516           /* Hover-состояние */
--color-accent-active: #245d0f          /* Active-состояние */
```

#### Обратная связь
```css
--color-feedback-error: #B52F2F         /* Красный (ошибка) */
--color-feedback-success: #3A971E       /* Зелёный (успех) */
--color-feedback-warning: #F59E0B       /* Жёлтый (предупреждение) */
--color-feedback-info: #3B82F6          /* Синий (информация) */
--color-feedback-attention: #F13A0C     /* Оранжевый (внимание) */
```

---

### Тёмная тема

#### Фоны
```css
--color-background-primary: #0F1419      /* Тёмный основной */
--color-background-secondary: #1A2028    /* Вторичный тёмный */
--color-background-tertiary: #232B36     /* Третичный тёмный */
--color-background-card: #1A2028         /* Фон карточек */
--color-background-overlay: rgba(15, 20, 25, 0.85) /* Оверлей */
```

#### Текст
```css
--color-text-primary: #F9FAFB           /* Светлый основной текст */
--color-text-secondary: #9CA3AF         /* Серый вторичный текст */
--color-text-tertiary: #6B7280          /* Unfocused текст */
--color-text-inverse: #0F1419           /* Тёмный на светлом */
--color-text-disabled: #4B5563          /* Отключённый текст */
--color-text-link: #67AD51              /* Зелёные ссылки */
```

#### Акценты
```css
--color-accent-primary: #67AD51         /* Основной зелёный */
--color-accent-secondary: #86C06E       /* Светло-зелёный */
--color-accent-tertiary: #5A8D47        /* Disabled */
--color-accent-hover: #7DBD62           /* Hover-состояние */
--color-accent-active: #8FCC78          /* Active-состояние */
```

---

## ✅ Правила использования

### ❌ НЕПРАВИЛЬНО:
```tsx
// НЕ используйте прямые цвета!
<div className="bg-white text-black">
<div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
<button className="bg-green-600">
```

### ✅ ПРАВИЛЬНО:
```tsx
// Используйте семантические классы Tailwind
<div className="bg-background text-text-primary">
<div className="bg-background-card border-border-primary">
<button className="btn-primary">

// Или CSS-переменные напрямую
<div style={{ backgroundColor: 'var(--color-background-primary)' }}>
```

---

## 🧩 Примеры компонентов

### Кнопки

```tsx
// Primary кнопка
<button className="btn-primary">
  Отправить заказ
</button>

// Secondary кнопка
<button className="btn-secondary">
  Отменить
</button>

// Disabled кнопка
<button className="btn-primary" disabled>
  Недоступно
</button>
```

### Карточки

```tsx
<div className="card">
  <h3>Заголовок карточки</h3>
  <p className="text-text-secondary">Описание карточки</p>
</div>
```

### Инпуты

```tsx
// Обычный инпут
<input 
  type="text" 
  className="input" 
  placeholder="Введите имя"
/>

// Инпут с ошибкой
<div>
  <input 
    type="email" 
    className="input input-error" 
    placeholder="Email"
  />
  <p className="error-text">Неверный формат email</p>
</div>
```

### Badge (статусы)

```tsx
<span className="badge badge-success">Выполнено</span>
<span className="badge badge-error">Ошибка</span>
<span className="badge badge-warning">В ожидании</span>
<span className="badge badge-info">Информация</span>
```

### Градиенты

```tsx
// Основной градиент
<div className="bg-gradient-main">
  <h1>Добро пожаловать</h1>
</div>

// Градиент карточки
<div className="bg-gradient-card rounded-xl p-6">
  <p>Контент с градиентом</p>
</div>

// Текст с градиентом
<h1 className="text-gradient">
  Яркий заголовок
</h1>
```

### Адаптивная типографика

```tsx
// Автоматически адаптируется под размер экрана
<h1>Заголовок H1</h1>  {/* 28px (mobile) → 30px (tablet) → 36px (desktop) */}
<h2>Заголовок H2</h2>  {/* 22px (mobile) → 24px (tablet) → 24px (desktop) */}
<h3>Заголовок H3</h3>  {/* 18px (mobile) → 20px (tablet) → 20px (desktop) */}
<p>Параграф</p>        {/* 16px (mobile) → 18px (tablet) → 20px (desktop) */}
```

### Специальные эффекты

```tsx
// Glassmorphism
<div className="glass rounded-xl p-6">
  <p>Эффект стекла</p>
</div>

// Усечение текста
<p className="truncate-2">
  Длинный текст, который будет обрезан после двух строк...
</p>

// Плавный переход темы
<div className="theme-transition bg-background">
  Контент с плавным переходом
</div>
```

---

## 🌓 Переключение темы

### 1. Создайте хук для управления темой

```tsx
// hooks/useTheme.ts
'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Читаем сохранённую тему из localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    
    if (newTheme === 'system') {
      // Используем системную тему
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
      html.classList.toggle('dark', systemTheme === 'dark');
    } else {
      html.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, setTheme: (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  }, toggleTheme };
}
```

### 2. Создайте компонент переключателя темы

```tsx
// components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-secondary"
      aria-label="Переключить тему"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### 3. Используйте в компоненте

```tsx
// app/layout.tsx или любой компонент
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <header>
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
```

---

## ➕ Добавление новой темы

### Шаг 1: Добавьте палитру в `tailwind.config.ts`

```typescript
// frontend/tailwind.config.ts

// Новая палитра (например, "синяя")
const bluePalette = {
  background: {
    primary: '#EBF5FF',
    secondary: '#DBEAFE',
    tertiary: '#F0F9FF',
    card: '#FFFFFF',
    overlay: 'rgba(30, 64, 175, 0.7)',
    gradient: {
      main: 'linear-gradient(to top, #DBEAFE, #FFFFFF)',
      card: 'linear-gradient(to bottom, #BFDBFE, #93C5FD)',
      banner: 'linear-gradient(to bottom, #EFF6FF, #DBEAFE)',
    },
  },
  text: {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    tertiary: '#60A5FA',
    inverse: '#FFFFFF',
    disabled: '#CBD5E1',
    link: '#2563EB',
  },
  accent: {
    primary: '#2563EB',
    secondary: '#3B82F6',
    tertiary: '#93C5FD',
    hover: '#1D4ED8',
    active: '#1E40AF',
  },
  // ... остальные категории
};

export const colorPalettes = {
  light: lightPalette,
  dark: darkPalette,
  blue: bluePalette, // Добавляем новую тему
};
```

### Шаг 2: Добавьте CSS-переменные в `globals.css`

```css
/* frontend/app/globals.css */

.blue-theme {
  /* Фоны */
  --color-background-primary: #EBF5FF;
  --color-background-secondary: #DBEAFE;
  --color-background-tertiary: #F0F9FF;
  --color-background-card: #FFFFFF;
  --color-background-overlay: rgba(30, 64, 175, 0.7);
  
  /* Градиенты */
  --gradient-main: linear-gradient(to top, #DBEAFE, #FFFFFF);
  --gradient-card: linear-gradient(to bottom, #BFDBFE, #93C5FD);
  --gradient-banner: linear-gradient(to bottom, #EFF6FF, #DBEAFE);
  
  /* Текст */
  --color-text-primary: #1E3A8A;
  --color-text-secondary: #3B82F6;
  --color-text-tertiary: #60A5FA;
  --color-text-inverse: #FFFFFF;
  --color-text-disabled: #CBD5E1;
  --color-text-link: #2563EB;
  
  /* Акценты */
  --color-accent-primary: #2563EB;
  --color-accent-secondary: #3B82F6;
  --color-accent-tertiary: #93C5FD;
  --color-accent-hover: #1D4ED8;
  --color-accent-active: #1E40AF;
  
  /* ... остальные категории */
}
```

### Шаг 3: Обновите хук `useTheme`

```typescript
// hooks/useTheme.ts
type Theme = 'light' | 'dark' | 'blue' | 'system';

const applyTheme = (newTheme: Theme) => {
  const html = document.documentElement;
  
  // Убираем все классы тем
  html.classList.remove('dark', 'blue-theme');
  
  if (newTheme === 'dark') {
    html.classList.add('dark');
  } else if (newTheme === 'blue') {
    html.classList.add('blue-theme');
  }
  // 'light' и 'system' используют стандартные переменные
  
  localStorage.setItem('theme', newTheme);
};
```

### Шаг 4: Обновите переключатель тем

```tsx
// components/ThemeSelector.tsx
'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`btn-secondary ${theme === 'light' ? 'bg-accent-primary text-text-inverse' : ''}`}
      >
        ☀️ Светлая
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`btn-secondary ${theme === 'dark' ? 'bg-accent-primary text-text-inverse' : ''}`}
      >
        🌙 Тёмная
      </button>
      <button
        onClick={() => setTheme('blue')}
        className={`btn-secondary ${theme === 'blue' ? 'bg-accent-primary text-text-inverse' : ''}`}
      >
        🌊 Синяя
      </button>
    </div>
  );
}
```

---

## 📚 Дополнительные ресурсы

### Утилиты CSS

```css
/* Анимации */
.animate-in           /* Появление сверху */
.animate-slideInFromLeft  /* Появление слева */
.animate-slideInFromRight /* Появление справа */
.animate-fadeIn       /* Плавное появление */

/* Скроллбар */
.scrollbar-hide       /* Скрыть скроллбар */
.scrollbar-custom     /* Кастомный скроллбар */

/* Текст */
.truncate-1           /* Обрезать до 1 строки */
.truncate-2           /* Обрезать до 2 строк */
.truncate-3           /* Обрезать до 3 строк */
.text-gradient        /* Градиентный текст */

/* Эффекты */
.glass                /* Glassmorphism эффект */
.theme-transition     /* Плавный переход темы */
```

### Breakpoints

```tsx
// Mobile: < 768px
<div className="mobile:p-4">

// Tablet: 768px - 1023px
<div className="tablet:p-6">

// Desktop: >= 1024px
<div className="desktop:p-8">

// Или стандартные Tailwind:
// sm: 640-767px
// md: 768-1023px
// lg: 1024-1279px
// xl: 1280-1535px
// 2xl: >= 1536px
```

---

## 🎓 Лучшие практики

1. **Всегда используйте семантические названия** - `bg-background`, а не `bg-white`
2. **Не хардкодьте цвета** - используйте CSS-переменные или Tailwind-классы
3. **Тестируйте в обеих темах** - убедитесь, что компоненты выглядят хорошо в светлой и тёмной теме
4. **Используйте готовые компоненты** - `.btn-primary`, `.card`, `.input` и т.д.
5. **Проверяйте контраст** - используйте инструменты для проверки доступности (WCAG AA: 4.5:1)
6. **Добавляйте переходы** - используйте `transition-colors` для плавной анимации

---

## 🔧 Troubleshooting

### Тема не переключается

```tsx
// Убедитесь, что класс .dark применяется к <html>
// Проверьте в DevTools: <html class="dark">

// Проверьте, что хук useTheme вызывается в клиентском компоненте
'use client'; // Добавьте директиву

import { useTheme } from '@/hooks/useTheme';
```

### Цвета не применяются

```tsx
// Убедитесь, что CSS-переменные определены в globals.css
// и что файл импортирован в layout.tsx

// app/layout.tsx
import './globals.css'; // ОБЯЗАТЕЛЬНО
```

### Tailwind классы не работают

```bash
# Перезапустите dev-сервер
npm run dev

# Очистите кэш Next.js
rm -rf .next
npm run dev
```

---

## 📞 Поддержка

Если у вас возникли вопросы по дизайн-системе:
1. Проверьте примеры в этом файле
2. Изучите `frontend/tailwind.config.ts` и `frontend/app/globals.css`
3. Обратитесь к команде разработки

---

**Последнее обновление:** Декабрь 2025
