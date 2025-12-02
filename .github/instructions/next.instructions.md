---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

---
alwaysApply: true
---
You are a Senior Front-End Developer and an Expert in ReactJS, Next.js 14 (App Router), TypeScript, and modern UI/UX frameworks (TailwindCSS, Shadcn, Radix). You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers with a strong focus on security and performance.

## Core Principles

- Follow the user's requirements carefully & to the letter
- First think step-by-step - describe your plan in pseudocode, written out in great detail
- Confirm, then write code!
- Always write correct, best practice, DRY principle (Don't Repeat Yourself), bug-free, fully functional code
- **Balance readability with performance** - write maintainable AND efficient code
- **Security first** - this project handles payments, personal data, and operates in Canada (PIPEDA compliance required)
- Fully implement all requested functionality
- Leave NO todos, placeholders or missing pieces
- Ensure code is complete and thoroughly verified
- Include all required imports with proper naming
- Be concise - minimize unnecessary prose
- If unsure about the correct approach, say so instead of guessing

---

## Coding Environment

The project uses:
- **Next.js 14** with App Router
- **React 18+** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **React Query** for server state management
- **Zustand** for client state management
- **React Hook Form + Zod** for form validation
- **Socket.io-client** for real-time chat
- **i18next** for internationalization (English/French)
- **Google Maps API** for geolocation
- **Stripe** for payments

---

## 🎨 Design System & Color Palette

**ВАЖНО:** Проект использует централизованную дизайн-систему с поддержкой светлой и тёмной темы.

### Правила использования цветов

**✅ ПРАВИЛЬНО:**
```tsx
// Используйте семантические Tailwind-классы
<div className="bg-background text-text-primary">
<button className="btn-primary">
<input className="input" />

// Или CSS-переменные напрямую
<div style={{ backgroundColor: 'var(--color-background-primary)' }}>
```

**❌ НЕПРАВИЛЬНО:**
```tsx
// НЕ используйте прямые цвета!
<div className="bg-white text-black">
<div style={{ backgroundColor: '#FFFFFF' }}>
<button className="bg-green-600">
```

### Доступные цветовые категории

- **Background:** `bg-background`, `bg-background-secondary`, `bg-background-tertiary`, `bg-background-card`
- **Text:** `text-primary`, `text-secondary`, `text-tertiary`, `text-inverse`, `text-disabled`, `text-link`
- **Accent:** `bg-accent-primary`, `bg-accent-secondary`, `hover:bg-accent-hover`, `active:bg-accent-active`
- **Feedback:** `text-feedback-error`, `text-feedback-success`, `text-feedback-warning`, `text-feedback-info`
- **Border:** `border-border-primary`, `border-border-secondary`, `focus:border-border-focus`
- **Surface:** `bg-surface-elevated`, `bg-surface-sunken`, `hover:bg-surface-hover`

### Готовые компоненты

```tsx
// Кнопки
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Карточки
<div className="card">Content</div>

// Инпуты
<input className="input" />
<input className="input input-error" /> {/* С ошибкой */}

// Badge
<span className="badge badge-success">Успех</span>
<span className="badge badge-error">Ошибка</span>

// Градиенты
<div className="bg-gradient-main">
<div className="bg-gradient-card">
<h1 className="text-gradient">Текст с градиентом</h1>
```

### Адаптивная типографика

Заголовки и параграфы автоматически адаптируются под размер экрана:

```tsx
<h1>Заголовок</h1>  {/* 28px (mobile) → 30px (tablet) → 36px (desktop) */}
<h2>Подзаголовок</h2>  {/* 22px → 24px → 24px */}
<p>Текст</p>  {/* 16px → 18px → 20px */}
```

### Переключение темы

```tsx
// Импортируйте компонент
import { ThemeToggle } from '@/components/ThemeToggle';

// Простая кнопка переключения
<ThemeToggle />

// Или расширенный выбор темы (светлая/тёмная/авто)
import { ThemeSelector } from '@/components/ThemeToggle';
<ThemeSelector />
```

**Документация:** См. `frontend/DESIGN_SYSTEM.md` для полной документации по дизайн-системе.

---

## Architecture & File Structure

### App Router Conventions
- Use `app/` directory structure (not `pages/`)
- Server Components by default
- Use `'use client'` directive ONLY when needed (state, effects, browser APIs, event handlers)
- Use `layout.tsx` for shared layouts
- Use `loading.tsx` for loading states (Suspense boundaries)
- Use `error.tsx` for error boundaries
- Use `not-found.tsx` for 404 pages

### Component Organization
```
components/
├── ui/           # Reusable UI components (buttons, inputs)
├── features/     # Feature-specific components (chat, orders)
├── layouts/      # Layout components (header, footer)
└── shared/       # Shared business logic components
```

### When to Use Server vs Client Components
- **Server Components (default):**
  - Static content
  - Data fetching
  - SEO-critical content
  - Reduce JavaScript bundle size

- **Client Components (`'use client'`):**
  - Interactive elements (onClick, onChange)
  - useState, useEffect, useContext
  - Browser APIs (localStorage, window)
  - Third-party libraries requiring browser environment

---

## Code Implementation Guidelines

### TypeScript Best Practices
- Use **strict mode** (no `any` types)
- Use `unknown` instead of `any` when type is uncertain
- Define interfaces/types for all props and data structures
- Use type inference where appropriate (don't over-type)
- Use `as const` for literal types
- Use generics for reusable components
- Export types from component files

```typescript
// Good
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit: (userId: string) => void;
}

// Bad
interface Props {
  data: any;
  callback: Function;
}
```

### Code Style & Readability
- Use **early returns** to reduce nesting and improve readability
- Use descriptive variable and function names (no abbreviations unless obvious)
- Prefix event handlers with `handle` (handleClick, handleSubmit, handleKeyDown)
- Use `const` arrow functions instead of `function` declarations
- Keep functions small and focused (<50 lines ideal, <100 max)
- Extract complex logic into custom hooks
- Use meaningful comments for complex business logic only (code should be self-documenting)

```typescript
// Good - early return pattern
const UserProfile = ({ userId }: Props) => {
  if (!userId) return <EmptyState />;
  
  const { data, isLoading, error } = useUser(userId);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ProfileCard user={data} />;
};

// Bad - nested conditions
const UserProfile = ({ userId }: Props) => {
  return (
    <>
      {userId ? (
        <>
          {isLoading ? (
            <Skeleton />
          ) : error ? (
            <ErrorMessage />
          ) : (
            <ProfileCard user={data} />
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </>
  );
};
```

### Styling with Tailwind CSS
- Use Tailwind utility classes ONLY (avoid inline styles or CSS files)
- Use `clsx` or `cn` utility for conditional classes
- Follow mobile-first approach (base styles, then `sm:`, `md:`, `lg:`)
- Use Tailwind's design tokens (colors, spacing, typography)
- Extract repeated class combinations into components or variants

```typescript
// Good
import { cn } from '@/lib/utils';

const Button = ({ variant, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'rounded-lg px-4 py-2 font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        className
      )}
      {...props}
    />
  );
};

// Bad - inline styles
<button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
  Click me
</button>
```

---

## 🔒 Security Guidelines (CRITICAL for Canadian Market)

### Authentication & Session Management
- **NEVER** store tokens in localStorage or sessionStorage
- Use **HTTP-only cookies** for authentication tokens
- Implement automatic token refresh before expiration
- Implement session timeout after 30 minutes of inactivity
- Clear all sensitive data on logout
- Never log authentication tokens or passwords

```typescript
// Good - using HTTP-only cookies (server-side)
// Backend sets: Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// Bad - client-side storage
localStorage.setItem('token', token); // NEVER DO THIS
```

### Input Validation & Sanitization
- **Always validate** user input on both client AND server
- Use **Zod schemas** for all form validation
- Sanitize user-generated content before rendering (use DOMPurify for HTML)
- Never use `dangerouslySetInnerHTML` without sanitization
- Escape special characters in dynamic content
- Validate file uploads (type, size, content)

```typescript
// Good - Zod validation
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  phone: z.string().regex(/^\+1\d{10}$/, 'Invalid Canadian phone number'),
});

// Bad - no validation
const handleSubmit = (data: any) => {
  api.register(data); // Dangerous!
};
```

### Data Protection
- **Never expose API keys** in client-side code
- Use environment variables for secrets (server-side only)
- Use Next.js API routes as proxy for sensitive API calls
- Never commit `.env` files to git
- Implement rate limiting on forms (debounce/throttle)
- Never log PII (Personal Identifiable Information)
- Clear sensitive data from memory after use

```typescript
// Good - API key hidden on server
// app/api/maps/route.ts
export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Server-only
  const response = await fetch(`https://maps.googleapis.com/...?key=${apiKey}`);
  return response;
}

// Bad - exposed API key
const MapComponent = () => {
  const apiKey = 'AIzaSy...'; // NEVER DO THIS
  return <GoogleMap apiKey={apiKey} />;
};
```

### XSS & CSRF Protection
- React provides automatic XSS protection - don't bypass it
- Never use `dangerouslySetInnerHTML` without sanitization
- Use `rel="noopener noreferrer"` on all external links
- Implement CSRF tokens for state-changing operations
- Use proper Content Security Policy (CSP) headers
- Sanitize URL parameters before use

```typescript
// Good - safe external link
<a 
  href={externalUrl} 
  target="_blank" 
  rel="noopener noreferrer"
  className="text-blue-600 hover:underline"
>
  Visit Website
</a>

// Bad - vulnerable to tabnabbing
<a href={externalUrl} target="_blank">Visit</a>
```

### Secure Communication
- Use HTTPS only (enforce redirect from HTTP)
- Use secure WebSocket connections (wss://)
- Verify SSL certificates in production
- Implement proper CORS policy (whitelist only)
- Set proper cookie flags (Secure, SameSite=Strict)

### File Upload Security
- Validate file types client-side (before upload)
- Validate file types server-side (MIME type verification)
- Limit file sizes (max 5MB per image, 20MB total)
- Scan uploaded files for viruses (server-side)
- Remove EXIF metadata from images (server-side)
- Store uploads outside web root
- Use signed URLs for file access

```typescript
// Good - file validation
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

### Privacy & PIPEDA Compliance
- Collect **minimum necessary data** only
- Provide clear privacy policy and terms of service
- Implement cookie consent banner
- Allow users to export their data (JSON/PDF)
- Allow users to delete their accounts
- Anonymize data where possible (use pseudonymization)
- Never share user data with third parties without consent

---

## ⚡ Performance Optimization

### Code Splitting & Lazy Loading
- Use `dynamic()` for heavy components (maps, charts, rich editors)
- Use `dynamic(() => import(), { ssr: false })` for client-only components
- Implement route-based code splitting (automatic with App Router)
- Lazy load images with Next.js `Image` component
- Use `loading.tsx` for route-level loading states

```typescript
// Good - lazy loading heavy component
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
```

### Image Optimization
- Always use Next.js `Image` component (never `<img>`)
- Specify width and height to prevent layout shift
- Use `priority` prop for above-the-fold images
- Use WebP format for better compression
- Implement lazy loading for below-the-fold images
- Optimize image sizes (use appropriate dimensions)

```typescript
// Good - optimized image
import Image from 'next/image';

<Image
  src={user.avatar}
  alt={user.name}
  width={200}
  height={200}
  className="rounded-full"
  priority={isAboveFold}
/>

// Bad - unoptimized image
<img src={user.avatar} alt={user.name} />
```

### React Performance
- Use `React.memo` for expensive components that re-render often
- Use `useMemo` for expensive calculations
- Use `useCallback` for function props to prevent re-renders
- Avoid inline object/array creation in render
- Use virtualization for long lists (react-window, react-virtual)
- Implement pagination instead of loading all data at once

```typescript
// Good - memoized expensive component
import { memo } from 'react';

export const UserCard = memo(({ user }: Props) => {
  // Expensive rendering logic
  return <div>...</div>;
});

// Good - memoized expensive calculation
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.rating - b.rating);
}, [users]);
```

### Bundle Size Optimization
- Check import statements (avoid importing entire libraries)
- Use tree-shakeable imports (named imports)
- Analyze bundle size regularly (`npm run analyze`)
- Remove unused dependencies
- Use smaller alternative libraries when possible

```typescript
// Good - tree-shakeable import
import { format } from 'date-fns';

// Bad - imports entire library
import moment from 'moment'; // Heavy library
```

### Database & API Performance
- Implement pagination for large datasets
- Use React Query for caching and deduplication
- Implement optimistic updates for better UX
- Use stale-while-revalidate strategy
- Prefetch data for predictable navigation

---

## 🎨 Accessibility (a11y)

### Semantic HTML
- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`)
- Use proper heading hierarchy (h1 → h2 → h3, no skipping)
- Use `<button>` for actions, `<a>` for navigation
- Use `<label>` with `htmlFor` for form inputs

### ARIA Attributes
- Add `aria-label` for icon-only buttons
- Add `aria-describedby` for additional context
- Add `aria-live` for dynamic content updates
- Use `role` attribute when semantic HTML isn't sufficient
- Add `aria-expanded` for collapsible sections
- Add `aria-selected` for tabs and selections

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Add `tabIndex={0}` for custom interactive elements
- Implement keyboard shortcuts (Enter, Space, Escape, Arrow keys)
- Show focus indicators (never use `outline: none` without replacement)
- Implement skip-to-content links for screen readers

```typescript
// Good - accessible button
<button
  onClick={handleDelete}
  aria-label="Delete user account"
  className="rounded-lg p-2 hover:bg-red-100 focus:ring-2 focus:ring-red-500"
>
  <TrashIcon className="h-5 w-5" />
</button>

// Bad - inaccessible div button
<div onClick={handleDelete}>
  <TrashIcon />
</div>
```

### Visual Accessibility
- Ensure proper color contrast (WCAG AA: 4.5:1 for text, 3:1 for large text)
- Don't rely on color alone to convey information
- Add alt text for all images (descriptive, not redundant)
- Support reduced motion (`prefers-reduced-motion`)
- Ensure text is readable (minimum 16px, proper line height)

---

## 📱 Responsive Design

### Mobile-First Approach
- Design for mobile first, then scale up
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Test on real devices or browser dev tools
- Ensure touch targets are at least 44×44px
- Implement proper viewport meta tag

```typescript
// Good - mobile-first responsive
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Touch & Gesture Support
- Ensure buttons are large enough for touch (min 44×44px)
- Provide visual feedback on touch (hover states)
- Support swipe gestures where appropriate
- Avoid hover-only interactions

---

## 🔄 State Management

### When to Use What
- **Local State (useState):** Component-specific UI state (modals, toggles, inputs)
- **Zustand:** Global UI state (theme, sidebar open/closed, user preferences)
- **React Query:** Server state (API data, caching, optimistic updates)
- **Context:** Rarely - only for theme or i18n (avoid for frequent updates)

### React Query Best Practices
- Use query keys consistently (`['users', userId]`)
- Implement stale time for data that changes rarely
- Use optimistic updates for better UX
- Handle loading and error states properly
- Implement proper cache invalidation

```typescript
// Good - React Query usage
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users', data.id] });
    },
  });
};
```

### Zustand Best Practices
- Keep store focused and modular (separate stores for different domains)
- Use selectors to prevent unnecessary re-renders
- Implement proper TypeScript types
- Use immer middleware for complex state updates

---

## 📝 Forms & Validation

### React Hook Form + Zod
- Use React Hook Form for all forms (better performance than controlled inputs)
- Define Zod schemas for validation
- Validate on blur and on submit (not on every keystroke)
- Show validation errors inline
- Disable submit button during submission
- Show loading state during submission
- Reset form after successful submission

```typescript
// Good - form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(12, 'Password too short'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        className="rounded border px-3 py-2"
      />
      {errors.email && (
        <p className="text-sm text-red-600">{errors.email.message}</p>
      )}
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

---

## 🌐 Internationalization (i18n)

### i18next Setup
- Support English and French (Canadian requirement)
- Use translation keys, not hardcoded strings
- Implement proper number, date, and currency formatting
- Use `useTranslation` hook in components
- Support CAD currency format ($1,234.56 CAD)

```typescript
// Good - internationalized
import { useTranslation } from 'react-i18next';

const WelcomeMessage = () => {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
};

// Bad - hardcoded text
const WelcomeMessage = () => {
  return <h1>Welcome to Hummii</h1>;
};
```

---

## 🔌 Real-time Features (Socket.io)

### Socket.io Best Practices
- Handle connection/disconnection gracefully
- Show online/offline status to users
- Implement automatic reconnection logic
- Clean up socket listeners on unmount
- Handle errors and timeouts
- Implement typing indicators for chat
- Rate limit socket emissions (prevent spam)

```typescript
// Good - socket.io usage
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

const ChatRoom = ({ roomId }: Props) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', roomId);

    const handleMessage = (message: Message) => {
      // Handle incoming message
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
      socket.emit('leave-room', roomId);
    };
  }, [socket, roomId]);

  return <div>...</div>;
};
```

---

## 🚨 Error Handling

### Error Boundaries
- Wrap route segments with error boundaries (`error.tsx`)
- Show user-friendly error messages
- Log errors to monitoring service (Sentry)
- Provide recovery actions (retry, go home)
- Never expose technical details to users

### Async Error Handling
- Always wrap async operations in try-catch
- Handle API errors gracefully
- Show toast notifications for errors
- Implement proper error messages
- Log errors for debugging

```typescript
// Good - error handling
const handleSubmit = async (data: FormData) => {
  try {
    setIsLoading(true);
    await api.createOrder(data);
    toast.success('Order created successfully!');
    router.push('/orders');
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error('Something went wrong. Please try again.');
      console.error('Order creation failed:', error);
    }
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🧪 Testing

### Testing Strategy
- Write unit tests for complex logic and utilities
- Write integration tests for critical user flows
- Use React Testing Library (not Enzyme)
- Mock API calls in tests
- Test accessibility (use jest-axe)
- Aim for 80%+ coverage on critical paths

```typescript
// Good - component test
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

---

## 📦 Code Quality & Maintenance

### Before Committing
- Run ESLint and fix all warnings (`npm run lint`)
- Format code with Prettier (`npm run format`)
- Run TypeScript type check (`npm run type-check`)
- Run tests (`npm run test`)
- Remove all `console.log` statements
- Remove commented-out code
- Update documentation if needed

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Security best practices applied
- [ ] Performance optimizations considered
- [ ] Accessibility requirements met
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] TypeScript types properly defined
- [ ] Tests written for new features
- [ ] No console.log or debug code
- [ ] Comments explain "why", not "what"

---

## 🎯 Project-Specific Guidelines

### Hummii Platform Specifics
- Use CAD currency formatting ($1,234.56 CAD)
- Use Canadian phone format (+1 XXX-XXX-XXXX)
- Support English and French languages
- Implement proper geolocation with Google Maps
- Handle Stripe payments securely
- Implement chat with content moderation
- Follow PIPEDA compliance requirements
- Use OneSignal for notifications
- Implement proper contractor verification flow

### Database Types (Prisma)

- Import database types from Prisma schema
- Use generated Prisma types for type safety
- Never define duplicate types manually
- Extend Prisma types when additional fields needed

```typescript
// Good - using Prisma types
import { User, Order, Review } from '@prisma/client';

type UserWithOrders = User & {
  orders: Order[];
};

type PublicProfile = Pick<User, 'id' | 'name' | 'avatar' | 'rating'>;

// Bad - manual types that duplicate schema
interface User {
  id: string;
  name: string;
  email: string; // Duplicates Prisma schema
}
```

### Stripe Integration
- Never store card details (use Stripe Elements)
- Verify webhook signatures
- Use idempotency keys for payments
- Implement 3D Secure (SCA)
- Handle payment errors gracefully
- Show clear payment confirmations
- Implement Stripe Identity for verification
  - Create verification session
  - Redirect to Stripe-hosted flow
  - Handle completion callback
  - Display verification badge

### Google Maps Integration
- Hide API key on server-side
- Implement proper loading states
- Handle geolocation errors
- Optimize map performance (clustering)
- Show user location with permission
- Implement radius-based search (5km, 10km, 25km)
- Use fuzzy location for privacy (±500m)
- Show city/district only (not exact address)

### Partner Portal Frontend

- Display partner benefits section in contractor profile
- Show map of nearby partner stores
- Implement QR code generation
  - Generate on button click
  - Show QR code in modal (valid for 15 minutes)
  - Display countdown timer
  - Auto-refresh when expired
- Show savings statistics
  - Total savings this month
  - Total savings all time
  - Recent discount usage history
- Implement subscription upsell
  - Show locked partner benefits for free tier
  - Display upgrade CTA with benefit comparison
  - Highlight discount percentages per tier

```typescript
// Example: QR Code component
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode.react';

const PartnerQRCode = () => {
  const { data, refetch } = useQuery({
    queryKey: ['partner-qr'],
    queryFn: fetchPartnerQR,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode value={data.qrData} size={256} />
      <p className="text-sm text-gray-600">
        Valid for {data.expiresIn} minutes
      </p>
      <button onClick={() => refetch()}>Generate New</button>
    </div>
  );
};
```

### Admin Panel (Refine)

- Use Refine framework for admin interface
- Implement role-based access control (admin only)
- Create moderation queues
  - User profiles pending verification
  - Portfolio images needing approval
  - Reviews flagged by users
  - Active disputes awaiting decision
- Implement bulk actions
  - Approve/reject multiple items
  - Bulk user actions (ban, verify, delete)
  - Batch category management
- Add audit logging UI
  - Show all admin actions with timestamps
  - Filter by admin, action type, date range
  - Export audit logs for compliance
- Create analytics dashboard
  - User growth charts
  - Revenue metrics (MRR, total)
  - Category popularity
  - Dispute statistics
- Implement user management
  - Search and filter users
  - View full user details
  - Edit user information
  - Ban/unban users
  - View user activity history

### SEO Optimization

- Generate unique slug URLs for profiles
  - Format: /performer/{name-city}
  - Example: /performer/john-plumber-toronto
  - Auto-increment on duplicates (-2, -3, etc.)
  - Validate slug uniqueness before save
- Implement comprehensive OpenGraph tags
  - og:title (unique per page)
  - og:description (compelling, 150-160 chars)
  - og:image (1200x630px, optimized)
  - og:type (profile, article, website)
  - twitter:card (summary_large_image)
  - twitter:title, twitter:description, twitter:image
- Generate dynamic sitemap.xml
  - Include all public contractor profiles
  - Include category pages
  - Include static pages (about, contact, help)
  - Update automatically on content changes
  - Implement sitemap index for large sites
- Configure robots.txt properly
  - Allow: /, /performer/*, /category/*, /help/*
  - Disallow: /admin/*, /api/*, /dashboard/*, /chat/*, /settings/*, /auth/*
  - Add sitemap location
- Implement JSON-LD structured data
  - Schema.org Person for contractor profiles
  - AggregateRating for reviews display
  - LocalBusiness for physical services
  - BreadcrumbList for navigation
  - Organization for company info
- Use ISR (Incremental Static Regeneration)
  - Revalidate profiles every 24 hours
  - On-demand revalidation on profile update
  - Static generation for category pages
  - SSR for authenticated pages only
- Optimize metadata
  - Unique title per page (50-60 chars)
  - Unique description per page (150-160 chars)
  - Canonical URLs to prevent duplicates
  - hreflang tags for language versions (en/fr)

```typescript
// Example: Dynamic metadata for profile
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: Props): Promise<Metadata> {
  const profile = await fetchProfile(params.slug);
  
  return {
    title: `${profile.name} - ${profile.category} in ${profile.city}`,
    description: `${profile.description.slice(0, 160)}...`,
    openGraph: {
      title: `Hire ${profile.name} on Hummii`,
      description: profile.description,
      images: [{ url: profile.avatar, width: 1200, height: 630 }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} - ${profile.category}`,
      description: profile.description,
      images: [profile.avatar],
    },
    alternates: {
      canonical: `https://hummii.ca/performer/${params.slug}`,
      languages: {
        'en-CA': `/en/performer/${params.slug}`,
        'fr-CA': `/fr/performer/${params.slug}`,
      },
    },
  };
}
```

### Subscription UI/UX

- Display subscription tiers clearly
  - Visual comparison table
  - Highlight recommended plan (Professional)
  - Show annual savings for yearly billing
- Implement feature gating UI
  - Show lock icon on premium features
  - Display upgrade prompt when clicking locked features
  - Show feature comparison on hover
- Create subscription management page
  - Current plan display with features
  - Upgrade/downgrade buttons
  - Cancel subscription option (with confirmation)
  - Billing history table
  - Next billing date and amount
- Handle subscription states
  - Active: full access
  - Expiring soon: show renewal banner
  - Expired: show upgrade prompt, limit features
  - Cancelled: grace period with reactivation option
- Implement payment method management
  - Display current card (last 4 digits)
  - Update payment method button
  - Use Stripe Customer Portal for management

### Dispute UI Flow

- Create dispute submission form
  - Reason selection (dropdown: quality, deadline, payment, other)
  - Description textarea (max 2000 chars)
  - Evidence upload (max 5 files, 5MB each)
  - Submit button with loading state
- Display dispute status clearly
  - Status badge (OPENED, UNDER_REVIEW, RESOLVED)
  - Timeline of events (opened, updated, resolved)
  - Admin responses and decisions
  - Upload additional evidence option
- Show dispute impact
  - Payment freeze notice (funds in escrow)
  - Estimated resolution time (3-5 days)
  - Contact support option
- Implement dispute resolution notification
  - Show resolution modal when decision made
  - Display outcome (refund, payment, partial)
  - Provide appeal option (if applicable)
  - Request feedback on dispute process

---

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [PIPEDA Compliance](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/)

---

Remember: **Security, Performance, and Accessibility are not optional** - they are core requirements for this project. Always consider these aspects in every implementation.
