'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function BecomeContractorCTA() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[30px] bg-gradient-to-b from-[#fffaee] to-[#d6faeb] p-8 desktop:flex-row desktop:p-10">
          {/* Left: Image */}
          <div className="relative h-[450px] w-full max-w-[750px] overflow-hidden rounded-bl-[10px] rounded-tl-[10px] bg-gray-200 desktop:w-[750px]">
            {/* Placeholder for banner image */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-2/20 to-accent-1/20">
              <div className="text-center">
                <svg
                  className="mx-auto mb-4 h-24 w-24 text-accent-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">Banner Image Placeholder</p>
                <p className="text-xs text-gray-400">750x450px</p>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex max-w-[440px] flex-col gap-12">
            <div className="flex flex-col gap-8 text-black">
              <h2 className="text-4xl font-bold">
                Your Talent. Their Need. One Click Away.
              </h2>
              <p className="text-xl font-medium leading-8">
                Start offering your skills and connect with clients who need your expertise.
              </p>
            </div>

            <Link href={`/${locale}/become-contractor`}>
              <Button
                size="lg"
                className="h-12 w-full rounded-full bg-accent-1 text-xl font-medium text-white hover:bg-accent-2"
              >
                Become a Contractor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}



