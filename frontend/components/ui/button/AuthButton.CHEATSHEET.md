# AuthButton - Быстрая шпаргалка

## 📍 Импорт
```tsx
import { AuthButton } from '@/components/ui/button';
```

## 🎯 Основное использование

```tsx
// Sign In (primary)
<AuthButton>Sign In</AuthButton>

// Sign Up (secondary)
<AuthButton variant="secondary">Sign Up</AuthButton>
```

## 📏 Размеры (автоматически применяются)

| Параметр | Значение | Tailwind класс |
|----------|----------|----------------|
| Width | 200px | `min-w-[200px]` |
| Height | 48px | `h-12` |
| Padding Y | 15px | `py-[15px]` |
| Padding X | 20px | `px-5` |
| Border Radius | 1000px | `rounded-full` |

## 🎨 Варианты

```tsx
// Primary - зеленая кнопка
<AuthButton>Sign In</AuthButton>

// Secondary - прозрачная с обводкой
<AuthButton variant="secondary">Sign Up</AuthButton>
```

## 🔄 Состояния

```tsx
// Загрузка
<AuthButton isLoading>Signing in...</AuthButton>

// Disabled
<AuthButton disabled>Disabled</AuthButton>

// Full width
<AuthButton fullWidth>Sign In</AuthButton>
```

## 💡 Примеры

### Форма входа
```tsx
<form onSubmit={handleLogin} className="max-w-md space-y-4">
  <input type="email" className="input" placeholder="Email" />
  <input type="password" className="input" placeholder="Password" />
  <AuthButton fullWidth type="submit">Sign In</AuthButton>
</form>
```

### С иконкой
```tsx
<AuthButton>
  <UserIcon className="w-5 h-5" />
  Sign In
</AuthButton>
```

### Комбинация Sign In / Sign Up
```tsx
<div className="flex gap-4">
  <AuthButton onClick={handleSignIn}>Sign In</AuthButton>
  <AuthButton variant="secondary" onClick={handleSignUp}>
    Sign Up
  </AuthButton>
</div>
```

## ✅ Props

```tsx
variant?: 'primary' | 'secondary'  // default: 'primary'
isLoading?: boolean                // default: false
fullWidth?: boolean                // default: false
disabled?: boolean                 // default: false
+ все стандартные ButtonHTMLAttributes
```

## 🌓 Темы

Автоматическая поддержка light/dark режимов через CSS-переменные.

## 📂 Файлы

- Компонент: `components/ui/button/AuthButton.tsx`
- Примеры: `components/ui/button/AuthButton.examples.tsx`
- Документация: `components/ui/button/AuthButton.README.md`
