/**
 * Category Demo Page
 * 
 * Простая страница для демонстрации CategoryCard компонента
 */

import { CategoryCardsDemo } from '@/src/widgets/category-showcase';

export default function CategoryDemoPage() {
  return (
    <main className="min-h-screen bg-background">
      <CategoryCardsDemo />
    </main>
  );
}