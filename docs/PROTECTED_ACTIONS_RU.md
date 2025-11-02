# Защита действий - Руководство по использованию

## Быстрый старт

### Защита кнопки действия

```tsx
import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { useRouter } from 'next/navigation';

function MyProtectedButton() {
  const router = useRouter();
  
  const { execute, showModal, closeModal, reason, action } = useProtectedAction({
    requiredRoles: ['CLIENT'], // Опционально - проверка роли
    reason: 'Чтобы создать заказ',
    action: 'Вам нужно зарегистрироваться как клиент',
  });

  const handleClick = () => {
    execute(() => {
      // Этот код выполнится ТОЛЬКО если пользователь авторизован
      router.push('/orders/create');
    });
  };

  return (
    <>
      <button onClick={handleClick}>Создать заказ</button>
      
      <AuthModal 
        isOpen={showModal} 
        onClose={closeModal}
        reason={reason}
        action={action}
      />
    </>
  );
}
```

### Защита API запроса

```tsx
import { useProtectedAction } from '@/hooks/use-protected-action';
import { AuthModal } from '@/components/auth/auth-modal';
import { apiClient } from '@/lib/api/client';

function SendMessageButton({ orderId }: { orderId: string }) {
  const { execute, showModal, closeModal } = useProtectedAction({
    reason: 'Чтобы отправлять сообщения',
  });

  const sendMessage = () => {
    execute(async () => {
      // Асинхронный код тоже поддерживается
      await apiClient.post('/messages', { orderId, content: 'Hello!' });
      console.log('Сообщение отправлено!');
    });
  };

  return (
    <>
      <button onClick={sendMessage}>Отправить</button>
      <AuthModal isOpen={showModal} onClose={closeModal} />
    </>
  );
}
```

## Готовые компоненты

### CreateOrderButton

```tsx
import { CreateOrderButton } from '@/components/features/orders/create-order-button';

// Базовое использование
<CreateOrderButton />

// С кастомизацией
<CreateOrderButton 
  text="Создать объявление" 
  variant="secondary"
  className="w-full"
/>
```

### ApplyToOrderButton

```tsx
import { ApplyToOrderButton } from '@/components/features/orders/apply-to-order-button';

<ApplyToOrderButton 
  orderId="order-123"
  onApplied={() => alert('Заявка отправлена!')}
  text="Откликнуться"
/>
```

### ChatInput

```tsx
import { ChatInput } from '@/components/features/chat/chat-input';

<ChatInput 
  orderId="order-123"
  onMessageSent={(msg) => console.log('Отправлено:', msg)}
  placeholder="Введите сообщение..."
/>
```

## Параметры useProtectedAction

| Параметр | Тип | Описание |
|----------|-----|----------|
| `requiredRoles` | `UserRole[]` | Опционально. Требуемые роли: `['CLIENT']`, `['CONTRACTOR']`, `['ADMIN']` |
| `reason` | `string` | Опционально. Причина требования авторизации |
| `action` | `string` | Опционально. Описание действия |
| `onSuccess` | `() => void` | Опционально. Callback при успехе |
| `onInsufficientRole` | `() => void` | Опционально. Callback при недостаточной роли |

## Возвращаемые значения

| Значение | Тип | Описание |
|----------|-----|----------|
| `execute` | `(callback) => void` | Выполнить защищённое действие |
| `showModal` | `boolean` | Показывать ли модалку |
| `closeModal` | `() => void` | Закрыть модалку |
| `openModal` | `() => void` | Открыть модалку вручную |
| `isAuthenticated` | `boolean` | Авторизован ли пользователь |
| `hasRequiredRole` | `boolean` | Есть ли у пользователя нужная роль |

## Защита на бэкенде

### Базовая защита (только авторизация)

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Post()
async createOrder() {
  // Только авторизованные пользователи
}
```

### Защита с проверкой роли

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENT', 'CONTRACTOR') // Разрешить CLIENT или CONTRACTOR
@Post()
async createOrder() {
  // Только CLIENT или CONTRACTOR
}
```

### Получить текущего пользователя

```typescript
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('me')
async getProfile(@CurrentUser() user: any) {
  console.log('User ID:', user.userId);
  console.log('User role:', user.role);
  return user;
}
```

## Частые сценарии

### 1. Создание заказа (только CLIENT)

```tsx
const { execute } = useProtectedAction({
  requiredRoles: ['CLIENT'],
  reason: 'Чтобы создать заказ',
  action: 'Зарегистрируйтесь как клиент',
});
```

### 2. Отклик на заказ (только CONTRACTOR)

```tsx
const { execute } = useProtectedAction({
  requiredRoles: ['CONTRACTOR'],
  reason: 'Чтобы откликнуться на заказ',
  action: 'Зарегистрируйтесь как подрядчик',
});
```

### 3. Отправка сообщения (любой авторизованный)

```tsx
const { execute } = useProtectedAction({
  reason: 'Чтобы отправлять сообщения',
  action: 'Войдите или зарегистрируйтесь',
});
```

### 4. Добавление в избранное (любой авторизованный)

```tsx
const { execute } = useProtectedAction({
  reason: 'Чтобы сохранить в избранное',
});
```

## Что происходит при клике?

### Пользователь НЕ авторизован

1. Клик по кнопке
2. ❌ Проверка авторизации провалена
3. 📱 Показывается модалка с предложением зарегистрироваться
4. Пользователь кликает "Создать аккаунт"
5. 💾 URL сохраняется в sessionStorage
6. ➡️ Редирект на /register
7. Пользователь регистрируется
8. ✅ После успешной регистрации → редирект на сохранённый URL

### Пользователь авторизован

1. Клик по кнопке
2. ✅ Проверка авторизации успешна
3. ✅ Проверка роли успешна (если требуется)
4. ▶️ Выполняется callback
5. 🎉 Действие выполнено

### Пользователь авторизован, но не та роль

1. Клик по кнопке
2. ✅ Проверка авторизации успешна
3. ❌ Проверка роли провалена
4. 🚫 Показывается ошибка "Недостаточно прав"
5. Callback НЕ выполняется

## Безопасность

### ✅ Правильно (двухуровневая защита)

```tsx
// Фронтенд - для UX
const { execute } = useProtectedAction({ requiredRoles: ['CLIENT'] });
```

```typescript
// Бэкенд - для безопасности
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CLIENT')
@Post()
```

### ❌ Неправильно (только фронтенд)

```tsx
// Только проверка на фронтенде
if (!user) return <div>Войдите</div>;
// ⚠️ Легко обойти через DevTools!
```

### ⚠️ Неправильно (только бэкенд)

```typescript
// Только защита на бэкенде
@UseGuards(JwtAuthGuard)
@Post()
// ⚠️ Плохой UX - пользователь не знает зачем нужна авторизация
```

## Тестирование

### 1. Проверка модалки

```bash
# Откройте браузер в режиме инкогнито (не авторизован)
# Кликните на защищённую кнопку
# Ожидается: модалка с предложением регистрации
```

### 2. Проверка редиректа

```bash
# 1. Не авторизован
# 2. Клик на "Создать заказ"
# 3. Модалка → "Создать аккаунт"
# 4. Регистрация
# 5. Ожидается: редирект на страницу создания заказа
```

### 3. Проверка API защиты

```bash
# Попытка без токена
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json"

# Ожидается: 401 с кодом AUTH_REQUIRED
```

## Troubleshooting

### Модалка не показывается

1. Проверьте импорт `AuthModal`:
   ```tsx
   import { AuthModal } from '@/components/auth/auth-modal';
   ```

2. Проверьте что передаёте `isOpen`:
   ```tsx
   <AuthModal isOpen={showModal} onClose={closeModal} />
   ```

### Редирект не работает после логина

1. Проверьте что используете обновлённые формы:
   - `frontend/components/auth/login-form.tsx`
   - `frontend/components/auth/register-form.tsx`

2. Проверьте sessionStorage в DevTools:
   ```javascript
   sessionStorage.getItem('redirect_after_auth')
   ```

### Бэкенд возвращает 401

1. Проверьте что применены гуарды:
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   ```

2. Проверьте что токен отправляется (cookies):
   ```typescript
   credentials: 'include' // В apiClient
   ```

## Дополнительная информация

- 📖 Полная документация: `/docs/PROTECTED_ACTIONS.md`
- 🔒 Безопасность: `.claude/core/core-security.mdc`
- 🎯 API документация: http://localhost:3001/api/docs (Swagger)

---

**Обновлено:** 2 ноября 2025
**Статус:** ✅ Готово к использованию

