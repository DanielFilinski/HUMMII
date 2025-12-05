# LogoButton Component

A circular button component with the Hummii logo, featuring multiple interactive states.

## Design

This component implements the exact design from the provided Figma mockups with the following states:

- **Default**: `bg-accent-primary` with `text-inverse` icon
- **Hover**: `bg-accent-disabled` with `text-inverse` icon
- **Pressed**: `bg-background-secondary` with `text-primary` icon
- **Disabled**: `bg-accent-disabled` with `text-inverse` icon
- **Loading**: `bg-background-secondary` with LoadingSpinner (`text-primary`)

## Assets Used

- **Logo**: `/public/images/logo/Logo.svg` - Hummii brand logo
- **Spinner**: `LoadingSpinner` component from `@shared/ui/spinner`

## Usage

```tsx
import { LogoButton } from '@shared/ui/button';

// Basic usage
<LogoButton onClick={() => console.log('Clicked')} />

// Disabled state
<LogoButton disabled />

// Loading state
<LogoButton isLoading />

// With custom aria label
<LogoButton ariaLabel="Verify account" onClick={handleVerify} />

// With custom className
<LogoButton className="my-4" onClick={handleClick} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | `undefined` | Click handler function |
| `disabled` | `boolean` | `false` | Disables the button |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `ariaLabel` | `string` | `'Logo button'` | Accessibility label |
| `className` | `string` | `''` | Additional CSS classes |

## Features

- ✅ Fully accessible with ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus ring for keyboard users
- ✅ Smooth transitions between states
- ✅ Loading state with spinner
- ✅ Disabled state handling
- ✅ TypeScript support

## Examples

### Default Button
```tsx
<LogoButton onClick={() => alert('Success!')} />
```

### Loading Button
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleClick = async () => {
  setIsLoading(true);
  await performAction();
  setIsLoading(false);
};

<LogoButton isLoading={isLoading} onClick={handleClick} />
```

### Disabled Button
```tsx
<LogoButton disabled ariaLabel="Feature coming soon" />
```

## Accessibility

The LogoButton component follows WCAG 2.1 guidelines:

- Uses semantic `<button>` element
- Provides `aria-label` for screen readers
- Shows focus ring for keyboard navigation
- Properly handles disabled and loading states
- Sufficient color contrast ratios

## Design Tokens

The component uses the following design system tokens:

| State | Background | Icon Color |
|-------|-----------|------------|
| **Default** | `bg-accent-primary` | `text-inverse` (white via invert filter) |
| **Hover** | `bg-accent-disabled` | `text-inverse` (white via invert filter) |
| **Pressed** | `bg-background-secondary` | `text-primary` (green via normal logo) |
| **Disabled** | `bg-accent-disabled` | `text-inverse` (white via invert filter) |
| **Loading** | `bg-background-secondary` | `text-primary` (spinner color) |

### Implementation Details

The icon color is achieved using CSS filters:
- **Text Inverse (white)**: Applied via `brightness-0 invert` to convert green logo to white
- **Text Primary (green)**: Natural logo color without filters (pressed/loading states)

## Size

- Button: 56px × 56px (circular)
- Logo: 24px × 24px
- Spinner: 24px × 24px

## Dependencies

- `next/image` - For optimized logo rendering
- `@shared/ui/spinner/LoadingSpinner` - For loading state
- `/public/images/logo/Logo.svg` - Hummii brand logo asset
