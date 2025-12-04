# ChatInput Component

Компонент для ввода и отправки сообщений в чате.

## Использование

```tsx
import { ChatInput } from '@shared/ui';

<ChatInput
  placeholder="Введите сообщение..."
  onSend={(message, file) => {
    console.log('Message:', message);
    console.log('Attached file:', file);
  }}
  showAttachment={true}
/>
```

## Особенности

- ✅ Автоматическое изменение высоты при вводе текста
- ✅ Поддержка прикрепления файлов
- ✅ Отправка по Enter (Shift+Enter для новой строки)
- ✅ Адаптивный дизайн
- ✅ Поддержка светлой и тёмной темы
- ✅ Счётчик символов

## Props

- `placeholder` - placeholder текст (default: "Введите сообщение...")
- `onSend` - callback при отправке сообщения
- `disabled` - disabled состояние
- `showAttachment` - показывать кнопку прикрепления (default: true)
- `maxLength` - максимальная длина сообщения (default: 5000)
- `className` - дополнительные CSS классы
- `autoFocus` - auto-focus при монтировании

## Расположение

`frontend/src/shared/ui/inputs/ChatInput.tsx` - согласно FSD архитектуре (shared layer)
