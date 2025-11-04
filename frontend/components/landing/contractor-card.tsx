import Link from 'next/link';
import type { Contractor } from '@/types/landing';

interface ContractorCardProps {
  contractor: Contractor;
  locale: string;
}

export function ContractorCard({ contractor, locale }: ContractorCardProps) {
  return (
    <div className="flex w-[197px] flex-shrink-0 flex-col gap-5 rounded-[20px] bg-white px-5 pb-4 shadow-[0px_-4px_10px_0px_rgba(198,194,187,0.2)]">
      {/* Content */}
      <div className="flex flex-col items-center gap-2.5">
        {/* Photo with Category Tag */}
        <div className="flex flex-col items-center gap-5">
          {/* Category Tag */}
          <div className="flex h-9 w-[197px] items-center justify-center rounded-tl-[10px] rounded-tr-[10px] bg-[#3bb869] px-[30px]">
            <p className="text-center text-base font-medium text-white">
              {contractor.category}
            </p>
          </div>

          {/* Avatar */}
          <div className="relative h-[150px] w-[150px] overflow-hidden rounded-full bg-gray-200">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2">
              <span className="text-5xl font-bold text-white">
                {contractor.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xl font-medium text-black">
            {contractor.name}
          </p>
          <p className="text-base font-medium text-black">
            {contractor.location}, {contractor.hourlyRate} $/Hr
          </p>
        </div>
      </div>

      {/* View Profile Button */}
      <Link href={`/${locale}/contractors/${contractor.id}`}>
        <button className="flex h-9 w-full items-center justify-center rounded-full px-5 py-3 transition-colors hover:bg-accent-1/10">
          <span className="text-xl font-medium text-accent-1">
            View Profile
          </span>
        </button>
      </Link>
    </div>
  );
}

