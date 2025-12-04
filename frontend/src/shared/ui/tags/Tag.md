# Tag Components

Компоненты тегов для отображения статусов задач в проекте Hummii.

## Описание

Компоненты Tag созданы на основе дизайна из макета `Tag task state.jpg` и предназначены для визуального отображения статусов задач в интерфейсе.

## Варианты тегов

### 1. ClaimedTag (Синий)
- **Цвет**: `#4A90E2` (синий)
- **Иконка**: `claim` (рука)
- **Статус**: Задача взята в работу
- **Дефолтный текст**: "Claimed"

### 2. DoneTag (Зелёный)
- **Цвет**: `#7ED321` (зелёный)
- **Иконка**: `order-done` (галочка)
- **Статус**: Задача выполнена
- **Дефолтный текст**: "Done"

### 3. ReviewedTag (Тёмно-зелёный)
- **Цвет**: `#5FB547` (тёмно-зелёный)
- **Иконка**: `order-reviewed` (звёздочка)
- **Статус**: Задача проверена
- **Дефолтный текст**: "Reviewed"

## Размеры

Все компоненты поддерживают 3 размера:

| Размер | Padding | Текст | Иконка | Применение |
|--------|---------|-------|--------|------------|
| `sm`   | 4px 8px | 12px  | 16px   | Компактное отображение, inline в тексте |
| `md`   | 6px 12px| 14px  | 20px   | Стандартное отображение (default) |
| `lg`   | 8px 16px| 16px  | 24px   | Крупное отображение, акцентированные элементы |

## Использование

### Импорт

```tsx
import { Tag, ClaimedTag, DoneTag, ReviewedTag } from '@/src/shared/ui/tags';
```

### Специализированные компоненты (рекомендуется)

Для каждого статуса есть специализированный компонент с предустановленными настройками:

```tsx
// С дефолтным текстом
<ClaimedTag />
<DoneTag />
<ReviewedTag />

// С кастомным текстом
<ClaimedTag label="В работе" />
<DoneTag label="Выполнено" />
<ReviewedTag label="Проверено" />

// С разными размерами
<ClaimedTag size="sm" />
<DoneTag size="md" />
<ReviewedTag size="lg" />
```

### Базовый компонент Tag

Универсальный компонент для более гибкого использования:

```tsx
// Стандартные варианты
<Tag variant="claimed">Claimed</Tag>
<Tag variant="done">Done</Tag>
<Tag variant="reviewed">Reviewed</Tag>

// С кастомной иконкой
<Tag variant="claimed" icon="star">Custom</Tag>

// С дополнительными стилями
<Tag variant="done" className="ml-2">Done</Tag>
```

## Props

### ClaimedTag / DoneTag / ReviewedTag

```typescript
interface TagProps {
  size?: 'sm' | 'md' | 'lg';     // Размер тега (default: 'md')
  label?: string;                 // Текст тега (default: зависит от компонента)
  className?: string;             // Дополнительные CSS классы
  ...HTMLAttributes<HTMLSpanElement> // Стандартные HTML атрибуты span
}
```

### Tag (базовый)

```typescript
interface TagProps {
  variant?: 'claimed' | 'done' | 'reviewed';  // Вариант тега (default: 'claimed')
  size?: 'sm' | 'md' | 'lg';                  // Размер тега (default: 'md')
  icon?: IconName;                             // Кастомная иконка (переопределяет дефолтную)
  children: React.ReactNode;                   // Текст/контент тега
  className?: string;                          // Дополнительные CSS классы
  ...HTMLAttributes<HTMLSpanElement>          // Стандартные HTML атрибуты span
}
```

## Примеры использования

### В списке задач

```tsx
function TaskList({ tasks }) {
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center justify-between p-3 bg-background-card rounded">
          <span>{task.title}</span>
          {task.status === 'claimed' && <ClaimedTag size="sm" />}
          {task.status === 'done' && <DoneTag size="sm" />}
          {task.status === 'reviewed' && <ReviewedTag size="sm" />}
        </div>
      ))}
    </div>
  );
}
```

### В карточках

```tsx
function TaskCard({ task }) {
  return (
    <div className="p-4 bg-background-card rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{task.title}</h3>
        {task.status === 'claimed' && <ClaimedTag />}
        {task.status === 'done' && <DoneTag />}
        {task.status === 'reviewed' && <ReviewedTag />}
      </div>
      <p className="text-text-secondary">{task.description}</p>
    </div>
  );
}
```

### Inline в тексте

```tsx
function TaskUpdate() {
  return (
    <p className="text-text-primary">
      The task has been <ClaimedTag size="sm" /> by John and is now
      <DoneTag size="sm" label="completed" />.
    </p>
  );
}
```

### С дополнительными стилями

```tsx
function AnimatedTags() {
  return (
    <div className="flex gap-2">
      <ClaimedTag
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleClick}
      />
      <DoneTag
        className="opacity-80 hover:opacity-100 transition-opacity"
      />
      <ReviewedTag
        className="scale-110 hover:scale-125 transition-transform"
      />
    </div>
  );
}
```

### Локализация

```tsx
const translations = {
  en: { claimed: 'Claimed', done: 'Done', reviewed: 'Reviewed' },
  ru: { claimed: 'В работе', done: 'Выполнено', reviewed: 'Проверено' },
  uk: { claimed: 'В роботі', done: 'Виконано', reviewed: 'Перевірено' },
};

function LocalizedTag({ status, locale }) {
  const label = translations[locale][status];

  if (status === 'claimed') return <ClaimedTag label={label} />;
  if (status === 'done') return <DoneTag label={label} />;
  if (status === 'reviewed') return <ReviewedTag label={label} />;
}
```

## Accessibility

Компоненты Tag следуют лучшим практикам доступности:

- ✅ Используют семантический HTML (`<span>`)
- ✅ Иконки имеют `aria-label` для скринридеров
- ✅ Белый текст на цветном фоне обеспечивает хороший контраст
- ✅ Поддержка keyboard navigation (через HTML атрибуты)

## Стилизация

### Дизайн-токены

Компоненты используют:
- **Цвета**: Hardcoded HEX значения из дизайна (соответствуют макету)
- **Скругления**: `rounded-full` (полное скругление)
- **Spacing**: Tailwind spacing scale
- **Typography**: Tailwind font sizes
- **Transitions**: `transition-all duration-200` для плавности

### Кастомизация

Вы можете переопределить стили через prop `className`:

```tsx
<ClaimedTag className="!bg-blue-600 !text-yellow-200 shadow-xl" />
```

**Примечание**: Используйте `!` для переопределения дефолтных стилей.

## TypeScript

Все компоненты полностью типизированы:

```typescript
import type { TagVariant, TagSize } from '@/src/shared/ui/tags';

const variant: TagVariant = 'claimed'; // 'claimed' | 'done' | 'reviewed'
const size: TagSize = 'md'; // 'sm' | 'md' | 'lg'
```

## Тестирование

Для компонентов можно писать unit и интеграционные тесты:

```tsx
import { render, screen } from '@testing-library/react';
import { ClaimedTag, DoneTag, ReviewedTag } from '@/src/shared/ui/tags';

describe('Tag Components', () => {
  it('renders ClaimedTag with default text', () => {
    render(<ClaimedTag />);
    expect(screen.getByText('Claimed')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<DoneTag label="Custom" />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<ReviewedTag size="lg" />);
    const tag = container.firstChild;
    expect(tag).toHaveClass('px-4', 'py-2', 'text-base');
  });
});
```

## Производительность

- ✅ Компоненты оптимизированы через `forwardRef`
- ✅ Минимальное количество re-renders
- ✅ CSS transitions вместо JS анимаций
- ✅ SVG иконки кэшируются браузером

## Best Practices

1. **Используйте специализированные компоненты** (`ClaimedTag`, `DoneTag`, `ReviewedTag`) вместо базового `Tag` для лучшей читаемости кода
2. **Размер `sm`** для компактных layout'ов и inline использования
3. **Размер `md`** (default) для стандартных карточек и списков
4. **Размер `lg`** для акцентированных элементов
5. **Локализуйте текст** через prop `label` для мультиязычности
6. **Добавляйте кастомные стили** через `className` для специфичных случаев

## Связанные компоненты

- [Icon](../icons/Icon.tsx) - Используется для отображения иконок в тегах
- [Typography](../typography/Typography.tsx) - Для текстовых элементов
- [Button](../button/PrimaryButton.tsx) - Кнопки с похожей стилизацией

## Ссылки

- [Дизайн-макет](../Tag%20task%20state.jpg)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React forwardRef](https://react.dev/reference/react/forwardRef)
