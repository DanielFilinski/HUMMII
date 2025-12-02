# 🎨 Typography System

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)

**Универсальная система типографики для React с полной поддержкой адаптивности и тем**

[Документация](#-документация) • [Быстрый старт](#-быстрый-старт) • [Примеры](#-примеры) • [API](#-api)

</div>

---

## ✨ Возможности

- 🎯 **7 вариантов типографики** — h1, h2, h3, body, bodySm, tag, note
- 🎨 **11 семантических цветов** — primary, secondary, accent, error, success и др.
- 📱 **Адаптивность из коробки** — автоматическое масштабирование для mobile/tablet/desktop
- 🌓 **Поддержка тем** — светлая и тёмная тема с автоматическим переключением
- ✂️ **Усечение текста** — с многоточием (1, 2, 3+ строки)
- 🌈 **Градиентный текст** — фирменные градиенты
- 🔤 **Семантическая разметка** — правильные HTML-элементы автоматически
- 📦 **18 готовых компонентов** — Badge, Price, Rating, Label и др.
- 💪 **TypeScript** — полная типизация с подсказками в IDE
- ⚡ **Zero runtime** — только CSS-классы, без JS overhead

---

## 📦 Установка

```bash
# Компонент уже включён в проект
import { Typography } from '@/components/ui/Typography';
```

---

## 🚀 Быстрый старт

### Базовое использование

```tsx
import { Typography } from '@/components/ui';

export function MyComponent() {
  return (
    <div>
      <Typography variant="h1">Главный заголовок</Typography>
      <Typography variant="body" color="secondary">
        Основной текст с второстепенным цветом
      </Typography>
    </div>
  );
}
```

### С дополнительными опциями

```tsx
<Typography 
  variant="h1" 
  gradient 
  align="center"
  className="mb-8"
>
  Заголовок с градиентом
</Typography>

<Typography 
  variant="body" 
  truncate={2}
  color="secondary"
>
  Длинный текст который будет усечён до двух строк...
</Typography>
```

---

## 📚 Документация

| Документ | Описание |
|----------|----------|
| **[TYPOGRAPHY_GUIDE.md](./TYPOGRAPHY_GUIDE.md)** | 📖 Полное руководство с детальным описанием |
| **[TYPOGRAPHY_CHEATSHEET.md](./TYPOGRAPHY_CHEATSHEET.md)** | ⚡ Быстрая справка со сниппетами |
| **[TYPOGRAPHY_MIGRATION.md](./TYPOGRAPHY_MIGRATION.md)** | 🔄 Руководство по миграции старого кода |
| **[Typography.examples.tsx](./Typography.examples.tsx)** | 🧪 Интерактивные примеры использования |

---

## 🎯 Примеры

### Заголовки

```tsx
<Typography variant="h1">Заголовок H1</Typography>
<Typography variant="h2">Заголовок H2</Typography>
<Typography variant="h3">Заголовок H3</Typography>
```

**Адаптивные размеры:**
- H1: 28px → 30px → 36px (mobile → tablet → desktop)
- H2: 22px → 24px → 24px
- H3: 18px → 20px → 20px

### Цвета

```tsx
<Typography color="primary">Основной текст</Typography>
<Typography color="secondary">Второстепенный</Typography>
<Typography color="accent">Зелёный акцент</Typography>
<Typography color="error">Ошибка</Typography>
<Typography color="success">Успех</Typography>
<Typography color="link">Ссылка с hover</Typography>
```

### Усечение текста

```tsx
{/* Одна строка */}
<Typography truncate>
  Очень длинный текст...
</Typography>

{/* Две строки */}
<Typography truncate={2}>
  Длинный текст в две строки...
</Typography>
```

### Градиент

```tsx
<Typography variant="h1" gradient>
  Заголовок с градиентом
</Typography>
```

### Готовые компоненты

```tsx
import { Badge, Price, Rating, Label, ErrorText } from '@/components/ui';

<Badge variant="success">Доступен</Badge>
<Price currency="₽">2000</Price>
<Rating value={4.9} />
<Label htmlFor="email">Email</Label>
<ErrorText>Неверный email</ErrorText>
```

---

## 🎨 Реальные примеры

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
  <input id="email" type="email" className="input" />
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

## 🛠️ API

### Typography Props

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `variant` | `'h1' \| 'h2' \| 'h3' \| 'body' \| 'bodySm' \| 'tag' \| 'note'` | `'body'` | Вариант типографики |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'accent' \| 'error' \| 'success' \| 'warning' \| 'info' \| 'link' \| 'inverse' \| 'disabled'` | `'primary'` | Цвет текста |
| `as` | `ElementType` | auto | HTML-элемент |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | - | Выравнивание |
| `weight` | `'light' \| 'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold'` | auto | Вес шрифта |
| `truncate` | `boolean \| number` | `false` | Усечение (true = 1 строка) |
| `gradient` | `boolean` | `false` | Градиентный текст |
| `className` | `string` | - | Доп. классы |

### Готовые компоненты

- **Heading1, Heading2, Heading3** — заголовки с отступами
- **Badge** — бейдж с вариантами (success, error, warning, info)
- **Price** — цена с валютой
- **Rating** — рейтинг со звездой
- **Label** — лейбл для форм
- **ErrorText** — текст ошибки
- **HelperText** — текст-подсказка
- **Link** — ссылка с hover
- **Status** — статус (online, offline, busy, away)
- **DateTime** — форматированная дата
- **IconText** — текст с иконкой
- **EmptyState** — пустое состояние
- **Counter** — счётчик
- **Breadcrumbs** — хлебные крошки

---

## 📱 Адаптивность

Все размеры автоматически адаптируются:

| Breakpoint | Размер экрана |
|------------|---------------|
| **Mobile** | < 768px |
| **Tablet** | 768px - 1023px |
| **Desktop** | ≥ 1024px |

**Не нужно добавлять responsive-классы вручную!**

---

## 🌓 Темы

Компонент автоматически адаптируется под светлую и тёмную тему:

```tsx
// Переключение темы
import { ThemeToggle } from '@/components/ThemeToggle';

<ThemeToggle />
```

Цвета меняются автоматически через CSS-переменные.

---

## 📊 Сравнение

| Подход | Адаптивность | Темы | Типизация | Усечение |
|--------|--------------|------|-----------|----------|
| **Typography** | ✅ Авто | ✅ Да | ✅ Полная | ✅ Встроено |
| Прямой Tailwind | ❌ Вручную | ❌ Нет | ❌ Нет | ❌ Вручную |
| Прямой HTML | ❌ Нет | ❌ Нет | ❌ Нет | ❌ Нет |

---

## 🎓 Ресурсы

- 📖 [Полное руководство](./TYPOGRAPHY_GUIDE.md) — детальная документация
- ⚡ [Быстрая справка](./TYPOGRAPHY_CHEATSHEET.md) — шпаргалка с примерами
- 🔄 [Миграция](./TYPOGRAPHY_MIGRATION.md) — переход со старого кода
- 🧪 [Примеры](./Typography.examples.tsx) — интерактивные примеры
- 🎨 [Дизайн-система](../../DESIGN_SYSTEM.md) — общая документация

---

## ✅ Best Practices

### ✅ Правильно

```tsx
<Typography variant="h1">Заголовок</Typography>
<Typography color="secondary">Текст</Typography>
<Typography truncate={2}>Усечённый текст</Typography>
```

### ❌ Неправильно

```tsx
<Typography style={{ color: '#000' }}>Текст</Typography>
<Typography className="text-base md:text-lg">Текст</Typography>
```

---

## 🤝 Вклад

Этот компонент является частью дизайн-системы Hummii. При внесении изменений:

1. Следуйте существующим patterns
2. Обновляйте документацию
3. Добавляйте примеры использования
4. Проверяйте адаптивность и темы
5. Проверяйте TypeScript типы

---

## 📄 Лицензия

Часть проекта Hummii

---

<div align="center">

**Создано с ❤️ для проекта Hummii**

[⬆ Наверх](#-typography-system)

</div>
