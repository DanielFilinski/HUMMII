# User Menu & Protected Feature Cards

## Добавленные компоненты

### 1. UserMenu Component
**Файл:** `frontend/components/features/auth/user-menu.tsx`

**Функциональность:**
- ✅ Показывается только когда пользователь авторизован
- ✅ Отображает имя пользователя и роль
- ✅ Аватар с первой буквой имени
- ✅ Кнопка Logout с состоянием загрузки
- ✅ Вызывает API logout и очищает локальное состояние
- ✅ Редиректит на главную после выхода

**Использование:**
```tsx
import { UserMenu } from '@/components/features/auth/user-menu';

<UserMenu />
```

**Где использовано:**
- Главная страница (header, sticky top)

### 2. ProtectedFeatureCard Component
**Файл:** `frontend/components/features/examples/protected-feature-card.tsx`

**Функциональность:**
- ✅ Красивая интерактивная карточка для защищённых функций
- ✅ Показывает иконку, заголовок, описание
- ✅ Поддерживает проверку ролей (опционально)
- ✅ Интегрирована с `useProtectedAction`
- ✅ Показывает AuthModal при попытке действия
- ✅ Анимации hover и success сообщения
- ✅ Кастомный callback при успешном выполнении

**Props:**
```tsx
interface ProtectedFeatureCardProps {
  title: string;              // Заголовок функции
  description: string;         // Описание функции
  icon: string;                // Эмодзи иконка
  action: string;              // Текст на кнопке
  requiredRoles?: UserRole[];  // Опционально: требуемые роли
  onExecute?: () => void;      // Опционально: callback
}
```

**Использование:**
```tsx
import { ProtectedFeatureCard } from '@/components/features/examples/protected-feature-card';

<ProtectedFeatureCard
  icon="📝"
  title="Create Order"
  description="Post a job and find contractors"
  action="Create New Order"
  requiredRoles={['CLIENT']}
  onExecute={() => {
    // Ваш код после успешной проверки
    router.push('/orders/create');
  }}
/>
```

## Примеры на главной странице

На главной странице теперь добавлено 6 примеров защищённых функций:

### 1. 📝 Create Order (CLIENT only)
```tsx
<ProtectedFeatureCard
  icon="📝"
  title="Create Order"
  description="Post a job and find contractors"
  action="Create New Order"
  requiredRoles={['CLIENT']}
/>
```

### 2. 💼 Apply to Orders (CONTRACTOR only)
```tsx
<ProtectedFeatureCard
  icon="💼"
  title="Apply to Orders"
  description="Browse and apply to available jobs"
  action="View Orders"
  requiredRoles={['CONTRACTOR']}
/>
```

### 3. ❤️ Save Favorites (Any authenticated)
```tsx
<ProtectedFeatureCard
  icon="❤️"
  title="Save Favorites"
  description="Bookmark contractors you like"
  action="Add to Favorites"
  // Без requiredRoles = только auth нужна
/>
```

### 4. 💬 Send Messages (Any authenticated)
```tsx
<ProtectedFeatureCard
  icon="💬"
  title="Send Messages"
  description="Chat with service providers"
  action="Start Chatting"
/>
```

### 5. ⭐ Leave Review (CLIENT or CONTRACTOR)
```tsx
<ProtectedFeatureCard
  icon="⭐"
  title="Leave Review"
  description="Rate your experience"
  action="Write Review"
  requiredRoles={['CLIENT', 'CONTRACTOR']}
/>
```

### 6. 📊 View Dashboard (Any authenticated)
```tsx
<ProtectedFeatureCard
  icon="📊"
  title="View Dashboard"
  description="Access your stats and analytics"
  action="Open Dashboard"
/>
```

## Что происходит при клике

### Пользователь НЕ авторизован:
1. Клик на любую карточку
2. ❌ Проверка auth провалена
3. 📱 Показывается модальное окно AuthModal
4. Предложение зарегистрироваться или войти
5. После регистрации → редирект обратно

### Пользователь авторизован с правильной ролью:
1. Клик на карточку
2. ✅ Проверка auth успешна
3. ✅ Проверка роли успешна (если требуется)
4. ▶️ Выполняется `onExecute` callback
5. 🎉 Показывается success сообщение (зелёная полоска)

### Пользователь авторизован с неправильной ролью:
1. Клик на карточку "Create Order" (CLIENT only)
2. ✅ Проверка auth успешна
3. ❌ Проверка роли провалена (пользователь CONTRACTOR)
4. 🚫 Показывается ошибка "Access denied"
5. Callback НЕ выполняется

## UserMenu - Кнопка Logout

### Расположение
- Sticky header в верху страницы
- Справа от логотипа "Hummii"
- Показывается ТОЛЬКО если пользователь авторизован

### Что показывает
- Имя пользователя
- Роль пользователя (CLIENT/CONTRACTOR/ADMIN)
- Аватар (круг с первой буквой имени)
- Красная кнопка "Logout"

### Процесс выхода
```
Клик Logout
    ↓
Вызов API /auth/logout
    ↓
Очистка локального состояния (Zustand)
    ↓
Редирект на главную (/)
    ↓
Refresh страницы
```

### API Endpoint
```typescript
// Backend должен обрабатывать:
POST /api/v1/auth/logout

Response: 200 OK
// Очищает HTTP-only cookies с токенами
```

## Структура главной страницы

```
HomePage
├─ Header (sticky)
│  ├─ Logo "Hummii"
│  └─ UserMenu (if authenticated)
│
├─ Hero Section
│  ├─ Title & Description
│  └─ CTA Buttons
│     ├─ CreateOrderButton (protected)
│     └─ Sign In Button
│
├─ Try Protected Features Section (NEW!)
│  └─ Grid of 6 ProtectedFeatureCards
│     ├─ Create Order (CLIENT)
│     ├─ Apply to Orders (CONTRACTOR)
│     ├─ Save Favorites
│     ├─ Send Messages
│     ├─ Leave Review (CLIENT/CONTRACTOR)
│     └─ View Dashboard
│
├─ More Examples Section
│  └─ Links to demo pages
│
├─ Features Grid (3 cards)
│
└─ Developer Features Section
```

## Тестирование

### Тест 1: UserMenu появляется после входа
1. Откройте главную без авторизации
2. UserMenu не виден ✅
3. Войдите в систему
4. UserMenu появляется в header ✅
5. Показывается имя и роль ✅

### Тест 2: Logout работает
1. Будучи авторизованным, кликните "Logout"
2. Кнопка показывает "Logging out..." ✅
3. После logout → редирект на главную ✅
4. UserMenu исчезает ✅
5. Все карточки теперь показывают модалку при клике ✅

### Тест 3: Защищённые карточки (не авторизован)
1. Откройте главную без авторизации
2. Кликните любую карточку из "Try Protected Features"
3. Модальное окно появляется ✅
4. Показывается "Registration Required" ✅
5. Есть кнопки "Create Account" и "Sign In" ✅

### Тест 4: Защита по ролям
1. Войдите как CONTRACTOR
2. Кликните карточку "Create Order" (CLIENT only)
3. Ошибка "Access denied" ✅
4. Карточка "Apply to Orders" работает ✅

### Тест 5: Success сообщения
1. Войдите в систему
2. Кликните любую доступную карточку
3. Зелёная полоска "Success! Action executed." ✅
4. Сообщение исчезает через 3 секунды ✅

## Кастомизация

### Добавить свою карточку
```tsx
<ProtectedFeatureCard
  icon="🎨"                    // Ваша иконка
  title="Your Feature"         // Ваш заголовок
  description="What it does"   // Описание
  action="Click Me"            // Текст кнопки
  requiredRoles={['CLIENT']}   // Опционально
  onExecute={() => {
    // Ваш код
    console.log('Feature executed!');
    router.push('/your-page');
  }}
/>
```

### Изменить стили UserMenu
Отредактируйте `frontend/components/features/auth/user-menu.tsx`:

```tsx
// Изменить цвет аватара
<div className="bg-gradient-to-br from-green-500 to-blue-600">

// Изменить цвет кнопки logout
<button className="bg-gray-600 hover:bg-gray-700">
```

### Изменить стили карточек
Отредактируйте `frontend/components/features/examples/protected-feature-card.tsx`:

```tsx
// Изменить hover эффект
<div className="hover:border-purple-500">

// Изменить кнопку
<button className="bg-gradient-to-r from-green-600 to-blue-600">
```

## Файлы

### Созданные файлы (3):
- `frontend/components/features/auth/user-menu.tsx`
- `frontend/components/features/examples/protected-feature-card.tsx`
- `docs/USER_MENU_AND_CARDS.md` (этот файл)

### Обновлённые файлы (1):
- `frontend/app/[locale]/page.tsx`

## Следующие шаги

1. **Добавить backend endpoint для logout:**
   ```typescript
   // api/src/auth/auth.controller.ts
   @Post('logout')
   async logout(@Res() res: Response) {
     res.clearCookie('accessToken');
     res.clearCookie('refreshToken');
     return { message: 'Logged out successfully' };
   }
   ```

2. **Добавить больше карточек** с вашими реальными функциями

3. **Кастомизировать** стили под ваш бренд

4. **Добавить аналитику** для отслеживания кликов по карточкам

---

**Статус:** ✅ Готово к тестированию
**Обновлено:** 2 ноября 2025

