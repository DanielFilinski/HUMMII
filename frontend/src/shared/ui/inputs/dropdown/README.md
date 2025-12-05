# Dropdown Component

Компонент выпадающего списка с поиском для Hummii платформы.

## Особенности

- ✅ Поиск по опциям в реальном времени
- ✅ Кастомный скроллбар (зеленый)
- ✅ Визуальное выделение выбранного элемента
- ✅ Кнопка очистки поиска (X)
- ✅ Навигация с клавиатуры (Arrow Up/Down, Enter, Escape)
- ✅ Автофокус на поле поиска при открытии
- ✅ Закрытие при клике вне компонента
- ✅ Поддержка disabled состояния
- ✅ Полностью типизирован с TypeScript

## Использование

### Базовый пример

```tsx
import { Dropdown, DropdownOption } from '@/src/shared/ui/inputs/dropdown/Dropdown';

const options: DropdownOption[] = [
  { value: 'home-cleaning', label: 'Home cleaning' },
  { value: 'post-renovation', label: 'Post-renovation cleaning' },
  { value: 'window-cleaning', label: 'Window cleaning' },
  { value: 'move-in-out', label: 'Move-in / move-out cleaning' },
];

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Search..."
    />
  );
}
```

### С лейблом

```tsx
<Dropdown
  label="Select Service Type"
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Search services..."
/>
```

### Во всю ширину

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  fullWidth
/>
```

### Disabled состояние

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  disabled
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` | **Required** | Список опций для выбора |
| `value` | `string` | `undefined` | Текущее выбранное значение |
| `onChange` | `(value: string) => void` | `undefined` | Callback при изменении значения |
| `placeholder` | `string` | `'Search...'` | Placeholder для поля поиска |
| `label` | `string` | `undefined` | Лейбл над dropdown |
| `disabled` | `boolean` | `false` | Отключить компонент |
| `fullWidth` | `boolean` | `false` | Растянуть на всю ширину |
| `searchable` | `boolean` | `true` | Включить функцию поиска |
| `className` | `string` | `undefined` | Дополнительные CSS классы |

## DropdownOption Type

```typescript
interface DropdownOption {
  value: string;  // Уникальный идентификатор опции
  label: string;  // Отображаемый текст
}
```

## Дизайн

Компонент следует дизайну из `Dropdown.png`:

- **Поле поиска**: Белый фон, большие закругленные углы (32px), тень
- **Опции**: Светлый фон, закругленные углы (16px)
- **Выбранная опция**: Зеленый фон (#D4F4C4)
- **Скроллбар**: Зеленый цвет (#6AB344), закругленный
- **Отступы**: Увеличенные для лучшей читаемости
- **Шрифты**: Увеличенные размеры (20-24px)

## Клавиатурная навигация

- **Arrow Down**: Открыть dropdown / Перейти к следующей опции
- **Arrow Up**: Перейти к предыдущей опции
- **Enter**: Выбрать подсвеченную опцию / Открыть dropdown
- **Escape**: Закрыть dropdown и очистить поиск
- **Typing**: Автоматический поиск по введенному тексту

## Accessibility

- ✅ Поддержка клавиатурной навигации
- ✅ Focus states
- ✅ Disabled states
- ✅ ARIA-совместимость (через нативные элементы)

## Примеры

Полные примеры использования смотрите в файле [Dropdown.example.tsx](./Dropdown.example.tsx)

## Связанные компоненты

- [Select](../Select.tsx) - Альтернативный компонент выбора
- [Input](../Input.tsx) - Базовый input компонент

## Технические детали

- Использует React hooks (useState, useRef, useEffect)
- Автоматическое закрытие при клике вне компонента
- Фильтрация опций по мере ввода
- Кастомные стили скроллбара через CSS-in-JS
- Полностью типизирован с TypeScript
