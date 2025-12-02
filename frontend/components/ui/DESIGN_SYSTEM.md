# Design System Documentation

A comprehensive, production-ready design system built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**, based on Figma design specifications.

## 📚 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Design Tokens](#design-tokens)
- [Typography](#typography)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Responsive Design](#responsive-design)

---

## Overview

This design system provides a complete set of reusable, accessible, and responsive components following modern React and TypeScript best practices. It implements a mobile-first approach with breakpoints optimized for all screen sizes.

### Key Features

- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Responsive** - Mobile-first design with optimized breakpoints
- ✅ **Accessible** - WCAG 2.1 AA compliant components
- ✅ **Performant** - Optimized with React best practices
- ✅ **Themeable** - Consistent design tokens throughout
- ✅ **DRY** - Reusable components with variant support

---

## Installation

### 1. Install Dependencies

```bash
npm install clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

### 2. Configure Tailwind

The `tailwind.config.ts` is already configured with all design tokens.

### 3. Import Global Styles

In your root layout (`app/layout.tsx`):

```tsx
import { roboto } from '@/lib/fonts';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

---

## Design Tokens

All design tokens are centralized in `/lib/design-tokens.ts` for consistency.

### Color Palette

#### Backgrounds
- `background-1` - `#FFFFFF` - Primary background
- `background-2` - `#E1F7DB` - Secondary background
- `background-3` - `#F6FBF7` - Tertiary background
- `background-overlay` - `rgba(22, 22, 14, 0.7)` - Modal overlay

#### Text Colors
- `text-primary` - `#2A2A0F` - Primary text
- `text-secondary` - `#819082` - Secondary text
- `text-unfocused` - `#96A996` - Placeholder text
- `text-inverse` - `#FFFFFF` - Text on dark backgrounds
- `text-disabled` - `#DBDBDB` - Disabled text

#### Accent Colors
- `accent-1` - `#3A971E` - Primary accent
- `accent-2` - `#67AD51` - Secondary accent
- `accent-disabled` - `#AAC89A` - Disabled accent

#### Feedback Colors
- `feedback-error` - `#B52F2F` - Error states
- `feedback-attention` - `#F13A0C` - Warning/attention states

#### Gradients
- `bg-gradient-main` - Background gradient
- `bg-gradient-card` - Card gradient
- `bg-gradient-banner` - Banner gradient

### Usage

```tsx
// Direct Tailwind classes
<div className="bg-background-2 text-text-primary" />

// Using design tokens (recommended for programmatic use)
import { colors } from '@/lib/design-tokens';

const styles = {
  backgroundColor: colors.background[2],
  color: colors.text.primary,
};
```

---

## Typography

### Responsive Typography System

The design system uses responsive typography that automatically adjusts based on screen size:

```tsx
import { Typography } from '@/components/ui';

<Typography variant="h1">
  Headline 1 - Responsive across all breakpoints
</Typography>
```

### Typography Variants

| Variant | Mobile | Tablet | Desktop | Use Case |
|---------|--------|--------|---------|----------|
| `h1` | 28px/700 | 30px/700 | 36px/700 | Page titles |
| `h2` | 22px/600 | 24px/600 | 24px/600 | Section headers |
| `h3` | 18px/500 | 20px/500 | 20px/500 | Subsection headers |
| `body` | 16px/400 | 18px/400 | 20px/400 | Main content |
| `bodySm` | 14px/400 | 16px/400 | 16px/400 | Secondary content |
| `tag` | 14px/800 | 16px/800 | 16px/800 | Badges, labels |
| `note` | 12px/400 | 16px/400 | 14px/400 | Small notes |

### Font Weights

- `font-regular` - 400
- `font-medium` - 500
- `font-semibold` - 600
- `font-bold` - 700
- `font-extrabold` - 800

### Usage Examples

```tsx
// Semantic headings
<Typography as="h1" variant="h1" color="primary">
  Main Page Title
</Typography>

// Body text with custom color
<Typography variant="body" color="secondary">
  This is secondary body text
</Typography>

// Small notes
<Typography variant="note" color="unfocused">
  Helper text or additional information
</Typography>

// Custom combinations
<Typography 
  as="p" 
  variant="body" 
  color="accent" 
  weight="bold" 
  align="center"
>
  Custom styled text
</Typography>
```

---

## Components

### Button

Versatile button component with multiple variants and states.

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button isLoading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
```

**Props:**
- `variant` - Button style variant
- `size` - Button size
- `isLoading` - Show loading spinner
- `disabled` - Disable interaction
- `fullWidth` - Stretch to container width

---

### Input

Accessible input component with labels, hints, and error states.

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input label="Email" placeholder="Enter your email" />

// With hint
<Input 
  label="Password" 
  type="password" 
  hint="Must be at least 8 characters"
/>

// With error
<Input 
  label="Username" 
  error="This field is required" 
/>

// With icons
<Input 
  label="Search"
  placeholder="Search..."
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
/>

// Disabled
<Input label="Disabled" disabled />
```

**Props:**
- `label` - Input label
- `error` - Error message (shows error state)
- `hint` - Helper text
- `leftIcon` - Icon on the left side
- `rightIcon` - Icon on the right side
- `fullWidth` - Stretch to container width

---

### Card

Flexible card container with sub-components.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Gradient card
<Card variant="gradient" padding="lg">
  <p>Content with gradient background</p>
</Card>

// Hoverable card
<Card hoverable>
  <p>Hover me for effect</p>
</Card>
```

**Props:**
- `variant` - `default | gradient | outlined`
- `padding` - `none | sm | md | lg`
- `hoverable` - Enable hover effects

---

### Badge

Small status indicators and tags.

```tsx
import { Badge } from '@/components/ui';

// Variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Neutral</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

---

### Avatar

User profile images with fallback and status indicator.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

// Basic avatar
<Avatar src="/avatar.jpg" alt="John Doe" />

// With fallback initials
<Avatar fallback="JD" />

// Sizes
<Avatar size="sm" fallback="S" />
<Avatar size="md" fallback="M" />
<Avatar size="lg" fallback="L" />
<Avatar size="xl" fallback="XL" />

// Shapes
<Avatar shape="circle" fallback="C" />
<Avatar shape="square" fallback="S" />

// Online status
<Avatar fallback="JD" online />
<Avatar fallback="JD" online={false} />

// Avatar group
<AvatarGroup max={3}>
  <Avatar fallback="JD" />
  <Avatar fallback="SM" />
  <Avatar fallback="AB" />
  <Avatar fallback="CD" />
  <Avatar fallback="EF" />
</AvatarGroup>
```

---

### Spinner

Loading indicators with customizable sizes and colors.

```tsx
import { Spinner } from '@/components/ui';

// Sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />

// With label
<Spinner label="Loading..." />

// Variants
<Spinner variant="accent" />
<Spinner variant="secondary" />
<Spinner variant="inverse" />
```

---

### Container

Responsive container with max-width constraints.

```tsx
import { Container } from '@/components/ui';

// Default container
<Container>
  <p>Content with responsive padding</p>
</Container>

// Custom max width
<Container maxWidth="xl">
  <p>Extra large container</p>
</Container>

// No padding
<Container noPadding>
  <p>Full width content</p>
</Container>

// Not centered
<Container center={false}>
  <p>Left-aligned container</p>
</Container>
```

---

## Usage Examples

### Example 1: Login Form

```tsx
'use client';

import { useState } from 'react';
import { Button, Input, Card, Typography } from '@/components/ui';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <Typography as="h2" variant="h2" align="center" className="mb-6">
        Welcome Back
      </Typography>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
          fullWidth
        />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="••••••••"
          fullWidth
        />
        
        <Button type="submit" fullWidth>
          Sign In
        </Button>
      </form>
    </Card>
  );
}
```

### Example 2: User Profile Card

```tsx
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  Avatar, 
  Badge, 
  Button,
  Typography 
} from '@/components/ui';

export function UserCard({ user }) {
  return (
    <Card hoverable>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar 
            src={user.avatar} 
            alt={user.name} 
            size="lg"
            online={user.online}
          />
          <div>
            <Typography variant="h3">{user.name}</Typography>
            <Typography variant="bodySm" color="secondary">
              {user.role}
            </Typography>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {user.skills.map((skill) => (
            <Badge key={skill} variant="info" size="sm">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="primary" size="sm">
          View Profile
        </Button>
        <Button variant="outline" size="sm">
          Message
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Best Practices

### 1. Use Typography Component

✅ **Good:**
```tsx
<Typography variant="h1">Welcome</Typography>
```

❌ **Bad:**
```tsx
<h1 className="text-mobile-h1 md:text-tablet-h1 lg:text-desktop-h1">Welcome</h1>
```

### 2. Consistent Spacing

Use Tailwind's spacing scale:
```tsx
<div className="space-y-4"> {/* Consistent vertical spacing */}
  <Input label="First Name" />
  <Input label="Last Name" />
  <Button>Submit</Button>
</div>
```

### 3. Semantic HTML

Always use the correct semantic elements:
```tsx
<Typography as="h1" variant="h1">Page Title</Typography>
<Typography as="p" variant="body">Body text</Typography>
```

### 4. Early Returns

Keep components clean with early returns:
```tsx
const UserProfile = ({ userId }: Props) => {
  if (!userId) return <EmptyState />;
  
  const { data, isLoading, error } = useUser(userId);
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  
  return <ProfileCard user={data} />;
};
```

### 5. Accessibility

Always provide proper labels and ARIA attributes:
```tsx
<Button aria-label="Close modal">
  <CloseIcon />
</Button>

<Input 
  label="Email" 
  aria-describedby="email-hint"
  aria-invalid={!!error}
/>
```

---

## Responsive Design

### Breakpoints

The design system uses the following breakpoints:

| Breakpoint | Range | Typical Device |
|------------|-------|----------------|
| Mobile | <640px | Phones |
| `sm` | 640px - 767px | Large phones |
| `md` | 768px - 1023px | Tablets |
| `lg` | 1024px - 1279px | Small laptops |
| `xl` | 1280px - 1535px | Desktops |
| `2xl` | ≥1536px | Large screens |

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
<div className="
  flex flex-col gap-2
  sm:flex-row sm:gap-4
  lg:gap-6
">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

### Responsive Typography

Typography automatically adjusts:
- Mobile: Smaller, tighter line heights
- Tablet: Medium sizes
- Desktop: Larger, more spacious

```tsx
<Typography variant="h1">
  {/* 28px on mobile, 30px on tablet, 36px on desktop */}
  Responsive Headline
</Typography>
```

---

## Testing the Design System

Visit `/design-system` to see a comprehensive showcase of all components and design tokens.

```bash
npm run dev
# Navigate to http://localhost:3000/design-system
```

---

## Contributing

When adding new components:

1. **Follow the existing patterns** - Use `forwardRef`, proper TypeScript types
2. **Use design tokens** - Reference colors and typography from design-tokens.ts
3. **Make it responsive** - Use mobile-first Tailwind classes
4. **Add accessibility** - Include ARIA attributes and keyboard support
5. **Document it** - Add examples to the showcase page

---

## Support

For questions or issues, please refer to the component documentation or check the showcase page at `/design-system`.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
