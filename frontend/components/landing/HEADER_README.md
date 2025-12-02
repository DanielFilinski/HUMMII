# Header Component Documentation

## Обзор

Современный адаптивный Header компонент для платформы Hummii с поддержкой:
- ✅ Многоязычности (EN/FR)
- ✅ Различных навигационных меню для гостей, клиентов и подрядчиков
- ✅ Адаптивного дизайна (Desktop, Tablet, Mobile)
- ✅ Аутентификации и управления ролями
- ✅ Бургер-меню для мобильных устройств

## Расположение

`/frontend/components/landing/header.tsx`

## Использование

```tsx
import { Header } from '@/components/landing/header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
```

## Особенности

### 1. Адаптивная навигация

Header автоматически адаптирует навигационное меню в зависимости от:
- **Статуса аутентификации** (гость vs. зарегистрированный пользователь)
- **Активной роли** (CLIENT vs. CONTRACTOR)

#### Навигация для гостей:
- Categories (Категории)
- How It Works (Как это работает)
- Post a Task (Разместить задачу)
- Become a Contractor (Стать подрядчиком)

#### Навигация для клиентов:
- Categories (Категории)
- My Tasks (Мои задачи)
- Find Contractors (Найти подрядчиков)
- Messages (Сообщения)

#### Навигация для подрядчиков:
- Browse Tasks (Просмотр задач)
- My Services (Мои услуги)
- Messages (Сообщения)
- My Profile (Мой профиль)

### 2. Переключение языка

Компонент поддерживает переключение между английским (EN) и французским (FR) языками:

**Desktop:**
- Выпадающее меню с текущим языком
- Иконка Globe (глобус)
- Галочка для активного языка

**Mobile:**
- Интегрировано в бургер-меню
- Отдельная секция для выбора языка

### 3. Аутентификация

#### Для неавторизованных пользователей:
- Кнопка "Sign in/ Sign Up"

#### Для авторизованных пользователей:
- **Badge с ролью** (CLIENT/CONTRACTOR) с соответствующей иконкой
- **Меню пользователя** с именем и аватаром
- **Кнопка Logout**

### 4. Адаптивный дизайн

#### Desktop (≥1024px):
- Горизонтальное меню навигации
- Выпадающее меню языков
- Все элементы в одной строке

#### Tablet (768px - 1023px):
- Бургер-меню активируется
- Навигация скрывается в меню

#### Mobile (<768px):
- Полное бургер-меню
- Вертикальная навигация
- Мобильная версия языкового меню
- Расширенная информация о пользователе

## Компоненты и зависимости

### Используемые хуки:
- `useTranslations` - для интернационализации
- `useLocale` - для получения текущего языка
- `usePathname` - для определения активной страницы
- `useRouter` - для навигации
- `useAuthStore` - для управления аутентификацией
- `useRole` - для работы с ролями пользователя

### UI Компоненты:
- `Button` - кнопки
- Иконки из `lucide-react`:
  - Menu/X - бургер-меню
  - Globe - переключение языка
  - User - профиль пользователя
  - LogOut - выход
  - LayoutDashboard - дашборд
  - Briefcase - подрядчик
  - ShoppingBag - клиент
  - Check - выбранный элемент

### Утилиты:
- `cn` - для условного объединения классов

## Стилизация

Header использует:
- **Tailwind CSS** для стилей
- **Custom цвета** из конфигурации:
  - `accent-1` - основной зеленый
  - `accent-2` - вторичный зеленый
  - `text-primary` - основной текст
  - `text-secondary` - вторичный текст
  - `background-2` - светлый фон
- **Responsive typography**:
  - `mobile-body` / `mobile-body-sm`
  - `tablet-body` / `tablet-body-sm`
  - `desktop-body` / `desktop-body-sm`

## Интеграция с i18n

Header полностью интегрирован с системой интернационализации:

### Ключи переводов (landing.header):
```json
{
  "categories": "Categories",
  "howItWorks": "How It Works",
  "postTask": "Post a Task",
  "becomeContractor": "Become a Contractor",
  "signInSignUp": "Sign in/ Sign Up",
  "language": "Language"
}
```

## Логотип

Компонент использует SVG логотип из:
```
/public/images/logo/name.svg
```

Размеры логотипа адаптивные:
- Mobile: 32px высота
- Desktop: 40px высота

## Состояние и интерактивность

### Локальное состояние:
```tsx
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
```

### Функции:
- `switchLocale(newLocale)` - переключение языка
- `handleLogout()` - выход из системы

## Доступность (Accessibility)

- Все интерактивные элементы имеют `aria-label`
- Кнопки имеют понятные названия
- Навигация доступна с клавиатуры
- Контрастные цвета для читаемости

## Sticky поведение

Header закреплен вверху страницы:
```tsx
className="sticky top-0 z-50"
```

- `z-index: 50` обеспечивает отображение поверх других элементов
- `sticky` позиция для закрепления при прокрутке

## Примеры интеграции

### В layout.tsx:
```tsx
import { Header } from '@/components/landing/header';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### На конкретной странице:
```tsx
import { Header } from '@/components/landing/header';

export default function Page() {
  return (
    <>
      <Header />
      <div className="container">
        {/* Контент страницы */}
      </div>
    </>
  );
}
```

## Технические требования

- Next.js 14+
- next-intl для интернационализации
- Tailwind CSS
- lucide-react для иконок
- Zustand для управления состоянием (auth store)

## Связанные файлы

- `/frontend/lib/store/auth-store.ts` - хранилище аутентификации
- `/frontend/hooks/use-role.ts` - хук для работы с ролями
- `/frontend/messages/en.json` - английские переводы
- `/frontend/messages/fr.json` - французские переводы
- `/frontend/tailwind.config.ts` - конфигурация стилей
