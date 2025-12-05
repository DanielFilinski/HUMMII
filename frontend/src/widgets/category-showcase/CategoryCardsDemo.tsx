/**
 * Category Cards Demo Page
 * 
 * Демонстрация карточек категорий
 */

'use client';

import { CategoryCard, cleaningCategory, mockCategories } from '@/src/entities/category';
import { Container } from '@/src/shared/ui';
import { Typography } from '@/src/shared/ui/typography/Typography';

export function CategoryCardsDemo() {
  const handleCategoryClick = (categoryId: string) => {
    console.log('Category clicked:', categoryId);
    // Here you would typically navigate to the category page
  };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <Typography variant="h1" className="mb-4">
          Service Categories
        </Typography>
        <Typography variant="body" color="secondary">
          Choose from our wide range of professional services
        </Typography>
      </div>

      {/* Featured Cleaning Category */}
      <div className="mb-8">
        <Typography variant="h2" className="mb-4">
          Featured Category
        </Typography>
        <div className="flex justify-start">
          <CategoryCard
            category={cleaningCategory}
            onClick={handleCategoryClick}
            className="mx-auto sm:mx-0"
          />
        </div>
      </div>

      {/* All Categories Grid */}
      <div className="mb-8">
        <Typography variant="h2" className="mb-4">
          All Categories
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {mockCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}