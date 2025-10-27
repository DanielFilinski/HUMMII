# Next.js Frontend Guide - Hummii

> **Версия:** 1.0
> **Последнее обновление:** 27 октября 2025
> **Проект:** Hummii Service Marketplace Platform

---

## Содержание

1. [Принципы разработки](#принципы-разработки)
2. [Архитектура App Router](#архитектура-app-router)
3. [Server vs Client Components](#server-vs-client-components)
4. [React Query Patterns](#react-query-patterns)
5. [Обработка форм](#обработка-форм)
6. [Безопасность на клиенте](#безопасность-на-клиенте)
7. [Оптимизация производительности](#оптимизация-производительности)
8. [Стилизация с Tailwind CSS](#стилизация-с-tailwind-css)
9. [Управление состоянием](#управление-состоянием)
10. [Интеграция с внешними API](#интеграция-с-внешними-api)

---

## Принципы разработки

### Безопасность превыше всего

⚠️ **КРИТИЧЕСКИ ВАЖНО:**
- Этот проект обрабатывает платежи и персональные данные
- Требуется соответствие PIPEDA (канадское законодательство о конфиденциальности)
- Валидация данных на клиенте И сервере
- Никогда не доверять пользовательскому вводу
- Никакой чувствительной информации в клиентском коде

### Философия кода

- Думай пошагово перед написанием кода
- Пиши полный, функциональный код (без TODO или placeholder'ов)
- Баланс между читаемостью и производительностью
- Используй ранние возвраты для уменьшения вложенности
- Выноси сложную логику в custom hooks

### TypeScript Strict Mode

```typescript
// ✅ ХОРОШО - Правильная типизация
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit: (userId: string) => void;
}

export const UserCard = ({ user, onEdit }: UserCardProps) => {
  // ...
};

// ❌ ПЛОХО - Использование any
interface Props {
  data: any;           // Никогда не используй any
  callback: Function;  // Используй конкретную сигнатуру функции
}

// ✅ ХОРОШО - Используй unknown для неопределенных типов
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid data type');
}
```

---

## Архитектура App Router

### Структура директорий

```
app/
├── (auth)/              # Страницы аутентификации
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/         # Защищенные страницы
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── profile/
│       └── page.tsx
└── (public)/            # Публичные страницы
    ├── page.tsx         # Главная страница
    └── search/
        └── page.tsx
```

### Группировка маршрутов

Скобки `()` в названиях директорий создают группы маршрутов без влияния на URL:

```typescript
// app/(auth)/login/page.tsx → /login
// app/(dashboard)/orders/page.tsx → /orders
// app/(public)/page.tsx → /
```

### Metadata для SEO

```typescript
// app/(public)/contractor/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const profile = await fetchProfile(params.slug);

  return {
    title: `${profile.name} - ${profile.category} in ${profile.city} | Hummii`,
    description: `${profile.description.slice(0, 155)}...`,
    keywords: [profile.category, profile.city, 'Canada', 'contractor'],
    openGraph: {
      title: `Hire ${profile.name} on Hummii`,
      description: profile.description,
      images: [{
        url: profile.avatar,
        width: 1200,
        height: 630,
        alt: profile.name,
      }],
      type: 'profile',
      locale: 'en_CA',
      siteName: 'Hummii',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} - ${profile.category}`,
      images: [profile.avatar],
    },
    alternates: {
      canonical: `https://hummii.ca/contractor/${params.slug}`,
      languages: {
        'en-CA': `/en/contractor/${params.slug}`,
        'fr-CA': `/fr/contractor/${params.slug}`,
      },
    },
  };
}
```

---

## Server vs Client Components

### Server Component (по умолчанию)

```typescript
// app/orders/page.tsx
export default async function OrdersPage() {
  // Прямой вызов API на сервере
  const orders = await fetchOrders();

  return (
    <div>
      <h1>My Orders</h1>
      <OrderList orders={orders} />
    </div>
  );
}
```

**Когда использовать:**
- Статический контент
- Прямая выборка данных
- SEO-критичные страницы
- Нет необходимости в интерактивности

### Client Component

```typescript
// components/order-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function OrderForm() {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    if (response.ok) {
      router.push('/orders');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit">Create Order</button>
    </form>
  );
}
```

**Когда использовать:**
- Интерактивные элементы (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window, document)
- Сторонние библиотеки, требующие браузерное окружение

### Композиция компонентов

```typescript
// app/dashboard/page.tsx (Server Component)
import { Suspense } from 'react';
import { OrdersList } from './orders-list'; // Server
import { CreateOrderButton } from './create-order-button'; // Client

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Client component for interactivity */}
      <CreateOrderButton />

      {/* Server component with Suspense for streaming */}
      <Suspense fallback={<OrdersLoading />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
```

---

## React Query Patterns

### Настройка QueryClient

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Custom Hooks для запросов

```typescript
// hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.users.getById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => api.users.update(data),
    onMutate: async (newUser) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['users', newUser.id] });

      const previous = queryClient.getQueryData(['users', newUser.id]);

      queryClient.setQueryData(['users', newUser.id], newUser);

      return { previous };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['users', newUser.id], context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users', data.id] });
    },
  });
};
```

### Использование в компонентах

```typescript
// components/user-profile.tsx
'use client';

import { useUser, useUpdateUser } from '@/hooks/use-user';
import { toast } from 'sonner';

export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const handleUpdate = async (name: string) => {
    try {
      await updateUser.mutateAsync({ id: userId, name });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <EditButton onUpdate={handleUpdate} />
    </div>
  );
}
```

---

## Обработка форм

### React Hook Form + Zod

```typescript
// components/login-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur, not on every keystroke
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Валидация для канадского рынка

```typescript
// lib/validation-schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),

  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),

  phone: z.string()
    .regex(/^\+1\d{10}$/, 'Invalid Canadian phone number (+1XXXXXXXXXX)'),

  postalCode: z.string()
    .regex(/^[A-Z]\d[A-Z] \d[A-Z]\d$/, 'Invalid Canadian postal code (A1A 1A1)'),
});
```

---

## Безопасность на клиенте

### ❌ НИКОГДА не делай так

```typescript
// ❌ ПЛОХО - Хранение токенов в localStorage
localStorage.setItem('token', token); // НИКОГДА!
sessionStorage.setItem('token', token); // НИКОГДА!

// ❌ ПЛОХО - Открытый API ключ
const apiKey = 'AIzaSy...'; // НИКОГДА!
<GoogleMap apiKey={apiKey} />

// ❌ ПЛОХО - Отсутствие валидации
const handleSubmit = (data: any) => {
  api.register(data); // Опасно!
};
```

### ✅ Правильные подходы

**Аутентификация через HTTP-only cookies:**

```typescript
// app/api/auth/login/route.ts
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Verify credentials
  const { accessToken, refreshToken } = await authService.login(email, password);

  // Set HTTP-only cookies
  cookies().set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 15, // 15 minutes
  });

  cookies().set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json({ success: true });
}
```

**Защита API ключей:**

```typescript
// app/api/maps/route.ts (Server-side)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  // API key hidden on server
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
  );

  return Response.json(await response.json());
}
```

**Безопасные внешние ссылки:**

```typescript
<a
  href={externalUrl}
  target="_blank"
  rel="noopener noreferrer"  // Предотвращает tabnabbing
  className="text-blue-600 hover:underline"
>
  Visit Website
</a>
```

**Валидация загрузки файлов:**

```typescript
const validateFile = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  return true;
};
```

---

## Оптимизация производительности

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy load тяжелых компонентов
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,  // Client-only component
  loading: () => <MapSkeleton />,
});

const RichTextEditor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

export default function CreateOrderPage() {
  return (
    <div>
      <h1>Create Order</h1>
      <MapComponent />
      <RichTextEditor />
    </div>
  );
}
```

### Оптимизация изображений

```typescript
import Image from 'next/image';

// ✅ ХОРОШО - Оптимизированное изображение
<Image
  src={user.avatar}
  alt={user.name}
  width={200}
  height={200}
  className="rounded-full"
  priority={isAboveFold}  // Для изображений above-the-fold
  placeholder="blur"
  blurDataURL={user.avatarBlur}
/>

// ❌ ПЛОХО - Неоптимизированное
<img src={user.avatar} alt={user.name} />
```

### React Performance

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize дорогих компонентов
export const UserCard = memo(({ user }: Props) => {
  // Expensive rendering
  return <div>...</div>;
});

// Memoize дорогих вычислений
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => b.rating - a.rating);
}, [users]);

// Memoize callbacks
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### Bundle Size Optimization

```typescript
// ✅ ХОРОШО - Tree-shakeable import
import { format } from 'date-fns';

// ❌ ПЛОХО - Импортирует всю библиотеку
import moment from 'moment'; // Тяжелая библиотека (300KB+)

// ✅ ХОРОШО - Используй легкие альтернативы
import dayjs from 'dayjs'; // Легкая альтернатива (2KB)
```

---

## Стилизация с Tailwind CSS

### Utility Classes

```typescript
import { cn } from '@/lib/utils'; // clsx + tailwind-merge

const Button = ({ variant, className, ...props }: ButtonProps) => (
  <button
    className={cn(
      'rounded-lg px-4 py-2 font-medium transition-colors',
      variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
      variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      className
    )}
    {...props}
  />
);
```

### Mobile-first Responsive

```typescript
// ✅ ХОРОШО - Mobile-first подход
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Breakpoints в Tailwind:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### Dark Mode Support

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...
}

// components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}

// Usage in components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content
</div>
```

---

## Управление состоянием

### Когда использовать что

- **useState**: Локальное UI состояние компонента (modals, toggles, inputs)
- **Zustand**: Глобальное UI состояние (theme, sidebar, user preferences)
- **React Query**: Серверное состояние (API данные, caching, optimistic updates)
- **Context**: Редко - только для theme или i18n (избегай для частых обновлений)

### Zustand Store

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),
    }),
    { name: 'ui-store' }
  )
);

// Usage with selector (prevent unnecessary re-renders)
const theme = useUIStore((state) => state.theme);
const toggleTheme = useUIStore((state) => state.toggleTheme);
```

---

## Интеграция с внешними API

### Stripe Integration

```typescript
// components/checkout-form.tsx
'use client';

import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    // Create PaymentIntent on server
    const { clientSecret } = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 5000 }), // $50.00 CAD
    }).then(res => res.json());

    // Confirm payment with 3D Secure
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      toast.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="rounded border p-3" />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white"
      >
        Pay $50.00 CAD
      </button>
    </form>
  );
}

export function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
```

### Socket.io Real-time Chat

```typescript
// hooks/use-socket.ts
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: {
        token: getAccessToken(), // From cookies via API route
      },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}

// components/chat-room.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';

export function ChatRoom({ roomId }: { roomId: string }) {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join-room', roomId);

    // Listen for messages
    const handleMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('message', handleMessage);

    // Cleanup
    return () => {
      socket.off('message', handleMessage);
      socket.emit('leave-room', roomId);
    };
  }, [socket, roomId]);

  const sendMessage = (content: string) => {
    if (!socket) return;
    socket.emit('send-message', { roomId, content });
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

---

## Связанные документы

- **[CLAUDE.md](/Volumes/FilinSky/PROJECTS/Hummii/CLAUDE.md)** - Полное руководство по проекту
- **[SECURITY_BEST_PRACTICES.md](/Volumes/FilinSky/PROJECTS/Hummii/SECURITY_BEST_PRACTICES.md)** - Практики безопасности
- **[docs/Stack_EN.md](/Volumes/FilinSky/PROJECTS/Hummii/docs/Stack_EN.md)** - Технический стек

---

**Последнее обновление:** 27 октября 2025
