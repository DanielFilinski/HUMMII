'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ContractorCard } from './contractor-card';
import { contractors } from '@/lib/mock-data';

export function TopContractorsSection() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 217; // Card width (197px) + gap (20px)
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="mb-8 text-4xl font-bold text-black">
          Top Contractors
        </h2>

        {/* Contractors Container */}
        <div className="relative">
          {/* Scrollable Contractors List */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {contractors.map((contractor) => (
              <ContractorCard 
                key={contractor.id} 
                contractor={contractor} 
                locale={locale} 
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 mobile:hidden"
            aria-label="Scroll left"
          >
            <svg
              className="h-5 w-5 rotate-90 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_4px_15px_0px_rgba(0,0,0,0.15)] transition-transform hover:scale-110 mobile:hidden"
            aria-label="Scroll right"
          >
            <svg
              className="h-5 w-5 -rotate-90 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}


