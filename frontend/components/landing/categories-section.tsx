'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CategoryCard } from './category-card';
import { categories } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

export function CategoriesSection() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  // Show only first 4 categories on homepage
  const displayedCategories = categories.slice(0, 4);

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="mb-8 text-4xl font-bold text-black">
          Categories
        </h2>

        {/* Category Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedCategories.map((category) => (
            <div key={category.id} className="flex justify-center">
              <CategoryCard category={category} locale={locale} />
            </div>
          ))}
        </div>

        {/* View All Services Button */}
        <div className="flex justify-center">
          <Link href={`/${locale}/categories`}>
            <Button
              size="lg"
              className="h-12 rounded-full bg-accent-1 px-20 text-xl font-medium text-white hover:bg-accent-2"
            >
              View all services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

