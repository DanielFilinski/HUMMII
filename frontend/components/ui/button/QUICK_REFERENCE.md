# 🎯 Primary Button - Quick Reference

## 📦 Import

```tsx
import { PrimaryButton } from '@/components/ui/button';
// или
import { PrimaryButton } from '@/components/ui';
```

## ⚡ Quick Start

```tsx
// Базовое использование
<PrimaryButton>View all services</PrimaryButton>

// С обработчиком
<PrimaryButton onClick={() => console.log('clicked')}>
  Click me
</PrimaryButton>

// Loading состояние
<PrimaryButton isLoading>Loading...</PrimaryButton>

// Disabled
<PrimaryButton disabled>Disabled</PrimaryButton>

// Full width
<PrimaryButton fullWidth>Full Width</PrimaryButton>
```

## 🎨 Состояния (из дизайна)

| Состояние | Цвет (Light) | Цвет (Dark) | Описание |
|-----------|-------------|-------------|----------|
| Default | `#3A971E` | `#67AD51` | Базовое состояние |
| Hover | `#67AD51` | `#86C06E` | При наведении |
| Pressed | `#AAC89A` | `#5A8D47` | При клике |
| Loading | - | - | С спиннером |
| Disabled | 40% opacity | 40% opacity | Неактивна |

## 📐 Размеры

```
Padding: 32px 12px (horizontal vertical)
Border Radius: 9999px (полностью круглая)
Font Size: 16px
Font Weight: 500 (medium)
Line Height: 24px
```

## 🔧 Props

```tsx
interface PrimaryButtonProps {
  children: ReactNode;        // Текст/содержимое
  isLoading?: boolean;        // Показать спиннер
  disabled?: boolean;         // Отключить кнопку
  fullWidth?: boolean;        // На всю ширину
  onClick?: () => void;       // Обработчик клика
  type?: 'button' | 'submit' | 'reset'; // HTML тип
  className?: string;         // Доп. классы
}
```

## 💡 Примеры

### Async Action
```tsx
const [loading, setLoading] = useState(false);

const handleClick = async () => {
  setLoading(true);
  await api.submit();
  setLoading(false);
};

<PrimaryButton isLoading={loading} onClick={handleClick}>
  Submit
</PrimaryButton>
```

### В форме
```tsx
<form onSubmit={handleSubmit}>
  <input type="text" />
  <PrimaryButton type="submit" fullWidth>
    Send
  </PrimaryButton>
</form>
```

### Условный disabled
```tsx
<PrimaryButton disabled={!isFormValid}>
  Continue
</PrimaryButton>
```

## ✅ Best Practices

### DO ✅
- Используйте для основных действий
- Используйте `isLoading` для async операций
- Используйте `fullWidth` в мобильных формах
- Проверяйте в обеих темах

### DON'T ❌
- Не переопределяйте цвета напрямую
- Не используйте для отмены (используйте SecondaryButton)
- Не добавляйте inline styles для цветов
- Не ставьте много Primary кнопок рядом

## 🎯 Use Cases

```tsx
// ✅ Call-to-Action
<PrimaryButton>Get Started</PrimaryButton>

// ✅ Form Submit
<PrimaryButton type="submit">Save Changes</PrimaryButton>

// ✅ Important Action
<PrimaryButton>Confirm Payment</PrimaryButton>

// ✅ Loading State
<PrimaryButton isLoading={saving}>Saving...</PrimaryButton>
```

## 🌐 Accessibility

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Focus ring для keyboard users
- ✅ ARIA attributes
- ✅ WCAG AA контрастность
- ✅ Disabled блокирует interaction

## 📱 Responsive

Кнопка автоматически адаптируется:
- Mobile: полная поддержка touch
- Tablet: оптимизированные отступы
- Desktop: hover эффекты

## 🔗 Links

- [Full Documentation](./README.md)
- [Examples](./PrimaryButton.examples.tsx)
- [Demo Page](/demo/primary-button)
- [Design System](../DESIGN_SYSTEM.md)

## 🚀 Demo

Откройте в браузере:
```
http://localhost:3000/demo/primary-button
```

---

**Version**: 1.0.0  
**Last Updated**: Dec 2, 2024
