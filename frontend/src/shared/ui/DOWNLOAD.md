# 📥 Скачать все файлы дизайн-системы

## 🎨 UI Компоненты

### Основные компоненты:

1. **[Avatar.tsx](computer:///mnt/user-data/outputs/components/ui/Avatar.tsx)** - Аватары пользователей с группировкой
2. **[Badge.tsx](computer:///mnt/user-data/outputs/components/ui/Badge.tsx)** - Бейджи и метки
3. **[Button.tsx](computer:///mnt/user-data/outputs/components/ui/Button.tsx)** - Кнопки с вариантами
4. **[Card.tsx](computer:///mnt/user-data/outputs/components/ui/Card.tsx)** - Карточки с суб-компонентами
5. **[Container.tsx](computer:///mnt/user-data/outputs/components/ui/Container.tsx)** - Контейнер для layout
6. **[Input.tsx](computer:///mnt/user-data/outputs/components/ui/Input.tsx)** - Поля ввода с валидацией
7. **[Spinner.tsx](computer:///mnt/user-data/outputs/components/ui/Spinner.tsx)** - Индикаторы загрузки
8. **[Typography.tsx](computer:///mnt/user-data/outputs/components/ui/Typography.tsx)** - Адаптивная типографика
9. **[Select.tsx](computer:///mnt/user-data/outputs/components/ui/Select.tsx)** - Выпадающие списки
10. **[Textarea.tsx](computer:///mnt/user-data/outputs/components/ui/Textarea.tsx)** - Многострочные поля ввода
11. **[index.ts](computer:///mnt/user-data/outputs/components/ui/index.ts)** - Экспорты всех компонентов

---

## ⚙️ Конфигурация

### Основные файлы конфигурации:

1. **[tailwind.config.ts](computer:///mnt/user-data/outputs/tailwind.config.ts)** - Конфигурация Tailwind
2. **[globals.css](computer:///mnt/user-data/outputs/app/globals.css)** - Глобальные стили
3. **[layout.tsx](computer:///mnt/user-data/outputs/app/layout.tsx)** - Корневой layout

### Библиотеки и утилиты:

4. **[fonts.ts](computer:///mnt/user-data/outputs/lib/fonts.ts)** - Конфигурация шрифта Roboto
5. **[design-tokens.ts](computer:///mnt/user-data/outputs/lib/design-tokens.ts)** - Токены дизайн-системы
6. **[utils.ts](computer:///mnt/user-data/outputs/lib/utils.ts)** - Утилиты (cn helper)

---

## 📖 Документация

1. **[README.md](computer:///mnt/user-data/outputs/README.md)** - Общий обзор
2. **[DESIGN_SYSTEM.md](computer:///mnt/user-data/outputs/DESIGN_SYSTEM.md)** - Полная документация
3. **[QUICK_START.md](computer:///mnt/user-data/outputs/QUICK_START.md)** - Быстрый старт

---

## 🎯 Демо страница

- **[page.tsx](computer:///mnt/user-data/outputs/app/design-system/page.tsx)** - Интерактивная showcase страница

---

## 📂 Структура проекта

```
project/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── globals.css               # Global styles
│   └── design-system/
│       └── page.tsx              # Showcase page
├── components/
│   └── ui/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Container.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Spinner.tsx
│       ├── Textarea.tsx
│       ├── Typography.tsx
│       └── index.ts
├── lib/
│   ├── design-tokens.ts
│   ├── fonts.ts
│   └── utils.ts
└── tailwind.config.ts
```

---

## 🚀 Как использовать

### 1. Скачайте все файлы

Нажмите на ссылки выше, чтобы скачать каждый файл.

### 2. Установите зависимости

```bash
npm install clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

### 3. Разместите файлы в проекте

Скопируйте файлы в соответствующие директории вашего Next.js проекта.

### 4. Запустите проект

```bash
npm run dev
```

---

## 📦 package.json зависимости

Добавьте эти зависимости в ваш `package.json`:

```json
{
  "dependencies": {
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 💡 Примеры использования

### Пример 1: Простая карточка

```tsx
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Заголовок</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Содержимое карточки</p>
        <Button>Действие</Button>
      </CardContent>
    </Card>
  );
}
```

### Пример 2: Форма

```tsx
import { Input, Button, Typography } from '@/components/ui';

export default function Form() {
  return (
    <div className="space-y-4">
      <Typography variant="h2">Контактная форма</Typography>
      <Input label="Имя" placeholder="Введите имя" />
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Button fullWidth>Отправить</Button>
    </div>
  );
}
```

---

## ⚠️ Важно

1. Все компоненты используют **Tailwind CSS** - убедитесь, что он настроен
2. Файлы используют **TypeScript** - нужен Next.js 14+
3. Компоненты используют **Roboto** шрифт из Google Fonts
4. Требуется установка **clsx** и **tailwind-merge**

---

## 🎉 Готово!

Все компоненты готовы к использованию. Просто скачайте файлы по ссылкам выше и разместите их в вашем проекте.

**Удачного кодирования! 🚀**
