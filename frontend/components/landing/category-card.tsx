import Link from 'next/link';
import type { Category } from '@/types/landing';

interface CategoryCardProps {
  category: Category;
  locale: string;
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  return (
    <Link href={`/${locale}/categories/${category.slug}`}>
      <div className={`group relative h-[305px] w-[305px] cursor-pointer overflow-hidden rounded-[20px] bg-gradient-to-b ${category.gradient} transition-transform hover:scale-105`}>
        {/* Background layered cards effect */}
        <div className="absolute left-4 top-5 h-[200px] w-[275px] rounded-[10px] bg-white" />
        <div className="absolute left-4 top-[70px] h-[171.63px] w-[275px] rounded-[10px] bg-white shadow-[0px_-10px_10px_0px_rgba(198,194,187,0.2)]" />
        <div className="absolute left-4 top-[120px] h-[142.42px] w-[275px] rounded-[10px] bg-white shadow-[0px_-10px_10px_0px_rgba(198,194,187,0.2)]" />

        {/* Subcategories */}
        <div className="relative z-10">
          {category.subcategories.map((sub, index) => (
            <p
              key={index}
              className={`absolute left-[30px] text-base font-normal text-text-primary ${
                index === 0 ? 'top-[35px]' : index === 1 ? 'top-[85px]' : 'top-[135px]'
              }`}
            >
              {sub}
            </p>
          ))}
        </div>

        {/* Image placeholder - will be replaced with actual images */}
        <div className="absolute bottom-0 left-0 right-0 h-[130px] opacity-60">
          {/* Decorative gradient overlay */}
          <div className="h-full w-full bg-gradient-to-t from-white/20 to-transparent" />
        </div>

        {/* Category Name and Arrow */}
        <div className="absolute bottom-4 left-2 right-2.5 flex h-8 items-end justify-between px-4">
          <h3 className="text-2xl font-medium text-black">{category.name}</h3>
          
          {/* Arrow button */}
          <div className="flex h-8 w-8 rotate-180 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:scale-110">
            <svg
              className="h-5 w-5 text-text-primary"
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
          </div>
        </div>
      </div>
    </Link>
  );
}



