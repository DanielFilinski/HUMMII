# 🎨 Typography System

Универсальная система типографики для проекта Hummii с полной поддержкой адаптивности, тем и интеграцией с дизайн-системой.

## 📚 Документация

### 📖 Полное руководство
**[TYPOGRAPHY_GUIDE.md](./TYPOGRAPHY_GUIDE.md)** - Подробное руководство с описанием всех возможностей, примерами использования и best practices.

### ⚡ Быстрая справка
**[TYPOGRAPHY_CHEATSHEET.md](./TYPOGRAPHY_CHEATSHEET.md)** - Краткая шпаргалка с самыми часто используемыми примерами.

### 🧪 Интерактивные примеры
**[Typography.examples.tsx](./Typography.examples.tsx)** - Живые примеры всех возможностей компонента.

---

## 🚀 Быстрый старт

### Установка

```tsx
import { Typography } from '@/components/ui/Typography';
// или
import { Typography } from '@/components/ui';
```

### Базовое использование

```tsx
// Заголовки
<Typography variant="h1">Главный заголовок</Typography>
<Typography variant="h2">Подзаголовок</Typography>
<Typography variant="h3">Заголовок блока</Typography>

// Текст
<Typography variant="body">Основной текст</Typography>
<Typography variant="bodySm" color="secondary">Мелкий текст</Typography>

// Специальные
<Typography variant="tag">Тег</Typography>
<Typography variant="note" color="tertiary">Примечание</Typography>
```

---

## ✨ Основные возможности

### ✅ Адаптивность из коробки

Размеры текста автоматически масштабируются для разных устройств:

```tsx
<Typography variant="h1">
  {/* 28px (mobile) → 30px (tablet) → 36px (desktop) */}
  Адаптивный заголовок
</Typography>
```

### ✅ Поддержка светлой и тёмной темы

Цвета автоматически переключаются:

```tsx
<Typography color="primary">
  {/* Тёмный в светлой теме, светлый в тёмной теме */}
  Автоматическая адаптация
</Typography>
```

### ✅ Семантическая разметка

Правильные HTML-элементы выбираются автоматически:

```tsx
<Typography variant="h1">  {/* <h1> */}
<Typography variant="body"> {/* <p> */}
<Typography variant="tag">  {/* <span> */}
```

### ✅ Богатая палитра цветов

```tsx
<Typography color="primary">Основной</Typography>
<Typography color="secondary">Второстепенный</Typography>
<Typography color="accent">Акцент</Typography>
<Typography color="error">Ошибка</Typography>
<Typography color="success">Успех</Typography>
<Typography color="link">Ссылка</Typography>
```

### ✅ Усечение текста

```tsx
<Typography truncate>Одна строка с ...</Typography>
<Typography truncate={2}>Две строки с ...</Typography>
<Typography truncate={3}>Три строки с ...</Typography>
```

### ✅ Градиентный текст

```tsx
<Typography variant="h1" gradient>
  Текст с градиентом
</Typography>
```

---

## 🎯 Готовые компоненты-утилиты

Для удобства предоставляются готовые компоненты для типичных задач:

```tsx
import { 
  Heading1,      // Заголовок H1 с отступом
  Badge,         // Бейдж/тег
  Price,         // Цена с валютой
  Rating,        // Рейтинг со звездой
  ErrorText,     // Текст ошибки
  HelperText,    // Подсказка
  Link,          // Ссылка с hover
  Label,         // Лейбл формы
  EmptyState,    // Пустое состояние
} from '@/components/ui';

// Использование
<Heading1>Заголовок с автоматическим отступом</Heading1>
<Badge variant="success">Активен</Badge>
<Price currency="₽">2000</Price>
<Rating value={4.9} />
<ErrorText>Неверный email</ErrorText>
<Link href="/about">О нас</Link>
```

---

## 📦 Структура файлов

```
components/ui/
├── Typography.tsx              # Основной компонент
├── Typography.examples.tsx     # Интерактивные примеры
├── typography-utils.tsx        # Готовые компоненты-утилиты
├── TYPOGRAPHY_GUIDE.md         # Полное руководство
├── TYPOGRAPHY_CHEATSHEET.md    # Быстрая справка
└── typography/
    └── index.ts                # Экспорт всех компонентов
```

---

## 🎨 Интеграция с дизайн-системой

Компонент полностью интегрирован с дизайн-системой проекта:

### Цвета
Все цвета используют CSS-переменные из `globals.css`:
- `--color-text-primary`
- `--color-text-secondary`
- `--color-accent-primary`
- и т.д.

### Размеры шрифтов
Размеры определены в `tailwind.config.ts`:
- `text-mobile-h1`, `text-tablet-h1`, `text-desktop-h1`
- `text-mobile-body`, `text-tablet-body`, `text-desktop-body`
- и т.д.

### Design Tokens
Используются токены из `design-tokens.ts`:
```tsx
export const typography = {
  h1: 'text-mobile-h1 md:text-tablet-h1 lg:text-desktop-h1',
  h2: 'text-mobile-h2 md:text-tablet-h2 lg:text-desktop-h2',
  // ...
};
```

---

## 📱 Адаптивность

### Breakpoints

| Название | Диапазон |
|----------|----------|
| Mobile | < 768px |
| Tablet | 768px - 1023px |
| Desktop | ≥ 1024px |

### Размеры для каждого варианта

| Variant | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| h1 | 28px | 30px | 36px |
| h2 | 22px | 24px | 24px |
| h3 | 18px | 20px | 20px |
| body | 16px | 18px | 20px |
| bodySm | 14px | 16px | 16px |
| tag | 14px | 16px | 16px |
| note | 12px | 16px | 14px |

**Все размеры адаптируются автоматически!** Не нужно добавлять responsive-классы вручную.

---

## 🌈 Поддержка тем

### Светлая тема (по умолчанию)

```css
:root {
  --color-text-primary: #2A2A0F;    /* Тёмный */
  --color-text-secondary: #819082;  /* Серый */
  --color-accent-primary: #3A971E;  /* Зелёный */
}
```

### Тёмная тема

```css
.dark {
  --color-text-primary: #F9FAFB;    /* Светлый */
  --color-text-secondary: #9CA3AF;  /* Светло-серый */
  --color-accent-primary: #67AD51;  /* Светло-зелёный */
}
```

### Переключение темы

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header>
      <Typography variant="h3">Hummii</Typography>
      <ThemeToggle />
    </header>
  );
}
```

---

## 🧪 Примеры использования

### Карточка специалиста

```tsx
<div className="p-6 bg-background-card rounded-lg shadow-card">
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

### Форма с валидацией

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <input 
    id="email" 
    type="email" 
    className="w-full px-4 py-2 border rounded-lg"
  />
  <ErrorText>Пожалуйста, введите корректный email</ErrorText>
</div>
```

### Hero-секция

```tsx
<section className="text-center py-16">
  <Typography variant="h1" gradient className="mb-4">
    Найдите лучших специалистов
  </Typography>
  <Typography variant="body" color="secondary" className="max-w-2xl mx-auto">
    Hummii соединяет вас с проверенными профессионалами
  </Typography>
</section>
```

---

## 📖 API Reference

### Typography Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `variant` | `'h1' \| 'h2' \| 'h3' \| 'body' \| 'bodySm' \| 'tag' \| 'note'` | `'body'` | Вариант типографики |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'accent' \| 'error' \| 'success' \| 'warning' \| 'info' \| 'link' \| 'inverse' \| 'disabled'` | `'primary'` | Цвет текста |
| `as` | `ElementType` | Зависит от `variant` | HTML-элемент или компонент |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `undefined` | Выравнивание текста |
| `weight` | `'light' \| 'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold'` | Зависит от `variant` | Вес шрифта |
| `truncate` | `boolean \| number` | `false` | Усечение текста (true = 1 строка, number = количество строк) |
| `gradient` | `boolean` | `false` | Применить градиент к тексту |
| `className` | `string` | `undefined` | Дополнительные CSS-классы |

---

## ✅ Best Practices

### ✅ Правильно

```tsx
// Используйте семантические варианты
<Typography variant="h1">Заголовок</Typography>

// Используйте цвета из палитры
<Typography color="secondary">Текст</Typography>

// Усекайте длинный текст
<Typography truncate={2}>Длинное описание...</Typography>

// Используйте готовые компоненты
<Badge variant="success">Активен</Badge>
```

### ❌ Неправильно

```tsx
// НЕ используйте прямые цвета
<Typography style={{ color: '#2A2A0F' }}>Текст</Typography>

// НЕ добавляйте размеры шрифта вручную
<Typography style={{ fontSize: '20px' }}>Текст</Typography>

// НЕ дублируйте responsive-классы
<Typography className="text-base md:text-lg">Текст</Typography>
```

---

## 🔧 TypeScript

Компонент полностью типизирован с подсказками в IDE:

```tsx
import { type TypographyProps } from '@/components/ui/Typography';

const props: TypographyProps = {
  variant: 'h1',      // Автодополнение доступных вариантов
  color: 'primary',   // Автодополнение доступных цветов
  weight: 'bold',     // Автодополнение весов шрифта
};
```

---

## 🎓 Дополнительные ресурсы

- **[Полное руководство](./TYPOGRAPHY_GUIDE.md)** - Детальная документация с примерами
- **[Быстрая справка](./TYPOGRAPHY_CHEATSHEET.md)** - Шпаргалка для быстрого старта
- **[Примеры](./Typography.examples.tsx)** - Интерактивные примеры использования
- **[Дизайн-система](../../DESIGN_SYSTEM.md)** - Общая документация по дизайн-системе

---

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [полное руководство](./TYPOGRAPHY_GUIDE.md)
2. Посмотрите [примеры](./Typography.examples.tsx)
3. Обратитесь к документации [дизайн-системы](../../DESIGN_SYSTEM.md)

---

**Создано с ❤️ для проекта Hummii**
