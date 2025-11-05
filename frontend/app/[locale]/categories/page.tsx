'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { CategoryCard } from '@/components/landing/category-card';
import { categories } from '@/lib/mock-data';

export default function CategoriesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories by search query
  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.subcategories.some((sub) => sub.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-base text-gray-600">
          <a href={`/${locale}`} className="hover:text-accent-1">
            Home
          </a>
          <span>/</span>
          <span className="text-text-primary">Categories</span>
        </nav>

        {/* Page Title */}
        <h1 className="mb-4 text-4xl font-bold text-black">All Categories</h1>
        <p className="mb-8 text-xl text-gray-600">
          Browse all available service categories
        </p>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="flex items-center gap-3 rounded-full border-2 border-gray-200 bg-white px-6 py-4 focus-within:border-accent-1">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-lg text-text-primary placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="flex justify-center">
                <CategoryCard category={category} locale={locale} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-xl text-gray-600">No categories found</p>
            <p className="text-base text-gray-500">Try adjusting your search</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}




