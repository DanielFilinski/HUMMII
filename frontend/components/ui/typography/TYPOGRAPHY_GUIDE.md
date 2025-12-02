# 📝 Typography Component - Руководство по использованию

Универсальный компонент для работы с типографикой в дизайн-системе Hummii.

---

## 🎯 Основные возможности

✅ **Адаптивность** - автоматическое масштабирование для mobile/tablet/desktop  
✅ **Семантическая разметка** - правильные HTML-элементы (h1, h2, h3, p)  
✅ **Интеграция с дизайн-системой** - использует палитру цветов и CSS-переменные  
✅ **Поддержка тем** - автоматическое переключение светлой/тёмной темы  
✅ **TypeScript** - полная типизация с подсказками  
✅ **Гибкость** - множество опций для кастомизации  

---

## 📦 Установка и импорт

```tsx
import { Typography } from '@/components/ui/Typography';

// Использование
<Typography variant="h1">Заголовок</Typography>
```

---

## 🎨 Варианты типографики (variant)

### Заголовки

#### `h1` - Главный заголовок страницы
- **Размеры:** 28px (mobile) → 30px (tablet) → 36px (desktop)
- **Вес:** Bold (700)
- **Использование:** Главный заголовок страницы, hero-секции

```tsx
<Typography variant="h1">
  Найдите лучших специалистов
</Typography>
```

#### `h2` - Подзаголовок секции
- **Размеры:** 22px (mobile) → 24px (tablet) → 24px (desktop)
- **Вес:** Semibold (600)
- **Использование:** Заголовки основных секций, категорий

```tsx
<Typography variant="h2">
  Популярные категории
</Typography>
```

#### `h3` - Подзаголовок блока
- **Размеры:** 18px (mobile) → 20px (tablet) → 20px (desktop)
- **Вес:** Medium (500)
- **Использование:** Заголовки карточек, имена специалистов

```tsx
<Typography variant="h3">
  Иван Петров - Сантехник
</Typography>
```

---

### Основной текст

#### `body` - Основной текст
- **Размеры:** 16px (mobile) → 18px (tablet) → 20px (desktop)
- **Вес:** Regular (400)
- **Использование:** Параграфы, описания, основной контент

```tsx
<Typography variant="body">
  Это основной текст для описаний и контента.
</Typography>
```

#### `bodySm` - Мелкий текст
- **Размеры:** 14px (mobile) → 16px (tablet) → 16px (desktop)
- **Вес:** Regular (400)
- **Использование:** Дополнительная информация, метаданные, подписи

```tsx
<Typography variant="bodySm" color="secondary">
  Стаж 5 лет • ⭐ 4.9 (127 отзывов)
</Typography>
```

---

### Специальные

#### `tag` - Тег/метка
- **Размеры:** 14px (mobile) → 16px (tablet) → 16px (desktop)
- **Вес:** Extrabold (800)
- **Использование:** Теги, метки, категории

```tsx
<Typography variant="tag" className="px-3 py-1 bg-accent-primary text-text-inverse rounded-full">
  Сантехник
</Typography>
```

#### `note` - Примечание
- **Размеры:** 12px (mobile) → 16px (tablet) → 14px (desktop)
- **Вес:** Regular (400)
- **Использование:** Мелкие примечания, пояснения, сноски

```tsx
<Typography variant="note" color="tertiary">
  * Минимальный заказ 2 часа
</Typography>
```

---

## 🎨 Цвета текста (color)

### Основные цвета

| Цвет | Описание | Светлая тема | Тёмная тема |
|------|----------|--------------|-------------|
| `primary` | Основной текст | `#2A2A0F` | `#F9FAFB` |
| `secondary` | Второстепенный | `#819082` | `#9CA3AF` |
| `tertiary` | Неактивный | `#96A996` | `#6B7280` |
| `inverse` | Инверсный | `#FFFFFF` | `#0F1419` |
| `disabled` | Отключённый | `#DBDBDB` | `#4B5563` |

### Акценты и ссылки

| Цвет | Описание | Цвет |
|------|----------|------|
| `accent` | Акцентный | Зелёный `#3A971E` / `#67AD51` |
| `link` | Ссылки | Зелёный с hover-эффектом |

### Статусы (feedback)

| Цвет | Описание | Использование |
|------|----------|---------------|
| `error` | Ошибка | Сообщения об ошибках, валидация |
| `success` | Успех | Подтверждения, успешные действия |
| `warning` | Предупреждение | Важные уведомления |
| `info` | Информация | Подсказки, советы |

### Примеры использования цветов

```tsx
// Основной текст
<Typography color="primary">Основной текст</Typography>

// Второстепенная информация
<Typography color="secondary">Дополнительная информация</Typography>

// Ссылка с hover-эффектом
<Typography as="a" href="#" color="link">Кликабельная ссылка</Typography>

// Ошибка валидации
<Typography variant="note" color="error">
  Пожалуйста, введите корректный email
</Typography>

// Акцентный текст
<Typography color="accent" weight="semibold">
  от 2000 ₽/час
</Typography>
```

---

## ⚙️ Дополнительные опции

### `as` - HTML-элемент

По умолчанию компонент выбирает подходящий элемент автоматически:
- `h1` → `<h1>`
- `h2` → `<h2>`
- `h3` → `<h3>`
- `body`, `bodySm`, `note` → `<p>`
- `tag` → `<span>`

Но вы можете переопределить:

```tsx
// Использовать div вместо p
<Typography as="div" variant="body">Контент</Typography>

// Использовать span вместо h3
<Typography as="span" variant="h3">Заголовок</Typography>

// Сделать ссылку
<Typography as="a" href="/profile" color="link">Профиль</Typography>

// Использовать кастомный компонент Next.js
import Link from 'next/link';
<Typography as={Link} href="/about" color="link">О нас</Typography>
```

---

### `align` - Выравнивание текста

```tsx
<Typography align="left">По левому краю (по умолчанию)</Typography>
<Typography align="center">По центру</Typography>
<Typography align="right">По правому краю</Typography>
<Typography align="justify">По ширине</Typography>
```

---

### `weight` - Вес шрифта

Переопределяет стандартный вес для варианта:

```tsx
<Typography weight="light">Light (300)</Typography>
<Typography weight="regular">Regular (400)</Typography>
<Typography weight="medium">Medium (500)</Typography>
<Typography weight="semibold">Semibold (600)</Typography>
<Typography weight="bold">Bold (700)</Typography>
<Typography weight="extrabold">Extrabold (800)</Typography>
```

**Пример:** Сделать body-текст жирным:

```tsx
<Typography variant="body" weight="bold">
  Важный текст
</Typography>
```

---

### `truncate` - Усечение текста с многоточием

#### Одна строка

```tsx
<Typography truncate>
  Очень длинный текст который будет усечён...
</Typography>
```

#### Несколько строк

```tsx
<Typography truncate={2}>
  Текст который будет показан в две строки максимум...
</Typography>

<Typography truncate={3}>
  Текст который будет показан в три строки максимум...
</Typography>
```

**⚠️ Примечание:** Для многострочного усечения (`truncate={2}`) необходимо, чтобы в Tailwind CSS был доступен класс `line-clamp-{n}`. Убедитесь, что у вас установлен плагин `@tailwindcss/line-clamp` или используется Tailwind v3.3+.

---

### `gradient` - Градиентный текст

Применяет фирменный градиент к тексту (зелёный → светло-зелёный):

```tsx
<Typography variant="h1" gradient>
  Заголовок с градиентом
</Typography>

<Typography variant="h2" gradient>
  Подзаголовок с градиентом
</Typography>
```

**⚠️ Примечание:** При использовании `gradient={true}` параметр `color` игнорируется.

---

## 🎯 Реальные примеры использования

### 1. Карточка специалиста

```tsx
<div className="p-6 bg-background-card rounded-lg shadow-card space-y-3">
  {/* Заголовок и статус */}
  <div className="flex items-center justify-between">
    <Typography variant="h3">Иван Петров</Typography>
    <Typography 
      variant="tag" 
      className="px-3 py-1 bg-feedback-success/10 text-feedback-success rounded-full"
    >
      Доступен
    </Typography>
  </div>
  
  {/* Метаданные */}
  <Typography variant="bodySm" color="secondary">
    Сантехник • Стаж 5 лет • ⭐ 4.9 (127 отзывов)
  </Typography>
  
  {/* Описание с усечением */}
  <Typography variant="body" truncate={2}>
    Профессиональный сантехник с большим опытом работы. 
    Выполняю все виды сантехнических работ: установка, ремонт, замена.
  </Typography>
  
  {/* Цена */}
  <div className="flex items-center gap-2 pt-2">
    <Typography variant="body" color="accent" weight="semibold">
      от 2000 ₽/час
    </Typography>
    <Typography variant="note" color="tertiary">
      • Минимальный заказ 2 часа
    </Typography>
  </div>
</div>
```

---

### 2. Форма с валидацией

```tsx
<div className="space-y-2">
  {/* Лейбл */}
  <label htmlFor="email">
    <Typography variant="bodySm" weight="medium">
      Email
    </Typography>
  </label>
  
  {/* Инпут с ошибкой */}
  <input
    id="email"
    type="email"
    className="w-full px-4 py-2 border border-border-error rounded-lg"
    placeholder="example@email.com"
  />
  
  {/* Сообщение об ошибке */}
  <Typography variant="note" color="error">
    Пожалуйста, введите корректный email-адрес
  </Typography>
</div>
```

---

### 3. Уведомление

```tsx
<div className="p-4 bg-feedback-info/10 border-l-4 border-feedback-info rounded">
  <Typography variant="bodySm" color="info" weight="semibold" className="mb-1">
    💡 Совет
  </Typography>
  <Typography variant="bodySm">
    Добавьте фотографии ваших работ, чтобы получать больше заказов
  </Typography>
</div>
```

---

### 4. Hero-секция с градиентом

```tsx
<section className="text-center py-16">
  <Typography variant="h1" gradient className="mb-4">
    Найдите лучших специалистов
  </Typography>
  <Typography variant="body" color="secondary" className="max-w-2xl mx-auto">
    Hummii соединяет вас с проверенными профессионалами для любых задач
  </Typography>
</section>
```

---

### 5. Список с иконками

```tsx
<ul className="space-y-3">
  <li className="flex items-start gap-3">
    <span className="text-accent-primary">✓</span>
    <Typography variant="body">Проверенные специалисты</Typography>
  </li>
  <li className="flex items-start gap-3">
    <span className="text-accent-primary">✓</span>
    <Typography variant="body">Безопасные платежи</Typography>
  </li>
  <li className="flex items-start gap-3">
    <span className="text-accent-primary">✓</span>
    <Typography variant="body">Гарантия качества</Typography>
  </li>
</ul>
```

---

### 6. Теги категорий

```tsx
<div className="flex flex-wrap gap-2">
  {['Сантехник', 'Электрик', 'Уборка', 'Ремонт'].map((category) => (
    <Typography
      key={category}
      variant="tag"
      className="px-3 py-1 bg-background-secondary text-accent-primary rounded-full cursor-pointer hover:bg-accent-primary hover:text-text-inverse transition-colors"
    >
      {category}
    </Typography>
  ))}
</div>
```

---

## 📱 Адаптивность

Все варианты типографики автоматически адаптируются под размер экрана:

| Variant | Mobile (< 768px) | Tablet (768-1023px) | Desktop (≥ 1024px) |
|---------|------------------|---------------------|-------------------|
| h1 | 28px / bold | 30px / bold | 36px / bold |
| h2 | 22px / semibold | 24px / semibold | 24px / semibold |
| h3 | 18px / medium | 20px / medium | 20px / medium |
| body | 16px / regular | 18px / regular | 20px / regular |
| bodySm | 14px / regular | 16px / regular | 16px / regular |
| tag | 14px / extrabold | 16px / extrabold | 16px / extrabold |
| note | 12px / regular | 16px / regular | 14px / regular |

**Не нужно вручную добавлять responsive-классы** - всё работает автоматически! 🎉

---

## 🎨 Интеграция с дизайн-системой

Компонент полностью интегрирован с дизайн-системой:

### Цвета через CSS-переменные

Все цвета используют CSS-переменные из `globals.css`:

```css
/* Светлая тема */
:root {
  --color-text-primary: #2A2A0F;
  --color-text-secondary: #819082;
  /* ... */
}

/* Тёмная тема */
.dark {
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  /* ... */
}
```

### Автоматическое переключение темы

При добавлении класса `.dark` на элемент `<html>`, все цвета автоматически меняются:

```tsx
// Этот текст будет тёмным в светлой теме и светлым в тёмной
<Typography color="primary">Адаптивный текст</Typography>
```

### Использование с ThemeToggle

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Typography variant="h3">Hummii</Typography>
      <ThemeToggle /> {/* Кнопка переключения темы */}
    </header>
  );
}
```

---

## 🛠️ TypeScript

Компонент полностью типизирован:

```tsx
import { type TypographyProps } from '@/components/ui/Typography';

// Все пропсы типизированы
const props: TypographyProps = {
  variant: 'h1',
  color: 'primary',
  align: 'center',
  weight: 'bold',
  truncate: true,
  gradient: false,
};

// TypeScript подскажет доступные значения
<Typography 
  variant="h1" // 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'tag' | 'note'
  color="primary" // 'primary' | 'secondary' | 'tertiary' | ...
/>
```

---

## ✅ Лучшие практики

### ✅ Правильно

```tsx
// Используйте семантические HTML-элементы (автоматически)
<Typography variant="h1">Заголовок</Typography> {/* <h1> */}

// Используйте цвета из палитры
<Typography color="secondary">Текст</Typography>

// Используйте адаптивные варианты
<Typography variant="body">Контент</Typography>

// Усекайте длинный текст
<Typography truncate={2}>Длинное описание...</Typography>
```

### ❌ Неправильно

```tsx
// НЕ используйте прямые цвета в стилях
<Typography style={{ color: '#2A2A0F' }}>Текст</Typography>

// НЕ добавляйте inline стили для размера шрифта
<Typography style={{ fontSize: '20px' }}>Текст</Typography>

// НЕ дублируйте responsive-классы
<Typography className="text-base md:text-lg lg:text-xl">
  Текст
</Typography>

// НЕ используйте div для заголовков без необходимости
<Typography as="div" variant="h1">Заголовок</Typography>
```

---

## 🔧 Расширение компонента

Если вам нужны дополнительные стили, используйте `className`:

```tsx
<Typography 
  variant="body" 
  className="mb-4 max-w-prose leading-relaxed"
>
  Кастомизированный текст
</Typography>
```

Можно также комбинировать с Tailwind-классами:

```tsx
<Typography 
  variant="h2" 
  className="mb-8 pb-4 border-b border-border-primary"
>
  Заголовок с границей
</Typography>
```

---

## 📊 Сравнение с альтернативами

| Подход | Преимущества | Недостатки |
|--------|--------------|------------|
| **Typography компонент** | ✅ Адаптивность из коробки<br>✅ Типизация<br>✅ Семантика<br>✅ Интеграция с темой | Нужно импортировать |
| Прямые Tailwind-классы | Быстро писать | ❌ Нет адаптивности<br>❌ Дублирование кода<br>❌ Нет типизации |
| Прямые HTML-элементы | Минимум кода | ❌ Нет стилей<br>❌ Нужно каждый раз добавлять классы |

**Рекомендация:** Используйте `<Typography>` для всего текстового контента в проекте.

---

## 🧪 Тестирование

Компонент можно легко тестировать:

```tsx
import { render, screen } from '@testing-library/react';
import { Typography } from '@/components/ui/Typography';

describe('Typography', () => {
  it('renders correct variant', () => {
    render(<Typography variant="h1">Заголовок</Typography>);
    const heading = screen.getByText('Заголовок');
    expect(heading.tagName).toBe('H1');
  });

  it('applies correct color', () => {
    render(<Typography color="error">Ошибка</Typography>);
    const text = screen.getByText('Ошибка');
    expect(text).toHaveClass('text-feedback-error');
  });
});
```

---

## 📚 Дополнительные ресурсы

- **Примеры использования:** `components/ui/Typography.examples.tsx`
- **Design tokens:** `components/ui/design-tokens.ts`
- **Tailwind config:** `tailwind.config.ts`
- **Глобальные стили:** `app/globals.css`
- **Дизайн-система:** `frontend/DESIGN_SYSTEM.md`

---

## 🎓 Шпаргалка

```tsx
import { Typography } from '@/components/ui/Typography';

// Заголовки
<Typography variant="h1">Главный заголовок</Typography>
<Typography variant="h2">Подзаголовок</Typography>
<Typography variant="h3">Заголовок блока</Typography>

// Текст
<Typography variant="body">Основной текст</Typography>
<Typography variant="bodySm">Мелкий текст</Typography>
<Typography variant="note">Примечание</Typography>

// Теги
<Typography variant="tag">Тег</Typography>

// Цвета
<Typography color="primary">Основной</Typography>
<Typography color="secondary">Второстепенный</Typography>
<Typography color="accent">Акцент</Typography>
<Typography color="error">Ошибка</Typography>

// Опции
<Typography align="center">По центру</Typography>
<Typography weight="bold">Жирный</Typography>
<Typography truncate>Усечение...</Typography>
<Typography truncate={2}>Две строки...</Typography>
<Typography gradient>Градиент</Typography>

// Кастомизация
<Typography as="a" href="#" color="link">Ссылка</Typography>
<Typography className="mb-4">С отступом</Typography>
```

---

**Готово! 🎉** Теперь у вас есть полное руководство по использованию компонента Typography.

Если у вас остались вопросы, смотрите примеры в `Typography.examples.tsx` или обратитесь к дизайн-системе.
