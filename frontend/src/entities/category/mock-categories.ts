/**
 * Mock data for categories
 * 
 * Данные для демонстрации карточек категорий
 */

import type { Category } from '@/src/entities/category';

export const cleaningCategory: Category = {
  id: 'cleaning',
  name: 'Cleaning',
  slug: 'cleaning',
  subcategories: [
    'Home cleaning',
    'Space decluttering & organization',
    'Window cleaning'
  ],
  // Gradient matching the green/orange design from the image
  gradient: 'from-green-100 via-orange-100 to-orange-200'
};

export const mockCategories: Category[] = [
  cleaningCategory,
  // Additional mock categories can be added here
  {
    id: 'handyman',
    name: 'Handyman',
    slug: 'handyman',
    subcategories: [
      'Furniture assembly',
      'Wall mounting',
      'Basic repairs',
      'Painting touch-ups'
    ],
    gradient: 'from-blue-100 via-purple-100 to-pink-100'
  },
  {
    id: 'gardening',
    name: 'Gardening',
    slug: 'gardening',
    subcategories: [
      'Lawn maintenance',
      'Plant care',
      'Garden design'
    ],
    gradient: 'from-green-200 via-emerald-100 to-teal-100'
  }
];