'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import { contractors } from '@/lib/mock-data';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ContractorProfilePage({ params }: PageProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  // Find the contractor
  const contractor = contractors.find((c) => c.id === params.id);

  if (!contractor) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-black">Contractor not found</h1>
          <p className="mt-4 text-xl text-gray-600">
            The contractor profile you're looking for doesn't exist.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

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
          <a
            href={`/${locale}/categories/${contractor.categorySlug}`}
            className="hover:text-accent-1"
          >
            {contractor.category}
          </a>
          <span>/</span>
          <span className="text-text-primary">{contractor.name}</span>
        </nav>

        {/* Profile Header */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left: Avatar and Info */}
          <div className="flex flex-col items-center gap-6">
            {/* Avatar */}
            <div className="relative h-[200px] w-[200px] overflow-hidden rounded-full bg-gray-200">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2">
                <span className="text-7xl font-bold text-white">
                  {contractor.name.charAt(0)}
                </span>
              </div>
              {contractor.verified && (
                <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                  <svg
                    className="h-8 w-8 text-accent-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Category Tag */}
            <div className="flex items-center justify-center rounded-full bg-[#3bb869] px-6 py-2">
              <span className="text-base font-medium text-white">{contractor.category}</span>
            </div>

            {/* Stats */}
            <div className="flex w-full flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {contractor.rating && (
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-accent-1">{contractor.rating}</span>
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              )}
              {contractor.completedJobs && (
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Completed Jobs:</span>
                  <span className="text-xl font-bold text-text-primary">
                    {contractor.completedJobs}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-600">Location:</span>
                <span className="text-xl font-bold text-text-primary">{contractor.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-600">Hourly Rate:</span>
                <span className="text-xl font-bold text-accent-1">
                  ${contractor.hourlyRate}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2">
            <h1 className="mb-2 text-4xl font-bold text-black">{contractor.name}</h1>
            <p className="mb-6 text-xl text-gray-600">{contractor.category} Specialist</p>

            {/* Action Buttons */}
            <div className="mb-8 flex gap-4">
              <Link href={`/${locale}/login`}>
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-accent-1 px-8 text-lg font-medium text-white hover:bg-accent-2"
                >
                  Contact
                </Button>
              </Link>
              <Link href={`/${locale}/login`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-2 border-accent-1 px-8 text-lg font-medium text-accent-1 hover:bg-accent-1 hover:text-white"
                >
                  Hire Now
                </Button>
              </Link>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-black">About</h2>
              <p className="text-lg leading-relaxed text-gray-700">
                Professional {contractor.category.toLowerCase()} services with over{' '}
                {contractor.completedJobs} completed jobs. Verified contractor with excellent ratings
                and customer satisfaction. Available in {contractor.location} and surrounding areas.
              </p>
            </div>

            {/* Services Section */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-black">Services Offered</h2>
              <div className="flex flex-wrap gap-3">
                {['General Services', 'Emergency Services', 'Consultations', 'Maintenance'].map(
                  (service, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-4 py-2 text-base font-medium text-text-primary"
                    >
                      {service}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-black">Portfolio</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-gray-200"
                  >
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-black">Reviews</h2>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
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
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-lg text-gray-600">No reviews yet</p>
                <p className="text-base text-gray-500">Be the first to review this contractor</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

