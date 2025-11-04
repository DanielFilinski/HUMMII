# Responsive Design Guide - Hummii Project

> **Complete guide for adaptive layouts in Next.js + Tailwind CSS**
> **Version:** 1.0 | **Updated:** November 3, 2025

## Table of Contents

1. [Custom Breakpoints](#custom-breakpoints)
2. [Utility Classes](#utility-classes)
3. [Usage Examples](#usage-examples)
4. [Best Practices](#best-practices)
5. [Testing Responsive Design](#testing-responsive-design)

---

## Custom Breakpoints

### Standard Breakpoints (with min-max ranges)

```typescript
// tailwind.config.ts
screens: {
  'sm': { 'min': '640px', 'max': '767px' },   // Small devices (landscape phones)
  'md': { 'min': '768px', 'max': '1023px' },  // Medium devices (tablets)
  'lg': { 'min': '1024px', 'max': '1279px' }, // Large devices (desktops)
  'xl': { 'min': '1280px', 'max': '1535px' }, // Extra large devices
  '2xl': { 'min': '1536px' },                 // 2x extra large devices
}
```

### Mobile-First Helper Breakpoints

```typescript
screens: {
  'mobile': { 'max': '767px' },              // All mobile devices
  'tablet': { 'min': '768px', 'max': '1023px' }, // Tablets only
  'desktop': { 'min': '1024px' },            // Desktops and above
}
```

---

## Utility Classes

### Container Utilities

#### `.container-responsive`
Centered container with responsive padding:
- Mobile: `padding: 1rem` (16px)
- Small: `padding: 1.5rem` (24px)
- Medium+: `padding: 2rem` (32px)
- Max-width: `80rem` (1280px)

```tsx
<div className="container-responsive">
  {/* Your content */}
</div>
```

---

### Visibility Utilities

#### Hide on specific devices:

```tsx
<div className="hide-mobile">Hidden on mobile (≤767px)</div>
<div className="hide-tablet">Hidden on tablets (768px-1023px)</div>
<div className="hide-desktop">Hidden on desktop (≥1024px)</div>
```

#### Show only on specific devices:

```tsx
<div className="show-mobile-only">Visible ONLY on mobile</div>
<div className="show-tablet-only">Visible ONLY on tablets</div>
<div className="show-desktop-only">Visible ONLY on desktop</div>
```

---

### Flex Layout Utilities

#### `.flex-responsive`
Automatically switches from column (mobile) to row (tablet+):

```tsx
<div className="flex-responsive gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Result:**
- **Mobile:** Vertical stack (flex-col)
- **Tablet+:** Horizontal row (flex-row)

#### `.flex-responsive-reverse`
Reverse order on mobile:

```tsx
<div className="flex-responsive-reverse gap-4">
  <div>Text (left on desktop, bottom on mobile)</div>
  <div>Image (right on desktop, top on mobile)</div>
</div>
```

---

### Grid Layout Utilities

#### `.grid-responsive`
Adaptive grid (1 → 2 → 3 columns):

```tsx
<div className="grid-responsive gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

**Result:**
- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 3 columns

#### `.grid-responsive-4`
Adaptive grid (1 → 2 → 4 columns):

```tsx
<div className="grid-responsive-4 gap-4">
  <ProductCard />
  <ProductCard />
  <ProductCard />
  <ProductCard />
</div>
```

---

### Spacing Utilities

#### `.padding-responsive`
Adaptive padding:

```tsx
<section className="padding-responsive">
  {/* Content */}
</section>
```

**Result:**
- **Mobile:** `padding: 1rem` (16px)
- **Small:** `padding: 1.5rem` (24px)
- **Medium:** `padding: 2rem` (32px)
- **Large+:** `padding: 3rem` (48px)

#### `.margin-responsive`
Adaptive margin (same scale as padding):

```tsx
<div className="margin-responsive">
  {/* Content */}
</div>
```

---

### Typography Utilities

#### `.text-responsive-sm`
Small adaptive text:
- **Mobile:** `14px`
- **Tablet:** `16px`
- **Desktop:** `18px`

```tsx
<p className="text-responsive-sm">Small paragraph text</p>
```

#### `.text-responsive`
Regular adaptive text:
- **Mobile:** `16px`
- **Tablet:** `18px`
- **Desktop:** `20px`

```tsx
<p className="text-responsive">Regular paragraph text</p>
```

#### `.text-responsive-lg`
Large adaptive text:
- **Mobile:** `18px`
- **Tablet:** `20px`
- **Desktop:** `24px`

```tsx
<p className="text-responsive-lg">Large paragraph text</p>
```

#### `.heading-responsive`
Adaptive heading (h2-h3 level):
- **Mobile:** `24px`
- **Tablet:** `30px`
- **Desktop:** `36px`

```tsx
<h2 className="heading-responsive">Section Title</h2>
```

#### `.heading-responsive-lg`
Large adaptive heading (h1 level):
- **Mobile:** `30px`
- **Tablet:** `36px`
- **Desktop:** `48px`

```tsx
<h1 className="heading-responsive-lg">Page Title</h1>
```

---

### Mobile-Specific Utilities

#### Safe Area Insets
For devices with notches (iPhone X+):

```tsx
<header className="safe-area-inset-top">
  {/* Header content */}
</header>

<footer className="safe-area-inset-bottom">
  {/* Footer content */}
</footer>
```

#### Touch Targets
Minimum touch target size (44x44px) for accessibility:

```tsx
<button className="touch-target">
  <Icon />
</button>
```

---

### Scrollbar Utilities

#### `.scrollbar-hide`
Hide scrollbar while keeping scroll functionality:

```tsx
<div className="overflow-x-auto scrollbar-hide">
  <Table />
</div>
```

---

### Aspect Ratio Utilities

#### `.aspect-square`
1:1 ratio (perfect square):

```tsx
<div className="aspect-square bg-gray-200">
  <img src="avatar.jpg" alt="Avatar" />
</div>
```

#### `.aspect-video`
16:9 ratio (standard video):

```tsx
<div className="aspect-video bg-black">
  <iframe src="youtube-url" />
</div>
```

#### `.aspect-portrait`
3:4 ratio (portrait photos):

```tsx
<div className="aspect-portrait bg-gray-100">
  <img src="portrait.jpg" alt="Portrait" />
</div>
```

---

## Usage Examples

### Example 1: Responsive Card Grid

```tsx
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="container-responsive padding-responsive">
      <h2 className="heading-responsive mb-8">Our Products</h2>
      
      <div className="grid-responsive-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

**Result:**
- **Mobile (≤767px):** 1 column, smaller padding
- **Tablet (768-1023px):** 2 columns, medium padding
- **Desktop (≥1024px):** 4 columns, larger padding

---

### Example 2: Responsive Hero Section

```tsx
export default function HeroSection() {
  return (
    <section className="container-responsive padding-responsive">
      <div className="flex-responsive gap-8 items-center">
        {/* Text Content */}
        <div className="flex-1">
          <h1 className="heading-responsive-lg mb-4">
            Find Trusted Contractors in Canada
          </h1>
          <p className="text-responsive-lg mb-6 text-gray-600">
            Connect with verified professionals for your home improvement projects.
          </p>
          <button className="touch-target bg-blue-600 text-white px-8 py-3 rounded-lg">
            Get Started
          </button>
        </div>

        {/* Hero Image */}
        <div className="flex-1 hide-mobile">
          <img 
            src="/hero-image.jpg" 
            alt="Hero" 
            className="w-full rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
```

**Result:**
- **Mobile:** Text only, stacked vertically, image hidden
- **Tablet+:** Text and image side-by-side (50/50 split)

---

### Example 3: Responsive Navigation

```tsx
'use client';

import { useState } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="container-responsive safe-area-inset-top">
      <div className="flex items-center justify-between py-4">
        {/* Logo */}
        <div className="text-2xl font-bold">Hummii</div>

        {/* Desktop Menu */}
        <div className="hide-mobile flex gap-6">
          <a href="/services" className="text-responsive">Services</a>
          <a href="/about" className="text-responsive">About</a>
          <a href="/contact" className="text-responsive">Contact</a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="show-mobile-only touch-target"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MenuIcon />
        </button>
      </div>

      {/* Mobile Menu (dropdown) */}
      {isOpen && (
        <div className="show-mobile-only flex flex-col gap-4 py-4">
          <a href="/services" className="text-responsive">Services</a>
          <a href="/about" className="text-responsive">About</a>
          <a href="/contact" className="text-responsive">Contact</a>
        </div>
      )}
    </nav>
  );
}
```

---

### Example 4: Responsive Table

```tsx
export default function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="container-responsive padding-responsive">
      {/* Desktop Table */}
      <div className="hide-mobile overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.client.name}</td>
                <td>{order.service}</td>
                <td>{order.status}</td>
                <td>${order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="show-mobile-only space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="font-bold">Order #{order.id}</span>
              <span className="text-blue-600">{order.status}</span>
            </div>
            <p className="text-sm text-gray-600">{order.client.name}</p>
            <p className="text-sm">{order.service}</p>
            <p className="text-lg font-bold mt-2">${order.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Result:**
- **Mobile:** Card-based layout (vertical stack)
- **Desktop:** Traditional table layout

---

### Example 5: Responsive Image Gallery

```tsx
export default function ImageGallery({ images }: { images: string[] }) {
  return (
    <section className="container-responsive padding-responsive">
      <h2 className="heading-responsive mb-8">Gallery</h2>
      
      <div className="grid-responsive gap-4">
        {images.map((image, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-lg">
            <img 
              src={image} 
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Result:**
- **Mobile:** 1 column (full width)
- **Tablet:** 2 columns
- **Desktop:** 3 columns
- All images maintain 1:1 aspect ratio

---

## Best Practices

### 1. Mobile-First Approach

Always design for mobile first, then add larger breakpoints:

```tsx
// ✅ GOOD - Mobile-first
<div className="text-sm md:text-base lg:text-lg">
  Text scales up on larger screens
</div>

// ❌ BAD - Desktop-first
<div className="text-lg md:text-base mobile:text-sm">
  Requires overriding, less efficient
</div>
```

---

### 2. Use Semantic Breakpoints

Use descriptive breakpoint names instead of arbitrary sizes:

```tsx
// ✅ GOOD
<div className="mobile:text-sm desktop:text-lg">
  Clear intent
</div>

// ❌ BAD
<div className="max-w-[640px]:text-sm min-w-[1024px]:text-lg">
  Hard to read and maintain
</div>
```

---

### 3. Limit Breakpoint Complexity

Don't use too many breakpoints for a single element:

```tsx
// ✅ GOOD - 2-3 breakpoints max
<div className="grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  Simple and clear
</div>

// ❌ BAD - Too many breakpoints
<div className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
  Overly complex
</div>
```

---

### 4. Use Utility Classes for Common Patterns

Create reusable utility classes for repeated patterns:

```tsx
// ✅ GOOD - Use predefined utilities
<div className="grid-responsive gap-6">
  {/* Content */}
</div>

// ❌ BAD - Repeat same pattern everywhere
<div className="grid grid-cols-1 mobile:grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
  {/* Content */}
</div>
```

---

### 5. Test on Real Devices

Always test responsive designs on real devices, not just browser dev tools:

- **iOS:** Safari (iPhone, iPad)
- **Android:** Chrome, Samsung Internet
- **Desktop:** Chrome, Firefox, Safari, Edge

---

### 6. Accessibility Considerations

- **Touch targets:** Minimum 44x44px for mobile (use `.touch-target`)
- **Text size:** Minimum 16px to prevent zoom on iOS
- **Contrast:** Ensure sufficient color contrast on all screen sizes
- **Keyboard navigation:** Test with keyboard on desktop

---

### 7. Performance Optimization

```tsx
// ✅ GOOD - Responsive images with next/image
import Image from 'next/image';

<Image 
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority
/>

// ❌ BAD - Load full-size image on mobile
<img src="/hero-4k.jpg" alt="Hero" />
```

---

### 8. Avoid Horizontal Scrolling

```tsx
// ✅ GOOD - Responsive container
<div className="container-responsive overflow-x-hidden">
  {/* Content */}
</div>

// ❌ BAD - Fixed width can cause horizontal scroll on mobile
<div className="w-[1200px]">
  {/* Content */}
</div>
```

---

## Testing Responsive Design

### Browser DevTools

1. **Chrome DevTools:**
   - Press `Ctrl+Shift+M` (Windows) or `Cmd+Shift+M` (Mac)
   - Select device presets or custom dimensions
   - Test common devices: iPhone 14 Pro, iPad, Desktop

2. **Responsive Mode Shortcuts:**
   - `Ctrl+Shift+C` - Inspect element
   - `Ctrl+Shift+J` - Console
   - `Ctrl+R` - Reload

### Breakpoint Testing Checklist

Test your layouts at these key widths:

- [ ] **320px** - Smallest mobile (iPhone SE)
- [ ] **375px** - Standard mobile (iPhone 12/13/14)
- [ ] **768px** - Tablet portrait (iPad Mini)
- [ ] **1024px** - Tablet landscape / small laptop
- [ ] **1280px** - Standard desktop
- [ ] **1920px** - Large desktop / external monitor

### Common Issues to Check

- [ ] Text is readable on all screen sizes (min 16px on mobile)
- [ ] Images don't overflow containers
- [ ] Buttons are touch-friendly on mobile (44x44px min)
- [ ] Navigation is accessible on mobile (hamburger menu works)
- [ ] Forms are usable on mobile (inputs are large enough)
- [ ] No horizontal scrolling on any screen size
- [ ] Spacing is appropriate (not too cramped on mobile)
- [ ] Content priority is correct (most important content first on mobile)

---

## Resources

### Official Documentation

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)
- [MDN - Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

### Tools

- [Responsively App](https://responsively.app/) - Test multiple devices simultaneously
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)

---

**Last updated:** November 3, 2025  
**Version:** 1.0  
**Project:** Hummii - Canadian Service Marketplace


