'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { popularSearches } from '@/lib/mock-data';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-[#bcf0cf] to-[#fcfffd] py-20">
      {/* Background pattern overlay - optional */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <h1 className="mb-8 text-center text-4xl font-bold text-text-primary desktop:text-5xl">
          Find the Right Expert for Any Task
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto mb-6 max-w-4xl">
          <div className="flex items-center overflow-hidden rounded-full bg-white shadow-lg">
            <div className="flex flex-1 items-center gap-3 pl-6">
              {/* Search Icon */}
              <svg
                className="h-8 w-8 text-gray-400"
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
              
              {/* Input */}
              <input
                type="text"
                placeholder="Search for any service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-5 text-xl text-text-primary placeholder-gray-400 outline-none"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="h-[60px] rounded-br-full rounded-tr-full bg-accent-1 px-16 text-xl font-medium text-white transition-colors hover:bg-accent-2 mobile:px-8"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Searches */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {popularSearches.map((search) => (
            <button
              key={search.id}
              onClick={() => handlePopularSearch(search.query)}
              className="rounded-full border-2 border-accent-2 bg-white px-8 py-2.5 text-base font-normal text-text-primary transition-all hover:border-accent-1 hover:bg-accent-1 hover:text-white"
            >
              {search.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}



