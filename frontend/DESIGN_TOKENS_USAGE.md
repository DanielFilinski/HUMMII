# Использование унифицированных Design Tokens

## 📋 Обзор изменений

Система дизайн-токенов была расширена и унифицирована для обеспечения согласованности во всех компонентах.

### ✅ Добавлено:

1. **Расширенная система Spacing** - унифицированные отступы от 0px до 384px
2. **Семантические Padding/Margin** - предустановленные размеры для компонентов
3. **Дополнительные Border Radius** - от 2px до 24px + семантические имена
4. **Компонентные размеры** - стандартизированные высоты и отступы
5. **Responsive Padding** - адаптивные отступы для разных экранов

---

## 🎯 Spacing System

### Базовые значения
```tsx
// Теперь доступны все стандартные значения Tailwind:
<div className="p-0">      {/* 0px */}
<div className="p-px">     {/* 1px */}
<div className="p-0.5">    {/* 2px */}
<div className="p-1">      {/* 4px */}
<div className="p-1.5">    {/* 6px */}
<div className="p-2">      {/* 8px */}
<div className="p-3">      {/* 12px */}
<div className="p-4">      {/* 16px */}
<div className="p-5">      {/* 20px */}
<div className="p-6">      {/* 24px */}
<div className="p-8">      {/* 32px */}
<div className="p-10">     {/* 40px */}
<div className="p-12">     {/* 48px */}
<div className="p-16">     {/* 64px */}
<div className="p-20">     {/* 80px */}
<div className="p-24">     {/* 96px */}
```

### Семантические классы
```tsx
// Быстрые классы для стандартных отступов
<div className="space-xs">         {/* gap: 4px */}
<div className="space-sm">         {/* gap: 8px */}
<div className="space-md">         {/* gap: 16px */}
<div className="space-lg">         {/* gap: 24px */}
<div className="space-xl">         {/* gap: 32px */}

// Padding для компонентов
<div className="p-component-xs">   {/* padding: 8px */}
<div className="p-component-sm">   {/* padding: 12px */}
<div className="p-component-md">   {/* padding: 16px */}
<div className="p-component-lg">   {/* padding: 24px */}
<div className="p-component-xl">   {/* padding: 32px */}

// Адаптивные отступы
<div className="container-padding"> {/* px-4 md:px-6 lg:px-8 */}
<div className="section-padding">   {/* py-8 md:py-12 lg:py-16 */}
<div className="card-padding">      {/* p-4 md:p-5 lg:p-6 */}
```

---

## 🔄 Border Radius System

### Базовые радиусы
```tsx
<div className="rounded-none">      {/* 0px */}
<div className="rounded-xs">        {/* 2px - новый! */}
<div className="rounded-sm">        {/* 4px */}
<div className="rounded">           {/* 6px - изменён с 8px */}
<div className="rounded-md">        {/* 8px */}
<div className="rounded-lg">        {/* 12px */}
<div className="rounded-xl">        {/* 16px */}
<div className="rounded-2xl">       {/* 20px */}
<div className="rounded-3xl">       {/* 24px - новый! */}
<div className="rounded-full">      {/* 9999px */}
```

### Семантические радиусы для компонентов
```tsx
// Кнопки
<button className="rounded-btn-sm">    {/* 4px */}
<button className="rounded-btn-md">    {/* 8px */}
<button className="rounded-btn-lg">    {/* 12px */}
<button className="rounded-btn-pill">  {/* full */}

// Инпуты
<input className="rounded-input">      {/* 8px */}
<input className="rounded-input-sm">   {/* 4px */}

// Карточки
<div className="rounded-card-sm">      {/* 12px */}
<div className="rounded-card-md">      {/* 16px */}
<div className="rounded-card-lg">      {/* 20px */}

// Модальные окна
<div className="rounded-modal">        {/* 20px */}
<div className="rounded-modal-lg">     {/* 24px */}

// Аватары
<img className="rounded-avatar-sm">    {/* 4px */}
<img className="rounded-avatar-md">    {/* 8px */}
<img className="rounded-avatar-lg">    {/* 12px */}
<img className="rounded-avatar-full">  {/* full - круглый */}

// Бейджи
<span className="rounded-badge">       {/* full */}
<span className="rounded-badge-square">{/* 4px */}
```

---

## 🧩 Component Sizes

### Кнопки
```tsx
// Высоты кнопок
<button className="h-btn-xs">   {/* 24px */}
<button className="h-btn-sm">   {/* 32px */}
<button className="h-btn-md">   {/* 40px */}
<button className="h-btn-lg">   {/* 48px */}
<button className="h-btn-xl">   {/* 56px */}

// Полные стили кнопок (высота + padding + radius)
<button className="btn-primary btn-xs">  {/* xs размер */}
<button className="btn-primary btn-sm">  {/* sm размер */}
<button className="btn-primary btn-md">  {/* md размер (стандарт) */}
<button className="btn-primary btn-lg">  {/* lg размер */}
<button className="btn-primary btn-xl">  {/* xl размер */}
```

### Инпуты
```tsx
// Высоты инпутов
<input className="h-input-sm">     {/* 32px */}
<input className="h-input-md">     {/* 40px */}
<input className="h-input-lg">     {/* 48px */}

// Полные стили инпутов
<input className="input input-sm"> {/* sm размер */}
<input className="input input-md"> {/* md размер (стандарт) */}
<input className="input input-lg"> {/* lg размер */}
```

### Аватары
```tsx
<img className="w-avatar-xs h-avatar-xs">     {/* 24x24px */}
<img className="w-avatar-sm h-avatar-sm">     {/* 32x32px */}
<img className="w-avatar-md h-avatar-md">     {/* 40x40px */}
<img className="w-avatar-lg h-avatar-lg">     {/* 48x48px */}
<img className="w-avatar-xl h-avatar-xl">     {/* 64x64px */}
<img className="w-avatar-2xl h-avatar-2xl">   {/* 80x80px */}

// Полные стили аватаров (размер + radius + стили)
<img className="avatar avatar-xs">            {/* xs + квадратный */}
<img className="avatar avatar-md avatar-round"> {/* md + круглый */}
```

### Иконки
```tsx
<Icon className="w-icon-xs">      {/* 12px */}
<Icon className="w-icon-sm">      {/* 16px */}
<Icon className="w-icon-md">      {/* 20px */}
<Icon className="w-icon-lg">      {/* 24px */}
<Icon className="w-icon-xl">      {/* 32px */}
<Icon className="w-icon-2xl">     {/* 40px */}
```

---

## 💻 Программное использование

### В TypeScript коде
```tsx
import { 
  spacing, 
  componentSpacing, 
  borderRadius, 
  componentSizes 
} from '@/shared/lib/design-tokens';

// Использование токенов в style объектах
const buttonStyle = {
  padding: componentSizes.button.padding.md,  // "12px 24px"
  borderRadius: borderRadius.md,              // "8px"
  height: componentSizes.button.height.md,    // "40px"
};

// В компонентах
function CustomCard() {
  return (
    <div style={{ 
      padding: componentSpacing.padding.lg,        // "24px"
      marginBottom: componentSpacing.margin.md,    // "16px"
      borderRadius: borderRadius['2xl']            // "20px"
    }}>
      Content
    </div>
  );
}
```

### Type Safety
```tsx
import type { DesignTokens } from '@/shared/lib/design-tokens';

type ButtonSize = keyof DesignTokens.ComponentSize['button']['height'];
// 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type SpacingKey = DesignTokens.Spacing;
// '0' | 'px' | '0.5' | '1' | '2' | ... | '96'

type BorderRadiusKey = DesignTokens.BorderRadius;
// 'none' | 'xs' | 'sm' | 'default' | ... | 'full'
```

---

## 🎨 Практические примеры

### 1. Карточка продукта
```tsx
<div className="card card-md space-md">
  <img className="w-full h-48 object-cover rounded-card-sm mb-4" />
  <div className="space-sm">
    <h3 className="text-lg font-semibold">Product Name</h3>
    <p className="text-text-secondary">Description</p>
    <div className="flex items-center gap-sm mt-4">
      <button className="btn-primary btn-md flex-1">Buy Now</button>
      <button className="btn-secondary btn-md">
        <Icon name="heart" size="md" />
      </button>
    </div>
  </div>
</div>
```

### 2. Форма с различными размерами
```tsx
<form className="space-lg max-w-md">
  <div className="space-sm">
    <label className="text-sm font-medium">Small Input</label>
    <input className="input input-sm" placeholder="Compact field" />
  </div>
  
  <div className="space-sm">
    <label className="text-base font-medium">Standard Input</label>
    <input className="input input-md" placeholder="Standard field" />
  </div>
  
  <div className="space-sm">
    <label className="text-lg font-medium">Large Input</label>
    <input className="input input-lg" placeholder="Large field" />
  </div>
  
  <div className="flex gap-md pt-4">
    <button className="btn-secondary btn-md flex-1">Cancel</button>
    <button className="btn-primary btn-md flex-1">Submit</button>
  </div>
</form>
```

### 3. Профиль пользователя
```tsx
<div className="card card-lg">
  <div className="flex items-center gap-lg mb-6">
    <img 
      className="avatar avatar-xl avatar-round" 
      src="/avatar.jpg" 
      alt="User" 
    />
    <div className="space-xs">
      <h2 className="text-xl font-bold">John Doe</h2>
      <p className="text-text-secondary">Senior Developer</p>
      <div className="flex gap-xs mt-2">
        <span className="badge bg-accent-primary text-white">Pro</span>
        <span className="badge bg-feedback-success text-white">Verified</span>
      </div>
    </div>
  </div>
  
  <div className="space-md">
    <button className="btn-primary btn-lg w-full">Contact</button>
    <div className="grid grid-cols-2 gap-md">
      <button className="btn-secondary btn-md">Projects</button>
      <button className="btn-secondary btn-md">Reviews</button>
    </div>
  </div>
</div>
```

---

## 📱 Responsive Design

### Адаптивные отступы
```tsx
// Контейнер с адаптивными отступами
<div className="container-padding section-padding">
  {/* mobile: px-4 py-8, tablet: px-6 py-12, desktop: px-8 py-16 */}
  <div className="space-lg">
    <h1>Adaptive Layout</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-lg">
      <div className="card-padding">Card 1</div>
      <div className="card-padding">Card 2</div>
      <div className="card-padding">Card 3</div>
    </div>
  </div>
</div>
```

### Адаптивные размеры компонентов
```tsx
// Кнопки адаптируются по размеру экрана
<button className="btn-primary btn-sm md:btn-md lg:btn-lg">
  Responsive Button
</button>

// Карточки с адаптивным радиусом и отступами
<div className="rounded-card-sm md:rounded-card-md lg:rounded-card-lg p-component-sm md:p-component-md lg:p-component-lg">
  Responsive Card
</div>
```

---

## ⚠️ Миграция

### Заменить старые классы:

#### Кнопки
```diff
- <button className="px-6 py-3 rounded-lg">
+ <button className="btn-primary btn-md">

- <button className="px-4 py-2 rounded-md text-sm">
+ <button className="btn-primary btn-sm">
```

#### Карточки
```diff
- <div className="p-6 rounded-xl border">
+ <div className="card card-md">

- <div className="p-4 rounded-lg">
+ <div className="card card-sm">
```

#### Отступы
```diff
- <div className="space-y-4">
+ <div className="space-md">

- <div className="p-6">
+ <div className="p-component-lg">

- <div className="px-4 md:px-6 lg:px-8">
+ <div className="container-padding">
```

---

## 🎯 Лучшие практики

### ✅ Рекомендуется:
```tsx
// Используйте семантические классы
<button className="btn-primary btn-md">Submit</button>
<div className="card card-lg space-lg">Content</div>
<input className="input input-md" />

// Используйте адаптивные утилиты
<div className="container-padding section-padding">
<div className="space-sm md:space-lg">
```

### ❌ Избегайте:
```tsx
// Не смешивайте прямые размеры с токенами
<button className="btn-primary px-8 py-4"> {/* конфликт */}

// Не используйте произвольные значения
<div className="p-[18px] rounded-[14px]"> {/* нет в системе */}

// Не дублируйте стили
<div className="p-4 p-component-md"> {/* избыточно */}
```

---

## 📚 Полный список классов

См. файлы:
- `/frontend/src/shared/lib/design-tokens.ts` - все токены
- `/frontend/tailwind.config.ts` - Tailwind конфигурация  
- `/frontend/app/globals.css` - готовые CSS классы

**Версия токенов: 2.1.0** ✨