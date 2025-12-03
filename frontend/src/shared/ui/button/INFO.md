# Button Components

## 📦 Компоненты

### PrimaryButton ⭐ NEW
Основная кнопка действия согласно дизайн-системе Hummii.

```tsx
import { PrimaryButton } from '@/components/ui/button';

<PrimaryButton>View all services</PrimaryButton>
```

**Состояния:**
- ✅ Default (ярко-зелёный)
- ✅ Hover (средне-зелёный)
- ✅ Pressed (светло-зелёный)
- ✅ Loading (со спиннером)
- ✅ Disabled (40% opacity)

**Документация:**
- [README.md](./README.md) - Полная документация
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Быстрый справочник
- [PrimaryButton.examples.tsx](./PrimaryButton.examples.tsx) - Примеры
- [Demo Page](/demo/primary-button) - Интерактивная демо

---

### Button
Базовый компонент кнопки с несколькими вариантами.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="icon"><Icon /></Button>
```

---

## 🚀 Quick Start

```bash
# Установка зависимостей (если ещё не установлены)
npm install

# Запуск dev сервера
npm run dev

# Открыть демо-страницу
open http://localhost:3000/demo/primary-button
```

## 📖 Использование

```tsx
'use client';

import { PrimaryButton } from '@/components/ui/button';
import { useState } from 'react';

export function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // ваша логика
    setLoading(false);
  };

  return (
    <PrimaryButton isLoading={loading} onClick={handleSubmit}>
      Submit
    </PrimaryButton>
  );
}
```

## 🎨 Дизайн-система

Все кнопки следуют единой дизайн-системе:

- **Цвета**: Из `design-tokens.ts` через CSS переменные
- **Типографика**: Автоматическая адаптивность
- **Темы**: Автоматическое переключение light/dark
- **Accessibility**: WCAG AA совместимость

## 📁 Структура

```
button/
├── Button.tsx                    # Базовый компонент
├── PrimaryButton.tsx             # ⭐ Primary кнопка
├── PrimaryButton.examples.tsx    # Примеры использования
├── index.ts                      # Экспорты
├── README.md                     # Полная документация
├── QUICK_REFERENCE.md            # Быстрый справочник
└── INFO.md                       # Этот файл
```

## 🔗 Связанные файлы

- [Design Tokens](/frontend/lib/design-tokens.ts)
- [Tailwind Config](/frontend/tailwind.config.ts)
- [Global CSS](/frontend/app/globals.css)
- [Design System Guide](/.github/instructions/design.instructions.md)

## ✨ Features

- ✅ TypeScript типизация
- ✅ Автоматическая адаптивность
- ✅ Light/Dark темы
- ✅ Loading состояния
- ✅ Accessibility (a11y)
- ✅ Keyboard navigation
- ✅ Touch-friendly
- ✅ SSR compatible

## 📚 Resources

- **Design System**: [DESIGN_SYSTEM.md](/frontend/DESIGN_SYSTEM.md)
- **Component Guide**: [NEW_COMPONENTS.md](/frontend/components/ui/NEW_COMPONENTS.md)
- **Typography**: [TYPOGRAPHY_GUIDE.md](/frontend/components/ui/typography/TYPOGRAPHY_GUIDE.md)

---

**Version**: 1.0.0  
**Last Updated**: December 2, 2024
