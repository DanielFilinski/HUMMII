# CategoryCard Component

Компонент карточки категории услуг, созданный на основе дизайна из Figma. Соответствует архитектуре FSD (Feature-Sliced Design).

## Структура проекта

```
src/
├── entities/
│   └── category/
│       ├── types/
│       │   └── index.ts          # Типы для сущности категории
│       └── index.ts              # Экспорт entity
├── shared/
│   ├── ui/
│   │   └── category-card/
│   │       ├── CategoryCard.tsx   # Основной компонент
│   │       └── index.ts          # Экспорт компонента
│   └── config/
│       └── mock-categories.ts    # Mock данные для демонстрации
└── widgets/
    └── category-showcase/
        ├── CategoryCardsDemo.tsx  # Widget для демонстрации
        └── index.ts              # Экспорт widget
```

## Использование

### Базовое использование

```tsx
import { CategoryCard } from '@/src/shared/ui';
import { cleaningCategory } from '@/src/shared/config/mock-categories';

function MyComponent() {
  return (
    <CategoryCard 
      category={cleaningCategory}
      onClick={(categoryId) => console.log('Category clicked:', categoryId)}
    />
  );
}
```

### Сетка категорий

```tsx
import { CategoryCard } from '@/src/shared/ui';
import { mockCategories } from '@/src/shared/config/mock-categories';

function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={handleCategoryClick}
        />
      ))}
    </div>
  );
}
```

## Типы данных

### Category

```typescript
interface Category {
  id: string;                    // Уникальный идентификатор
  name: string;                  // Название категории
  slug: string;                  // URL slug
  subcategories: string[];       // Массив подкатегорий
  gradient: string;              // CSS класс для градиента
  icon?: string;                 // Опциональная иконка
}
```

### CategoryCardProps

```typescript
interface CategoryCardProps {
  category: Category;            // Данные категории
  locale?: string;              // Локаль (для будущей локализации)
  onClick?: (categoryId: string) => void;  // Обработчик клика
}
```

## Пример данных (Mock Data)

```typescript
export const cleaningCategory = {
  id: 'cleaning',
  name: 'Cleaning',
  slug: 'cleaning',
  subcategories: [
    'Home cleaning',
    'Space decluttering & organization',
    'Window cleaning'
  ],
  gradient: 'from-green-100 via-orange-100 to-orange-200'
};
```

## Особенности дизайна

- **Многослойный эффект**: Три слоя белых карточек создают эффект стопки
- **Градиентный фон**: Поддерживает Tailwind CSS градиенты
- **Hover эффекты**: Масштабирование и смещение подкарточек при наведении
- **Адаптивность**: Корректно работает на всех размерах экранов
- **Дизайн-система**: Использует семантические цвета и Typography компонент

## Демонстрация

Запустите проект и перейдите на `/demo/categories` для просмотра компонента.

## Категория "Cleaning"

На основе предоставленного изображения создана категория "Cleaning" с подкатегориями:

1. **Home cleaning** - Уборка дома
2. **Space decluttering & organization** - Расхламление и организация пространства  
3. **Window cleaning** - Мытье окон

Градиент использует зелено-оранжевую гамму, соответствующую дизайну.