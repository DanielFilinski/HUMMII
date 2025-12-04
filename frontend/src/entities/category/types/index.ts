/**
 * Category Entity Types
 * 
 * Типы для сущности категорий услуг
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  gradient: string;
  icon?: string;
}

export interface CategoryCardProps {
  category: Category;
  locale?: string;
  onClick?: (categoryId: string) => void;
}