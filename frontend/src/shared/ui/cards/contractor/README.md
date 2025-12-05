# ContractorCard Component

Компонент карточки подрядчика, отображающий профиль исполнителя с основной информацией.

## Дизайн

Компонент точно соответствует макету из [`Contractor.png`](./Contractor.png):

- Зеленая плашка категории сверху
- Круглое фото профиля
- Имя подрядчика
- Локация и почасовая ставка
- Рейтинг со звездами
- Количество выполненных заданий
- Кнопка "View Profile"

## Использование

```tsx
import { ContractorCard } from '@/src/shared/ui/cards/contractor';

function ContractorsPage() {
  return (
    <ContractorCard
      id="1"
      category="Plumbing"
      name="John Smith"
      photo="/images/contractors/john-smith.jpg"
      location="Toronto"
      hourlyRate={40}
      rating={4.9}
      tasksCompleted={43}
      onViewProfile={(id) => console.log('View profile:', id)}
    />
  );
}
```

## Props

### ContractorCardProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | `string` | Yes | - | Unique contractor identifier |
| `category` | `string` | Yes | - | Service category (e.g., "Plumbing") |
| `name` | `string` | Yes | - | Contractor's full name |
| `photo` | `string` | No | - | Profile photo URL (uses fallback avatar if not provided) |
| `location` | `string` | Yes | - | City/location |
| `hourlyRate` | `number` | Yes | - | Hourly rate in dollars |
| `rating` | `number` | Yes | - | Rating from 0 to 5 |
| `tasksCompleted` | `number` | Yes | - | Number of completed tasks |
| `onViewProfile` | `(id: string) => void` | No | - | Callback when "View Profile" is clicked |
| `className` | `string` | No | - | Additional CSS classes |

## Примеры

### Базовый пример

```tsx
<ContractorCard
  id="1"
  category="Plumbing"
  name="John Smith"
  photo="/images/contractors/john.jpg"
  location="Toronto"
  hourlyRate={40}
  rating={4.9}
  tasksCompleted={43}
  onViewProfile={(id) => router.push(`/contractors/${id}`)}
/>
```

### Без фото (с fallback аватаром)

```tsx
<ContractorCard
  id="2"
  category="Electrical"
  name="Sarah Johnson"
  location="Vancouver"
  hourlyRate={55}
  rating={4.8}
  tasksCompleted={67}
  onViewProfile={handleViewProfile}
/>
```

### Сетка карточек

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {contractors.map((contractor) => (
    <ContractorCard
      key={contractor.id}
      id={contractor.id}
      category={contractor.category}
      name={contractor.name}
      photo={contractor.photo}
      location={contractor.location}
      hourlyRate={contractor.hourlyRate}
      rating={contractor.rating}
      tasksCompleted={contractor.tasksCompleted}
      onViewProfile={handleViewProfile}
    />
  ))}
</div>
```

## Особенности

### Дизайн

- **Responsive**: Адаптивная ширина с `max-w-[240px]`
- **Rounded corners**: Скругление `16px`
- **Shadow**: Легкая тень и border для глубины
- **Green accent**: Категория и кнопка используют цвет `#6AB344`

### Рейтинг

- Отображается в виде числа с одним знаком после запятой
- 5 звезд: закрашенные (`#6AB344`) и пустые (`#E0E0E0`)
- Полные звезды определяются через `Math.floor(rating)`

### Кнопка

- **Default**: Прозрачный фон, зеленая рамка и текст
- **Hover**: Зеленый фон, белый текст
- **Active**: Легкое уменьшение через `scale-[0.98]`
- **Focus**: Ring для accessibility

### Аватар

- Использует компонент `Avatar` с размером `lg` (150x150px)
- Круглая форма (`circle`)
- Fallback на иконку Person.svg если фото не загрузилось

## Зависимости

- `@/src/shared/ui/avatars/Avatar` - Компонент аватара
- `@/src/shared/ui/typography/Typography` - Типографика
- `@/src/shared/lib/utils` - Утилита `cn` для классов

## Accessibility

- Семантическая HTML структура
- Aria labels для звезд рейтинга
- Focus states для кнопки
- Alt текст для изображений

## Цветовая палитра

- **Category background**: `#6AB344` (Green)
- **Button border**: `#6AB344` (Green)
- **Button text**: `#6AB344` (Green)
- **Button hover bg**: `#6AB344` (Green)
- **Stars filled**: `#6AB344` (Green)
- **Stars empty**: `#E0E0E0` (Gray)
- **Border**: `#E0E0E0` (Gray)
- **Background**: `background-primary` (White/Light)

## Файлы

- `ContractorCard.tsx` - Основной компонент
- `ContractorCard.example.tsx` - Примеры использования
- `Contractor.png` - Референсный дизайн макет
- `index.ts` - Экспорты
- `README.md` - Документация

## TODO

- [ ] Добавить анимацию hover эффектов
- [ ] Добавить поддержку верифицированных подрядчиков (badge)
- [ ] Добавить индикатор онлайн статуса
- [ ] Добавить skeleton loader для состояния загрузки
- [ ] Добавить unit тесты
