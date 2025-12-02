# Design System - Quick Start Guide

## 🎉 Design System Successfully Created!

Your comprehensive Next.js design system based on the Figma design has been created with all components, tokens, and documentation.

---

## 📁 Project Structure

```
/
├── app/
│   ├── layout.tsx                 # Root layout with font configuration
│   ├── globals.css                # Global styles and Tailwind directives
│   └── design-system/
│       └── page.tsx               # Component showcase page
├── components/
│   └── ui/
│       ├── Avatar.tsx             # Avatar and AvatarGroup
│       ├── Badge.tsx              # Badge/Tag component
│       ├── Button.tsx             # Button with variants
│       ├── Card.tsx               # Card with sub-components
│       ├── Container.tsx          # Responsive container
│       ├── Input.tsx              # Form input with validation
│       ├── Spinner.tsx            # Loading spinner
│       ├── Typography.tsx         # Responsive typography
│       └── index.ts               # Component exports
├── lib/
│   ├── design-tokens.ts           # Design system tokens
│   ├── fonts.ts                   # Font configuration (Roboto)
│   └── utils.ts                   # Utility functions (cn helper)
├── tailwind.config.ts             # Tailwind configuration
└── DESIGN_SYSTEM.md              # Full documentation

```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
```

### 2. Verify Configuration

All configuration files are ready:
- ✅ `tailwind.config.ts` - Custom colors, typography, breakpoints
- ✅ `app/globals.css` - Base styles and utilities
- ✅ `app/layout.tsx` - Font configuration
- ✅ `lib/design-tokens.ts` - Design tokens

### 3. Run Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/design-system` to see the component showcase.

---

## 🎨 Design System Overview

### Color Palette (from Figma)

#### Backgrounds
- **Background 1:** `#FFFFFF` - Primary background
- **Background 2:** `#E1F7DB` - Light green background
- **Background 3:** `#F6FBF7` - Subtle background
- **Overlay:** `rgba(22, 22, 14, 0.7)` - Modal overlay

#### Text
- **Primary:** `#2A2A0F` - Main text
- **Secondary:** `#819082` - Secondary text
- **Unfocused:** `#96A996` - Placeholder text
- **Inverse:** `#FFFFFF` - Text on dark backgrounds
- **Disabled:** `#DBDBDB` - Disabled state

#### Accents
- **Accent 1:** `#3A971E` - Primary green
- **Accent 2:** `#67AD51` - Secondary green
- **Accent Disabled:** `#AAC89A` - Disabled accent

#### Feedback
- **Error:** `#B52F2F` - Error state
- **Attention:** `#F13A0C` - Warning state

#### Gradients
- **Main:** `#CDF2C2` → `#FCFFFD`
- **Card:** `#DDF8D4` → `#F9D5B7`
- **Banner:** `#FFFDE9` → `#D7FAD6`

### Typography (Roboto Font)

The system uses **responsive typography** that automatically adjusts:

| Variant | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| H1 | 28px Bold | 30px Bold | 36px Bold |
| H2 | 22px SemiBold | 24px SemiBold | 24px SemiBold |
| H3 | 18px Medium | 20px Medium | 20px Medium |
| Body | 16px Regular | 18px Regular | 20px Regular |
| Body Small | 14px Regular | 16px Regular | 16px Regular |
| Tag | 14px ExtraBold | 16px ExtraBold | 16px ExtraBold |
| Note | 12px Regular | 16px Regular | 14px Regular |

### Breakpoints

```javascript
{
  sm: '640px - 767px',    // Large phones
  md: '768px - 1023px',   // Tablets
  lg: '1024px - 1279px',  // Small laptops
  xl: '1280px - 1535px',  // Desktops
  '2xl': '1536px+',       // Large screens
}
```

---

## 📦 Available Components

### 1. Typography
Responsive, semantic text component.

```tsx
import { Typography } from '@/components/ui';

<Typography variant="h1">Headline 1</Typography>
<Typography variant="body" color="secondary">Body text</Typography>
```

### 2. Button
Versatile button with multiple variants.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button isLoading>Loading...</Button>
```

### 3. Input
Form input with validation and icons.

```tsx
import { Input } from '@/components/ui';

<Input 
  label="Email" 
  placeholder="you@example.com"
  error="This field is required"
/>
```

### 4. Card
Flexible card container.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card variant="gradient">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### 5. Badge
Status indicators and tags.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>
```

### 6. Avatar
User profile images with status.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

<Avatar src="/avatar.jpg" alt="User" online />
<AvatarGroup max={3}>
  <Avatar fallback="JD" />
  <Avatar fallback="SM" />
</AvatarGroup>
```

### 7. Spinner
Loading indicators.

```tsx
import { Spinner } from '@/components/ui';

<Spinner size="md" label="Loading..." />
```

### 8. Container
Responsive layout container.

```tsx
import { Container } from '@/components/ui';

<Container maxWidth="lg">
  <p>Content with responsive padding</p>
</Container>
```

---

## 💡 Usage Examples

### Example 1: Simple Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui';

export function ProductCard() {
  return (
    <Card hoverable>
      <CardHeader>
        <CardTitle>Product Name</CardTitle>
        <CardDescription>Product description</CardDescription>
      </CardHeader>
      <CardContent>
        <Typography variant="body">$99.99</Typography>
      </CardContent>
      <CardFooter>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
```

### Example 2: Form

```tsx
'use client';

import { useState } from 'react';
import { Input, Button, Card, Typography } from '@/components/ui';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Card padding="lg">
      <Typography variant="h2" className="mb-6">Contact Us</Typography>
      <div className="space-y-4">
        <Input 
          label="Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input 
          label="Email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button fullWidth>Submit</Button>
      </div>
    </Card>
  );
}
```

### Example 3: User List

```tsx
import { Avatar, Badge, Typography } from '@/components/ui';

export function UserList({ users }) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-4">
          <Avatar 
            src={user.avatar} 
            alt={user.name}
            online={user.online}
          />
          <div className="flex-1">
            <Typography variant="body">{user.name}</Typography>
            <Typography variant="bodySm" color="secondary">
              {user.role}
            </Typography>
          </div>
          <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>
            {user.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Use the Typography Component
✅ **Good:**
```tsx
<Typography variant="h1">Welcome</Typography>
```

❌ **Avoid:**
```tsx
<h1 className="text-mobile-h1 md:text-tablet-h1 lg:text-desktop-h1">Welcome</h1>
```

### 2. Mobile-First Responsive Design
Always design for mobile first, then enhance for larger screens:

```tsx
<div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
  <Button>Action</Button>
</div>
```

### 3. Use Design Tokens
Import from `design-tokens.ts` for programmatic use:

```tsx
import { colors } from '@/lib/design-tokens';

const styles = {
  backgroundColor: colors.background[2],
};
```

### 4. Accessibility
Always provide proper labels:

```tsx
<Button aria-label="Close modal">
  <CloseIcon />
</Button>
```

---

## 📖 Documentation

### Full Documentation
See `DESIGN_SYSTEM.md` for comprehensive documentation including:
- All component APIs
- Detailed usage examples
- Accessibility guidelines
- Contribution guidelines

### Component Showcase
Visit `/design-system` page to see all components in action with interactive examples.

---

## 🔧 Customization

### Adding New Colors

1. Update `tailwind.config.ts`:
```ts
extend: {
  colors: {
    brand: {
      primary: '#yourcolor',
    }
  }
}
```

2. Update `design-tokens.ts`:
```ts
export const colors = {
  brand: {
    primary: '#yourcolor',
  },
};
```

### Adding New Components

Follow this template:

```tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps {
  // Props
}

const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-styles', className)}
        {...props}
      />
    );
  }
);

NewComponent.displayName = 'NewComponent';

export { NewComponent };
```

---

## 🚨 Common Issues

### Issue: Fonts not loading
**Solution:** Ensure `roboto.variable` is added to html tag in `app/layout.tsx`

### Issue: Tailwind classes not working
**Solution:** Run `npm run dev` to regenerate Tailwind classes

### Issue: TypeScript errors
**Solution:** Ensure all dependencies are installed: `npm install`

---

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🎉 You're All Set!

Your design system is ready to use. Start building amazing UIs with consistent, accessible, and responsive components!

**Happy Coding! 🚀**
