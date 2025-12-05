# OrderCard Component

Компонент карточки заказа для отображения информации о заказе клиента.

## Описание

OrderCard - это UI компонент, который отображает детальную информацию о заказе, включая:
- Фото и имя клиента
- Диапазон дат и время выполнения
- Название заказа
- Локацию с возможностью просмотра на карте
- Описание заказа
- Кнопку для ответа на заказ

## Использование

### Базовое использование

```tsx
import { OrderCard } from '@/src/shared/ui/cards/order';

function OrdersList() {
  const handleRespond = (id: string) => {
    console.log('Responding to order:', id);
  };

  const handleLocationClick = (id: string) => {
    console.log('View location:', id);
  };

  return (
    <OrderCard
      id="order-123"
      clientName="Mary K."
      clientPhoto="/images/clients/mary.jpg"
      title="Cleaning of 2-floors House"
      description="Need full cleaning of a two-floor house, including floors, dusting, bathrooms, and kitchen."
      location="Toronto"
      startDate="2024-11-13"
      endDate="2024-11-20"
      startTime="10:00"
      endTime="14:00"
      onRespond={handleRespond}
      onLocationClick={handleLocationClick}
    />
  );
}
```

### С использованием Date объектов

```tsx
<OrderCard
  id="order-456"
  clientName="John S."
  title="Plumbing Repair"
  description="Kitchen sink is leaking."
  location="Vancouver"
  startDate={new Date('2024-11-14')}
  endDate={new Date('2024-11-14')}
  startTime="09:00"
  endTime="12:00"
  onRespond={handleRespond}
  onLocationClick={handleLocationClick}
/>
```

### Без фото клиента (fallback avatar)

```tsx
<OrderCard
  id="order-789"
  clientName="Anonymous User"
  title="Electrical Work"
  description="Install new outlets."
  location="Calgary"
  startDate="2024-11-20"
  endDate="2024-11-20"
  startTime="14:00"
  endTime="17:00"
  onRespond={handleRespond}
/>
```

### Список карточек

```tsx
<div className="space-y-6">
  {orders.map((order) => (
    <OrderCard
      key={order.id}
      id={order.id}
      clientName={order.clientName}
      clientPhoto={order.clientPhoto}
      title={order.title}
      description={order.description}
      location={order.location}
      startDate={order.startDate}
      endDate={order.endDate}
      startTime={order.startTime}
      endTime={order.endTime}
      onRespond={handleRespond}
      onLocationClick={handleLocationClick}
    />
  ))}
</div>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `id` | `string` | ✅ | - | Уникальный идентификатор заказа |
| `clientName` | `string` | ✅ | - | Имя клиента |
| `clientPhoto` | `string` | ❌ | - | URL фото клиента |
| `title` | `string` | ✅ | - | Название заказа |
| `description` | `string` | ✅ | - | Описание заказа |
| `location` | `string` | ✅ | - | Город/локация |
| `startDate` | `string \| Date` | ✅ | - | Дата начала (ISO string или Date) |
| `endDate` | `string \| Date` | ✅ | - | Дата окончания (ISO string или Date) |
| `startTime` | `string` | ✅ | - | Время начала (формат: "HH:MM") |
| `endTime` | `string` | ✅ | - | Время окончания (формат: "HH:MM") |
| `onRespond` | `(id: string) => void` | ❌ | - | Обработчик клика на кнопку "Respond" |
| `onLocationClick` | `(id: string) => void` | ❌ | - | Обработчик клика на "See location" |
| `className` | `string` | ❌ | - | Дополнительные CSS классы |

## Дизайн

Компонент следует дизайн-системе проекта:

- **Цвета**: Использует семантические цвета из дизайн-системы
- **Шрифты**: Typography компонент с адаптивными размерами
- **Скругления**: border-radius 24px для карточки, 12px для кнопки
- **Тени**: Subtle shadow с border
- **Анимации**: Smooth transitions на hover и active состояниях
- **Акцентный цвет**: #6AB344 (зелёный) для кнопок и ссылок

### Структура

```
┌─────────────────────────────────────────┐
│ [Avatar] Name           Date Range       │
│                                          │
│ Order Title                              │
│ Location              See location →     │
│ ─────────────────────────────────────── │
│ Order description text...                │
│                                          │
│           [Respond Button]               │
└─────────────────────────────────────────┘
```

## Зависимости

- `Avatar` компонент из `@/src/shared/ui/avatars/Avatar`
- `Typography` компонент из `@/src/shared/ui/typography/Typography`
- `cn` utility из `@/src/shared/lib/utils`

## Доступность

- Семантические HTML элементы
- Клавиатурная навигация (Tab для перехода между интерактивными элементами)
- Focus states для кнопок
- Alt текст для аватара
- Aria-labels добавляются автоматически Avatar компонентом

## Responsive дизайн

- **Mobile**: Max-width 608px, padding 20px
- **Tablet/Desktop**: Сохраняет max-width для читабельности
- Адаптивная типографика через Typography компонент

## Примеры использования

См. `OrderCard.example.tsx` для полных примеров использования компонента.

## Интеграция с бэкендом

```tsx
interface Order {
  id: string;
  client: {
    name: string;
    avatar?: string;
  };
  title: string;
  description: string;
  location: string;
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
}

function OrderCardWrapper({ order }: { order: Order }) {
  return (
    <OrderCard
      id={order.id}
      clientName={order.client.name}
      clientPhoto={order.client.avatar}
      title={order.title}
      description={order.description}
      location={order.location}
      startDate={order.schedule.startDate}
      endDate={order.schedule.endDate}
      startTime={order.schedule.startTime}
      endTime={order.schedule.endTime}
      onRespond={handleRespond}
      onLocationClick={handleLocationClick}
    />
  );
}
```

## Тестирование

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderCard } from './OrderCard';

describe('OrderCard', () => {
  const mockProps = {
    id: 'test-order',
    clientName: 'Test User',
    title: 'Test Order',
    description: 'Test description',
    location: 'Test City',
    startDate: '2024-11-13',
    endDate: '2024-11-20',
    startTime: '10:00',
    endTime: '14:00',
  };

  it('renders order information correctly', () => {
    render(<OrderCard {...mockProps} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Order')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onRespond when Respond button is clicked', () => {
    const handleRespond = jest.fn();
    render(<OrderCard {...mockProps} onRespond={handleRespond} />);

    fireEvent.click(screen.getByText('Respond'));
    expect(handleRespond).toHaveBeenCalledWith('test-order');
  });

  it('calls onLocationClick when See location is clicked', () => {
    const handleLocationClick = jest.fn();
    render(<OrderCard {...mockProps} onLocationClick={handleLocationClick} />);

    fireEvent.click(screen.getByText('See location'));
    expect(handleLocationClick).toHaveBeenCalledWith('test-order');
  });
});
```

## Changelog

### Version 1.0.0 (2024-11-13)
- Initial release
- Базовый функционал отображения заказа
- Интеграция с Avatar и Typography компонентами
- Поддержка кликабельных элементов (кнопка Respond и ссылка на локацию)
