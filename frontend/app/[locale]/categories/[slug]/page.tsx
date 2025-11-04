'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { ContractorCard } from '@/components/landing/contractor-card';
import { categories, contractors } from '@/lib/mock-data';
import { filterContractorsByCategory } from '@/lib/search';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CategoryDetailPage({ params }: PageProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Find the category
  const category = categories.find((cat) => cat.slug === params.slug);

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black">Category not found</h1>
          <p className="mt-4 text-xl text-gray-600">
            The category you're looking for doesn't exist.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // Get contractors in this category
  const categoryContractors = filterContractorsByCategory(category.slug, contractors);

  // Filter by location and price
  const filteredContractors = categoryContractors.filter((contractor) => {
    const matchesLocation = selectedLocation === 'all' || contractor.location === selectedLocation;
    const matchesPrice =
      contractor.hourlyRate >= priceRange[0] && contractor.hourlyRate <= priceRange[1];
    return matchesLocation && matchesPrice;
  });

  // Get unique locations
  const locations = Array.from(new Set(categoryContractors.map((c) => c.location)));

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
          <a href={`/${locale}/categories`} className="hover:text-accent-1">
            Categories
          </a>
          <span>/</span>
          <span className="text-text-primary">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-black">{category.name}</h1>
          <p className="mb-6 text-xl text-gray-600">
            Find trusted professionals for {category.name.toLowerCase()} services
          </p>

          {/* Subcategories */}
          <div className="flex flex-wrap gap-3">
            {category.subcategories.map((sub, index) => (
              <span
                key={index}
                className="rounded-full border-2 border-accent-2 bg-white px-6 py-2 text-base font-medium text-text-primary"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6 md:flex-row md:items-center md:justify-between">
          {/* Location Filter */}
          <div className="flex items-center gap-3">
            <label htmlFor="location" className="text-base font-medium text-text-primary">
              Location:
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-base text-text-primary focus:border-accent-1 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-text-primary">
              Price: ${priceRange[0]} - ${priceRange[1]}/hr
            </span>
          </div>

          {/* Results Count */}
          <div className="text-base text-gray-600">
            {filteredContractors.length} contractor{filteredContractors.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Contractors Grid */}
        {filteredContractors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredContractors.map((contractor) => (
              <div key={contractor.id} className="flex justify-center">
                <ContractorCard contractor={contractor} locale={locale} />
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-xl text-gray-600">No contractors found</p>
            <p className="text-base text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

