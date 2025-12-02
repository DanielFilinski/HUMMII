# 📝 Typography - Краткая справка

## Быстрый старт

```tsx
import { Typography } from '@/components/ui/Typography';

<Typography variant="h1">Заголовок</Typography>
<Typography variant="body" color="secondary">Текст</Typography>
```

## Варианты (variant)

| Вариант | Размер | Вес | Использование |
|---------|--------|-----|---------------|
| `h1` | 28-36px | Bold | Главный заголовок страницы |
| `h2` | 22-24px | Semibold | Подзаголовок секции |
| `h3` | 18-20px | Medium | Заголовок блока/карточки |
| `body` | 16-20px | Regular | Основной текст |
| `bodySm` | 14-16px | Regular | Мелкий текст, метаданные |
| `tag` | 14-16px | Extrabold | Теги, метки |
| `note` | 12-14px | Regular | Примечания, сноски |

## Цвета (color)

```tsx
<Typography color="primary">Основной текст</Typography>
<Typography color="secondary">Второстепенный</Typography>
<Typography color="tertiary">Неактивный</Typography>
<Typography color="accent">Зелёный акцент</Typography>
<Typography color="error">Ошибка (красный)</Typography>
<Typography color="success">Успех (зелёный)</Typography>
<Typography color="link">Ссылка с hover</Typography>
```

## Часто используемые комбинации

### Заголовок страницы
```tsx
<Typography variant="h1" gradient>
  Найдите лучших специалистов
</Typography>
```

### Заголовок секции
```tsx
<Typography variant="h2" className="mb-6">
  Популярные категории
</Typography>
```

### Имя специалиста
```tsx
<Typography variant="h3">Иван Петров</Typography>
```

### Описание
```tsx
<Typography variant="body" truncate={2}>
  Длинное описание которое будет усечено...
</Typography>
```

### Метаданные
```tsx
<Typography variant="bodySm" color="secondary">
  Стаж 5 лет • ⭐ 4.9 (127 отзывов)
</Typography>
```

### Цена
```tsx
<Typography variant="body" color="accent" weight="semibold">
  от 2000 ₽/час
</Typography>
```

### Тег категории
```tsx
<Typography 
  variant="tag" 
  className="px-3 py-1 bg-accent-primary text-text-inverse rounded-full"
>
  Сантехник
</Typography>
```

### Текст ошибки
```tsx
<Typography variant="note" color="error">
  Пожалуйста, введите корректный email
</Typography>
```

### Примечание
```tsx
<Typography variant="note" color="tertiary">
  * Минимальный заказ 2 часа
</Typography>
```

### Ссылка
```tsx
<Typography as="a" href="/profile" color="link">
  Перейти в профиль
</Typography>
```

## Опции

### Выравнивание
```tsx
<Typography align="center">По центру</Typography>
<Typography align="right">По правому краю</Typography>
```

### Вес шрифта
```tsx
<Typography weight="bold">Жирный текст</Typography>
<Typography weight="light">Лёгкий текст</Typography>
```

### Усечение текста
```tsx
<Typography truncate>Одна строка с ...</Typography>
<Typography truncate={2}>Две строки с ...</Typography>
<Typography truncate={3}>Три строки с ...</Typography>
```

### Градиент
```tsx
<Typography variant="h1" gradient>
  Текст с градиентом
</Typography>
```

### Кастомный элемент
```tsx
<Typography as="div" variant="body">
  Параграф в div
</Typography>
```

## Готовые компоненты-утилиты

```tsx
import { 
  Heading1, Heading2, Heading3,
  Badge, Price, Rating,
  ErrorText, HelperText,
  Link, Label
} from '@/components/ui/typography-utils';

// Заголовок с автоматическим отступом
<Heading1>Заголовок</Heading1>

// Бейдж
<Badge variant="success">Активен</Badge>
<Badge variant="error">Ошибка</Badge>

// Цена с валютой
<Price currency="₽">2000</Price>

// Рейтинг
<Rating value={4.9} />

// Текст ошибки с отступом
<ErrorText>Неверный email</ErrorText>

// Подсказка с отступом
<HelperText>Введите email для регистрации</HelperText>

// Ссылка с hover
<Link href="/about">О нас</Link>

// Лейбл формы
<Label htmlFor="email">Email</Label>
```

## Адаптивность

Все размеры автоматически адаптируются:

- **Mobile** (< 768px): минимальные размеры
- **Tablet** (768-1023px): средние размеры
- **Desktop** (≥ 1024px): максимальные размеры

**Не нужно добавлять responsive-классы вручную!**

## Темы

Цвета автоматически меняются при переключении темы:

```tsx
// Добавьте ThemeToggle в хедер
import { ThemeToggle } from '@/components/ThemeToggle';

<ThemeToggle />
```

Все цвета текста адаптируются под светлую/тёмную тему автоматически.

## Примеры из реальной практики

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
    <Typography variant="note" color="tertiary">
      /час
    </Typography>
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

## Полная документация

См. `TYPOGRAPHY_GUIDE.md` для подробного руководства.

## Примеры

См. `Typography.examples.tsx` для интерактивных примеров всех возможностей компонента.
