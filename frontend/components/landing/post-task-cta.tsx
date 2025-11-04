'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PostTaskCTA() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[30px] bg-gradient-to-b from-[#fffaee] to-[#d6faeb] p-8 desktop:flex-row desktop:p-10">
          {/* Left: Content */}
          <div className="flex max-w-[440px] flex-col gap-12">
            <div className="flex flex-col gap-8 text-black">
              <h2 className="text-4xl font-bold">
                Post a task - Get it done
              </h2>
              <p className="text-xl font-medium leading-8">
                Submit your request for any service - qualified specialists will respond directly.
              </p>
            </div>

            <Link href={`/${locale}/post-task`}>
              <Button
                size="lg"
                className="h-12 w-full rounded-full bg-accent-1 text-xl font-medium text-white hover:bg-accent-2"
              >
                Post a Task
              </Button>
            </Link>
          </div>

          {/* Right: Image */}
          <div className="relative h-[450px] w-full max-w-[750px] overflow-hidden rounded-br-[10px] rounded-tr-[10px] bg-gray-200 desktop:w-[750px]">
            {/* Placeholder for banner image */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-1/20 to-accent-2/20">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">Banner Image Placeholder</p>
                <p className="text-xs text-gray-400">750x450px</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

