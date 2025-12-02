# Primary Button Component

## Описание

Компонент `PrimaryButton` - основная кнопка действия в дизайн-системе Hummii. Следует дизайну из макета с поддержкой всех состояний и автоматическим переключением тем.

## Состояния

### 1. Default
Базовое состояние кнопки с ярким зелёным фоном.

**Цвета:**
- Light mode: `#3A971E`
- Dark mode: `#67AD51`

### 2. Hover
Состояние при наведении курсора.

**Цвета:**
- Light mode: `#67AD51`
- Dark mode: `#86C06E`

### 3. Pressed/Active
Состояние при нажатии (клике).

**Цвета:**
- Light mode: `#AAC89A`
- Dark mode: `#5A8D47`

### 4. Loading
Состояние загрузки с анимированным спиннером.

**Особенности:**
- Показывает индикатор загрузки
- Кнопка становится неактивной
- Текст сохраняется

### 5. Disabled
Неактивное состояние кнопки.

**Особенности:**
- Прозрачность: `40%`
- Курсор: `not-allowed`
- Не реагирует на клики

## Использование

### Базовый пример

```tsx
import { PrimaryButton } from '@/components/ui/button';

export function MyComponent() {
  return (
    <PrimaryButton>
      View all services
    </PrimaryButton>
  );
}
```

### С обработчиком клика

```tsx
<PrimaryButton onClick={() => console.log('Clicked!')}>
  Click me
</PrimaryButton>
```

### С состоянием загрузки

```tsx
const [isLoading, setIsLoading] = useState(false);

<PrimaryButton isLoading={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</PrimaryButton>
```

### На всю ширину

```tsx
<PrimaryButton fullWidth>
  Full Width Button
</PrimaryButton>
```

### В форме (Submit)

```tsx
<form onSubmit={handleSubmit}>
  <PrimaryButton type="submit" fullWidth>
    Submit Form
  </PrimaryButton>
</form>
```

### Disabled состояние

```tsx
<PrimaryButton disabled>
  Disabled Button
</PrimaryButton>
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Содержимое кнопки (текст/иконки) |
| `isLoading` | `boolean` | `false` | Показывает индикатор загрузки |
| `disabled` | `boolean` | `false` | Делает кнопку неактивной |
| `fullWidth` | `boolean` | `false` | Растягивает кнопку на всю ширину |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML тип кнопки |
| `onClick` | `(e: MouseEvent) => void` | - | Обработчик клика |
| `className` | `string` | - | Дополнительные CSS классы |

Также поддерживает все стандартные HTML атрибуты `<button>`.

## Стили

### Размеры
- **Padding**: `32px` по горизонтали, `12px` по вертикали
- **Border radius**: `9999px` (полностью скруглённая)
- **Font size**: `16px` (1rem)
- **Line height**: `24px` (1.5rem)
- **Font weight**: `500` (medium)

### Переходы
- **Duration**: `200ms`
- **Timing function**: `ease-in-out`

### Accessibility
- Focus ring при навигации с клавиатуры
- `aria-disabled` для disabled состояния
- Правильные цветовые контрасты (WCAG AA)

## Примеры использования

### Простая кнопка
```tsx
<PrimaryButton>View all services</PrimaryButton>
```

### Async действие
```tsx
function AsyncExample() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  return (
    <PrimaryButton isLoading={loading} onClick={handleClick}>
      Load Data
    </PrimaryButton>
  );
}
```

### С условным disabled
```tsx
const isFormValid = email && password;

<PrimaryButton disabled={!isFormValid}>
  Submit
</PrimaryButton>
```

### Группа кнопок
```tsx
<div className="flex gap-3">
  <PrimaryButton onClick={handleSave}>
    Save
  </PrimaryButton>
  <PrimaryButton onClick={handleCancel}>
    Cancel
  </PrimaryButton>
</div>
```

## Темы

Компонент автоматически адаптируется к светлой и тёмной темам:

**Light Theme:**
- Default: `#3A971E`
- Hover: `#67AD51`
- Pressed: `#AAC89A`

**Dark Theme:**
- Default: `#67AD51`
- Hover: `#86C06E`
- Pressed: `#5A8D47`

Переключение происходит через класс `.dark` на элементе `<html>`.

## Best Practices

### ✅ DO:
```tsx
// Используйте для основных действий
<PrimaryButton>Save Changes</PrimaryButton>

// Используйте isLoading для async операций
<PrimaryButton isLoading={saving}>Saving...</PrimaryButton>

// Используйте fullWidth в мобильных формах
<PrimaryButton fullWidth>Continue</PrimaryButton>
```

### ❌ DON'T:
```tsx
// Не добавляйте прямые стили цвета
<PrimaryButton style={{ backgroundColor: '#000' }}>Bad</PrimaryButton>

// Не используйте для второстепенных действий (есть SecondaryButton)
<PrimaryButton>Cancel</PrimaryButton> // используйте SecondaryButton

// Не переопределяйте базовые стили
<PrimaryButton className="rounded-none">Bad</PrimaryButton>
```

## Accessibility

- ✅ Клавиатурная навигация (Tab, Enter, Space)
- ✅ Focus ring для keyboard navigation
- ✅ Правильные ARIA атрибуты
- ✅ Контрастность текста (WCAG AA)
- ✅ Disabled состояние блокирует взаимодействие

## Совместимость

- ✅ React 18+
- ✅ Next.js 14+
- ✅ TypeScript 5+
- ✅ Tailwind CSS 3+
- ✅ Все современные браузеры
- ✅ Mobile devices

## Файлы

```
frontend/components/ui/button/
├── PrimaryButton.tsx          # Основной компонент
├── PrimaryButton.examples.tsx # Примеры использования
├── index.ts                   # Экспорты
└── README.md                  # Эта документация
```

## Связанные компоненты

- `Button` - базовый компонент с вариантами
- `SecondaryButton` - кнопка для второстепенных действий
- `IconButton` - круглая кнопка с иконкой
- `LinkButton` - текстовая ссылка-кнопка

## Зависимости

```json
{
  "react": "^18.0.0",
  "tailwindcss": "^3.0.0",
  "@/lib/utils": "cn function"
}
```

## Changelog

### v1.0.0 (December 2024)
- ✨ Первый релиз
- ✅ Все 5 состояний из дизайна
- ✅ Поддержка светлой и тёмной темы
- ✅ TypeScript типизация
- ✅ Accessibility features
- ✅ Loading state с спиннером

---

**Design System**: Hummii  
**Component**: PrimaryButton  
**Version**: 1.0.0  
**Last Updated**: December 2, 2024
